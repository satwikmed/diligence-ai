"use client"

export default function ShaderBackgroundLite() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020617]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(14,165,233,0.35) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 80% 20%, rgba(217,119,6,0.2) 0%, transparent 50%), #020617",
        }}
      />
    </div>
  )
}
