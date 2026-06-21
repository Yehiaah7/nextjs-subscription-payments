import QuizScreen from './QuizScreen';
import { requireUser } from '@/utils/auth/require-user';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import {
  canAccessCompany,
  isFreeTrialActive,
  resolveTrialEndAt
} from '@/utils/access';
import { getHasProSubscription } from '@/utils/supabase/queries';

type QuizPageProps = {
  params: {
    trackId: string;
  };
};

export default async function QuizPage({ params }: QuizPageProps) {
  const user = await requireUser();
  const db = createClient();

  const [{ data: quizData }, { data: profileData }, isPro] = await Promise.all([
    db
      .from('quizzes')
      .select('modules!inner(tracks!inner(title))')
      .eq('id', params.trackId)
      .maybeSingle(),
    (db as any)
      .from('profiles')
      .select('created_at')
      .eq('id', user.id)
      .maybeSingle(),
    getHasProSubscription(db)
  ]);

  const companyTitle = ((quizData as any)?.modules?.tracks?.title ??
    '') as string;
  const trialEndAt = resolveTrialEndAt({
    trialEndAt:
      user.user_metadata?.trialEndAt ?? user.user_metadata?.trial_end_at,
    trialStartedAt:
      user.user_metadata?.trialStartedAt ??
      user.user_metadata?.trial_started_at,
    createdAt:
      (profileData as { created_at?: string } | null)?.created_at ??
      user.created_at
  });

  if (
    companyTitle &&
    !canAccessCompany({
      companySlug: companyTitle,
      isPro,
      isTrialActive: isFreeTrialActive(trialEndAt)
    })
  ) {
    redirect('/home?upgrade=1');
  }

  return <QuizScreen challengeId={params.trackId} />;
}
