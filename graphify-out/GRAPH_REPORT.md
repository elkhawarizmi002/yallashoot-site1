# Graph Report - yallashoot.com  (2026-10-26)

## Corpus Check
- 81 files · ~98,378 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 407 nodes · 833 edges · 23 communities (15 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c77e5231`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dbConnect
- StreamSection.tsx
- services/api.ts
- news/[id]/page.tsx
- package.json
- app/page.tsx
- react
- compilerOptions
- indexnow/route.ts
- [slug]/standings/page.tsx
- manifest.json
- Implementation Plan: Native In-Feed Ad Cards & Layout Ad Balancing
- SEO, Slugs & Bing/Google Cleanup Todo List
- README.md
- competitions/featured/route.ts
- games/featured/route.ts
- proxy.ts
- AGENTS.md
- eslint.config.mjs
- postcss.config.mjs
- sw.js

## God Nodes (most connected - your core abstractions)
1. `react` - 33 edges
2. `lucide-react` - 26 edges
3. `dbConnect()` - 25 edges
4. `toLatinNumerals()` - 20 edges
5. `getLeagueSlug()` - 19 edges
6. `fetchFrom365Scores()` - 16 edges
7. `compilerOptions` - 16 edges
8. `next` - 15 edges
9. `generateMatchSlug()` - 15 edges
10. `TeamPage()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getGamesList()`  [EXTRACTED]
  src/app/api/games/featured/route.ts → src/services/api.ts
- `GET()` --calls--> `getCompetitorStats()`  [EXTRACTED]
  src/app/api/competitor-stats/route.ts → src/services/api.ts
- `runIndexNowSubmission()` --calls--> `dbConnect()`  [EXTRACTED]
  src/app/api/cron/indexnow/route.ts → src/lib/db.ts
- `runIndexNowSubmission()` --calls--> `generateMatchSlug()`  [EXTRACTED]
  src/app/api/cron/indexnow/route.ts → src/lib/matchSlug.ts
- `runIndexNowSubmission()` --calls--> `getLeagueSlug()`  [EXTRACTED]
  src/app/api/cron/indexnow/route.ts → src/lib/seoSlugs.ts

## Import Cycles
- None detected.

## Communities (23 total, 6 thin omitted)

### Community 0 - "dbConnect"
Cohesion: 0.08
Nodes (39): mongoose, dynamic, GET(), GET(), dynamic, GET(), dynamic, GET() (+31 more)

### Community 1 - "StreamSection.tsx"
Cohesion: 0.14
Nodes (15): hls.js, SecurePlayer(), SecurePlayerProps, ServerItem, StreamCountdown(), StreamCountdownProps, TimeLeft, StreamSection() (+7 more)

### Community 2 - "services/api.ts"
Cohesion: 0.13
Nodes (30): dynamic, GET(), dynamic, GET(), dynamic, GET(), dynamic, GET() (+22 more)

### Community 3 - "news/[id]/page.tsx"
Cohesion: 0.07
Nodes (34): @tanstack/react-query, metadata, dynamic, generateMetadata(), mongooseId(), NewsArticlePage(), PageProps, dynamic (+26 more)

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (40): dependencies, clsx, hls.js, lucide-react, mongodb, mongoose, next, react (+32 more)

### Community 5 - "app/page.tsx"
Cohesion: 0.08
Nodes (35): FeaturedMatchHeroProps, fetchFeaturedGames(), fetchGames(), HomePage(), PRIORITY_LEAGUE_IDS, COMMENTATORS, getAssignedCommentator(), MatchDetailsClient() (+27 more)

### Community 6 - "react"
Cohesion: 0.10
Nodes (22): nextConfig, lucide-react, next, react, metadata, metadata, cairo, metadata (+14 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "indexnow/route.ts"
Cohesion: 0.17
Nodes (14): dynamic, GET(), POST(), runIndexNowSubmission(), dynamic, POST(), dynamic, POST() (+6 more)

### Community 9 - "[slug]/standings/page.tsx"
Cohesion: 0.13
Nodes (24): generateMetadata(), getLeagueCountry(), getLeagueName(), getQualificationColor(), LeagueStandingsPage(), RouteParams, LegacyStandingsRedirect(), RouteParams (+16 more)

### Community 10 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 11 - "Implementation Plan: Native In-Feed Ad Cards & Layout Ad Balancing"
Cohesion: 0.40
Nodes (4): Architecture Decisions, Implementation Plan: Native In-Feed Ad Cards & Layout Ad Balancing, Overview, Task List

### Community 12 - "SEO, Slugs & Bing/Google Cleanup Todo List"
Cohesion: 0.25
Nodes (7): Checkpoint 1: Foundation Verification, Checkpoint 2: Link Audit, Checkpoint 3: Production Build & Full Verification, Phase 1: Foundation (SEO Slugs & Redirection Engine), Phase 2: Internal Links & Structural SEO, Phase 3: Bing Webmaster Tools & GSC Error Fixes, SEO, Slugs & Bing/Google Cleanup Todo List

### Community 13 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started., Learn More

### Community 15 - "games/featured/route.ts"
Cohesion: 0.15
Nodes (7): dynamic, GET(), MAJOR_COMPETITION_IDS, TOP_TEAMS_IDS, CacheEntry, globalForCache, smartCache

## Knowledge Gaps
- **177 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+172 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 203 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `dbConnect`, `StreamSection.tsx`, `services/api.ts`, `news/[id]/page.tsx`, `package.json`, `app/page.tsx`, `[slug]/standings/page.tsx`?**
  _High betweenness centrality (0.129) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `react` to `dbConnect`, `StreamSection.tsx`, `news/[id]/page.tsx`, `package.json`, `app/page.tsx`, `[slug]/standings/page.tsx`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `next` connect `react` to `dbConnect`, `services/api.ts`, `news/[id]/page.tsx`, `package.json`, `[slug]/standings/page.tsx`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dbConnect` be split into smaller, more focused modules?**
  _Cohesion score 0.07662337662337662 - nodes in this community are weakly interconnected._
- **Should `StreamSection.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `services/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._