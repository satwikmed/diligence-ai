"use client"

import ShaderPage from "@/components/ui/shader-page-client"
import HeroLanding from "@/components/ui/hero-landing"
import PageHeading from "@/components/ui/page-heading"
import { cn } from "@/lib/utils"

interface HeroProps {
  variant?: "landing" | "compact"
  badge?: string
  line1?: string
  line2?: string
  line3?: string
  description?: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  showBadge?: boolean
  showOrbit?: boolean
  children?: React.ReactNode
}

export default function Hero({
  variant = "landing",
  badge,
  line1,
  line2,
  line3,
  description,
  primaryCta,
  secondaryCta,
  showBadge = true,
  showOrbit = true,
  children,
}: HeroProps) {
  const compact = variant === "compact"

  if (compact) {
    return (
      <ShaderPage variant="lite">
        <main className={cn("mx-auto max-w-6xl px-6 pb-16 pt-2 md:px-10")}>
          <PageHeading
            eyebrow="Live Analysis"
            line1="Running"
            line2="Agent"
            line3="Pipeline"
            subtitle="Six AI agents processing your 10-K in parallel."
          />
          {children}
        </main>
      </ShaderPage>
    )
  }

  return (
    <ShaderPage variant="full" orbit={showOrbit}>
      <HeroLanding
        showBadge={showBadge}
        badge={badge}
        line1={line1}
        line2={line2}
        line3={line3}
        description={description}
        primaryCta={primaryCta}
        secondaryCta={secondaryCta}
      />
    </ShaderPage>
  )
}
