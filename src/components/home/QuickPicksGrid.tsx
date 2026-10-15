'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Flame, Loader2 } from 'lucide-react';
import { Song } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl } from '@/lib/utils';
import { AudioVisualizer } from '../player/AudioVisualizer';

interface QuickPicksGridProps {
  songs: Song[];
  title?: string;
}

export function QuickPicksGrid({ songs, title = 'Quick Picks' }: QuickPicksGridProps) {
  const { currentSong, isPlaying, isLoadingAudio, playSong, togglePlay } = usePlayer();

  if (!songs || songs.length === 0) return null;

  // Display top 6 or 8 items in a 2-column or 3-column quick grid
  const items = songs.slice(0, 8);

  return (
    <section className="space-y-4 mb-10 select-none">
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-[#ee7d77]" />
        <h3 className="text-xl font-bold tracking-tight text-[#fff8f2]">{title}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((song, idx) => {
          const isCurrent = currentSong?.id === song.id;

          const handleClick = () => {
            if (isCurrent) {
              togglePlay();
            } else {
              playSong(song, songs, idx);
            }
          };

          return (
            <div
              key={song.id || idx}
              onClick={handleClick}
              className={`group flex items-center gap-3 p-2 rounded-2xl bg-[#111412] hover:bg-[#1c211d] border border-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer shadow-sm ${
                isCurrent ? 'bg-[#212722] border-[#b9cbba]/30' : ''
              }`}
            >
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#1c211d] shadow-md">
                <Image
                  src={getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId)}
                  alt={song.title}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform ${
                    isCurrent && isLoadingAudio ? 'brightness-75 animate-pulse' : ''
                  }`}
                  unoptimized
                />
                <div
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                    isCurrent && isLoadingAudio
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {isCurrent && isLoadingAudio ? (
                    <Loader2 className="w-4 h-4 text-[#b9cbba] animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 text-[#b9cbba] fill-current" />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#b9cbba]' : 'text-[#fff8f2]'}`}>
                    {song.title}
                  </p>
                  {isCurrent && isLoadingAudio && (
                    <span className="text-[8px] font-mono font-bold tracking-wider text-[#b9cbba] bg-[#3b4b3e]/70 px-1 py-0.2 rounded-full border border-[#b9cbba]/30 animate-pulse flex-shrink-0">
                      LOADING
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#a6ada6] truncate mt-0.5">
                  {song.artistName}
                </p>
              </div>

              {isCurrent && (
                <div className="pr-2">
                  {isLoadingAudio ? (
                    <Loader2 className="w-4 h-4 text-[#b9cbba] animate-spin" />
                  ) : (
                    <AudioVisualizer isPlaying={isPlaying} barCount={3} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
