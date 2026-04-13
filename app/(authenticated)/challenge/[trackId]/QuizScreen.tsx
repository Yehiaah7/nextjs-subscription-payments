'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type Question = {
  id: string;
  prompt: string;
  sort_order: number;
  explanation: string | null;
  points: number;
  options: { id: string; label: string; sort_order: number; is_correct: boolean }[];
};

type Quiz = {
  id: string;
  title: string;
  module_id: string;
  modules: { title: string } | null;
  pass_score: number | null;
  questions: Question[];
};

type AnswerMeta = { hadWrongBefore: boolean };

export default function QuizScreen({ challengeId }: { challengeId: string }) {
  const supabase = useMemo(() => createClient() as any, []);
  const searchParams = useSearchParams();
  const companyId = searchParams.get('company');
  const returnToTrackHref = companyId ? `/companies/${companyId}` : '/home';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, { correct: boolean; text: string }>>({});

  const currentQuestion = quiz?.questions[activeIndex];

  const loadQuiz = async () => {
    const { data: quizData } = await supabase
      .from('quizzes')
      .select('id,title,module_id,pass_score,modules(title),questions(id,prompt,sort_order,explanation,points,options(id,label,sort_order,is_correct))')
      .eq('id', challengeId)
      .single();

    if (!quizData) return;

    const normalizedQuiz = {
      ...quizData,
      questions: (quizData.questions ?? []).sort(
        (a: Question, b: Question) => a.sort_order - b.sort_order
      )
    } as Quiz;

    setQuiz(normalizedQuiz);

    const { data: existingAttempt } = await supabase
      .from('attempts')
      .select('id,submitted_at,passed')
      .eq('quiz_id', challengeId)
      .is('submitted_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const activeAttempt =
      existingAttempt ??
      (
        await supabase
          .from('attempts')
          .insert({ quiz_id: challengeId })
          .select('id,submitted_at,passed')
          .single()
      ).data;

    if (!activeAttempt) return;

    setAttemptId(activeAttempt.id);
    setLocked(Boolean(activeAttempt.submitted_at && activeAttempt.passed));

    const { data: existingAnswers } = await supabase
      .from('answers')
      .select('question_id,option_id,text_answer,options(is_correct)')
      .eq('attempt_id', activeAttempt.id);

    const nextSelections: Record<string, string> = {};
    const nextFeedback: Record<string, { correct: boolean; text: string }> = {};

    for (const answer of existingAnswers ?? []) {
      if (answer.option_id) nextSelections[answer.question_id] = answer.option_id;
      const question = normalizedQuiz.questions.find((item) => item.id === answer.question_id);
      if (question && answer.option_id) {
        nextFeedback[question.id] = {
          correct: Boolean(answer.options?.is_correct),
          text: question.explanation ?? ''
        };
      }
    }

    setSelections(nextSelections);
    setFeedback(nextFeedback);
  };

  useEffect(() => {
    loadQuiz().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  const onSelectOption = async (question: Question, optionId: string) => {
    if (!attemptId || locked) return;

    const option = question.options.find((item) => item.id === optionId);
    if (!option) return;

    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('text_answer')
      .eq('attempt_id', attemptId)
      .eq('question_id', question.id)
      .maybeSingle();

    const previousMeta: AnswerMeta = existingAnswer?.text_answer
      ? JSON.parse(existingAnswer.text_answer)
      : { hadWrongBefore: false };

    const hadWrongBefore = previousMeta.hadWrongBefore || !option.is_correct;
    const pointsAwarded = option.is_correct && !hadWrongBefore ? 1 : 0;

    await supabase.from('answers').upsert(
      {
        attempt_id: attemptId,
        question_id: question.id,
        option_id: option.id,
        points_awarded: pointsAwarded,
        text_answer: JSON.stringify({ hadWrongBefore })
      },
      { onConflict: 'attempt_id,question_id' }
    );

    setSelections((prev) => ({ ...prev, [question.id]: option.id }));
    setFeedback((prev) => ({
      ...prev,
      [question.id]: { correct: option.is_correct, text: question.explanation ?? '' }
    }));

    if (option.is_correct && quiz) {
      const allCorrect = quiz.questions.every((item) => {
        if (item.id === question.id) return true;
        const selectedOption = selections[item.id];
        const selected = item.options.find((opt) => opt.id === selectedOption);
        return Boolean(selected?.is_correct);
      });

      if (allCorrect) {
        const { data: allAnswers } = await supabase
          .from('answers')
          .select('points_awarded')
          .eq('attempt_id', attemptId);

        const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        const awarded = (allAnswers ?? []).reduce(
          (sum: number, answer: { points_awarded: number | null }) => sum + (answer.points_awarded ?? 0),
          0
        );

        const score = Math.round((awarded / Math.max(totalPoints, 1)) * 100);
        const passed = score >= (quiz.pass_score ?? 60);

        await supabase
          .from('attempts')
          .update({ submitted_at: new Date().toISOString(), score, passed })
          .eq('id', attemptId);

        setLocked(passed);
      }
    }
  };

  if (loading || !quiz || !currentQuestion) {
    return <div className="mx-auto w-full max-w-[361px] rounded-2xl bg-white p-4">Loading challenge...</div>;
  }

  const selectedOptionId = selections[currentQuestion.id] ?? null;
  const questionFeedback = feedback[currentQuestion.id];

  return (
    <section className="mx-auto flex w-full max-w-[361px] flex-col gap-4 pb-4 text-text">
      <header className="flex items-center justify-between">
        <Link href={returnToTrackHref} className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white text-[#0f172b]" aria-label="Back">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <p className="text-xs font-black uppercase tracking-[0.08em] text-primary">
          Step {activeIndex + 1}/{quiz.questions.length}
        </p>
      </header>

      <section>
        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#155dfc]">{quiz.modules?.title ?? 'Challenge'}</p>
        <h1 className="mt-2 text-base font-bold leading-6 text-[#0f172b]">{quiz.title}</h1>
      </section>

      <section className="w-full rounded-2xl bg-white p-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <p className="text-sm font-normal leading-5 text-[#45556c]">{currentQuestion.prompt}</p>
      </section>

      <section className="space-y-3">
        {currentQuestion.options
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((option) => {
            const active = selectedOptionId === option.id;
            const disabled = locked;
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectOption(currentQuestion, option.id)}
                className={`w-full rounded-2xl border p-3 text-left ${active ? 'border-[#bfd5ff] bg-[#eff6ff]' : 'border-[#e2e8f0] bg-white'}`}
              >
                <p className="text-sm font-bold text-[#0f172b]">Option {String.fromCharCode(64 + option.sort_order)}</p>
                <p className="text-xs text-[#62748e]">{option.label}</p>
              </button>
            );
          })}
      </section>

      {questionFeedback ? (
        <div className={`rounded-2xl p-3 text-sm ${questionFeedback.correct ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
          <p className="font-black uppercase tracking-[0.08em]">
            {questionFeedback.correct ? 'Correct' : 'Incorrect'}
          </p>
          <p>{questionFeedback.text}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-[10px]">
        <button
          type="button"
          onClick={() => setActiveIndex((value) => Math.max(0, value - 1))}
          disabled={activeIndex === 0}
          className="inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#e2e8f0] bg-white px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-[#94a3b8]"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={() => setActiveIndex((value) => Math.min(quiz.questions.length - 1, value + 1))}
          disabled={activeIndex === quiz.questions.length - 1}
          className="inline-flex h-[39px] items-center justify-center gap-1 rounded-xl border border-[#ffd230] bg-[#f59e0b] px-4 py-[11px] text-[11px] font-black uppercase tracking-[0.08em] text-white"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
