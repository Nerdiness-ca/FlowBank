"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useTenant } from "@/components/providers/TenantProvider";

type ColorThemeContextType = {
  themeId: string;
  changeTheme: (newTheme: string) => void;
  availableThemes: Array<{ id: string; name: string; color: string; accent: string }>;
};

const ColorThemeContext = createContext<ColorThemeContextType | null>(null);

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
};

export const ColorThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const tenant = useTenant();

  // Initialize directly from localStorage so the correct theme is known
  // from the very first render — avoids Effect 2 overwriting the saved value.
  const [themeId, setThemeId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("flowbank_color_theme") || "default";
    }
    return "default";
  });

  const availableThemes = [
    { id: "default", name: "Bank Default", color: tenant.colors.primary, accent: tenant.colors.accent },
    { id: "purple",  name: "Purple",       color: "#9333ea", accent: "#a855f7" },
    { id: "blue",    name: "Blue",          color: "#2563eb", accent: "#3b82f6" },
    { id: "red",     name: "Red",           color: "#dc2626", accent: "#ef4444" },
    { id: "green",   name: "Green",         color: "#16a34a", accent: "#22c55e" },
    { id: "orange",  name: "Orange",        color: "#ea580c", accent: "#f97316" },
  ];

  // Apply CSS variables whenever the theme or tenant brand colors change.
  // Does NOT write to localStorage here — that only happens in changeTheme().
  useEffect(() => {
    const selectedTheme = availableThemes.find(t => t.id === themeId) || availableThemes[0];
    document.documentElement.style.setProperty("--primary", selectedTheme.color);
    document.documentElement.style.setProperty("--accent",  selectedTheme.accent);
  }, [themeId, tenant.colors.primary, tenant.colors.accent]);

  // Persist selection and update state when the user explicitly picks a theme.
  const changeTheme = (newTheme: string) => {
    setThemeId(newTheme);
    localStorage.setItem("flowbank_color_theme", newTheme);
  };

  return (
    <ColorThemeContext.Provider value={{ themeId, changeTheme, availableThemes }}>
      {children}
    </ColorThemeContext.Provider>
  );
};
