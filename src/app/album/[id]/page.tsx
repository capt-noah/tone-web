'use client';

import React, { useMemo, use } from 'react';
import Image from 'next/image';
import { Disc3, Play, Shuffle, Mic2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl, formatTime } from '@/lib/utils';
import { TrackRow } from '@/components/shared/TrackRow';
import { AlbumPlaylistSkeleton } from '@/components/shared/Skeletons';

export default function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { isLoading: isAuthLoading, isMounted } = useAuth();
  const { albums, isSyncing, isInitialized, isPageLoading } = useSync();
  const { playSong, toggleShuffle } = usePlayer();

  const album = useMemo(() => {
    const rawId = resolvedParams.id;
    let decodedId = rawId;
    try {
      decodedId = decodeURIComponent(rawId);
    } catch {
      // ignore
    }
    const lowerDecoded = decodedId.toLowerCase();
    const lowerRaw = rawId.toLowerCase();

    return albums.find((a) => {
      const aId = a.id.toLowerCase();
      const aTitle = a.title.toLowerCase();
      return (
        a.id === rawId ||
        a.id === decodedId ||
        aId === lowerDecoded ||
        aId === lowerRaw ||
        aTitle === lowerDecoded
      );
    });
  }, [albums, resolvedParams.id]);

  const totalDuration = useMemo(() => {
    if (!album) return 0;
    return album.songs.reduce((sum, s) => sum + (s.durationSec || 0), 0);
  }, [album]);

  if (!isMounted || isAuthLoading || isPageLoading || !isInitialized || (isSyncing && !album)) {
    return <AlbumPlaylistSkeleton type="album" />;
  }

  if (!album) {
    return (
      <div className="py-24 text-center text-sm text-[#a6ada6]">
        Album not found or empty.
      </div>
    );
  }

  const coverUrl = getCoverImageUrl(
    album.coverFileId,
    album.songs[0]?.audioFileId || album.songs[0]?.fileId
  );

  const handlePlayAll = () => {
    if (album.songs.length > 0) {
      playSong(album.songs[0], album.songs, 0);
    }
  };

  const handleShufflePlay = () => {
    if (album.songs.length > 0) {
      toggleShuffle();
      const rand = Math.floor(Math.random() * album.songs.length);
      playSong(album.songs[rand], album.songs, rand);
    }
  };

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Album Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#1c211d] via-[#111412] to-[#0d0f0d] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Vinyl Sleeve Art Box */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-[#1c211d] border border-white/15 shadow-2xl flex-shrink-0">
            <Image
              src={coverUrl}
              alt={album.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Disc3 className="w-4 h-4 text-[#b9cbba]" />
              <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase block">
                Album Master
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-[#fff8f2] tracking-tight">
              {album.title}
            </h2>

            <div className="flex items-center gap-2 text-sm text-[#b9cbba] font-medium">
              <Mic2 className="w-3.5 h-3.5" />
              <span>{album.artistName}</span>
            </div>

            <p className="text-xs text-[#a6ada6] font-mono">
              {album.songs.length} {album.songs.length === 1 ? 'TRACK' : 'TRACKS'} • {formatTime(totalDuration)}
            </p>
          </div>
        </div>

        {/* Play Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShufflePlay}
            className="p-3 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-[#fff8f2] transition-colors"
            title="Shuffle Album"
          >
            <Shuffle className="w-4 h-4 text-[#b9cbba]" />
          </button>

          <button
            onClick={handlePlayAll}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-[0_0_20px_rgba(185,203,186,0.35)] transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
            <span>Play Album</span>
          </button>
        </div>
      </div>

      {/* Album Tracks List */}
      <section className="space-y-2">
        <div className="space-y-1 bg-[#111412]/50 p-3 rounded-2xl border border-white/[0.06]">
          {album.songs.map((song, idx) => (
            <TrackRow
              key={song.id}
              song={song}
              index={idx}
              showAlbum={false}
              queueContext={album.songs}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
