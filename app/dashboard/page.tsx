import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
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

  if (!user) {
    redirect('/login');
  }

  return (
    <section className="max-w-4xl px-4 py-8 mx-auto sm:px-6 sm:pt-20 lg:px-8">
      <Card
        title="Dashboard"
        description="You are logged in. This page is protected by Supabase auth."
      >
        <p className="mt-4 text-zinc-300">Signed in as: {user.email}</p>
        <form action="/logout" method="post" className="mt-6">
          <Button type="submit" variant="slim">
            Log out
          </Button>
        </form>
      </Card>
    </section>
  );
}
