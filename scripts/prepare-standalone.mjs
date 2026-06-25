import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneRoot = join(root, ".next", "standalone");
const standaloneNext = join(standaloneRoot, ".next");
const staticSource = join(root, ".next", "static");
const staticTarget = join(standaloneNext, "static");
const publicSource = join(root, "public");
const publicTarget = join(standaloneRoot, "public");

if (!existsSync(standaloneRoot)) {
  throw new Error("Missing .next/standalone. Run next build with output: 'standalone'.");
}

mkdirSync(standaloneNext, { recursive: true });

if (existsSync(staticSource)) {
  cpSync(staticSource, staticTarget, { recursive: true, force: true });
}

if (existsSync(publicSource)) {
  cpSync(publicSource, publicTarget, { recursive: true, force: true });
}

console.log("Standalone runtime prepared.");
