import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(rootDir, process.env.AETHER_SOURCE_DIR ?? ".");
const distDir = path.join(rootDir, "dist");
const assetsDir = path.join(distDir, "assets");

const sourceIndexPath = path.join(sourceDir, "index.html");
const sourceAudioPath = path.join(sourceDir, "The_Clockmaker_s_Proof.mp3");

function extractTag(source, pattern, description) {
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Build script could not find ${description}.`);
  }
  return match;
}

async function buildSite() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(assetsDir, { recursive: true });

  const sourceHtml = await readFile(sourceIndexPath, "utf8");
  const moduleMatch = extractTag(
    sourceHtml,
    /<script type="module">([\s\S]*?)<\/script>/,
    "inline module script",
  );
  const importMapMatch = sourceHtml.match(/<script type="importmap">[\s\S]*?<\/script>\s*/);

  await build({
    stdin: {
      contents: moduleMatch[1],
      resolveDir: sourceDir,
      sourcefile: "logos-inline-module.js",
      loader: "js",
    },
    bundle: true,
    format: "iife",
    minify: true,
    sourcemap: true,
    target: ["es2020"],
    outfile: path.join(assetsDir, "main.js"),
    platform: "browser",
  });

  await cp(sourceAudioPath, path.join(assetsDir, "The_Clockmaker_s_Proof.mp3"));

  let builtHtml = sourceHtml;
  if (importMapMatch) {
    builtHtml = builtHtml.replace(importMapMatch[0], "");
  }

  builtHtml = builtHtml
    .replace(
      moduleMatch[0],
      '<script src="./assets/main.js" defer></script>',
    )
    .replace(
      './The_Clockmaker_s_Proof.mp3',
      './assets/The_Clockmaker_s_Proof.mp3',
    );

  if (builtHtml === sourceHtml) {
    throw new Error("Build script could not rewrite the production asset references.");
  }

  await writeFile(path.join(distDir, "index.html"), builtHtml);
  await writeFile(path.join(distDir, "404.html"), builtHtml);
  await writeFile(
    path.join(distDir, "_headers"),
    [
      "/",
      "  Cache-Control: public, max-age=0, must-revalidate",
      "",
      "/404.html",
      "  Cache-Control: public, max-age=0, must-revalidate",
      "",
      "/assets/*",
      "  Cache-Control: public, max-age=31536000, immutable",
      "",
    ].join("\n"),
  );
}

buildSite().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
