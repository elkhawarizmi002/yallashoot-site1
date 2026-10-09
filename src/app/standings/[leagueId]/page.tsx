import { permanentRedirect } from "next/navigation";
import { parseLeagueId, getLeagueSlug } from "@/lib/seoSlugs";

type RouteParams = {
  params: Promise<{ leagueId: string }>;
  searchParams: Promise<{ live?: string; tab?: string }>;
};

/**
 * Legacy Standings Page Redirect (HTTP 308/301 Permanent Redirect)
 * Preserves full backwards compatibility for old /standings/[leagueId] URLs
 * and routes crawlers/users to the keyword-rich /league/[slug]/standings path.
 */
export default async function LegacyStandingsRedirect({ params, searchParams }: RouteParams) {
  const { leagueId } = await params;
  const { live, tab } = await searchParams;

  const numLeagueId = parseLeagueId(leagueId);
  const slug = getLeagueSlug(numLeagueId || leagueId);

  const queryParams = new URLSearchParams();
  if (live) queryParams.set("live", live);
  if (tab) queryParams.set("tab", tab);
  const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";

  permanentRedirect(`/league/${slug}/standings${qs}`);
}
