# Repository instructions

## Project and preferences

This is a Next.js **Pages Router** boilerplate for creative and marketing sites, using TypeScript, Sanity, styled-components, Framer Motion, and Mux.

- Keep styled-components as the styling system. Do not introduce Tailwind, CSS modules, or migrate to App Router unless requested.
- Prefer small, direct changes and existing utilities over new dependencies or abstractions.
- For review-only requests, report findings in priority order with file references; do not implement fixes unless requested. Documentation edits explicitly requested by the user are in scope.
- For a new project, follow `docs/new-project.md` and add its completed Project Context template to this file. Do not invent CMS schemas or project details.

## Commands and verification

Use npm and preserve `package-lock.json`.

- `npm ci` — install locked dependencies. The locked Next.js version requires Node.js 20.9 or newer.
- `npm run dev` — start the development server.
- `npm run build` — run `buildJson`, then Next.js; the `postbuild` hook generates the sitemap.
- `npm run start` — serve a production build.
- `npm run buildJson` — fetch Sanity site settings into `json/siteSettings.json`; see the limitations below.
- `npm run typecheck` — check TypeScript explicitly. Production builds also validate types.
- `npm run lint` — run ESLint with `eslint.config.mjs`. Existing effect patterns and PageBuilder's random key are reported as warnings; their cleanup is deferred.
- `npm test` — run the Node regression checks in `tests/boilerplate.test.cjs`.
- `.github/workflows/checks.yml` runs lint, typecheck, tests, and a build. Run checks appropriate to the change and report failures and environmental blockers accurately.

## Architecture

- `pages/_app.tsx`: global styles, ThemeProvider, Layout, page transitions, and global hooks. `pageTransitionVariants` is passed to pages as a prop, not exported.
- `pages/_document.js`: collects styled-components SSR styles using `ServerStyleSheet`. Preserve collection and `sheet.seal()` cleanup, together with the styled-components compiler settings in `next.config.js`.
- `pages/`: file-based routes with `getStaticProps` and `getStaticPaths`. Home and work-index data fetching is commented out. `/work/[slug]` fetches Sanity, uses blocking fallback, and revalidates content and missing-document responses every 60 seconds.
- `client.ts`: Sanity client configured by public project ID/dataset and an optional server-only token. It is `null` when unconfigured; CMS routes return 404 so fresh checkouts can build. `lib/sanityQueries/index.ts` contains the shared GROQ queries and `mediaString` projection.
- `components/layout/Layout.tsx`: Header, Footer, and Lenis scroll shell. `LayoutWrapper` sets width and side padding; `LayoutGrid` provides 12 columns, reduced to six at tablet portrait.
- `components/common/PageBuilder/`: maps CMS sections to components through `sections`. The registry is empty; register implemented blocks here. Create `components/blocks/` when a real block requires it.
- `components/common/MediaStack/`: shared CMS image/video rendering, LQIP, motion, and mobile variants. Prefer it for CMS media, but verify the query supplies the fields it needs. `lib/sanityImageLoader.ts` handles Sanity/Mux URLs.
- Media defaults to lazy loading, with a 2160p minimum video resolution retained by preference. `isPriority` or `lazyLoad={false}` opts into eager loading. Explicit `aspectPadding` wins over the selected asset's dimensions; absent metadata uses a 16:9 fallback.
- `lib/datocms.tsx` and `lib/datoQueries/`: legacy DatoCMS integration; use only when a project explicitly needs DatoCMS.

## Coding conventions

- Follow existing component folders: `Name/Name.tsx` with an `index.tsx` re-export; import the folder.
- Use `pxToRem()` for fixed pixel-based spacing and typography, and `theme.mediaBreakpoints` for responsive styles. Prefer CSS for layout responsiveness.
- Theme tokens live in `styles/theme.tsx`; `styles/global.tsx` exposes them as CSS custom properties. Prefer those variables in styled blocks and keep their definitions aligned with the theme.
- Typography uses element selectors and `.type-*` classes. Existing in-view classes pair with `hooks/useInView.tsx`.
- Use transient `$` props for styling-only props that should not reach HTML elements.
- Check `hooks/`, `utils/`, and `shared/variants/` before adding helpers. Shared data types are in `shared/types/types.tsx`.
- Match the edited file's formatting and import style. The `@/*` alias maps to the repository root, but relative imports are common.
- Keep keyboard focus visible, honor reduced-motion preferences, and preserve meaningful image alt text, including empty alt text for decorative images.

## Data and environment rules

- Use `.env.local` for local credentials; never commit secrets. Public project IDs and dataset names are fine, but private API tokens must not use `NEXT_PUBLIC_` names.
- Pass route values to GROQ as query parameters, not interpolated query text.
- Match query results to component types. Handle missing documents with `notFound`, and account for fallback rendering when `fallback: true` is used.
- Keep browser globals and DOM side effects out of server rendering. Use effects with cleanup for listeners and scroll locks.

## Existing limitations to verify when touching related code

These describe the current scaffold, not patterns to copy or instructions to fix unrelated code.

- The settings build step is deliberately non-blocking: it loads Next.js environment files, creates `json/`, and falls back to cached settings or `{}` on missing config/fetch failures. Write failures warn without aborting. The JSON import in Layout is still commented out.
- styled-components stays pinned to 6.1.12 to preserve the existing theme typing. Its PostCSS dependency is overridden to a patched version. Do not remove the override without checking the dependency audit; theme typing and dependency cleanup were deferred.
- Preview API files and shared context are empty stubs; preview is not implemented.
- The first-visit cookie code in `_app.tsx` does not expose `hasVisited` to pages or Layout. Do not assume it is an available animation API.
- Favicon paths and `/og.jpg` referenced in `_document.js` are missing. Set production URLs and environment flags before deployment; robots defaults to disallowing crawling outside production.
