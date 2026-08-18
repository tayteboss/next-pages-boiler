# CLAUDE.md

Next.js (Pages Router) + Sanity + styled-components boilerplate for creative/marketing sites. Starting a new project? Follow `docs/new-project.md` (setup checklist + Project Context template to paste back here once filled out).

## Commands

- `npm run dev` / `npm run lint`
- `npm run build` — runs buildJson first, postbuild generates sitemap
- `npm run buildJson` — fetches Sanity `siteSettings` into `json/siteSettings.json`
- No tests. TS build errors are ignored in next.config.js — still keep types correct.

## Stack & architecture

- Next.js 16 **Pages Router**, SSG via `getStaticProps`/`getStaticPaths` (`fallback: true` — guard pages against undefined `data`).
- Sanity: client in `client.ts` (env vars per `.env.example`), GROQ queries in `lib/sanityQueries/index.ts` (reuse the `mediaString` fragment), image loader `lib/sanityImageLoader.ts`. DatoCMS files (`lib/datocms.tsx`, `lib/datoQueries/`) are legacy — ignore unless the project uses Dato.
- Page shape (see `pages/index.tsx`): `PageWrapper = styled(motion.div)` with `pageTransitionVariants` from `_app.tsx`, `<NextSeo>` from CMS seo fields, data fetched in `getStaticProps`.
- `components/common/PageBuilder/` maps CMS blocks to components via its `sections` lookup — register new section components there; they live in `components/blocks/`.
- Layout: `Layout` (Header/Footer/Lenis smooth-scroll shell), `LayoutWrapper` (max-width + side padding), `LayoutGrid` (12-col, 6-col at tabletPortrait).
- **MediaStack** for all CMS imagery/video (Sanity image vs Mux, LQIP, in-view fade, mobile variants) — never raw `next/image` for CMS media.

## Conventions

- Components: `Name/Name.tsx` + `Name/index.tsx` re-export — import the folder.
- styled-components only (no CSS modules); `pxToRem()` for all px values; media queries via `props.theme.mediaBreakpoints.*`.
- Tokens live in `styles/theme.tsx`, mirrored as CSS vars in `styles/global.tsx` (`--colour-black`, ...) — prefer the CSS vars in styled blocks; keep both files in sync.
- Typography: element + `.type-*` class pairs in `styles/global.tsx`.
- In-view animations: `.view-element-*` classes + `--in-view` modifier, paired with `hooks/useInView.tsx`.
- Shared types in `shared/types/types.tsx`; reusable motion variants in `shared/variants/variants.tsx`; check `hooks/` before writing a new hook.
- Indent/quote style is mixed across files — match the file you're editing.

## Gotchas

- `@/*` alias maps to repo root but most code uses relative imports — match the file.
- `scripts/api.js` has a hardcoded Sanity `projectId` — update per project (feeds `buildJson`; `Layout.tsx` require of the JSON is currently commented out).
- `shared/context/context.tsx` and the preview API routes are empty stubs.
- First-visit cookie logic (`visited`, 5s delay) in `_app.tsx` — hook intro animations off `hasVisited`.
