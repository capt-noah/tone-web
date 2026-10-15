'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Song } from '@/types';
import { StorageInfo, LocalDownloadedTrack, SideloadedTrack, DesktopPlaybackSync } from '@/types/desktop';
import { useAuth } from './AuthContext';

interface DesktopContextType {
  isDesktop: boolean;
  storageInfo: StorageInfo | null;
  downloadedTracks: Record<string, LocalDownloadedTrack>;
  sideloadedSongs: SideloadedTrack[];
  isWidgetOpen: boolean;
  isDownloading: Record<string, boolean>;
  refreshStorageInfo: () => Promise<void>;
  downloadTrack: (song: Song) => Promise<boolean>;
  deleteDownload: (songId: string) => Promise<boolean>;
  isDownloaded: (songId: string) => boolean;
  scanLocals: () => Promise<void>;
  openStorageFolder: (subfolder?: 'Tracks' | 'Locals' | 'Artwork' | '') => Promise<void>;
  toggleWidgetWindow: (show?: boolean) => Promise<void>;
  toggleTrayPopover: () => Promise<void>;
  syncPlaybackState: (state: DesktopPlaybackSync) => void;
}

const DesktopContext = createContext<DesktopContextType | undefined>(undefined);

export function DesktopProvider({ children }: { children: React.ReactNode }) {
  const { sessionId } = useAuth();
  const [isDesktop, setIsDesktop] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [downloadedTracks, setDownloadedTracks] = useState<Record<string, LocalDownloadedTrack>>({});
  const [sideloadedSongs, setSideloadedSongs] = useState<SideloadedTrack[]>([]);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.isDesktop) {
      setIsDesktop(true);

      // Initial loads
      window.electronAPI.getStorageInfo().then(setStorageInfo).catch(() => {});
      window.electronAPI.getDownloadedTracks().then(setDownloadedTracks).catch(() => {});
      window.electronAPI.scanLocals().then(setSideloadedSongs).catch(() => {});

      // Sideloaded files listener
      const unsubLocals = window.electronAPI.onLocalTracksUpdated((tracks) => {
        setSideloadedSongs(tracks);
      });

      return () => {
        unsubLocals();
      };
    }
  }, []);

  const refreshStorageInfo = useCallback(async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const [info, downloads] = await Promise.all([
        window.electronAPI.getStorageInfo(),
        window.electronAPI.getDownloadedTracks(),
      ]);
      setStorageInfo(info);
      setDownloadedTracks(downloads);
    }
  }, []);

  const downloadTrack = useCallback(
    async (song: Song): Promise<boolean> => {
      if (typeof window === 'undefined' || !window.electronAPI) return false;

      setIsDownloading((prev) => ({ ...prev, [song.id]: true }));
      try {
        const res = await window.electronAPI.downloadTrack(song, sessionId);
        if (res.success && res.track) {
          setDownloadedTracks((prev) => ({ ...prev, [song.id]: res.track! }));
          await refreshStorageInfo();
          return true;
        }
        return false;
      } catch (err) {
        console.error('[DesktopContext] Failed to download track:', err);
        return false;
      } finally {
        setIsDownloading((prev) => ({ ...prev, [song.id]: false }));
      }
    },
    [sessionId, refreshStorageInfo]
  );

  const deleteDownload = useCallback(
    async (songId: string): Promise<boolean> => {
      if (typeof window === 'undefined' || !window.electronAPI) return false;

      try {
        const res = await window.electronAPI.deleteDownloadedTrack(songId);
        if (res.success) {
          setDownloadedTracks((prev) => {
            const copy = { ...prev };
            delete copy[songId];
            return copy;
          });
          await refreshStorageInfo();
          return true;
        }
        return false;
      } catch (err) {
        console.error('[DesktopContext] Failed to delete download:', err);
        return false;
      }
    },
    [refreshStorageInfo]
  );

  const isDownloaded = useCallback(
    (songId: string): boolean => {
      return !!downloadedTracks[songId];
    },
    [downloadedTracks]
  );

  const scanLocals = useCallback(async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const tracks = await window.electronAPI.scanLocals();
      setSideloadedSongs(tracks);
      await refreshStorageInfo();
    }
  }, [refreshStorageInfo]);

  const openStorageFolder = useCallback(async (subfolder: 'Tracks' | 'Locals' | 'Artwork' | '' = '') => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      await window.electronAPI.openStorageFolder(subfolder);
    }
  }, []);

  const toggleWidgetWindow = useCallback(async (show?: boolean) => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const visible = await window.electronAPI.toggleWidgetWindow(show);
      setIsWidgetOpen(visible);
    }
  }, []);

  const toggleTrayPopover = useCallback(async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      await window.electronAPI.toggleTrayPopover();
    }
  }, []);

  const syncPlaybackState = useCallback((state: DesktopPlaybackSync) => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.syncPlaybackState(state);
    }
  }, []);

  return (
    <DesktopContext.Provider
      value={{
        isDesktop,
        storageInfo,
        downloadedTracks,
        sideloadedSongs,
        isWidgetOpen,
        isDownloading,
        refreshStorageInfo,
        downloadTrack,
        deleteDownload,
        isDownloaded,
        scanLocals,
        openStorageFolder,
        toggleWidgetWindow,
        toggleTrayPopover,
        syncPlaybackState,
      }}
    >
      {children}
    </DesktopContext.Provider>
  );
}

export function useDesktop() {
  const context = useContext(DesktopContext);
  if (!context) {
    throw new Error('useDesktop must be used within a DesktopProvider');
  }
  return context;
}
