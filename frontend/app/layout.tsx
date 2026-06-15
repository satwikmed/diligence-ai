import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diligence AI - Autonomous Due Diligence Platform',
  description: 'Upload a 10-K. Get a consulting-grade due diligence report in minutes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black antialiased">{children}</body>
    </html>
  );
}
