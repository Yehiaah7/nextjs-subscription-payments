import QuizScreen from './QuizScreen';

type QuizPageProps = {
  params: {
    id: string;
  };
};

export default function QuizPage({ params }: QuizPageProps) {
  return <QuizScreen challengeId={params.id} />;
}
