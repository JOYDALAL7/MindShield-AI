"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

type RiskLevel = "Low" | "Medium" | "High";

interface RiskMeterProps {
  result: {
    type?: string;
    riskScore?: number;
    finalScore?: number;
    riskLevel?: RiskLevel;
    isSuspicious?: boolean;
  };
}

export default function RiskMeter({ result }: RiskMeterProps) {
  // FINAL SCORE fallback
  const backendFinal =
    typeof result.finalScore === "number" ? result.finalScore : undefined;

  // MAIN SCORE → rawScore
  const rawScore =
    typeof result.riskScore === "number"
      ? result.riskScore
      : typeof backendFinal === "number"
      ? backendFinal
      : result.isSuspicious
      ? 70
      : 20;

  const percent = Math.max(0, Math.min(100, rawScore));

  // RISK LEVEL mapping
  const level: RiskLevel =
    result.riskLevel ??
    (percent >= 70 ? "High" : percent >= 35 ? "Medium" : "Low");

  // COLORS
  const colorMap = {
    High: {
      bar: "from-red-600 to-red-800",
      ring: "shadow-red-500/40",
      text: "text-red-400",
      icon: "⚠️",
    },
    Medium: {
      bar: "from-purple-600 to-purple-800",
      ring: "shadow-purple-500/40",
      text: "text-purple-400",
      icon: "🟣",
    },
    Low: {
      bar: "from-green-600 to-green-800",
      ring: "shadow-green-500/40",
      text: "text-green-400",
      icon: "🟢",
    },
  };

  const cfg = colorMap[level];

  return (
    <Card className="relative bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden">
      {/* Glow Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wide text-gray-400">
            Threat Score
          </span>
          <div className="flex items-baseline gap-2">
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`text-4xl font-bold ${cfg.text}`}
            >
              {Math.round(percent)}
            </motion.span>
            <span className="text-sm text-gray-400">/100 · {level}</span>
          </div>
        </div>

        <span className="text-xs px-2 py-1 rounded-full bg-black/60 border border-gray-700 text-gray-300 capitalize">
          {result.type ?? "scan"}
        </span>
      </div>

      {/* Circular Glow Score Ring */}
      <div className="relative flex justify-center mt-4 mb-2">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={`w-28 h-28 rounded-full border-2 border-white/10 flex items-center justify-center shadow-[0_0_35px] ${cfg.ring}`}
        >
          <motion.div
            initial={{ rotate: "-180deg" }}
            animate={{ rotate: `${(percent / 100) * 180 - 180}deg` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-3 h-14 bg-white/70 rounded-full origin-bottom"
          />
          <span className="absolute text-2xl">{cfg.icon}</span>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 rounded-full bg-gray-800 overflow-hidden mt-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6 }}
          className={`h-full bg-gradient-to-r ${cfg.bar}`}
        />
      </div>

      {/* Text Description */}
      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        Higher scores indicate stronger phishing signs, malicious IP reputation,
        or confirmed data exposure in known breaches.
      </p>
    </Card>
  );
}
