'use client';

import React from 'react';

/**
 * Low-level reusable shimmer block with rounded corners and animated gradient.
 */
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-xl border border-white/[0.05] ${className}`}
    />
  );
}

/**
 * Skeleton matching TrackRow layout
 */
export function TrackRowSkeleton({ index }: { index?: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-transparent">
      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
        {/* Index placeholder */}
        <div className="w-6 flex items-center justify-center flex-shrink-0">
          {index !== undefined ? (
            <Shimmer className="w-3.5 h-3.5 rounded" />
          ) : (
            <Shimmer className="w-4 h-4 rounded-full" />
          )}
        </div>

        {/* Thumbnail art square */}
        <Shimmer className="w-10 h-10 rounded-lg flex-shrink-0" />

        {/* Title and artist bars */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <Shimmer className="h-3.5 w-40 max-w-[70%]" />
          <Shimmer className="h-2.5 w-24 max-w-[40%]" />
        </div>
      </div>

      {/* Album bar (desktop) */}
      <div className="hidden md:block w-1/3 min-w-0 px-4">
        <Shimmer className="h-3 w-28 max-w-[60%]" />
      </div>

      {/* Right: Heart + duration placeholder */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Shimmer className="w-4 h-4 rounded-full" />
        <Shimmer className="w-9 h-3" />
      </div>
    </div>
  );
}

/**
 * Skeleton matching AlbumCard & PlaylistCard
 */
export function AlbumCardSkeleton() {
  return (
    <div className="p-3.5 rounded-2xl bg-[#111412]/60 border border-white/[0.05] space-y-3">
      {/* Square cover artwork */}
      <Shimmer className="w-full aspect-square rounded-xl" />

      {/* Text titles */}
      <div className="space-y-1.5 pt-0.5">
        <Shimmer className="h-3.5 w-3/4" />
        <Shimmer className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Full Dashboard Skeleton (Spotify-style Home Hub)
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-10 pb-16 select-none animate-in fade-in duration-300">
      {/* 1. Header Greeting Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Shimmer className="h-8 sm:h-9 w-64 max-w-[80%]" />
          <Shimmer className="h-3.5 w-44" />
        </div>
        <Shimmer className="h-10 w-36 rounded-full" />
      </div>

      {/* 2. Quick Access 2x3 Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl bg-[#111412]/80 border border-white/[0.06] overflow-hidden pr-3"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Shimmer className="w-14 h-14 rounded-none flex-shrink-0" />
              <div className="min-w-0 flex-1 pr-2">
                <Shimmer className="h-3.5 w-28 max-w-[80%]" />
              </div>
            </div>
            <Shimmer className="w-8 h-8 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* 3. Jump Back In Carousel Skeleton */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Shimmer className="h-6 w-36" />
          <Shimmer className="h-3 w-64 max-w-[70%]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* 4. Heavy Rotation Tracklist Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shimmer className="w-5 h-5 rounded-md" />
            <Shimmer className="h-6 w-40" />
          </div>
          <Shimmer className="h-4 w-20 rounded-full" />
        </div>
        <div className="space-y-1 bg-[#111412]/50 p-3 rounded-2xl border border-white/[0.06]">
          {Array.from({ length: 5 }).map((_, i) => (
            <TrackRowSkeleton key={i} index={i} />
          ))}
        </div>
      </div>

      {/* 5. Albums in Your Collection Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shimmer className="w-5 h-5 rounded-md" />
            <Shimmer className="h-6 w-48" />
          </div>
          <Shimmer className="h-4 w-16 rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* 6. Your Playlists Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shimmer className="w-5 h-5 rounded-md" />
            <Shimmer className="h-6 w-40" />
          </div>
          <Shimmer className="h-4 w-16 rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Library Page Skeleton
 */
export function LibrarySkeleton() {
  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in duration-300">
      {/* Top Library Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Shimmer className="w-6 h-6 rounded-lg" />
            <Shimmer className="h-8 sm:h-9 w-48" />
          </div>
          <Shimmer className="h-3.5 w-64" />
        </div>

        <div className="flex items-center gap-2">
          <Shimmer className="h-9 w-32 rounded-xl" />
          <Shimmer className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center bg-white/[0.04] p-1 rounded-2xl border border-white/[0.08] gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-8 w-24 rounded-xl flex-shrink-0" />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Shimmer className="h-8 w-36 rounded-xl" />
        </div>
      </div>

      {/* Main Tracklist Area with Alphabet Scrubber */}
      <div className="relative flex gap-2">
        <div className="flex-1 min-h-[500px] space-y-1 bg-[#111412]/40 p-2 rounded-2xl border border-white/[0.06]">
          {Array.from({ length: 8 }).map((_, i) => (
            <TrackRowSkeleton key={i} index={i} />
          ))}
        </div>

        {/* Kinetic A-Z Alphabet Scrubber Placeholder */}
        <div className="hidden sm:flex flex-col items-center justify-between py-2 px-1 bg-[#111412]/80 rounded-2xl border border-white/[0.08] select-none w-6 min-h-[500px]">
          {Array.from({ length: 12 }).map((_, i) => (
            <Shimmer key={i} className="w-3.5 h-3 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Favorites / Liked Songs Skeleton
 */
export function FavoritesSkeleton() {
  return (
    <div className="space-y-8 pb-12 select-none animate-in fade-in duration-300">
      {/* Hero Banner Skeleton */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-br from-[#1c211d] via-[#111412] to-[#0d0f0d] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <Shimmer className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex-shrink-0" />
          <div className="space-y-2">
            <Shimmer className="h-3 w-28 rounded-md" />
            <Shimmer className="h-8 sm:h-10 w-56" />
            <Shimmer className="h-3.5 w-40 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-11 w-28 rounded-2xl" />
          <Shimmer className="h-11 w-32 rounded-2xl" />
        </div>
      </div>

      {/* Tracklist */}
      <div className="space-y-1 bg-[#111412]/50 p-3 rounded-2xl border border-white/[0.06]">
        {Array.from({ length: 7 }).map((_, i) => (
          <TrackRowSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Album / Playlist Detail Page Skeleton
 */
export function AlbumPlaylistSkeleton({ type = 'album' }: { type?: 'album' | 'playlist' }) {
  return (
    <div className="space-y-8 pb-12 select-none animate-in fade-in duration-300">
      {/* Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#1c211d] via-[#111412] to-[#0d0f0d] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <Shimmer className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl flex-shrink-0" />
          <div className="space-y-2">
            <Shimmer className="h-3 w-24 rounded-md" />
            <Shimmer className="h-7 sm:h-9 w-64" />
            <Shimmer className="h-4 w-40 rounded-md" />
            <Shimmer className="h-3 w-32 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Shimmer className="h-11 w-11 rounded-2xl" />
          <Shimmer className="h-11 w-32 rounded-2xl" />
        </div>
      </div>

      {/* Track Rows */}
      <div className="space-y-1 bg-[#111412]/50 p-3 rounded-2xl border border-white/[0.06]">
        {Array.from({ length: 7 }).map((_, i) => (
          <TrackRowSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Profile Page Skeleton
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-8 pb-16 select-none animate-in fade-in duration-300">
      {/* 1. Profile Header Hero */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#1c211d] via-[#111412] to-[#0d0f0d] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Shimmer className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex-shrink-0" />
          <div className="space-y-2 text-center sm:text-left">
            <Shimmer className="h-3 w-28 mx-auto sm:mx-0 rounded-md" />
            <Shimmer className="h-7 sm:h-8 w-56 mx-auto sm:mx-0" />
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <Shimmer className="h-5 w-28 rounded-full" />
              <Shimmer className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <Shimmer className="h-10 w-28 rounded-2xl" />
      </div>

      {/* 2. Bento Grid: Tone Wrap, Telegram & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-7 rounded-[28px] bg-[#111412] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <Shimmer className="h-4 w-32 rounded-md" />
            <Shimmer className="h-5 w-16 rounded-full" />
          </div>
          <Shimmer className="h-7 w-52" />
          <Shimmer className="h-4 w-full rounded-md" />
          <Shimmer className="h-4 w-3/4 rounded-md" />
          <div className="pt-2">
            <Shimmer className="h-4 w-36 rounded-md" />
          </div>
        </div>

        <div className="p-7 rounded-[28px] bg-[#111412] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <Shimmer className="h-5 w-44 rounded-md" />
            <Shimmer className="h-5 w-20 rounded-full" />
          </div>
          <Shimmer className="h-4 w-full rounded-md" />
          <Shimmer className="h-4 w-4/5 rounded-md" />
          <div className="pt-2">
            <Shimmer className="h-11 w-full rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 3. Listening Stats Bento Grid */}
      <div className="space-y-3">
        <Shimmer className="h-6 w-44" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[#111412] border border-white/[0.06] space-y-2">
              <Shimmer className="w-6 h-6 rounded-lg" />
              <Shimmer className="h-7 w-24" />
              <Shimmer className="h-3 w-32 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Search Page Skeleton
 */
export function SearchSkeleton() {
  return (
    <div className="space-y-8 pb-12 select-none animate-in fade-in duration-300">
      {/* Search Input Hero */}
      <div className="space-y-2">
        <Shimmer className="h-8 sm:h-9 w-64" />
        <Shimmer className="h-3.5 w-80 max-w-[80%]" />
        <div className="pt-3 max-w-2xl">
          <Shimmer className="h-14 w-full rounded-2xl" />
        </div>
      </div>

      {/* Category Bento Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Shimmer className="w-5 h-5 rounded-md" />
          <Shimmer className="h-6 w-52" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-[#111412] border border-white/[0.08] h-32 flex flex-col justify-between"
            >
              <Shimmer className="h-3 w-20 rounded-md" />
              <Shimmer className="h-6 w-40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
