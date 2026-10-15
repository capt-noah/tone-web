'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Pause, SkipForward, SkipBack, Heart, Music2, X } from 'lucide-react';
import { DesktopPlaybackSync } from '@/types/desktop';
import { getCoverImageUrl, formatTime } from '@/lib/utils';
import { AudioVisualizer } from '@/components/player/AudioVisualizer';

export default function FloatingWidgetPage() {
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
      const unsubState = window.electronAPI.onPlaybackStateUpdated((state) => {
        setPlayback(state);
      });
      return () => {
        unsubState();
      };
    }
  }, []);

  const sendCommand = (cmd: 'toggle' | 'next' | 'previous' | 'seek') => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      // Send command through electron
      // We can trigger it via playback command dispatcher in main
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.toggleWidgetWindow(false);
    }
  };

  const song = playback.currentSong;
  const coverUrl = song
    ? getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId)
    : '/images/icon.png';

  const progressPercent =
    playback.duration > 0 ? (playback.currentTime / playback.duration) * 100 : 0;

  return (
    <div
      style={{ WebkitAppRegion: 'drag' } as any}
      className="w-full h-screen p-2 select-none flex items-center justify-center bg-transparent overflow-hidden"
    >
      <div className="relative w-full h-[88px] rounded-[24px] bg-[#111412]/85 border border-white/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2.5 flex items-center justify-between group overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#b9cbba]/10 to-[#ee7d77]/10 blur-xl opacity-50 -z-10" />

        {/* Left Section: Artwork + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
          {/* Thumbnail */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#1c211d] border border-white/15 flex-shrink-0 shadow-md">
            {song ? (
              <Image
                src={coverUrl}
                alt={song.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#b9cbba]">
                <Music2 className="w-5 h-5" />
              </div>
            )}

            {playback.isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <AudioVisualizer isPlaying={true} barCount={3} />
              </div>
            )}
          </div>

          {/* Title & Artist */}
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-[#fff8f2] tracking-tight truncate">
              {song?.title || 'Tone Player'}
            </h4>
            <p className="text-[10px] text-[#a6ada6] truncate font-medium">
              {song?.artistName || 'Ready to stream'}
            </p>
            {song && (
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[8px] font-mono text-[#b9cbba] tabular-nums">
                  {formatTime(playback.currentTime)}
                </span>
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#b9cbba] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-[8px] font-mono text-[#a6ada6] tabular-nums">
                  {formatTime(playback.duration)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Controls */}
        <div
          style={{ WebkitAppRegion: 'no-drag' } as any}
          className="flex items-center gap-1.5 flex-shrink-0"
        >
          {/* Prev */}
          <button
            onClick={() => sendCommand('previous')}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
            title="Previous"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={() => sendCommand('toggle')}
            className="w-8 h-8 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title={playback.isPlaying ? 'Pause' : 'Play'}
          >
            {playback.isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={() => sendCommand('next')}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
            title="Next"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          {/* Close Widget */}
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-white/30 hover:text-[#ee7d77] hover:bg-[#ee7d77]/20 transition-colors ml-1 cursor-pointer"
            title="Close Mini-Player"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
