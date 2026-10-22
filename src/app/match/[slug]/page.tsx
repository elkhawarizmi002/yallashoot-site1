import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { headers } from "next/headers";
import { getGameDetails } from "@/services/api";
import { dbConnect } from "@/lib/db";
import LiveMatch from "@/models/LiveMatch";
import MatchDetailsClient from "@/components/MatchDetailsClient";
import { extractIdFromSlug } from "@/lib/matchSlug";
import { signSecureStreamUrl } from "@/lib/crypto";

type RouteParams = {
  params: Promise<{ slug: string }>;
};



/**
 * Generate Dynamic SEO Metadata for Match Details Page
 */
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);
  try {
    const data = await getGameDetails(id);
    if (!data || !data.game) {
      return {
        title: "المباراة غير موجودة - يلا شوت لايف",
        alternates: {
          canonical: `/match/${slug}`,
        },
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const gameAny = data.game as any;
    const { homeCompetitor, awayCompetitor, competitionDisplayName, competitionName } = gameAny;
    const compName = competitionDisplayName || competitionName || "مباراة اليوم";
    // Keep title ≤70 chars — use short team names and minimal suffix
    const truncate = (s: string, max: number) => s.length > max ? s.slice(0, max - 1) + "…" : s;
    const shortHome = truncate(homeCompetitor.name, 18);
    const shortAway = truncate(awayCompetitor.name, 18);
    const titleText = `${shortHome} ضد ${shortAway} بث مباشر`;
    const descText = `شاهد بث مباشر مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} اليوم في ${compName} بجودة عالية عبر يلا شوت.`;

    return {
      title: titleText,
      description: descText,
      keywords: [
        `مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name}`,
        `بث مباشر مباراة ${homeCompetitor.name}`,
        `بث مباشر ${awayCompetitor.name}`,
        `مباراة ${homeCompetitor.name} اليوم`,
        `مباراة ${awayCompetitor.name} اليوم`,
        compName,
        "يلا شوت",
        "Yalla Shoot",
      ],
      alternates: {
        canonical: `/match/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: titleText,
        description: descText,
        type: "video.other",
        url: `/match/${slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: titleText,
        description: descText,
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "تفاصيل المباراة",
      alternates: {
        canonical: `/match/${slug}`,
      },
    };
  }
}

/**
 * Server Page Component
 */
export default async function MatchPage({ params }: RouteParams) {
  const { slug } = await params;
  const id = extractIdFromSlug(slug);

  // 1. Fetch match details from upstream API
  let detailsData;
  try {
    detailsData = await getGameDetails(id);
  } catch (error) {
    console.error("Failed to load match details on server:", error);
  }

  // Gracefully handle ended/missing matches without triggering a 404 crawl penalty
  if (!detailsData || !detailsData.game) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16" dir="rtl">
        <div className="max-w-md bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Trophy className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-zinc-100">انتهت تغطية هذه المباراة</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            انتهت تفاصيل هذه المباراة أو لم تعد متاحة حالياً في البث المباشر. يمكنك متابعة جدول مباريات اليوم المتاح عبر يلا شوت.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/live"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-500/20"
            >
              مباريات اليوم بث مباشر
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl transition"
            >
              الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gameAny = detailsData.game as any;
  const { homeCompetitor, awayCompetitor, startTime, venue, competitionDisplayName, competitionName } = gameAny;
  const compName = competitionDisplayName || competitionName || "مباراة كرة قدم";
  const h1Text = `مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} - بث مباشر`;
  const venueName = venue?.name || "الملعب الرئيسي";
  const venueCity = venue?.city || "غير محدد";

  const startIso = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
  const endIso = startTime
    ? new Date(new Date(startTime).getTime() + 2 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

  const homeLogo = `https://imagecache.365scores.com/image/upload/f_auto,w_300,h_300,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${homeCompetitor.id}`;
  const awayLogo = `https://imagecache.365scores.com/image/upload/f_auto,w_300,h_300,c_limit,q_auto:eco,d_competitors:default1.png/v1/competitors/${awayCompetitor.id}`;

  const matchJsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `مباراة ${homeCompetitor.name} ضد ${awayCompetitor.name}`,
    "description": `متابعة البث المباشر والتغطية الحية لمباراة ${homeCompetitor.name} ضد ${awayCompetitor.name} اليوم في ${compName}.`,
    "startDate": startIso,
    "endDate": endIso,
    "eventStatus": detailsData.game.statusGroup === 4
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": venueName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": venueCity,
        "addressCountry": "Global"
      }
    },
    "image": [
      homeLogo,
      awayLogo
    ],
    "homeTeam": {
      "@type": "SportsTeam",
      "name": homeCompetitor.name,
      "url": `https://www.yallashoot-ball.com/team/${homeCompetitor.id}`,
      "logo": homeLogo
    },
    "awayTeam": {
      "@type": "SportsTeam",
      "name": awayCompetitor.name,
      "url": `https://www.yallashoot-ball.com/team/${awayCompetitor.id}`,
      "logo": awayLogo
    },
    "performer": [
      {
        "@type": "SportsTeam",
        "name": homeCompetitor.name,
        "url": `https://www.yallashoot-ball.com/team/${homeCompetitor.id}`,
        "image": homeLogo
      },
      {
        "@type": "SportsTeam",
        "name": awayCompetitor.name,
        "url": `https://www.yallashoot-ball.com/team/${awayCompetitor.id}`,
        "image": awayLogo
      }
    ],
    "organizer": {
      "@type": "Organization",
      "name": compName,
      "url": "https://www.yallashoot-ball.com"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.yallashoot-ball.com/match/${slug}`,
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": startIso
    },
    "url": `https://www.yallashoot-ball.com/match/${slug}`
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(matchJsonLd) }}
      />
      {/* SEO H1 — visible match header rendered server-side for Bingbot */}
      <div className="max-w-7xl mx-auto px-4 pt-5 pb-1" dir="rtl">
        <h1 className="text-lg sm:text-xl font-black text-zinc-100 leading-snug">
          <span className="text-emerald-400">{homeCompetitor.name}</span>
          <span className="mx-2 text-zinc-500">ضد</span>
          <span className="text-emerald-400">{awayCompetitor.name}</span>
          <span className="ml-2 text-sm font-semibold text-zinc-400">— بث مباشر</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-medium">
          {compName} • {new Date(startTime || Date.now()).toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
      <MatchDetailsClient
        initialDetails={detailsData}
        gameId={id}
        matchSlug={slug}
      />
    </div>
  );
}



