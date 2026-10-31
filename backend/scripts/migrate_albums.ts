import { db } from "../src/db";
import { music } from "../src/schema/music";
import { albums } from "../src/schema/albums";
import { artists } from "../src/schema/artists";
import { eq, and, sql } from "drizzle-orm";

async function migrate() {
  console.log("Starting album categorization migration...");

  // 1. Map of authentic albums to create: { albumTitle: artistName }
  const realAlbumsDef: Record<string, string> = {
    "CHILD OF GOD": "Forrest Frank",
    "The Prodigal": "Josiah Queen",
    "Live at Azusa": "Carlton Pearson",
    "Live at Azusa 2": "Carlton Pearson",
    "Live at Azusa 3": "Carlton Pearson",
    "Live from Los Angeles": "Beverly Crawford",
    "The Nu Nation Project": "Kirk Franklin",
    "Father's Day": "Kirk Franklin",
    "Crown of Glory": "Sstedi",
    "YAHWEH": "Party Wave",
    "Honest To God": "LIN D",
    "Never Land II": "Andy Mineo",
    "All Things Work Together": "Lecrae",
    "God Is Good! (Live)": "Cody Carnes",
    "Lead Me": "Aurae",
    "Gravity & Grace": "Alex Jean",
    "In The A.M.": "Red Tips",
  };

  const allArtists = await db.select().from(artists);
  const artistMap = new Map(allArtists.map(a => [a.name.toLowerCase(), a.id]));

  // Create real albums
  const createdAlbumIds: Record<string, string> = {};
  for (const [title, artistName] of Object.entries(realAlbumsDef)) {
    const artistId = artistMap.get(artistName.toLowerCase());
    if (!artistId) {
      console.warn(`Artist not found for "${artistName}"`);
      continue;
    }

    const [existing] = await db.select().from(albums).where(and(
      sql`LOWER(${albums.title}) = LOWER(${title})`,
      eq(albums.artistId, artistId)
    )).limit(1);

    if (existing) {
      createdAlbumIds[title] = existing.id;
      console.log(`Album already exists: "${title}" (ID: ${existing.id})`);
    } else {
      const [inserted] = await db.insert(albums).values({
        title,
        artistId,
      }).returning();
      createdAlbumIds[title] = inserted.id;
      console.log(`Created album: "${title}" for "${artistName}" (ID: ${inserted.id})`);
    }
  }

  // 2. Mapping of song titles to their legitimate album title (if any)
  // Any song not in this map is a standalone single and will have albumId = null.
  const songToAlbum: Record<string, string> = {
    // Forrest Frank
    "UP!": "CHILD OF GOD",
    "NO LONGER BOUND": "CHILD OF GOD",
    "MIRACLE WORKER": "CHILD OF GOD",

    // Josiah Queen
    "Dusty Bibles": "The Prodigal",
    "Two Wooden Beams": "The Prodigal",
    "Yesterday Is Dead": "The Prodigal",

    // Carlton Pearson
    "We'll Understand It Better By and By": "Live at Azusa",
    "I Know the Lord Will Make a Way Somehow (Live)": "Live at Azusa",
    "He Lives (Live)": "Live at Azusa",
    "Catch On Fire (Live)": "Live at Azusa 2",
    "Walk With Me (Live)": "Live at Azusa 3",

    // Beverly Crawford
    "I'm Still Standing (Live)": "Live from Los Angeles",
    "It's About Time for a Miracle": "Live from Los Angeles",

    // Kirk Franklin
    "Revolution": "The Nu Nation Project",
    "Gonna Be A Lovely Day": "The Nu Nation Project",
    "I Like Me": "Father's Day",
    "Before I Die": "Father's Day",

    // Sstedi
    "Psalm to Him": "Crown of Glory",
    "Crown of Glory": "Crown of Glory",
    "Flourish": "Crown of Glory",

    // Party Wave
    "YAHWEH": "YAHWEH",
    "WHERE'D THE LOVE GO?": "YAHWEH",

    // LIN D
    "Counting My Blessings": "Honest To God",
    "Foolish Mind": "Honest To God",
    "Lord I Need You": "Honest To God",
    "Praise You": "Honest To God",
    "Lies": "Honest To God",
    "Move": "Honest To God",
    "Yahweh": "Honest To God",

    // Andy Mineo
    "ABOVE IT": "Never Land II",
    "Coming In Hot": "Never Land II",

    // Lecrae
    "I'll Find You": "All Things Work Together",

    // Cody Carnes
    "Take You At Your Word (Live)": "God Is Good! (Live)",

    // Aurae
    "Milk & Honey": "Lead Me",

    // Alex Jean
    "Gravity & Grace (Interlude)": "Gravity & Grace",

    // Red Tips
    "Yuckie": "In The A.M.",
  };

  // 3. Update music table
  const allSongs = await db.select().from(music);
  let updatedCount = 0;
  let singlesCount = 0;

  for (const s of allSongs) {
    const albTitle = songToAlbum[s.title];
    const targetAlbumId = albTitle ? (createdAlbumIds[albTitle] || null) : null;

    await db.update(music).set({
      albumId: targetAlbumId
    }).where(eq(music.id, s.id));

    if (targetAlbumId) {
      updatedCount++;
    } else {
      singlesCount++;
    }
  }

  console.log(`Songs categorized: ${updatedCount} assigned to real albums, ${singlesCount} set as standalone singles (albumId: null).`);

  // 4. Delete the 21 placeholder "Standalone Tracks" albums from albums table
  const deleted = await db.delete(albums).where(eq(albums.title, "Standalone Tracks")).returning();
  console.log(`Deleted ${deleted.length} placeholder "Standalone Tracks" albums from albums table.`);

  console.log("Migration complete!");
  process.exit(0);
}

migrate().catch(e => {
  console.error("Migration failed:", e);
  process.exit(1);
});
