'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { X, Search, Plus, Check, ListMusic, Music2 } from 'lucide-react';
import { Song } from '@/types';
import { useSync } from '@/context/SyncContext';
import { usePlayer } from '@/context/PlayerContext';
import { getCoverImageUrl, formatTime } from '@/lib/utils';
import { GlassCard } from '../shared/GlassCard';

interface AddToQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddToQueueModal({ isOpen, onClose }: AddToQueueModalProps) {
  const { songs } = useSync();
  const { addToQueue, queue } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());

  // Reset search when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setRecentlyAddedIds(new Set());
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredSongs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return songs;
    return songs.filter((s) => {
      return (
        s.title.toLowerCase().includes(q) ||
        s.artistName.toLowerCase().includes(q) ||
        (s.albumTitle && s.albumTitle.toLowerCase().includes(q))
      );
    });
  }, [songs, searchQuery]);

  const handleAdd = (song: Song) => {
    addToQueue(song);
    setRecentlyAddedIds((prev) => new Set(prev).add(song.id));
    setTimeout(() => {
      setRecentlyAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(song.id);
        return next;
      });
    }, 2000);
  };

  const handleAddAll = () => {
    if (filteredSongs.length === 0) return;
    addToQueue(filteredSongs);
    const newAdded = new Set(filteredSongs.map((s) => s.id));
    setRecentlyAddedIds(newAdded);
    setTimeout(() => {
      setRecentlyAddedIds(new Set());
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <GlassCard
        variant="panel"
        className="relative w-full max-w-lg rounded-3xl bg-[#111412] border border-white/10 p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] z-10 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center text-[#b9cbba]">
              <ListMusic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#fff8f2]">Add to Queue</h3>
              <p className="text-xs text-[#a6ada6]">
                {queue.length} {queue.length === 1 ? 'track' : 'tracks'} currently in queue
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Quick Action */}
        <div className="py-4 space-y-2.5">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#a6ada6]" />
            <input
              type="text"
              placeholder="Search by title, artist, or album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#1c211d] border border-white/10 text-sm text-[#fff8f2] placeholder-[#a6ada6]/50 focus:outline-none focus:border-[#b9cbba] transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {filteredSongs.length > 0 && searchQuery && (
            <div className="flex items-center justify-between px-1 text-xs text-[#a6ada6]">
              <span>Found {filteredSongs.length} tracks</span>
              <button
                onClick={handleAddAll}
                className="text-xs font-semibold text-[#b9cbba] hover:underline cursor-pointer"
              >
                + Add All to Queue
              </button>
            </div>
          )}
        </div>

        {/* Track List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[260px] max-h-[420px]">
          {filteredSongs.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#a6ada6] space-y-2">
              <Music2 className="w-8 h-8 text-[#a6ada6]/40 mx-auto mb-2" />
              <p>No tracks found matching &quot;{searchQuery}&quot;</p>
              <p className="text-[10px] font-mono text-white/30">TRY ANOTHER SEARCH TERM</p>
            </div>
          ) : (
            filteredSongs.map((song) => {
              const isRecentlyAdded = recentlyAddedIds.has(song.id);
              const coverUrl = getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId);

              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#1c211d]/40 hover:bg-[#1c211d] border border-transparent hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#0d0f0d] shadow-sm">
                      <Image
                        src={coverUrl}
                        alt={song.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#fff8f2] truncate group-hover:text-[#b9cbba] transition-colors">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-[#a6ada6] truncate">
                        {song.artistName}
                        {song.albumTitle ? ` • ${song.albumTitle}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className="text-[10px] font-mono text-[#a6ada6] tabular-nums">
                      {typeof song.durationSec === 'number'
                        ? formatTime(song.durationSec)
                        : song.duration || ''}
                    </span>

                    <button
                      onClick={() => handleAdd(song)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        isRecentlyAdded
                          ? 'bg-[#34c759]/20 text-[#34c759] border border-[#34c759]/40'
                          : 'bg-white/5 hover:bg-[#b9cbba] text-[#a6ada6] hover:text-[#0d0f0d] hover:font-bold'
                      }`}
                    >
                      {isRecentlyAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#34c759]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-xs text-[#a6ada6]">
            {songs.length} total tracks in your library
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
