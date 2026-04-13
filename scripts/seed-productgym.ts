import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

type Level = 'junior' | 'mid' | 'senior';

type ParsedRow = {
  company: string;
  category: string;
  title: string;
  originalQuestion: string;
  level: Level;
  stepLabel: string;
  sortOrder: number;
  quizQuestion: string;
  optionLabels: [string, string, string, string];
  correctOption: 'A' | 'B' | 'C' | 'D';
  feedback: string;
};

const CATEGORY_ORDER = ['Discovery', 'Strategy', 'Execution', 'Metrics', 'Frameworks'];

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
};

const normalizeHeader = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const normalizeLevel = (value: unknown): Level => {
  const level = String(value ?? '').trim().toLowerCase();
  if (level === 'junior') return 'junior';
  if (level === 'mid' || level === 'mid-level' || level === 'mid level') return 'mid';
  if (level === 'senior') return 'senior';
  throw new Error(`Invalid level: ${String(value)}`);
};

const parseStepSortOrder = (stepLabel: string, fallback: number) => {
  const match = stepLabel.match(/^(\d+)/);
  if (match) return Number(match[1]);
  return fallback;
};

const normalizeCorrectOption = (value: unknown): 'A' | 'B' | 'C' | 'D' => {
  const normalized = String(value ?? '').trim().toUpperCase().replace('OPTION ', '');
  if (['A', 'B', 'C', 'D'].includes(normalized)) return normalized as 'A' | 'B' | 'C' | 'D';
  const numeric = Number(normalized);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 4) return String.fromCharCode(64 + numeric) as 'A' | 'B' | 'C' | 'D';
  throw new Error(`Invalid Correct Option value: ${String(value)}`);
};

const resolveExcelPath = () => {
  const preferred = path.resolve(process.cwd(), 'scripts/data/codex version _ v2_ProductGym_Decomposed_v2.xlsx');
  const fallback = path.resolve(process.cwd(), 'data/ProductGym_Decomposed.xlsx');
  if (fs.existsSync(preferred)) return preferred;
  if (fs.existsSync(fallback)) return fallback;
  throw new Error(`Excel file not found at ${preferred} or ${fallback}`);
};

const readRows = (excelPath: string) => {
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets['Decomposed Quiz v2'] ?? workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('Workbook has no readable sheets.');

  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, unknown>[];

  const parsedRows = rawRows
    .map((row, rowIndex) => {
      const mapped = new Map<string, unknown>();
      for (const [key, value] of Object.entries(row)) mapped.set(normalizeHeader(key), value);

      const company = String(mapped.get('company') ?? '').trim();
      const category = String(mapped.get('category') ?? '').trim();
      const title = String(mapped.get('title') ?? '').trim();
      const originalQuestion = String(mapped.get('original question') ?? '').trim();
      const quizQuestion = String(mapped.get('quiz question') ?? '').trim();
      const stepLabel = String(mapped.get('step') ?? '').trim();

      if (!company || !category || !originalQuestion || !quizQuestion || !stepLabel) return null;

      return {
        company,
        category,
        title,
        originalQuestion,
        level: normalizeLevel(mapped.get('level')),
        stepLabel,
        sortOrder: parseStepSortOrder(stepLabel, rowIndex + 1),
        quizQuestion,
        optionLabels: [
          String(mapped.get('option a') ?? '').trim(),
          String(mapped.get('option b') ?? '').trim(),
          String(mapped.get('option c') ?? '').trim(),
          String(mapped.get('option d') ?? '').trim()
        ] as [string, string, string, string],
        correctOption: normalizeCorrectOption(mapped.get('correct option') ?? mapped.get('correct')),
        feedback: String(mapped.get('feedback why') ?? '').trim()
      } satisfies ParsedRow;
    })
    .filter((row): row is ParsedRow => Boolean(row));

  if (!parsedRows.length) throw new Error(`No rows parsed from ${excelPath}`);
  return parsedRows;
};

async function run() {
  const excelPath = resolveExcelPath();
  const allRows = readRows(excelPath);

  const companies: string[] = [];
  for (const row of allRows) {
    if (!companies.includes(row.company)) companies.push(row.company);
  }
  const selectedCompanies = companies.slice(0, 7);
  const rows = allRows.filter((row) => selectedCompanies.includes(row.company));

  const supabase = createClient(
    process.env.SUPABASE_URL ?? requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')
  ) as any;

  const { data: existingCompanyTracks, error: tracksReadError } = await supabase
    .from('tracks')
    .select('id,title,is_published')
    .eq('type', 'company');
  if (tracksReadError) throw tracksReadError;

  const targetTrackIds = new Set<string>();
  const trackIdByCompany = new Map<string, string>();

  for (const company of selectedCompanies) {
    const categories = Array.from(new Set(rows.filter((row) => row.company === company).map((row) => row.category))).sort((a, b) => a.localeCompare(b));
    const description = categories.length ? `Focus: ${categories.join(' • ')}` : 'Focus: Product Sense';

    const existing = (existingCompanyTracks ?? []).find((track: any) => track.title === company);

    if (existing) {
      const { error } = await supabase.from('tracks').update({ is_published: true, description }).eq('id', existing.id);
      if (error) throw error;
      trackIdByCompany.set(company, existing.id);
      targetTrackIds.add(existing.id);
    } else {
      const { data, error } = await supabase
        .from('tracks')
        .insert({ type: 'company', title: company, description, is_published: true })
        .select('id')
        .single();
      if (error) throw error;
      trackIdByCompany.set(company, data.id);
      targetTrackIds.add(data.id);
    }
  }

  for (const track of existingCompanyTracks ?? []) {
    if (!targetTrackIds.has(track.id) && track.is_published) {
      const { error } = await supabase.from('tracks').update({ is_published: false }).eq('id', track.id);
      if (error) throw error;
    }
  }

  for (const company of selectedCompanies) {
    const trackId = trackIdByCompany.get(company)!;
    const companyRows = rows.filter((row) => row.company === company);
    const categories = Array.from(new Set(companyRows.map((row) => row.category))).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    const moduleIdByCategory = new Map<string, string>();

    for (let index = 0; index < categories.length; index += 1) {
      const category = categories[index];
      const { data: existingModule } = await supabase
        .from('modules')
        .select('id')
        .eq('track_id', trackId)
        .eq('title', category)
        .maybeSingle();

      const sortOrder = index + 1;
      if (existingModule) {
        const { error } = await supabase.from('modules').update({ sort_order: sortOrder }).eq('id', existingModule.id);
        if (error) throw error;
        moduleIdByCategory.set(category, existingModule.id);
      } else {
        const { data, error } = await supabase
          .from('modules')
          .insert({ track_id: trackId, title: category, sort_order: sortOrder })
          .select('id')
          .single();
        if (error) throw error;
        moduleIdByCategory.set(category, data.id);
      }
    }

    const quizGroups = new Map<string, ParsedRow[]>();
    for (const row of companyRows) {
      const key = [row.company, row.category, row.title, row.originalQuestion, row.level].join('|');
      quizGroups.set(key, [...(quizGroups.get(key) ?? []), row]);
    }

    for (const quizRows of Array.from(quizGroups.values())) {
      const first = quizRows[0];
      const moduleId = moduleIdByCategory.get(first.category)!;

      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('module_id', moduleId)
        .eq('title', first.originalQuestion)
        .eq('difficulty', first.level)
        .maybeSingle();

      let quizId: string;
      if (existingQuiz) {
        quizId = existingQuiz.id;
        const { error } = await supabase
          .from('quizzes')
          .update({ pass_score: 60, difficulty: first.level, category: first.category })
          .eq('id', quizId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('quizzes')
          .insert({
            module_id: moduleId,
            title: first.originalQuestion,
            difficulty: first.level,
            category: first.category,
            pass_score: 60
          })
          .select('id')
          .single();
        if (error) throw error;
        quizId = data.id;
      }

      const orderedQuizRows = [...quizRows].sort((a, b) => a.sortOrder - b.sortOrder);
      for (let rowIndex = 0; rowIndex < orderedQuizRows.length; rowIndex += 1) {
        const quizRow = orderedQuizRows[rowIndex];
        const sortOrder = quizRow.sortOrder || rowIndex + 1;

        const { data: existingQuestion } = await supabase
          .from('questions')
          .select('id')
          .eq('quiz_id', quizId)
          .eq('sort_order', sortOrder)
          .maybeSingle();

        let questionId: string;
        if (existingQuestion) {
          questionId = existingQuestion.id;
          const { error } = await supabase
            .from('questions')
            .update({
              type: 'single_choice',
              prompt: quizRow.quizQuestion,
              points: 1,
              explanation: quizRow.feedback || null
            })
            .eq('id', questionId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('questions')
            .insert({
              quiz_id: quizId,
              type: 'single_choice',
              prompt: quizRow.quizQuestion,
              sort_order: sortOrder,
              points: 1,
              explanation: quizRow.feedback || null
            })
            .select('id')
            .single();
          if (error) throw error;
          questionId = data.id;
        }

        const correctSort = quizRow.correctOption.charCodeAt(0) - 64;
        for (let i = 0; i < 4; i += 1) {
          const sort_order = i + 1;
          const label = quizRow.optionLabels[i] ?? '';
          const { data: existingOption } = await supabase
            .from('options')
            .select('id')
            .eq('question_id', questionId)
            .eq('sort_order', sort_order)
            .maybeSingle();

          if (existingOption) {
            const { error } = await supabase
              .from('options')
              .update({ label, is_correct: sort_order === correctSort })
              .eq('id', existingOption.id);
            if (error) throw error;
          } else {
            const { error } = await supabase.from('options').insert({
              question_id: questionId,
              label,
              sort_order,
              is_correct: sort_order === correctSort
            });
            if (error) throw error;
          }
        }
      }
    }
  }

  console.log(`Seeded Product Gym companies from ${excelPath}`);
  console.log(`Published companies: ${selectedCompanies.join(', ')}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
