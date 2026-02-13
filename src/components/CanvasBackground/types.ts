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
}
export interface Particle {
  speed?: Speed;
  fillStyle?: string;
  size?: number;
  opacity?: number;
  count?: number;
  lifespan?: { life: number | { min: number; max: number };

  fadeIn?: number;   // seconds
  fadeOut?: number;  // seconds
 };
}
export interface Line {
  enabled?: boolean;
  width?: number;
  fillStyle?: string;
  maxDistance?: number;
  dynamicOpacity?: boolean;
}
export type Speed =
  | number
  | { min: number; max: number }
  | { x: number; y: number }
  | {
      x: number | { min: number; max: number };
      y: number | { min: number; max: number };
    };
export type _Particle = Required<Particle>;
export type _Line = Required<Line>;
export type _Interaction = Required<Interaction>;
