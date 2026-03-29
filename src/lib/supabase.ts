const SUPABASE_URL = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.SUPABASE_KEY || process.env.SUPABASE_KEY;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
};

async function query<T>(table: string, params: Record<string, string> = {}): Promise<T[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), { headers });
  if (!r.ok) throw new Error(`Supabase error: ${r.status}`);
  return r.json();
}

export async function getLessons() {
  return query<{
    id: string; title: string; tags: string[]; lesson_date: string; level: string;
  }>('lessons', { select: 'id,title,tags,lesson_date,level', order: 'id.asc' });
}

export async function getLesson(id: string) {
  const rows = await query<{
    id: string; title: string; content: string; tags: string[]; lesson_date: string;
  }>('lessons', { id: `eq.${id}`, select: '*' });
  return rows[0] || null;
}

export async function getVocab(lessonId?: string) {
  const params: Record<string, string> = {
    select: 'id,lesson_id,kanji,hiragana,romaji,french',
    order: 'lesson_id.asc,id.asc',
  };
  if (lessonId) params.lesson_id = `eq.${lessonId}`;
  return query<{
    id: number; lesson_id: string; kanji: string | null; hiragana: string; romaji: string | null; french: string;
  }>('vocabulary', params);
}

export async function getGrammar(lessonId?: string) {
  const params: Record<string, string> = {
    select: 'id,lesson_id,pattern,explanation,example_jp,example_fr',
    order: 'lesson_id.asc,id.asc',
  };
  if (lessonId) params.lesson_id = `eq.${lessonId}`;
  return query<{
    id: number; lesson_id: string; pattern: string; explanation: string;
    example_jp: string | null; example_fr: string | null;
  }>('grammar_points', params);
}

export async function getKanji() {
  return query<{
    id: number; character: string; onyomi: string; kunyomi: string;
    meaning_fr: string; example_word: string; example_reading: string; tags: string[];
  }>('kanji', { select: '*', order: 'id.asc' });
}
