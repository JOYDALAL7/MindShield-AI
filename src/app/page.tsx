"use client";

import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { signIn } from "next-auth/react";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-black via-[#0a0a0f] to-black text-white overflow-hidden">

      {/* ✨ Cyber Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,0,255,0.25),transparent_60%)] pointer-events-none" />

      {/* 🔰 Center Container */}
      <div className="text-center px-6 max-w-xl">
        
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center mb-6"
        >
          <Shield className="w-14 h-14 text-purple-400 drop-shadow-lg" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-xl"
        >
          MindShield AI
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 mt-4 text-lg leading-relaxed"
        >
          Your AI-powered cybersecurity companion.  
          Scan links, detect phishing, analyze malware risk, and check breaches — instantly.
        </motion.p>

        {/* Google Login Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10"
        >
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="px-8 py-3 bg-white text-black font-semibold rounded-2xl shadow-xl hover:bg-gray-200 active:scale-95 transition-all flex items-center gap-3 mx-auto"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google Logo"
              className="w-6 h-6"
            />
            Sign in with Google
          </button>
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-gray-600 text-xs mt-5"
        >
          Secure OAuth login • No passwords stored • Encrypted authentication
        </motion.p>
      </div>
    </main>
  );
}
