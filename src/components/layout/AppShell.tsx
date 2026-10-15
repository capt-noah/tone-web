'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SyncProvider } from '@/context/SyncContext';
import { PlayerProvider, usePlayer } from '@/context/PlayerContext';
import { DesktopProvider } from '@/context/DesktopContext';
import { TopHeader } from './TopHeader';
import { FloatingPillNav } from './FloatingPillNav';
import { QueueDrawer } from './QueueDrawer';
import { LyricsDrawer } from '../player/LyricsDrawer';
import { EditLyricsModal } from '../modals/EditLyricsModal';
import { BottomPlayer } from '../player/BottomPlayer';
import { FullscreenPlayer } from '../player/FullscreenPlayer';
import { AmbientGlowCanvas } from '../shared/AmbientGlowCanvas';
import { useGlobalKeyboardShortcuts } from '@/hooks/useGlobalKeyboardShortcuts';

function KeyboardListener() {
  const {
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    currentTime,
    setVolume,
    volume,
    toggleMute,
    toggleLyrics,
    toggleQueue,
    toggleFullscreen,
  } = usePlayer();

  useGlobalKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onNextTrack: nextTrack,
    onPrevTrack: prevTrack,
    onSeekForward: (sec) => seek(currentTime + sec),
    onSeekBackward: (sec) => seek(currentTime - sec),
    onVolumeChange: (delta) => setVolume(volume + delta),
    onToggleMute: toggleMute,
    onToggleLyrics: toggleLyrics,
    onToggleQueue: toggleQueue,
    onToggleFullscreen: toggleFullscreen,
  });

  return null;
}

function ShellLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isMounted } = useAuth();
  const { currentSong } = usePlayer();
  const [editLyricsModalOpen, setEditLyricsModalOpen] = React.useState(false);
  const pathname = usePathname();
  const isWidgetOrTray = pathname === '/widget' || pathname === '/tray';
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isLanding = pathname === '/' && isMounted && !isAuthenticated;

  if (isWidgetOrTray) {
    return <main className="w-full h-full p-0 overflow-hidden bg-transparent">{children}</main>;
  }

  return (
    <>
      <KeyboardListener />
      <AmbientGlowCanvas />

      <div className="flex flex-col min-h-screen">
        {!isAuthPage && <TopHeader />}
        <main
          className={`flex-1 w-full ${
            isLanding || isAuthPage
              ? 'w-full p-0'
              : 'max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 pb-36 md:pb-32'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Floating Pill Nav & Player Overlays strictly when authenticated */}
      {isMounted && isAuthenticated && (
        <>
          <FloatingPillNav />
          <BottomPlayer />
          <FullscreenPlayer />
          <QueueDrawer />
          <LyricsDrawer onOpenEditor={() => setEditLyricsModalOpen(true)} />
          <EditLyricsModal
            isOpen={editLyricsModalOpen}
            onClose={() => setEditLyricsModalOpen(false)}
            song={currentSong}
          />
        </>
      )}
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DesktopProvider>
        <SyncProvider>
          <PlayerProvider>
            <ShellLayout>{children}</ShellLayout>
          </PlayerProvider>
        </SyncProvider>
      </DesktopProvider>
    </AuthProvider>
  );
}
