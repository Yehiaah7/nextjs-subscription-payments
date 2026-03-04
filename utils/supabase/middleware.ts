import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const createClient = (request: NextRequest) => {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(
            ({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
              request.cookies.set(name, value)
          );

          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });

          cookiesToSet.forEach(
            ({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
              response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  return { supabase, response };
};

export const updateSession = async (request: NextRequest) => {
  try {
    const { supabase, response } = createClient(request);

    await supabase.auth.getUser();

    return response;
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
