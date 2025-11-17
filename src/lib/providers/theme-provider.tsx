"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  // Load stored theme
  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "system";
    setTheme(saved);
    setMounted(true);
  }, []);

  // Apply theme safely
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const applied =
      theme === "system" ? (systemDark ? "dark" : "light") : theme;

    // Add transition smoothness
    root.classList.add("theme-transition");

    if (applied === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);

    // Remove transition class after animation
    setTimeout(() => root.classList.remove("theme-transition"), 300);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {mounted ? children : null}
    </ThemeContext.Provider>
  );
}

export const useThemeSwitch = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeSwitch must be inside ThemeProvider");
  return ctx;
};
