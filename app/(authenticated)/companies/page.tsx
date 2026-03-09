import { createClient } from '@/utils/supabase/server';
import { createUntypedClient } from '@/utils/supabase/untyped';
import { redirect } from 'next/navigation';
import CompaniesScreen, { CompanyTrack } from './CompaniesScreen';
import { MOCK_COMPANIES } from './mock-data';

export default async function CompaniesPage() {
  const supabase = createClient();
  const db = createUntypedClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let tracksData: Array<{ id: string; title: string }> = [];

  try {
    const { data, error } = await db
      .from('tracks' as any)
      .select('id,title')
      .eq('type', 'company')
      .eq('is_published', true)
      .order('title', { ascending: true });

    if (!error && Array.isArray(data)) {
      tracksData = data as Array<{ id: string; title: string }>;
    }
  } catch {
    tracksData = [];
  }

  const companyTracks: CompanyTrack[] = tracksData.length
    ? tracksData.map((track, index) => ({
        id: track.id,
        title: track.title,
        focus: MOCK_COMPANIES[index % MOCK_COMPANIES.length].focus,
        challengesCount: MOCK_COMPANIES[index % MOCK_COMPANIES.length].challengesCount,
        practicingCount: MOCK_COMPANIES[index % MOCK_COMPANIES.length].practicingCount,
        progress: MOCK_COMPANIES[index % MOCK_COMPANIES.length].progress
      }))
    : MOCK_COMPANIES.map((company) => ({
        id: company.id,
        title: company.title,
        focus: company.focus,
        challengesCount: company.challengesCount,
        practicingCount: company.practicingCount,
        progress: company.progress
      }));

  return <CompaniesScreen companyTracks={companyTracks} />;
}
