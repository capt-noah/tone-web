'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Edit3, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useSync } from '@/context/SyncContext';
import { audioEngine } from '@/lib/audioEngine';
import { getCoverImageUrl } from '@/lib/utils';
import { fetchLyricsFromLrclib } from '@/lib/lyrics';
import { GlassCard } from '@/components/shared/GlassCard';
import { LyricsViewer } from './LyricsViewer';

interface LyricsDrawerProps {
  onOpenEditor: () => void;
}

export function LyricsDrawer({ onOpenEditor }: LyricsDrawerProps) {
  const { currentSong, currentTime, lyricsOpen, setLyricsOpen, duration } = usePlayer();
  const { updateSongLyrics } = useSync();

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Reset search status on song change
  useEffect(() => {
    setSearchError(null);
    setJustSaved(false);
  }, [currentSong?.id]);

  // Handler to search lyrics online via LRCLIB
  const handleFindLyrics = useCallback(async () => {
    if (!currentSong) return;
    setIsSearching(true);
    setSearchError(null);

    try {
      const result = await fetchLyricsFromLrclib(
        currentSong.title,
        currentSong.artistName,
        currentSong.albumTitle,
        duration || currentSong.durationSec
      );

      if (result && (result.syncedLyrics || result.plainLyrics)) {
        const found = result.syncedLyrics || result.plainLyrics;
        updateSongLyrics(currentSong.id, found);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 3000);
      } else {
        setSearchError('No lyrics found on LRCLIB');
      }
    } catch (e: any) {
      console.error('[LyricsDrawer] Find lyrics error:', e);
      setSearchError('Failed to fetch lyrics');
    } finally {
      setIsSearching(false);
    }
  }, [currentSong, duration, updateSongLyrics]);

  // Handler for seeking on click
  const handleSeek = useCallback((seconds: number) => {
    audioEngine.seek(seconds);
  }, []);

  if (!lyricsOpen || !currentSong) return null;

  const coverUrl = getCoverImageUrl(currentSong.coverFileId, currentSong.audioFileId || currentSong.fileId);
  const hasLyrics = !!currentSong.lyrics && currentSong.lyrics.trim().length > 0;
  const isSynced = hasLyrics && currentSong.lyrics!.includes('[00:');

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setLyricsOpen(false)}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* Drawer Panel */}
      <GlassCard
        variant="panel"
        className="fixed inset-y-0 right-0 z-50 w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 !rounded-none !border-y-0 !border-r-0 border-l border-white/12"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-3.5 min-w-0 pr-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0f0d] shadow-md border border-white/10">
              <Image
                src={coverUrl}
                alt={currentSong.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[#fff8f2] truncate">
                {currentSong.title}
              </h3>
              <p className="text-xs text-[#a6ada6] truncate">
                {currentSong.artistName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Find Button */}
            <button
              onClick={handleFindLyrics}
              disabled={isSearching}
              title="Search LRCLIB for lyrics"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                justSaved
                  ? 'bg-[#34c759]/20 text-[#34c759] border border-[#34c759]/30'
                  : 'bg-white/10 hover:bg-white/20 text-[#fff8f2]'
              }`}
            >
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b9cbba]" />
              ) : justSaved ? (
                <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#b9cbba]" />
              )}
              <span className="hidden sm:inline">
                {isSearching ? 'Finding…' : justSaved ? 'Saved' : 'Find'}
              </span>
            </button>

            {/* Edit / Add Button */}
            <button
              onClick={onOpenEditor}
              title="Add or Edit custom lyrics"
              className="p-2 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => setLyricsOpen(false)}
              className="p-2 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        {hasLyrics && (
          <div className="flex items-center justify-between px-6 py-2 bg-[#111412]/60 border-b border-white/[0.04] text-[10px] font-mono text-[#a6ada6]">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isSynced ? 'bg-[#b9cbba] animate-pulse' : 'bg-white/40'}`} />
              {isSynced ? 'REAL-TIME SYNCED KARAOKE' : 'PLAIN TEXT LYRICS'}
            </span>
            <span>CLICK ANY LINE TO SEEK</span>
          </div>
        )}

        {/* Lyrics Body */}
        <div className="flex-1 overflow-hidden relative">
          <LyricsViewer
            lyrics={currentSong.lyrics}
            currentTime={currentTime}
            onSeek={handleSeek}
            onFindLyrics={handleFindLyrics}
            onOpenEditor={onOpenEditor}
            isSearching={isSearching}
            searchError={searchError}
            className="h-full"
          />
        </div>
      </GlassCard>
    </>
  );
}
