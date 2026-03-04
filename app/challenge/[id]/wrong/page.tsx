import FeedbackScreen from '../FeedbackScreen';

type WrongPageProps = {
  params: {
    id: string;
  };
};

export default function WrongPage({ params }: WrongPageProps) {
  return <FeedbackScreen challengeId={params.id} variant="wrong" />;
}
