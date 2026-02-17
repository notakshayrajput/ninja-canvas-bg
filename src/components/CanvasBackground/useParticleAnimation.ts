import { useEffect } from "react";
import { _Background, _Interaction, _Line, _Particle, ParticleBackgroundProps } from "./types";
import {
  getForceXY,
  getSpeedXY,
  resolveLifespan,
} from "../../utils/animationHelpers";
// @ts-ignore
import Delaunator from "delaunator";

export interface AnimationOptions {
  _background: _Background;
  _particle: _Particle;
  _line: _Line;
  _interaction: _Interaction;
}
export function onBgDraw(ctx: CanvasRenderingContext2D,options: AnimationOptions,canvas: HTMLCanvasElement) {
      // Background
      ctx.globalAlpha = 1;
      if (options._background.fillStyle) {
        ctx.fillStyle = options._background.fillStyle;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

}
export function onLineDraw(ctx: CanvasRenderingContext2D,options:{a:{x:number,y:number},b:{x:number,y:number},line: _Line},canvas: HTMLCanvasElement) {
      ctx.beginPath();
        ctx.moveTo(options.a.x, options.a.y);
        ctx.lineTo(options.b.x, options.b.y);
        ctx.stroke();
}
export function onParticleDraw(ctx: CanvasRenderingContext2D, p:any,canvas?: HTMLCanvasElement) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  if (p.bloom?.enabled) {
    ctx.shadowColor = p.bloom.shadowColor || "rgba(255, 255, 255, 0.5)";
    ctx.shadowBlur = p.bloom.radius || 20;
  } else {
    ctx.shadowBlur = 0;
  }
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function useParticleAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: AnimationOptions,
) {
  const {
    _particle: particle,
    _line: line,
    _interaction: interaction,
    _background: background,
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

    function handleMouseMove(e: Event) {
      if (!(e instanceof MouseEvent)) return;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }

    function handleMouseLeave() {
      mouse.active = false;
    }
    const target = interaction.eventTarget ?? canvas;

    if (target && ("addEventListener" in target)) {
      target.addEventListener("mousemove", handleMouseMove);
      target.addEventListener("mouseleave", handleMouseLeave);
    }


    const particles = Array.from({ length: particle.count }, () => {
      const speed = getSpeedXY(particle.speed);
      const force = getForceXY(particle.force);

      const life = particle.lifespan
        ? resolveLifespan(particle.lifespan.life)
        : Infinity;
      const dx = speed.x.value;
      const dy = speed.y.value;
      let p = {
        mass: particle.mass,
        size: particle.size,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: dx,
        dy: dy,
        _initialdx: dx, //do not change this value, used for interaction forces
        _initialdy: dy, //do not change this value, used for interaction forces
        ax: 0,
        ay: 0,
        age: 0,
        life,
        interactionLife: interaction.forceLife,
        _interactionLife: interaction.forceLife, // frames left for current interaction force to persist
        interactionCooldown: interaction.forceCooldown,
        speed,
        force,
        lifespan: particle.lifespan,
        bloom: particle.bloom,
      };
      p=particle.onInit(p);
      return p;
    });
    
    function draw(now: number) {
      const delta = (now - lastTime) / 1000; // seconds
      lastTime = now;
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      options._background.onDraw? options._background.onDraw(ctx,options,canvas): onBgDraw(ctx,options,canvas);

      // Move particles first
      particles.forEach((p) => {
        // Reset acceleration each frame
        p.ax = 0;
        p.ay = 0;
        // 🌬 Continuous force (wind/gravity)
        if (p.force) {
          const fx = p.force.x.value;
          const fy = p.force.y.value;

          // a = F / m
          p.ax += fx / p.mass;
          p.ay += fy / p.mass;
        }

        // 🎂 AGE UPDATE
        if (p.lifespan) {
          p.age += delta;

          if (p.age >= p.life) {
            const speed = getSpeedXY(p.speed);

            p.x = Math.random() * canvas.width;
            p.y = Math.random() * canvas.height;
            p.dx = speed.x.value;
            p.dy = speed.y.value;

            p.age = 0;
            p.life = resolveLifespan(p.lifespan.life);
          }
        }

        // 🔥 INTERACTION FORCE
        if (interaction.enabled) {
          p.interactionLife--;
          if (mouse.active) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;

            const distSq = dx * dx + dy * dy;
            const radius = interaction.radius;
            const radiusSq = radius * radius;

            if (p.interactionLife < -1 * p.interactionCooldown) {
              p.interactionLife = p._interactionLife;
            }

            if (distSq < radiusSq && distSq > 0.0001 && p.interactionLife > 0) {
              const distance = Math.sqrt(distSq);

              const normalized = distance / radius;
              const baseInfluence = 1 - normalized;

              const exponent = 1; // p.force?.x.falloffExponent ?? 1;
              const influence = Math.pow(baseInfluence, exponent);

              let interactionForce = (interaction.strength / 100) * influence;

              // const maxAbs = p.force?.x.maxAbs ?? Infinity;
              // interactionForce = Math.max(
              //   -maxAbs,
              //   Math.min(maxAbs, interactionForce),
              // );

              const dirX = dx / distance;
              const dirY = dy / distance;

              if (interaction.mode === "attract") {
                p.ax += (dirX * interactionForce) / p.mass;
                p.ay += (dirY * interactionForce) / p.mass;
              } else {
                p.ax -= (dirX * interactionForce) / p.mass;
                p.ay -= (dirY * interactionForce) / p.mass;
              }
            }
          }
        }

        let aMag = Math.sqrt(p.ax * p.ax + p.ay * p.ay);
        const maxAbs = p.force?.maxAbs ?? Infinity;

        // Clamp acceleration if it exceeds maxAbs
        if (aMag > maxAbs && aMag > 0) {
          p.ax = (p.ax / aMag) * maxAbs;
          p.ay = (p.ay / aMag) * maxAbs;
        }

        // Apply acceleration
        p.dx += p.ax * delta; //delta for frame rate independence
        p.dy += p.ay * delta;

        // 3. Apply damping
        p.dx *= p.speed.x.dampening;
        p.dy *= p.speed.y.dampening;
        // 4. Bounce off edges
        if (p.x < p.size || p.x > canvas.width - p.size) p.dx *= -1;
        if (p.y < p.size || p.y > canvas.height - p.size) p.dy *= -1;

        //Clamp speed
        // current velocity vector
        const vx = p.dx;
        const vy = p.dy;

        // compute magnitude
        const mag = Math.sqrt(vx * vx + vy * vy);

        // avoid division by zero
        if (mag !== 0) {
          const min = p.speed.minAbs;
          const max = p.speed.maxAbs;

          let newMag = mag;

          if (mag < min) newMag = min;
          if (mag > max) newMag = max;

          // normalize + scale
          const scale = newMag / mag;

          p.dx = vx * scale;
          p.dy = vy * scale;
        }
        // Update position
        p.x += p.dx;
        p.y += p.dy;
      });

      // ✅ DRAW CONNECTING LINES
      function drawEdge(
        a: (typeof particles)[number],
        b: (typeof particles)[number],
        canvas: HTMLCanvasElement,
        _line: _Line = line,
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

        _line.onDraw? _line.onDraw(ctx,{a:{x:a.x,y:a.y},b:{x:b.x,y:b.y},line},canvas): onLineDraw(ctx,{a:{x:a.x,y:a.y},b:{x:b.x,y:b.y},line},canvas);
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

          drawEdge(p0, p1,canvas,line);
          drawEdge(p1, p2,canvas,line);
          drawEdge(p2, p0,canvas,line);
        }

        ctx.globalAlpha = 1; // reset
      }

      // ✅ Draw particles on top
      ctx.fillStyle = particle.fillStyle;

      particles.forEach((p) => {
        let alpha = particle.opacity;

        if (p.lifespan) {
          const { fadeIn = 0, fadeOut = 0 } = p.lifespan;
          const life = p.life;
          const age = p.age;

          if (age < fadeIn) {
            alpha *= age / fadeIn;
          } else if (age > life - fadeOut) {
            alpha *= (life - age) / fadeOut;
          }
        }

        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

        particle.onDraw? particle.onDraw(ctx, p,canvas): onParticleDraw(ctx, p);
      });

      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(draw);
    }

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);

      target.removeEventListener("mousemove", handleMouseMove);
      target.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [
    canvasRef,
    particle.fillStyle,
    particle.speed,
    particle.count,
    particle.size,
    particle.opacity,
    particle.lifespan,
    particle.bloom,
    particle.onInit,
    particle.onDraw,
    particle.force,
    particle.mass,
    background.fillStyle,
    background.onDraw,
    line.enabled,
    line.width,
    line.fillStyle,
    line.maxDistance,
    line.dynamicOpacity,
    line.onDraw,
    interaction.enabled,
    interaction.mode,
    interaction.radius,
    interaction.strength,
    interaction.forceLife,
    interaction.forceCooldown,
    interaction.eventTarget,
  ]);
}

