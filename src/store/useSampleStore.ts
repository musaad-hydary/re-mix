import { create } from "zustand";
import {
  searchSamples,
  fetchTrackDetail,
  fetchArtwork,
  fetchFromPool,
  fetchArtist,
} from "../api/samples";
import type { TrackDetail, SearchResponse, ArtistInfo } from "../types";

interface HistoryEntry {
  track: TrackDetail;
  artistSlug: string;
  trackSlug: string;
}

interface SampleStore {
  current: TrackDetail | null;
  currentArtistSlug: string;
  currentTrackSlug: string;
  currentArtwork: string | null;
  originalArtwork: string | null;
  searchResults: SearchResponse["data"] | null;
  artistHistory: { flip: ArtistInfo | null; original: ArtistInfo | null };
  isLoading: boolean;
  error: string | null;
  theme: "light" | "dark";
  sampleCount: number;
  history: HistoryEntry[];

  surpriseMe: () => Promise<void>;
  search: (query: string) => Promise<void>;
  loadTrack: (artistSlug: string, trackSlug: string) => Promise<void>;
  loadSearchResult: (url: string) => Promise<void>;
  loadArtistHistory: () => Promise<void>;
  toggleTheme: () => void;
}

const fetchArtworkFor = (
  track: TrackDetail,
  set: (partial: Partial<SampleStore>) => void,
) => {
  fetchArtwork(`${track.artist} ${track.title}`)
    .then((art) => {
      set({ currentArtwork: art.artworkUrl });
    })
    .catch(() => {});

  const original = track.connections_summary.find((c) =>
    c.section.startsWith("Contains samples of"),
  );
  if (original) {
    fetchArtwork(`${original.artist} ${original.name}`)
      .then((art) => {
        set({ originalArtwork: art.artworkUrl });
      })
      .catch(() => {});
  } else {
    set({ originalArtwork: null });
  }
};

export const useSampleStore = create<SampleStore>((set, get) => ({
  current: null,
  currentArtistSlug: "",
  currentTrackSlug: "",
  currentArtwork: null,
  originalArtwork: null,
  searchResults: null,
  artistHistory: { flip: null, original: null },
  isLoading: false,
  error: null,
  theme: "light",
  sampleCount: 0,
  history: [],

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),

  loadTrack: async (artistSlug: string, trackSlug: string) => {
    set({
      isLoading: true,
      error: null,
      artistHistory: { flip: null, original: null },
      currentArtwork: null,
      originalArtwork: null,
    });
    try {
      const detail = await fetchTrackDetail(artistSlug, trackSlug);
      const track = detail.data;

      set((state) => {
        const filteredHistory = state.history.filter(
          (h) => !(h.artistSlug === artistSlug && h.trackSlug === trackSlug),
        );
        return {
          current: track,
          currentArtistSlug: artistSlug,
          currentTrackSlug: trackSlug,
          isLoading: false,
          sampleCount: state.sampleCount + 1,
          history: [{ track, artistSlug, trackSlug }, ...filteredHistory].slice(
            0,
            5,
          ),
        };
      });

      fetchArtworkFor(track, set);
    } catch {
      set({ error: "Failed to load track", isLoading: false });
    }
  },

  surpriseMe: async () => {
    set({
      isLoading: true,
      error: null,
      currentArtwork: null,
      originalArtwork: null,
      artistHistory: { flip: null, original: null },
    });
    try {
      const detail = await fetchFromPool();
      const track = detail.data;

      // Pool doesn't return slugs directly, so derive a best-effort slug for history.
      const artistSlug = track.artist.replace(/\s+/g, "-");
      const trackSlug = track.title.replace(/\s+/g, "-");

      set((state) => {
        const filteredHistory = state.history.filter(
          (h) =>
            !(h.track.title === track.title && h.track.artist === track.artist),
        );
        return {
          current: track,
          currentArtistSlug: artistSlug,
          currentTrackSlug: trackSlug,
          isLoading: false,
          sampleCount: state.sampleCount + 1,
          history: [{ track, artistSlug, trackSlug }, ...filteredHistory].slice(
            0,
            5,
          ),
        };
      });

      fetchArtworkFor(track, set);
    } catch {
      set({
        error: "Could not load a sample right now, try again later",
        isLoading: false,
      });
    }
  },

  search: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: null });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const res = await searchSamples(query);
      set({ searchResults: res.data, isLoading: false });
    } catch {
      set({ error: "Search failed", isLoading: false });
    }
  },

  loadSearchResult: async (url: string) => {
    const path = new URL(url).pathname;
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2) return;
    await get().loadTrack(parts[0], decodeURIComponent(parts[1]));
    set({ searchResults: null });
  },

  loadArtistHistory: async () => {
    const track = get().current;
    if (!track) return;

    const original = track.connections_summary.find((c) =>
      c.section.startsWith("Contains samples of"),
    );

    try {
      const flipSlug = track.artist.replace(/\s+/g, "-");
      const flipArtist = await fetchArtist(flipSlug);
      set((state) => ({
        artistHistory: { ...state.artistHistory, flip: flipArtist.data },
      }));
    } catch {
      // ignore
    }

    if (original) {
      try {
        const originalSlug = original.artist.replace(/\s+/g, "-");
        const originalArtist = await fetchArtist(originalSlug);
        set((state) => ({
          artistHistory: {
            ...state.artistHistory,
            original: originalArtist.data,
          },
        }));
      } catch {
        // ignore
      }
    }
  },
}));
