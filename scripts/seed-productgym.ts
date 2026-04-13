import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

type Level = 'junior' | 'mid' | 'senior';

type Row = {
  level: string;
  Company: string;
  Category: string;
  'Original Question': string;
  Step: number | string;
  'Quiz Question': string;
  'Option A': string;
  'Option B': string;
  'Option C': string;
  'Option D': string;
  Correct: string;
  'Feedback (Why)': string;
};

const FILE_PATH = path.resolve(process.cwd(), 'data/ProductGym_Decomposed.xlsx');
const LEVELS: Level[] = ['junior', 'mid', 'senior'];

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const normalizeLevel = (value: string): Level => {
  const normalized = value.trim().toLowerCase();
  if (!LEVELS.includes(normalized as Level)) {
    throw new Error(`Invalid level: ${value}`);
  }
  return normalized as Level;
};

const normalizeCorrectOption = (value: string): number => {
  const cleaned = value.trim().toUpperCase().replace('OPTION ', '');
  const byLetter: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };
  if (byLetter[cleaned]) {
    return byLetter[cleaned];
  }

  const numeric = Number(cleaned);
  if (numeric >= 1 && numeric <= 4) {
    return numeric;
  }

  throw new Error(`Invalid correct option value: ${value}`);
};

const upsertTrack = async (
  supabase: any,
  payload: { title: string; type: 'company' | 'skill' }
) => {
  const { data, error } = await supabase
    .from('tracks')
    .upsert(
      {
        title: payload.title,
        type: payload.type,
        is_published: true
      },
      { onConflict: 'type,title' }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
};

const upsertModule = async (
  supabase: any,
  payload: { trackId: string; title: string; sortOrder: number }
) => {
  const { data, error } = await supabase
    .from('modules')
    .upsert(
      {
        track_id: payload.trackId,
        title: payload.title,
        sort_order: payload.sortOrder
      },
      { onConflict: 'track_id,title' }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
};

const upsertQuiz = async (
  supabase: any,
  payload: { moduleId: string; title: string; difficulty: Level }
) => {
  const { data, error } = await supabase
    .from('quizzes')
    .upsert(
      {
        module_id: payload.moduleId,
        title: payload.title,
        difficulty: payload.difficulty,
        pass_score: 60,
        time_limit_sec: null
      },
      { onConflict: 'module_id,title,difficulty' }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
};

const upsertQuestion = async (
  supabase: any,
  payload: {
    quizId: string;
    sortOrder: number;
    prompt: string;
    explanation: string;
  }
) => {
  const { data, error } = await supabase
    .from('questions')
    .upsert(
      {
        quiz_id: payload.quizId,
        type: 'single_choice',
        prompt: payload.prompt,
        sort_order: payload.sortOrder,
        points: 1,
        explanation: payload.explanation || null
      },
      { onConflict: 'quiz_id,sort_order' }
    )
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
};

const upsertOptions = async (
  supabase: any,
  questionId: string,
  options: [string, string, string, string],
  correctSort: number
) => {
  const rows = options.map((label, index) => ({
    question_id: questionId,
    label,
    sort_order: index + 1,
    is_correct: index + 1 === correctSort
  }));

  const { error } = await supabase
    .from('options')
    .upsert(rows, { onConflict: 'question_id,sort_order' });

  if (error) throw error;
};

async function run() {
  const supabase = createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  );

  const workbook = XLSX.readFile(FILE_PATH);
  const sheetName = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    defval: ''
  }) as Row[];

  const categoryOrder = ['Discovery', 'Strategy', 'Execution', 'Metrics', 'Frameworks'];

  for (const row of rows) {
    if (!row.Company || !row.Category || !row['Original Question'] || !row['Quiz Question']) {
      continue;
    }

    const level = normalizeLevel(row.level);
    const step = Number(row.Step);
    if (!Number.isFinite(step)) {
      throw new Error(`Invalid step value for quiz ${row['Original Question']}: ${row.Step}`);
    }

    const correctSort = normalizeCorrectOption(row.Correct);

    const companyTrackId = await upsertTrack(supabase, {
      type: 'company',
      title: row.Company.trim()
    });

    const skillTrackId = await upsertTrack(supabase, {
      type: 'skill',
      title: row.Category.trim()
    });

    const moduleSort = Math.max(0, categoryOrder.indexOf(row.Category.trim()));

    const companyModuleId = await upsertModule(supabase, {
      trackId: companyTrackId,
      title: row.Category.trim(),
      sortOrder: moduleSort
    });

    const skillModuleId = await upsertModule(supabase, {
      trackId: skillTrackId,
      title: row.Category.trim(),
      sortOrder: 0
    });

    const quizTitle = row['Original Question'].trim();

    const companyQuizId = await upsertQuiz(supabase, {
      moduleId: companyModuleId,
      title: quizTitle,
      difficulty: level
    });

    const skillQuizId = await upsertQuiz(supabase, {
      moduleId: skillModuleId,
      title: quizTitle,
      difficulty: level
    });

    const optionLabels: [string, string, string, string] = [
      row['Option A'],
      row['Option B'],
      row['Option C'],
      row['Option D']
    ];

    for (const quizId of [companyQuizId, skillQuizId]) {
      const questionId = await upsertQuestion(supabase, {
        quizId,
        sortOrder: step,
        prompt: row['Quiz Question'].trim(),
        explanation: row['Feedback (Why)']?.trim()
      });

      await upsertOptions(supabase, questionId, optionLabels, correctSort);
    }
  }

  console.log(`Seeded ${rows.length} rows from ${FILE_PATH}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
