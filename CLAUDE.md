# Chihiro Web

Application web statique pour l'apprentissage du japonais (JLPT N5), destinee a des francophones (INL Luxembourg).

## Stack technique

- **Framework** : Astro 6.1.1 (output `static`, pas de SSR)
- **Langage** : TypeScript (mode strict)
- **Donnees** : Supabase REST API (fetch au build-time uniquement)
- **Styling** : CSS vanilla avec variables custom (--pink, --purple, --blue, --green)
- **Fonts** : M PLUS Rounded 1c (UI) + Zen Maru Gothic (japonais)
- **Runtime** : Node.js >= 22.12.0
- **Serveur** : nginx Alpine (image Docker)
- **Deploiement** : GitHub Actions -> GHCR -> ArgoCD

## Commandes

```bash
npm install          # Installer les dependances
npm run dev          # Serveur de dev local
npm run build        # Build statique dans /dist
npm run preview      # Previsualiser le build
```

## Variables d'environnement

Requises dans `.env` (ou en build args Docker) :

- `SUPABASE_URL` — URL de l'API Supabase
- `SUPABASE_KEY` — Cle service role Supabase

## Architecture du projet

```
src/
  layouts/Layout.astro    — Layout principal (nav, header, footer)
  pages/
    index.astro           — Dashboard avec stats et dernieres lecons
    vocabulaire.astro     — Table de vocabulaire avec recherche
    grammaire.astro       — Points de grammaire par lecon
    kanji.astro           — Grille de kanji avec recherche
    lecons/
      index.astro         — Liste de toutes les lecons
      [id].astro          — Detail d'une lecon (vocab + grammaire)
  lib/
    supabase.ts           — Fonctions de requetes Supabase typees
  styles/
    global.css            — Styles globaux et variables CSS
public/                   — Assets statiques (favicon)
```

## Tables Supabase

| Table            | Contenu                                    |
|------------------|--------------------------------------------|
| `lessons`        | Lecons JLPT N5 (id, title, tags, date...)  |
| `vocabulary`     | ~1035 mots (kanji, hiragana, romaji, fr)   |
| `grammar_points` | ~153 points (pattern, explication, exemples)|
| `kanji`          | ~94 kanji (onyomi, kunyomi, meaning_fr)    |

## Conventions

- **UI en francais** — tout le texte visible est en francais
- **Donnees au build-time** — aucun appel API cote client, tout est statique
- **Recherche client-side** — filtrage vanilla JS sur les pages vocabulaire, grammaire, kanji
- **Routes dynamiques** — `[id].astro` genere une page par lecon via `getStaticPaths()`
- **CSS global** — pas de styles scoped, un seul fichier `global.css`
- **Typage generique** — `query<T>()` dans supabase.ts pour des requetes typees
- **Zero framework JS** — pas de React/Vue/Svelte, seulement Astro + vanilla JS

## CI/CD

Le workflow `.github/workflows/build.yml` :
1. Trigger sur push `main` (si src/, public/, package*, Dockerfile, ou config modifies)
2. Build image Docker multi-stage (node:20-alpine -> nginx:alpine)
3. Push vers `ghcr.io/john6810/chihiro-web:<sha>` + `:latest`
4. Met a jour le tag image dans `john6810/argocd-apps` pour ArgoCD

## Site

URL de production : https://chihiro.neko-it.be
