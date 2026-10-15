'use client';

import React, { useMemo } from 'react';
import { Heart, Play, Shuffle, Music2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { usePlayer } from '@/context/PlayerContext';
import { TrackRow } from '@/components/shared/TrackRow';
import { formatTime } from '@/lib/utils';
import { FavoritesSkeleton } from '@/components/shared/Skeletons';

export default function FavoritesPage() {
  const { isLoading: isAuthLoading, isMounted } = useAuth();
  const { songs, likedSongIds, isSyncing, isInitialized, isPageLoading } = useSync();
  const { playSong, toggleShuffle } = usePlayer();

  const favoriteSongs = useMemo(() => {
    return songs.filter((s) => likedSongIds.has(s.id));
  }, [songs, likedSongIds]);

  const totalDurationSec = useMemo(() => {
    return favoriteSongs.reduce((sum, s) => sum + (s.durationSec || 0), 0);
  }, [favoriteSongs]);

  const handlePlayAll = () => {
    if (favoriteSongs.length > 0) {
      playSong(favoriteSongs[0], favoriteSongs, 0);
    }
  };

  const handleShufflePlay = () => {
    if (favoriteSongs.length > 0) {
      toggleShuffle();
      const randomIndex = Math.floor(Math.random() * favoriteSongs.length);
      playSong(favoriteSongs[randomIndex], favoriteSongs, randomIndex);
    }
  };

  if (!isMounted || isAuthLoading || isPageLoading || !isInitialized || (isSyncing && songs.length === 0)) {
    return <FavoritesSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Hero Blurred Collection Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-br from-[#3b4b3e]/40 via-[#1c211d] to-[#111412] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          {/* Glowing Heart Collection Icon Box */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-[#ee7d77]/30 to-[#3b4b3e] border border-white/15 flex items-center justify-center shadow-[0_0_30px_rgba(238,125,119,0.3)] flex-shrink-0">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-[#ee7d77] fill-[#ee7d77]" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase block">
              Curated Collection
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#fff8f2] tracking-tight">
              Liked Songs
            </h2>
            <p className="text-xs text-[#a6ada6]">
              {favoriteSongs.length} {favoriteSongs.length === 1 ? 'Track' : 'Tracks'} • {formatTime(totalDurationSec)} of music
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        {favoriteSongs.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleShufflePlay}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#fff8f2] transition-colors"
            >
              <Shuffle className="w-4 h-4 text-[#b9cbba]" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-[0_0_20px_rgba(185,203,186,0.35)] transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Play All</span>
            </button>
          </div>
        )}
      </div>

      {/* Liked Tracks List */}
      <section className="space-y-2">
        {favoriteSongs.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-[#111412] border border-white/[0.06] space-y-3">
            <Music2 className="w-10 h-10 text-white/20 mx-auto" />
            <p className="text-sm font-semibold text-[#fff8f2]">No liked songs yet</p>
            <p className="text-xs text-[#a6ada6] max-w-sm mx-auto">
              Tap the heart icon on any song across Tone to save your favorite tracks to this collection.
            </p>
          </div>
        ) : (
          <div className="space-y-1 bg-[#111412]/50 p-3 rounded-2xl border border-white/[0.06]">
            {favoriteSongs.map((song, idx) => (
              <TrackRow
                key={song.id}
                song={song}
                index={idx}
                queueContext={favoriteSongs}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
