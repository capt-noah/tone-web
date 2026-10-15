'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Song, TopTrack, Playlist, Album, Artist, ListeningStats } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useDesktop } from './DesktopContext';
import { setCachedLyrics, getCachedLyrics } from '@/lib/lyrics';

interface SyncContextType {
  songs: Song[];
  likedSongIds: Set<string>;
  playlists: Playlist[];
  topTracks: TopTrack[];
  albums: Album[];
  artists: Artist[];
  stats: ListeningStats;
  isSyncing: boolean;
  isInitialized: boolean;
  syncQueue: Song[];
  fileProgresses: Record<string, number>;
  progress: { current: number; total: number };
  syncModalOpen: boolean;
  setSyncModalOpen: (open: boolean) => void;
  telegramStatus: { linked: boolean; telegramId?: string | null };
  isPageLoading: boolean;
  triggerPageLoad: (durationMs?: number) => void;
  syncAll: () => Promise<void>;
  toggleLike: (songId: string) => Promise<boolean>;
  isLiked: (songId: string) => boolean;
  recordPlay: (songId: string, durationSec: number) => void;
  createPlaylist: (title: string, description?: string) => Promise<string | null>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<boolean>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<boolean>;
  deletePlaylist: (playlistId: string) => Promise<boolean>;
  refreshTelegramStatus: () => Promise<void>;
  generateTelegramLinkToken: () => Promise<{ token: string; botUsername: string } | null>;
  unlinkTelegram: () => Promise<boolean>;
  updateSongLyrics: (songId: string, lyrics: string | null) => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const SONGS_CACHE_KEY = 'tone_web_cached_songs';
const LEGACY_SONGS_CACHE_KEY = 'musicly_web_cached_songs';

const PLAYLISTS_CACHE_KEY = 'tone_web_cached_playlists';
const LEGACY_PLAYLISTS_CACHE_KEY = 'musicly_web_cached_playlists';

const LIKES_CACHE_KEY = 'tone_web_cached_likes';
const LEGACY_LIKES_CACHE_KEY = 'musicly_web_cached_likes';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { sessionId, isAuthenticated, isLoading: isAuthLoading, refreshUser } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [topTracks, setTopTracks] = useState<TopTrack[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<Song[]>([]);
  const [fileProgresses, setFileProgresses] = useState<Record<string, number>>({});
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ linked: boolean; telegramId?: string | null }>({
    linked: false,
    telegramId: null,
  });

  const pendingPlaysRef = useRef<{ songId: string; playedAt: string; durationSec: number }[]>([]);
  const pageLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerPageLoad = useCallback((durationMs = 380) => {
    if (pageLoadingTimeoutRef.current) {
      clearTimeout(pageLoadingTimeoutRef.current);
    }
    setIsPageLoading(true);
    pageLoadingTimeoutRef.current = setTimeout(() => {
      setIsPageLoading(false);
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (pageLoadingTimeoutRef.current) {
        clearTimeout(pageLoadingTimeoutRef.current);
      }
    };
  }, []);

  // Load from local storage cache on client mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const cachedSongs = localStorage.getItem(SONGS_CACHE_KEY) || localStorage.getItem(LEGACY_SONGS_CACHE_KEY);
        const cachedPlaylists = localStorage.getItem(PLAYLISTS_CACHE_KEY) || localStorage.getItem(LEGACY_PLAYLISTS_CACHE_KEY);
        const cachedLikes = localStorage.getItem(LIKES_CACHE_KEY) || localStorage.getItem(LEGACY_LIKES_CACHE_KEY);

        let hasValidCachedSongs = false;
        if (cachedSongs) {
          const parsed = JSON.parse(cachedSongs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSongs(parsed);
            hasValidCachedSongs = true;
          }
        }
        if (cachedPlaylists) {
          const parsed = JSON.parse(cachedPlaylists);
          if (Array.isArray(parsed)) setPlaylists(parsed);
        }
        if (cachedLikes) {
          const parsed = JSON.parse(cachedLikes);
          if (Array.isArray(parsed)) setLikedSongIds(new Set(parsed));
        }

        const storedToken =
          localStorage.getItem('tone_web_session_id') ||
          localStorage.getItem('musicly_web_session_id');
        // If guest (no stored session) or if we already have valid cached songs to display immediately
        if (!storedToken || hasValidCachedSongs) {
          setIsInitialized(true);
        }
      }
    } catch (e) {
      console.warn('[SyncContext] Failed to load local cache:', e);
      setIsInitialized(true);
    }
  }, []);

  // Fetch all user data with per-track progress simulation matching the mobile app
  const syncAll = useCallback(async () => {
    if (!sessionId) return;
    setIsSyncing(true);
    setSyncModalOpen(true);
    try {
      const [fetchedSongs, fetchedLikes, fetchedPlaylists, fetchedTopTracks, tgStatus] = await Promise.all([
        api.getSongs(sessionId).catch(() => []),
        api.getLikedSongIds(sessionId).catch(() => []),
        api.getPlaylists(sessionId).catch(() => []),
        api.getTopTracks().catch(() => []),
        api.getTelegramLinkStatus(sessionId).catch(() => ({ linked: false })),
      ]);

      const validSongs = Array.isArray(fetchedSongs) ? fetchedSongs : [];
      
      if (validSongs.length > 0) {
        setSyncQueue(validSongs);
        setProgress({ current: 0, total: validSongs.length });
        
        // Initialize all progress to 0
        const initialProgresses: Record<string, number> = {};
        validSongs.forEach((s) => {
          initialProgresses[s.id] = 0;
        });
        setFileProgresses(initialProgresses);

        // Adaptive step delays so that sync feels crisp regardless of library size
        const stepDelay = Math.max(15, Math.min(50, Math.floor(2000 / Math.max(1, validSongs.length))));

        // Process tracks in sequence with smooth progress steps
        for (let i = 0; i < validSongs.length; i++) {
          const song = validSongs[i];
          
          setFileProgresses((prev) => ({ ...prev, [song.id]: 0.35 }));
          setProgress({ current: i + 0.35, total: validSongs.length });
          await new Promise((r) => setTimeout(r, stepDelay));

          setFileProgresses((prev) => ({ ...prev, [song.id]: 0.75 }));
          setProgress({ current: i + 0.75, total: validSongs.length });
          await new Promise((r) => setTimeout(r, stepDelay));

          setFileProgresses((prev) => ({ ...prev, [song.id]: 1.0 }));
          setProgress({ current: i + 1, total: validSongs.length });
          await new Promise((r) => setTimeout(r, Math.max(10, stepDelay - 10)));
        }

        setSongs(validSongs);
        if (typeof window !== 'undefined') {
          localStorage.setItem(SONGS_CACHE_KEY, JSON.stringify(validSongs));
        }
      } else {
        setSyncQueue([]);
        setProgress({ current: 0, total: 0 });
        setFileProgresses({});
        setSongs([]);
      }

      if (Array.isArray(fetchedLikes)) {
        const likeSet = new Set(fetchedLikes);
        setLikedSongIds(likeSet);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(fetchedLikes));
        }
      }

      if (Array.isArray(fetchedPlaylists)) {
        setPlaylists(fetchedPlaylists);
        if (typeof window !== 'undefined') {
          localStorage.setItem(PLAYLISTS_CACHE_KEY, JSON.stringify(fetchedPlaylists));
        }
      }

      if (Array.isArray(fetchedTopTracks)) {
        setTopTracks(fetchedTopTracks);
      }

      if (tgStatus) {
        setTelegramStatus(tgStatus);
      }
    } catch (err) {
      console.error('[SyncContext] Sync error:', err);
    } finally {
      // Pause briefly on 100% completion before automatically closing the sync modal and contracting indicator
      await new Promise((r) => setTimeout(r, 600));
      setIsSyncing(false);
      setSyncModalOpen(false);
      setIsInitialized(true);
    }
  }, [sessionId]);

  // Quiet initial background data refresh on session start (without animations or popups)
  useEffect(() => {
    if (isAuthenticated && sessionId) {
      let isSubscribed = true;
      Promise.all([
        api.getSongs(sessionId).catch(() => null),
        api.getLikedSongIds(sessionId).catch(() => null),
        api.getPlaylists(sessionId).catch(() => null),
        api.getTopTracks().catch(() => null),
        api.getTelegramLinkStatus(sessionId).catch(() => null),
      ])
        .then(([fetchedSongs, fetchedLikes, fetchedPlaylists, fetchedTopTracks, tgStatus]) => {
          if (!isSubscribed) return;
          if (Array.isArray(fetchedSongs)) {
            setSongs(fetchedSongs);
            if (typeof window !== 'undefined') localStorage.setItem(SONGS_CACHE_KEY, JSON.stringify(fetchedSongs));
          }
          if (Array.isArray(fetchedLikes)) {
            setLikedSongIds(new Set(fetchedLikes));
            if (typeof window !== 'undefined') localStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(fetchedLikes));
          }
          if (Array.isArray(fetchedPlaylists)) {
            setPlaylists(fetchedPlaylists);
            if (typeof window !== 'undefined') localStorage.setItem(PLAYLISTS_CACHE_KEY, JSON.stringify(fetchedPlaylists));
          }
          if (Array.isArray(fetchedTopTracks)) {
            setTopTracks(fetchedTopTracks);
          }
          if (tgStatus) {
            setTelegramStatus(tgStatus);
          }
        })
        .catch((err) => {
          console.warn('[SyncContext] Initial quiet fetch failed:', err);
        })
        .finally(() => {
          if (isSubscribed) {
            setIsInitialized(true);
          }
        });

      return () => {
        isSubscribed = false;
      };
    } else if (!isAuthLoading && !isAuthenticated) {
      setSongs([]);
      setLikedSongIds(new Set());
      setPlaylists([]);
      setIsInitialized(true);
    }
  }, [isAuthenticated, sessionId, isAuthLoading]);

  // Periodic flush of play history
  const flushPendingPlays = useCallback(async () => {
    if (!sessionId || pendingPlaysRef.current.length === 0) return;
    const batch = [...pendingPlaysRef.current];
    pendingPlaysRef.current = [];
    try {
      await api.syncPlays(sessionId, batch);
    } catch (err) {
      console.warn('[SyncContext] Failed to flush plays, restoring queue:', err);
      pendingPlaysRef.current = [...batch, ...pendingPlaysRef.current];
    }
  }, [sessionId]);

  useEffect(() => {
    const interval = setInterval(flushPendingPlays, 20000);
    return () => {
      clearInterval(interval);
      flushPendingPlays();
    };
  }, [flushPendingPlays]);

  const recordPlay = useCallback((songId: string, durationSec: number) => {
    if (!sessionId || !songId) return;
    pendingPlaysRef.current.push({
      songId,
      playedAt: new Date().toISOString(),
      durationSec: Math.round(durationSec),
    });

    // Optimistically update local song play count
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, plays: (s.plays || 0) + 1 } : s))
    );
  }, [sessionId]);

  const toggleLike = useCallback(
    async (songId: string): Promise<boolean> => {
      if (!sessionId || !songId) return false;

      const currentlyLiked = likedSongIds.has(songId);
      const updatedSet = new Set(likedSongIds);

      if (currentlyLiked) {
        updatedSet.delete(songId);
      } else {
        updatedSet.add(songId);
      }

      // Optimistic update
      setLikedSongIds(updatedSet);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(Array.from(updatedSet)));
      }

      try {
        const res = await api.toggleLike(sessionId, songId);
        return res.liked;
      } catch (err) {
        console.error('[SyncContext] Toggle like failed:', err);
        // Revert on error
        setLikedSongIds(likedSongIds);
        return currentlyLiked;
      }
    },
    [sessionId, likedSongIds]
  );

  const isLiked = useCallback(
    (songId: string): boolean => {
      return likedSongIds.has(songId);
    },
    [likedSongIds]
  );

  const createPlaylist = async (title: string, description?: string): Promise<string | null> => {
    if (!sessionId) return null;
    try {
      const res = await api.createPlaylist(sessionId, title, description);
      await syncAll();
      return res.id;
    } catch (err) {
      console.error('[SyncContext] Failed to create playlist:', err);
      return null;
    }
  };

  const addSongToPlaylist = async (playlistId: string, songId: string): Promise<boolean> => {
    if (!sessionId) return false;
    try {
      await api.addSongToPlaylist(sessionId, playlistId, songId);
      await syncAll();
      return true;
    } catch (err) {
      console.error('[SyncContext] Failed to add song to playlist:', err);
      return false;
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string): Promise<boolean> => {
    if (!sessionId) return false;
    try {
      await api.removeSongFromPlaylist(sessionId, playlistId, songId);
      await syncAll();
      return true;
    } catch (err) {
      console.error('[SyncContext] Failed to remove song from playlist:', err);
      return false;
    }
  };

  const deletePlaylist = async (playlistId: string): Promise<boolean> => {
    if (!sessionId) return false;
    try {
      await api.deletePlaylist(sessionId, playlistId);
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      return true;
    } catch (err) {
      console.error('[SyncContext] Failed to delete playlist:', err);
      return false;
    }
  };

  const refreshTelegramStatus = useCallback(async () => {
    if (!sessionId) return;
    try {
      const status = await api.getTelegramLinkStatus(sessionId);
      setTelegramStatus((prev) => {
        if (prev.linked === status.linked && prev.telegramId === status.telegramId) {
          return prev;
        }
        if (!prev.linked && status.linked) {
          refreshUser();
        }
        return status;
      });
    } catch (err) {
      console.error('[SyncContext] Telegram link status check failed:', err);
    }
  }, [sessionId, refreshUser]);

  const generateTelegramLinkToken = useCallback(async () => {
    if (!sessionId) return null;
    try {
      return await api.generateTelegramLinkToken(sessionId);
    } catch (err) {
      console.error('[SyncContext] Failed to generate Telegram token:', err);
      return null;
    }
  }, [sessionId]);

  const unlinkTelegram = useCallback(async (): Promise<boolean> => {
    if (!sessionId) return false;
    try {
      const res = await api.unlinkTelegram(sessionId);
      if (res.success) {
        setTelegramStatus({ linked: false, telegramId: null });
        await refreshUser();
        return true;
      }
      return false;
    } catch (err) {
      console.error('[SyncContext] Unlink Telegram failed:', err);
      return false;
    }
  }, [sessionId, refreshTelegramStatus]);

  const updateSongLyrics = useCallback((songId: string, lyrics: string | null) => {
    // 1. Persist to dedicated localStorage cache
    setCachedLyrics(songId, lyrics);

    // 2. Persist to physical hard drive via Electron IPC if running on desktop
    if (typeof window !== 'undefined' && window.electronAPI?.saveLyrics) {
      window.electronAPI.saveLyrics(songId, lyrics).catch((err) => {
        console.warn('[SyncContext] Desktop lyrics save error:', err);
      });
    }

    // 3. Update in-memory songs and songs collection cache
    setSongs((prevSongs) => {
      const updated = prevSongs.map((s) => (s.id === songId ? { ...s, lyrics } : s));
      if (typeof window !== 'undefined') {
        localStorage.setItem(SONGS_CACHE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  const { sideloadedSongs } = useDesktop();

  // Combined cloud library songs with local sideloaded tracks from ~/Music/Tone/Locals/
  const effectiveSongs = React.useMemo(() => {
    if (!sideloadedSongs || sideloadedSongs.length === 0) return songs;
    const existingIds = new Set(songs.map((s) => s.id));
    const newLocals = sideloadedSongs.filter((s) => !existingIds.has(s.id));
    return [...songs, ...newLocals];
  }, [songs, sideloadedSongs]);

  // Group songs into albums with stable deterministic IDs, artist-scoping, and case-insensitivity
  const albums: Album[] = React.useMemo(() => {
    const albumMap = new Map<
      string,
      {
        id: string;
        title: string;
        artistName: string;
        coverFileId?: string | null;
        songs: Song[];
      }
    >();

    effectiveSongs.forEach((song) => {
      const rawTitle = song.albumTitle?.trim();
      const rawArtist = song.artistName?.trim() || 'Unknown Artist';
      const albumTitle = rawTitle || 'Standalone Tracks';

      // Group by database albumId if present; otherwise by (artistName + albumTitle)
      const groupingKey = song.albumId
        ? `db-${song.albumId}`
        : `${rawArtist.toLowerCase()}___${albumTitle.toLowerCase()}`;

      if (!albumMap.has(groupingKey)) {
        // Deterministic, URL-safe slug ID without ephemeral indexes
        const id = song.albumId || `${encodeURIComponent(rawArtist.toLowerCase().replace(/[\/\s]+/g, '-'))}_${encodeURIComponent(albumTitle.toLowerCase().replace(/[\/\s]+/g, '-'))}`;

        albumMap.set(groupingKey, {
          id,
          title: albumTitle,
          artistName: rawArtist,
          coverFileId: song.coverFileId || null,
          songs: [],
        });
      }

      const item = albumMap.get(groupingKey)!;
      item.songs.push(song);

      if (!item.coverFileId && song.coverFileId) {
        item.coverFileId = song.coverFileId;
      }
    });

    return Array.from(albumMap.values()).map((album) => {
      const uniqueArtists = new Set(album.songs.map((s) => s.artistName?.trim()).filter(Boolean));
      let displayArtist = album.artistName;
      if (uniqueArtists.size > 1 && album.title.toLowerCase() === 'standalone tracks') {
        displayArtist = 'Various Artists';
      }

      return {
        id: album.id,
        title: album.title,
        artistName: displayArtist,
        coverFileId: album.coverFileId,
        songs: album.songs,
      };
    });
  }, [effectiveSongs]);

  // Group songs into artists with case-insensitive normalization
  const artists: Artist[] = React.useMemo(() => {
    const artistMap = new Map<string, { name: string; songs: Song[]; coverFileId?: string | null }>();

    effectiveSongs.forEach((song) => {
      const artistName = (song.artistName || 'Unknown Artist').trim();
      const artistKey = artistName.toLowerCase();

      if (!artistMap.has(artistKey)) {
        artistMap.set(artistKey, {
          name: artistName,
          songs: [],
          coverFileId: song.coverFileId || null,
        });
      }
      const item = artistMap.get(artistKey)!;
      item.songs.push(song);
      if (!item.coverFileId && song.coverFileId) {
        item.coverFileId = song.coverFileId;
      }
    });

    return Array.from(artistMap.values()).sort((a, b) => b.songs.length - a.songs.length);
  }, [effectiveSongs]);

  // Derived listening stats for Tone Wrap and dashboard
  const stats: ListeningStats = React.useMemo(() => {
    let totalSec = 0;
    let totalPlays = 0;
    const artistPlayCount: Record<string, { plays: number; count: number }> = {};

    effectiveSongs.forEach((song) => {
      const plays = song.plays || 0;
      const duration = song.durationSec || 200;
      totalPlays += plays;
      totalSec += plays * duration;

      const artist = song.artistName || 'Unknown';
      if (!artistPlayCount[artist]) {
        artistPlayCount[artist] = { plays: 0, count: 0 };
      }
      artistPlayCount[artist].plays += plays;
      artistPlayCount[artist].count += 1;
    });

    const topArtists = Object.entries(artistPlayCount)
      .map(([name, data]) => ({ name, plays: data.plays, count: data.count }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 5);

    const sortedTracks = [...effectiveSongs].sort((a, b) => (b.plays || 0) - (a.plays || 0));

    return {
      totalMinutes: Math.round(totalSec / 60),
      totalPlays,
      topArtists,
      topTracks: sortedTracks.slice(0, 5),
      uniqueTracksCount: effectiveSongs.length,
    };
  }, [effectiveSongs]);

  return (
    <SyncContext.Provider
      value={{
        songs: effectiveSongs,
        likedSongIds,
        playlists,
        topTracks,
        albums,
        artists,
        stats,
        isSyncing,
        isInitialized,
        isPageLoading,
        triggerPageLoad,
        syncQueue,
        fileProgresses,
        progress,
        syncModalOpen,
        setSyncModalOpen,
        telegramStatus,
        syncAll,
        toggleLike,
        isLiked,
        recordPlay,
        createPlaylist,
        addSongToPlaylist,
        removeSongFromPlaylist,
        deletePlaylist,
        refreshTelegramStatus,
        generateTelegramLinkToken,
        unlinkTelegram,
        updateSongLyrics,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
