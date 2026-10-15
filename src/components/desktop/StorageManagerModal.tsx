'use client';

import React, { useState } from 'react';
import {
  X,
  HardDrive,
  Folder,
  Download,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  FolderPlus,
  Trash2,
} from 'lucide-react';
import { useDesktop } from '@/context/DesktopContext';
import { useSync } from '@/context/SyncContext';

interface StorageManagerModalProps {
  onClose: () => void;
}

export function StorageManagerModal({ onClose }: StorageManagerModalProps) {
  const { storageInfo, downloadedTracks, sideloadedSongs, isDownloading, downloadTrack, deleteDownload, openStorageFolder, scanLocals } = useDesktop();
  const { songs } = useSync();
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const undownloadedSongs = songs.filter((s) => !downloadedTracks[s.id]);

  const handleDownloadAll = async () => {
    if (undownloadedSongs.length === 0) return;
    setIsBatchDownloading(true);
    setBatchProgress({ current: 0, total: undownloadedSongs.length });

    for (let i = 0; i < undownloadedSongs.length; i++) {
      const song = undownloadedSongs[i];
      setBatchProgress({ current: i + 1, total: undownloadedSongs.length });
      await downloadTrack(song);
    }
    setIsBatchDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-[32px] bg-[#111412] border border-white/10 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#b9cbba]/15 border border-[#b9cbba]/30 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-6 h-6 text-[#b9cbba]" />
            </div>
            <div>
              <h3 className="text-xl font-black text-[#fff8f2] tracking-tight">
                macOS Disk Storage
              </h3>
              <p className="text-xs text-[#a6ada6] mt-0.5">
                Physical lossless audio files & local offline library
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disk Stats Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#1c211d] border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#a6ada6]">Used Space</span>
            <p className="text-xl font-black text-[#fff8f2]">{storageInfo?.formattedSize || '0.0 MB'}</p>
            <p className="text-[9px] font-mono text-[#b9cbba]">Physical on Disk</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1c211d] border border-white/[0.06] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#a6ada6]">Downloaded</span>
            <p className="text-xl font-black text-[#fff8f2]">
              {storageInfo?.tracksCount || Object.keys(downloadedTracks).length}
            </p>
            <p className="text-[9px] font-mono text-[#a6ada6]">Cloud Synced Files</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#1c211d] border border-white/[0.06] space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase text-[#a6ada6]">Sideloaded</span>
            <p className="text-xl font-black text-[#fff8f2]">{sideloadedSongs.length}</p>
            <p className="text-[9px] font-mono text-[#b9cbba]">In ~/Locals</p>
          </div>
        </div>

        {/* Physical Path Box with Finder Shortcut */}
        <div className="p-4 rounded-2xl bg-[#1c211d]/70 border border-white/[0.08] flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono uppercase text-[#a6ada6] block">Storage Location</span>
            <p className="text-xs font-mono text-[#fff8f2] truncate">
              {storageInfo?.storagePath || '~/Music/Tone/'}
            </p>
          </div>
          <button
            onClick={() => openStorageFolder('')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#b9cbba] transition-colors cursor-pointer flex-shrink-0"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Open in Finder</span>
          </button>
        </div>

        {/* Sideloading Info Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#3b4b3e]/30 to-[#1c211d] border border-[#b9cbba]/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b9cbba]">
              <FolderPlus className="w-4 h-4" />
              <span>Drag & Drop Sideloading</span>
            </div>
            <button
              onClick={scanLocals}
              className="flex items-center gap-1 text-[10px] font-mono text-[#a6ada6] hover:text-[#fff8f2] cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Rescan</span>
            </button>
          </div>
          <p className="text-xs text-[#a6ada6] leading-relaxed">
            Drop your own `.mp3`, `.flac`, or `.m4a` files into <strong className="text-[#fff8f2]">~/Music/Tone/Locals/</strong>. They are automatically scanned with full ID3 album artwork and added to your library.
          </p>
          <div className="pt-1">
            <button
              onClick={() => openStorageFolder('Locals')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b9cbba] hover:underline cursor-pointer"
            >
              <span>Open Locals Folder</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Batch Download Action */}
        <div className="flex items-center justify-between pt-2">
          {undownloadedSongs.length > 0 ? (
            <button
              onClick={handleDownloadAll}
              disabled={isBatchDownloading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#b9cbba] hover:bg-[#fff8f2] text-[#0d0f0d] font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isBatchDownloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Downloading ({batchProgress.current}/{batchProgress.total})...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download All Songs for Offline ({undownloadedSongs.length})</span>
                </>
              )}
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#3b4b3e]/30 border border-[#b9cbba]/30 text-xs font-bold text-[#b9cbba]">
              <CheckCircle2 className="w-4 h-4" />
              <span>All Tracks Downloaded & Offline Ready</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
