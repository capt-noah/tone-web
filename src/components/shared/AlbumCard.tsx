'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { Album } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl } from '@/lib/utils';

interface AlbumCardProps {
  album: Album;
  className?: string;
}

export function AlbumCard({ album, className = '' }: AlbumCardProps) {
  const { playSong } = usePlayer();
  const coverUrl = getCoverImageUrl(
    album.coverFileId,
    album.songs[0]?.audioFileId || album.songs[0]?.fileId
  );

  const handlePlayDirect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (album.songs.length > 0) {
      playSong(album.songs[0], album.songs, 0);
    }
  };

  return (
    <Link
      href={`/album/${encodeURIComponent(album.id)}`}
      className={`group block p-3.5 rounded-2xl bg-[#111412] border border-white/[0.06] hover:border-white/[0.15] hover:bg-[#161a14] transition-all duration-300 shadow-md select-none ${className}`}
    >
      {/* Vinyl Jacket with Slide-out vinyl on hover */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#1c211d] mb-3 shadow-lg">
        {/* Behind Vinyl Disk */}
        <div className="absolute inset-0 rounded-full bg-[#1c211d] border-2 border-[#212722] opacity-0 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-500 flex items-center justify-center -z-0">
          <div className="w-12 h-12 rounded-full border border-white/10 bg-[#b9cbba]/20" />
        </div>

        {/* Cover Art */}
        <Image
          src={coverUrl}
          alt={album.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 z-10"
          unoptimized
        />

        {/* Floating Quick Play Button */}
        <button
          onClick={handlePlayDirect}
          className="absolute bottom-3 right-3 z-20 w-11 h-11 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
          title="Play Album"
        >
          <Play className="w-5 h-5 fill-current ml-0.5" />
        </button>
      </div>

      <h4 className="text-sm font-bold text-[#fff8f2] truncate group-hover:text-[#b9cbba] transition-colors">
        {album.title}
      </h4>

      <p className="text-xs text-[#a6ada6] truncate mt-0.5">
        {album.artistName}
      </p>

      <span className="text-[10px] font-mono text-[#a6ada6]/60 mt-1 block">
        {album.songs.length} {album.songs.length === 1 ? 'TRACK' : 'TRACKS'}
      </span>
    </Link>
  );
}
