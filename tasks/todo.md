# Todo Tasks: Shared-DB External Player Architecture & VPS Deployment

## Phase 1: Shared Database & Player Routing Contract
- [x] **Task 1: Verify URL Routing Contract with `yalashout.online`**
  - **Description:** Define and verify the exact URL parameters (`match`, `slug`, `server`) passed from `yallashoot-ball.com` so `yalla_player` on Vercel opens the correct match stream from the shared database.
  - **Acceptance criteria:**
    - URL structure formatted as: `https://yalashout.online/[slug]`.
    - `NEXT_PUBLIC_EXTERNAL_PLAYER_URL` set in `yallashoot.com/.env.local`.
  - **Verification:**
    - Tested `curl -I https://www.yalashout.online/psg-lyon-4735227` -> 200 OK via Vercel.

## Phase 2: Gateway UI & SEO Neutralization in Main Site (`yallashoot.com`)
- [x] **Task 2: Replace Embedded Video Player with External Gateway Card**
  - **Description:** Redesign `SecurePlayer.tsx` in `yallashoot.com` to render an external stream gateway card for live matches with server switching and `rel="nofollow noopener"` external links, and an informational summary for finished matches.
  - **Acceptance criteria:**
    - Zero `video` or `hls.js` instances rendered on `yallashoot-ball.com`.
    - Clicking the watch button triggers smartlink and opens `yalashout.online` in a new tab.
  - **Verification:**
    - Verified in `src/components/SecurePlayer.tsx`.
- [x] **Task 3: Neutralize OpenGraph and Schema Metadata for Finished Matches**
  - **Description:** Remove `type: "video.other"` from `src/app/match/[slug]/page.tsx` and dynamically alter H1 and title for finished matches to show score and summary rather than live stream keywords.
  - **Acceptance criteria:**
    - OpenGraph type is `"website"`.
    - Finished matches use post-match editorial metadata.
  - **Verification:**
    - Verified in `src/app/match/[slug]/page.tsx`.
- [x] **Task 4: Production Build Verification**
  - **Description:** Run full Next.js production build to ensure TypeScript types and bundle succeed.
  - **Acceptance criteria:**
    - `npm run build` completes with exit code 0.
  - **Verification:**
    - Verified `next build` compiled in 43s with code 0.

## Phase 3: Player Domain Shielding (`yalashout.online`)
- [x] **Task 5: Shield `yalashout.online` from Search Indexing**
  - **Description:** Add `robots.txt` (`Disallow: /`) and `<meta name="robots" content="noindex, nofollow" />` in `yalla_player` on Vercel.
  - **Acceptance criteria:**
    - `https://yalashout.online/robots.txt` returns `Disallow: /`.
    - Google does not index player URLs.
  - **Verification:**
    - Pushed commit `0b59142` to `yalla-player-v2` repository.

## Phase 4: Production Deployment on Private VPS
- [x] **Task 6: Git Commit & Push Code to GitHub Repository**
  - **Description:** Commit and push all clean files to `origin/main` (`elkhawarizmi002/yallashoot-site1`).
  - **Acceptance criteria:**
    - Commit `53c084a` pushed to GitHub.
  - **Verification:**
    - `git ls-remote origin main` confirms commit is at HEAD.
- [ ] **Task 7: Pull & Restart on Private VPS Server**
  - **Description:** On the VPS hosting `yallashoot-ball.com`, pull latest changes from `main`, run `npm run build`, and restart the service (PM2 / systemd).
  - **Acceptance criteria:**
    - VPS runs the latest build containing the external gateway.
  - **Verification:**
    - `curl -s https://www.yallashoot-ball.com/robots.txt` reflects the updated rules.
- [ ] **Task 8: Purge Cloudflare Cache**
  - **Description:** Purge cache in Cloudflare dashboard to immediately serve the new build to all users.
  - **Acceptance criteria:**
    - `https://www.yallashoot-ball.com/match/psg-lyon-4735227` shows the gateway card without embedded player.
  - **Verification:**
    - Hard refresh in browser (`Ctrl+Shift+R`).
