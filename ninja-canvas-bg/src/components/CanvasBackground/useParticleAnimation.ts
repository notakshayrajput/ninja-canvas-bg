import { useEffect } from "react";
import { _Interaction, _Line, _Particle } from "./types";
import { getSpeedXY } from "../../utils/animationHelpers";

interface AnimationOptions {
  _particle: _Particle;
  _backgroundFillStyle: string;
  _line: _Line;
  _interaction: _Interaction;
}

export function useParticleAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: AnimationOptions
) {
  const { _particle: particle, _backgroundFillStyle, _line: line, _interaction: interaction } = options;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

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
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() < 0.5 ? -1 : 1) * speed.x,
        dy: (Math.random() < 0.5 ? -1 : 1) * speed.y,
      };
    });

    function draw() {
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

        if (p.x < particle.size || p.x > canvas.width - particle.size) p.dx *= -1;
        if (p.y < particle.size || p.y > canvas.height - particle.size) p.dy *= -1;
        // 🔥 INTERACTION FORCE
        if (interaction.enabled && mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          const radiusSq = interaction.radius * interaction.radius;

          if (distSq < radiusSq && distSq > radiusSq*0.2) {
            const distance = Math.sqrt(distSq) || 0.001;

            const force = interaction.strength/100;

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
      if (line.enabled) {
        const maxDist = line.maxDistance;
        const maxDistSq = maxDist * maxDist;

        ctx.lineWidth = line.width;
        ctx.strokeStyle = line.fillStyle;

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distSq = dx * dx + dy * dy;

            if (distSq < maxDistSq) {
              const distance = Math.sqrt(distSq);

              if (line.dynamicOpacity) {
                ctx.globalAlpha = 1 - distance / maxDist;
              } else {
                ctx.globalAlpha = 1;
              }

              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }

        ctx.globalAlpha = 1; // reset
      }

      // ✅ Draw particles on top
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.fillStyle;

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

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