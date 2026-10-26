"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ExternalLink,
  Play,
  Tv,
  Mic,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Radio,
  Zap
} from "lucide-react";
import { triggerSmartlink } from "@/lib/smartlink";

interface ServerItem {
  id?: number;
  label: string;
  signedUrl: string;
}

interface SecurePlayerProps {
  gameId: string;
  matchSlug?: string;
  streamType?: "iframe" | "hls" | "youtube" | "other";
  streamUrl?: string;
  tokenRequired?: boolean;
  token?: string;
  expires?: number;
  isLive?: boolean;
  isFinished?: boolean;
  highlightUrl?: string | null;
  matchTime?: string;
  matchStartTime?: string | number;
  homeTeamName?: string;
  awayTeamName?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  channelName?: string;
  commentatorName?: string;
  competitionName?: string;
  serverCount?: number;
  iframeHtml?: string | null;
  servers?: ServerItem[];
}

export default function SecurePlayer({
  gameId,
  matchSlug,
  isLive = false,
  isFinished = false,
  matchTime,
  homeTeamName,
  awayTeamName,
  homeTeamLogo,
  awayTeamLogo,
  channelName = "beIN Sports",
  commentatorName = "المعلق المخصص",
  competitionName = "مباراة اليوم",
  servers = [],
}: SecurePlayerProps) {
  const [selectedServer, setSelectedServer] = useState(0);

  // External player domain (can be easily swapped via env var)
  const externalPlayerBase =
    process.env.NEXT_PUBLIC_EXTERNAL_PLAYER_URL || "https://yalashout.online";

  const serverList =
    servers && servers.length > 0
      ? servers.map((s, idx) => ({ id: idx, label: s.label || `سيرفر ${idx + 1}` }))
      : [
          { id: 0, label: "سيرفر 1 (جودة فائقة FHD)" },
          { id: 1, label: "سيرفر 2 (متعدد الجودات)" },
          { id: 2, label: "سيرفر 3 (خفيف للجوال)" },
        ];

  const handleOpenExternalStream = (serverIdx: number) => {
    // 1. Monetization: trigger smartlink (respects 30s cooldown)
    triggerSmartlink();

    // 2. Build target URL to sacrificial streaming domain
    try {
      const targetUrl = new URL(externalPlayerBase);
      targetUrl.searchParams.set("match", String(gameId));
      if (matchSlug) targetUrl.searchParams.set("slug", matchSlug);
      targetUrl.searchParams.set("server", String(serverIdx + 1));

      // 3. Open in a new tab with nofollow / noopener protection
      window.open(targetUrl.toString(), "_blank", "noopener,noreferrer");
    } catch {
      window.open(`${externalPlayerBase}/?match=${gameId}`, "_blank", "noopener,noreferrer");
    }
  };

  // ── 1. MATCH FINISHED STATE (Clean Post-Match Summary, Zero Streams) ──
  if (isFinished) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md"
        dir="rtl"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 shadow-inner">
            <CheckCircle2 className="h-7 w-7 text-emerald-400" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800/90 border border-zinc-700/60 px-3 py-1 text-xs font-bold text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              انتهت المباراة وتغطية البث
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              صافرة النهاية • تم إيقاف سيرفرات البث المباشر
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
              انتهت مجريات اللقاء رسميًا. يمكنك متابعة النتيجة النهائية، إحصائيات المباراة وتشكيلة الفريقين في الأسفل.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. LIVE MATCH GATEWAY STATE (High-Impact External Player Card) ──
  if (isLive) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 p-6 sm:p-8 shadow-2xl shadow-emerald-950/20"
        dir="rtl"
      >
        {/* Ambient Top Glow */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-lg shadow-emerald-500/50" />
        <div className="absolute -top-24 right-1/2 translate-x-1/2 w-96 h-48 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 space-y-6">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1.5 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-black text-emerald-300 tracking-wide">
                بث مباشر الآن • جودة فائقة HD
              </span>
            </div>

            {/* Match Meta Chips */}
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-zinc-300">
              {channelName && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1">
                  <Tv className="w-3.5 h-3.5 text-emerald-400" />
                  {channelName}
                </span>
              )}
              {commentatorName && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1">
                  <Mic className="w-3.5 h-3.5 text-teal-400" />
                  {commentatorName}
                </span>
              )}
              {competitionName && (
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  {competitionName}
                </span>
              )}
            </div>
          </div>

          {/* Central Match Presentation */}
          <div className="flex items-center justify-center gap-6 py-2">
            <div className="flex items-center gap-3">
              {homeTeamLogo && (
                <div className="relative w-12 h-12 rounded-xl bg-zinc-800/60 p-1.5 border border-zinc-700/40">
                  <Image src={homeTeamLogo} alt={homeTeamName || "Home"} fill className="object-contain p-1" />
                </div>
              )}
              <span className="font-extrabold text-sm sm:text-base text-white">{homeTeamName}</span>
            </div>

            <div className="px-3 py-1 rounded-lg bg-zinc-800/90 border border-zinc-700/60 text-xs font-black text-emerald-400">
              ضد
            </div>

            <div className="flex items-center gap-3">
              <span className="font-extrabold text-sm sm:text-base text-white">{awayTeamName}</span>
              {awayTeamLogo && (
                <div className="relative w-12 h-12 rounded-xl bg-zinc-800/60 p-1.5 border border-zinc-700/40">
                  <Image src={awayTeamLogo} alt={awayTeamName || "Away"} fill className="object-contain p-1" />
                </div>
              )}
            </div>
          </div>

          {/* Server Selector Tabs */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              اختر سيرفر المشاهدة المفضل:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {serverList.map((srv, idx) => (
                <button
                  key={srv.id}
                  onClick={() => setSelectedServer(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                    selectedServer === idx
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10 font-black"
                      : "bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <span>{srv.label}</span>
                  <span className={`w-2 h-2 rounded-full ${selectedServer === idx ? "bg-emerald-400" : "bg-zinc-600"}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Primary CTA Watch Button */}
          <div className="pt-2">
            <button
              onClick={() => handleOpenExternalStream(selectedServer)}
              className="group relative w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-base sm:text-lg shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
            >
              <Play className="w-5 h-5 fill-zinc-950 transition-transform group-hover:scale-110" />
              <span>مشاهدة البث المباشر الآن ({serverList[selectedServer]?.label || "سيرفر 1"})</span>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Safety & Performance Notice */}
          <div className="flex items-center justify-center gap-2 text-center pt-1 text-[11px] text-zinc-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              يتم فتح البث عبر مشغل خارجي سريع ومستقل لضمان أعلى استقرار وبدون تقطيع.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── 3. UPCOMING MATCH STATE (Countdown & Scheduled Notice) ──
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-8 shadow-xl backdrop-blur-md"
      dir="rtl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>موعد المباراة: {matchTime || "اليوم"}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-zinc-400">
            {channelName && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1">
                <Tv className="w-3.5 h-3.5 text-emerald-400" />
                {channelName}
              </span>
            )}
            {commentatorName && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1">
                <Mic className="w-3.5 h-3.5 text-teal-400" />
                {commentatorName}
              </span>
            )}
          </div>
        </div>

        <div className="text-center py-3 space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-white">
            سيرفرات البث المباشر ستتوفر قبل انطلاق المباراة
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
            سيتم تفعيل روابط البث المباشر عبر المشغل الخارجي قبل صافرة البداية بـ 15 دقيقة مع صوت المعلق المخصص.
          </p>
        </div>

        <div className="pt-1">
          <button
            onClick={() => handleOpenExternalStream(0)}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-200 font-bold text-xs sm:text-sm transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>تجهيز المشغل الخارجي مسبقاً</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </div>
    </div>
  );
}
