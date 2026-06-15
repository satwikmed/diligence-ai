import Link from "next/link"

const LINKEDIN_URL = "https://www.linkedin.com/in/medipalli-satwik/"

export default function SiteFooter() {
  return (
    <footer className="relative z-20 border-t border-white/10 px-6 py-8 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <p className="text-sm font-light text-white/50">
          Made by{" "}
          <Link
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sky-300 transition hover:text-sky-200 hover:underline"
          >
            Medipalli Satwik
          </Link>
        </p>
        <p className="text-xs text-white/35">Diligence AI - Autonomous Due Diligence Platform</p>
      </div>
    </footer>
  )
}
