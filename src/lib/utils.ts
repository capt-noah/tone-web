import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://musicly-4l0y.onrender.com';

/**
 * Resolve user profile photo URL (handles base64, proxy media paths, full URLs, and fallback)
 */
export function getProfileImageUrl(photo?: string | null): string | null {
  if (!photo) return null;
  if (
    photo.startsWith('data:') ||
    photo.startsWith('blob:') ||
    photo.startsWith('http://') ||
    photo.startsWith('https://')
  ) {
    return photo;
  }
  if (photo.startsWith('/')) {
    return `${BACKEND_URL}${photo}`;
  }
  return `${BACKEND_URL}/media/${encodeURIComponent(photo)}`;
}

/**
 * Resolve audio streaming URL for a song
 */
export function getAudioStreamUrl(fileId: string): string {
  if (!fileId) return '';
  if (
    fileId.startsWith('tone-local://') ||
    fileId.startsWith('musicly-local://') ||
    fileId.startsWith('http://') ||
    fileId.startsWith('https://') ||
    fileId.startsWith('blob:') ||
    fileId.startsWith('/')
  ) {
    return fileId;
  }
  return `${BACKEND_URL}/media/audio/${encodeURIComponent(fileId)}`;
}

/**
 * Resolve high-resolution cover art URL for a song, album, or playlist.
 * Prioritizes extracting the original embedded album art from the audio file (:audioFileId),
 * with intelligent fallback to direct media proxy or placeholder.
 */
export function getCoverImageUrl(fileId?: string | null, audioFileId?: string | null): string {
  // If audioFileId is provided, request high-res embedded art from the audio file
  const targetId = audioFileId || fileId;
  if (!targetId) return '/images/icon.png';
  if (
    targetId.startsWith('tone-local://') ||
    targetId.startsWith('musicly-local://') ||
    targetId.startsWith('http://') ||
    targetId.startsWith('https://') ||
    targetId.startsWith('data:') ||
    targetId.startsWith('/')
  ) {
    return targetId;
  }
  return `${BACKEND_URL}/media/cover/${encodeURIComponent(targetId)}`;
}

/**
 * Format duration in seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
