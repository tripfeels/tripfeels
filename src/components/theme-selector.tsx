"use client"

import React from "react"
import { useThemeSystem } from "@/components/theme-provider"
import { THEME_NAMES, ThemeName } from "@/lib/themeColors"

export default function ThemeSelector() {
  const { color, mode, setColor, setMode } = useThemeSystem()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm">Theme:</label>
        <select
          value={color}
          onChange={(e) => setColor(e.target.value as ThemeName)}
          className="glass-input w-48"
        >
          {THEME_NAMES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm">Mode:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as "light" | "dark")}
          className="glass-input w-48"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
  )
}
