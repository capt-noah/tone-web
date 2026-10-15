export interface Song {
  id: string;
  title: string;
  artistName: string;
  albumTitle?: string | null;
  audioFileId: string;
  coverFileId?: string | null;
  durationSec?: number;
  duration?: string | number;
  plays?: number;
  uploadedAt?: string;
  albumId?: string | null;
  isLocalOnly?: boolean;
  lyrics?: string | null;
  coverUrl?: string;
  audioUrl?: string;
  fileId?: string;
}

export interface TopTrack {
  id: string;
  title: string;
  artistName: string;
  albumTitle?: string | null;
  audioFileId: string;
  coverFileId?: string | null;
  fileId?: string;
  rank: number;
  plays: number;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string | null;
  coverArt?: string | null;
  ownerId?: string;
  ownerUsername?: string;
  createdAt?: string;
  songs?: Song[];
  itemCount?: number;
}

export interface User {
  id?: string;
  username: string;
  email?: string | null;
  telegramId?: string | null;
  profilePhoto?: string | null;
  createdAt?: string;
}

export interface Album {
  id: string;
  title: string;
  artistName: string;
  coverFileId?: string | null;
  songs: Song[];
  releaseYear?: string | number;
}

export interface Artist {
  name: string;
  songs: Song[];
  coverFileId?: string | null;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlaybackState {
  currentSong: Song | null;
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  queue: Song[];
  queueIndex: number;
  lyricsOpen: boolean;
  queueOpen: boolean;
  isFullscreen: boolean;
  isLoadingAudio: boolean;
  playbackError: string | null;
}

export interface ListeningStats {
  totalMinutes: number;
  totalPlays: number;
  topArtists: { name: string; plays: number; count: number }[];
  topTracks: Song[];
  uniqueTracksCount: number;
}
