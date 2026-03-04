import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const callbackUrl = new URL('/auth/callback', requestUrl.origin);

  requestUrl.searchParams.forEach((value, key) => {
    callbackUrl.searchParams.set(key, value);
  });

  if (!callbackUrl.searchParams.get('next')) {
    callbackUrl.searchParams.set('next', '/reset-password');
  }

  return NextResponse.redirect(callbackUrl.toString());
}
