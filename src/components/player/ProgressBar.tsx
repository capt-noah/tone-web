'use client';

import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '@/lib/utils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  onSeekingChange?: (isSeeking: boolean) => void;
  showTimestamps?: boolean;
  isLoading?: boolean;
  className?: string;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  onSeekingChange,
  showTimestamps = false,
  isLoading = false,
  className = '',
}: ProgressBarProps) {
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [seekTime, setSeekTime] = useState<number>(0);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync seekTime with currentTime when not actively dragging
  useEffect(() => {
    if (!isSeeking) {
      setSeekTime(currentTime);
    }
  }, [currentTime, isSeeking]);

  const effectiveTime = isSeeking ? seekTime : currentTime;
  const safeDuration = duration > 0 ? duration : 0;
  const percent = safeDuration > 0 ? Math.min(100, Math.max(0, (effectiveTime / safeDuration) * 100)) : 0;

  const handlePointerDown = () => {
    setIsSeeking(true);
    if (onSeekingChange) onSeekingChange(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSeekTime(val);
  };

  const handleCommit = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const finalVal = parseFloat(target.value);
    setIsSeeking(false);
    if (onSeekingChange) onSeekingChange(false);
    onSeek(finalVal);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || safeDuration <= 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = offsetX / rect.width;
    setHoverPosition(offsetX);
    setHoverTime(ratio * safeDuration);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  return (
    <div className={`flex items-center gap-3 w-full select-none group ${className}`}>
      {showTimestamps && (
        <span className="text-[11px] font-mono text-[#a6ada6] w-9 text-right tabular-nums">
          {formatTime(effectiveTime)}
        </span>
      )}

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 flex items-center h-5"
      >
        <input
          type="range"
          min="0"
          max={safeDuration > 0 ? safeDuration : 100}
          step="0.05"
          value={effectiveTime}
          disabled={safeDuration <= 0 || isLoading}
          onPointerDown={handlePointerDown}
          onChange={handleInput}
          onPointerUp={handleCommit}
          onKeyUp={handleCommit}
          className={`w-full h-1 group-hover:h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-150 ${
            isLoading ? 'animate-pulse opacity-75 cursor-wait' : ''
          }`}
          style={{
            backgroundImage: isLoading
              ? 'linear-gradient(90deg, rgba(185,203,186,0.2) 0%, rgba(185,203,186,0.6) 50%, rgba(185,203,186,0.2) 100%)'
              : `linear-gradient(to right, #b9cbba 0%, #b9cbba ${percent}%, rgba(255, 255, 255, 0.15) ${percent}%, rgba(255, 255, 255, 0.15) 100%)`,
            backgroundSize: isLoading ? '200% 100%' : '100% 100%',
          }}
        />

        {/* Hover Time Tooltip */}
        {hoverPosition !== null && hoverTime !== null && !isSeeking && !isLoading && (
          <div
            className="absolute -top-7 px-1.5 py-0.5 rounded bg-[#1c211d] border border-white/10 text-[10px] font-mono text-[#fff8f2] pointer-events-none -translate-x-1/2 shadow-lg z-30"
            style={{ left: `${hoverPosition}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {showTimestamps && (
        <span className="text-[11px] font-mono text-[#a6ada6] w-9 tabular-nums">
          {formatTime(safeDuration)}
        </span>
      )}
    </div>
  );
}
