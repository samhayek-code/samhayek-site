# Cleanup Log — 2026-06-04

Read-only scan → cleanup pass. **Nothing pushed or deployed.** Every destructive action below is recoverable.

## Safety net / how to undo

- **Junk backup tarball:** `backups/cleanup-junk-20260604-194507.tar.gz` holds everything in "Deleted files".
  Restore all with: `tar -xzf backups/cleanup-junk-20260604-194507.tar.gz -C .`
- **Contact form** was moved to branch **`contact-form`** (off `main`, not deployed).
  Continue it with `git checkout contact-form`.
- All code/dep changes are **atomic commits on `main` (unpushed)** — undo with `git revert <sha>` or `git reset`.

## Deleted files (local junk — none were git-tracked)

- `dist/` — stale Sanity Studio static build (regenerates on `npx sanity build`/`deploy`)
- `.entire/` — leftover from the now-disabled Entire session tracking
- `extras/` — contained only a `.DS_Store`
- `{app,components,lib,sanity` — empty directory from a brace-expansion typo
- `.conductor/` — empty
- `tsconfig.tsbuildinfo` — TS incremental cache (regenerates; now gitignored)

## Dependencies removed (verified zero imports)

- `remixicon` — used `@remixicon/react` instead
- `@whop/checkout` — Whop checkout is a hand-built iframe URL, not the SDK
- `react-is` — unused direct dep, was version-mismatched with React 18

## Code fixes

- `HomeClient.tsx` footer: hardcoded `© 2026` → `© {new Date().getFullYear()}`
- `Card.tsx`: removed dead Shop-icon stub (empty maps; that render path never fired)

## Tooling

- ESLint configured (`.eslintrc.json` → `next/core-web-vitals`); run with `npm run lint`.
- Added `.entire/` and `tsconfig.tsbuildinfo` to `.gitignore`.

## Left untouched (intentional)

- `content/` (484M) and `backups/` (207M) — gitignored local staging/backups
- `PENCIL/`, `_drafts/`, `samhayek-site-update.md`, the one-off `scripts/*.mjs` — kept as-is
- Unpushed commit on `main`: `06bbfe3` "Populate Halo tool modal" — yours, left alone
