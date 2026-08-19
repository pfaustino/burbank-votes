const SIZE = 500;
const PAD = 50;
const PLOT = 400;

export function toSvg(n, flip) {
  const v = flip ? -n : n;
  return PAD + ((v + 100) / 200) * PLOT;
}

export function renderCompass(el, people, selectedId, axes, onSelect) {
  const labels = people
    .map((c) => {
      const cx = toSvg(c.x, false);
      const cy = toSvg(c.y, true);
      const active = c.id === selectedId;
      const faint = c.confidence === "low" || c.confidence === "medium";
      const last = c.name.split(" ").slice(-1)[0];
      return `
        <g class="plot" data-id="${c.id}" role="button" tabindex="0" aria-label="${c.name}">
          <circle
            cx="${cx}" cy="${cy}"
            r="${active ? 8 : 5.5}"
            fill="${active ? "#9a3b2f" : faint ? "#8a8173" : "#1d2a3a"}"
            opacity="${faint && !active ? 0.55 : 1}"
          />
          ${active ? `<circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="#9a3b2f" />` : ""}
          <text x="${cx + c.lx}" y="${cy + c.ly}" fill="${active ? "#161d27" : "#5e574c"}">${last}</text>
        </g>`;
    })
    .join("");

  el.innerHTML = `
    <svg viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="City Council alignment grid">
      <rect x="${PAD}" y="${PAD}" width="${PLOT}" height="${PLOT}" fill="#fffaf2" stroke="#2a2218" />
      <line x1="250" y1="${PAD}" x2="250" y2="${PAD + PLOT}" stroke="#c9bda8" />
      <line x1="${PAD}" y1="250" x2="${PAD + PLOT}" y2="250" stroke="#c9bda8" />
      <text x="250" y="28" text-anchor="middle" fill="#5e574c" font-size="12">${axes.yTop}</text>
      <text x="250" y="490" text-anchor="middle" fill="#5e574c" font-size="12">${axes.yBottom}</text>
      <text x="16" y="250" text-anchor="middle" fill="#5e574c" font-size="12" transform="rotate(-90 16 250)">${axes.xLeft}</text>
      <text x="484" y="250" text-anchor="middle" fill="#5e574c" font-size="12" transform="rotate(90 484 250)">${axes.xRight}</text>
      ${labels}
    </svg>
  `;

  el.querySelectorAll(".plot").forEach((g) => {
    const id = g.getAttribute("data-id");
    const go = () => onSelect(id);
    g.addEventListener("click", go);
    g.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });
}
