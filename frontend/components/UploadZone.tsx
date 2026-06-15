'use client';

import { useCallback, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onUpload: (file: File) => void;
  uploading?: boolean;
}

export default function UploadZone({ onUpload, uploading }: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.pdf')) return;
      setFileName(file.name);
      onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={cn(
        'glass-card relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center p-10 transition-all hover:border-cyan-400/35',
        dragOver && 'scale-[1.01] border-cyan-400/40 bg-cyan-400/5',
        uploading && 'pointer-events-none opacity-80'
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-sky-500/20 to-amber-500/20">
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-cyan-300" />
        ) : (
          <FileUp className="h-6 w-6 text-cyan-300" />
        )}
      </div>
      <p className="text-lg font-medium text-white">
        {uploading ? 'Starting analysis pipeline...' : 'Drop your 10-K PDF here'}
      </p>
      <p className="mt-2 text-sm text-white/50">or click to browse - PDF only</p>
      {fileName && <p className="mt-4 text-sm text-cyan-300">{fileName}</p>}
      <input
        type="file"
        accept=".pdf"
        className="absolute inset-0 cursor-pointer opacity-0"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={uploading}
      />
    </div>
  );
}
