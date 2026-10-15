'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Play,
  Pause,
  Heart,
  MoreHorizontal,
  ListPlus,
  PlaySquare,
  Plus,
  Mic2,
  Loader2,
  Download,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { Song } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { useSync } from '@/context/SyncContext';
import { useDesktop } from '@/context/DesktopContext';
import { getCoverImageUrl, formatTime } from '@/lib/utils';
import { AudioVisualizer } from '../player/AudioVisualizer';
import { EditLyricsModal } from '../modals/EditLyricsModal';

interface TrackRowProps {
  song: Song;
  index?: number;
  queueContext?: Song[];
  showAlbum?: boolean;
  onAddToPlaylist?: (song: Song) => void;
  className?: string;
}

export function TrackRow({
  song,
  index,
  queueContext,
  showAlbum = true,
  onAddToPlaylist,
  className = '',
}: TrackRowProps) {
  const { currentSong, isPlaying, isLoadingAudio, playSong, togglePlay, addToQueue, playNext } = usePlayer();
  const { isLiked, toggleLike } = useSync();
  const { isDesktop, isDownloaded, downloadTrack, deleteDownload, isDownloading } = useDesktop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lyricsModalOpen, setLyricsModalOpen] = useState(false);

  const isCurrent = currentSong?.id === song.id;
  const songIsLiked = isLiked(song.id);
  const downloaded = isDesktop && isDownloaded(song.id);
  const downloading = isDesktop && isDownloading[song.id];
  const coverUrl = getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId);

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, queueContext || [song], index !== undefined ? index : 0);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#1c211d]/70 transition-all select-none border border-transparent hover:border-white/[0.05] ${
        isCurrent ? 'bg-[#212722]/90 border-white/10' : ''
      } ${className}`}
    >
      {/* 1. Left Section: Index / Play Icon + Cover + Title + Artist */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
        {/* Index or Equalizer / Play button */}
        <div className="w-6 flex items-center justify-center flex-shrink-0">
          {isCurrent ? (
            <div onClick={handlePlayClick} className="cursor-pointer">
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 text-[#b9cbba] animate-spin" />
              ) : isPlaying ? (
                <AudioVisualizer isPlaying={isPlaying} barCount={3} />
              ) : (
                <Play className="w-4 h-4 text-[#b9cbba] fill-current" />
              )}
            </div>
          ) : (
            <>
              {index !== undefined ? (
                <span className="text-xs font-mono text-[#a6ada6] group-hover:hidden tabular-nums">
                  {index + 1}
                </span>
              ) : null}
              <button
                onClick={handlePlayClick}
                className={`p-1 text-[#fff8f2] hover:text-[#b9cbba] transition-colors ${
                  index !== undefined ? 'hidden group-hover:flex' : 'flex'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail */}
        <div
          onClick={handlePlayClick}
          className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#111412] cursor-pointer group/thumb shadow-sm"
        >
          <Image
            src={coverUrl}
            alt={song.title}
            fill
            className={`object-cover group-hover/thumb:scale-105 transition-transform ${
              isCurrent && isLoadingAudio ? 'brightness-75 animate-pulse' : ''
            }`}
            unoptimized
          />
          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
              isCurrent && isLoadingAudio
                ? 'opacity-100'
                : 'opacity-0 group-hover/thumb:opacity-100'
            }`}
          >
            {isCurrent && isLoadingAudio ? (
              <Loader2 className="w-3.5 h-3.5 text-[#b9cbba] animate-spin" />
            ) : isCurrent && isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-white fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 text-white fill-current" />
            )}
          </div>
        </div>

        {/* Text Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              onClick={handlePlayClick}
              className={`text-sm font-medium truncate cursor-pointer transition-colors ${
                isCurrent ? 'text-[#b9cbba] font-bold' : 'text-[#fff8f2] group-hover:text-[#fff8f2]'
              }`}
            >
              {song.title}
            </p>
            {isCurrent && isLoadingAudio && (
              <span className="text-[9px] font-mono font-bold tracking-wider text-[#b9cbba] bg-[#3b4b3e]/70 px-1.5 py-0.5 rounded-full border border-[#b9cbba]/30 animate-pulse flex-shrink-0">
                LOADING
              </span>
            )}
          </div>
          <p className="text-xs text-[#a6ada6] truncate mt-0.5">
            {song.artistName}
          </p>
        </div>
      </div>

      {/* 2. Middle Section: Album Title (Desktop) */}
      {showAlbum && (
        <div className="hidden md:block w-1/3 min-w-0 px-4">
          <p className="text-xs text-[#a6ada6] truncate">
            {song.albumTitle || '-'}
          </p>
        </div>
      )}

      {/* 3. Right Section: Desktop Download + Like + Duration + More Menu */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Desktop Download Status / Action Button */}
        {isDesktop && (
          <div>
            {song.isLocalOnly ? (
              <span
                className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-[#b9cbba] border border-white/10"
                title="Sideloaded in ~/Music/Tone/Locals"
              >
                LOCAL
              </span>
            ) : downloaded ? (
              <button
                onClick={() => deleteDownload(song.id)}
                className="p-1 rounded-full text-[#b9cbba] hover:text-[#ee7d77] hover:bg-[#ee7d77]/20 transition-colors cursor-pointer"
                title="Downloaded to Mac disk (Click to remove local copy)"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            ) : downloading ? (
              <Loader2 className="w-3.5 h-3.5 text-[#b9cbba] animate-spin" />
            ) : (
              <button
                onClick={() => downloadTrack(song)}
                className="p-1 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Download for physical offline playback"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => toggleLike(song.id)}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title={songIsLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              songIsLiked
                ? 'text-[#ee7d77] fill-[#ee7d77]'
                : 'text-transparent group-hover:text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
          />
        </button>

        <span className="text-xs font-mono text-[#a6ada6] tabular-nums w-10 text-right">
          {typeof song.durationSec === 'number'
            ? formatTime(song.durationSec)
            : song.duration || '--:--'}
        </span>

        {/* Context More Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-50 w-48 glass-panel rounded-xl shadow-2xl p-1.5 border border-white/10 space-y-0.5 animate-in fade-in duration-150">
                <button
                  onClick={() => {
                    playNext(song);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#fff8f2] hover:bg-white/10 transition-colors"
                >
                  <PlaySquare className="w-3.5 h-3.5 text-[#b9cbba]" />
                  <span>Play Next</span>
                </button>

                <button
                  onClick={() => {
                    addToQueue(song);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#fff8f2] hover:bg-white/10 transition-colors"
                >
                  <ListPlus className="w-3.5 h-3.5 text-[#b9cbba]" />
                  <span>Add to Queue</span>
                </button>

                <button
                  onClick={() => {
                    setLyricsModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#fff8f2] hover:bg-white/10 transition-colors"
                >
                  <Mic2 className="w-3.5 h-3.5 text-[#b9cbba]" />
                  <span>Lyrics / Edit...</span>
                </button>

                {onAddToPlaylist && (
                  <button
                    onClick={() => {
                      onAddToPlaylist(song);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#fff8f2] hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#b9cbba]" />
                    <span>Add to Playlist...</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <EditLyricsModal
        isOpen={lyricsModalOpen}
        onClose={() => setLyricsModalOpen(false)}
        song={song}
      />
    </div>
  );
}
