'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ListMusic, Play } from 'lucide-react';
import { Playlist } from '@/types';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl } from '@/lib/utils';

interface PlaylistCardProps {
  playlist: Playlist;
  className?: string;
}

export function PlaylistCard({ playlist, className = '' }: PlaylistCardProps) {
  const { playSong } = usePlayer();
  const coverUrl = getCoverImageUrl(playlist.coverArt);

  const handlePlayDirect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs, 0);
    }
  };

  return (
    <Link
      href={`/playlist/${playlist.id}`}
      className={`group block p-3.5 rounded-2xl bg-[#111412] border border-white/[0.06] hover:border-white/[0.15] hover:bg-[#161a14] transition-all duration-300 shadow-md select-none ${className}`}
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#1c211d] mb-3 shadow-lg flex items-center justify-center">
        {playlist.coverArt ? (
          <Image
            src={coverUrl}
            alt={playlist.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1c211d] to-[#3b4b3e]/40 flex items-center justify-center">
            <ListMusic className="w-12 h-12 text-[#b9cbba]/50" />
          </div>
        )}

        {/* Floating Play Button */}
        {playlist.songs && playlist.songs.length > 0 && (
          <button
            onClick={handlePlayDirect}
            className="absolute bottom-3 right-3 z-20 w-11 h-11 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
            title="Play Playlist"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        )}
      </div>

      <h4 className="text-sm font-bold text-[#fff8f2] truncate group-hover:text-[#b9cbba] transition-colors">
        {playlist.title}
      </h4>

      <p className="text-xs text-[#a6ada6] truncate mt-0.5">
        {playlist.description || `By ${playlist.ownerUsername || 'You'}`}
      </p>

      <span className="text-[10px] font-mono text-[#a6ada6]/60 mt-1 block">
        {playlist.itemCount || playlist.songs?.length || 0} TRACKS
      </span>
    </Link>
  );
}
