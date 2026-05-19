import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const DEFAULT_REDIRECT = '/dashboard';
const CALLBACK_ERROR_REDIRECT = '/login?error=auth_callback_failed';

function getSafeRedirectPath(candidate: string | null) {
  if (!candidate) return DEFAULT_REDIRECT;
  if (!candidate.startsWith('/')) return DEFAULT_REDIRECT;
  if (candidate.startsWith('//')) return DEFAULT_REDIRECT;
  return candidate;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeRedirectPath(requestUrl.searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(
      new URL(CALLBACK_ERROR_REDIRECT, requestUrl.origin)
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(CALLBACK_ERROR_REDIRECT, requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
