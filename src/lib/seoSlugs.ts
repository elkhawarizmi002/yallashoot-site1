import { toSlugSegment, extractIdFromSlug } from "./matchSlug";

export const LEAGUE_SLUG_MAP: Record<number, string> = {
  572: "uefa-champions-league",
  7: "premier-league",
  11: "la-liga",
  35: "ligue-1",
  17: "serie-a",
  25: "bundesliga",
  557: "botola-pro",
  649: "saudi-pro-league",
  8935: "egyptian-premier-league",
  5930: "world-cup",
  624: "caf-champions-league",
  623: "afc-champions-league",
  329: "euro",
  167: "afcon",
  573: "europa-league",
};

export const REVERSE_LEAGUE_SLUG_MAP: Record<string, number> = Object.entries(LEAGUE_SLUG_MAP).reduce(
  (acc, [id, slug]) => {
    acc[slug] = Number(id);
    return acc;
  },
  {} as Record<string, number>
);

/**
 * Returns canonical league slug URL segment, e.g. "la-liga-11"
 */
export function getLeagueSlug(leagueId: number | string, fallbackName?: string): string {
  const numId = Number(leagueId);
  const mapped = LEAGUE_SLUG_MAP[numId];
  if (mapped) {
    return `${mapped}-${numId}`;
  }
  if (fallbackName) {
    const slugSegment = toSlugSegment(fallbackName);
    return `${slugSegment}-${numId}`;
  }
  return `league-${numId}`;
}

/**
 * Parses a league slug or ID string into numeric league ID.
 * Supports:
 * - "la-liga-11" -> 11
 * - "11" -> 11
 * - "la-liga" -> 11
 */
export function parseLeagueId(param: string | undefined | null): number | null {
  if (!param) return null;
  const trimmed = param.trim();

  // If purely numeric
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }

  // If mapped directly
  if (REVERSE_LEAGUE_SLUG_MAP[trimmed]) {
    return REVERSE_LEAGUE_SLUG_MAP[trimmed];
  }

  // Extract trailing digits: "la-liga-11" -> "11"
  const extracted = extractIdFromSlug(trimmed);
  if (extracted && /^\d+$/.test(extracted)) {
    return Number(extracted);
  }

  return null;
}

/**
 * Returns canonical team slug URL segment, e.g. "barcelona-132"
 */
export function getTeamSlug(teamId: number | string, teamName?: string): string {
  const numId = Number(teamId);
  if (teamName) {
    const segment = toSlugSegment(teamName);
    return `${segment}-${numId}`;
  }
  return `team-${numId}`;
}

/**
 * Parses team ID from team slug or ID string.
 * Supports "barcelona-132" -> "132", "132" -> "132"
 */
export function parseTeamId(param: string | undefined | null): string {
  if (!param) return "";
  const trimmed = param.trim();
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  return extractIdFromSlug(trimmed);
}
