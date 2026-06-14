import { Router } from "express";
import type { Request, Response } from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import { cacheMiddleware } from "../middleware/cache";

const router = Router();

const getApi = () =>
  axios.create({
    baseURL: process.env.PARSE_BASE_URL,
    headers: {
      "X-API-Key": process.env.PARSE_API_KEY,
    },
  });

router.get(
  "/search",
  cacheMiddleware(3600),
  async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      if (!query) {
        res.status(400).json({ error: "Missing query parameter" });
        return;
      }
      const { data } = await getApi().get("/search", { params: { query } });
      res.json(data);
    } catch (err) {
      console.error("Search error:", err);
      res.status(500).json({ error: "Failed to search" });
    }
  },
);

router.get(
  "/track",
  cacheMiddleware(86400),
  async (req: Request, res: Response) => {
    try {
      const { artist_slug, track_slug } = req.query;
      if (!artist_slug || !track_slug) {
        res.status(400).json({ error: "Missing artist_slug or track_slug" });
        return;
      }
      const { data } = await getApi().get("/get_track_detail", {
        params: { artist_slug, track_slug },
      });
      res.json(data);
    } catch (err) {
      console.error("Track detail error:", err);
      res.status(500).json({ error: "Failed to fetch track detail" });
    }
  },
);

router.get(
  "/artist",
  cacheMiddleware(86400),
  async (req: Request, res: Response) => {
    try {
      const { artist_slug } = req.query;
      if (!artist_slug) {
        res.status(400).json({ error: "Missing artist_slug" });
        return;
      }
      const { data } = await getApi().get("/get_artist", {
        params: { artist_slug },
      });
      res.json(data);
    } catch (err) {
      console.error("Artist error:", err);
      res.status(500).json({ error: "Failed to fetch artist" });
    }
  },
);

router.get(
  "/artist-samples",
  cacheMiddleware(86400),
  async (req: Request, res: Response) => {
    try {
      const { artist_slug, tag, page } = req.query;
      if (!artist_slug) {
        res.status(400).json({ error: "Missing artist_slug" });
        return;
      }
      const { data } = await getApi().get("/get_artist_samples_used", {
        params: { artist_slug, tag, page },
      });
      res.json(data);
    } catch (err) {
      console.error("Artist samples error:", err);
      res.status(500).json({ error: "Failed to fetch artist samples" });
    }
  },
);

router.get(
  "/trending",
  cacheMiddleware(21600),
  async (req: Request, res: Response) => {
    try {
      const { data } = await getApi().get("/get_trending_samples");
      res.json(data);
    } catch (err) {
      console.error("Trending error:", err);
      res.status(500).json({ error: "Failed to fetch trending samples" });
    }
  },
);

router.get(
  "/resolve",
  cacheMiddleware(86400),
  async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      if (!query) {
        res.status(400).json({ error: "Missing query parameter" });
        return;
      }

      const queryStr = String(query);
      const splitIdx = queryStr.indexOf(" sample of ");

      const candidates: string[] = [];
      if (splitIdx !== -1) {
        candidates.push(queryStr.slice(0, splitIdx));
        candidates.push(queryStr.slice(splitIdx + " sample of ".length));
      } else {
        candidates.push(queryStr);
      }

      for (const candidate of candidates) {
        const searchRes = await getApi().get("/search", {
          params: { query: candidate },
        });
        const topHit = searchRes.data?.data?.top_hit;

        if (!topHit?.url) continue;

        const path2 = new URL(topHit.url).pathname;
        const parts = path2.split("/").filter(Boolean);
        if (parts.length < 2) continue;

        const artist_slug = parts[0];
        const track_slug = decodeURIComponent(parts[1]);

        const detailRes = await getApi().get("/get_track_detail", {
          params: { artist_slug, track_slug },
        });

        if (detailRes.data?.data?.connections_summary?.length > 0) {
          res.json(detailRes.data);
          return;
        }
      }

      res.status(404).json({ error: "No match found" });
    } catch (err) {
      console.error("Resolve error:", err);
      res.status(500).json({ error: "Failed to resolve track" });
    }
  },
);

router.get(
  "/artwork",
  cacheMiddleware(86400),
  async (req: Request, res: Response) => {
    try {
      const { term } = req.query;
      if (!term) {
        res.status(400).json({ error: "Missing term parameter" });
        return;
      }

      const { data } = await axios.get("https://itunes.apple.com/search", {
        params: { term, media: "music", limit: 1 },
      });

      const result = data?.results?.[0];
      if (!result) {
        res.json({ artworkUrl: null, trackName: null, artistName: null });
        return;
      }

      const artworkUrl = result.artworkUrl100
        ? result.artworkUrl100.replace("100x100", "600x600")
        : null;

      res.json({
        artworkUrl,
        trackName: result.trackName,
        artistName: result.artistName,
        collectionName: result.collectionName,
      });
    } catch (err) {
      console.error("Artwork error:", err);
      res.status(500).json({ error: "Failed to fetch artwork" });
    }
  },
);

// --- Pre-resolved pool for "Inspire Me", cached to disk ---
interface ResolvedTrack {
  data: {
    title: string;
    artist: string;
    album: string | null;
    year: string | null;
    connections_summary: Array<{
      section: string;
      name: string;
      artist: string;
      year: string | null;
      tag: string;
      url: string;
    }>;
  };
}

const POOL_CACHE_PATH = path.join(__dirname, "../../pool-cache.json");

const loadPoolFromDisk = (): ResolvedTrack[] => {
  try {
    if (fs.existsSync(POOL_CACHE_PATH)) {
      const raw = fs.readFileSync(POOL_CACHE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      console.log(`Loaded ${parsed.length} tracks from pool cache`);
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load pool cache:", err);
  }
  return [];
};

const savePoolToDisk = (pool: ResolvedTrack[]) => {
  try {
    fs.writeFileSync(POOL_CACHE_PATH, JSON.stringify(pool, null, 2));
    console.log(`Saved ${pool.length} tracks to pool cache`);
  } catch (err) {
    console.error("Failed to save pool cache:", err);
  }
};

const cleanCandidate = (s: string) =>
  s
    .replace(/\(feat\.[^)]*\)/gi, "")
    .replace(/feat\.\s*[^,]+/gi, "")
    .replace(/\([^)]*\)/g, "")
    .trim();

let resolvedPool: ResolvedTrack[] = loadPoolFromDisk();
let poolBuildPromise: Promise<void> | null = null;

const buildPool = async () => {
  try {
    const trendingRes = await getApi().get("/get_trending_samples");
    const items: { name: string; url: string }[] = trendingRes.data?.data ?? [];

    const pool: ResolvedTrack[] = [];

    for (const item of items) {
      if (pool.length >= 5) break;

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

          const path2 = new URL(topHit.url).pathname;
          const parts = path2.split("/").filter(Boolean);
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
            pool.push(detailRes.data);
            break;
          }
        } catch {
          continue;
        }
      }
    }

    resolvedPool = pool;
    savePoolToDisk(pool);
    console.log(`Pool built with ${pool.length} tracks`);
  } catch (err) {
    console.error("Pool build error:", err);
  }
};

router.get("/pool", async (_req: Request, res: Response) => {
  if (resolvedPool.length === 0 && !poolBuildPromise) {
    poolBuildPromise = buildPool();
  }
  if (poolBuildPromise) {
    await poolBuildPromise;
    poolBuildPromise = null;
  }

  if (resolvedPool.length === 0) {
    res.status(503).json({ error: "Pool not ready, try again shortly" });
    return;
  }

  const random = resolvedPool[Math.floor(Math.random() * resolvedPool.length)];
  res.json(random);
});

export default router;
