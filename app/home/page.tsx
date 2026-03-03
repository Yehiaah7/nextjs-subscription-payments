import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import HomeScreen from './HomeScreen';

export default async function HomePage() {
  const supabase = createClient();

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }

  return <HomeScreen />;
}
