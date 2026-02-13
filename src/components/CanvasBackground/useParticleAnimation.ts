import { useEffect } from "react";
import { _Interaction, _Line, _Particle } from "./types";
import { getSpeedXY, resolveLifespan } from "../../utils/animationHelpers";
// @ts-ignore
import Delaunator from "delaunator";

interface AnimationOptions {
  _particle: _Particle;
  _backgroundFillStyle: string;
  _line: _Line;
  _interaction: _Interaction;
}

export function useParticleAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: AnimationOptions,
) {
  const {
    _particle: particle,
    _backgroundFillStyle,
    _line: line,
    _interaction: interaction,
  } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const mouse = {
      x: 0,
      y: 0,
      active: false,
    };

    function handleMouseMove(e: MouseEvent) {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    function handleMouseLeave() {
      mouse.active = false;
    }

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    const particles = Array.from({ length: particle.count }, () => {
      const speed = getSpeedXY(particle.speed);
      const life = particle.lifespan
        ? resolveLifespan(particle.lifespan.life)
        : Infinity;
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() < 0.5 ? -1 : 1) * speed.x,
        dy: (Math.random() < 0.5 ? -1 : 1) * speed.y,
        age: 0,
        life,
      };
    });

    function draw(now: number) {
      const delta = (now - lastTime) / 1000; // seconds
      lastTime = now;
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background
      ctx.globalAlpha = 1;
      ctx.fillStyle = _backgroundFillStyle;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Move particles first
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < particle.size || p.x > canvas.width - particle.size)
          p.dx *= -1;
        if (p.y < particle.size || p.y > canvas.height - particle.size)
          p.dy *= -1;

        // 🎂 AGE UPDATE
        if (particle.lifespan) {
         p.age += delta;

          if (p.age >= p.life) {
            const speed = getSpeedXY(particle.speed);

            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
            p.dx = (Math.random() < 0.5 ? -1 : 1) * speed.x;
            p.dy = (Math.random() < 0.5 ? -1 : 1) * speed.y;

            p.age = 0;
            p.life = resolveLifespan(particle.lifespan.life);
          }
        }

        // 🔥 INTERACTION FORCE
        if (interaction.enabled && mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = interaction.radius * interaction.radius;

          if (distSq < radiusSq && distSq > radiusSq / 2) {
            const distance = Math.sqrt(distSq) || 0.001;

            const force = interaction.strength / 100;

            const dirX = dx / distance;
            const dirY = dy / distance;

            if (interaction.mode === "attract") {
              p.dx += dirX * force;
              p.dy += dirY * force;
            } else {
              p.dx -= dirX * force;
              p.dy -= dirY * force;
            }

            // velocity clamp (important)
            const maxSpeed = 2;
            p.dx = Math.max(-maxSpeed, Math.min(maxSpeed, p.dx));
            p.dy = Math.max(-maxSpeed, Math.min(maxSpeed, p.dy));
          }
        }
      });

      // ✅ DRAW CONNECTING LINES
      function drawEdge(
        a: (typeof particles)[number],
        b: (typeof particles)[number],
      ) {
        if (!ctx) return;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxDist = line.maxDistance;

        if (distance > maxDist) return;

        if (line.dynamicOpacity) {
          ctx.globalAlpha = 1 - distance / maxDist;
        } else {
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      if (line.enabled) {
        const points = particles.map((p) => [p.x, p.y]);

        const delaunay = Delaunator.from(points);
        const { triangles } = delaunay;

        ctx.lineWidth = line.width;
        ctx.strokeStyle = line.fillStyle;

        for (let i = 0; i < triangles.length; i += 3) {
          const p0 = particles[triangles[i]];
          const p1 = particles[triangles[i + 1]];
          const p2 = particles[triangles[i + 2]];

          drawEdge(p0, p1);
          drawEdge(p1, p2);
          drawEdge(p2, p0);
        }

        ctx.globalAlpha = 1; // reset
      }

      // ✅ Draw particles on top
      ctx.fillStyle = particle.fillStyle;

      particles.forEach((p) => {
        let alpha = particle.opacity;

        if (particle.lifespan) {
          const { fadeIn = 0, fadeOut = 0 } = particle.lifespan;
          const life = p.life;
          const age = p.age;

          if (age < fadeIn) {
            alpha *= age / fadeIn;
          } else if (age > life - fadeOut) {
            alpha *= (life - age) / fadeOut;
          }
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(draw);
    }

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    canvasRef,
    particle.fillStyle,
    particle.speed,
    particle.count,
    particle.size,
    particle.opacity,
    particle.lifespan,
    _backgroundFillStyle,
    line.enabled,
    line.width,
    line.fillStyle,
    line.maxDistance,
    line.dynamicOpacity,
    interaction.enabled,
    interaction.mode,
    interaction.radius,
    interaction.strength,
  ]);
}
