"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold mb-4"
      >
        🧠 MindShield AI
      </motion.h1>

      <p className="text-gray-400 text-center max-w-lg mb-6">
        Your personal AI-powered cybersecurity guardian.  
        Detect phishing, track threats, and secure your digital world.
      </p>

      <Link href="/dashboard">
        <Button className="px-6 py-3 text-lg bg-purple-600 hover:bg-purple-700 rounded-2xl">
          Launch Dashboard 🚀
        </Button>
      </Link>
    </main>
  );
}
