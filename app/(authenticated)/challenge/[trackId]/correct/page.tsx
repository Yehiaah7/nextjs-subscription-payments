import FeedbackScreen from '../FeedbackScreen';
import { requireUser } from '@/utils/auth/require-user';

export default async function CorrectPage() {
  await requireUser();

  return <FeedbackScreen variant="correct" />;
}
