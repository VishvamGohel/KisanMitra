// esbuild.config.mjs
import { build } from "esbuild";

const isBuild = process.argv.includes("--build");

build({
  entryPoints: ["index.tsx"],   // adjust if needed
  bundle: true,
  outfile: "dist/bundle.js",
  sourcemap: !isBuild,
  minify: isBuild,
  target: ["esnext"],
  loader: { ".png": "file", ".svg": "file" },
  define: { "process.env.NODE_ENV": JSON.stringify(isBuild ? "production" : "development") },
  jsx: "automatic"
}).catch(() => process.exit(1));
