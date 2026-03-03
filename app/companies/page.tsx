import { createClient } from '@/utils/supabase/server';
import { createUntypedClient } from '@/utils/supabase/untyped';
import { redirect } from 'next/navigation';
import CompaniesScreen, { CompanyTrack } from './CompaniesScreen';

export default async function CompaniesPage() {
  const supabase = createClient();
  const db = createUntypedClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data } = await db
    .from('tracks' as any)
    .select('id,title')
    .eq('type', 'company')
    .eq('is_published', true)
    .order('title', { ascending: true });

  const companyTracks = (
    (data ?? []) as Array<{ id: string; title: string }>
  ).map(
    (track): CompanyTrack => ({
      id: track.id,
      title: track.title,
      focus: 'Metrics • Product Sense',
      challengesCount: 12,
      practicingCount: '1.2K',
      progress: 45
    })
  );

  return <CompaniesScreen companyTracks={companyTracks} />;
}
