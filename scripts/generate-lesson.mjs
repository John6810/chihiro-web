import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

async function query(table, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), { headers });
  if (!r.ok) throw new Error(`Supabase ${r.status}`);
  return r.json();
}

async function generateLesson(lessonId) {
  const lesson = (await query('lessons', { id: `eq.${lessonId}`, select: '*' }))[0];
  const vocab = await query('vocabulary', { lesson_id: `eq.${lessonId}`, select: '*', order: 'id.asc' });
  const grammar = await query('grammar_points', { lesson_id: `eq.${lessonId}`, select: '*', order: 'id.asc' });

  if (!lesson) throw new Error(`Lesson ${lessonId} not found`);

  console.log(`Generating course for: ${lesson.title}`);
  console.log(`  Vocab: ${vocab.length} words, Grammar: ${grammar.length} points`);

  const client = new Anthropic();

  const prompt = `Tu es un professeur de japonais experimenté qui enseigne le JLPT N5 a des francophones adultes (INL Luxembourg).

A partir des donnees ci-dessous, genere une **fiche de cours complete et structuree** en JSON.

## Données de la lecon

**Titre:** ${lesson.title}
**ID:** ${lesson.id}
**Date:** ${lesson.lesson_date || 'N/A'}
**Tags:** ${(lesson.tags || []).join(', ')}

### Vocabulaire (${vocab.length} mots)
${JSON.stringify(vocab.map(v => ({ hiragana: v.hiragana, kanji: v.kanji, romaji: v.romaji, french: v.french })), null, 2)}

### Points de grammaire (${grammar.length} points)
${JSON.stringify(grammar.map(g => ({ pattern: g.pattern, explanation: g.explanation, example_jp: g.example_jp, example_fr: g.example_fr })), null, 2)}

## Format attendu (JSON strict)

Reponds UNIQUEMENT avec du JSON valide, sans markdown, sans backticks :

{
  "objectifs": ["objectif 1", "objectif 2", "objectif 3"],
  "intro": "Un paragraphe d'introduction au cours (2-3 phrases, contexte culturel ou pratique)",
  "sections": [
    {
      "titre": "Titre de la section",
      "type": "explication | dialogue | exercice | culture | recap",
      "contenu": "Contenu en markdown (paragraphes, listes, etc.)"
    }
  ],
  "dialogue_exemple": {
    "titre": "Titre du dialogue",
    "contexte": "Description de la situation",
    "lignes": [
      { "locuteur": "A", "jp": "phrase japonaise", "fr": "traduction" }
    ]
  },
  "points_cles": ["point important 1", "point important 2"],
  "erreurs_courantes": ["erreur 1 a eviter", "erreur 2 a eviter"],
  "exercices": [
    {
      "consigne": "Instruction de l'exercice",
      "type": "traduction | qcm | trou | production",
      "items": ["item 1", "item 2", "item 3"]
    }
  ],
  "conseil_prof": "Un conseil pedagogique ou culturel pour aller plus loin"
}

## Consignes

- Le cours doit etre PEDAGOGIQUE : progressif, avec des explications claires
- Inclus des sections culturelles quand c'est pertinent (ex: politesse japonaise, contexte d'utilisation)
- Les dialogues doivent etre REALISTES et adaptes au niveau N5
- Les exercices doivent etre VARIES (traduction, QCM, textes a trous, production)
- Utilise les donnees fournies mais enrichis-les avec ton expertise de prof
- Tout le texte en francais sauf les exemples japonais
- Genere entre 4 et 8 sections
- JSON STRICT, pas de commentaires`;

  const response = await client.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();

  // Parse JSON (handle potential markdown wrapping)
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    // Try extracting from code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) json = JSON.parse(match[1].trim());
    else throw new Error('Failed to parse response as JSON:\n' + text.slice(0, 500));
  }

  // Save to file
  mkdirSync('src/data/cours', { recursive: true });
  const outPath = `src/data/cours/${lessonId}.json`;
  writeFileSync(outPath, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`Saved to ${outPath}`);
  return json;
}

const lessonId = process.argv[2] || 'lecon-01';
generateLesson(lessonId).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
