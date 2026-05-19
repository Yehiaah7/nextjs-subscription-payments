import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

type CsvRow = {
  rowNumber: number;
  qNumber: string;
  company: string;
  category: string;
  originalQuestion: string;
  step: string;
  quizQuestion: string;
  options: [string, string, string, string];
  correctLetter: 'A' | 'B' | 'C' | 'D';
  feedback: string;
};

type QuestionRecord = {
  id: string;
  quiz_id: string;
  prompt: string;
  sort_order: number;
  feedback: string | null;
  options: Array<{ id: string; sort_order: number; label: string; is_correct: boolean; feedback: string | null }>;
};

type QuizRecord = {
  id: string;
  title: string;
  modules?: { title: string; tracks?: { title: string } };
};

type PlannedUpdate = {
  row: CsvRow;
  question: QuestionRecord;
  sortedOptions: QuestionRecord['options'];
  correctIndex: number;
};

const STEP_ORDER = ['clarify', 'users', 'pain points', 'solutions', 'prioritize', 'metrics'] as const;

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
const parseSortFromStep = (step: string) => {
  const n = Number.parseInt(step, 10);
  if (Number.isInteger(n) && n > 0) return n;
  const idx = STEP_ORDER.findIndex((v) => normalize(v) === normalize(step));
  return idx >= 0 ? idx + 1 : null;
};

const parseArgs = () => {
  const dryRun = process.argv.includes('--dry-run');
  const apply = process.argv.includes('--apply');
  if (dryRun === apply) throw new Error('Use exactly one mode: --dry-run or --apply');
  return { dryRun, apply };
};

const parseCsv = (csvPath: string): { rows: CsvRow[]; invalidRows: string[] } => {
  const content = fs.readFileSync(csvPath, 'utf8').replace(/^\uFEFF/, '');
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  const parseLine = (line: string) => {
    const values: string[] = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          quoted = !quoted;
        }
      } else if (ch === ',' && !quoted) {
        values.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    values.push(cur);
    return values.map((v) => v.trim());
  };

  const header = parseLine(lines[0]);
  const idx = (name: string) => {
    const i = header.findIndex((h) => normalize(h) === normalize(name));
    if (i < 0) throw new Error(`Missing CSV column: ${name}`);
    return i;
  };

  const out: CsvRow[] = [];
  const invalidRows: string[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseLine(lines[i]);
    if (cols.every((c) => c === '')) continue;

    const row: CsvRow = {
      rowNumber: i + 1,
      qNumber: cols[idx('Q#')] ?? '',
      company: cols[idx('Company')] ?? '',
      category: cols[idx('Category')] ?? '',
      originalQuestion: cols[idx('Original Question')] ?? '',
      step: cols[idx('Step')] ?? '',
      quizQuestion: cols[idx('Quiz Question')] ?? '',
      options: [cols[idx('Option A')] ?? '', cols[idx('Option B')] ?? '', cols[idx('Option C')] ?? '', cols[idx('Option D')] ?? ''],
      correctLetter: (cols[idx('Correct')] ?? '').trim().toUpperCase() as CsvRow['correctLetter'],
      feedback: cols[idx('Feedback (Why)')] ?? ''
    };

    const opts = row.options.map((o) => o.trim());
    const dedupeKey = `${row.qNumber}::${normalize(row.step)}`;

    if (!row.qNumber || !row.step || !row.quizQuestion) { invalidRows.push(`Row ${row.rowNumber}: missing required key fields`); continue; }
    if (opts.some((o) => !o)) { invalidRows.push(`Row ${row.rowNumber}: empty option found`); continue; }
    if (new Set(opts.map(normalize)).size !== 4) { invalidRows.push(`Row ${row.rowNumber}: duplicate options detected`); continue; }
    if (!['A', 'B', 'C', 'D'].includes(row.correctLetter)) { invalidRows.push(`Row ${row.rowNumber}: invalid Correct value '${row.correctLetter}'`); continue; }
    if (!row.feedback.trim()) { invalidRows.push(`Row ${row.rowNumber}: missing Feedback (Why)`); continue; }
    if (seen.has(dedupeKey)) { invalidRows.push(`Row ${row.rowNumber}: duplicate Q# + Step key (${dedupeKey})`); continue; }

    seen.add(dedupeKey);
    out.push(row);
  }

  return { rows: out, invalidRows };
};

async function run() {
  const { dryRun } = parseArgs();
  const csvPath = path.resolve(process.cwd(), 'data/quiz_questions_v2.csv');
  if (!fs.existsSync(csvPath)) throw new Error(`CSV not found: ${csvPath}`);

  const { rows, invalidRows } = parseCsv(csvPath);
  const supabase = createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE_KEY')) as any;

  // The quiz UI reads from: quizzes -> questions(feedback) -> options(label,is_correct).
  const { data: quizzes, error: quizzesError } = await supabase
    .from('quizzes')
    .select('id,title,modules(title,tracks(title))');
  if (quizzesError) throw quizzesError;

  const quizList = (quizzes ?? []) as QuizRecord[];
  const quizQuestions = new Map<string, QuestionRecord[]>();
  for (const quiz of quizList) {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('id,quiz_id,prompt,sort_order,feedback,options(id,sort_order,label,is_correct,feedback)')
      .eq('quiz_id', quiz.id);
    if (error) throw error;
    quizQuestions.set(quiz.id, (questions ?? []) as QuestionRecord[]);
  }

  const planned: PlannedUpdate[] = [];
  const ambiguous: string[] = [];
  const unmatched: string[] = [];

  for (const row of rows) {
    const quizCandidates = quizList
      .map((quiz) => {
        const qs = quizQuestions.get(quiz.id) ?? [];
        const promptSet = new Set(qs.map((q) => normalize(q.prompt)));
        const score =
          (promptSet.has(normalize(row.quizQuestion)) ? 1000 : 0) +
          (normalize(quiz.title) === normalize(row.originalQuestion) ? 100 : 0) +
          (normalize(quiz.modules?.title ?? '') === normalize(row.category) ? 10 : 0) +
          (normalize(quiz.modules?.tracks?.title ?? '') === normalize(row.company) ? 1 : 0);
        return { quiz, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const quiz = quizCandidates[0]?.quiz;
    if (!quiz) {
      unmatched.push(`Row ${row.rowNumber}: no quiz match`);
      continue;
    }

    const questionRecords = quizQuestions.get(quiz.id) ?? [];
    let matches = questionRecords.filter((q) => normalize(q.prompt) === normalize(row.quizQuestion));

    if (matches.length !== 1) {
      const stepSort = parseSortFromStep(row.step);
      if (stepSort !== null) matches = questionRecords.filter((q) => q.sort_order === stepSort);
    }

    if (matches.length !== 1) {
      unmatched.push(`Row ${row.rowNumber}: no unique question match`);
      continue;
    }

    const question = matches[0];
    const sortedOptions = [...(question.options ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    if (sortedOptions.length !== 4) {
      ambiguous.push(`Row ${row.rowNumber}: question ${question.id} does not have 4 options`);
      continue;
    }

    planned.push({ row, question, sortedOptions, correctIndex: row.correctLetter.charCodeAt(0) - 65 });
  }

  const summary = {
    totalCsvRows: rows.length + invalidRows.length,
    validCsvRows: rows.length,
    plannedUpdates: planned.length,
    invalidRows: invalidRows.length,
    unmatchedRows: unmatched.length,
    ambiguousRows: ambiguous.length
  };

  if (dryRun) {
    console.log('Mode: dry-run');
    console.table(summary);
    if (invalidRows.length) console.log('Invalid rows:\n' + invalidRows.join('\n'));
    if (unmatched.length) console.log('Unmatched rows:\n' + unmatched.join('\n'));
    if (ambiguous.length) console.log('Ambiguous rows:\n' + ambiguous.join('\n'));
    return;
  }

  if (planned.length < 200) {
    throw new Error(`Apply blocked: planned updates ${planned.length} is below required minimum 200.`);
  }

  let questionsUpdated = 0;
  let optionsUpdated = 0;
  let feedbackUpdated = 0;
  const touchedQuestionIds: string[] = [];

  for (const item of planned) {
    const { error: qErr } = await supabase
      .from('questions')
      .update({ prompt: item.row.quizQuestion, feedback: item.row.feedback })
      .eq('id', item.question.id)
      .select('id')
      .single();
    if (qErr) throw qErr;

    questionsUpdated += 1;
    feedbackUpdated += 1;
    touchedQuestionIds.push(item.question.id);

    for (let i = 0; i < 4; i += 1) {
      const { error: oErr } = await supabase
        .from('options')
        .update({
          label: item.row.options[i],
          is_correct: i === item.correctIndex,
          feedback: i === item.correctIndex ? item.row.feedback : null
        })
        .eq('id', item.sortedOptions[i].id)
        .select('id')
        .single();
      if (oErr) throw oErr;
      optionsUpdated += 1;
    }
  }

  const { data: dbUpdatedRows, error: verifyError } = await supabase
    .from('questions')
    .select('id,prompt,feedback')
    .in('id', touchedQuestionIds)
    .not('feedback', 'is', null)
    .neq('feedback', '');
  if (verifyError) throw verifyError;

  const verifiedFeedbackCount = (dbUpdatedRows ?? []).length;
  if (verifiedFeedbackCount < 200) {
    throw new Error(`Apply failed: feedback updated count ${verifiedFeedbackCount} is below required minimum 200.`);
  }

  const sample = (dbUpdatedRows ?? []).slice(0, 5);

  console.log('Mode: apply');
  console.table(summary);
  console.log(`questions updated: ${questionsUpdated}`);
  console.log(`options updated: ${optionsUpdated}`);
  console.log(`feedback updated: ${verifiedFeedbackCount}`);
  console.log('sample 5 updated rows from DB:');
  console.table(sample);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
