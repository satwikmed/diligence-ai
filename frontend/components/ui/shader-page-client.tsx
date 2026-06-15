"use client"

import dynamic from "next/dynamic"

const ShaderPageInner = dynamic(() => import("@/components/ui/shader-page"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-[#020617]" />,
})

interface ShaderPageProps {
  children: React.ReactNode
  header?: boolean
  footer?: boolean
  orbit?: boolean
  variant?: "full" | "lite"
  className?: string
}

export default function ShaderPage(props: ShaderPageProps) {
  return <ShaderPageInner {...props} />
}
