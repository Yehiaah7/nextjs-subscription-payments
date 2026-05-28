import { NextResponse } from 'next/server';
import { lemonSqueezyRequest } from '@/utils/lemonsqueezy/client';
import { createClient } from '@/utils/supabase/server';

type LemonSqueezyCheckoutResponse = {
  data?: {
    attributes?: {
      url?: string;
    };
  };
};

function getRequiredServerEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function getCheckoutRedirectUrl(request: Request) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const fallbackOrigin = request.headers.get('origin');
  const baseUrl = configuredSiteUrl || fallbackOrigin;

  if (!baseUrl || !baseUrl.startsWith('http')) {
    throw new Error(
      'Missing NEXT_PUBLIC_SITE_URL and could not infer a safe request origin.'
    );
  }

  return new URL('/profile?checkout=success', baseUrl).toString();
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const storeId = getRequiredServerEnv('LEMONSQUEEZY_STORE_ID');
    const variantId = getRequiredServerEnv('LEMONSQUEEZY_PRO_VARIANT_ID');
    const redirectUrl = getCheckoutRedirectUrl(request);

    const checkout = await lemonSqueezyRequest<LemonSqueezyCheckoutResponse>(
      '/checkouts',
      {
        method: 'POST',
        body: {
          data: {
            type: 'checkouts',
            attributes: {
              product_options: {
                redirect_url: redirectUrl
              },
              checkout_data: {
                email: user.email ?? undefined,
                custom: {
                  user_id: user.id,
                  email: user.email ?? undefined
                }
              }
            },
            relationships: {
              store: {
                data: {
                  type: 'stores',
                  id: storeId
                }
              },
              variant: {
                data: {
                  type: 'variants',
                  id: variantId
                }
              }
            }
          }
        }
      }
    );

    const checkoutUrl = checkout.data?.attributes?.url;

    if (!checkoutUrl) {
      throw new Error('Lemon Squeezy did not return a checkout URL.');
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Lemon Squeezy checkout failed:', error);
    return NextResponse.json(
      { error: 'Unable to create checkout. Please try again.' },
      { status: 500 }
    );
  }
}
