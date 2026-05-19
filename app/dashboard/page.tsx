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

  redirect('/home');
}
