import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const distRoot = resolve(projectRoot, "dist");

await rm(distRoot, { recursive: true, force: true });
await mkdir(resolve(distRoot, "server"), { recursive: true });
await mkdir(resolve(distRoot, "client"), { recursive: true });
await mkdir(resolve(distRoot, ".openai"), { recursive: true });
await copyFile(resolve(projectRoot, "worker/index.js"), resolve(distRoot, "server/index.js"));
await copyFile(resolve(projectRoot, ".openai/hosting.json"), resolve(distRoot, ".openai/hosting.json"));

const publicFiles = [
  "index.html", "about.html", "contact.html", "flavors.html", "gifts.html", "menu.html", "reviews.html",
  "about-story.css", "about-story.js", "homepage.css", "homepage.js",
  "reviews-gelato.css", "reviews-gelato.js", "site.js", "styles.css",
];
await Promise.all(publicFiles.map(file =>
  copyFile(resolve(projectRoot, file), resolve(distRoot, "client", file))
));
await cp(resolve(projectRoot, "assets"), resolve(distRoot, "client/assets"), { recursive: true });

console.log("Built secure Airtable proxy worker");
