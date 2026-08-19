import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const candidates = JSON.parse(
  readFileSync(join(root, "data/candidates.json"), "utf8"),
).candidates;
const meta = JSON.parse(readFileSync(join(root, "data/meta.json"), "utf8"));
const issueFile = JSON.parse(
  readFileSync(join(root, "data/issues.json"), "utf8"),
);

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

const allowedPos = new Set(["yes", "no", "mixed", "none"]);
const allowedBasis = new Set(["vote", "statement", "none"]);
if (!issueFile.issues?.length) fail("issues.json is missing issues");
for (const c of council) {
  const row = issueFile.stances?.[c.id];
  if (!row) {
    fail(`${c.id}: missing from issues.json`);
    continue;
  }
  for (const issue of issueFile.issues) {
    const cell = row[issue.id];
    if (!cell) {
      fail(`${c.id}: missing stance for ${issue.id}`);
      continue;
    }
    if (!allowedPos.has(cell.pos)) fail(`${c.id}.${issue.id}: bad pos ${cell.pos}`);
    if (!allowedBasis.has(cell.basis)) {
      fail(`${c.id}.${issue.id}: bad basis ${cell.basis}`);
    }
    if (!cell.note) fail(`${c.id}.${issue.id}: missing note`);
    if (cell.pos === "none" && cell.basis !== "none") {
      fail(`${c.id}.${issue.id}: empty cells must use basis none`);
    }
    if (cell.pos !== "none" && cell.basis === "none") {
      fail(`${c.id}.${issue.id}: a yes/no/mixed cell needs a vote or statement`);
    }
  }
}

const councilIds = new Set(council.map((c) => c.id));
for (const id of Object.keys(issueFile.stances ?? {})) {
  if (!councilIds.has(id)) fail(`issues.json has unknown candidate ${id}`);
}

if (errors) {
  process.exit(1);
}

console.log(`ok · ${candidates.length} candidates · updated ${meta.updated}`);
