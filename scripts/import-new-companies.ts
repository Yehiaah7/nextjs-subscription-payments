import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

type Level = 'junior' | 'mid' | 'senior';

type CsvRow = {
  rowNumber: number;
  qNumber: string;
  level: Level;
  company: string;
  category: string;
  originalQuestion: string;
  step: number;
  quizQuestion: string;
  options: [string, string, string, string];
  correctLetter: 'A' | 'B' | 'C' | 'D';
  feedback: string;
};

type Summary = {
  tracksCreated: number;
  modulesCreated: number;
  quizzesCreated: number;
  questionsCreated: number;
  optionsCreated: number;
  skippedDuplicates: number;
  invalidRows: number;
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const parseArgs = () => {
  const dryRun = process.argv.includes('--dry-run');
  const apply = process.argv.includes('--apply');
  if (dryRun === apply) throw new Error('Use exactly one mode: --dry-run or --apply');
  return { dryRun, apply };
};

const parseLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === ',' && !quoted) {
      values.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values.map((v) => v.trim());
};

const normalizeLevel = (raw: string): Level | null => {
  const value = normalize(raw);
  if (value === 'junior') return 'junior';
  if (value === 'mid' || value === 'mid-level' || value === 'mid level') return 'mid';
  if (value === 'senior') return 'senior';
  return null;
};

const parseCsv = (csvPath: string) => {
  const content = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const header = parseLine(lines[0]);

  const indexOf = (name: string) => {
    const idx = header.findIndex((col) => normalize(col) === normalize(name));
    if (idx < 0) throw new Error(`Missing CSV column: ${name}`);
    return idx;
  };

  const rows: CsvRow[] = [];
  const invalid: string[] = [];
  const dedupeKeys = new Set<string>();

  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseLine(lines[i]);
    if (cols.every((c) => !c.trim())) continue;

    const level = normalizeLevel(cols[indexOf('level')] ?? '');
    const step = Number.parseInt((cols[indexOf('Step')] ?? '').trim(), 10);
    const correct = ((cols[indexOf('Correct')] ?? '').trim().toUpperCase()) as CsvRow['correctLetter'];

    const row = {
      rowNumber: i + 1,
      qNumber: (cols[indexOf('Q#')] ?? '').trim(),
      level,
      company: (cols[indexOf('Company')] ?? '').trim(),
      category: (cols[indexOf('Category')] ?? '').trim(),
      originalQuestion: (cols[indexOf('Original Question')] ?? '').trim(),
      step,
      quizQuestion: (cols[indexOf('Quiz Question')] ?? '').trim(),
      options: [
        (cols[indexOf('Option A')] ?? '').trim(),
        (cols[indexOf('Option B')] ?? '').trim(),
        (cols[indexOf('Option C')] ?? '').trim(),
        (cols[indexOf('Option D')] ?? '').trim()
      ] as [string, string, string, string],
      correctLetter: correct,
      feedback: (cols[indexOf('Feedback (Why)')] ?? '').trim()
    };

    const dedupeKey = `${normalize(row.company)}::${normalize(row.category)}::${normalize(row.originalQuestion)}::${normalize(
      row.qNumber
    )}::${row.step}`;

    if (!row.company || !row.category || !row.originalQuestion || !row.quizQuestion || !row.qNumber) {
      invalid.push(`Row ${row.rowNumber}: missing required fields`);
      continue;
    }
    if (!row.level) {
      invalid.push(`Row ${row.rowNumber}: invalid level`);
      continue;
    }
    if (!Number.isInteger(row.step) || row.step <= 0) {
      invalid.push(`Row ${row.rowNumber}: invalid Step`);
      continue;
    }
    if (row.options.some((o) => !o)) {
      invalid.push(`Row ${row.rowNumber}: every option must be non-empty`);
      continue;
    }
    if (new Set(row.options.map(normalize)).size !== 4) {
      invalid.push(`Row ${row.rowNumber}: duplicate options detected`);
      continue;
    }
    if (!['A', 'B', 'C', 'D'].includes(row.correctLetter)) {
      invalid.push(`Row ${row.rowNumber}: Correct must be A/B/C/D`);
      continue;
    }
    if (!row.feedback) {
      invalid.push(`Row ${row.rowNumber}: Feedback (Why) is required`);
      continue;
    }
    if (dedupeKeys.has(dedupeKey)) {
      invalid.push(`Row ${row.rowNumber}: duplicate key Company+Category+Original Question+Q#+Step`);
      continue;
    }

    dedupeKeys.add(dedupeKey);
    rows.push(row as CsvRow);
  }

  return { rows, invalid };
};

async function run() {
  const { dryRun } = parseArgs();
  const csvPath = path.resolve(process.cwd(), 'data/new_companies_quiz_questions.csv');
  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);

  const { rows, invalid } = parseCsv(csvPath);
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY')) as any;

  const summary: Summary = {
    tracksCreated: 0,
    modulesCreated: 0,
    quizzesCreated: 0,
    questionsCreated: 0,
    optionsCreated: 0,
    skippedDuplicates: 0,
    invalidRows: invalid.length
  };

  const trackCache = new Map<string, string>();
  const moduleCache = new Map<string, string>();
  const quizCache = new Map<string, string>();

  for (const row of rows) {
    let trackId = trackCache.get(normalize(row.company));
    if (!trackId) {
      const { data: existingTrack, error: trackReadErr } = await supabase
        .from('tracks')
        .select('id')
        .eq('type', 'company')
        .eq('title', row.company)
        .maybeSingle();
      if (trackReadErr) throw trackReadErr;

      if (existingTrack) {
        trackId = existingTrack.id;
      } else if (!dryRun) {
        const { data, error } = await supabase
          .from('tracks')
          .insert({ title: row.company, type: 'company', is_published: true })
          .select('id')
          .single();
        if (error) throw error;
        trackId = data.id;
        summary.tracksCreated += 1;
      } else {
        trackId = `dry-track-${normalize(row.company)}`;
        summary.tracksCreated += 1;
      }
      if (!trackId) {
        throw new Error(`Failed to resolve track id for company: ${row.company}`);
      }
      trackCache.set(normalize(row.company), trackId);
    }

    if (!trackId) {
      throw new Error(`Failed to resolve track id for company: ${row.company}`);
    }

    const moduleKey = `${trackId}::${normalize(row.category)}`;
    let moduleId = moduleCache.get(moduleKey);
    if (!moduleId) {
      const { data: existingModule, error: moduleReadErr } = await supabase
        .from('modules')
        .select('id')
        .eq('track_id', trackId)
        .eq('title', row.category)
        .maybeSingle();
      if (moduleReadErr) throw moduleReadErr;

      if (existingModule) {
        moduleId = existingModule.id;
      } else if (!dryRun) {
        const { data, error } = await supabase
          .from('modules')
          .insert({ track_id: trackId, title: row.category, sort_order: 0 })
          .select('id')
          .single();
        if (error) throw error;
        moduleId = data.id;
        summary.modulesCreated += 1;
      } else {
        moduleId = `dry-module-${moduleKey}`;
        summary.modulesCreated += 1;
      }
      if (!moduleId) {
        throw new Error(`Failed to resolve module id for category: ${row.category}`);
      }
      moduleCache.set(moduleKey, moduleId);
    }

    if (!moduleId) {
      throw new Error(`Failed to resolve module id for category: ${row.category}`);
    }

    const quizKey = `${moduleId}::${normalize(row.originalQuestion)}::${row.level}`;
    let quizId = quizCache.get(quizKey);
    if (!quizId) {
      const { data: existingQuiz, error: quizReadErr } = await supabase
        .from('quizzes')
        .select('id')
        .eq('module_id', moduleId)
        .eq('title', row.originalQuestion)
        .eq('difficulty', row.level)
        .maybeSingle();
      if (quizReadErr) throw quizReadErr;

      if (existingQuiz) {
        quizId = existingQuiz.id;
      } else if (!dryRun) {
        const { data, error } = await supabase
          .from('quizzes')
          .insert({ module_id: moduleId, title: row.originalQuestion, difficulty: row.level, time_limit_sec: 180, pass_score: 60 })
          .select('id')
          .single();
        if (error) throw error;
        quizId = data.id;
        summary.quizzesCreated += 1;
      } else {
        quizId = `dry-quiz-${quizKey}`;
        summary.quizzesCreated += 1;
      }
      if (!quizId) {
        throw new Error(`Failed to resolve quiz id for question: ${row.originalQuestion}`);
      }
      quizCache.set(quizKey, quizId);
    }

    if (!quizId) {
      throw new Error(`Failed to resolve quiz id for question: ${row.originalQuestion}`);
    }

    const { data: existingQuestion, error: questionReadErr } = await supabase
      .from('questions')
      .select('id,prompt,feedback')
      .eq('quiz_id', quizId)
      .eq('sort_order', row.step)
      .maybeSingle();
    if (questionReadErr) throw questionReadErr;

    if (existingQuestion) {
      summary.skippedDuplicates += 1;
      continue;
    }

    let questionId = '';
    if (!dryRun) {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          quiz_id: quizId,
          type: 'single_choice',
          prompt: row.quizQuestion,
          sort_order: row.step,
          points: 1,
          feedback: row.feedback
        })
        .select('id')
        .single();
      if (error) throw error;
      questionId = data.id;
    } else {
      questionId = `dry-question-${quizId}-${row.step}`;
    }
    summary.questionsCreated += 1;

    const correctIndex = row.correctLetter.charCodeAt(0) - 65;
    for (let i = 0; i < 4; i += 1) {
      const optionPayload = {
        question_id: questionId,
        sort_order: i + 1,
        label: row.options[i],
        is_correct: i === correctIndex
      };

      if (!dryRun) {
        const { error } = await supabase.from('options').insert(optionPayload);
        if (error) throw error;
      }
      summary.optionsCreated += 1;
    }
  }

  console.log(`Mode: ${dryRun ? 'dry-run' : 'apply'}`);
  console.log(`Source: ${csvPath}`);
  console.table(summary);
  if (invalid.length) {
    console.log('Invalid rows:');
    console.log(invalid.join('\n'));
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
