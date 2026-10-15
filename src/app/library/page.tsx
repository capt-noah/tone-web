'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Library,
  Music2,
  Disc3,
  Mic2,
  ListMusic,
  Plus,
  Play,
  ArrowUpDown,
  CloudDownload,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { usePlayer } from '@/context/PlayerContext';
import { TrackRow } from '@/components/shared/TrackRow';
import { AlbumCard } from '@/components/shared/AlbumCard';
import { PlaylistCard } from '@/components/shared/PlaylistCard';
import { CreatePlaylistModal } from '@/components/modals/CreatePlaylistModal';
import { LibrarySkeleton } from '@/components/shared/Skeletons';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

export default function LibraryPage() {
  const { isLoading: isAuthLoading, isMounted } = useAuth();
  const { songs, albums, artists, playlists, isSyncing, isInitialized, isPageLoading, setSyncModalOpen } = useSync();
  const { playSong } = usePlayer();
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums' | 'artists' | 'playlists'>('tracks');
  const [sortOrder, setSortOrder] = useState<'title' | 'artist' | 'plays' | 'date'>('title');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [activeScrubLetter, setActiveScrubLetter] = useState<string | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);

  // Sorted and prepared tracklist
  const sortedSongs = useMemo(() => {
    const list = [...songs];
    if (sortOrder === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOrder === 'artist') {
      list.sort((a, b) => a.artistName.localeCompare(b.artistName));
    } else if (sortOrder === 'plays') {
      list.sort((a, b) => (b.plays || 0) - (a.plays || 0));
    } else if (sortOrder === 'date') {
      list.sort((a, b) => (b.uploadedAt || '').localeCompare(a.uploadedAt || ''));
    }
    return list;
  }, [songs, sortOrder]);

  // Virtualizer for smooth 60fps rendering of large libraries
  const rowVirtualizer = useVirtualizer({
    count: sortedSongs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 58,
    overscan: 8,
  });

  // Jump to specific alphabet letter
  const handleJumpToLetter = (letter: string) => {
    setActiveScrubLetter(letter);
    let targetIdx = -1;

    if (letter === '#') {
      targetIdx = sortedSongs.findIndex((s) => /^[0-9]/.test(s.title));
    } else {
      targetIdx = sortedSongs.findIndex((s) =>
        s.title.toUpperCase().startsWith(letter)
      );
    }

    if (targetIdx !== -1 && parentRef.current) {
      rowVirtualizer.scrollToIndex(targetIdx, { align: 'start' });
    }
  };

  // If loading session, navigating, uninitialized, or initial sync in progress with empty cache -> show shimmer skeleton
  if (!isMounted || isAuthLoading || isPageLoading || !isInitialized || (isSyncing && songs.length === 0)) {
    return <LibrarySkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Library Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Library className="w-6 h-6 text-[#b9cbba]" />
            <h2 className="text-2xl sm:text-3xl font-black text-[#fff8f2] tracking-tight">
              Your Library
            </h2>
          </div>
          <p className="text-xs text-[#a6ada6] mt-0.5">
            {songs.length} audio files • {albums.length} albums • {playlists.length} playlists
          </p>
        </div>

        <div className="flex items-center gap-2">
          {songs.length > 0 && (
            <button
              onClick={() => playSong(sortedSongs[0], sortedSongs, 0)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Play Library</span>
            </button>
          )}

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1c211d] hover:bg-white/10 border border-white/10 text-[#fff8f2] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#b9cbba]" />
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08]">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'tracks'
                ? 'bg-[#b9cbba] text-[#0d0f0d] font-bold shadow-sm'
                : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Tracks ({songs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('albums')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'albums'
                ? 'bg-[#b9cbba] text-[#0d0f0d] font-bold shadow-sm'
                : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
          >
            <Disc3 className="w-3.5 h-3.5" />
            <span>Albums ({albums.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'artists'
                ? 'bg-[#b9cbba] text-[#0d0f0d] font-bold shadow-sm'
                : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Artists ({artists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'playlists'
                ? 'bg-[#b9cbba] text-[#0d0f0d] font-bold shadow-sm'
                : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlists ({playlists.length})</span>
          </button>
        </div>

        {activeTab === 'tracks' && (
          <div className="flex items-center gap-2 text-xs text-[#a6ada6]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#b9cbba]" />
            <span>Sort by:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-[#1c211d] border border-white/10 text-[#fff8f2] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#b9cbba]"
            >
              <option value="title">Title (A-Z)</option>
              <option value="artist">Artist Name</option>
              <option value="plays">Most Played</option>
              <option value="date">Date Added</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Areas */}
      {activeTab === 'tracks' && (
        <div className="relative flex gap-2">
          {/* Virtualized List Container */}
          <div
            ref={parentRef}
            className="flex-1 h-[600px] overflow-y-auto pr-2 space-y-1 bg-[#111412]/40 p-2 rounded-2xl border border-white/[0.06]"
          >
            {sortedSongs.length === 0 ? (
              <div className="py-20 text-center text-[#a6ada6]">
                No tracks found in your library.
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const song = sortedSongs[virtualRow.index];
                  return (
                    <div
                      key={song.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <TrackRow
                        song={song}
                        index={virtualRow.index}
                        queueContext={sortedSongs}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kinetic A-Z Alphabet Scrubber */}
          <div className="hidden sm:flex flex-col items-center justify-between py-2 px-1 bg-[#111412]/80 rounded-2xl border border-white/[0.08] select-none h-[600px]">
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                onClick={() => handleJumpToLetter(letter)}
                className={`text-[9px] font-mono transition-all px-1 py-0.5 rounded ${
                  activeScrubLetter === letter
                    ? 'text-[#0d0f0d] bg-[#b9cbba] font-bold scale-125'
                    : 'text-[#a6ada6] hover:text-[#fff8f2] hover:scale-125'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'albums' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}

      {activeTab === 'artists' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {artists.map((artist) => (
            <div
              key={artist.name}
              onClick={() => playSong(artist.songs[0], artist.songs, 0)}
              className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#111412] hover:bg-[#1c211d] border border-white/[0.06] hover:border-white/[0.15] transition-all cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#3b4b3e] flex items-center justify-center font-bold text-sm text-[#b9cbba] flex-shrink-0">
                  {artist.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[#fff8f2] truncate group-hover:text-[#b9cbba] transition-colors">
                    {artist.name}
                  </h4>
                  <p className="text-xs text-[#a6ada6] mt-0.5">
                    {artist.songs.length} {artist.songs.length === 1 ? 'Track' : 'Tracks'}
                  </p>
                </div>
              </div>

              <button className="w-9 h-9 rounded-full bg-[#b9cbba] text-[#0d0f0d] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'playlists' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}

      {createModalOpen && (
        <CreatePlaylistModal onClose={() => setCreateModalOpen(false)} />
      )}
    </div>
  );
}
