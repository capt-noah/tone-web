'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Sparkles } from 'lucide-react';
import { Song } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl } from '@/lib/utils';

interface ShuffleCarouselProps {
  songs: Song[];
  title?: string;
  subtitle?: string;
}

export function ShuffleCarousel({
  songs,
  title = 'Spotlight Rotation',
  subtitle = 'Curated tracks and top rotation albums',
}: ShuffleCarouselProps) {
  const { playSong } = usePlayer();

  if (!songs || songs.length === 0) return null;

  return (
    <section className="space-y-4 mb-10 select-none">
      <div className="flex items-end justify-between px-1">
        <div>
          <div className="flex items-center gap-2 text-[#b9cbba] text-xs font-mono tracking-widest uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Featured Selection</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight text-[#fff8f2]">{title}</h3>
          <p className="text-xs text-[#a6ada6] mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory">
        {songs.slice(0, 10).map((song, idx) => (
          <div
            key={song.id || idx}
            onClick={() => playSong(song, songs, idx)}
            className="group relative flex-shrink-0 w-44 sm:w-52 p-3.5 rounded-2xl bg-[#111412] border border-white/[0.06] hover:border-white/[0.15] hover:bg-[#161a14] transition-all duration-300 shadow-md cursor-pointer snap-start"
          >
            {/* Artwork */}
            <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#1c211d] mb-3 shadow-lg">
              <Image
                src={getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId)}
                alt={song.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                unoptimized
              />

              {/* Hover Overlay Play Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <div className="w-12 h-12 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center shadow-[0_0_20px_rgba(185,203,186,0.6)] transform group-hover:scale-110 active:scale-95 transition-transform">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-[#fff8f2] truncate group-hover:text-[#b9cbba] transition-colors">
              {song.title}
            </h4>
            <p className="text-xs text-[#a6ada6] truncate mt-0.5">
              {song.artistName}
            </p>
            <span className="text-[10px] font-mono text-[#a6ada6]/60 mt-1 block">
              {song.albumTitle || 'SINGLE'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
