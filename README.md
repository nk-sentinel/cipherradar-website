# CipherRadar documentation site

Public docs site for the `cradar` CLI, built with [Astro Starlight](https://starlight.astro.build).
Live at **https://cradar.shadow-lab.org**.

This is a **standalone repo**, intentionally separate from the CipherRadar product repo so the
product repo stays lean and portable. The site is fully self-contained and builds with no
dependency on the product repo's location.

## Scope

Publishes **user-facing CLI documentation only** — the usage guide and a features overview.
Internal design docs, ADRs, and backend/frontend material are deliberately **not** published
here (CipherRadar is open-core; the CLI is Apache-2.0, the rest is planned commercial).

## Content model: vendored

The CLI guide pages under `src/content/docs/guides/cli/` are **vendored** — committed copies of
the canonical docs that live in the product repo at `docs/guides/cli/*.md`. They are refreshed
on demand, so this repo never needs the product repo at build or deploy time.

To refresh after the canonical CLI docs change:

```bash
CRADAR_REPO=/path/to/cipherradar npm run refresh
git add src/content/docs/guides/cli && git commit -m "docs: refresh vendored CLI guide"
```

`npm run refresh` injects Starlight frontmatter and rewrites links (sibling `*.md` → site
routes; ADR/`decisions/` links → GitHub blob URLs; per-page `editUrl` → the product repo source).

Hand-authored pages (`index.mdx` landing, `features.mdx`) live directly in `src/content/docs/`
and are edited here.

## Develop

```bash
npm install
npm run dev      # Astro dev server (serves the vendored content as-is)
npm run build    # production build to dist/
```

## Deploy

Driven from the homelab stack at `~/docker/cradar-docs/`:

- `build.sh` — pulls latest `main` of this repo, builds in a pinned `node:22-alpine` container
  (as the host user; `npm ci` against the committed lockfile), and publishes `dist/` into the
  stack's `site/`.
- A `caddy:2-alpine` container serves `site/` via Traefik at `cradar.shadow-lab.org`
  (Cloudflare terminates TLS at the edge).

Refresh the public site after changes land on `main`: run `~/docker/cradar-docs/build.sh`.

## Stack

- Astro 6 + Starlight 0.39 (pinned), Pagefind search, sitemap.
- Brand theme in `src/styles/brand.css` (palette from the CipherRadar logo).
