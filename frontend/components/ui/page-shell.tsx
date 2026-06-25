"use client"

import ShaderPage from "@/components/ui/shader-page"
import PageHeading from "@/components/ui/page-heading"
import { cn } from "@/lib/utils"

interface PageShellProps {
  title: string
  subtitle?: string
  eyebrow?: string
  line1?: string
  line2?: string
  line3?: string
  children: React.ReactNode
  className?: string
}

export default function PageShell({
  title,
  subtitle,
  eyebrow,
  line1,
  line2,
  line3,
  children,
  className,
}: PageShellProps) {
  const words = title.split(" ")
  const useSplit = !line1 && words.length > 1

  return (
    <ShaderPage variant="lite">
      <main className={cn("relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-2 md:px-10", className)}>
        {useSplit ? (
          <PageHeading
            eyebrow={eyebrow}
            line1={words[0]}
            line2={words.slice(1, -1).join(" ") || words[1]}
            line3={words.length > 2 ? words[words.length - 1] : undefined}
            subtitle={subtitle}
          />
        ) : line1 ? (
          <PageHeading eyebrow={eyebrow} line1={line1} line2={line2} line3={line3} subtitle={subtitle} />
        ) : (
          <PageHeading eyebrow={eyebrow} singleTitle={title} subtitle={subtitle} />
        )}
        {children}
      </main>
    </ShaderPage>
  )
}
