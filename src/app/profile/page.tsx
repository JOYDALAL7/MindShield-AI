"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Hash,
  LogOut,
  Shield,
  Edit,
  Sun,
  Moon,
  Sparkles,
  Gauge,
  Key,
} from "lucide-react";
import Link from "next/link";

type ThemeMode = "dark" | "light";

export default function ProfilePage() {
  const { data: session } = useSession();
  const avatar = session?.user?.image;
  const name = session?.user?.name;
  const email = session?.user?.email;
  const id = (session?.user as any)?.id ?? "N/A";

  const [theme, setTheme] = useState<ThemeMode>("dark");

  // 🔥 EDIT STATES
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(name || "");

  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newAvatar, setNewAvatar] = useState(avatar || "/default-avatar.png");

  // --- THEME HANDLING -------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("mindshield-theme") as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("mindshield-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-300">
        Loading profile...
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b border-purple-500/20 px-8 py-4 flex justify-between items-center shadow-lg ${
          isDark ? "bg-black/60" : "bg-white/80"
        }`}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <Shield
            className={`w-7 h-7 transition ${
              isDark ? "text-purple-400 group-hover:text-purple-300" : "text-purple-600"
            }`}
          />
          <span className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            MindShield-AI
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className={`text-sm transition ${
              isDark ? "text-gray-300 hover:text-purple-400" : "text-gray-800 hover:text-purple-600"
            }`}
          >
            Dashboard
          </Link>

          <button
            onClick={toggleTheme}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition ${
              isDark
                ? "border-purple-500/40 bg-black/70 text-yellow-300 hover:bg-purple-900/40"
                : "border-purple-500/40 bg-white text-purple-700 hover:bg-purple-50"
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* PROFILE PAGE */}
      <main
        className={`min-h-screen w-full pt-28 pb-16 px-6 flex flex-col items-center ${
          isDark
            ? "bg-gradient-to-b from-black via-gray-950 to-black text-white"
            : "bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full max-w-4xl rounded-3xl shadow-2xl p-10 backdrop-blur-xl border border-purple-500/20 ${
            isDark ? "bg-[#0e0e14]" : "bg-white"
          }`}
        >
          {/* TOP PROFILE INFO */}
          <div className="flex flex-col items-center">

            {/* Profile Picture */}
            <div
              className="relative cursor-pointer"
              onClick={() => setIsEditingAvatar(true)}
            >
              <motion.img
                src={newAvatar}
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-purple-400 shadow-lg object-cover"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
              />

              <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs px-2 py-[2px] rounded-full shadow-md">
                Edit
              </div>
            </div>

            <h2 className="text-3xl font-semibold mt-4">{newName}</h2>
            <p className={isDark ? "text-gray-400 text-sm" : "text-gray-500 text-sm"}>
              {email}
            </p>

            <div
              className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                isDark ? "bg-purple-900/40 text-purple-200" : "bg-purple-100 text-purple-700"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>MindShield account secured</span>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-b border-purple-500/20 my-8" />

          {/* ACCOUNT DETAILS */}
          <section>
            <h3
              className={`text-lg font-semibold mb-3 ${
                isDark ? "text-purple-300" : "text-purple-700"
              }`}
            >
              Account details
            </h3>

            <div className="space-y-4">

              {/* NAME */}
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-purple-500/20 ${
                  isDark ? "bg-white/5" : "bg-purple-50"
                }`}
              >
                <User className={`w-5 h-5 ${isDark ? "text-purple-300" : "text-purple-600"}`} />
                <span className="flex-1 text-sm">{newName}</span>

                <button
                  onClick={() => setIsEditingName(true)}
                  className={`text-xs flex items-center gap-1 rounded-lg px-2 py-1 border transition ${
                    isDark
                      ? "border-purple-500/40 text-gray-300 hover:bg-purple-900/40"
                      : "border-purple-500/40 text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              </div>

              {/* EMAIL */}
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-purple-500/20 ${
                  isDark ? "bg-white/5" : "bg-purple-50"
                }`}
              >
                <Mail className={`w-5 h-5 ${isDark ? "text-purple-300" : "text-purple-600"}`} />
                <span className="flex-1 text-sm">{email}</span>
              </div>

              {/* USER ID */}
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-purple-500/20 ${
                  isDark ? "bg-white/5" : "bg-purple-50"
                }`}
              >
                <Hash className={`w-5 h-5 ${isDark ? "text-purple-300" : "text-purple-600"}`} />
                <span className="text-xs break-all">{id}</span>
              </div>
            </div>
          </section>

          {/* LOGOUT */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-10 w-full bg-gradient-to-r from-red-600 to-red-700 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-red-600/40 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </motion.button>
        </motion.div>
      </main>

      {/* 🔥 EDIT NAME MODAL */}
      {isEditingName && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div
            className={`p-6 rounded-2xl shadow-xl w-[90%] max-w-md ${
              isDark ? "bg-[#0e0e14] border border-purple-500/20" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-semibold mb-3">Edit Name</h3>

            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark ? "bg-black/40 border-purple-500/30 text-white" : "bg-gray-100"
              }`}
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsEditingName(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-500/40"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  (session!.user as any).name = newName;
                  setIsEditingName(false);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 EDIT AVATAR MODAL */}
      {isEditingAvatar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
          <div
            className={`p-6 rounded-2xl shadow-xl w-[90%] max-w-md ${
              isDark ? "bg-[#0e0e14] border border-purple-500/20" : "bg-white"
            }`}
          >
            <h3 className="text-lg font-semibold mb-3">Change Profile Picture</h3>

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setNewAvatar(reader.result as string);
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full mb-4"
            />

            <img
              src={newAvatar}
              alt="Preview"
              className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-purple-400"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setIsEditingAvatar(false)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-500/40"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  (session!.user as any).image = newAvatar;
                  setIsEditingAvatar(false);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
