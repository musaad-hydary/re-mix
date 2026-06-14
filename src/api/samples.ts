import axios from "axios";
import type {
  SearchResponse,
  TrackDetailResponse,
  ArtistResponse,
  TrendingResponse,
  ArtworkResponse,
} from "../types";

const api = axios.create({
  baseURL: "http://localhost:3001/api/samples",
});

export const fetchFromPool = async (): Promise<TrackDetailResponse> => {
  const { data } = await api.get("/pool");
  return data;
};

export const fetchArtwork = async (term: string): Promise<ArtworkResponse> => {
  const { data } = await api.get("/artwork", { params: { term } });
  return data;
};

export const resolveTrack = async (
  query: string,
): Promise<TrackDetailResponse> => {
  const { data } = await api.get("/resolve", { params: { query } });
  return data;
};

export const searchSamples = async (query: string): Promise<SearchResponse> => {
  const { data } = await api.get("/search", { params: { query } });
  return data;
};

export const fetchTrackDetail = async (
  artistSlug: string,
  trackSlug: string,
): Promise<TrackDetailResponse> => {
  const { data } = await api.get("/track", {
    params: { artist_slug: artistSlug, track_slug: trackSlug },
  });
  return data;
};

export const fetchArtist = async (
  artistSlug: string,
): Promise<ArtistResponse> => {
  const { data } = await api.get("/artist", {
    params: { artist_slug: artistSlug },
  });
  return data;
};

export const fetchTrending = async (): Promise<TrendingResponse> => {
  const { data } = await api.get("/trending");
  return data;
};

export const slugFromUrl = (
  url: string,
): { artistSlug: string; trackSlug: string } | null => {
  try {
    const path = new URL(url).pathname;
    const parts = path.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { artistSlug: parts[0], trackSlug: decodeURIComponent(parts[1]) };
  } catch {
    return null;
  }
};
