import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Award, ChevronLeft, Trophy, Star, Clock, Play } from "lucide-react";
import { getCompetitionStandings, getCompetitionGames, getCompetitionScorers, getCompetitionBrackets } from "@/services/api";
import SidebarLeagues from "@/components/SidebarLeagues";
import StandingsBrackets from "@/components/StandingsBrackets";
import { toLatinNumerals } from "@/lib/utils";
import ResponsiveAdBanner from "@/components/ads/ResponsiveAdBanner";
import { parseLeagueId, getLeagueSlug } from "@/lib/seoSlugs";

type RouteParams = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ live?: string; tab?: string }>;
};

/**
 * Dynamic SEO Metadata for Standings page (Keyword-Rich Slug)
 */
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const leagueId = parseLeagueId(slug);
  
  if (!leagueId) {
    return {
      title: "ترتيب الدوري - يلا شوت",
      robots: { index: false, follow: true },
    };
  }

  const canonicalSlug = getLeagueSlug(leagueId);

  try {
    const data = await getCompetitionStandings(leagueId, false);
    if (!data || !data.standings || data.standings.length === 0) {
      return {
        title: "ترتيب الدوري - يلا شوت",
        alternates: {
          canonical: `/league/${canonicalSlug}/standings`,
        },
        robots: {
          index: true,
          follow: true,
        },
      };
    }

    const leagueName = data.standings[0].displayName || "الدوري";
    // Keep title ≤ 55 characters including template
    const titleText = `ترتيب ${leagueName}`;
    const descText = `جدول ترتيب ${leagueName} بالتفصيل مع عدد النقاط، المباريات الملعوبة، الأهداف المسجلة والمستقبلة، والفرق المتأهلة عبر يلا شوت.`;

    return {
      title: titleText,
      description: descText,
      alternates: {
        canonical: `/league/${canonicalSlug}/standings`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: "ترتيب الدوري - يلا شوت",
      alternates: {
        canonical: `/league/${canonicalSlug}/standings`,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }
}

/**
 * Standings Page Component (/league/[slug]/standings)
 */
export default async function LeagueStandingsPage({ params, searchParams }: RouteParams) {
  const { slug } = await params;
  const { live, tab } = await searchParams;
  const isLive = live === "true";

  const numLeagueId = parseLeagueId(slug);

  if (!numLeagueId) {
    notFound();
  }

  // If accessed by raw ID or non-canonical slug, 301 redirect to canonical slug
  const canonicalSlug = getLeagueSlug(numLeagueId);
  if (slug !== canonicalSlug) {
    const queryString = new URLSearchParams();
    if (live) queryString.set("live", live);
    if (tab) queryString.set("tab", tab);
    const qs = queryString.toString() ? `?${queryString.toString()}` : "";
    redirect(`/league/${canonicalSlug}/standings${qs}`);
  }

  const leagueId = numLeagueId.toString();

  // Parallel fetch: standings table, games/results, scorers stats, and brackets data
  const [standingsData, currentGames, scorers, bracketsRes] = await Promise.all([
    getCompetitionStandings(leagueId, isLive),
    getCompetitionGames(leagueId),
    getCompetitionScorers(leagueId),
    getCompetitionBrackets(leagueId).catch(() => null)
  ]);

  let brackets = null;
  if (bracketsRes && bracketsRes.brackets) {
    brackets = Array.isArray(bracketsRes.brackets)
      ? bracketsRes.brackets[0]
      : bracketsRes.brackets;
  }
  const hasBrackets = !!(brackets && Array.isArray(brackets.stages) && brackets.stages.length > 0);
  const hasStandings = !!(standingsData && standingsData.standings && standingsData.standings.length > 0);
  const hasGames = !!(currentGames && currentGames.length > 0);
  const hasScorers = !!(scorers && scorers.length > 0);

  // 404 only if all sources are empty
  if (!hasStandings && !hasGames && !hasBrackets && !hasScorers) {
    notFound();
  }

  // Dynamic default tab depending on what data exists
  const activeTab = tab || (hasStandings ? "standings" : hasGames ? "fixtures" : hasBrackets ? "bracket" : "scorers");

  const leagueName = standingsData?.standings?.[0]?.displayName ||
    (currentGames?.[0] as any)?.competitionDisplayName ||
    getLeagueName(numLeagueId);

  // Filter and prepare display tables
  const processedTables: Array<{
    displayName: string;
    rows: any[];
    destinations?: any[];
  }> = [];

  if (hasStandings) {
    standingsData.standings.forEach((table: any) => {
      if (Array.isArray(table.rows) && table.rows.length > 0) {
        processedTables.push({
          displayName: table.displayName || "الترتيب",
          rows: table.rows,
          destinations: table.destinations
        });
      }
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">

      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 mb-6 transition"
      >
        <ChevronLeft className="h-4 w-4" />
        العودة للرئيسية
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar leagues */}
        <SidebarLeagues activeLeagueId={numLeagueId} />

        {/* Standings Grid Area */}
        <div className="flex-1 space-y-6">

          {/* Header Card (League Banner) */}
          <div className="relative overflow-hidden bg-gradient-to-l from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 flex flex-row items-center justify-between shadow-xl">
            <div className="z-10 text-right">
              <h1 className="text-xl sm:text-2xl font-black text-zinc-100">
                {leagueName} 2026/2027
              </h1>
              <span className="inline-block text-xs font-bold text-emerald-450 mt-2 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/30">
                {getLeagueCountry(numLeagueId)}
              </span>
            </div>

            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-zinc-900 border border-zinc-800 p-2.5 flex items-center justify-center shadow-inner shrink-0 z-10">
              <img
                src={`https://imagecache.365scores.com/image/upload/f_auto,w_120,h_120,c_limit,q_auto:eco,d_competitions:default.png/v1/competitions/${numLeagueId}`}
                alt={leagueName}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>

            {/* Subtle background glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* Responsive Ad Banner */}
          <ResponsiveAdBanner />

          {/* Navigation Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-900/90 border border-zinc-800/80 rounded-2xl backdrop-blur-md shadow-lg">
            {hasStandings && (
              <Link
                href={`/league/${canonicalSlug}/standings?tab=standings${isLive ? "&live=true" : ""}`}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
                  activeTab === "standings"
                    ? "bg-emerald-500 text-zinc-950 shadow-md font-extrabold shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                ترتيب الفرق
              </Link>
            )}

            {hasScorers && (
              <Link
                href={`/league/${canonicalSlug}/standings?tab=scorers`}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
                  activeTab === "scorers"
                    ? "bg-emerald-500 text-zinc-950 shadow-md font-extrabold shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                ترتيب الهدافين
              </Link>
            )}

            {hasGames && (
              <Link
                href={`/league/${canonicalSlug}/standings?tab=results`}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
                  activeTab === "results"
                    ? "bg-emerald-500 text-zinc-950 shadow-md font-extrabold shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                نتائج المباريات
              </Link>
            )}

            {hasGames && (
              <Link
                href={`/league/${canonicalSlug}/standings?tab=fixtures`}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
                  activeTab === "fixtures"
                    ? "bg-emerald-500 text-zinc-950 shadow-md font-extrabold shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                المباريات القادمة
              </Link>
            )}

            {hasBrackets && (
              <Link
                href={`/league/${canonicalSlug}/standings?tab=bracket`}
                className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
                  activeTab === "bracket"
                    ? "bg-emerald-500 text-zinc-950 shadow-md font-extrabold shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
              >
                أدوار خروج المغلوب
              </Link>
            )}
          </div>

          {/* TAB 1: Standings Tables */}
          {activeTab === "standings" && hasStandings && (
            <div className="space-y-6">
              {processedTables.map((group, groupIdx) => (
                <div key={groupIdx} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
                  {processedTables.length > 1 && (
                    <div className="bg-zinc-800/50 px-5 py-3 border-b border-zinc-800 font-bold text-sm text-zinc-200">
                      {group.displayName}
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800/80">
                          <th className="py-3 px-3 sm:px-4 font-semibold text-center w-12 sm:w-16">المركز</th>
                          <th className="py-3 px-3 sm:px-4 font-semibold">الفريق</th>
                          <th className="py-3 px-2 sm:px-3 font-semibold text-center w-10 sm:w-12">لعب</th>
                          <th className="py-3 px-2 sm:px-3 font-semibold text-center w-10 sm:w-12">فاز</th>
                          <th className="py-3 px-2 sm:px-3 font-semibold text-center w-10 sm:w-12">تعادل</th>
                          <th className="py-3 px-2 sm:px-3 font-semibold text-center w-10 sm:w-12">خسر</th>
                          <th className="py-3 px-2 sm:px-3 font-semibold text-center w-10 sm:w-12 hidden md:table-cell">له</th>
                          <th className="py-3 px-2 sm:px-3 font-semibold text-center w-10 sm:w-12 hidden md:table-cell">عليه</th>
                          <th className="py-3 px-2 sm:px-3 font-semibold text-center w-12 sm:w-14">الفرق</th>
                          <th className="py-3 px-3 sm:px-4 font-bold text-center w-12 sm:w-16 text-emerald-400">النقاط</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                        {group.rows.map((row: any, idx: number) => {
                          const qualColor = getQualificationColor(row.destinationColor);
                          const isLiveMatch = row.isLive;
                          const teamId = row.competitor?.id;
                          const teamName = row.competitor?.name || "فريق";
                          const teamSlug = `${toLatinNumerals(row.competitor?.nameForURL || teamName).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${teamId}`;

                          return (
                            <tr
                              key={idx}
                              className={`hover:bg-zinc-800/40 transition-colors ${
                                isLiveMatch ? "bg-emerald-950/20 font-medium" : ""
                              }`}
                            >
                              <td className="py-3 px-3 sm:px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {qualColor && (
                                    <span
                                      className="w-1.5 h-4 rounded-full"
                                      style={{ backgroundColor: qualColor }}
                                    />
                                  )}
                                  <span className="font-bold text-zinc-400">
                                    {row.position || idx + 1}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-3 sm:px-4 font-bold text-zinc-100">
                                <Link
                                  href={`/team/${teamSlug}`}
                                  className="flex items-center gap-2.5 hover:text-emerald-400 transition group"
                                >
                                  {row.competitor?.id ? (
                                    <img
                                      src={`https://imagecache.365scores.com/image/upload/f_auto,w_48,h_48,c_limit,q_auto:eco,d_competitors:default.png/v1/competitors/${row.competitor.id}`}
                                      alt={teamName}
                                      className="h-6 w-6 object-contain shrink-0 group-hover:scale-105 transition-transform"
                                      loading="lazy"
                                    />
                                  ) : null}
                                  <span className="truncate max-w-[130px] sm:max-w-[200px]">
                                    {teamName}
                                  </span>
                                </Link>
                              </td>

                              <td className="py-3 px-2 sm:px-3 text-center font-medium text-zinc-300">
                                {toLatinNumerals(row.gamePlayed)}
                              </td>
                              <td className="py-3 px-2 sm:px-3 text-center text-zinc-400">
                                {toLatinNumerals(row.gamesWon)}
                              </td>
                              <td className="py-3 px-2 sm:px-3 text-center text-zinc-400">
                                {toLatinNumerals(row.gamesEven)}
                              </td>
                              <td className="py-3 px-2 sm:px-3 text-center text-zinc-400">
                                {toLatinNumerals(row.gamesLost)}
                              </td>
                              <td className="py-3 px-2 sm:px-3 text-center text-zinc-400 hidden md:table-cell">
                                {toLatinNumerals(row.forward)}
                              </td>
                              <td className="py-3 px-2 sm:px-3 text-center text-zinc-400 hidden md:table-cell">
                                {toLatinNumerals(row.against)}
                              </td>
                              <td className="py-3 px-2 sm:px-3 text-center font-semibold dir-ltr text-zinc-300">
                                {toLatinNumerals(row.ratio)}
                              </td>
                              <td className="py-3 px-3 sm:px-4 text-center font-extrabold text-emerald-400 text-sm">
                                {toLatinNumerals(row.points)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {group.destinations && group.destinations.length > 0 && (
                    <div className="p-4 bg-zinc-950/40 border-t border-zinc-800/60 flex flex-wrap gap-4 text-xs text-zinc-400">
                      {group.destinations.map((d: any, dIdx: number) => (
                        <div key={dIdx} className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: getQualificationColor(d.color) || "#10b981" }}
                          />
                          <span>{d.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Top Scorers */}
          {activeTab === "scorers" && hasScorers && (
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="bg-zinc-950/60 text-zinc-400 border-b border-zinc-800/80">
                      <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                      <th className="py-3 px-3 sm:px-4">اللاعب</th>
                      <th className="py-3 px-3 sm:px-4">الفريق</th>
                      <th className="py-3 px-2 sm:px-3 text-center">أهداف</th>
                      <th className="py-3 px-2 sm:px-3 text-center hidden sm:table-cell">صناعة</th>
                      <th className="py-3 px-2 sm:px-3 text-center hidden md:table-cell">ضربات جزاء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                    {scorers.map((scorer: any, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-3 sm:px-4 text-center font-bold text-zinc-500">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 sm:px-4 font-bold text-zinc-100">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{scorer.athlete?.name || "لاعب"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-zinc-400">
                          {scorer.competitor?.name || "فريق"}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center font-extrabold text-emerald-400 text-sm">
                          {toLatinNumerals(scorer.goals || 0)}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center text-zinc-400 hidden sm:table-cell">
                          {toLatinNumerals(scorer.assists || 0)}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center text-zinc-400 hidden md:table-cell">
                          {toLatinNumerals(scorer.penalties || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Fixtures & Results */}
          {(activeTab === "fixtures" || activeTab === "results") && hasGames && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentGames
                .filter((g: any) => {
                  const isFinished = g.statusGroup === 4 || g.statusText === "انتهت";
                  return activeTab === "results" ? isFinished : !isFinished;
                })
                .map((game: any, gIdx: number) => (
                  <div
                    key={gIdx}
                    className="p-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-col justify-between gap-3 hover:border-zinc-700 transition"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{game.roundName || "مباراة"}</span>
                      <span>{game.startTime ? new Date(game.startTime).toLocaleDateString("ar-EG") : ""}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <img
                          src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default.png/v1/competitors/${game.homeCompetitor?.id}`}
                          alt=""
                          className="w-6 h-6 object-contain"
                          loading="lazy"
                        />
                        <span className="font-bold text-sm text-zinc-100 truncate">{game.homeCompetitor?.name}</span>
                      </div>

                      <div className="px-3 py-1 bg-zinc-950 rounded-lg text-sm font-black text-emerald-400">
                        {game.homeCompetitor?.score !== undefined ? `${game.homeCompetitor.score} - ${game.awayCompetitor?.score}` : "ضد"}
                      </div>

                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="font-bold text-sm text-zinc-100 truncate">{game.awayCompetitor?.name}</span>
                        <img
                          src={`https://imagecache.365scores.com/image/upload/f_auto,w_40,h_40,c_limit,q_auto:eco,d_competitors:default.png/v1/competitors/${game.awayCompetitor?.id}`}
                          alt=""
                          className="w-6 h-6 object-contain"
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* TAB 4: Brackets */}
          {activeTab === "bracket" && hasBrackets && (
            <StandingsBrackets brackets={brackets} leagueId={numLeagueId} />
          )}

        </div>
      </div>
    </div>
  );
}

function getLeagueCountry(leagueId: number): string {
  const map: Record<number, string> = {
    572: "أوروبا",
    7: "إنجلترا",
    11: "إسبانيا",
    35: "فرنسا",
    17: "إيطاليا",
    25: "ألمانيا",
    557: "المغرب",
    649: "السعودية",
    8935: "مصر",
    5930: "دولي",
    624: "أفريقيا",
    623: "آسيا",
    329: "أوروبا",
    167: "أفريقيا",
    573: "أوروبا",
  };
  return map[leagueId] || "كروية";
}

function getLeagueName(leagueId: number): string {
  const map: Record<number, string> = {
    572: "دوري أبطال أوروبا",
    7: "الدوري الإنجليزي الممتاز",
    11: "الدوري الإسباني",
    35: "الدوري الفرنسي",
    17: "الدوري الإيطالي",
    25: "الدوري الألماني",
    557: "الدوري المغربي للمحترفين",
    649: "دوري روشن السعودي",
    8935: "الدوري المصري الممتاز",
    5930: "كأس العالم",
    624: "دوري أبطال أفريقيا",
    623: "دوري أبطال آسيا",
    329: "كأس أمم أوروبا",
    167: "كأس أمم إفريقيا",
    573: "الدوري الأوروبي",
  };
  return map[leagueId] || "ترتيب الدوري";
}

function getQualificationColor(colorStr: string): string | null {
  if (!colorStr) return null;
  if (colorStr.startsWith("#")) return colorStr;
  return `#${colorStr}`;
}
