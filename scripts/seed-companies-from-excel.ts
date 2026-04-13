import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

type Level = 'junior' | 'mid' | 'senior';

type ParsedRow = {
  company: string;
  level: Level;
  challengeTitle: string;
  stepOrder: number;
  prompt: string;
  options: Array<{ label: string; feedback: string; isCorrect: boolean }>;
  timeLimitSec: number | null;
  passScore: number;
};

const LEVEL_TITLES: Record<Level, { title: string; sortOrder: number }> = {
  junior: { title: 'Junior', sortOrder: 1 },
  mid: { title: 'Mid', sortOrder: 2 },
  senior: { title: 'Senior', sortOrder: 3 }
};

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '')
    .trim();

const normalizeLevel = (value: unknown): Level => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === 'junior') return 'junior';
  if (raw === 'mid' || raw === 'mid-level' || raw === 'mid level') return 'mid';
  if (raw === 'senior') return 'senior';
  throw new Error(`Invalid level value: ${String(value)}`);
};

const normalizeCorrectIndex = (value: unknown): number => {
  const raw = String(value ?? '').trim().toUpperCase().replace('OPTION ', '');
  if (/^[ABCD]$/.test(raw)) return raw.charCodeAt(0) - 64;
  const numeric = Number(raw);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 4) return numeric;
  throw new Error(`Invalid correct option value: ${String(value)}`);
};

const parseOptionalInt = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.trunc(numeric) : null;
};

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const resolveExcelPath = () => {
  const fromArg = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : null;
  const candidates = [
    fromArg,
    path.resolve(process.cwd(), 'codex version _ v2_ProductGym_Decomposed_v2.xlsx'),
    path.resolve(process.cwd(), 'data/codex version _ v2_ProductGym_Decomposed_v2.xlsx'),
    path.resolve(process.cwd(), 'ProductGym_Decomposed.xlsx'),
    path.resolve(process.cwd(), 'data/ProductGym_Decomposed.xlsx')
  ].filter(Boolean) as string[];

  const found = candidates.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`Excel file not found. Checked: ${candidates.join(', ')}`);
  }

  return found;
};

const readRows = (excelPath: string): ParsedRow[] => {
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];

  return rawRows
    .map((row: Record<string, unknown>) => {
      const normalized = new Map<string, unknown>();
      for (const [key, value] of Object.entries(row)) {
        normalized.set(normalizeHeader(key), value);
      }

      const company = String(normalized.get('company') ?? '').trim();
      const challengeTitle = String(
        normalized.get('original question') ?? normalized.get('challenge') ?? ''
      ).trim();
      const prompt = String(
        normalized.get('quiz question') ?? normalized.get('step question') ?? normalized.get('question') ?? ''
      ).trim();
      const stepOrder = Number(normalized.get('step') ?? 0);
      if (!company || !challengeTitle || !prompt || !Number.isFinite(stepOrder)) return null;

      const correctIndex = normalizeCorrectIndex(normalized.get('correct'));
      const optionLabels = [
        String(normalized.get('option a') ?? '').trim(),
        String(normalized.get('option b') ?? '').trim(),
        String(normalized.get('option c') ?? '').trim(),
        String(normalized.get('option d') ?? '').trim()
      ];
      const rowFeedback = String(
        normalized.get('feedback why') ?? normalized.get('feedback') ?? ''
      ).trim();

      const optionFeedback = [
        String(normalized.get('feedback a') ?? '').trim(),
        String(normalized.get('feedback b') ?? '').trim(),
        String(normalized.get('feedback c') ?? '').trim(),
        String(normalized.get('feedback d') ?? '').trim()
      ];

      return {
        company,
        level: normalizeLevel(normalized.get('level')),
        challengeTitle,
        stepOrder,
        prompt,
        options: optionLabels.map((label, index) => ({
          label,
          feedback: optionFeedback[index] || rowFeedback,
          isCorrect: index + 1 === correctIndex
        })),
        timeLimitSec: parseOptionalInt(normalized.get('time limit sec') ?? normalized.get('time limit')),
        passScore: parseOptionalInt(normalized.get('pass score')) ?? 60
      } satisfies ParsedRow;
    })
    .filter((row: ParsedRow | null): row is ParsedRow => Boolean(row));
};

async function run() {
  const excelPath = resolveExcelPath();
  const rows = readRows(excelPath);

  const supabase = createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  );

  const tracksByCompany = new Map<string, string>();
  const modulesByTrackLevel = new Map<string, string>();
  const quizzesByModuleTitle = new Map<string, string>();

  const grouped = new Map<string, ParsedRow[]>();
  for (const row of rows) {
    const key = `${row.company.toLowerCase()}|${row.level}|${row.challengeTitle.toLowerCase()}`;
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  for (const [, challengeRows] of Array.from(grouped.entries())) {
    const first = challengeRows[0];
    const trackKey = first.company.toLowerCase();

    let trackId = tracksByCompany.get(trackKey) ?? null;
    if (!trackId) {
      const { data: existingTrack, error: trackReadError } = await supabase
        .from('tracks')
        .select('id')
        .eq('type', 'company')
        .ilike('title', first.company)
        .maybeSingle();
      if (trackReadError) throw trackReadError;

      if (existingTrack) {
        trackId = existingTrack.id;
      } else {
        const { data: createdTrack, error: trackWriteError } = await supabase
          .from('tracks')
          .insert({
            type: 'company',
            title: first.company,
            is_published: true
          })
          .select('id')
          .single();
        if (trackWriteError) throw trackWriteError;
        trackId = createdTrack.id;
      }

      tracksByCompany.set(trackKey, trackId!);
    }

    const moduleKey = `${trackId}|${first.level}`;
    let moduleId = modulesByTrackLevel.get(moduleKey) ?? null;
    if (!moduleId) {
      const levelDef = LEVEL_TITLES[first.level as Level];
      const moduleTitle = levelDef.title;
      const { data: existingModule, error: moduleReadError } = await supabase
        .from('modules')
        .select('id')
        .eq('track_id', trackId)
        .ilike('title', moduleTitle)
        .maybeSingle();
      if (moduleReadError) throw moduleReadError;

      if (existingModule) {
        moduleId = existingModule.id;
      } else {
        const { data: createdModule, error: moduleWriteError } = await supabase
          .from('modules')
          .insert({
            track_id: trackId,
            title: moduleTitle,
            sort_order: levelDef.sortOrder
          })
          .select('id')
          .single();
        if (moduleWriteError) throw moduleWriteError;
        moduleId = createdModule.id;
      }
      modulesByTrackLevel.set(moduleKey, moduleId!);
    }

    const quizKey = `${moduleId}|${first.challengeTitle.toLowerCase()}`;
    let quizId = quizzesByModuleTitle.get(quizKey) ?? null;
    if (!quizId) {
      const { data: existingQuiz, error: quizReadError } = await supabase
        .from('quizzes')
        .select('id')
        .eq('module_id', moduleId)
        .ilike('title', first.challengeTitle)
        .maybeSingle();
      if (quizReadError) throw quizReadError;

      const quizPayload = {
        module_id: moduleId,
        title: first.challengeTitle,
        difficulty: first.level,
        time_limit_sec: first.timeLimitSec,
        pass_score: first.passScore
      };

      if (existingQuiz) {
        quizId = existingQuiz.id;
        const { error: quizUpdateError } = await supabase
          .from('quizzes')
          .update(quizPayload)
          .eq('id', quizId);
        if (quizUpdateError) throw quizUpdateError;
      } else {
        const { data: createdQuiz, error: quizWriteError } = await supabase
          .from('quizzes')
          .insert(quizPayload)
          .select('id')
          .single();
        if (quizWriteError) throw quizWriteError;
        quizId = createdQuiz.id;
      }

      quizzesByModuleTitle.set(quizKey, quizId!);
    }

    const sortedRows = [...challengeRows].sort((a, b) => a.stepOrder - b.stepOrder);
    const stepPoints = Math.max(1, Math.round(100 / Math.max(sortedRows.length, 1)));

    for (const row of sortedRows) {
      const { data: existingQuestion, error: questionReadError } = await supabase
        .from('questions')
        .select('id')
        .eq('quiz_id', quizId)
        .eq('sort_order', row.stepOrder)
        .maybeSingle();
      if (questionReadError) throw questionReadError;

      const questionPayload = {
        quiz_id: quizId,
        sort_order: row.stepOrder,
        type: 'single_choice',
        prompt: row.prompt,
        points: stepPoints
      };

      const questionId = existingQuestion
        ? existingQuestion.id
        : (
            await supabase
              .from('questions')
              .insert(questionPayload)
              .select('id')
              .single()
          ).data?.id;

      if (!questionId) {
        const { error: fallbackError } = await supabase
          .from('questions')
          .update(questionPayload)
          .eq('quiz_id', quizId)
          .eq('sort_order', row.stepOrder);
        if (fallbackError) throw fallbackError;
        const { data: fallbackQuestion, error: fallbackReadError } = await supabase
          .from('questions')
          .select('id')
          .eq('quiz_id', quizId)
          .eq('sort_order', row.stepOrder)
          .single();
        if (fallbackReadError) throw fallbackReadError;

        for (let index = 0; index < row.options.length; index += 1) {
          const option = row.options[index];
          const { error: optionError } = await supabase.from('options').upsert(
            {
              question_id: fallbackQuestion.id,
              sort_order: index + 1,
              label: option.label,
              feedback: option.feedback,
              is_correct: option.isCorrect
            },
            { onConflict: 'question_id,sort_order' }
          );
          if (optionError) throw optionError;
        }
        continue;
      }

      if (existingQuestion) {
        const { error: questionUpdateError } = await supabase
          .from('questions')
          .update(questionPayload)
          .eq('id', questionId);
        if (questionUpdateError) throw questionUpdateError;
      }

      for (let index = 0; index < row.options.length; index += 1) {
        const option = row.options[index];
        const { error: optionError } = await supabase.from('options').upsert(
          {
            question_id: questionId,
            sort_order: index + 1,
            label: option.label,
            feedback: option.feedback,
            is_correct: option.isCorrect
          },
          { onConflict: 'question_id,sort_order' }
        );
        if (optionError) throw optionError;
      }
    }
  }

  console.log(`Seeded ${grouped.size} company challenges from ${excelPath}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
