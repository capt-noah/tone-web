'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Disc3, Mic2, Music2, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { TrackRow } from '@/components/shared/TrackRow';
import { AlbumCard } from '@/components/shared/AlbumCard';
import { SearchSkeleton } from '@/components/shared/Skeletons';

const CATEGORIES = [
  { id: 'atmospheric', title: 'Atmospheric & Ambient', gradient: 'from-[#3b4b3e] to-[#1c211d]' },
  { id: 'masters', title: 'Studio Masters (Lossless)', gradient: 'from-[#4a3b47] to-[#1c211d]' },
  { id: 'electronic', title: 'Electronic & Synthwave', gradient: 'from-[#2b3a4a] to-[#1c211d]' },
  { id: 'lofi', title: 'Midnight Chill & Lo-Fi', gradient: 'from-[#4a422b] to-[#1c211d]' },
  { id: 'acoustic', title: 'Acoustic & Classical', gradient: 'from-[#2b4a45] to-[#1c211d]' },
  { id: 'beats', title: 'Bass & Groove', gradient: 'from-[#422b4a] to-[#1c211d]' },
];

export default function SearchPage() {
  const { isLoading: isAuthLoading, isMounted } = useAuth();
  const { songs, albums, artists, isSyncing, isInitialized, isPageLoading } = useSync();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { songs: [], albums: [], artists: [] };

    const matchingSongs = songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artistName.toLowerCase().includes(q) ||
        (s.albumTitle && s.albumTitle.toLowerCase().includes(q))
    );

    const matchingAlbums = albums.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.artistName.toLowerCase().includes(q)
    );

    const matchingArtists = artists.filter((art) =>
      art.name.toLowerCase().includes(q)
    );

    return {
      songs: matchingSongs,
      albums: matchingAlbums,
      artists: matchingArtists,
    };
  }, [query, songs, albums, artists]);

  if (!isMounted || isAuthLoading || isPageLoading || !isInitialized || (isSyncing && songs.length === 0)) {
    return <SearchSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 select-none">
      {/* Search Input Hero */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-[#fff8f2] tracking-tight">
          Explore Library & Sound
        </h2>
        <p className="text-xs text-[#a6ada6]">
          Search your synchronized tracks, artists, and sound recordings.
        </p>

        <div className="relative pt-3 max-w-2xl">
          <Search className="absolute left-4 top-[26px] w-5 h-5 text-[#a6ada6]" />
          <input
            type="text"
            placeholder="Search by title, artist name, or album..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-[#111412] border border-white/10 text-base text-[#fff8f2] placeholder-[#a6ada6]/50 focus:outline-none focus:border-[#b9cbba] shadow-xl transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-[26px] p-1 rounded-full text-[#a6ada6] hover:text-[#fff8f2] hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Query Search Results */}
      {query ? (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Songs Section */}
          {filtered.songs.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Music2 className="w-4 h-4 text-[#b9cbba]" />
                <h3 className="text-lg font-bold text-[#fff8f2]">Matching Tracks</h3>
                <span className="text-xs font-mono text-[#a6ada6]">({filtered.songs.length})</span>
              </div>
              <div className="space-y-1 bg-[#111412]/60 p-3 rounded-2xl border border-white/[0.06]">
                {filtered.songs.map((song, idx) => (
                  <TrackRow
                    key={song.id}
                    song={song}
                    index={idx}
                    queueContext={filtered.songs}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums Section */}
          {filtered.albums.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-[#b9cbba]" />
                <h3 className="text-lg font-bold text-[#fff8f2]">Matching Albums</h3>
                <span className="text-xs font-mono text-[#a6ada6]">({filtered.albums.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}

          {/* Artists Section */}
          {filtered.artists.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Mic2 className="w-4 h-4 text-[#b9cbba]" />
                <h3 className="text-lg font-bold text-[#fff8f2]">Sound Architects / Artists</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {filtered.artists.map((art) => (
                  <div
                    key={art.name}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#111412] border border-white/[0.08]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#3b4b3e] flex items-center justify-center text-sm font-bold text-[#b9cbba]">
                      {art.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#fff8f2]">{art.name}</p>
                      <p className="text-[10px] text-[#a6ada6]">{art.songs.length} tracks</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {filtered.songs.length === 0 &&
            filtered.albums.length === 0 &&
            filtered.artists.length === 0 && (
              <div className="py-16 text-center text-[#a6ada6] space-y-2">
                <p className="text-sm font-semibold text-[#fff8f2]">No results for &quot;{query}&quot;</p>
                <p className="text-xs">Try searching by track title, artist name, or album.</p>
              </div>
            )}
        </div>
      ) : (
        /* Category Bento Grid */
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#b9cbba]" />
            <h3 className="text-lg font-bold text-[#fff8f2]">Sound Profiles & Genres</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setQuery(cat.title.split(' ')[0])}
                className={`group p-6 rounded-3xl bg-gradient-to-br ${cat.gradient} border border-white/[0.08] hover:border-white/[0.2] transition-all duration-300 cursor-pointer shadow-lg relative overflow-hidden`}
              >
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#b9cbba] uppercase block">
                    Collection
                  </span>
                  <h4 className="text-lg font-bold text-[#fff8f2] group-hover:text-[#b9cbba] transition-colors">
                    {cat.title}
                  </h4>
                </div>

                <div className="absolute right-4 bottom-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all">
                  <Disc3 className="w-24 h-24 text-white" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
