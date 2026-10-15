'use client';

import { useEffect } from 'react';

interface ShortcutOptions {
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeekForward: (seconds: number) => void;
  onSeekBackward: (seconds: number) => void;
  onVolumeChange: (delta: number) => void;
  onToggleMute: () => void;
  onToggleLyrics?: () => void;
  onToggleQueue?: () => void;
  onToggleFullscreen?: () => void;
  enabled?: boolean;
}

export function useGlobalKeyboardShortcuts({
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeekForward,
  onSeekBackward,
  onVolumeChange,
  onToggleMute,
  onToggleLyrics,
  onToggleQueue,
  onToggleFullscreen,
  enabled = true,
}: ShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Input Collision Guard: do not trigger hotkeys when typing in text fields
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore when meta/ctrl keys are held (except standard combos if needed)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay();
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            onNextTrack();
          } else {
            onSeekForward(5);
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            onPrevTrack();
          } else {
            onSeekBackward(5);
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          onVolumeChange(0.05);
          break;

        case 'ArrowDown':
          e.preventDefault();
          onVolumeChange(-0.05);
          break;

        case 'KeyM':
          e.preventDefault();
          onToggleMute();
          break;

        case 'KeyL':
          if (onToggleLyrics) {
            e.preventDefault();
            onToggleLyrics();
          }
          break;

        case 'KeyQ':
          if (onToggleQueue) {
            e.preventDefault();
            onToggleQueue();
          }
          break;

        case 'KeyF':
          if (onToggleFullscreen) {
            e.preventDefault();
            onToggleFullscreen();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    enabled,
    onTogglePlay,
    onNextTrack,
    onPrevTrack,
    onSeekForward,
    onSeekBackward,
    onVolumeChange,
    onToggleMute,
    onToggleLyrics,
    onToggleQueue,
    onToggleFullscreen,
  ]);
}
