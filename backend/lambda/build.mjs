import { build } from "esbuild";
import { mkdir } from "node:fs/promises";

await mkdir("dist/lambda", { recursive: true });

await build({
  entryPoints: ["lambda/index.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "cjs",
  outfile: "dist/lambda/index.js",
  logLevel: "info",
});

console.log("Bundle da Lambda gerado em dist/lambda/index.js");
