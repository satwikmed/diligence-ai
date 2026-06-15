'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Download, History } from 'lucide-react';
import AgentPipeline from '@/components/AgentPipeline';
import UploadZone from '@/components/UploadZone';
import PageShell from '@/components/ui/page-shell';
import SectionHeading from '@/components/ui/section-heading';
import { uploadDocument } from '@/lib/api';

const SAMPLES = [
  { href: '/samples/AAPL_10K_FY2024.pdf', label: 'Apple (AAPL)' },
  { href: '/samples/MSFT_10K_FY2024.pdf', label: 'Microsoft (MSFT)' },
  { href: '/samples/CRM_10K_FY2024.pdf', label: 'Salesforce (CRM)' },
];

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadDocument(file);
      router.push(`/analysis/${result.document_id}`);
    } catch {
      alert('Upload failed. A live backend is required for uploads in production.');
      setUploading(false);
    }
  };

  return (
    <PageShell
      eyebrow="Analyze"
      line1="Upload"
      line2="Your"
      line3="10-K"
      title="Upload a 10-K"
      subtitle="Drop a PDF below or download a sample SEC filing to start the six-agent pipeline."
    >
      <div className="space-y-12 pb-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <UploadZone onUpload={handleUpload} uploading={uploading} />
          </div>

          <div className="glass-card lg:col-span-2 p-6">
            <p className="mb-1 text-sm font-medium text-white">Demo sample filings</p>
            <p className="mb-4 text-xs leading-relaxed text-white/50">
              Real SEC EDGAR 10-K PDFs included with the repo. Download, then upload above.
            </p>
            <ul className="space-y-2">
              {SAMPLES.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-cyan-300 transition hover:border-cyan-400/30 hover:bg-white/[0.06]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link
              href="/history"
              className="mt-5 flex items-center gap-2 text-sm text-white/70 transition hover:text-cyan-200"
            >
              <History className="h-4 w-4" />
              Or view pre-analyzed reports in History
            </Link>
          </div>
        </div>

        <section className="glass-card p-6 md:p-8">
          <SectionHeading label="Pipeline" title="Agent Pipeline" />
          <AgentPipeline />
          <p className="mt-4 text-center text-xs text-white/45">
            Document Processor, then Financial Analyst + Risk Detective in parallel, then Strategic Insights, Report Generator, Q&A
          </p>
        </section>
      </div>
    </PageShell>
  );
}
