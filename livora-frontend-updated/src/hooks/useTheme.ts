import { useState, useEffect, useSyncExternalStore } from "react";

const THEME_KEY = "livora-theme";

function getStoredTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "dark";
  }
  return "dark";
}

function applyTheme(t: "light" | "dark") {
  document.documentElement.classList.toggle("dark", t === "dark");
}

// Apply theme immediately on module load (before any component renders)
if (typeof window !== "undefined") {
  applyTheme(getStoredTheme());
}

export const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggleTheme };
};
