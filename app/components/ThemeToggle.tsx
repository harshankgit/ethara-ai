"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or initial class
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-3 w-full p-2.5 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">
        {darkMode ? "Light" : "Dark"}
      </span>
    </button>
  );
}
