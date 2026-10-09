# SEO, Slugs & Bing/Google Cleanup Todo List

## Phase 1: Foundation (SEO Slugs & Redirection Engine)
- [ ] Task 1.1: Create `src/lib/seoSlugs.ts` (helper mapping leagues, teams to SEO slugs + ID parser)
- [ ] Task 1.2: Create `/league/[slug]/standings` page with 301 backward redirect from `/standings/[leagueId]`
- [ ] Task 1.3: Update `/team/[id]` page to support `/team/[slug]` (e.g. `barcelona-132`) with 301 redirect for legacy ID routes

## Checkpoint 1: Foundation Verification
- [ ] Run `npx tsc --noEmit`
- [ ] Verify `/league/la-liga-11/standings` loads league standings
- [ ] Verify `/standings/11` issues 301 redirect to `/league/la-liga-11/standings`
- [ ] Verify `/team/barcelona-132` loads team profile
- [ ] Verify `/team/132` issues 301 redirect to `/team/barcelona-132`

---

## Phase 2: Internal Links & Structural SEO
- [ ] Task 2.1: Update `SidebarLeagues.tsx` to use new `/league/[slug]/standings` URLs
- [ ] Task 2.2: Update Header and Navigation links to use the new league and team slug paths
- [ ] Task 2.3: Update team links inside match details and team components to use `/team/[slug]`

## Checkpoint 2: Link Audit
- [ ] Verify internal links in UI navigate to clean slug URLs
- [ ] Ensure no broken internal links or redirect loops

---

## Phase 3: Bing Webmaster Tools & GSC Error Fixes
- [ ] Task 3.1: Add missing `<h1>` tags to team page header (`TeamDetailsClient.tsx`) and highlights page (`HighlightsClient.tsx`)
- [ ] Task 3.2: Shorten page titles across `layout.tsx`, `live/page.tsx`, `match/[slug]/page.tsx`, `team/[id]/page.tsx` to be ≤ 60 characters
- [ ] Task 3.3: Rebuild `src/app/sitemap.ts` to include all 15 leagues, clean team URLs, and prune stale match links
- [ ] Task 3.4: Update IndexNow integration (`indexing.ts` & `/api/cron/indexnow`) to submit all core pages and slug URLs dynamically
- [ ] Task 3.5: Add 301 permanent redirects in `next.config.mjs` for `/ar/*`, `/basketball/*`, `/volleyball/*` to eradicate 1,279 GSC 404s
- [ ] Task 3.6: Update `/match/[slug]` to gracefully handle missing/ended matches without returning raw 404s

## Checkpoint 3: Production Build & Full Verification
- [ ] Run `npx tsc --noEmit` -> 0 errors
- [ ] Run `npm run build` -> exit code 0
- [ ] Test legacy 404 redirect: `/ar/basketball/league/acb-14` -> 301 to `/`
- [ ] Test sitemap generation: `http://localhost:3000/sitemap.xml`
- [ ] Test IndexNow submission endpoint: `http://localhost:3000/api/cron/indexnow`
