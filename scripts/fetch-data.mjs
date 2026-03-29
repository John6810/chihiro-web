/**
 * Pre-fetch all Supabase data and save as local JSON files.
 * Run this locally before committing: node scripts/fetch-data.mjs
 * The Docker build then uses local files, no network access needed.
 */
import { writeFileSync, mkdirSync } from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in env');
  process.exit(1);
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

async function query(table, params = {}) {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), { headers });
  if (!r.ok) throw new Error(`Supabase ${table}: ${r.status}`);
  return r.json();
}

async function main() {
  mkdirSync('src/data', { recursive: true });

  console.log('Fetching lessons...');
  const lessons = await query('lessons', { select: 'id,title,content,tags,lesson_date,level', order: 'id.asc' });
  writeFileSync('src/data/lessons.json', JSON.stringify(lessons, null, 2));
  console.log(`  ${lessons.length} lessons`);

  console.log('Fetching vocabulary...');
  const vocab = await query('vocabulary', { select: 'id,lesson_id,kanji,hiragana,romaji,french', order: 'lesson_id.asc,id.asc' });
  writeFileSync('src/data/vocabulary.json', JSON.stringify(vocab, null, 2));
  console.log(`  ${vocab.length} words`);

  console.log('Fetching grammar...');
  const grammar = await query('grammar_points', { select: 'id,lesson_id,pattern,explanation,example_jp,example_fr', order: 'lesson_id.asc,id.asc' });
  writeFileSync('src/data/grammar.json', JSON.stringify(grammar, null, 2));
  console.log(`  ${grammar.length} points`);

  console.log('Fetching kanji...');
  const kanji = await query('kanji', { select: '*', order: 'id.asc' });
  writeFileSync('src/data/kanji.json', JSON.stringify(kanji, null, 2));
  console.log(`  ${kanji.length} kanji`);

  console.log('Done! Data saved to src/data/');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
