'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Sparkles,
  Flame,
  Headphones,
  Check,
} from 'lucide-react';
import { useSync } from '@/context/SyncContext';
import { useAuth } from '@/context/AuthContext';
import { getCoverImageUrl } from '@/lib/utils';
import { exportElementAsPng } from '@/lib/wrapExporter';

interface WrapModalProps {
  onClose: () => void;
}

export function WrapModal({ onClose }: WrapModalProps) {
  const { user } = useAuth();
  const { stats } = useSync();
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Timeframe multipliers for preview calculation
  const multiplier = timeframe === 'week' ? 0.25 : timeframe === 'month' ? 0.6 : 1;
  const displayMinutes = Math.round(stats.totalMinutes * multiplier);
  const displayPlays = Math.round(stats.totalPlays * multiplier);

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b9cbba', '#3b4b3e', '#fff8f2'],
      });
    } catch {
      // Ignored if canvas unavailable
    }

    const success = await exportElementAsPng(
      cardRef.current,
      `tone-wrap-${user?.username || 'listener'}.png`
    );

    setIsExporting(false);
    if (success) {
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl select-none animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 rounded-3xl bg-[#0d0f0d] border border-white/10 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#b9cbba]" />
            <h3 className="text-lg font-black tracking-tight text-[#fff8f2]">
              TONE WRAP
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Timeframe Filter Tabs */}
            <div className="flex items-center bg-white/[0.06] p-1 rounded-full border border-white/[0.08]">
              {(['week', 'month', 'all'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase transition-all ${
                    timeframe === t
                      ? 'bg-[#b9cbba] text-[#0d0f0d] font-bold shadow-sm'
                      : 'text-[#a6ada6] hover:text-[#fff8f2]'
                  }`}
                >
                  {t === 'all' ? 'All Time' : t === 'month' ? 'Month' : 'Week'}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable / Exportable Wrap Story Board */}
        <div
          ref={cardRef}
          className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-[#161a16] via-[#111412] to-[#0d0f0d] border border-white/10 shadow-2xl overflow-hidden space-y-6"
        >
          {/* Ambient Lighting Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#b9cbba]/15 rounded-full blur-3xl pointer-events-none -z-0" />

          {/* Wrap Header */}
          <div className="flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-lg border border-white/10 bg-[#1c211d]">
                <Image
                  src="/images/icon.png"
                  alt="Tone"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <p className="text-xs font-mono tracking-widest text-[#b9cbba] uppercase">
                  Tone Wrap
                </p>
                <h4 className="text-lg font-bold text-[#fff8f2]">
                  {user?.username || 'Listener'}&apos;s Soundscape
                </h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-[#a6ada6] block">
                ANNUAL ARCHIVE
              </span>
              <span className="text-xs font-bold text-[#b9cbba]">2026 EDITION</span>
            </div>
          </div>

          {/* Key Metrics Bento */}
          <div className="grid grid-cols-2 gap-3 z-10 relative">
            <div className="p-4 rounded-2xl bg-[#1c211d]/90 border border-white/[0.06]">
              <div className="flex items-center gap-2 text-[#b9cbba] mb-1">
                <Headphones className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Listening Time</span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-[#fff8f2] tracking-tight tabular-nums">
                {displayMinutes}
              </p>
              <p className="text-[10px] text-[#a6ada6] font-mono mt-0.5">MINUTES STREAMED</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#1c211d]/90 border border-white/[0.06]">
              <div className="flex items-center gap-2 text-[#b9cbba] mb-1">
                <Flame className="w-4 h-4 text-[#ee7d77]" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Total Plays</span>
              </div>
              <p className="text-2xl md:text-3xl font-black text-[#fff8f2] tracking-tight tabular-nums">
                {displayPlays}
              </p>
              <p className="text-[10px] text-[#a6ada6] font-mono mt-0.5">TRACK SPINS</p>
            </div>
          </div>

          {/* Top 5 Tracks List */}
          <div className="z-10 relative space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase">
                Top Heavy-Rotation Tracks
              </span>
              <span className="text-[10px] font-mono text-[#a6ada6]">TOP 5</span>
            </div>

            <div className="space-y-1.5">
              {stats.topTracks.length === 0 ? (
                <p className="text-xs text-[#a6ada6] py-3 text-center">
                  Play more tracks to generate rotation statistics!
                </p>
              ) : (
                stats.topTracks.map((track, idx) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                  >
                    <span className="w-4 text-center font-mono font-bold text-xs text-[#b9cbba]">
                      #{idx + 1}
                    </span>
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-[#0d0f0d]">
                      <Image
                        src={getCoverImageUrl(track.coverFileId, track.fileId)}
                        alt={track.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#fff8f2] truncate">
                        {track.title}
                      </p>
                      <p className="text-[10px] text-[#a6ada6] truncate">
                        {track.artistName}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-[#b9cbba] px-2 py-0.5 rounded-full bg-[#3b4b3e]/30">
                      {track.plays || 0} plays
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Artists Row */}
          {stats.topArtists.length > 0 && (
            <div className="z-10 relative space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase block">
                Top Artists
              </span>
              <div className="flex flex-wrap gap-2">
                {stats.topArtists.map((artist, idx) => (
                  <div
                    key={artist.name}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1c211d] border border-white/[0.08]"
                  >
                    <span className="text-[10px] font-mono text-[#b9cbba] font-bold">
                      0{idx + 1}
                    </span>
                    <span className="text-xs font-medium text-[#fff8f2]">
                      {artist.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer watermark */}
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono text-[#a6ada6]/60 z-10 relative">
            <span>TONE • HIGH FIDELITY AUDIO WORKSTATION</span>
            <span>TONE.APP</span>
          </div>
        </div>

        {/* Action Button: Export PNG */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] font-bold text-sm shadow-[0_0_25px_rgba(185,203,186,0.35)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
          >
            {exported ? (
              <>
                <Check className="w-4 h-4 text-[#0d0f0d]" />
                <span>Saved to Downloads!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating PNG...' : 'Export High-Res Card'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
