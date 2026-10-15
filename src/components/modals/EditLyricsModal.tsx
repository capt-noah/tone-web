'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Sparkles, Clock, Save, Trash2, Check, Music2, FileText } from 'lucide-react';
import { Song } from '@/types';
import { searchLyricsCandidates, LrclibTrackResult, formatLrcTimestamp } from '@/lib/lyrics';
import { useSync } from '@/context/SyncContext';
import { usePlayer } from '@/context/PlayerContext';

interface EditLyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

export function EditLyricsModal({ isOpen, onClose, song }: EditLyricsModalProps) {
  const { updateSongLyrics } = useSync();
  const { currentTime } = usePlayer();

  const [activeTab, setActiveTab] = useState<'search' | 'editor'>('search');
  
  // Search state
  const [searchTitle, setSearchTitle] = useState('');
  const [searchArtist, setSearchArtist] = useState('');
  const [searchResults, setSearchResults] = useState<LrclibTrackResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Editor state
  const [lyricsText, setLyricsText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen && song) {
      setSearchTitle(song.title || '');
      setSearchArtist(song.artistName || '');
      setLyricsText(song.lyrics || '');
      setSearchResults([]);
      setHasSearched(false);
      setSavedSuccess(false);

      // Auto-trigger search if no lyrics exist
      if (!song.lyrics) {
        performSearch(song.title, song.artistName);
      }
    }
  }, [isOpen, song]);

  const performSearch = async (title: string, artist: string) => {
    if (!title.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchLyricsCandidates(title, artist);
      setSearchResults(results);
    } catch (e) {
      console.error('Lyrics search failed:', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCandidate = (candidate: LrclibTrackResult) => {
    const selected = candidate.syncedLyrics || candidate.plainLyrics || '';
    setLyricsText(selected);
    setActiveTab('editor');
  };

  // Stamp current playhead time at cursor in textarea
  const handleInsertTimestamp = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const stamp = formatLrcTimestamp(currentTime) + ' ';
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const newVal = currentVal.substring(0, start) + stamp + currentVal.substring(end);
    setLyricsText(newVal);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + stamp.length, start + stamp.length);
    }, 10);
  };

  // Strip timestamps to plain text
  const handleStripTimestamps = () => {
    const plain = lyricsText
      .split('\n')
      .map((line) => line.replace(/\[\d{2}:\d{2}(?:\.\d+)?\]/g, '').trim())
      .filter(Boolean)
      .join('\n');
    setLyricsText(plain);
  };

  // Save changes to SyncContext and local storage
  const handleSave = () => {
    if (!song) return;
    const trimmed = lyricsText.trim() ? lyricsText.trim() : null;
    updateSongLyrics(song.id, trimmed);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Clear lyrics
  const handleClear = () => {
    if (!song) return;
    setLyricsText('');
    updateSongLyrics(song.id, null);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#161a17] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.08] bg-[#1c211d]/60">
          <div className="min-w-0 pr-4">
            <h2 className="text-lg font-bold text-[#fff8f2] truncate">Lyrics Manager</h2>
            <p className="text-xs text-[#a6ada6] truncate">
              {song.title} • <span className="text-white/60">{song.artistName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-white/[0.06] bg-[#111412]/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'search'
                ? 'bg-[#1c211d] text-[#b9cbba] border-t border-x border-white/10 shadow-sm'
                : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search LRCLIB</span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-[#1c211d] text-[#b9cbba] border-t border-x border-white/10 shadow-sm'
                : 'text-[#a6ada6] hover:text-[#fff8f2]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Manual Editor</span>
            {lyricsText.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#b9cbba] inline-block" />
            )}
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              {/* Search Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#a6ada6] uppercase mb-1">
                    Track Title
                  </label>
                  <input
                    type="text"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    placeholder="e.g. Bohemian Rhapsody"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111412] border border-white/10 text-xs text-[#fff8f2] focus:outline-none focus:border-[#b9cbba]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#a6ada6] uppercase mb-1">
                    Artist Name
                  </label>
                  <input
                    type="text"
                    value={searchArtist}
                    onChange={(e) => setSearchArtist(e.target.value)}
                    placeholder="e.g. Queen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111412] border border-white/10 text-xs text-[#fff8f2] focus:outline-none focus:border-[#b9cbba]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => performSearch(searchTitle, searchArtist)}
                  disabled={isSearching || !searchTitle.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#b9cbba] hover:bg-[#c8dac9] text-[#111412] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isSearching ? (
                    <span>Searching…</span>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Search Online</span>
                    </>
                  )}
                </button>
              </div>

              {/* Results List */}
              <div className="space-y-2 mt-4">
                <h4 className="text-[11px] font-mono text-[#a6ada6] uppercase tracking-wider">
                  Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                </h4>

                {isSearching ? (
                  <div className="py-12 text-center text-xs text-[#a6ada6]">
                    Searching LRCLIB online database…
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#1c211d] hover:bg-[#252b26] border border-white/[0.06] transition-all group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-semibold text-[#fff8f2] truncate">
                            {result.trackName}
                          </p>
                          <p className="text-[11px] text-[#a6ada6] truncate">
                            {result.artistName} {result.albumName ? `• ${result.albumName}` : ''}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {result.syncedLyrics ? (
                              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#3b4b3e]/40 text-[#b9cbba] border border-[#b9cbba]/20">
                                Synced LRC
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-[#a6ada6]">
                                Plain Text
                              </span>
                            )}
                            {result.duration && (
                              <span className="text-[10px] text-white/40 font-mono">
                                {Math.floor(result.duration / 60)}:
                                {String(Math.floor(result.duration % 60)).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleSelectCandidate(result)}
                          className="px-3 py-1.5 rounded-xl bg-[#3b4b3e]/60 hover:bg-[#b9cbba] text-[#b9cbba] hover:text-[#111412] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Use</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : hasSearched ? (
                  <div className="py-10 text-center text-xs text-[#a6ada6] border border-dashed border-white/10 rounded-2xl">
                    No matching lyrics found on LRCLIB. Try switching to the Manual Editor.
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Editor Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#111412] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInsertTimestamp}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3b4b3e]/50 hover:bg-[#3b4b3e] text-[#b9cbba] text-xs font-bold transition-all cursor-pointer"
                    title="Insert current playhead timestamp at cursor position"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Stamp {formatLrcTimestamp(currentTime)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStripTimestamps}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-all cursor-pointer"
                  >
                    Strip Timestamps
                  </button>
                </div>
                <span className="text-[10px] font-mono text-[#a6ada6]">
                  Format: [mm:ss.xx] Lyric
                </span>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                placeholder="[00:12.50] Paste or type synced LRC lyrics here...&#10;[00:16.80] Or plain text lyrics without timestamps."
                rows={12}
                className="w-full p-4 rounded-2xl bg-[#111412] border border-white/10 text-xs font-mono text-[#fff8f2] focus:outline-none focus:border-[#b9cbba]/50 transition-colors resize-none leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#1c211d]/60">
          <div>
            {song.lyrics && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Lyrics</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#b9cbba] hover:bg-[#c8dac9] text-[#111412] text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#111412]" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Lyrics</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
