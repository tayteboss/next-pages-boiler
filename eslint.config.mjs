import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    files: [
      "components/common/MediaStack/{ImageComponent,VideoComponent}.tsx",
      "hooks/{useActiveLink,useViewportWidth,useWindowDimensions}.tsx",
      "pages/_app.tsx",
    ],
    rules: {
      // Report existing effect patterns without forcing the deferred refactor.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["components/common/PageBuilder/PageBuilder.tsx"],
    rules: {
      // Stable block keys are part of the deferred PageBuilder cleanup.
      "react-hooks/purity": "warn",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "json/**"]),
]);
