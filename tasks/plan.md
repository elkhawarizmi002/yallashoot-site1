# Implementation Plan: Shared-DB External Player Architecture (yallashoot-ball.com ↔ yalashout.online)

## Overview
Decompose the streaming separation architecture:
1. Keep the main domain `yallashoot-ball.com` (hosted on private VPS) 100% clean of embedded video streams, serving purely as an SEO-authoritative sports information & schedule portal.
2. Leverage the existing `yalla_player` project (hosted on Vercel at `yalashout.online`), which shares the exact same MongoDB database (`LiveMatch`).
3. Route live viewers from `yallashoot-ball.com` to `yalashout.online` via an external gateway CTA with `rel="nofollow noopener noreferrer"`.
4. Deploy the updated build to the private VPS.

## Architecture Decisions
- **Reuse Existing Player (`yalashout.online`)**: Strongly recommended over building a new player from scratch. Both projects connect to the same MongoDB Atlas cluster (`yallatir_data`), meaning match updates, daily schedules, and stream links are automatically synchronized without custom API bridges.
- **Throwaway / Shield Role for `yalashout.online`**: Hosted on Vercel, this domain serves the video player. Even if rightsholders (LeakID, beIN) target it, the primary ranking domain (`yallashoot-ball.com`) on the VPS remains untouched.
- **Strict Anti-Indexing on `yalashout.online`**: Add `<meta name="robots" content="noindex, nofollow">` and `Disallow: /` so Google never indexes the player URLs, minimizing automated DMCA sweeps.
- **Clean Fallback for Finished Matches on Main Site**: Once a match finishes, all broadcast triggers disappear, and the page renders editorial score/stats to neutralize existing DMCA notices.

## Task List

### Phase 1: Player Routing & Shared Database Alignment
- [ ] Task 1: Verify URL routing contract between `yallashoot-ball.com` and `yalashout.online` (ensure `yalashout.online` accepts `match` ID and `slug` query parameters or pathname).
- [ ] Task 2: Verify `NEXT_PUBLIC_EXTERNAL_PLAYER_URL` environment configuration in `yallashoot.com`.

### Checkpoint 1: Routing Verification
- [ ] Test URL generation for live and upcoming matches: links resolve to `https://yalashout.online/?match=[id]&slug=[slug]`.

### Phase 2: Gateway UI & SEO Neutralization on Main Site
- [ ] Task 3: Ensure `SecurePlayer.tsx` in `yallashoot.com` displays the multi-server gateway with zero stream embeds, opening `yalashout.online` in a new window.
- [ ] Task 4: Ensure dynamic metadata in `src/app/match/[slug]/page.tsx` sets `type: "website"` and post-match titles without "بث مباشر".
- [ ] Task 5: Run production build `npm run build` and verify 0 errors.

### Checkpoint 2: Main Site Clean Verification
- [ ] Local build passes (`next build` exit code 0).
- [ ] No HLS or video tags rendered in match page server output.

### Phase 3: Player Domain Shielding (`yalashout.online`)
- [ ] Task 6: Add `robots.txt` (`Disallow: /`) and `<meta name="robots" content="noindex, nofollow">` to the `yalla_player` project to prevent search engine indexing.

### Phase 4: Production Deployment on VPS
- [ ] Task 7: Git commit & push clean codebase to `origin/main`.
- [ ] Task 8: Pull updates on the private VPS server and restart the Node/PM2 service.
- [ ] Task 9: Purge Cloudflare cache and verify live site `https://www.yallashoot-ball.com/match/psg-lyon-4735227`.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| DMCA notice against `yalashout.online` | Low | Domain is disposable. A new player domain can be swapped in `.env.local` (`NEXT_PUBLIC_EXTERNAL_PLAYER_URL`) in 60 seconds without touching the main site code. |
| VPS caching old build | Med | Run `git pull && npm run build && pm2 restart <app>` on the VPS, then Cloudflare Purge Everything. |
| User drops off during redirect | Low | Sleek CTA with prominent server selector and seamless `_blank` transition keeps match front and center. |
