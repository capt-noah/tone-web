import { Song } from '@/types';
import { getCoverImageUrl } from './utils';

type AudioCallback = (state: {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}) => void;

class AudioEngine {
  private audio: HTMLAudioElement | null = null;
  private subscribers: Set<AudioCallback> = new Set();
  private currentSong: Song | null = null;
  private isSeeking: boolean = false;
  private currentVolume: number = 0.85;
  private isMuted: boolean = false;
  private onTrackEndCallback: (() => void) | null = null;
  private onNextCallback: (() => void) | null = null;
  private onPrevCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.volume = this.currentVolume;
      this.attachListeners();
    }
  }

  private attachListeners() {
    if (!this.audio) return;

    this.audio.addEventListener('timeupdate', () => {
      if (!this.isSeeking) {
        this.emitState();
      }
    });

    this.audio.addEventListener('loadstart', () => {
      this.notifySubscribers({
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        isLoading: true,
        error: null,
      });
    });

    this.audio.addEventListener('play', () => this.emitState());
    
    this.audio.addEventListener('playing', () => {
      this.notifySubscribers({
        currentTime: this.audio?.currentTime || 0,
        duration: this.audio?.duration || 0,
        isPlaying: true,
        isLoading: false,
        error: null,
      });
    });

    this.audio.addEventListener('pause', () => this.emitState());
    
    this.audio.addEventListener('waiting', () => {
      this.notifySubscribers({
        currentTime: this.audio?.currentTime || 0,
        duration: this.audio?.duration || 0,
        isPlaying: false,
        isLoading: true,
        error: null,
      });
    });

    this.audio.addEventListener('stalled', () => {
      this.notifySubscribers({
        currentTime: this.audio?.currentTime || 0,
        duration: this.audio?.duration || 0,
        isPlaying: false,
        isLoading: true,
        error: null,
      });
    });

    this.audio.addEventListener('canplay', () => {
      this.notifySubscribers({
        currentTime: this.audio?.currentTime || 0,
        duration: this.audio?.duration || 0,
        isPlaying: !this.audio?.paused,
        isLoading: false,
        error: null,
      });
    });

    this.audio.addEventListener('ended', () => {
      if (this.onTrackEndCallback) {
        this.onTrackEndCallback();
      }
    });

    this.audio.addEventListener('error', () => {
      const err = this.audio?.error;
      let msg = 'Playback error';
      if (err) {
        if (err.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) msg = 'Audio format not supported or URL unavailable';
        else if (err.code === MediaError.MEDIA_ERR_NETWORK) msg = 'Network error loading audio';
      }
      this.notifySubscribers({
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        isLoading: false,
        error: msg,
      });
    });
  }

  private emitState() {
    if (!this.audio) return;
    this.notifySubscribers({
      currentTime: this.audio.currentTime,
      duration: isNaN(this.audio.duration) ? 0 : this.audio.duration,
      isPlaying: !this.audio.paused,
      isLoading: false,
      error: null,
    });
  }

  private notifySubscribers(state: {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    isLoading: boolean;
    error: string | null;
  }) {
    this.subscribers.forEach((cb) => cb(state));
  }

  public subscribe(cb: AudioCallback): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public setTrackEndCallback(cb: () => void) {
    this.onTrackEndCallback = cb;
  }

  public setMediaSessionCallbacks(onNext: () => void, onPrev: () => void) {
    this.onNextCallback = onNext;
    this.onPrevCallback = onPrev;
    this.updateMediaSession();
  }

  public async loadAndPlay(song: Song, audioUrl: string): Promise<boolean> {
    if (!this.audio) return false;
    this.currentSong = song;

    // Immediately notify UI that audio is fetching/buffering
    this.notifySubscribers({
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      isLoading: true,
      error: null,
    });

    try {
      this.audio.src = audioUrl;
      this.audio.load();
      const playSuccess = await this.safePlay();
      this.updateMediaSession();
      return playSuccess;
    } catch (err) {
      console.warn('[AudioEngine] loadAndPlay error:', err);
      this.notifySubscribers({
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        isLoading: false,
        error: 'Failed to load audio',
      });
      return false;
    }
  }

  public async safePlay(): Promise<boolean> {
    if (!this.audio) return false;
    try {
      await this.audio.play();
      this.updateMediaSessionPlaybackState('playing');
      return true;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        console.warn('[AudioEngine] Autoplay blocked by browser policy. Interaction required.');
      } else {
        console.warn('[AudioEngine] Play failed:', err);
      }
      this.updateMediaSessionPlaybackState('paused');
      return false;
    }
  }

  public pause() {
    if (!this.audio) return;
    this.audio.pause();
    this.updateMediaSessionPlaybackState('paused');
  }

  public togglePlay(): Promise<boolean> {
    if (!this.audio) return Promise.resolve(false);
    if (this.audio.paused) {
      return this.safePlay();
    } else {
      this.pause();
      return Promise.resolve(false);
    }
  }

  public seek(seconds: number) {
    if (!this.audio) return;
    this.isSeeking = false;
    const clamped = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
    this.audio.currentTime = clamped;
    this.emitState();
  }

  public setIsSeeking(seeking: boolean) {
    this.isSeeking = seeking;
  }

  public setVolume(vol: number) {
    if (!this.audio) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.currentVolume = clamped;
    if (!this.isMuted) {
      this.audio.volume = clamped;
    }
  }

  public setMuted(muted: boolean) {
    if (!this.audio) return;
    this.isMuted = muted;
    this.audio.volume = muted ? 0 : this.currentVolume;
  }

  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  public getDuration(): number {
    return this.audio?.duration || 0;
  }

  public getIsPlaying(): boolean {
    return !this.audio?.paused;
  }

  private updateMediaSession() {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !this.currentSong) {
      return;
    }

    const song = this.currentSong;
    const coverUrl = getCoverImageUrl(song.coverFileId, song.audioFileId || song.fileId);

    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.title,
      artist: song.artistName,
      album: song.albumTitle || 'Tone Library',
      artwork: [
        { src: coverUrl, sizes: '96x96', type: 'image/jpeg' },
        { src: coverUrl, sizes: '128x128', type: 'image/jpeg' },
        { src: coverUrl, sizes: '192x192', type: 'image/jpeg' },
        { src: coverUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: coverUrl, sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => this.safePlay());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (this.onPrevCallback) this.onPrevCallback();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (this.onNextCallback) this.onNextCallback();
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        this.seek(details.seekTime);
      }
    });
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused') {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }
}

export const audioEngine = new AudioEngine();
