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
  explanation: string | null;
  options: Array<{ id: string; sort_order: number; label: string; is_correct: boolean }>;
};
type QuizRecord = {
  id: string;
  title: string;
  module_id: string;
  difficulty: string | null;
  modules?: { id: string; title: string; track_id: string; tracks?: { id: string; title: string; type: string } };
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

  const { data: quizzes, error: quizzesError } = await supabase
    .from('quizzes')
    .select('id,title,module_id,difficulty,modules(id,title,track_id,tracks(id,title,type))');
  if (quizzesError) throw quizzesError;

  const quizList = (quizzes ?? []) as QuizRecord[];
  const loadQuestions = async (explanationColumn: string, quizId: string) =>
    supabase
      .from('questions')
      .select(`id,quiz_id,prompt,sort_order,${explanationColumn},options(id,sort_order,label,is_correct)`)
      .eq('quiz_id', quizId);

  let explanationColumn: 'explanation' | 'feedback' = 'explanation';
  const quizQuestions = new Map<string, QuestionRecord[]>();
  for (const quiz of quizList) {
    let { data: questions, error: qError } = await loadQuestions(explanationColumn, quiz.id);
    if (qError) {
      const fallback = await loadQuestions('feedback', quiz.id);
      if (fallback.error) throw qError;
      explanationColumn = 'feedback';
      questions = fallback.data;
    }
    quizQuestions.set(quiz.id, (questions ?? []) as QuestionRecord[]);
  }

  const summary = { totalCsvRows: rows.length + invalidRows.length, matchedRows: 0, unmatchedRows: 0, invalidRows: invalidRows.length, skippedAmbiguous: 0 };
  const ambiguous: string[] = [];
  const unmatched: string[] = [];
  const mappingReport: string[] = [];
  const unmatchedReasons: string[] = [];

  const operations: Array<() => Promise<void>> = [];

  const groups = new Map<string, CsvRow[]>();
  for (const row of rows) groups.set(row.qNumber, [...(groups.get(row.qNumber) ?? []), row]);
  const quizByQ = new Map<string, QuizRecord>();

  for (const [qNumber, groupRows] of groups.entries()) {
    let winner: QuizRecord | null = null;
    let bestScore = -1;
    for (const quiz of quizList) {
      const qs = quizQuestions.get(quiz.id) ?? [];
      if (!qs.length) continue;
      const promptSet = new Set(qs.map((q) => normalize(q.prompt)));
      const promptMatches = groupRows.filter((r) => promptSet.has(normalize(r.quizQuestion))).length;
      const titleMatches = groupRows.filter((r) => normalize(quiz.title) === normalize(r.originalQuestion)).length;
      const moduleMatches = groupRows.filter((r) => normalize(quiz.modules?.title ?? '') === normalize(r.category)).length;
      const trackMatches = groupRows.filter((r) => normalize(quiz.modules?.tracks?.title ?? '') === normalize(r.company)).length;
      const score = promptMatches * 100 + titleMatches * 10 + moduleMatches * 3 + trackMatches;
      if (score > bestScore) { bestScore = score; winner = quiz; }
    }
    if (winner && bestScore > 0) {
      quizByQ.set(qNumber, winner);
      mappingReport.push(`Q#${qNumber} -> ${winner.title} [${winner.id}] (track=${winner.modules?.tracks?.title ?? 'n/a'}, module=${winner.modules?.title ?? 'n/a'}, score=${bestScore})`);
    } else {
      mappingReport.push(`Q#${qNumber} -> UNMAPPED`);
    }
  }

  for (const row of rows) {
    const quiz = quizByQ.get(row.qNumber);
    if (!quiz) {
      summary.unmatchedRows += 1;
      unmatched.push(`Row ${row.rowNumber}`);
      unmatchedReasons.push(`Row ${row.rowNumber}: no mapped quiz for Q#${row.qNumber}`);
      continue;
    }
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
      await supabase
        .from('questions')
        .update({ prompt: row.quizQuestion, [explanationColumn]: row.feedback || null })
        .eq('id', question.id);
      for (let i = 0; i < 4; i += 1) {
        await supabase
          .from('options')
          .update({ label: row.options[i], is_correct: i === row.correctLetter.charCodeAt(0) - 65, feedback: i === row.correctLetter.charCodeAt(0) - 65 ? row.feedback || null : null })
          .eq('id', sortedOptions[i].id);
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

  console.log(`Mode: ${dryRun ? 'dry-run' : 'apply'}`);
  console.log('Q# -> target quiz mapping:');
  console.log(mappingReport.join('\n'));
  if (!dryRun) console.log(`Backup written: ${backupPath}`);
  console.table(summary);
  if (invalidRows.length) console.log('Invalid rows (skipped):\n' + invalidRows.join('\n'));
  if (unmatched.length) console.log('Unmatched rows:\n' + unmatched.join('\n'));
  if (unmatchedReasons.length) console.log('Unmatched reasons:\n' + unmatchedReasons.join('\n'));
  if (ambiguous.length) console.log('Ambiguous rows:\n' + ambiguous.join('\n'));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
