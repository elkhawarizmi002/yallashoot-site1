import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import { submitToIndexNow } from "@/lib/indexing";
import { generateMatchSlug } from "@/lib/matchSlug";
import { getLeagueSlug, getTeamSlug } from "@/lib/seoSlugs";

export const dynamic = "force-dynamic";

/**
 * Common submission runner for IndexNow
 */
async function runIndexNowSubmission(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.yallahsoot.com";

  try {
    await dbConnect();

    const urlsToSubmit = new Set<string>();

    // 1. Static high-priority pages
    ["/", "/live", "/news", "/highlights"].forEach((p) =>
      urlsToSubmit.add(`${baseUrl}${p}`)
    );

    // 2. All 15 Primary League Standings pages (/league/[slug]/standings)
    const leagueIds = [572, 7, 11, 35, 17, 25, 557, 649, 8935, 5930, 624, 623, 329, 167, 573];
    leagueIds.forEach((id) =>
      urlsToSubmit.add(`${baseUrl}/league/${getLeagueSlug(id)}/standings`)
    );

    // 3. Recent match pages from last 7 days
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const docs = await LiveMatch.find({ date: { $gte: cutoff } })
      .sort({ date: -1 })
      .lean();

    const teamIdsSeen = new Set<number>();
    const teamNameMap = new Map<number, string>();

    docs.forEach((doc: any) => {
      if (!Array.isArray(doc.matches)) return;
      doc.matches.forEach((m: any) => {
        if (!m || !m.id) return;

        const home = m.homeCompetitor || m.teamHome || m.home || { name: "team1" };
        const away = m.awayCompetitor || m.teamAway || m.away || { name: "team2" };

        const slug = m.slug || generateMatchSlug(home, away, m.id);
        urlsToSubmit.add(`${baseUrl}/match/${slug}`);

        const homeId = Number(home.id || m.homeCompetitorId);
        const awayId = Number(away.id || m.awayCompetitorId);
        if (homeId) {
          teamIdsSeen.add(homeId);
          if (home.name || home.nameForURL) teamNameMap.set(homeId, home.nameForURL || home.name);
        }
        if (awayId) {
          teamIdsSeen.add(awayId);
          if (away.name || away.nameForURL) teamNameMap.set(awayId, away.nameForURL || away.name);
        }
      });
    });

    // 4. Important base teams
    [1339, 227, 1224, 8633, 8634, 8456, 8455, 8464,
      8543, 8548, 8650, 8649, 8648, 8871, 8852, 8853,
      104, 106, 132, 139].forEach((id) => teamIdsSeen.add(id));

    teamIdsSeen.forEach((id) => {
      const slug = getTeamSlug(id, teamNameMap.get(id));
      urlsToSubmit.add(`${baseUrl}/team/${slug}`);
    });

    // 5. Submit in batches of 100
    const urlArray = Array.from(urlsToSubmit);
    const BATCH_SIZE = 100;
    const results = [];

    for (let i = 0; i < urlArray.length; i += BATCH_SIZE) {
      const batch = urlArray.slice(i, i + BATCH_SIZE);
      const result = await submitToIndexNow(batch);
      results.push({
        batch: Math.floor(i / BATCH_SIZE) + 1,
        count: batch.length,
        success: result.success,
        status: result.status,
      });
    }

    const allSuccess = results.every((r) => r.success);
    return NextResponse.json({
      success: allSuccess,
      totalUrls: urlArray.length,
      batches: results,
      message: `Submitted ${urlArray.length} URLs to IndexNow in ${results.length} batch(es)`,
    });
  } catch (error: any) {
    console.error("[Cron/IndexNow] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return runIndexNowSubmission(request);
}

export async function POST(request: Request) {
  return runIndexNowSubmission(request);
}
