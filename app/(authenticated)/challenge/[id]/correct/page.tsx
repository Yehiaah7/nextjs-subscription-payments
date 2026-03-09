import FeedbackScreen from '../FeedbackScreen';
import { requireUser } from '@/utils/auth/require-user';

type CorrectPageProps = {
  params: {
    id: string;
  };
};

export default async function CorrectPage({ params }: CorrectPageProps) {
  await requireUser();

  return <FeedbackScreen challengeId={params.id} variant="correct" />;
}
