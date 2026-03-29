# Chihiro Web

Static Astro site displaying JLPT N5 lessons, vocabulary, grammar, and kanji from Supabase.

## Pages

- `/` — Dashboard with stats and latest lessons
- `/lecons` — All lessons
- `/lecons/:id` — Lesson detail (vocab + grammar)
- `/vocabulaire` — Searchable vocabulary table (1035 words)
- `/grammaire` — Grammar points by lesson (153 points)
- `/kanji` — Kanji grid with readings (94 kanji)

## Dev

```bash
npm install
cp .env.example .env  # fill SUPABASE_URL + SUPABASE_KEY
npm run dev
```

## Deploy

Push to `main` builds a static Docker image (nginx) via GitHub Actions, pushed to GHCR, deployed by ArgoCD.

## Tech

- [Astro](https://astro.build/) (static output)
- Supabase REST API (build-time fetch)
- nginx for serving
