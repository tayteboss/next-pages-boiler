# New project setup

Checklist for starting a project from this boilerplate:

1. Fill out the Project Context template below and paste it into `CLAUDE.md`
2. Copy `.env.example` → `.env` and set Sanity/Mux/site vars
3. Update hardcoded `projectId` in `scripts/api.js`; create the `json/` directory (buildJson writes there)
4. Set colours/fonts in `styles/theme.tsx`, load fonts in `styles/fonts.css`, sync CSS vars + type scale in `styles/global.tsx`
5. Replace favicon set — `_document.js` expects `/favicon/*` files (`favicon-96x96.png`, `favicon.svg`, `apple-touch-icon.png`, `site.webmanifest`) which aren't in `public/` yet; add `public/og.jpg`
6. Set `SITE_URL` + `NEXT_PUBLIC_ENVIRONMENT` for sitemap/robots (staging/development get `disallow: /`)
7. Uncomment data fetching in pages, wire up `siteSettings` in `Layout.tsx`, register sections in PageBuilder

## Project Context template

Paste into `CLAUDE.md` and fill out; delete rows that don't apply.

```markdown
## Project Context

- **Project name:**
- **Client:**
- **One-line description:** <!-- e.g. "Portfolio site for a photography studio" -->
- **Live URL:**
- **Staging URL:**
- **Design file:** <!-- Figma link -->
- **CMS:** <!-- Sanity (default) or DatoCMS. Sanity project ID + dataset: -->
- **Sanity Studio repo/location:**
- **Fonts:** <!-- names, weights, where they're licensed/loaded from -->
- **Pages/routes:** <!-- e.g. /, /work, /work/[slug], /about, /contact -->
- **Page builder sections:** <!-- e.g. heroBlock, mediaBlock, textColumnsBlock -->
- **Motion/animation direction:** <!-- e.g. subtle fades, heavy scroll-driven -->
- **Special features:** <!-- e.g. Mux video-heavy, password-protected pages, forms -->
- **Deployment:** <!-- e.g. Vercel project name, build hooks, webhook from Sanity -->
- **Analytics:** <!-- GA ID if used — uncomment <GoogleAnalytics> in components/layout/Layout.tsx -->
- **Notes / anything unusual:**
```
