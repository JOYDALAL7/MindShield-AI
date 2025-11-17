"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Menu,
  X,
  User,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useThemeSwitch } from "@/lib/providers/theme-provider"; // ✅ FIXED PATH

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useThemeSwitch();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "About", path: "/about" },
  ];

  const avatarLetter =
    session?.user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          fixed top-0 left-0 right-0 z-50
          backdrop-blur-xl border-b shadow-lg px-6 py-3 flex items-center justify-between
          ${
            theme === "dark"
              ? "bg-black/40 border-purple-500/20"
              : "bg-white/70 border-purple-300/30"
          }
        `}
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <Shield
            className={`w-6 h-6 transition ${
              theme === "dark"
                ? "text-purple-400 group-hover:text-purple-300"
                : "text-purple-600"
            }`}
          />
          <span
            className={`text-lg font-semibold bg-gradient-to-r 
              from-purple-400 to-blue-400 text-transparent bg-clip-text`}
          >
            MindShield-AI
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <div key={link.path} className="relative">
              <Link
                href={link.path}
                className={`transition ${
                  theme === "dark"
                    ? "text-gray-300 hover:text-purple-400"
                    : "text-gray-700 hover:text-purple-600"
                } ${isActive(link.path) ? "text-purple-500" : ""}`}
              >
                {link.name}
              </Link>

              {isActive(link.path) && (
                <motion.div
                  layoutId="underline"
                  className={`
                    absolute -bottom-1 left-0 right-0 h-[2px] rounded-full
                    ${theme === "dark" ? "bg-purple-400" : "bg-purple-600"}
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* RIGHT: THEME + PROFILE */}
        <div className="hidden md:flex items-center gap-4">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className={`
              p-2 rounded-full transition border
              ${
                theme === "dark"
                  ? "bg-black/60 border-purple-400/20 text-yellow-300"
                  : "bg-white text-purple-600 border-purple-400/30"
              }
            `}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* PROFILE */}
          {session ? (
            <div className="relative">
              <motion.button
                onClick={() => setProfileOpen((p) => !p)}
                whileHover={{ scale: 1.1 }}
                className={`
                  w-10 h-10 rounded-full overflow-hidden shadow-md flex items-center justify-center
                  ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-purple-600 to-blue-500"
                      : "bg-gradient-to-br from-purple-300 to-blue-300"
                  }
                `}
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </motion.button>

              {/* DROPDOWN */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`
                      absolute right-0 mt-2 w-52 rounded-xl shadow-xl overflow-hidden
                      backdrop-blur-xl border
                      ${
                        theme === "dark"
                          ? "bg-black/80 border-purple-500/20 text-gray-200"
                          : "bg-white border-purple-300/30 text-gray-800"
                      }
                    `}
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="font-semibold">{session.user?.name}</p>
                      <p className="text-xs opacity-70">{session.user?.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      Profile
                    </Link>

                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex w-full items-center gap-2 px-4 py-3 hover:bg-white/10 transition"
                    >
                      <LogOut className="w-4 h-4 text-purple-400" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              Login
            </button>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          className="md:hidden text-gray-200"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-7 h-7" />
        </button>
      </motion.nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end"
          >
            <motion.div
              initial={{ x: 200 }}
              animate={{ x: 0 }}
              exit={{ x: 200 }}
              transition={{ duration: 0.3 }}
              className={`
                w-64 h-full p-6 flex flex-col gap-6 border-l shadow-xl
                ${
                  theme === "dark"
                    ? "bg-[#0d0d11] border-purple-500/30"
                    : "bg-white border-purple-300/30"
                }
              `}
            >
              {/* CLOSE */}
              <button className="self-end" onClick={() => setMobileOpen(false)}>
                <X
                  className={`w-6 h-6 ${
                    theme === "dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                />
              </button>

              {/* THEME TOGGLE */}
              <button
                onClick={toggleTheme}
                className={`
                  px-3 py-2 rounded-lg border flex items-center gap-2
                  ${
                    theme === "dark"
                      ? "bg-black/40 text-yellow-300 border-purple-500/40"
                      : "bg-gray-100 text-purple-700 border-purple-300/40"
                  }
                `}
              >
                {theme === "dark" ? <Sun /> : <Moon />}
                Toggle Theme
              </button>

              {/* LINKS */}
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    text-lg py-2 rounded-lg px-2 transition
                    ${
                      isActive(link.path)
                        ? "text-purple-400"
                        : theme === "dark"
                        ? "text-gray-300"
                        : "text-gray-700"
                    }
                  `}
                >
                  {link.name}
                </Link>
              ))}

              {/* MOBILE PROFILE */}
              {session ? (
                <div className="mt-4">
                  <p
                    className={`text-xs mb-2 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    Logged in as
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white
                        ${
                          theme === "dark"
                            ? "bg-gradient-to-br from-purple-600 to-blue-500"
                            : "bg-gradient-to-br from-purple-300 to-blue-300"
                        }
                      `}
                    >
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        avatarLetter
                      )}
                    </div>

                    <span
                      className={`${
                        theme === "dark" ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {session.user?.name}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setMobileOpen(false);
                    }}
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signIn("google");
                    setMobileOpen(false);
                  }}
                  className="mt-4 w-full bg-purple-600 py-2 rounded-lg text-white hover:bg-purple-700"
                >
                  Login
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
