import React, { useEffect, useRef, useState } from "react";
import { useParticleAnimation } from "./useParticleAnimation";
import type { _Interaction, _Line, _Particle, ParticleBackgroundProps } from "./types";

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
 const _backgroundFillStyle=backgroundFillStyle || "white"
 const _particle: _Particle = {
  speed: particle?.speed ?? 0.5,
  fillStyle: particle?.fillStyle ?? "#666666",
  size: particle?.size ?? 2,
  opacity: particle?.opacity ?? 1,
  count: particle?.count ?? 100,
};
const _line: _Line = {
  enabled:false,
  width: 1,
  fillStyle: "#000000",
  maxDistance: 120,
  dynamicOpacity: true,
  ...connectingLines
};
const _interaction:_Interaction={
  enabled: false,
  mode: "attract",
  radius: 50,
  strength: 0.1,
  ...interaction
}
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
  

  useParticleAnimation(canvasRef, {_backgroundFillStyle,_particle,_line,_interaction});

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block" }}
    />
  );
};
