import { AnimationOptions } from "./useParticleAnimation";

export interface ParticleBackgroundProps {
  background: Background;
  height?: number;
  width?: number;
  particle: Particle;
  className?: string;
  connectingLines?: Line;
  interaction?: Interaction;
}
export interface Interaction {
  enabled?: boolean;
  mode?: "attract" | "repel" | "bubble";
  radius?: number;
  strength?: number;
  forceLife?: number; // frames that the interaction force persists after mouse leaves
  forceCooldown?: number; // frames cooldown between applying interaction force to the same particle
  eventTarget?: EventTarget | null;
  falloff?: "none" | "linear" | "quadratic" | "cubic";
}
export interface Particle {
  mass: number;
  force?: ForceXY;
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
  bloom?: {
    enabled?: boolean;
    radius?: number;
    shadowColor?: string; // e.g. "rgba(255, 255, 255, 0.5)"
  }
  onInit?: ((particle: any) => any) | undefined; // callback to initialize particle properties or override defaults
  onDraw?: (ctx: CanvasRenderingContext2D, p: any, canvas?: HTMLCanvasElement) => void | undefined; // callback for custom drawing, receives particle object with current properties (position, speed, etc)
}
export interface Line {
  enabled?: boolean;
  width?: number;
  fillStyle?: string;
  maxDistance?: number;
  dynamicOpacity?: boolean;
  onDraw?: (ctx: CanvasRenderingContext2D, options: { a: { x: number, y: number }, b: { x: number, y: number }, line: _Line }, canvas: HTMLCanvasElement) => void;
}
export type ForceXY = {
  x: Force;
  y: Force;
  maxAbs?: number; // maximum absolute force to prevent extreme values at close distances
};
export type Force = {
  value?: number;
  min?: number;
  max?: number;
  falloffExponent?: number; // distance falloff power
} | number;

export type SpeedXY = {
  x: Speed;
  y: Speed;
  minAbs?: number;
  maxAbs?: number;
};
export type Speed =
  | {
    min?: number;
    max?: number;
    value?: number;
    dampening?: number;
  }
  | number;
export type Background = {
  fillStyle?: string;
  onDraw?: (ctx: CanvasRenderingContext2D, options: AnimationOptions, canvas: HTMLCanvasElement) => void;
};
export type _Particle = Required<Particle>;
export type _Line = Required<Line>;
export type _Interaction = Required<Interaction>;
export type _Background = Required<Background>;