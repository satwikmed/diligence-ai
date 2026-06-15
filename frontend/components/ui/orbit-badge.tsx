"use client"

import { PulsingBorder } from "@paper-design/shaders-react"

interface OrbitBadgeProps {
  text?: string
  className?: string
}

export default function OrbitBadge({
  text = "Diligence AI - LangChain - CrewAI - LangGraph - MCP - A2A -",
  className = "fixed bottom-8 right-8 z-30 hidden lg:flex",
}: OrbitBadgeProps) {
  return (
    <div className={className}>
      <div className="relative flex h-20 w-20 items-center justify-center">
        <PulsingBorder
          colors={["#0ea5e9", "#0284c7", "#fbbf24", "#22d3ee", "#ffffff"]}
          colorBack="#00000000"
          speed={1.2}
          roundness={1}
          thickness={0.1}
          softness={0.25}
          intensity={0.75}
          spots={4}
          spotSize={0.1}
          pulse={0.08}
          smoke={0.35}
          smokeSize={0.3}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          minPixelRatio={1}
          style={{ width: "60px", height: "60px", borderRadius: "50%" }}
        />
        <svg
          className="absolute inset-0 h-full w-full animate-spin-slow"
          viewBox="0 0 100 100"
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="orbit-circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="fill-white/80 text-sm font-medium">
            <textPath href="#orbit-circle" startOffset="0%">
              {text}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  )
}
