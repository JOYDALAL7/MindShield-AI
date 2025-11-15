"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X, User, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "About", path: "/about" },
  ];

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          fixed top-0 left-0 right-0 z-50
          backdrop-blur-xl bg-black/40
          border-b border-purple-500/20 shadow-lg
          px-6 py-3 flex items-center justify-between
        "
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition" />
          <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text">
            MindShield-AI
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`
                relative transition text-gray-300 hover:text-purple-400
                ${isActive(link.path) ? "text-purple-400" : ""}
              `}
            >
              {link.name}

              {/* animated underline */}
              {isActive(link.path) && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-0 right-0 h-[2px] bg-purple-400 rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        {/* PROFILE BUTTON */}
        <div className="relative hidden md:block">
          <motion.button
            onClick={() => setProfileOpen((prev) => !prev)}
            whileHover={{ scale: 1.1 }}
            className="
              w-9 h-9 rounded-full 
              bg-gradient-to-br from-purple-600 to-blue-500
              flex items-center justify-center 
              text-white font-semibold shadow-md
            "
          >
            J
          </motion.button>

          {/* PROFILE DROPDOWN */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="
                  absolute right-0 mt-2 w-40 
                  bg-black/70 backdrop-blur-xl 
                  border border-purple-500/20 rounded-xl
                  shadow-xl overflow-hidden
                "
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition text-gray-200"
                >
                  <User className="w-4 h-4 text-purple-300" />
                  Profile
                </Link>

                <button
                  className="flex w-full items-center gap-2 px-4 py-3 hover:bg-white/10 transition text-gray-200"
                >
                  <LogOut className="w-4 h-4 text-purple-300" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-gray-200"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-7 h-7" />
        </button>
      </motion.nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed inset-0 z-50 bg-black/60 backdrop-blur-md 
              flex justify-end
            "
          >
            <motion.div
              initial={{ x: 200 }}
              animate={{ x: 0 }}
              exit={{ x: 200 }}
              transition={{ duration: 0.3 }}
              className="
                w-64 h-full bg-[#0d0d11] border-l border-purple-500/30 
                shadow-2xl p-6 flex flex-col gap-6
              "
            >
              {/* CLOSE BTN */}
              <button
                className="text-gray-300 self-end"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>

              {/* MOBILE NAV LINKS */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    text-lg py-2 rounded-lg px-2 transition
                    ${isActive(link.path) ? "text-purple-400" : "text-gray-300"}
                  `}
                >
                  {link.name}
                </Link>
              ))}

              {/* PROFILE IN MOBILE */}
              <div className="mt-4">
                <p className="text-gray-400 text-xs mb-2">Logged in as</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 
                      flex items-center justify-center text-white font-semibold"
                  >
                    J
                  </div>
                  <span className="text-gray-200">Joy</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
