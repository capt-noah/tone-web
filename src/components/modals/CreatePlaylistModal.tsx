'use client';

import React, { useState } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { useSync } from '@/context/SyncContext';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export function CreatePlaylistModal({ onClose, onCreated }: CreatePlaylistModalProps) {
  const { createPlaylist } = useSync();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Playlist title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newId = await createPlaylist(title.trim(), description.trim() || undefined);
      if (newId) {
        if (onCreated) onCreated(newId);
        onClose();
      } else {
        setError('Failed to create playlist');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-[#111412] border border-white/10 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center">
              <Music className="w-5 h-5 text-[#b9cbba]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#fff8f2]">New Playlist</h3>
              <p className="text-xs text-[#a6ada6]">Curate your music collection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#ee7d77]/20 border border-[#ee7d77]/40 text-xs text-[#ee7d77]">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#fff8f2]">Playlist Name</label>
            <input
              type="text"
              placeholder="e.g. Midnight Ambient, Studio Master..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c211d] border border-white/10 text-sm text-[#fff8f2] placeholder-[#a6ada6]/50 focus:outline-none focus:border-[#b9cbba]"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#fff8f2]">Description (Optional)</label>
            <textarea
              placeholder="Give your playlist a vibe description..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1c211d] border border-white/10 text-sm text-[#fff8f2] placeholder-[#a6ada6]/50 focus:outline-none focus:border-[#b9cbba] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] text-xs font-bold shadow-lg transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Playlist'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
