"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type LeakItem = {
  name?: string;
  domain?: string;
  date?: string;
  dataClasses?: string[];
};

export type CardColor = "purple" | "red" | "green" | "blue";

export default function ResultCard({
  title,
  description,
  color,
  leaks,
}: {
  title: string;
  description: string;
  color: CardColor;
  leaks?: LeakItem[];
}) {
  const [open, setOpen] = useState(false);

  const colors: Record<CardColor, string> = {
    purple: "from-purple-500/30 to-purple-700/20 border-purple-500/40",
    red: "from-red-500/30 to-red-700/20 border-red-500/40",
    green: "from-green-500/30 to-green-700/20 border-green-500/40",
    blue: "from-blue-500/30 to-blue-700/20 border-blue-500/40",
  };

  const iconMap: Record<CardColor, string> = {
    purple: "🧠",
    red: "⚠️",
    green: "✅",
    blue: "🌐",
  };

  const getBadgeColor = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes("password")) return "bg-red-700/40 text-red-300";
    if (lower.includes("email")) return "bg-blue-700/40 text-blue-300";
    if (lower.includes("phone")) return "bg-green-700/40 text-green-300";
    if (lower.includes("ip")) return "bg-purple-700/40 text-purple-300";
    return "bg-gray-700/40 text-gray-300";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
      className={`p-[1.2px] rounded-2xl bg-gradient-to-br ${colors[color]} border`}
    >
      <div className="rounded-2xl p-5 bg-black/40 backdrop-blur-xl relative overflow-hidden">

        {/* Glass Highlight */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 bg-gradient-to-br from-white/30 to-transparent" />

        {/* Title Row */}
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">{iconMap[color]}</span> {title}
          </h4>

          {leaks?.length ? (
            <button
              onClick={() => setOpen(!open)}
              className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition text-gray-200"
            >
              {open ? "Hide details" : "Show details"}
            </button>
          ) : null}
        </div>

        {/* Description */}
        <p className="text-gray-300 mt-2 leading-relaxed">{description}</p>

        {/* Expandable Leak Section */}
        <AnimatePresence>
          {open && leaks && leaks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <div className="border-t border-white/10 pt-3" />

              <ul className="text-sm text-gray-400 space-y-3">
                {leaks.slice(0, 5).map((l, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="font-medium text-gray-200">
                      {l.name || "Unknown Source"}
                    </span>{" "}
                    <span className="text-gray-500">
                      ({l.domain || "unknown.com"}) — {l.date || "Date Unknown"}
                    </span>

                    {l.dataClasses?.length ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {l.dataClasses.map((type, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`text-xs px-2 py-1 rounded-full ${getBadgeColor(
                              type
                            )}`}
                          >
                            {type}
                          </motion.span>
                        ))}
                      </div>
                    ) : null}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
