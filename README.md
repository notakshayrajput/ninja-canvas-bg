# 🥷 ninja-canvas-bg

A highly customizable, lightweight **canvas particle background** for
React applications.

Create beautiful animated particle networks with:

-   ✨ Configurable particle speed & direction\
-   🔗 Dynamic connecting lines\
-   🧲 Interaction support (mouse attraction / repulsion)\
-   💥 Optional bloom/glow effects\
-   🎛 Fine-grained control over behavior\
-   ⚡ Optimized for performance

------------------------------------------------------------------------

## 🚀 Installation

``` bash
npm install ninja-canvas-bg
```

or

``` bash
yarn add ninja-canvas-bg
```

------------------------------------------------------------------------

## 🧩 Basic Usage

``` tsx
import { ParticleBackground } from "ninja-canvas-bg";

export default function App() {
  return (
    <ParticleBackground
      width={800}
      height={600}
      backgroundFillStyle="#0f172a"
      particle={{
        count: 80,
        radius: 2,
        color: "#ffffff",
        speed: {
          x: { min: -1, max: 1, minAbs: 0.2 },
          y: { min: -1, max: 1, minAbs: 0.2 },
        },
      }}
      connectingLines={{
        enabled: true,
        maxDistance: 120,
        color: "rgba(255,255,255,0.2)",
        width: 1,
      }}
      interaction={{
        enabled: true,
        mode: "attract", // or "repel"
        radius: 150,
        strength: 0.05,
      }}
    />
  );
}
```

------------------------------------------------------------------------

## ⚙️ Props

### ParticleBackgroundProps

  Prop                  Type            Description
  --------------------- --------------- ---------------------------------
  width                 number          Canvas width
  height                number          Canvas height
  backgroundFillStyle   string          Canvas background color
  particle              \_Particle      Particle configuration
  connectingLines       \_Line          Line configuration
  interaction           \_Interaction   Mouse interaction configuration
  className             string          Optional wrapper class

------------------------------------------------------------------------

## 🎯 Particle Configuration

``` ts
particle: {
  count: number;
  radius: number;
  color: string;
  speed: {
    x: {
      min: number;
      max: number;
      minAbs?: number;
    };
    y: {
      min: number;
      max: number;
      minAbs?: number;
    };
  };
  bloom?: {
    enabled?: boolean;
    intensity?: number;
    shadowColor?: string;
    blur?: number;
  };
}
```

------------------------------------------------------------------------

## 🔗 Connecting Lines

``` ts
connectingLines: {
  enabled: boolean;
  maxDistance: number;
  color: string;
  width: number;
}
```

Particles automatically connect when within `maxDistance`.

------------------------------------------------------------------------

## 🧲 Interaction Modes

``` ts
interaction: {
  enabled: boolean;
  mode: "attract" | "repel";
  radius: number;
  strength: number;
}
```

-   **attract** → particles move toward cursor\
-   **repel** → particles move away from cursor

------------------------------------------------------------------------

## 💥 Bloom / Glow Effect

Optional glow effect using canvas shadow blur:

``` ts
bloom: {
  enabled: true,
  intensity: 1.5,
  shadowColor: "rgba(255,255,255,0.8)",
  blur: 20
}
```

------------------------------------------------------------------------

## 🧠 Performance Notes

-   Uses requestAnimationFrame
-   Avoids unnecessary React re-renders
-   Optimized particle updates
-   Efficient line distance checks
-   Optional Delaunay triangulation support

------------------------------------------------------------------------

## 🛠 Development

``` bash
git clone https://github.com/notakshayrajput/ninja-canvas-bg.git
cd ninja-canvas-bg
npm install
npm run dev
```

------------------------------------------------------------------------

## 📦 Roadmap

-   [ ] Gradient particle support\
-   [ ] Touch support\
-   [ ] Preset themes\
-   [ ] Auto-resize mode\
-   [ ] Physics-based interaction

------------------------------------------------------------------------

## 🧑‍💻 Author

Akshay Rajput

------------------------------------------------------------------------

## 📄 License

MIT
