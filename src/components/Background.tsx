"use client";

import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

interface BackgroundProps {
  activeScan?: "phishing" | "ip" | "dataleak" | "purple" | "red" | "green" | "blue" | null;
}

export default function Background({ activeScan }: BackgroundProps) {
  const [config, setConfig] = useState({
    color: "#a855f7",
    particleCount: 50,
    speed: 0.7,
    linkOpacity: 0.25,
  });

  // 🎨 Dynamic visuals based on scan type or result
  useEffect(() => {
    switch (activeScan) {
      case "phishing":
      case "purple":
        setConfig({
          color: "#a855f7",
          particleCount: 60,
          speed: 0.8,
          linkOpacity: 0.25,
        });
        break;

      case "ip":
      case "blue":
        setConfig({
          color: "#3b82f6",
          particleCount: 70,
          speed: 0.9,
          linkOpacity: 0.3,
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
          particleCount: 40,
          speed: 0.5,
          linkOpacity: 0.2,
        });
        break;

      default:
        setConfig({
          color: "#6b21a8",
          particleCount: 50,
          speed: 0.7,
          linkOpacity: 0.25,
        });
    }
  }, [activeScan]);

  // 🧠 Initialize the particles engine properly for latest API
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  if (!init) return null;

  return (
    <div className="fixed inset-0 -z-10 transition-all duration-700">
      {/* 🌫️ Animated Glow */}
      <div
        className="absolute inset-0 blur-3xl opacity-50 animate-pulse"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${config.color}40, transparent 70%)`,
          transition: "background 0.8s ease",
        }}
      />

      {/* 🪐 Particle Background */}
      <Particles
        id="tsparticles"
        options={{
          fpsLimit: 60,
          background: {
            color: { value: "#000000" },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              onClick: { enable: true, mode: "push" },
            },
            modes: {
              repulse: { distance: 120, duration: 0.4 },
              push: { quantity: 3 },
            },
          },
          particles: {
            color: { value: config.color },
            links: {
              color: config.color,
              distance: 130,
              enable: true,
              opacity: config.linkOpacity,
              width: 1,
            },
            move: {
              enable: true,
              speed: config.speed,
              outModes: { default: "bounce" },
            },
            number: {
              value: config.particleCount,
              density: {
                enable: true,
                width: 800, // ✅ replaced deprecated `area`
                height: 800,
              },
            },
            opacity: { value: 0.35 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}
