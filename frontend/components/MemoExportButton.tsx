'use client';

import { Download } from 'lucide-react';
import { getMemoDownloadUrl } from '@/lib/api';
import { shouldUseDemoData } from '@/lib/demo-data';

interface MemoExportButtonProps {
  documentId: string;
}

export default function MemoExportButton({ documentId }: MemoExportButtonProps) {
  const handleExport = () => {
    if (shouldUseDemoData()) {
      alert(
        'PDF memo export requires the FastAPI backend. Run locally with NEXT_PUBLIC_API_URL=http://localhost:8000 or deploy the backend.'
      );
      return;
    }
    window.open(getMemoDownloadUrl(documentId), '_blank');
  };

  return (
    <button
      onClick={handleExport}
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-4 py-2 text-sm text-white/80 transition hover:border-cyan-400/40 hover:text-cyan-200"
    >
      <Download className="h-4 w-4" />
      Export ER Memo (PDF)
    </button>
  );
}
