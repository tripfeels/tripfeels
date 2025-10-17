"use client"

import React from "react"

export default function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card ${className}`}>
      <div className="p-6">{children}</div>
    </div>
  )
}
