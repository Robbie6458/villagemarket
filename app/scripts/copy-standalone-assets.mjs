// next build (output: "standalone") intentionally skips copying public/ and
// .next/static into the standalone folder — without them, the deployed app
// serves unstyled HTML because every CSS/JS chunk request 404s.
// Runs automatically after `npm run build` via the postbuild hook.
import { cpSync } from "node:fs";

cpSync("public", ".next/standalone/public", { recursive: true });
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
console.log("postbuild: copied public/ and .next/static into .next/standalone");
