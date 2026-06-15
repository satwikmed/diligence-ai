"use client"

import Link from "next/link"

interface CtaProps {
  label: string
  href: string
}

interface HeroLandingProps {
  badge?: string
  showBadge?: boolean
  line1?: string
  line2?: string
  line3?: string
  description?: string
  primaryCta?: CtaProps
  secondaryCta?: CtaProps
}

export default function HeroLanding({
  badge = "Six AI agents. Six frameworks. One analysis.",
  showBadge = true,
  line1 = "Autonomous",
  line2 = "Due Diligence",
  line3 = "Reports",
  description = "What takes a junior consultant two weeks, Diligence AI delivers in two minutes. Upload a 10-K and get a consulting-grade report powered by parallel AI agents.",
  primaryCta = { label: "Get Started", href: "/upload" },
  secondaryCta = { label: "View History", href: "/history" },
}: HeroLandingProps) {
  return (
    <section className="relative min-h-screen">
      <main className="absolute bottom-8 left-8 z-20 max-w-2xl">
        <div className="text-left">
          {showBadge && (
            <div
              className="hero-fade-up relative mb-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="absolute left-1 right-1 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
              <span className="relative z-10 text-sm font-medium tracking-wide text-white/90">{badge}</span>
            </div>
          )}

          <h1
            className="hero-fade-up mb-6 text-6xl font-bold leading-none tracking-tight text-white md:text-7xl lg:text-8xl"
            style={{ animationDelay: "0.4s" }}
          >
            <span className="hero-gradient-text mb-2 block text-4xl font-light tracking-wider md:text-5xl lg:text-6xl">
              {line1}
            </span>
            <span className="block font-black text-white drop-shadow-2xl">{line2}</span>
            <span className="block font-light italic text-white/80">{line3}</span>
          </h1>

          <p
            className="hero-fade-up mb-8 max-w-xl text-lg font-light leading-relaxed text-white/70"
            style={{ animationDelay: "0.8s" }}
          >
            {description}
          </p>

          <div
            className="hero-fade-up flex flex-wrap items-center gap-6"
            style={{ animationDelay: "1s" }}
          >
            <Link
              href={secondaryCta.href}
              className="cursor-pointer rounded-full border-2 border-white/30 bg-transparent px-10 py-4 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-sky-400/50 hover:bg-white/10 hover:text-sky-100"
            >
              {secondaryCta.label}
            </Link>
            <Link
              href={primaryCta.href}
              className="cursor-pointer rounded-full bg-gradient-to-r from-sky-500 to-amber-500 px-10 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-sky-400 hover:to-amber-400 hover:shadow-xl"
            >
              {primaryCta.label}
            </Link>
          </div>
        </div>
      </main>
    </section>
  )
}
