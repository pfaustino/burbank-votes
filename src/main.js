import { lastName, renderCompass } from "./grid.js";
import candidateData from "../data/candidates.json";
import issueData from "../data/issues.json";
import meta from "../data/meta.json";

const candidates = candidateData.candidates;
const council = candidates.filter((c) => c.race === "council");
const issues = issueData.issues;
const stanceLabels = issueData.labels;

function fmtDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function linkFor(c) {
  if (c.site) {
    return `<a href="${c.site}" rel="noopener">${c.siteLabel}</a>`;
  }
  return `<span>${c.siteLabel}</span>`;
}

function related(c) {
  if (!c.related?.length) return "";
  return c.related
    .map((r) => `<a href="${r.href}" rel="noopener">${r.label}</a>`)
    .join(" · ");
}

function pills(c) {
  const bits = [
    `<span class="pill ${c.confidence}">${c.confidence} confidence</span>`,
  ];
  if (c.incumbent) bits.push('<span class="pill">Incumbent</span>');
  if (c.unopposed) bits.push('<span class="pill gold">Unopposed</span>');
  if (c.needsPlatform) bits.push('<span class="pill">Needs platform</span>');
  return bits.join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function stanceOf(id, issueId) {
  return issueData.stances[id]?.[issueId] ?? {
    pos: "none",
    basis: "none",
    note: "No public record yet.",
  };
}

function stanceList(c) {
  return `
    <dl class="stance-list">
      ${issues
        .map((issue) => {
          const s = stanceOf(c.id, issue.id);
          return `<div>
            <dt>${escapeHtml(issue.label)}</dt>
            <dd>
              <span class="mark ${s.pos}">${escapeHtml(stanceLabels[s.pos])}</span>
              ${s.basis === "vote" ? '<span class="basis">vote</span>' : ""}
              ${escapeHtml(s.note)}
            </dd>
          </div>`;
        })
        .join("")}
    </dl>
  `;
}

function renderDetail(c) {
  document.getElementById("detail").innerHTML = `
    <h3>${c.name}</h3>
    <p class="office">${c.title} · ${c.cluster}</p>
    <div class="meta-row">${pills(c)}</div>
    <p><strong>${c.issues}</strong></p>
    <p>${c.summary}</p>
    ${stanceList(c)}
    <p>Campaign: ${linkFor(c)}</p>
    ${c.related?.length ? `<p>Also: ${related(c)}</p>` : ""}
  `;
}

function renderMatrix(selectedId) {
  const head = issues
    .map(
      (issue) =>
        `<th scope="col" title="${escapeHtml(issue.question)}">${escapeHtml(issue.short)}</th>`,
    )
    .join("");
  const rows = council
    .map((c) => {
      const cells = issues
        .map((issue) => {
          const s = stanceOf(c.id, issue.id);
          return `<td class="${s.pos}" title="${escapeHtml(s.note)}"><span class="sr">${escapeHtml(issue.short)}: </span>${escapeHtml(stanceLabels[s.pos])}</td>`;
        })
        .join("");
      const current = c.id === selectedId ? " current" : "";
      return `<tr class="${current}" data-open="${c.id}">
        <th scope="row"><button type="button" data-open="${c.id}">${lastName(c.name)}</button></th>
        ${cells}
      </tr>`;
    })
    .join("");
  document.getElementById("issues-chart").innerHTML = `
    <table class="matrix">
      <thead>
        <tr>
          <th scope="col">Candidate</th>
          ${head}
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function card(c, clickable) {
  const title = clickable
    ? `<button type="button" data-open="${c.id}"><h3>${c.name}</h3></button>`
    : `<h3>${c.name}</h3>`;
  return `
    <article class="card" id="card-${c.id}">
      ${title}
      <p class="office">${c.office}${c.unopposed ? " · unopposed" : ""} · ${c.title}</p>
      <p>${c.issues}</p>
      <p>${linkFor(c)}${c.related?.length ? ` · ${related(c)}` : ""}</p>
    </article>
  `;
}

function select(id) {
  const person = council.find((c) => c.id === id) ?? council[0];
  history.replaceState(null, "", `#${person.id}`);
  renderCompass(
    document.getElementById("compass"),
    council,
    person.id,
    meta.axes,
    select,
  );
  renderDetail(person);
  renderMatrix(person.id);
}

function boot() {
  document.getElementById("lede").textContent =
    `${meta.electionLabel} municipal election. ${meta.seats.council} council seats, plus clerk, treasurer, and two school-board areas. This page updates as candidates publish more.`;

  document.getElementById("dates").innerHTML = meta.dates
    .map((d) => `<li><strong>${d.date}</strong><span>${d.label}</span></li>`)
    .join("");

  document.getElementById("living").textContent =
    `Living guide · last updated ${fmtDate(meta.updated)} · candidates certified as of ${fmtDate(meta.certifiedAsOf)}`;

  document.getElementById("council-list").innerHTML = council
    .map((c) => card(c, true))
    .join("");

  document.getElementById("citywide-list").innerHTML = candidates
    .filter((c) => c.race === "clerk" || c.race === "treasurer")
    .map((c) => card(c, false))
    .join("");

  document.getElementById("schools-list").innerHTML = candidates
    .filter((c) => c.race === "busd3" || c.race === "busd4")
    .map((c) => card(c, false))
    .join("");

  document.getElementById("changelog").innerHTML = meta.changelog
    .map((row) => `<li><strong>${fmtDate(row.date)}</strong> — ${row.note}</li>`)
    .join("");

  document.getElementById("disclaimer").textContent = meta.disclaimer;

  document.getElementById("council-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open]");
    if (!btn) return;
    select(btn.getAttribute("data-open"));
    document.getElementById("grid").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("issues-chart").addEventListener("click", (e) => {
    const hit = e.target.closest("[data-open]");
    if (!hit) return;
    select(hit.getAttribute("data-open"));
    document.getElementById("detail").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  const fromHash = location.hash.replace("#", "");
  select(council.some((c) => c.id === fromHash) ? fromHash : "perez");
}

boot();
