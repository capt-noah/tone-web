import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Tone - Lossless Audio Player',
  description: 'Ultra-low-latency, lossless audio workstation with instant cloud synchronization.',
  icons: {
    icon: [
      { url: '/images/icon.png', type: 'image/png' },
      { url: '/images/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/images/icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d0f0d] text-[#ffffff] min-h-screen antialiased selection:bg-[#b9cbba]/30 selection:text-[#fff8f2]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
