import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function requireUser() {
  const supabase = createClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }

    return user;
  } catch {
    redirect('/login');
  }
}
