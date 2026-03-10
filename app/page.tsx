import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function LandingPage() {
  const supabase = createClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      redirect('/home');
    }
  } catch {
    // fall through to onboarding for anonymous users
  }

  redirect('/onboarding');
}
