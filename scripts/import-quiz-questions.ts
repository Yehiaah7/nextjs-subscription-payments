import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

type CsvRow = {
  rowNumber: number;
  qNumber: string;
  level: string;
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
  explanation?: string | null;
  feedback?: string | null;
  options: Array<{ id: string; sort_order: number; label: string; is_correct: boolean }>;
};
type QuizRecord = {
  id: string;
  title: string;
  module_id: string;
  difficulty: string | null;
  modules?: { id: string; title: string; track_id: string; tracks?: { id: string; title: string; type: string } };
};
type UpdateStats = {
  questionRowsUpdated: number;
  optionRowsUpdated: number;
  feedbackRowsUpdated: number;
};

const STEP_ORDER = ['clarify', 'users', 'pain points', 'solutions', 'prioritize', 'metrics'] as const;

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
const safeKey = (qNumber: string, step: string) => `${qNumber.trim()}::${normalize(step)}`;
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
      level: cols[idx('level')] ?? '',
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
    if (!row.qNumber || !row.step || !row.quizQuestion) { invalidRows.push(`Row ${row.rowNumber}: missing required key fields`); continue; }
    if (opts.some((o) => !o)) { invalidRows.push(`Row ${row.rowNumber}: empty option found`); continue; }
    if (new Set(opts.map(normalize)).size !== 4) {
      const counts = new Map<string, number>();
      for (const opt of opts.map(normalize)) counts.set(opt, (counts.get(opt) ?? 0) + 1);
      const dups = Array.from(counts.entries()).filter(([, count]) => count > 1).map(([value]) => value).join(' | ');
      invalidRows.push(`Row ${row.rowNumber}: duplicate options detected -> ${dups}`);
      continue;
    }
    if (!['A', 'B', 'C', 'D'].includes(row.correctLetter)) { invalidRows.push(`Row ${row.rowNumber}: invalid Correct value '${row.correctLetter}'`); continue; }
    if (!row.feedback.trim()) { invalidRows.push(`Row ${row.rowNumber}: missing Feedback (Why)`); continue; }

    const key = safeKey(row.qNumber, row.step);
    if (seen.has(key)) { invalidRows.push(`Row ${row.rowNumber}: duplicate Q# + Step key (${key})`); continue; }
    seen.add(key);
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

  const { data: schemaColumns, error: schemaError } = await supabase
    .from('information_schema.columns')
    .select('table_name,column_name')
    .eq('table_schema', 'public')
    .in('table_name', ['questions', 'options']);
  if (schemaError) throw schemaError;
  const columnsByTable = new Map<string, Set<string>>();
  for (const row of schemaColumns ?? []) {
    const table = row.table_name as string;
    const col = row.column_name as string;
    const existingColumns = columnsByTable.get(table) ?? new Set<string>();
    existingColumns.add(col);
    columnsByTable.set(table, existingColumns);
  }
  const questionFeedbackColumn = columnsByTable.get('questions')?.has('feedback') ? 'feedback' : 'explanation';
  if (!columnsByTable.get('questions')?.has(questionFeedbackColumn)) {
    throw new Error('Neither questions.feedback nor questions.explanation exists in the database schema.');
  }
  if (!columnsByTable.get('options')?.has('feedback')) {
    throw new Error('options.feedback column is missing in the database schema.');
  }
  if (!columnsByTable.get('options')?.has('is_correct')) {
    throw new Error('options.is_correct column is missing in the database schema.');
  }

  const { data: quizzes, error: quizzesError } = await supabase
    .from('quizzes')
    .select('id,title,module_id,difficulty,modules(id,title,track_id,tracks(id,title,type))');
  if (quizzesError) throw quizzesError;

  const quizList = (quizzes ?? []) as QuizRecord[];
  const loadQuestions = async (feedbackColumn: string, quizId: string) =>
    supabase
      .from('questions')
      .select(`id,quiz_id,prompt,sort_order,${feedbackColumn},options(id,sort_order,label,is_correct,feedback)`)
      .eq('quiz_id', quizId);

  const quizQuestions = new Map<string, QuestionRecord[]>();
  for (const quiz of quizList) {
    const { data: questions, error: qError } = await loadQuestions(questionFeedbackColumn, quiz.id);
    if (qError) throw qError;
    quizQuestions.set(quiz.id, (questions ?? []) as QuestionRecord[]);
  }

  const summary = { totalCsvRows: rows.length + invalidRows.length, matchedRows: 0, unmatchedRows: 0, invalidRows: invalidRows.length, skippedAmbiguous: 0 };
  const ambiguous: string[] = [];
  const unmatched: string[] = [];
  const mappingReport: string[] = [];
  const unmatchedReasons: string[] = [];

  const operations: Array<() => Promise<void>> = [];
  const targetedQuestionIds = new Set<string>();
  const targetedOptionIds = new Set<string>();

  const updateStats: UpdateStats = { questionRowsUpdated: 0, optionRowsUpdated: 0, feedbackRowsUpdated: 0 };
  const validRowsCount = rows.length;

  for (const row of rows) {
    const quizCandidates = quizList
      .map((quiz) => {
        const qs = quizQuestions.get(quiz.id) ?? [];
        const promptSet = new Set(qs.map((q) => normalize(q.prompt)));
        const promptMatch = promptSet.has(normalize(row.quizQuestion)) ? 1 : 0;
        const titleMatch = normalize(quiz.title) === normalize(row.originalQuestion) ? 1 : 0;
        const moduleMatch = normalize(quiz.modules?.title ?? '') === normalize(row.category) ? 1 : 0;
        const trackMatch = normalize(quiz.modules?.tracks?.title ?? '') === normalize(row.company) ? 1 : 0;
        const score = promptMatch * 1000 + titleMatch * 100 + moduleMatch * 10 + trackMatch;
        return { quiz, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    const quiz = quizCandidates[0]?.quiz;
    if (!quiz) {
      summary.unmatchedRows += 1;
      unmatched.push(`Row ${row.rowNumber}`);
      unmatchedReasons.push(`Row ${row.rowNumber}: no mapped quiz for Q#${row.qNumber}`);
      continue;
    }
    mappingReport.push(
      `Row ${row.rowNumber} (Q#${row.qNumber}) -> ${quiz.title} [${quiz.id}] (track=${quiz.modules?.tracks?.title ?? 'n/a'}, module=${quiz.modules?.title ?? 'n/a'}, score=${quizCandidates[0]?.score ?? 0})`
    );
    const questionRecords = quizQuestions.get(quiz.id) ?? [];
    let matches = questionRecords.filter((q) => normalize(q.prompt) === normalize(row.quizQuestion));
    if (matches.length !== 1) {
      const stepSort = parseSortFromStep(row.step);
      if (stepSort !== null) matches = questionRecords.filter((q) => q.sort_order === stepSort);
    }

    if (matches.length > 1) {
      matches = matches.filter((m) => normalize(m.prompt) === normalize(row.quizQuestion));
    }

    if (matches.length !== 1) {
      const strictPromptMatches = questionRecords.filter((q) => normalize(q.prompt) === normalize(row.quizQuestion));
      if (strictPromptMatches.length === 1) {
        matches = strictPromptMatches;
      }
    }

    if (matches.length === 0) {
      summary.unmatchedRows += 1;
      unmatched.push(`Row ${row.rowNumber} (${row.qNumber}+${row.step})`);
      unmatchedReasons.push(`Row ${row.rowNumber}: no question match by prompt or sort_order in quiz ${quiz.title} (${quiz.id})`);
      continue;
    }

    if (matches.length > 1) {
      summary.skippedAmbiguous += 1;
      ambiguous.push(`Row ${row.rowNumber} (${row.qNumber}+${row.step}) -> ${matches.map((m) => m.id).join(', ')}`);
      continue;
    }

    const question = matches[0];
    const sortedOptions = [...(question.options ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    if (sortedOptions.length !== 4) {
      summary.skippedAmbiguous += 1;
      ambiguous.push(`Row ${row.rowNumber} question ${question.id} does not have exactly 4 options`);
      continue;
    }

    operations.push(async () => {
      const { error: questionUpdateError } = await supabase
        .from('questions')
        .update({ prompt: row.quizQuestion, [questionFeedbackColumn]: row.feedback || null })
        .eq('id', question.id);
      if (questionUpdateError) throw questionUpdateError;
      targetedQuestionIds.add(question.id);
      updateStats.questionRowsUpdated += 1;
      if (row.feedback.trim()) updateStats.feedbackRowsUpdated += 1;
      for (let i = 0; i < 4; i += 1) {
        const { error: optionUpdateError } = await supabase
          .from('options')
          .update({ label: row.options[i], is_correct: i === row.correctLetter.charCodeAt(0) - 65, feedback: i === row.correctLetter.charCodeAt(0) - 65 ? row.feedback || null : null })
          .eq('id', sortedOptions[i].id);
        if (optionUpdateError) throw optionUpdateError;
        targetedOptionIds.add(sortedOptions[i].id);
        updateStats.optionRowsUpdated += 1;
      }
    });

    summary.matchedRows += 1;
  }
  const unmatchedRate = rows.length ? summary.unmatchedRows / rows.length : 0;
  if (!dryRun && unmatchedRate > 0.05) {
    throw new Error(`Apply blocked: unmatched rows ${summary.unmatchedRows}/${rows.length} (${(unmatchedRate * 100).toFixed(1)}%) exceed 5% threshold`);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.resolve(process.cwd(), `data/backups/quiz-backup-${timestamp}.json`);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(
      backupPath,
      JSON.stringify({ quizzes: quizList.map((q) => ({ ...q, questions: quizQuestions.get(q.id) ?? [] })), exportedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
    for (const op of operations) await op();
  }

  let verification: null | {
    questionsUpdated: number;
    optionsUpdated: number;
    feedbackSavedOnQuestions: number;
    feedbackSavedOnOptions: number;
    feedbackCountAfterUpdate: number;
    sampleUpdatedQuestions: Array<{ id: string; prompt: string; feedbackValue: string | null }>;
  } = null;
  if (!dryRun) {
    const questionIds = Array.from(targetedQuestionIds);
    const optionIds = Array.from(targetedOptionIds);
    const { data: updatedQuestions, error: updatedQuestionsError } = await supabase
      .from('questions')
      .select(`id,${questionFeedbackColumn}`)
      .in('id', questionIds);
    if (updatedQuestionsError) throw updatedQuestionsError;
    const { data: updatedOptions, error: updatedOptionsError } = await supabase
      .from('options')
      .select('id,feedback')
      .in('id', optionIds);
    if (updatedOptionsError) throw updatedOptionsError;
    const { count: feedbackCountAfterUpdate, error: feedbackCountError } = await supabase
      .from('questions')
      .select('id', { count: 'exact', head: true })
      .not(questionFeedbackColumn, 'is', null)
      .neq(questionFeedbackColumn, '');
    if (feedbackCountError) throw feedbackCountError;
    const { data: sampleUpdatedQuestions, error: sampleError } = await supabase
      .from('questions')
      .select(`id,prompt,${questionFeedbackColumn}`)
      .in('id', questionIds)
      .not(questionFeedbackColumn, 'is', null)
      .neq(questionFeedbackColumn, '')
      .limit(10);
    if (sampleError) throw sampleError;
    verification = {
      questionsUpdated: updatedQuestions?.length ?? 0,
      optionsUpdated: updatedOptions?.length ?? 0,
      feedbackSavedOnQuestions: (updatedQuestions ?? []).filter((q: any) => typeof q[questionFeedbackColumn] === 'string' && q[questionFeedbackColumn].trim() !== '').length,
      feedbackSavedOnOptions: (updatedOptions ?? []).filter((o: any) => typeof o.feedback === 'string' && o.feedback.trim() !== '').length,
      feedbackCountAfterUpdate: feedbackCountAfterUpdate ?? 0,
      sampleUpdatedQuestions: (sampleUpdatedQuestions ?? []).map((q: any) => ({
        id: q.id,
        prompt: q.prompt,
        feedbackValue: q[questionFeedbackColumn] ?? null
      }))
    };
    if (updateStats.feedbackRowsUpdated < Math.floor(validRowsCount * 0.9)) {
      throw new Error(
        `Apply failed: feedbackRowsUpdated=${updateStats.feedbackRowsUpdated} is below 90% threshold of valid rows (${Math.floor(validRowsCount * 0.9)}/${validRowsCount}). Unmatched=${summary.unmatchedRows}, ambiguous=${summary.skippedAmbiguous}, invalid=${summary.invalidRows}.`
      );
    }
  }

  console.log(`Mode: ${dryRun ? 'dry-run' : 'apply'}`);
  console.log('Q# -> target quiz mapping:');
  console.log(mappingReport.join('\n'));
  if (!dryRun) console.log(`Backup written: ${backupPath}`);
  console.table(summary);
  console.log('DB update counts:');
  console.table(updateStats);
  if (verification) {
    console.log('Post-update DB verification:');
    console.table({
      questionRowsUpdated: updateStats.questionRowsUpdated,
      optionRowsUpdated: updateStats.optionRowsUpdated,
      feedbackRowsUpdated: updateStats.feedbackRowsUpdated,
      feedbackCountAfterUpdate: verification.feedbackCountAfterUpdate,
      feedbackSavedOnQuestions: verification.feedbackSavedOnQuestions,
      feedbackSavedOnOptions: verification.feedbackSavedOnOptions
    });
    console.log('Sample updated questions with feedback:');
    console.table(verification.sampleUpdatedQuestions);
  }
  if (invalidRows.length) console.log('Invalid rows (skipped):\n' + invalidRows.join('\n'));
  if (unmatched.length) console.log('Unmatched rows:\n' + unmatched.join('\n'));
  if (unmatchedReasons.length) console.log('Unmatched reasons:\n' + unmatchedReasons.join('\n'));
  if (ambiguous.length) console.log('Ambiguous rows:\n' + ambiguous.join('\n'));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
