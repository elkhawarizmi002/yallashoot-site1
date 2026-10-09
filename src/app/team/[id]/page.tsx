import React from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { 
  getCompetitorProfile, 
  getCompetitorSquad, 
  getCompetitorTransfers, 
  getCompetitorFixtures,
  getCompetitorStandingsTable,
  getCompetitorStats,
  getCompetitorSEO,
  getCompetitorRelatedEntities,
  getCompetitionBrackets,
  getCompetitorResults
} from "@/services/api";
import TeamDetailsClient from "@/components/TeamDetailsClient";
import { parseTeamId, getTeamSlug } from "@/lib/seoSlugs";

import { Metadata } from "next";

interface TeamPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { id: rawSlug } = await params;
  const teamId = parseTeamId(rawSlug);

  if (!teamId) {
    return {
      title: "الفريق غير موجود - يلا شوت",
      robots: { index: false, follow: true },
    };
  }

  try {
    const profileRes = await getCompetitorProfile(teamId);
    if (!profileRes || !profileRes.competitors || profileRes.competitors.length === 0) {
      return {
        title: "الفريق غير موجود - يلا شوت",
        robots: {
          index: false,
          follow: true,
        },
      };
    }
    const team = profileRes.competitors[0];
    const teamName = team.name || "الفريق";
    const canonicalSlug = getTeamSlug(teamId, team.nameForURL || team.name);

    // Short title strictly ≤ 50 chars including template
    const titleText = `نادي ${teamName} - النتائج والتشكيلة`;
    const descText = `متابعة مباريات نادي ${teamName} اليوم مباشرة، جداول الترتيب، قائمة اللاعبين، والنتائج الأخيرة عبر يلا شوت.`;

    return {
      title: titleText,
      description: descText,
      alternates: {
        canonical: `/team/${canonicalSlug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: titleText,
        description: descText,
        type: "website",
        images: team.id
          ? [`https://imagecache.365scores.com/image/upload/f_auto,w_300,h_300,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${team.id}`]
          : [],
      },
    };
  } catch {
    return {
      title: "تفاصيل الفريق - يلا شوت",
      alternates: {
        canonical: `/team/${rawSlug}`,
      },
    };
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id: rawSlug } = await params;
  const teamId = parseTeamId(rawSlug);
  
  if (!teamId) {
    return notFound();
  }

  try {
    // 1. Fetch competitor profile
    const profileRes = await getCompetitorProfile(teamId);
    if (!profileRes || !profileRes.competitors || profileRes.competitors.length === 0) {
      return notFound();
    }
    const team = profileRes.competitors[0];
    const canonicalSlug = getTeamSlug(teamId, team.nameForURL || team.name);

    // If accessed by pure ID (/team/132), 301/308 redirect to keyword slug (/team/barcelona-132)
    if (rawSlug !== canonicalSlug) {
      permanentRedirect(`/team/${canonicalSlug}`);
    }

    // 2. Fetch squad list
    const squadRes = await getCompetitorSquad(teamId).catch(() => null);

    // 3. Fetch transfers list
    const transfersRes = await getCompetitorTransfers(teamId).catch(() => null);

    // 4. Fetch fixtures and results
    const fixturesRes = await getCompetitorFixtures(teamId).catch(() => null);
    let resultsRes = null;
    if (fixturesRes && Array.isArray(fixturesRes.games) && fixturesRes.games.length > 0) {
      const soonestGameId = fixturesRes.games[0].id;
      if (soonestGameId) {
        resultsRes = await getCompetitorResults(teamId, soonestGameId).catch(() => null);
      }
    }

    // 5. Fetch standings table
    const standingsRes = await getCompetitorStandingsTable(teamId).catch(() => null);

    // 6. Fetch stats
    const statsRes = await getCompetitorStats(teamId).catch(() => null);

    // 7. Fetch SEO & related entities
    const seoRes = await getCompetitorSEO(teamId).catch(() => null);
    const relatedRes = await getCompetitorRelatedEntities(teamId).catch(() => null);

    // 8. Fetch brackets if available
    let bracketsRes = null;
    if (team.competitionId) {
      bracketsRes = await getCompetitionBrackets(team.competitionId).catch(() => null);
    }

    return (
      <TeamDetailsClient
        team={team}
        squad={squadRes}
        transfers={transfersRes}
        games={fixturesRes?.games || []}
        standings={standingsRes}
        stats={statsRes}
        seo={seoRes}
        related={relatedRes}
        brackets={bracketsRes}
      />
    );
  } catch (err: any) {
    // Re-throw redirect so Next.js redirect works
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Error loading team page:", err);
    return notFound();
  }
}
