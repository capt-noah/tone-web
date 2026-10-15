'use client';

import React from 'react';
import { usePageVisibility } from '@/hooks/usePageVisibility';

export function AmbientGlowCanvas() {
  const isVisible = usePageVisibility();

  if (!isVisible) {
    return <div className="fixed inset-0 pointer-events-none -z-10 bg-[#0d0f0d]" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#0d0f0d]">
      {/* High-Precision Multi-Stop Smooth Radial Gradients (No Banding / No GPU Blur Pixelation) */}
      <div
        className="absolute -top-[15%] left-[10%] w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59, 75, 62, 0.16) 0%, rgba(59, 75, 62, 0.10) 25%, rgba(185, 203, 186, 0.05) 50%, rgba(13, 15, 13, 0.02) 75%, transparent 100%)',
          transform: 'translateZ(0)',
        }}
      />

      <div
        className="absolute top-[35%] -right-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(185, 203, 186, 0.08) 0%, rgba(59, 75, 62, 0.06) 30%, rgba(13, 15, 13, 0.01) 65%, transparent 100%)',
          transform: 'translateZ(0)',
        }}
      />

      <div
        className="absolute -bottom-[20%] left-[25%] w-[75vw] h-[75vw] max-w-[1000px] max-h-[1000px] pointer-events-none transition-opacity duration-1000"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(59, 75, 62, 0.12) 0%, rgba(185, 203, 186, 0.04) 35%, transparent 80%)',
          transform: 'translateZ(0)',
        }}
      />

      {/* High-Density Film Grain Dither Layer to completely eliminate gradient banding */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
