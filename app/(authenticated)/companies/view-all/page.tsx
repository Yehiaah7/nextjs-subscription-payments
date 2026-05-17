import { createClient } from '@/utils/supabase/server';
import { requireUser } from '@/utils/auth/require-user';
import CompaniesScreen from '../CompaniesScreen';
import {
  buildCanonicalAttemptByQuizId,
  buildCompanySummary,
  calculateCompanyProgress
} from '../company-summary';

type TrackRow = {
  id: string;
  title: string;
  description: string | null;
};

type QuizRow = {
  id: string;
  module_id: string;
  modules: { track_id: string } | null;
};

type QuestionRow = {
  id: string;
  quiz_id: string;
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  submitted_at: string | null;
  passed: boolean | null;
  score: number | null;
  started_at: string;
};

type AnswerRow = {
  attempt_id: string;
  question_id: string;
};

export default async function ViewAllCompaniesPage() {
  const user = await requireUser();
  const db = createClient();

  const { data: tracksData, error: tracksError } = await db
    .from('tracks')
    .select('id,title,description')
    .eq('type', 'company')
    .eq('is_published', true)
    .order('title', { ascending: true });

  if (tracksError) {
    throw new Error(`Failed to load companies: ${tracksError.message}`);
  }

  const tracks = Array.from(
    new Map(
      ((tracksData ?? []) as TrackRow[]).map((track) => [track.id, track])
    ).values()
  );
  const trackIds = tracks.map((track) => track.id);

  const { data: allQuizzesData, error: quizzesError } = trackIds.length
    ? await db
        .from('quizzes')
        .select('id,module_id,modules!inner(track_id)')
        .in('modules.track_id', trackIds)
    : { data: [] as QuizRow[], error: null };

  if (quizzesError) {
    throw new Error(`Failed to load quizzes: ${quizzesError.message}`);
  }

  const quizzes = (allQuizzesData ?? []) as QuizRow[];
  const quizIds = quizzes.map((quiz) => quiz.id);

  const { data: questionsData, error: questionsError } = quizIds.length
    ? await db.from('questions').select('id,quiz_id').in('quiz_id', quizIds)
    : { data: [] as QuestionRow[], error: null };

  if (questionsError) {
    throw new Error(`Failed to load questions: ${questionsError.message}`);
  }

  const { data: attemptsData, error: attemptsError } = quizIds.length
    ? await db
        .from('attempts')
        .select('id,quiz_id,submitted_at,passed,score,started_at')
        .eq('user_id', user.id)
        .in('quiz_id', quizIds)
        .order('started_at', { ascending: false })
    : { data: [] as AttemptRow[], error: null };

  if (attemptsError) {
    throw new Error(`Failed to load attempts: ${attemptsError.message}`);
  }

  const attempts = (attemptsData ?? []) as AttemptRow[];

  const latestAttemptByQuizId = attempts.reduce(
    (acc: Record<string, AttemptRow>, attempt) => {
      if (!acc[attempt.quiz_id]) {
        acc[attempt.quiz_id] = attempt;
      }
      return acc;
    },
    {}
  );

  const canonicalAttemptByQuizId = buildCanonicalAttemptByQuizId(attempts);

  const attemptIds = Array.from(
    new Set(
      Object.values(canonicalAttemptByQuizId).map((attempt) => attempt.id)
    )
  ).filter(Boolean);

  const { data: answersData, error: answersError } = attemptIds.length
    ? await db
        .from('answers')
        .select('attempt_id,question_id')
        .in('attempt_id', attemptIds)
    : { data: [] as AnswerRow[], error: null };

  if (answersError) {
    throw new Error(`Failed to load answers: ${answersError.message}`);
  }

  const answeredCountByAttempt = ((answersData ?? []) as AnswerRow[]).reduce(
    (acc: Record<string, Set<string>>, answer) => {
      acc[answer.attempt_id] ??= new Set<string>();
      acc[answer.attempt_id].add(answer.question_id);
      return acc;
    },
    {}
  );

  const quizzesByTrackId = quizzes.reduce(
    (acc: Record<string, QuizRow[]>, quiz) => {
      const trackId = quiz.modules?.track_id;
      if (!trackId) return acc;
      acc[trackId] ??= [];
      acc[trackId].push(quiz);
      return acc;
    },
    {}
  );

  const questionCountByQuizId = ((questionsData ?? []) as QuestionRow[]).reduce(
    (acc: Record<string, number>, question) => {
      acc[question.quiz_id] = (acc[question.quiz_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const companyTracks = tracks.map((track) => {
    const companyQuizzes = quizzesByTrackId[track.id] ?? [];
    const progress = calculateCompanyProgress({
      quizIds: companyQuizzes.map((quiz) => quiz.id),
      questionCountByQuizId,
      canonicalAttemptByQuizId,
      answeredCountByAttempt
    });

    return buildCompanySummary({
      id: track.id,
      title: track.title,
      description: track.description,
      challengeCount: companyQuizzes.length,
      progress
    });
  });

  return <CompaniesScreen companyTracks={companyTracks} />;
}
