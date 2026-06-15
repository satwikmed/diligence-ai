"use client"

import { MeshGradient } from "@paper-design/shaders-react"

export default function ShaderBackgroundFull() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020617]">
      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={["#020617", "#0ea5e9", "#0284c7", "#155e75", "#d97706"]}
        speed={0.22}
        distortion={0.65}
        swirl={0.08}
        minPixelRatio={1}
      />
      <MeshGradient
        className="absolute inset-0 h-full w-full opacity-40"
        colors={["#020617", "#67e8f9", "#0ea5e9", "#fbbf24"]}
        speed={0.14}
        distortion={0.45}
        swirl={0.05}
        grainOverlay={0}
        grainMixer={0}
        minPixelRatio={1}
      />
    </div>
  )
}
