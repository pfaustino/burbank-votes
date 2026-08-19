# Burbank Votes

Living nonpartisan voter guide for Burbank’s **November 3, 2026** election.

Site: https://pfaustino.github.io/burbank-votes/

Not an official City of Burbank resource.

## Update the living guide

All candidate facts live in JSON. Do not hard-code a new person in the page.

1. Edit `data/candidates.json`
   - Add or change `site`, `summary`, `issues`, `x` / `y` (council only), `confidence`
   - Set `needsPlatform` to `false` once a real 2026 platform exists
2. Bump `updated` in `data/meta.json` and add a `changelog` line
3. Run `npm run check`
4. Commit and push to `main` — GitHub Pages republishes automatically

Alignment axes (council only):

- **x** −100 labor/tenant → +100 business/property
- **y** −100 neighborhood preservation → +100 housing & transit expansion

## Local

```bash
npm install
npm run dev
```

## Sources

Public campaign websites, myBurbank, Burbank Leader, Streetsblog LA, DSA-LA, Vision Burbank / Fair Housing PAC, Los Angeles County candidate list, 2024 League of Women Voters forum transcripts, and city/school-board public comment.
