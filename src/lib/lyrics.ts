/**
 * LRCLIB API utilities & LRC parser for Tone
 */

const LRCLIB_URL = 'https://lrclib.net/api';

export interface LrcLine {
  time: number | null;
  text: string;
}

export interface LrclibTrackResult {
  id: number;
  name?: string;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  syncedLyrics?: string | null;
  plainLyrics?: string | null;
}

/**
 * Fetch lyrics from LRCLIB using exact track metadata with smart search fallback.
 */
export async function fetchLyricsFromLrclib(
  trackName: string,
  artistName: string,
  albumName?: string | null,
  durationSec?: number
): Promise<{ syncedLyrics: string | null; plainLyrics: string | null; id?: number } | null> {
  if (!trackName) return null;

  // Clean title: remove "(Official Audio)", "(Remastered)", etc. for better search accuracy
  const cleanTrackName = trackName
    .replace(/\s*[\(\[](official\s*(audio|video|music\s*video)|remaster(ed)?|lyrics|audio)[\)\]]/gi, '')
    .trim();

  const cleanArtistName = (artistName || '')
    .replace(/\s*[\(\[](feat|ft\.)[^\)\]]+[\)\]]/gi, '')
    .trim();

  // Try 1: Exact /get query
  try {
    const params = new URLSearchParams({
      track_name: cleanTrackName || trackName,
      artist_name: cleanArtistName || artistName,
    });
    if (albumName && albumName !== 'Standalone Tracks') {
      params.set('album_name', albumName);
    }
    if (durationSec && durationSec > 0) {
      params.set('duration', Math.round(durationSec).toString());
    }

    const res = await fetch(`${LRCLIB_URL}/get?${params.toString()}`);
    if (res.ok) {
      const data: LrclibTrackResult = await res.json();
      if (data.syncedLyrics || data.plainLyrics) {
        return {
          syncedLyrics: data.syncedLyrics || null,
          plainLyrics: data.plainLyrics || null,
          id: data.id,
        };
      }
    }
  } catch (e) {
    console.warn('[LRCLIB] Exact get failed, falling back to search:', e);
  }

  // Try 2: General /search query
  try {
    const searchParams = new URLSearchParams({
      track_name: cleanTrackName || trackName,
      artist_name: cleanArtistName || artistName,
    });

    const searchRes = await fetch(`${LRCLIB_URL}/search?${searchParams.toString()}`);
    if (searchRes.ok) {
      const results: LrclibTrackResult[] = await searchRes.json();
      if (Array.isArray(results) && results.length > 0) {
        // Prioritize synced lyrics, then closest duration match
        const withSynced = results.find((r) => r.syncedLyrics);
        const best = withSynced || results[0];
        if (best.syncedLyrics || best.plainLyrics) {
          return {
            syncedLyrics: best.syncedLyrics || null,
            plainLyrics: best.plainLyrics || null,
            id: best.id,
          };
        }
      }
    }
  } catch (e) {
    console.error('[LRCLIB] Search failed:', e);
  }

  return null;
}

/**
 * Search LRCLIB candidates by custom query
 */
export async function searchLyricsCandidates(
  query: string,
  artist?: string
): Promise<LrclibTrackResult[]> {
  if (!query.trim()) return [];

  try {
    const params = new URLSearchParams();
    if (artist && artist.trim()) {
      params.set('track_name', query.trim());
      params.set('artist_name', artist.trim());
    } else {
      params.set('q', query.trim());
    }

    const res = await fetch(`${LRCLIB_URL}/search?${params.toString()}`);
    if (!res.ok) return [];

    const data: LrclibTrackResult[] = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('[LRCLIB] Candidate search error:', e);
    return [];
  }
}

/**
 * Parse an LRC or plain text string into structured lines
 */
export function parseLrc(lrcContent?: string | null): LrcLine[] {
  if (!lrcContent || !lrcContent.trim()) return [];

  const lines = lrcContent.split('\n');
  const result: LrcLine[] = [];
  const timestampRegex = /\[(\d{2}):(\d{2}(?:\.\d+)?)\]/g;
  const tagRegex = /^\[(ti|ar|al|au|by|offset|length|re|ve):.*\]$/i;

  let hasTimestamp = false;

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Ignore metadata tags like [ti:Title]
    if (tagRegex.test(trimmed)) continue;

    // Check for one or more timestamps in the line (e.g., [00:12.34][00:45.67] Chorus)
    const matches = Array.from(trimmed.matchAll(timestampRegex));
    if (matches.length > 0) {
      hasTimestamp = true;
      const textOnly = trimmed.replace(timestampRegex, '').trim();

      for (const match of matches) {
        const mins = parseInt(match[1], 10);
        const secs = parseFloat(match[2]);
        const time = mins * 60 + secs;
        result.push({ time, text: textOnly });
      }
    } else {
      result.push({ time: null, text: trimmed });
    }
  }

  if (hasTimestamp) {
    // Sort chronological lines, keeping header non-timestamp lines first if any
    result.sort((a, b) => {
      if (a.time === null) return -1;
      if (b.time === null) return 1;
      return a.time - b.time;
    });
  }

  return result;
}

/**
 * Format seconds into an LRC timestamp [mm:ss.xx]
 */
export function formatLrcTimestamp(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '[00:00.00]';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.padStart(5, '0');
  return `[${formattedMins}:${formattedSecs}]`;
}

const LYRICS_CACHE_PREFIX = 'tone_lyrics_';
const LEGACY_LYRICS_CACHE_PREFIX = 'musicly_lyrics_';

/**
 * Retrieve cached lyrics from localStorage
 */
export function getCachedLyrics(songId: string): string | null {
  if (typeof window === 'undefined' || !songId) return null;
  try {
    return (
      localStorage.getItem(`${LYRICS_CACHE_PREFIX}${songId}`) ||
      localStorage.getItem(`${LEGACY_LYRICS_CACHE_PREFIX}${songId}`)
    );
  } catch {
    return null;
  }
}

/**
 * Persist lyrics to local storage cache
 */
export function setCachedLyrics(songId: string, lyrics: string | null): void {
  if (typeof window === 'undefined' || !songId) return;
  try {
    if (lyrics && lyrics.trim()) {
      localStorage.setItem(`${LYRICS_CACHE_PREFIX}${songId}`, lyrics);
    } else {
      localStorage.removeItem(`${LYRICS_CACHE_PREFIX}${songId}`);
      localStorage.removeItem(`${LEGACY_LYRICS_CACHE_PREFIX}${songId}`);
    }
  } catch (e) {
    console.warn('[Lyrics] Failed to cache lyrics locally:', e);
  }
}

