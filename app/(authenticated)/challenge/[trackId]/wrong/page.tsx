import FeedbackScreen from '../FeedbackScreen';
import { requireUser } from '@/utils/auth/require-user';

export default async function WrongPage() {
  await requireUser();

  return <FeedbackScreen variant="wrong" />;
}
