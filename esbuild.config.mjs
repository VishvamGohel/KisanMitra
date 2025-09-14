// esbuild.config.mjs
import * as esbuild from "esbuild";

const isDev = process.argv.includes("--watch");

const options = {
  entryPoints: ["index.tsx"],
  bundle: true,
  outfile: "dist/main.js",
  platform: "browser",
  sourcemap: true,
  loader: {
    ".png": "file",
    ".jpg": "file",
    ".jpeg": "file",
    ".svg": "file"
  }
};

async function runBuild() {
  if (isDev) {
    // ✅ Use context API for watch mode
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log("👀 Watching for changes...");
  } else {
    await esbuild.build(options);
    console.log("✅ Build complete");
  }
}

runBuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
