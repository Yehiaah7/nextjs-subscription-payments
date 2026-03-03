import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { login } from '@/app/auth/actions';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function LoginPage({
  searchParams
}: {
  searchParams: { error?: string; message?: string };
}) {
  const supabase = createClient();
  let user = null;

  try {
    const {
      data: { user: authUser }
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    user = null;
  }

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="w-full max-w-lg p-3 m-auto">
        <Card title="Log in" description="Sign in with your email and password.">
          <form action={login} className="grid gap-3 mt-6">
            <input
              name="email"
              type="email"
              required
              placeholder="name@example.com"
              className="w-full p-3 rounded-md bg-zinc-800"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              className="w-full p-3 rounded-md bg-zinc-800"
            />
            <Button type="submit" variant="slim" className="mt-2">
              Log in
            </Button>
          </form>
          {searchParams.error && (
            <p className="mt-3 text-sm text-red-400">{searchParams.error}</p>
          )}
          {searchParams.message && (
            <p className="mt-3 text-sm text-emerald-400">{searchParams.message}</p>
          )}
          <p className="mt-4 text-sm text-zinc-300">
            Need an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
