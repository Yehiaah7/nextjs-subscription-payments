import FeedbackScreen from '../FeedbackScreen';

type CorrectPageProps = {
  params: {
    id: string;
  };
};

export default function CorrectPage({ params }: CorrectPageProps) {
  return <FeedbackScreen challengeId={params.id} variant="correct" />;
}
