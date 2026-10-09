# Graph Report - yallashoot.com  (2026-09-15)

## Corpus Check
- 77 files · ~95,218 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 387 nodes · 728 edges · 22 communities (14 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `671e2948`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dbConnect
- app/page.tsx
- services/api.ts
- news/[id]/page.tsx
- package.json
- MatchDetailsClient.tsx
- react
- compilerOptions
- indexing.ts
- manifest.json
- Task List
- Task List: Mock Player, Telegram & Media Generator
- README.md
- competitions/featured/route.ts
- games/featured/route.ts
- proxy.ts
- AGENTS.md
- eslint.config.mjs
- postcss.config.mjs
- sw.js

## God Nodes (most connected - your core abstractions)
1. `react` - 31 edges
2. `lucide-react` - 24 edges
3. `dbConnect()` - 23 edges
4. `toLatinNumerals()` - 20 edges
5. `fetchFrom365Scores()` - 16 edges
6. `compilerOptions` - 16 edges
7. `next` - 15 edges
8. `generateMatchSlug()` - 13 edges
9. `TeamPage()` - 11 edges
10. `getGameDetails()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getCompetitorStats()`  [EXTRACTED]
  src/app/api/competitor-stats/route.ts → src/services/api.ts
- `GET()` --calls--> `getGamesList()`  [EXTRACTED]
  src/app/api/games/featured/route.ts → src/services/api.ts
- `GET()` --calls--> `dbConnect()`  [EXTRACTED]
  src/app/api/games/route.ts → src/lib/db.ts
- `GET()` --calls--> `dbConnect()`  [EXTRACTED]
  src/app/api/highlights/route.ts → src/lib/db.ts
- `GET()` --calls--> `getGameDetails()`  [EXTRACTED]
  src/app/api/match/[id]/route.ts → src/services/api.ts

## Import Cycles
- None detected.

## Communities (22 total, 6 thin omitted)

### Community 0 - "dbConnect"
Cohesion: 0.08
Nodes (39): mongoose, GET(), dynamic, GET(), dynamic, GET(), dynamic, POST() (+31 more)

### Community 1 - "app/page.tsx"
Cohesion: 0.09
Nodes (23): FeaturedMatchHeroProps, fetchFeaturedGames(), fetchGames(), HomePage(), PRIORITY_LEAGUE_IDS, CompetitionItem, CompetitionTeamsHeaderBar(), FEATURED_COMPETITIONS (+15 more)

### Community 2 - "services/api.ts"
Cohesion: 0.12
Nodes (33): dynamic, GET(), dynamic, GET(), dynamic, GET(), dynamic, GET() (+25 more)

### Community 3 - "news/[id]/page.tsx"
Cohesion: 0.08
Nodes (30): @tanstack/react-query, metadata, dynamic, generateMetadata(), mongooseId(), NewsArticlePage(), PageProps, dynamic (+22 more)

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (41): dependencies, clsx, hls.js, lucide-react, mongodb, mongoose, next, react (+33 more)

### Community 5 - "MatchDetailsClient.tsx"
Cohesion: 0.08
Nodes (33): COMMENTATORS, getAssignedCommentator(), MatchDetailsClient(), MatchDetailsClientProps, ServerItem, PitchLineups(), PitchLineupsProps, SecurePlayer() (+25 more)

### Community 6 - "react"
Cohesion: 0.09
Nodes (24): nextConfig, lucide-react, next, react, metadata, metadata, cairo, metadata (+16 more)

### Community 7 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "indexing.ts"
Cohesion: 0.24
Nodes (10): dynamic, POST(), dynamic, POST(), getGoogleAccessToken(), IndexNowResponse, notifyAllSearchEngines(), notifyGoogleIndexing() (+2 more)

### Community 10 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, scope, short_name (+2 more)

### Community 11 - "Task List"
Cohesion: 0.22
Nodes (8): Architecture Decisions, Implementation Plan: Mock Player Monetization, Telegram Integration & Media Generator Update, Overview, Phase 1: Mock Player & First-Click Monetization (`yallashoot.com`), Phase 2: Floating Telegram Button (`yallashoot.com`), Phase 3: Media Generator Domain Migration (`dashboard-yallatir`), Phase 4: Verification, Task List

### Community 12 - "Task List: Mock Player, Telegram & Media Generator"
Cohesion: 0.33
Nodes (5): Phase 1: Mock Player & First-Click Monetization (`yallashoot.com`), Phase 2: Floating Telegram Button (`yallashoot.com`), Phase 3: Media Generator Domain Migration (`dashboard-yallatir`), Phase 4: Verification, Task List: Mock Player, Telegram & Media Generator

### Community 13 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started., Learn More

### Community 15 - "games/featured/route.ts"
Cohesion: 0.13
Nodes (10): dynamic, GET(), MAJOR_COMPETITION_IDS, TOP_TEAMS_IDS, dynamic, GET(), CacheEntry, globalForCache (+2 more)

## Knowledge Gaps
- **172 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+167 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 197 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `dbConnect`, `app/page.tsx`, `services/api.ts`, `news/[id]/page.tsx`, `package.json`, `MatchDetailsClient.tsx`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Why does `next` connect `react` to `dbConnect`, `services/api.ts`, `news/[id]/page.tsx`, `package.json`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `react` to `dbConnect`, `app/page.tsx`, `services/api.ts`, `news/[id]/page.tsx`, `package.json`, `MatchDetailsClient.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _172 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dbConnect` be split into smaller, more focused modules?**
  _Cohesion score 0.07792207792207792 - nodes in this community are weakly interconnected._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09475806451612903 - nodes in this community are weakly interconnected._
- **Should `services/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11666666666666667 - nodes in this community are weakly interconnected._