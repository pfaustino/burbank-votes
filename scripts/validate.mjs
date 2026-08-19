import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = JSON.parse(
  readFileSync(join(root, "data/candidates.json"), "utf8"),
).candidates;
const meta = JSON.parse(readFileSync(join(root, "data/meta.json"), "utf8"));

const required = [
  "id",
  "name",
  "office",
  "race",
  "title",
  "confidence",
  "summary",
  "issues",
];

let errors = 0;
function fail(msg) {
  console.error(msg);
  errors += 1;
}

if (!meta.updated || !meta.electionDate) {
  fail("meta.json is missing updated or electionDate");
}

const ids = new Set();
for (const c of candidates) {
  for (const key of required) {
    if (c[key] == null || c[key] === "") fail(`${c.id ?? "?"}: missing ${key}`);
  }
  if (ids.has(c.id)) fail(`duplicate id ${c.id}`);
  ids.add(c.id);
  if (c.race === "council") {
    if (typeof c.x !== "number" || typeof c.y !== "number") {
      fail(`${c.id}: council candidates need numeric x, y`);
    }
  }
}

const council = candidates.filter((c) => c.race === "council");
if (council.length !== 13) {
  fail(`expected 13 council candidates, got ${council.length}`);
}

if (errors) {
  process.exit(1);
}

console.log(`ok · ${candidates.length} candidates · updated ${meta.updated}`);
