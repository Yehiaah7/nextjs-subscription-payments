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
  feedback: string | null;
  options: Array<{ id: string; sort_order: number; label: string; is_correct: boolean }>;
};

const STEP_ORDER = ['clarify', 'users', 'pain points', 'solutions', 'prioritize', 'metrics'] as const;

const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');
const safeKey = (qNumber: string, step: string) => `${qNumber.trim()}::${normalize(step)}`;

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
    if (new Set(opts.map(normalize)).size !== 4) { invalidRows.push(`Row ${row.rowNumber}: duplicate options detected`); continue; }
    if (!['A', 'B', 'C', 'D'].includes(row.correctLetter)) { invalidRows.push(`Row ${row.rowNumber}: invalid Correct value '${row.correctLetter}'`); continue; }

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

  const prompts = new Set(rows.map((r) => normalize(r.quizQuestion)));
  const googleProductDesign = (quizzes ?? []).filter((q: any) => {
    const trackTitle = q.modules?.tracks?.title ?? '';
    return normalize(trackTitle) === 'google';
  });

  let bestQuiz: any = null;
  let bestMatches = -1;
  for (const quiz of googleProductDesign) {
    const { data: qs } = await supabase.from('questions').select('prompt').eq('quiz_id', quiz.id);
    const matchCount = (qs ?? []).filter((x: any) => prompts.has(normalize(x.prompt))).length;
    if (matchCount > bestMatches) {
      bestMatches = matchCount;
      bestQuiz = quiz;
    }
  }
  if (!bestQuiz) throw new Error('No Google quiz found to update.');

  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('id,quiz_id,prompt,sort_order,feedback,options(id,sort_order,label,is_correct)')
    .eq('quiz_id', bestQuiz.id);
  if (qError) throw qError;

  const questionRecords = (questions ?? []) as QuestionRecord[];
  const keyToQuestion = new Map<string, QuestionRecord[]>();
  for (const q of questionRecords) {
    const stepGuess = STEP_ORDER[(q.sort_order - 1) as 0 | 1 | 2 | 3 | 4 | 5] ?? String(q.sort_order);
    const qNumberGuess = Math.ceil(q.sort_order / 6);
    const key = safeKey(String(qNumberGuess), stepGuess);
    keyToQuestion.set(key, [...(keyToQuestion.get(key) ?? []), q]);
  }

  const summary = { total: rows.length, updated: 0, skippedUnmatched: 0, skippedAmbiguous: 0, skippedInvalid: invalidRows.length };
  const ambiguous: string[] = [];
  const unmatched: string[] = [];

  const operations: Array<() => Promise<void>> = [];

  for (const row of rows) {
    const key = safeKey(row.qNumber, row.step);
    let matches = keyToQuestion.get(key) ?? [];

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
      summary.skippedUnmatched += 1;
      unmatched.push(`Row ${row.rowNumber} (${row.qNumber}+${row.step})`);
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
      await supabase.from('questions').update({ prompt: row.quizQuestion, feedback: row.feedback || null }).eq('id', question.id);
      for (let i = 0; i < 4; i += 1) {
        await supabase
          .from('options')
          .update({ label: row.options[i], is_correct: i === row.correctLetter.charCodeAt(0) - 65, feedback: i === row.correctLetter.charCodeAt(0) - 65 ? row.feedback || null : null })
          .eq('id', sortedOptions[i].id);
      }
    });

    summary.updated += 1;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.resolve(process.cwd(), `data/backups/quiz-backup-${timestamp}.json`);
  if (!dryRun) {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(
      backupPath,
      JSON.stringify({ quiz: bestQuiz, questions: questionRecords, exportedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
    for (const op of operations) await op();
  }

  console.log(`Mode: ${dryRun ? 'dry-run' : 'apply'}`);
  console.log(`Target quiz: ${bestQuiz.title} (${bestQuiz.id})`);
  if (!dryRun) console.log(`Backup written: ${backupPath}`);
  console.table(summary);
  if (invalidRows.length) console.log('Invalid rows (skipped):\n' + invalidRows.join('\n'));
  if (unmatched.length) console.log('Unmatched rows:\n' + unmatched.join('\n'));
  if (ambiguous.length) console.log('Ambiguous rows:\n' + ambiguous.join('\n'));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
