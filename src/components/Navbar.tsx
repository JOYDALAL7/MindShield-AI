"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 border-b border-white/10 px-6 py-3 flex items-center justify-between"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-purple-400" />
        <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
          MindShield-AI
        </span>
      </Link>

      {/* Navigation */}
      <div className="hidden md:flex gap-6 text-gray-300 text-sm font-medium">
        <Link href="/dashboard" className="hover:text-purple-400 transition">Dashboard</Link>
        <Link href="/insights" className="hover:text-purple-400 transition">Insights</Link>
        <Link href="/docs" className="hover:text-purple-400 transition">Docs</Link>
        <Link href="/about" className="hover:text-purple-400 transition">About</Link>
      </div>

      {/* User Avatar */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
      >
        J
      </motion.div>
    </motion.nav>
  );
}
