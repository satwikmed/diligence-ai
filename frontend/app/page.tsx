'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PageShell from '@/components/ui/page-shell';
import ProjectSummary from '@/components/ProjectOverview';

function scrollToSummary() {
  document.getElementById('summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function HomePage() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/' && window.location.hash === '#summary') {
      requestAnimationFrame(() => scrollToSummary());
    }
  }, [pathname]);

  return (
    <PageShell
      eyebrow="Equity research · Multi-agent · Citation-backed"
      line1="Autonomous"
      line2="Due Diligence"
      line3="for ER"
      title="Autonomous Due Diligence for Equity Research"
      subtitle="What takes a junior analyst days on a new name, Diligence AI surfaces in one session — filing delta, earnings-vs-10-K cross-checks, and ER memo export with citations."
    >
      <div className="mb-12 flex flex-wrap items-center gap-4">
        <Link
          href="/history"
          className="rounded-full border-2 border-white/30 bg-transparent px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:border-sky-400/50 hover:bg-white/10 hover:text-sky-100"
        >
          View History
        </Link>
        <Link
          href="/upload"
          className="rounded-full bg-gradient-to-r from-sky-500 to-amber-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-sky-400 hover:to-amber-400 hover:shadow-xl"
        >
          Get Started
        </Link>
      </div>

      <div id="summary" className="scroll-mt-8">
        <ProjectSummary />
      </div>
    </PageShell>
  );
}
