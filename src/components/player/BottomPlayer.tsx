'use client';

import React from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Maximize2,
  ListMusic,
  Mic2,
  Loader2,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useSync } from '@/context/SyncContext';
import { getCoverImageUrl } from '@/lib/utils';
import { GlassCard } from '@/components/shared/GlassCard';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { AudioVisualizer } from './AudioVisualizer';

export function BottomPlayer() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    lyricsOpen,
    queueOpen,
    isLoadingAudio,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setSeeking,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleFullscreen,
    toggleLyrics,
    toggleQueue,
  } = usePlayer();

  const { isLiked, toggleLike } = useSync();

  if (!currentSong) {
    return null;
  }

  const coverUrl = getCoverImageUrl(currentSong.coverFileId, currentSong.audioFileId || currentSong.fileId);
  const songIsLiked = isLiked(currentSong.id);

  return (
    <GlassCard
      variant="dock"
      aria-label="Audio Player"
      className="fixed bottom-0 left-0 right-0 h-[88px] z-40 px-4 md:px-6 flex items-center justify-between select-none !rounded-none"
    >
      {/* 1. Left Section: Song Info & Visualizer */}
      <div className="flex items-center gap-3.5 min-w-0 w-[30%] max-w-[320px]">
        <button
          onClick={toggleFullscreen}
          className="relative w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-white/20 group shadow-2xl bg-[#111412] cursor-pointer"
          title="Open Fullscreen Studio (F)"
        >
          <Image
            src={coverUrl}
            alt={currentSong.title}
            fill
            className={`object-cover group-hover:scale-105 transition-all duration-300 ${
              isLoadingAudio ? 'brightness-75 scale-95 animate-pulse' : ''
            }`}
            unoptimized
          />
          {isLoadingAudio ? (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#b9cbba] animate-spin" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          )}
        </button>

        <div className="min-w-0 flex flex-col justify-center flex-1">
          <div className="flex items-center gap-2">
            <span
              onClick={toggleFullscreen}
              className="text-sm font-semibold text-[#fff8f2] hover:text-[#b9cbba] truncate cursor-pointer transition-colors"
            >
              {currentSong.title}
            </span>
            {isLoadingAudio ? (
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#b9cbba] bg-[#3b4b3e]/60 px-1.5 py-0.5 rounded-full border border-[#b9cbba]/30 animate-pulse flex-shrink-0">
                LOADING
              </span>
            ) : (
              <AudioVisualizer isPlaying={isPlaying} barCount={3} className="hidden sm:flex" />
            )}
          </div>

          <span className="text-xs text-[#a6ada6] truncate mt-0.5">
            {currentSong.artistName}
          </span>
        </div>

        <button
          onClick={() => toggleLike(currentSong.id)}
          className="p-2 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors flex-shrink-0"
          title={songIsLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              songIsLiked ? 'text-[#ee7d77] fill-[#ee7d77]' : ''
            }`}
          />
        </button>
      </div>

      {/* 2. Center Section: Playback Controls & Timeline Bar */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-[580px] px-2 md:px-6">
        {/* Button Controls */}
        <div className="flex items-center gap-3 md:gap-5 mb-1">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors hidden sm:block ${
              isShuffle ? 'text-[#b9cbba] bg-[#3b4b3e]/30' : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="p-1.5 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/10 transition-transform active:scale-95"
            title="Previous (Shift+Left)"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoadingAudio}
            className={`p-2.5 rounded-full bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] shadow-[0_0_16px_rgba(185,203,186,0.4)] transition-all transform hover:scale-105 active:scale-95 ${
              isLoadingAudio ? 'animate-pulse cursor-wait' : 'cursor-pointer'
            }`}
            title={isLoadingAudio ? 'Buffering audio...' : 'Play/Pause (Space)'}
          >
            {isLoadingAudio ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/10 transition-transform active:scale-95"
            title="Next (Shift+Right)"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-full transition-colors hidden sm:block ${
              repeatMode !== 'off' ? 'text-[#b9cbba] bg-[#3b4b3e]/30' : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
            title={`Repeat Mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Timeline Progress */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={seek}
          onSeekingChange={setSeeking}
          showTimestamps
          isLoading={isLoadingAudio}
          className="w-full"
        />
      </div>

      {/* 3. Right Section: Features & Volume */}
      <div className="flex items-center justify-end gap-2 w-[30%] max-w-[320px]">
        <button
          onClick={toggleLyrics}
          className={`p-2 rounded-full transition-colors hidden md:block ${
            lyricsOpen ? 'text-[#b9cbba] bg-[#3b4b3e]/40' : 'text-[#a6ada6] hover:text-[#fff8f2]'
          }`}
          title="Lyrics (L)"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        <button
          onClick={toggleQueue}
          className={`p-2 rounded-full transition-colors hidden md:block ${
            queueOpen ? 'text-[#b9cbba] bg-[#3b4b3e]/40' : 'text-[#a6ada6] hover:text-[#fff8f2]'
          }`}
          title="Queue (Q)"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
          className="hidden lg:flex"
        />

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/10 transition-colors"
          title="Fullscreen Studio (F)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
}
