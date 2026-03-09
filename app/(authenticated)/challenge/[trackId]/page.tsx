import QuizScreen from './QuizScreen';
import { requireUser } from '@/utils/auth/require-user';

type QuizPageProps = {
  params: {
    trackId: string;
  };
};

export default async function QuizPage({ params }: QuizPageProps) {
  await requireUser();

  return <QuizScreen challengeId={params.trackId} />;
}
