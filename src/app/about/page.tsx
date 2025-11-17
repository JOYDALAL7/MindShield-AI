"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Shield, Cpu, Lock, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0f] to-black text-gray-300">
      {/* Navbar */}
      <Navbar />

      {/* Page Wrapper */}
      <div className="pt-28 pb-20 px-6 max-w-5xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            About MindShield-AI
          </h1>

          <p className="mt-4 text-gray-400 text-lg leading-relaxed max-w-3xl mx-auto">
            MindShield-AI is your personal cybersecurity companion — built to help you 
            stay safe online through AI-powered threat detection, phishing analysis, 
            breach monitoring, and real-time insights.
          </p>
        </motion.div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-[#111118] rounded-2xl border border-purple-500/20 shadow-lg"
          >
            <Shield className="w-10 h-10 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white">Threat Protection</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Instantly analyze URLs, IPs, and domains to detect malicious or 
              suspicious behavior.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-[#111118] rounded-2xl border border-blue-500/20 shadow-lg"
          >
            <Cpu className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white">AI-Powered Insights</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Uses advanced AI models to generate meaningful explanations, 
              summaries, and reports.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-[#111118] rounded-2xl border border-indigo-500/20 shadow-lg"
          >
            <Lock className="w-10 h-10 text-indigo-400 mb-3" />
            <h3 className="text-lg font-semibold text-white">Breach Monitoring</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Finds leaked data, exposed credentials, and compromised accounts 
              in seconds.
            </p>
          </motion.div>

        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center"
        >
          <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Built with ❤️ by Joy 
          </p>
        </motion.div>

      </div>
    </div>
  );
}
