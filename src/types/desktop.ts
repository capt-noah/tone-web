import { Song } from './index';

export interface StorageInfo {
  storagePath: string;
  tracksCount: number;
  totalSizeBytes: number;
  formattedSize: string;
  localsCount: number;
}

export interface LocalDownloadedTrack {
  songId: string;
  audioPath: string;
  coverPath?: string | null;
  downloadedAt: string;
  fileSizeBytes: number;
}

export interface SideloadedTrack extends Song {
  isLocalOnly: true;
  localAudioUri: string;
  filePath: string;
}

export interface DesktopPlaybackSync {
  currentSong: Song | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: string;
  isLiked?: boolean;
}

export interface ElectronAPI {
  isDesktop: boolean;
  platform: string;
  getStorageInfo: () => Promise<StorageInfo>;
  getDownloadedTracks: () => Promise<Record<string, LocalDownloadedTrack>>;
  downloadTrack: (song: Song, token?: string | null) => Promise<{ success: boolean; track?: LocalDownloadedTrack; error?: string }>;
  deleteDownloadedTrack: (songId: string) => Promise<{ success: boolean }>;
  saveLyrics: (songId: string, lyrics: string | null) => Promise<{ success: boolean; error?: string }>;
  getLyrics: (songId: string) => Promise<string | null>;
  scanLocals: () => Promise<SideloadedTrack[]>;
  openStorageFolder: (subfolder?: 'Tracks' | 'Locals' | 'Artwork' | 'Lyrics' | '') => Promise<void>;
  toggleWidgetWindow: (show?: boolean) => Promise<boolean>;
  toggleTrayPopover: (show?: boolean) => Promise<boolean>;
  syncPlaybackState: (state: DesktopPlaybackSync) => void;
  onPlaybackCommand: (callback: (command: 'play' | 'pause' | 'toggle' | 'next' | 'previous' | 'seek' | 'volume', payload?: any) => void) => () => void;
  onPlaybackStateUpdated: (callback: (state: DesktopPlaybackSync) => void) => () => void;
  onLocalTracksUpdated: (callback: (tracks: SideloadedTrack[]) => void) => () => void;
  onDownloadProgress: (callback: (data: { songId: string; progress: number; status: 'downloading' | 'completed' | 'failed' }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
