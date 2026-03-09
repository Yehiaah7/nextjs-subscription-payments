import FeedbackScreen from '../FeedbackScreen';
import { requireUser } from '@/utils/auth/require-user';

type WrongPageProps = {
  params: {
    id: string;
  };
};

export default async function WrongPage({ params }: WrongPageProps) {
  await requireUser();

  return <FeedbackScreen challengeId={params.id} variant="wrong" />;
}
