import { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import Article from "@/models/Article";
import Highlight from "@/models/Highlight";
import LiveMatch from "@/models/LiveMatch";
import { generateMatchSlug } from "@/lib/matchSlug";
import { getGamesList } from "@/services/api";
import { getLeagueSlug, getTeamSlug } from "@/lib/seoSlugs";

export const revalidate = 1800; // Revalidate sitemap every 30 minutes (Bing requirement)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.yallahsoot.com";

  // 1. Static Core Site Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/highlights`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // 2. All 15 Primary League Standings Pages (Canonical /league/[slug]/standings)
  const leagueIds = [572, 7, 11, 35, 17, 25, 557, 649, 8935, 5930, 624, 623, 329, 167, 573];
  const standingsUrls: MetadataRoute.Sitemap = leagueIds.map((id) => ({
    url: `${baseUrl}/league/${getLeagueSlug(id)}/standings`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // 3. Dynamic Team Profile Pages (Mapping id -> slug)
  const baseTeamIds = [
    8633, 8634, 8456, 8455, 8464, 8543, 8548, 8635, 8457, 8454,
    8650, 8649, 8648, 8871, 8852, 8853, 8873, 8874, 8872, 4950, 8638,
    1339, 7549, 227, 104, 106, 132, 139, 8593, 8223, 11113, 5426, 20504, 1180, 70839,
    1224
  ];
  const teamIdSet = new Set<number>(baseTeamIds);
  const teamNameMap = new Map<number, string>();

  // Initialize common popular team names for clean slugs
  teamNameMap.set(132, "barcelona");
  teamNameMap.set(131, "real-madrid");
  teamNameMap.set(104, "arsenal");
  teamNameMap.set(106, "chelsea");
  teamNameMap.set(1339, "liverpool");
  teamNameMap.set(227, "manchester-city");
  teamNameMap.set(139, "manchester-united");

  let newsUrls: MetadataRoute.Sitemap = [];
  let matchUrls: MetadataRoute.Sitemap = [];
  let highlightUrls: MetadataRoute.Sitemap = [];
  const matchSet = new Set<string>();

  try {
    await dbConnect();

    // Query published articles
    const articles = await Article.find({ status: "published" })
      .sort({ published_at: -1 })
      .limit(300)
      .lean();

    newsUrls = articles.map((article: any) => ({
      url: `${baseUrl}/news/${article.slug || article._id}`,
      lastModified: article.published_at || article.created_at || new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    // Query published video highlights - update latest highlight time if present
    try {
      const latestHighlight = await Highlight.findOne({ status: "published" })
        .sort({ createdAt: -1 })
        .select("updatedAt createdAt")
        .lean();

      if (latestHighlight) {
        const hPage = staticPages.find((p) => p.url === `${baseUrl}/highlights`);
        if (hPage) {
          hPage.lastModified = (latestHighlight as any).updatedAt || (latestHighlight as any).createdAt || new Date();
        }
      }
    } catch (hErr) {
      console.warn("Highlight sitemap query skipped:", hErr);
    }

    // Query live & recent match documents (within 3 days)
    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const liveMatchDocs = await LiveMatch.find({ date: { $gte: cutoff } })
      .sort({ date: -1 })
      .lean();

    liveMatchDocs.forEach((doc: any) => {
      if (Array.isArray(doc.matches)) {
        doc.matches.forEach((m: any) => {
          if (m && m.id) {
            const home = m.home || m.homeCompetitor || m.teamHome || { name: "team1" };
            const away = m.away || m.awayCompetitor || m.teamAway || { name: "team2" };

            const hId = home.id || (m.homeCompetitor && m.homeCompetitor.id) || (m.teamHome && m.teamHome.id);
            const aId = away.id || (m.awayCompetitor && m.awayCompetitor.id) || (m.teamAway && m.teamAway.id);
            if (hId && Number(hId)) {
              teamIdSet.add(Number(hId));
              if (home.name || home.nameForURL) teamNameMap.set(Number(hId), home.nameForURL || home.name);
            }
            if (aId && Number(aId)) {
              teamIdSet.add(Number(aId));
              if (away.name || away.nameForURL) teamNameMap.set(Number(aId), away.nameForURL || away.name);
            }

            const generatedSlug = generateMatchSlug(home, away, m.id);
            const slugsToAdd = new Set<string>();
            if (m.slug) slugsToAdd.add(m.slug);
            slugsToAdd.add(generatedSlug);

            const matchDate = m.startTime ? new Date(m.startTime) : new Date();
            slugsToAdd.forEach((slug) => {
              const matchUrl = `${baseUrl}/match/${slug}`;
              if (!matchSet.has(matchUrl)) {
                matchSet.add(matchUrl);
                matchUrls.push({
                  url: matchUrl,
                  lastModified: matchDate,
                  changeFrequency: "hourly",
                  priority: 0.9,
                });
              }
            });
          }
        });
      }
    });

  } catch (error) {
    console.error("Error generating dynamic sitemap from MongoDB:", error);
  }

  // Fetch active matches from 365scores (yesterday, today, tomorrow)
  try {
    const today = new Date();
    const targetDates: string[] = [];
    for (let offset = -1; offset <= 2; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      targetDates.push(`${dd}/${mm}/${yyyy}`);
    }

    const results = await Promise.allSettled(targetDates.map((date) => getGamesList(date)));
    results.forEach((result, idx) => {
      if (result.status !== "fulfilled" || !result.value?.games) return;
      const dateStr = targetDates[idx];
      const [dd, mm, yyyy] = dateStr.split("/");
      const matchDateObj = new Date(`${yyyy}-${mm}-${dd}`);

      result.value.games.forEach((g: any) => {
        if (!g.id) return;
        const home = g.homeCompetitor;
        const away = g.awayCompetitor;
        if (!home || !away) return;

        if (home.id && Number(home.id)) {
          teamIdSet.add(Number(home.id));
          if (home.name || home.nameForURL) teamNameMap.set(Number(home.id), home.nameForURL || home.name);
        }
        if (away.id && Number(away.id)) {
          teamIdSet.add(Number(away.id));
          if (away.name || away.nameForURL) teamNameMap.set(Number(away.id), away.nameForURL || away.name);
        }

        const slug = generateMatchSlug(home, away, g.id);
        const matchUrl = `${baseUrl}/match/${slug}`;
        if (!matchSet.has(matchUrl)) {
          matchSet.add(matchUrl);
          matchUrls.push({
            url: matchUrl,
            lastModified: matchDateObj,
            changeFrequency: "hourly",
            priority: 0.85,
          });
        }
      });
    });
  } catch (err365) {
    console.warn("[Sitemap] 365scores API fetch skipped:", err365);
  }

  // Build team URLs with canonical keyword slugs (/team/barcelona-132)
  const allTeamUrls: MetadataRoute.Sitemap = Array.from(teamIdSet).map((id) => {
    const slug = getTeamSlug(id, teamNameMap.get(id));
    return {
      url: `${baseUrl}/team/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    };
  });

  const combinedList = [
    ...staticPages,
    ...standingsUrls,
    ...allTeamUrls,
    ...matchUrls,
    ...newsUrls,
    ...highlightUrls,
  ];

  const seen = new Set<string>();
  const uniqueSitemap: MetadataRoute.Sitemap = [];

  for (const entry of combinedList) {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      uniqueSitemap.push(entry);
    }
  }

  return uniqueSitemap;
}
