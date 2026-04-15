import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/auth/require-user';
import CompaniesScreen, { CompanyTrack } from '../CompaniesScreen';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
};

type QuizRow = {
  id: string;
  module_id: string | null;
  modules: { track_id: string } | null;
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  submitted_at: string | null;
  passed: boolean | null;
  started_at: string;
};

type AnswerRow = {
  attempt_id: string;
  question_id: string;
  points_awarded: number | null;
};

type QuestionRow = {
  id: string;
  quiz_id: string;
};

const hashString = (value: string) =>
  value
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 100000, 7);

const deterministicRange = (seedSource: string, min: number, max: number) => min + (hashString(seedSource) % (max - min + 1));

const toCompanyTrack = (track: TrackRow, challengeCount: number, progress: number): CompanyTrack => {
  return {
    id: track.id,
    title: track.title,
    focus: track.description ?? 'Company Practice',
    challengesCount: challengeCount,
    practicingCount: `${deterministicRange(track.id, 50, 150)}`,
    progress
  };
};

export default async function ViewAllCompaniesPage() {
  const user = await requireUser();

  const db = createClient();
  const { data: tracksData } = await db
    .from('tracks' as any)
    .select('id,title,description')
    .eq('type', 'company')
    .eq('is_published', true)
    .order('title', { ascending: true });

  const tracks = Array.from(new Map(((tracksData ?? []) as TrackRow[]).map((track) => [track.id, track])).values());
  const trackIds = tracks.map((track) => track.id);

  const { data: allQuizzesData } = trackIds.length
    ? await db.from('quizzes').select('id,module_id,modules!inner(track_id)').in('modules.track_id', trackIds)
    : { data: [] as QuizRow[] };
  const allQuizzes = (allQuizzesData ?? []) as QuizRow[];
  const quizIds = allQuizzes.map((quiz) => quiz.id);

  const { data: attemptsData } = quizIds.length
    ? await db
        .from('attempts')
        .select('id,quiz_id,submitted_at,passed,started_at')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('started_at', { ascending: false })
    : { data: [] as AttemptRow[] };
  const attempts = (attemptsData ?? []) as AttemptRow[];

  const attemptsByQuiz = attempts.reduce(
    (acc: Record<string, AttemptRow[]>, attempt) => {
      acc[attempt.quiz_id] ??= [];
      acc[attempt.quiz_id].push(attempt);
      return acc;
    },
    {}
  );

  const latestActiveAttemptByQuiz: Record<string, AttemptRow | undefined> = Object.fromEntries(
    Object.entries(attemptsByQuiz).map(([quizId, quizAttempts]) => [quizId, quizAttempts.find((attempt) => !attempt.submitted_at)])
  );

  const latestActiveAttemptIds = Object.values(latestActiveAttemptByQuiz)
    .map((attempt) => attempt?.id)
    .filter(Boolean) as string[];

  const { data: answersData } = latestActiveAttemptIds.length
    ? await db
        .from('answers')
        .select('attempt_id,question_id,points_awarded')
        .in('attempt_id', latestActiveAttemptIds)
    : { data: [] as AnswerRow[] };
  const answers = (answersData ?? []) as AnswerRow[];

  const { data: questionsData } = quizIds.length
    ? await db.from('questions').select('id,quiz_id').in('quiz_id', quizIds)
    : { data: [] as QuestionRow[] };
  const questions = (questionsData ?? []) as QuestionRow[];

  const totalQuestionsByQuiz = questions.reduce(
    (acc: Record<string, number>, question) => {
      acc[question.quiz_id] = (acc[question.quiz_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const solvedQuestionsByAttempt = answers.reduce(
    (acc: Record<string, Set<string>>, answer) => {
      if ((answer.points_awarded ?? 0) <= 0) return acc;
      acc[answer.attempt_id] ??= new Set<string>();
      acc[answer.attempt_id].add(answer.question_id);
      return acc;
    },
    {}
  );

  const quizzesByTrack = allQuizzes.reduce(
    (acc: Record<string, QuizRow[]>, quiz) => {
      const trackId = quiz.modules?.track_id;
      if (!trackId) return acc;
      acc[trackId] ??= [];
      acc[trackId].push(quiz);
      return acc;
    },
    {}
  );

  const companyTracks = tracks.map((track) => {
    const quizzesForTrack = quizzesByTrack[track.id] ?? [];
    const totalSteps = quizzesForTrack.reduce((sum, quiz) => sum + (totalQuestionsByQuiz[quiz.id] ?? 0), 0);
    const completedSteps = quizzesForTrack.reduce((sum, quiz) => {
      const activeAttempt = latestActiveAttemptByQuiz[quiz.id];
      if (!activeAttempt) return sum;
      return sum + (solvedQuestionsByAttempt[activeAttempt.id]?.size ?? 0);
    }, 0);
    const progress = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 0;
    return toCompanyTrack(track, quizzesForTrack.length, progress);
  });

  return <CompaniesScreen companyTracks={companyTracks} />;
}
