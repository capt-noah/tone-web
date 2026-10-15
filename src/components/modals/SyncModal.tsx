'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  RefreshCw,
  CheckCircle2,
  Clock,
  CloudDownload,
  Music2,
  Sparkles,
} from 'lucide-react';
import { useSync } from '@/context/SyncContext';
import { Song } from '@/types';
import { getCoverImageUrl } from '@/lib/utils';

interface SyncModalProps {
  onClose: () => void;
}

function SyncItem({ song, progress }: { song: Song; progress: number }) {
  const isDone = progress >= 1;
  const isProcessing = progress > 0 && progress < 1;
  const coverUrl = getCoverImageUrl(song.coverFileId || song.coverUrl, song.fileId);

  return (
    <div className="relative flex items-center justify-between py-3 px-4 sm:px-5 rounded-[28px] sm:rounded-[40px] bg-[#1c211d] border border-white/[0.06] overflow-hidden group shadow-sm transition-all duration-200">
      {/* Progress Overlay (Hardware Accelerated Horizontal Fill) */}
      <div
        className="absolute inset-0 bg-[#b9cbba]/15 transition-all duration-300 ease-out pointer-events-none"
        style={{
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
          opacity: progress > 0 ? 1 : 0,
        }}
      />

      {/* Left: Cover Art & Track Info */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 relative z-10 mr-3">
        <div className="w-11 h-11 rounded-xl bg-[#111412] border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
          {coverUrl && coverUrl !== '/images/icon.png' ? (
            <Image
              src={coverUrl}
              alt={song.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : isProcessing ? (
            <RefreshCw className="w-5 h-5 text-[#b9cbba] animate-spin opacity-80" />
          ) : (
            <Music2 className="w-5 h-5 text-[#b9cbba]/60" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-black text-sm text-[#fff8f2] truncate tracking-tight">
            {song.title}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#a6ada6]/70 truncate mt-0.5">
            {isDone
              ? 'Synced'
              : isProcessing
              ? `Syncing ${Math.round(progress * 100)}%`
              : 'Waiting in Queue'}
          </p>
        </div>
      </div>

      {/* Right: Status Icon */}
      <div className="flex items-center relative z-10 flex-shrink-0">
        {isDone ? (
          <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
        ) : isProcessing ? (
          <RefreshCw className="w-4 h-4 text-[#b9cbba] animate-spin" />
        ) : (
          <Clock className="w-4 h-4 text-[#a6ada6]/40" />
        )}
      </div>
    </div>
  );
}

export function SyncModal({ onClose }: SyncModalProps) {
  const { syncQueue, fileProgresses, progress, isSyncing, syncAll } = useSync();

  const totalTracks = syncQueue.length;
  const completedCount = Math.floor(progress.current);
  const percent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111412] border border-white/10 p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-5 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center">
              <CloudDownload className="w-5 h-5 text-[#b9cbba]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#fff8f2] tracking-tight">Sync</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a6ada6]">
                {totalTracks === 0
                  ? 'Queue Empty'
                  : isSyncing
                  ? `${completedCount} of ${progress.total} Tracks Processing`
                  : 'Library Synchronized'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSyncing && (
              <button
                onClick={() => syncAll()}
                className="p-2 rounded-xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-bold text-[#b9cbba] hover:text-[#fff8f2] transition-colors cursor-pointer"
                title="Re-sync Library"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Progress Bar (if syncing) */}
        {isSyncing && progress.total > 0 && (
          <div className="space-y-1.5 flex-shrink-0">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#a6ada6]">Synchronizing tracks</span>
              <span className="text-[#b9cbba] font-bold">{percent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#1c211d] overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#b9cbba] to-[#fff8f2] transition-all duration-200"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Track Queue */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar min-h-[220px]">
          {totalTracks > 0 ? (
            syncQueue.map((song) => (
              <SyncItem
                key={song.id}
                song={song}
                progress={fileProgresses[song.id] ?? (isSyncing ? 0 : 1)}
              />
            ))
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1c211d] border border-white/10 flex items-center justify-center mx-auto text-[#b9cbba]">
                <CheckCircle2 className="w-8 h-8 text-[#b9cbba]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-[#fff8f2]">
                  All tracks are synced
                </h4>
                <p className="text-xs text-[#a6ada6]">
                  Your library is up to date and ready for playback.
                </p>
              </div>
              <button
                onClick={() => syncAll()}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-bold text-[#b9cbba] transition-colors mt-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sync Library Now</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
