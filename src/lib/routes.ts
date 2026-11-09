import type { MediaType } from "./types";

export function detailHref(item: { id: number; type: MediaType }) {
  return `/${item.type}/${item.id}`;
}

export function watchHref(item: { id: number; type: MediaType; season?: number; episode?: number }) {
  return item.type === "movie"
    ? `/watch/movie/${item.id}`
    : `/watch/tv/${item.id}/${item.season ?? 1}/${item.episode ?? 1}`;
}
