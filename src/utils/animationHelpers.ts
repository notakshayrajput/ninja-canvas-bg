import { Speed, SpeedXY,Force,ForceXY } from "../components/CanvasBackground/types";


export type SpeedResolved = Required<Exclude<Speed, number>>;
export type SpeedXYResolved = { x: SpeedResolved; y: SpeedResolved, minAbs:number,maxAbs:number };
export type ForceResolved = Required<Exclude<Force, number>>;
export type ForceXYResolved = { x: ForceResolved; y: ForceResolved, maxAbs:number };

export function getSpeed(speed: Speed): SpeedResolved {
  let defaultDampening = 1;
  if (typeof speed === "number") {
    return { min: -Infinity, max: Infinity, value: speed, dampening: defaultDampening};
  }
  let min =  speed.min  ?? -Infinity;
  let max =  speed.max ??  Infinity;
  let value = "value" in speed && speed.value !== undefined ? speed.value :speed.min && speed.max? Math.random() * (max - min) + min:0;
  let dampening =  speed.dampening ?? defaultDampening;
  return { min, max, value: Math.min(max, Math.max(min, value)), dampening };
}

export function getSpeedXY(speed: SpeedXY): SpeedXYResolved {
  const minAbs = speed.minAbs ?? 0;
  const maxAbs = speed.maxAbs ?? Infinity;
  return {
    x: getSpeed(speed.x),
    y: getSpeed(speed.y),
    minAbs: minAbs,
    maxAbs: maxAbs,
  };
}
export function getForce(force: Force): ForceResolved {
  let defaultFalloffExponent = 1;
  if (typeof force === "number") {
    return { min: -Infinity, max: Infinity, value: force, falloffExponent: defaultFalloffExponent };
  }
  let min= force.min ??  -Infinity;
  let max= force.max ??  Infinity;
  let value= "value" in force && force.value !== undefined ? force.value : force.max&& force.min?Math.random() * (max - min) + min:0;
  let falloffExponent = force.falloffExponent ?? defaultFalloffExponent;
  return { min, max, value: Math.min(max, Math.max(min, value)), falloffExponent };
}
export function getForceXY(force: ForceXY): ForceXYResolved {
  const maxAbs = force.maxAbs ?? Infinity;
  return {
    x: getForce(force.x),
    y: getForce(force.y),
    maxAbs: maxAbs,
  };
}
function resolveValue(value: number | { min: number; max: number }): number {
  if (typeof value === "number") return value;
  return Math.random() * (value.max - value.min) + value.min;
}
export function resolveLifespan(
  lifespan: number | { min: number; max: number },
): number {
  if (typeof lifespan === "number") return lifespan;
  return Math.random() * (lifespan.max - lifespan.min) + lifespan.min;
}
function resolveLife(lifeOption: any) {
  if (typeof lifeOption === "number") return lifeOption;
  return Math.random() * (lifeOption.max - lifeOption.min) + lifeOption.min;
}
