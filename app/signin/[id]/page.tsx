import { redirect } from 'next/navigation';

export default function SignInAliasWithView({
  params
}: {
  params: { id: string };
}) {
  if (params.id === 'signup') {
    return redirect('/signup');
  }

  return redirect('/login');
}
