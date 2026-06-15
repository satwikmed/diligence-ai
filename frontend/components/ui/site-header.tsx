"use client"

import Link from "next/link"

const NAV = [
  { href: "/#summary", label: "About" },
  { href: "/upload", label: "Upload" },
  { href: "/history", label: "History" },
  { href: "/compare", label: "Compare" },
]

export default function SiteHeader() {
  return (
    <header className="relative z-20 flex items-center justify-between p-6">
      <Link href="/" className="group flex cursor-pointer items-center transition-transform hover:scale-105">
        <svg
          width={40}
          height={40}
          fill="currentColor"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="size-10 shrink-0 text-white drop-shadow-lg transition-all duration-300 group-hover:text-sky-300"
          style={{ filter: "url(#logo-glow)" }}
        >
          <path d="M15 85V15h12l18 35 18-35h12v70h-12V35L45 70h-10L17 35v50H15z" />
        </svg>
      </Link>

      <nav className="hidden items-center space-x-1 sm:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-3 py-2 text-xs font-light text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div
        id="gooey-btn"
        className="group relative flex items-center"
        style={{ filter: "url(#gooey-filter)" }}
      >
        <Link
          href="/upload"
          className="absolute right-0 z-0 flex h-8 -translate-x-10 cursor-pointer items-center justify-center rounded-full bg-white px-2.5 py-2 text-xs font-normal text-black transition-all duration-300 hover:bg-white/90 group-hover:-translate-x-[4.75rem]"
          aria-label="Go to upload"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </Link>
        <Link
          href="/upload"
          className="z-10 flex h-8 cursor-pointer items-center rounded-full bg-white px-6 py-2 text-xs font-normal text-black transition-all duration-300 hover:bg-white/90"
        >
          Analyze
        </Link>
      </div>
    </header>
  )
}
