'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Search, Check, Plus } from 'lucide-react';
import { Song, Playlist } from '@/types';
import { useSync } from '@/context/SyncContext';
import { getCoverImageUrl } from '@/lib/utils';

interface AddSongsModalProps {
  playlist: Playlist;
  onClose: () => void;
  onUpdated?: () => void;
}

export function AddSongsModal({ playlist, onClose, onUpdated }: AddSongsModalProps) {
  const { songs, addSongToPlaylist, removeSongFromPlaylist } = useSync();
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Set of song IDs already in the playlist
  const existingSongIds = new Set((playlist.songs || []).map((s) => s.id));

  const filteredSongs = songs.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.artistName.toLowerCase().includes(q) ||
      (s.albumTitle && s.albumTitle.toLowerCase().includes(q))
    );
  });

  const handleToggle = async (song: Song) => {
    setProcessingId(song.id);
    try {
      if (existingSongIds.has(song.id)) {
        await removeSongFromPlaylist(playlist.id, song.id);
      } else {
        await addSongToPlaylist(playlist.id, song.id);
      }
      if (onUpdated) onUpdated();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111412] border border-white/10 p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <h3 className="text-lg font-bold text-[#fff8f2]">Add Tracks</h3>
            <p className="text-xs text-[#a6ada6]">Managing playlist: {playlist.title}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="py-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-[#a6ada6]" />
            <input
              type="text"
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1c211d] border border-white/10 text-sm text-[#fff8f2] placeholder-[#a6ada6]/50 focus:outline-none focus:border-[#b9cbba]"
              autoFocus
            />
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[300px]">
          {filteredSongs.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#a6ada6]">
              No tracks found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredSongs.map((song) => {
              const isInPlaylist = existingSongIds.has(song.id);
              const isProcessing = processingId === song.id;

              return (
                <div
                  key={song.id}
                  onClick={() => !isProcessing && handleToggle(song)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isInPlaylist
                      ? 'bg-[#3b4b3e]/30 border-[#b9cbba]/30'
                      : 'bg-[#1c211d]/50 hover:bg-[#1c211d] border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#0d0f0d]">
                      <Image
                        src={getCoverImageUrl(song.coverFileId, song.fileId)}
                        alt={song.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#fff8f2] truncate">
                        {song.title}
                      </p>
                      <p className="text-[11px] text-[#a6ada6] truncate">
                        {song.artistName}
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={isProcessing}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                      isInPlaylist
                        ? 'bg-[#b9cbba] text-[#0d0f0d] font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2]'
                    }`}
                  >
                    {isInPlaylist ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Add</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
