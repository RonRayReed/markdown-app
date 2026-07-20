const esbuild = require("esbuild");
const fs = require("node:fs");
const path = require("node:path");

const buildInfo = {
  version: "1.2",
  builtAt: new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
};

fs.writeFileSync(
  path.join(__dirname, "src", "build-info.json"),
  `${JSON.stringify(buildInfo, null, 2)}\n`,
  "utf8"
);

esbuild.buildSync({
  entryPoints: [path.join(__dirname, "src", "renderer-src.js")],
  bundle: true,
  format: "iife",
  outfile: path.join(__dirname, "dist", "renderer.bundle.js")
});
