"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

interface BackgroundProps {
  activeScan?: "phishing" | "ip" | "dataleak" | "purple" | "red" | "green" | "blue" | null;
}

export default function Background({ activeScan }: BackgroundProps) {
  const [init, setInit] = useState(false);

  const [config, setConfig] = useState({
    color: "#a855f7",
    particleCount: 60,
    speed: 0.8,
    linkOpacity: 0.25,
  });

  // 💡 Dynamic theme reacting to results
  useEffect(() => {
    switch (activeScan) {
      case "phishing":
      case "purple":
        setConfig({
          color: "#a855f7",
          particleCount: 70,
          speed: 1,
          linkOpacity: 0.3,
        });
        break;
      case "ip":
      case "blue":
        setConfig({
          color: "#3b82f6",
          particleCount: 80,
          speed: 1.1,
          linkOpacity: 0.35,
        });
        break;
      case "dataleak":
      case "red":
        setConfig({
          color: "#ef4444",
          particleCount: 100,
          speed: 1.2,
          linkOpacity: 0.4,
        });
        break;
      case "green":
        setConfig({
          color: "#22c55e",
          particleCount: 50,
          speed: 0.6,
          linkOpacity: 0.25,
        });
        break;
      default:
        setConfig({
          color: "#6b21a8",
          particleCount: 60,
          speed: 0.8,
          linkOpacity: 0.25,
        });
    }
  }, [activeScan]);

  // 🧠 Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <div className="fixed inset-0 -z-10 transition-all duration-700">
      {/* 🌌 Soft Glow Aura */}
      <div
        className="absolute inset-0 blur-[110px] opacity-50 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${config.color}40, transparent 70%)`,
        }}
      />

      {/* ⭐ Particles */}
      <Particles
        id="mindshield-bg"
        options={{
          fpsLimit: 60,
          background: { color: "transparent" },
          detectRetina: true,

          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { distance: 140, duration: 0.4 },
              push: { quantity: 3 },
            },
          },

          particles: {
            number: {
              value: config.particleCount,
              density: {
                enable: true,
                width: 900, // v3 valid density field
                height: 900,
              },
            },
            color: { value: config.color },
            shape: { type: "circle" },

            opacity: { value: 0.35 },
            size: { value: { min: 1, max: 3 } },

            links: {
              enable: true,
              color: config.color,
              distance: 130,
              opacity: config.linkOpacity,
              width: 1,
            },

            move: {
              enable: true,
              speed: config.speed,
              direction: "none",
              outModes: { default: "bounce" },
            },
          },
        }}
      />
    </div>
  );
}
