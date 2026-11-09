export type MediaType = "movie" | "tv";

export type MediaItem = {
  id: number;
  type: MediaType;
  title: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  year: string;
  rating: number;
  genreIds: number[];
};

export type Genre = { id: number; name: string };

export type CastMember = { id: number; name: string; character: string; profile: string | null };

type DetailBase = MediaItem & {
  logo: string | null;
  genres: Genre[];
  tagline: string;
  cast: CastMember[];
  recommendations: MediaItem[];
  trailerKey: string | null;
};

export type MovieDetail = DetailBase & { type: "movie"; runtime: number | null };

export type SeasonSummary = {
  number: number;
  name: string;
  episodeCount: number;
  poster: string | null;
  year: string;
};

export type ShowDetail = DetailBase & {
  type: "tv";
  seasons: SeasonSummary[];
  status: string;
  episodeRuntime: number | null;
};

export type Episode = {
  number: number;
  season: number;
  name: string;
  overview: string;
  still: string | null;
  runtime: number | null;
  airDate: string | null;
};

export type Season = { number: number; name: string; episodes: Episode[] };
