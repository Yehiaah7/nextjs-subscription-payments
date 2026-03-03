import FeedbackScreen from '../FeedbackScreen';

type CorrectPageProps = {
  params: {
    trackId: string;
    id: string;
  };
};

export default function CorrectPage({ params }: CorrectPageProps) {
  return <FeedbackScreen trackId={params.trackId} challengeId={params.id} variant="correct" />;
}
