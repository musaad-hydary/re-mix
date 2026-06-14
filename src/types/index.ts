export interface ArtworkResponse {
  artworkUrl: string | null;
  trackName: string | null;
  artistName: string | null;
  collectionName: string | null;
}

export interface SearchResultItem {
  name: string;
  url: string;
}

export interface SearchResponse {
  status: string;
  data: {
    top_hit: SearchResultItem | null;
    artists: SearchResultItem[];
    tracks: SearchResultItem[];
  };
}

export interface SampleConnection {
  section: string;
  name: string;
  artist: string;
  year: string | null;
  tag: string;
  url: string;
}

export interface TrackDetail {
  title: string;
  artist: string;
  album: string | null;
  year: string | null;
  connections_summary: SampleConnection[];
}

export interface TrackDetailResponse {
  status: string;
  data: TrackDetail;
}

export interface ArtistInfo {
  real_name: string | null;
  aliases: string[];
  groups: string[];
  stats_summary: string;
}

export interface ArtistResponse {
  status: string;
  data: ArtistInfo;
}

export interface TrendingItem {
  name: string;
  url: string;
}

export interface TrendingResponse {
  status: string;
  data: TrendingItem[];
}
