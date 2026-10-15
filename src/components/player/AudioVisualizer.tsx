'use client';

import React from 'react';
import { usePageVisibility } from '@/hooks/usePageVisibility';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
  color?: string;
}

export function AudioVisualizer({
  isPlaying,
  barCount = 4,
  className = '',
  color = '#b9cbba',
}: AudioVisualizerProps) {
  const isVisible = usePageVisibility();

  // If page is hidden or paused, show flat resting bars
  const active = isPlaying && isVisible;

  return (
    <div className={`flex items-end gap-[3px] h-4 select-none ${className}`}>
      {Array.from({ length: barCount }).map((_, idx) => {
        const animClass = active ? `animate-eq-${(idx % 4) + 1}` : 'h-1';
        return (
          <span
            key={idx}
            className={`w-[2.5px] rounded-full transition-all duration-300 ${animClass}`}
            style={{
              backgroundColor: color,
              minHeight: '3px',
            }}
          />
        );
      })}
    </div>
  );
}
