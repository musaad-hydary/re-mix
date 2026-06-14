import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import fs from "fs";
import path from "path";

const getApi = () =>
  axios.create({
    baseURL: process.env.PARSE_BASE_URL,
    headers: { "X-API-Key": process.env.PARSE_API_KEY },
  });

const cleanCandidate = (s: string) =>
  s
    .replace(/\(feat\.[^)]*\)/gi, "")
    .replace(/feat\.\s*[^,]+/gi, "")
    .replace(/\([^)]*\)/g, "")
    .trim();

const POOL_CACHE_PATH = path.join(__dirname, "../../pool-cache.json");
const TARGET_SIZE = 20;
const MAX_NEW_PER_RUN = 8;

interface ResolvedTrack {
  data: {
    title: string;
    artist: string;
    connections_summary: Array<{ section: string }>;
  };
}

function loadExisting(): ResolvedTrack[] {
  try {
    if (fs.existsSync(POOL_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(POOL_CACHE_PATH, "utf-8"));
    }
  } catch {
    // ignore
  }
  return [];
}

function isDuplicate(pool: ResolvedTrack[], track: ResolvedTrack): boolean {
  return pool.some(
    (t) =>
      t.data.title === track.data.title && t.data.artist === track.data.artist,
  );
}

async function main() {
  const existing = loadExisting();
  console.log(`Existing pool: ${existing.length} tracks`);

  if (existing.length >= TARGET_SIZE) {
    console.log(`Already at or above target (${TARGET_SIZE}), nothing to do.`);
    return;
  }

  const trendingRes = await getApi().get("/get_trending_samples");
  const items: { name: string; url: string }[] = trendingRes.data?.data ?? [];

  const pool: ResolvedTrack[] = [...existing];
  let addedThisRun = 0;

  for (const item of items) {
    if (pool.length >= TARGET_SIZE) break;
    if (addedThisRun >= MAX_NEW_PER_RUN) break;

    const splitIdx = item.name.indexOf(" sample of ");
    const rawCandidates: string[] = [];
    if (splitIdx !== -1) {
      rawCandidates.push(item.name.slice(0, splitIdx));
      rawCandidates.push(item.name.slice(splitIdx + " sample of ".length));
    } else {
      rawCandidates.push(item.name);
    }

    const candidates = [
      ...rawCandidates,
      ...rawCandidates.map(cleanCandidate).filter((c) => c.length > 0),
    ];

    for (const candidate of candidates) {
      try {
        const searchRes = await getApi().get("/search", {
          params: { query: candidate },
        });
        const topHit = searchRes.data?.data?.top_hit;
        if (!topHit?.url) continue;

        const p = new URL(topHit.url).pathname;
        const parts = p.split("/").filter(Boolean);
        if (parts.length < 2) continue;

        const artist_slug = parts[0];
        const track_slug = decodeURIComponent(parts[1]);

        const detailRes = await getApi().get("/get_track_detail", {
          params: { artist_slug, track_slug },
        });

        const hasOriginal = detailRes.data?.data?.connections_summary?.some(
          (c: { section: string }) =>
            c.section.startsWith("Contains samples of"),
        );

        if (hasOriginal) {
          const track: ResolvedTrack = detailRes.data;
          if (!isDuplicate(pool, track)) {
            pool.push(track);
            addedThisRun++;
            console.log(`✓ Added: ${track.data.artist} - ${track.data.title}`);
          } else {
            console.log(
              `· Skipped duplicate: ${track.data.artist} - ${track.data.title}`,
            );
          }
          break;
        }
      } catch {
        continue;
      }
    }
  }

  fs.writeFileSync(POOL_CACHE_PATH, JSON.stringify(pool, null, 2));
  console.log(
    `\nPool now has ${pool.length} tracks (added ${addedThisRun} this run)`,
  );
}

main().catch(console.error);
