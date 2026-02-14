export interface ParticleBackgroundProps {
  backgroundFillStyle?: string;
  height?: number;
  width?: number;
  particle: Particle;
  className?: string;
  connectingLines?: Line;
  interaction?: Interaction;
}
export interface Interaction {
  enabled?: boolean;
  mode?: "attract" | "repel";
  radius?: number;
  strength?: number;
  forceLife?: number; // frames that the interaction force persists after mouse leaves
  forceCooldown?: number; // frames cooldown between applying interaction force to the same particle
}
export interface Particle {
  mass: number;
  force?:ForceXY;
  speed?: SpeedXY;
  fillStyle?: string;
  size?: number;
  opacity?: number;
  count?: number;
  lifespan?: {
    life: number | { min: number; max: number };
    fadeIn?: number; // seconds
    fadeOut?: number; // seconds
  };
  bloom?:{
    enabled?: boolean;
  radius?: number;  
    shadowColor?: string; // e.g. "rgba(255, 255, 255, 0.5)"
  }
}
export interface Line {
  enabled?: boolean;
  width?: number;
  fillStyle?: string;
  maxDistance?: number;
  dynamicOpacity?: boolean;
}
export type ForceXY = {
  x: Force;
  y: Force;
  maxAbs?: number; // maximum absolute force to prevent extreme values at close distances
};
export type Force={
  value?: number;
  min?: number;
  max?: number;
  falloffExponent?: number; // distance falloff power
}|number;

export type SpeedXY = {
  x: Speed;
  y: Speed;
  minAbs?:number;
  maxAbs?:number;
};
export type Speed =
  | {
      min?: number;
      max?: number;
      value?: number;
      dampening?: number;
    }
  | number;
export type _Particle = Required<Particle>;
export type _Line = Required<Line>;
export type _Interaction = Required<Interaction>;
