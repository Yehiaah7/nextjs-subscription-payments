import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/home';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const metadata = user.user_metadata ?? {};
      const fullName = metadata.full_name ?? metadata.name ?? null;
      const avatarUrl = metadata.avatar_url ?? metadata.picture ?? null;
      const firstName = metadata.given_name ?? null;
      const lastName = metadata.family_name ?? null;

      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: user.id,
          name: fullName,
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl
        },
        {
          onConflict: 'id'
        }
      );

      if (profileError) {
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent(
            profileError.message
          )}`
        );
      }
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
