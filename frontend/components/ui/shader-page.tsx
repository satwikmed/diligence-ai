"use client"

import dynamic from "next/dynamic"
import ShaderFilters from "@/components/ui/shader-filters"
import SiteHeader from "@/components/ui/site-header"
import SiteFooter from "@/components/ui/site-footer"
import ShaderBackgroundLite from "@/components/ui/shader-background-lite"
import { cn } from "@/lib/utils"

const ShaderBackgroundFull = dynamic(() => import("@/components/ui/shader-background-full"), { ssr: false })
const OrbitBadge = dynamic(() => import("@/components/ui/orbit-badge"), { ssr: false })

interface ShaderPageProps {
  children: React.ReactNode
  header?: boolean
  footer?: boolean
  orbit?: boolean
  variant?: "full" | "lite"
  className?: string
}

export default function ShaderPage({
  children,
  header = true,
  footer = true,
  orbit = false,
  variant = "lite",
  className,
}: ShaderPageProps) {
  const isFull = variant === "full"

  return (
    <div className={cn("relative flex min-h-screen flex-col text-white", className)}>
      <ShaderFilters />
      {isFull ? <ShaderBackgroundFull /> : <ShaderBackgroundLite />}
      <div className="relative z-10 flex flex-1 flex-col">
        {header && <SiteHeader />}
        <div className="flex-1">{children}</div>
        {footer && <SiteFooter />}
      </div>
      {isFull && orbit && <OrbitBadge />}
    </div>
  )
}
