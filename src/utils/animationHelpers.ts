import { Speed } from "../components/CanvasBackground/types";

export function getSpeedXY(speed: Speed): { x: number; y: number } {
  if (typeof speed === "number") {
    return { x: speed, y: speed };
  }

  if ("min" in speed) {
    const v = resolveValue(speed);
    return { x: v, y: v };
  }

  if ("x" in speed) {
    return {
      x: resolveValue(speed.x),
      y: resolveValue(speed.y),
    };
  }

  return { x: 0, y: 0 }; // fallback
}
function resolveValue(
  value: number | { min: number; max: number }
): number {
  if (typeof value === "number") return value;
  return Math.random() * (value.max - value.min) + value.min;
}
export function resolveLifespan(
  lifespan: number | { min: number; max: number }
): number {
  if (typeof lifespan === "number") return lifespan;
  return Math.random() * (lifespan.max - lifespan.min) + lifespan.min;
}
function resolveLife(lifeOption: any) {
  if (typeof lifeOption === "number") return lifeOption;
  return Math.random() * (lifeOption.max - lifeOption.min) + lifeOption.min;
}