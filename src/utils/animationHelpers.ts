import { Speed, SpeedXY,Force,ForceXY } from "../components/CanvasBackground/types";


export type SpeedResolved = Required<Exclude<Speed, number>>;
export type SpeedXYResolved = { x: SpeedResolved; y: SpeedResolved };
export type ForceResolved = Required<Exclude<Force, number>>;
export type ForceXYResolved = { x: ForceResolved; y: ForceResolved };

export function getSpeed(speed: Speed): SpeedResolved {
  let defaultDampening = 1;
  let defaultMinAbs = 0;
  if (typeof speed === "number") {
    return { min: -Infinity, max: Infinity, value: speed, dampening: defaultDampening, minAbs: 0 };
  }
  let min =  speed.min  ?? -Infinity;
  let max =  speed.max ??  Infinity;
  let value = "value" in speed && speed.value !== undefined ? speed.value : Math.random() * (max - min) + min;
  let dampening =  speed.dampening ?? defaultDampening;
  let minAbs = speed.minAbs ?? defaultMinAbs;
  return { min, max, value: Math.min(max, Math.max(min, value)), dampening, minAbs };
}

export function getSpeedXY(speed: SpeedXY): SpeedXYResolved {
  return {
    x: getSpeed(speed.x),
    y: getSpeed(speed.y),
  };
}
export function getForce(force: Force): ForceResolved {
  let defaultFalloffExponent = 1;
  let defaultMaxAbs = Infinity;
  if (typeof force === "number") {
    return { min: -Infinity, max: Infinity, value: force, falloffExponent: defaultFalloffExponent, maxAbs: defaultMaxAbs };
  }
  let min= force.min ??  -Infinity;
  let max= force.max ??  Infinity;
  let value= "value" in force && force.value !== undefined ? force.value : Math.random() * (max - min) + min;
  let falloffExponent = force.falloffExponent ?? defaultFalloffExponent;
  let maxAbs = force.maxAbs ?? defaultMaxAbs;
  return { min, max, value: Math.min(max, Math.max(min, value)), falloffExponent, maxAbs };
}
export function getForceXY(force: ForceXY): ForceXYResolved {
  return {
    x: getForce(force.x),
    y: getForce(force.y),
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
