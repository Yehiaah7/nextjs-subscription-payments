import FeedbackScreen from '../FeedbackScreen';

type WrongPageProps = {
  params: {
    trackId: string;
    id: string;
  };
};

export default function WrongPage({ params }: WrongPageProps) {
  return <FeedbackScreen trackId={params.trackId} challengeId={params.id} variant="wrong" />;
}
