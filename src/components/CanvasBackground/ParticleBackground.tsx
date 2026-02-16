import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParticleAnimation } from "./useParticleAnimation";
import type {
  _Interaction,
  _Line,
  _Particle,
  ParticleBackgroundProps,
} from "./types";
const DEFAULT_PARTICLE: _Particle = {
  mass: 1,
  force: {
    x: { value: 0, falloffExponent: 1 },
    y: { value: 0, falloffExponent: 1 },
    maxAbs: Infinity,
  },
  speed: {
    x: { value: 0, dampening: 1 },
    y: { value: 0, dampening: 1 },
    minAbs: 0,
    maxAbs: Infinity,
  },
  fillStyle: "#666666",
  size: 2,
  opacity: 1,
  count: 100,
  lifespan: {
    life: { min: 20000, max: 50000 },
    fadeIn: 1,
    fadeOut: 1,
  },
  bloom: {
    enabled: false,
    shadowColor: "rgba(255,255,255,0.5)",
    radius: 10,
  },
};

const DEFAULT_LINE: _Line = {
  enabled: false,
  width: 1,
  fillStyle: "#000000",
  maxDistance: 120,
  dynamicOpacity: true,
};

const DEFAULT_INTERACTION: _Interaction = {
  enabled: false,
  mode: "attract",
  radius: 50,
  strength: 0.1,
  forceLife: 10,
  forceCooldown: 10,
  eventTarget:null
};

export const ParticleBackground = ({
  height,
  width,
  backgroundFillStyle,
  connectingLines,
  particle,
  interaction,
  className,
}: ParticleBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
   const _backgroundFillStyle = useMemo(
      () => backgroundFillStyle || "white",
      [backgroundFillStyle]
    );

    const _particle: _Particle = useMemo(() => {
      return {
        ...DEFAULT_PARTICLE,
        ...particle,
        force: {
          ...DEFAULT_PARTICLE.force,
          ...particle?.force,
        },
        speed: {
          ...DEFAULT_PARTICLE.speed,
          ...particle?.speed,
        },
        lifespan: {
          ...DEFAULT_PARTICLE.lifespan,
          ...particle?.lifespan,
        },
        bloom: {
          ...DEFAULT_PARTICLE.bloom,
          ...particle?.bloom,
        },
      };
    }, [particle]);

    const _line: _Line = useMemo(() => {
      return {
        ...DEFAULT_LINE,
        ...connectingLines,
      };
    }, [connectingLines]);

    const _interaction: _Interaction = useMemo(() => {
      return {
        ...DEFAULT_INTERACTION,
        ...interaction,
      };
    }, [interaction]);
  // Handle dynamic sizing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (width && height) {
      canvas.width = width;
      canvas.height = height;
      return;
    }

    const parent = canvas.parentElement;

    canvas.width = width || parent?.clientWidth || 500;
    canvas.height = height || parent?.clientHeight || 400;
  }, [width, height]);

  const animationOptions = useMemo(
      () => ({
        _backgroundFillStyle,
        _particle,
        _line,
        _interaction,
      }),
      [_backgroundFillStyle, _particle, _line, _interaction]
    );

    useParticleAnimation(canvasRef, animationOptions);

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  );
};
