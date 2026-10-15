'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Heart,
  Music2,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Folder,
} from 'lucide-react';
import { DesktopPlaybackSync } from '@/types/desktop';
import { getCoverImageUrl, formatTime } from '@/lib/utils';
import { AudioVisualizer } from '@/components/player/AudioVisualizer';

export default function TrayPopoverPage() {
  const [playback, setPlayback] = useState<DesktopPlaybackSync>({
    currentSong: null,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: 1,
    isMuted: false,
    isShuffle: false,
    repeatMode: 'off',
    isLiked: false,
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const unsub = window.electronAPI.onPlaybackStateUpdated((state) => {
        setPlayback(state);
      });
      return () => unsub();
    }
  }, []);

  const song = playback.currentSong;
  const coverUrl = song
    ? getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId)
    : '/images/icon.png';

  const progressPercent =
    playback.duration > 0 ? (playback.currentTime / playback.duration) * 100 : 0;

  const handleOpenFolder = () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.openStorageFolder('');
    }
  };

  return (
    <div className="w-full h-screen p-3 select-none flex items-center justify-center bg-transparent overflow-hidden">
      <div className="relative w-full h-full rounded-[28px] bg-[#111412]/95 border border-white/20 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-5 flex flex-col justify-between overflow-hidden">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Music2 className="w-4 h-4 text-[#b9cbba]" />
            <span className="text-[11px] font-mono tracking-widest text-[#fff8f2] font-black uppercase">
              Tone Menu Bar
            </span>
          </div>
          <button
            onClick={handleOpenFolder}
            className="p-1 rounded-lg hover:bg-white/10 text-[#a6ada6] hover:text-[#b9cbba] transition-colors cursor-pointer"
            title="Open Tone Storage in Finder"
          >
            <Folder className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center Artwork & Visualizer */}
        <div className="space-y-3 py-2 text-center">
          <div className="relative w-36 h-36 mx-auto rounded-2xl overflow-hidden bg-[#1c211d] border-2 border-white/15 shadow-xl group">
            {song ? (
              <Image
                src={coverUrl}
                alt={song.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#b9cbba]">
                <Music2 className="w-10 h-10 stroke-[1.5]" />
              </div>
            )}

            {playback.isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <AudioVisualizer isPlaying={true} barCount={4} />
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <h3 className="text-base font-black text-[#fff8f2] tracking-tight truncate px-2">
              {song?.title || 'No Track Selected'}
            </h3>
            <p className="text-xs text-[#a6ada6] truncate font-medium px-2">
              {song?.artistName || 'Open Tone to choose music'}
            </p>
          </div>
        </div>

        {/* Scrubber & Controls */}
        <div className="space-y-3 pt-1">
          {/* Scrubber */}
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#b9cbba] rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#a6ada6]">
              <span>{formatTime(playback.currentTime)}</span>
              <span>{formatTime(playback.duration)}</span>
            </div>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              className="p-2 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              className="w-11 h-11 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title={playback.isPlaying ? 'Pause' : 'Play'}
            >
              {playback.isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              className="p-2 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
