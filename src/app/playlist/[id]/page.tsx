'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ListMusic,
  Play,
  Shuffle,
  Plus,
  Trash2,
  Calendar,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { usePlayer } from '@/context/PlayerContext';
import { api } from '@/lib/api';
import { Playlist, Song } from '@/types';
import { getCoverImageUrl, formatDate } from '@/lib/utils';
import { TrackRow } from '@/components/shared/TrackRow';
import { AddSongsModal } from '@/components/modals/AddSongsModal';
import { AlbumPlaylistSkeleton } from '@/components/shared/Skeletons';

export default function PlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { sessionId, isLoading: isAuthLoading, isMounted } = useAuth();
  const { deletePlaylist, isPageLoading } = useSync();
  const { playSong, toggleShuffle } = usePlayer();

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchPlaylistData = useCallback(async () => {
    if (!sessionId || !resolvedParams.id) return;
    try {
      setIsLoading(true);
      const data = await api.getPlaylist(sessionId, resolvedParams.id);
      setPlaylist(data);
    } catch (err) {
      console.error('Failed to load playlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, resolvedParams.id]);

  useEffect(() => {
    fetchPlaylistData();
  }, [fetchPlaylistData]);

  const handleDelete = async () => {
    if (!playlist || !confirm(`Are you sure you want to delete "${playlist.title}"?`)) return;
    const ok = await deletePlaylist(playlist.id);
    if (ok) {
      router.push('/library');
    }
  };

  const handlePlayAll = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs, 0);
    }
  };

  const handleShufflePlay = () => {
    if (playlist && playlist.songs && playlist.songs.length > 0) {
      toggleShuffle();
      const rand = Math.floor(Math.random() * playlist.songs.length);
      playSong(playlist.songs[rand], playlist.songs, rand);
    }
  };

  if (!isMounted || isAuthLoading || isPageLoading || isLoading) {
    return <AlbumPlaylistSkeleton type="playlist" />;
  }

  if (!playlist) {
    return (
      <div className="py-24 text-center text-sm text-[#a6ada6]">
        Playlist not found or has been removed.
      </div>
    );
  }

  const songsList: Song[] = playlist.songs || [];

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Playlist Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#1c211d] via-[#111412] to-[#0d0f0d] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-[#1c211d] border border-white/15 flex items-center justify-center shadow-xl flex-shrink-0">
            {playlist.coverArt ? (
              <Image
                src={getCoverImageUrl(playlist.coverArt)}
                alt={playlist.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <ListMusic className="w-14 h-14 text-[#b9cbba]/50" />
            )}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase block">
              Playlist Collection
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#fff8f2] tracking-tight">
              {playlist.title}
            </h2>
            {playlist.description && (
              <p className="text-xs text-[#a6ada6] max-w-md">{playlist.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#a6ada6] pt-1">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#b9cbba]" />
                <span>{playlist.ownerUsername || 'You'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(playlist.createdAt)}</span>
              </span>
              <span>•</span>
              <span className="font-mono text-[#fff8f2]">
                {songsList.length} {songsList.length === 1 ? 'TRACK' : 'TRACKS'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {songsList.length > 0 && (
            <>
              <button
                onClick={handleShufflePlay}
                className="p-3 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-[#fff8f2] transition-colors"
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4 text-[#b9cbba]" />
              </button>

              <button
                onClick={handlePlayAll}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-[0_0_20px_rgba(185,203,186,0.35)] transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Play</span>
              </button>
            </>
          )}

          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-xs font-semibold text-[#fff8f2] transition-colors"
          >
            <Plus className="w-4 h-4 text-[#b9cbba]" />
            <span>Add Tracks</span>
          </button>

          <button
            onClick={handleDelete}
            className="p-3 rounded-2xl bg-[#1c211d] hover:bg-[#ee7d77]/20 border border-white/10 hover:border-[#ee7d77]/40 text-[#a6ada6] hover:text-[#ee7d77] transition-colors"
            title="Delete Playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Playlist Songs List */}
      <section className="space-y-2">
        {songsList.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-[#111412] border border-white/[0.06] space-y-3">
            <ListMusic className="w-10 h-10 text-white/20 mx-auto" />
            <p className="text-sm font-semibold text-[#fff8f2]">This playlist is empty</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#b9cbba] text-[#0d0f0d] text-xs font-bold shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tracks Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-1 bg-[#111412]/50 p-3 rounded-2xl border border-white/[0.06]">
            {songsList.map((song, idx) => (
              <TrackRow
                key={`${song.id}-${idx}`}
                song={song}
                index={idx}
                queueContext={songsList}
              />
            ))}
          </div>
        )}
      </section>

      {addModalOpen && (
        <AddSongsModal
          playlist={playlist}
          onClose={() => setAddModalOpen(false)}
          onUpdated={fetchPlaylistData}
        />
      )}
    </div>
  );
}
