"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Cpu, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-black via-[#0a0a0f] to-black text-white">

      {/* 🔥 CYBER GLOW BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,0,180,0.25),transparent_60%)] pointer-events-none" />

      {/* 💬 CHATBOT TEASER BUTTON */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link href="#chat-teaser">
          <button className="bg-purple-600/80 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-lg backdrop-blur-xl">
            Need help? 💬
          </button>
        </Link>
      </motion.div>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center min-h-[85vh] px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        >
          🧠 MindShield AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 max-w-xl mb-6 text-lg"
        >
          Your personal AI-powered cybersecurity companion — detect phishing,
          analyze threats, check breaches, and guard your digital world.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Link href="/dashboard">
            <Button className="px-8 py-4 text-lg bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-xl">
              Launch Dashboard 🚀
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* ⚡ LIVE THREAT STATS */}
      <section className="py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {[
            { label: "Threats Detected", value: "12,842+" },
            { label: "Breaches Monitored", value: "6,430+" },
            { label: "Phishing URLs Flagged", value: "21,990+" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-[#111118] p-6 rounded-2xl border border-purple-600/20 shadow-lg"
            >
              <h2 className="text-3xl font-bold text-white">{item.value}</h2>
              <p className="text-gray-400 text-sm mt-2">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* 💎 FEATURE CARDS */}
      <section className="max-w-5xl mx-auto py-20 grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
        {[
          {
            icon: <Shield className="w-10 h-10 text-purple-400" />,
            title: "Threat Protection",
            desc: "Analyze URLs, IPs & domains for malicious behavior instantly.",
          },
          {
            icon: <Cpu className="w-10 h-10 text-blue-400" />,
            title: "AI-Powered Insights",
            desc: "Advanced models generate summaries, risk levels & reports.",
          },
          {
            icon: <Lock className="w-10 h-10 text-indigo-400" />,
            title: "Breach Monitoring",
            desc: "Discover exposed credentials and compromised accounts fast.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            className="p-6 bg-[#111118] rounded-2xl border border-purple-600/20"
          >
            {item.icon}
            <h3 className="text-white font-semibold mt-3">{item.title}</h3>
            <p className="text-gray-400 text-sm mt-2">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* 🚀 HOW IT WORKS */}
      <section className="py-20 px-6">
        <h2 className="text-center text-3xl font-bold mb-12 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          How MindShield Works
        </h2>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: "1", title: "Scan", desc: "Enter URLs, IPs, emails or domains." },
            { step: "2", title: "Analyze", desc: "AI evaluates threats & suspicious behavior." },
            { step: "3", title: "Protect", desc: "Get instant actionable reports & insights." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="bg-[#111118] p-6 rounded-2xl border border-blue-600/20 shadow-lg text-center"
            >
              <div className="text-4xl font-bold text-purple-400">{item.step}</div>
              <h3 className="text-white text-xl mt-2">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ⚡ QUICK ACCESS CARDS */}
      <section className="py-16 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Phishing Scanner", href: "/dashboard#phishing" },
          { label: "IP Analyzer", href: "/dashboard#ip" },
          { label: "Data Leak Checker", href: "/dashboard#dataleak" },
        ].map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-[#111118] p-6 rounded-2xl border border-purple-500/20 shadow-lg text-center"
          >
            <h3 className="text-white font-semibold">{item.label}</h3>
            <Link href={item.href}>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                Open <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-500 text-sm">
        <Sparkles className="w-5 h-5 mx-auto mb-2 text-purple-400" />
        Built with ❤️ by Joy
      </footer>
    </main>
  );
}
