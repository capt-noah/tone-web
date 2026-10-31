import { db } from "../src/db";
import { music, musicArtists } from "../src/schema/music";
import { albums } from "../src/schema/albums";
import { artists } from "../src/schema/artists";
import { eq, and, sql } from "drizzle-orm";

async function correct() {
  console.log("Starting album records correction...");

  // 1. Get Alex Jean artist ID
  const allArtists = await db.select().from(artists);
  const alexJean = allArtists.find(a => a.name.toLowerCase() === "alex jean");
  const carltonPearson = allArtists.find(a => a.name.toLowerCase() === "carlton pearson");
  const aurae = allArtists.find(a => a.name.toLowerCase() === "aurae");

  if (!alexJean) {
    throw new Error("Alex Jean artist not found in DB");
  }

  // Helper to find or create album
  async function ensureAlbum(title: string, artistId: string): Promise<string> {
    const [existing] = await db.select().from(albums).where(and(
      sql`LOWER(${albums.title}) = LOWER(${title})`,
      eq(albums.artistId, artistId)
    )).limit(1);

    if (existing) {
      console.log(`Album exists: "${title}" (ID: ${existing.id})`);
      return existing.id;
    }

    const [inserted] = await db.insert(albums).values({
      title,
      artistId,
    }).returning();
    console.log(`Created album: "${title}" (ID: ${inserted.id})`);
    return inserted.id;
  }

  // 2. Ensure albums exist
  const theeAuthorsBalladId = await ensureAlbum("THEE AUTHORS BALLAD", alexJean.id);
  const moreThanGoldId = await ensureAlbum("More Than Gold", alexJean.id);
  const liveAtAzusaId = carltonPearson ? await ensureAlbum("Live at Azusa", carltonPearson.id) : null;
  const leadMeId = aurae ? await ensureAlbum("Lead Me", aurae.id) : null;

  // 3. Define specific track to album mappings
  const alexJeanTheeAuthorsBallad = [
    "Stand Firm, You'll Win",
    "The Gospel Of Thunder",
    "Matthew 18:20",
    "Way Too Good",
    "Gravity & Grace (Interlude)",
    "When Air Refuses To Answer",
    "Burning Bright In Bitter Winds",
    "In My Bag",
    "Red + Green"
  ];

  const alexJeanMoreThanGold = [
    "More Than Gold: THEME",
    "Wait For Me",
    "In Your Way",
    "I Need Faith",
    "Dance With You"
  ];

  const carltonPearsonTracks = [
    "We'll Understand It Better By and By",
    "I Know the Lord Will Make a Way Somehow (Live)",
    "He Lives (Live)",
    "Catch On Fire (Live)",
    "Walk With Me (Live)"
  ];

  const auraeLeadMeTracks = [
    "Milk & Honey",
    "Take My Heart"
  ];

  // 4. Update tracks
  const allSongs = await db.select().from(music);

  for (const title of alexJeanTheeAuthorsBallad) {
    const song = allSongs.find(s => s.title.toLowerCase() === title.toLowerCase());
    if (song) {
      await db.update(music).set({ albumId: theeAuthorsBalladId }).where(eq(music.id, song.id));
      console.log(`Assigned "${song.title}" -> THEE AUTHORS BALLAD`);
    } else {
      console.warn(`Song not found: "${title}"`);
    }
  }

  for (const title of alexJeanMoreThanGold) {
    const song = allSongs.find(s => s.title.toLowerCase() === title.toLowerCase());
    if (song) {
      await db.update(music).set({ albumId: moreThanGoldId }).where(eq(music.id, song.id));
      console.log(`Assigned "${song.title}" -> More Than Gold`);
    } else {
      console.warn(`Song not found: "${title}"`);
    }
  }

  if (liveAtAzusaId) {
    for (const title of carltonPearsonTracks) {
      const song = allSongs.find(s => s.title.toLowerCase() === title.toLowerCase());
      if (song) {
        await db.update(music).set({ albumId: liveAtAzusaId }).where(eq(music.id, song.id));
        console.log(`Assigned "${song.title}" -> Live at Azusa`);
      }
    }
  }

  if (leadMeId) {
    for (const title of auraeLeadMeTracks) {
      const song = allSongs.find(s => s.title.toLowerCase() === title.toLowerCase());
      if (song) {
        await db.update(music).set({ albumId: leadMeId }).where(eq(music.id, song.id));
        console.log(`Assigned "${song.title}" -> Lead Me`);
      }
    }
  }

  // 5. Clean up redundant empty/orphaned albums (e.g. Gravity & Grace, Live at Azusa 2, Live at Azusa 3)
  const redundantTitles = ["Gravity & Grace", "Live at Azusa 2", "Live at Azusa 3"];
  for (const rTitle of redundantTitles) {
    const deleted = await db.delete(albums).where(sql`LOWER(${albums.title}) = LOWER(${rTitle})`).returning();
    if (deleted.length > 0) {
      console.log(`Cleaned up redundant album "${rTitle}" (${deleted.length} rows)`);
    }
  }

  console.log("Correction complete!");
  process.exit(0);
}

correct().catch(e => {
  console.error("Correction failed:", e);
  process.exit(1);
});
