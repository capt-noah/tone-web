'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { Music2, Edit3, Loader2, Sparkles } from 'lucide-react';
import { parseLrc, LrcLine } from '@/lib/lyrics';

interface LyricsViewerProps {
  lyrics?: string | null;
  currentTime: number;
  onSeek?: (seconds: number) => void;
  onFindLyrics?: () => void;
  onOpenEditor?: () => void;
  isSearching?: boolean;
  searchError?: string | null;
  className?: string;
}

export function LyricsViewer({
  lyrics,
  currentTime,
  onSeek,
  onFindLyrics,
  onOpenEditor,
  isSearching = false,
  searchError = null,
  className = '',
}: LyricsViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Parse structured lines using the robust LRC parser
  const parsedLines = useMemo<LrcLine[]>(() => {
    return parseLrc(lyrics);
  }, [lyrics]);

  const hasTimestamps = useMemo(() => {
    return parsedLines.some((l) => l.time !== null);
  }, [parsedLines]);

  // Find active line index
  const activeIndex = useMemo(() => {
    if (parsedLines.length === 0 || !hasTimestamps) return -1;

    let currentIdx = -1;
    for (let i = 0; i < parsedLines.length; i++) {
      const lineTime = parsedLines[i].time;
      if (lineTime !== null && lineTime <= currentTime) {
        currentIdx = i;
      } else if (lineTime !== null && lineTime > currentTime) {
        break;
      }
    }
    return currentIdx;
  }, [parsedLines, currentTime, hasTimestamps]);

  // Track user scroll interactions to avoid jarring auto-scroll interrupts
  const handleScroll = () => {
    isUserScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
    }, 2800);
  };

  // Auto-scroll active lyric line smoothly into center view
  useEffect(() => {
    if (isUserScrollingRef.current) return;
    const container = containerRef.current;
    const activeEl = activeLineRef.current;
    if (!container || !activeEl) return;

    const frameId = requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const currentScroll = container.scrollTop;
      const targetScroll =
        currentScroll +
        (activeRect.top - containerRect.top) -
        containerRect.height / 2 +
        activeRect.height / 2;

      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    });

    return () => cancelAnimationFrame(frameId);
  }, [activeIndex]);

  // Cleanup scroll timeout
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Empty / Not Found State
  if (!lyrics || parsedLines.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 px-6 text-center select-none ${className}`}>
        <div className="w-16 h-16 rounded-3xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5 text-[#b9cbba]/60 shadow-inner">
          {isSearching ? (
            <Loader2 className="w-7 h-7 text-[#b9cbba] animate-spin" />
          ) : (
            <Music2 className="w-7 h-7 text-[#b9cbba]/80" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-[#fff8f2] tracking-tight">
          {isSearching
            ? 'Searching LRCLIB Database…'
            : searchError
            ? searchError
            : 'No lyrics available for this track'}
        </h3>
        <p className="text-xs text-[#a6ada6] mt-1.5 max-w-sm font-mono uppercase tracking-wider">
          {isSearching
            ? 'FETCHING WORD-FOR-WORD TIMESTAMPS'
            : 'Find synced lyrics online or paste your own'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
          {onFindLyrics && (
            <button
              onClick={onFindLyrics}
              disabled={isSearching}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b9cbba] hover:bg-[#c8dac9] text-[#111412] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#b9cbba]/10 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{searchError ? 'Try Again' : 'Find Lyrics'}</span>
                </>
              )}
            </button>
          )}

          {onOpenEditor && (
            <button
              onClick={onOpenEditor}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 text-[#fff8f2] text-xs font-semibold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#b9cbba]" />
              <span>Add / Paste</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Synced or Plain Lyrics View
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto px-4 md:px-8 pt-[32vh] pb-[38vh] space-y-4 md:space-y-5 text-center select-none max-h-full scroll-smooth ${className}`}
    >
      {parsedLines.map((line, idx) => {
        const isActive = idx === activeIndex;
        const isPast = activeIndex !== -1 && idx < activeIndex;
        const isClickable = line.time !== null && !!onSeek;

        return (
          <div
            key={idx}
            ref={isActive ? activeLineRef : null}
            onClick={() => {
              if (isClickable && line.time !== null) {
                onSeek(line.time);
              }
            }}
            className={`group flex items-center justify-center transition-all duration-300 py-1.5 px-3 max-w-3xl mx-auto ${
              isClickable ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <p
              className={`transition-all duration-300 text-balance tracking-tight leading-snug ${
                isActive
                  ? 'text-[#fff8f2] font-black text-2xl sm:text-3xl md:text-[34px] scale-[1.03] drop-shadow-[0_0_24px_rgba(185,203,186,0.65)] origin-center'
                  : isPast
                  ? 'text-white/25 group-hover:text-white/65 text-xl sm:text-2xl md:text-[28px] font-semibold'
                  : 'text-white/40 group-hover:text-white/80 text-xl sm:text-2xl md:text-[28px] font-semibold'
              }`}
            >
              {line.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
