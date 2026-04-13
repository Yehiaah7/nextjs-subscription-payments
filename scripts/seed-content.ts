import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

type Level = 'junior' | 'mid' | 'senior';

type ParsedRow = {
  company: string;
  category: string;
  level: Level;
  originalQuestion: string;
  step: number;
  quizQuestion: string;
  options: [string, string, string, string];
  correctSortOrder: number;
  feedback: string;
};

type SeedSummary = {
  tracksInserted: number;
  tracksUpdated: number;
  tracksUnpublished: number;
  modulesInserted: number;
  modulesUpdated: number;
  quizzesInserted: number;
  quizzesUpdated: number;
  questionsInserted: number;
  questionsUpdated: number;
  optionsInserted: number;
  optionsUpdated: number;
};

const LEVEL_LABELS: Record<Level, { title: string; sortOrder: number; difficulty: string }> = {
  junior: { title: 'Junior', sortOrder: 1, difficulty: 'junior' },
  mid: { title: 'Mid-level', sortOrder: 2, difficulty: 'mid' },
  senior: { title: 'Senior', sortOrder: 3, difficulty: 'senior' }
};

const TARGET_COMPANIES = ['Amazon', 'Duolingo', 'Netflix', 'Stripe', 'Airbnb', 'Google', 'OpenAI'];

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();

const normalizeLevel = (value: unknown): Level => {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'junior') return 'junior';
  if (normalized === 'mid' || normalized === 'mid-level' || normalized === 'mid level') return 'mid';
  if (normalized === 'senior') return 'senior';
  throw new Error(`Unsupported level: ${String(value)}`);
};

const normalizeCorrectSort = (value: unknown) => {
  const normalized = String(value ?? '').trim().toUpperCase().replace('OPTION ', '');
  if (/^[ABCD]$/.test(normalized)) return normalized.charCodeAt(0) - 64;

  const numeric = Number(normalized);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 4) return numeric;

  throw new Error(`Unsupported correct option: ${String(value)}`);
};

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const resolveExcelPath = () => {
  const cliPath = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : null;
  const candidates = [
    cliPath,
    path.resolve(process.cwd(), 'content/ProductGym_Decomposed_v2.xlsx'),
    path.resolve(process.cwd(), 'content/ProductGym_Decomposed.xlsx'),
    path.resolve(process.cwd(), 'data/ProductGym_Decomposed_v2.xlsx'),
    path.resolve(process.cwd(), 'data/ProductGym_Decomposed.xlsx')
  ].filter(Boolean) as string[];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) throw new Error(`Excel not found. Checked: ${candidates.join(', ')}`);
  return found;
};

const readRows = (excelPath: string): ParsedRow[] => {
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];

  return rows
    .map((row) => {
      const normalized = new Map<string, unknown>();
      for (const [key, value] of Object.entries(row)) {
        normalized.set(normalizeHeader(key), value);
      }

      const company = String(normalized.get('company') ?? '').trim();
      const originalQuestion = String(normalized.get('original question') ?? '').trim();
      const quizQuestion = String(normalized.get('quiz question') ?? '').trim();
      const category = String(normalized.get('category') ?? '').trim();
      const step = Number(normalized.get('step') ?? NaN);

      if (!company || !originalQuestion || !quizQuestion || !category || !Number.isFinite(step)) {
        return null;
      }

      return {
        company,
        category,
        level: normalizeLevel(normalized.get('level')),
        originalQuestion,
        step,
        quizQuestion,
        options: [
          String(normalized.get('option a') ?? '').trim(),
          String(normalized.get('option b') ?? '').trim(),
          String(normalized.get('option c') ?? '').trim(),
          String(normalized.get('option d') ?? '').trim()
        ],
        correctSortOrder: normalizeCorrectSort(normalized.get('correct')),
        feedback: String(normalized.get('feedback why') ?? '').trim()
      } satisfies ParsedRow;
    })
    .filter((row): row is ParsedRow => Boolean(row));
};

async function run() {
  const excelPath = resolveExcelPath();
  const parsedRows = readRows(excelPath).filter((row) => TARGET_COMPANIES.includes(row.company));

  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY')) as any;

  const summary: SeedSummary = {
    tracksInserted: 0,
    tracksUpdated: 0,
    tracksUnpublished: 0,
    modulesInserted: 0,
    modulesUpdated: 0,
    quizzesInserted: 0,
    quizzesUpdated: 0,
    questionsInserted: 0,
    questionsUpdated: 0,
    optionsInserted: 0,
    optionsUpdated: 0
  };

  const categoriesByCompany = new Map<string, Set<string>>();
  for (const row of parsedRows) {
    categoriesByCompany.set(row.company, categoriesByCompany.get(row.company) ?? new Set<string>());
    categoriesByCompany.get(row.company)!.add(row.category);
  }

  const { data: existingCompanyTracks, error: companyTrackReadError } = await supabase
    .from('tracks')
    .select('id,title,is_published')
    .eq('type', 'company');
  if (companyTrackReadError) throw companyTrackReadError;

  const publishedTargetIds = new Set<string>();

  for (const company of TARGET_COMPANIES) {
    const categories = Array.from(categoriesByCompany.get(company) ?? []);
    const description = categories.length
      ? `Focus: ${categories.sort((a, b) => a.localeCompare(b)).join(' • ')}`
      : 'Focus: Product Sense';

    const existingTrack = (existingCompanyTracks ?? []).find((track: any) => track.title === company);
    let trackId: string;

    if (existingTrack) {
      trackId = existingTrack.id;
      const { error } = await supabase
        .from('tracks')
        .update({ description, is_published: true })
        .eq('id', trackId);
      if (error) throw error;
      summary.tracksUpdated += 1;
    } else {
      const { data, error } = await supabase
        .from('tracks')
        .insert({ title: company, type: 'company', description, is_published: true })
        .select('id')
        .single();
      if (error) throw error;
      trackId = data.id;
      summary.tracksInserted += 1;
    }

    publishedTargetIds.add(trackId);

    for (const level of ['junior', 'mid', 'senior'] as Level[]) {
      const levelDef = LEVEL_LABELS[level];

      const { data: existingModule } = await supabase
        .from('modules')
        .select('id,title')
        .eq('track_id', trackId)
        .eq('title', levelDef.title)
        .maybeSingle();

      let moduleId: string;
      if (existingModule) {
        moduleId = existingModule.id;
        const { error } = await supabase
          .from('modules')
          .update({ sort_order: levelDef.sortOrder })
          .eq('id', moduleId);
        if (error) throw error;
        summary.modulesUpdated += 1;
      } else {
        const { data, error } = await supabase
          .from('modules')
          .insert({ track_id: trackId, title: levelDef.title, sort_order: levelDef.sortOrder })
          .select('id')
          .single();
        if (error) throw error;
        moduleId = data.id;
        summary.modulesInserted += 1;
      }

      const challengeRows = parsedRows.filter((row) => row.company === company && row.level === level);
      const quizGroups = new Map<string, ParsedRow[]>();

      for (const row of challengeRows) {
        const key = row.originalQuestion;
        quizGroups.set(key, [...(quizGroups.get(key) ?? []), row]);
      }

      for (const [quizTitle, quizRows] of Array.from(quizGroups.entries())) {
        const { data: existingQuiz } = await supabase
          .from('quizzes')
          .select('id')
          .eq('module_id', moduleId)
          .eq('title', quizTitle)
          .maybeSingle();

        let quizId: string;
        if (existingQuiz) {
          quizId = existingQuiz.id;
          const { error } = await supabase
            .from('quizzes')
            .update({ difficulty: levelDef.difficulty, time_limit_sec: 180, pass_score: 60 })
            .eq('id', quizId);
          if (error) throw error;
          summary.quizzesUpdated += 1;
        } else {
          const { data, error } = await supabase
            .from('quizzes')
            .insert({
              module_id: moduleId,
              title: quizTitle,
              difficulty: levelDef.difficulty,
              time_limit_sec: 180,
              pass_score: 60
            })
            .select('id')
            .single();
          if (error) throw error;
          quizId = data.id;
          summary.quizzesInserted += 1;
        }

        for (const row of quizRows.sort((a, b) => a.step - b.step)) {
          const { data: existingQuestion } = await supabase
            .from('questions')
            .select('id')
            .eq('quiz_id', quizId)
            .eq('sort_order', row.step)
            .maybeSingle();

          let questionId: string;
          if (existingQuestion) {
            questionId = existingQuestion.id;
            const { error } = await supabase
              .from('questions')
              .update({
                type: 'single_choice',
                prompt: row.quizQuestion,
                points: 1,
                feedback: row.feedback || null
              })
              .eq('id', questionId);
            if (error) throw error;
            summary.questionsUpdated += 1;
          } else {
            const { data, error } = await supabase
              .from('questions')
              .insert({
                quiz_id: quizId,
                type: 'single_choice',
                prompt: row.quizQuestion,
                sort_order: row.step,
                points: 1,
                feedback: row.feedback || null
              })
              .select('id')
              .single();
            if (error) throw error;
            questionId = data.id;
            summary.questionsInserted += 1;
          }

          for (let i = 0; i < 4; i += 1) {
            const sortOrder = i + 1;
            const label = row.options[i] ?? '';
            const isCorrect = sortOrder === row.correctSortOrder;

            const { data: existingOption } = await supabase
              .from('options')
              .select('id')
              .eq('question_id', questionId)
              .eq('sort_order', sortOrder)
              .maybeSingle();

            if (existingOption) {
              const { error } = await supabase
                .from('options')
                .update({ label, is_correct: isCorrect })
                .eq('id', existingOption.id);
              if (error) throw error;
              summary.optionsUpdated += 1;
            } else {
              const { error } = await supabase.from('options').insert({
                question_id: questionId,
                label,
                sort_order: sortOrder,
                is_correct: isCorrect
              });
              if (error) throw error;
              summary.optionsInserted += 1;
            }
          }
        }
      }
    }
  }

  for (const track of existingCompanyTracks ?? []) {
    if (!publishedTargetIds.has(track.id) && track.is_published) {
      const { error } = await supabase.from('tracks').update({ is_published: false }).eq('id', track.id);
      if (error) throw error;
      summary.tracksUnpublished += 1;
    }
  }

  console.log(`Seed source: ${excelPath}`);
  console.log('Seed completed with summary:');
  console.table(summary);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
