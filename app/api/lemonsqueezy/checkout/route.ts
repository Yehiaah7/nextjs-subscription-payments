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

type LemonSqueezyCheckoutEnv = {
  apiKey: string;
  storeId: string;
  variantId: string;
  siteUrl: string;
};

function readCheckoutEnv():
  | { env: LemonSqueezyCheckoutEnv; error?: never }
  | { env?: never; error: string } {
  const requiredEnv = {
    apiKey: 'LEMONSQUEEZY_API_KEY',
    storeId: 'LEMONSQUEEZY_STORE_ID',
    variantId: 'LEMONSQUEEZY_PRO_VARIANT_ID',
    siteUrl: 'NEXT_PUBLIC_SITE_URL'
  } as const;

  const missing = Object.values(requiredEnv).filter(
    (name) => !process.env[name]
  );

  if (missing.length > 0) {
    return {
      error: `Missing Lemon Squeezy checkout configuration: ${missing.join(', ')}.`
    };
  }

  return {
    env: {
      apiKey: process.env[requiredEnv.apiKey]!,
      storeId: process.env[requiredEnv.storeId]!,
      variantId: process.env[requiredEnv.variantId]!,
      siteUrl: process.env[requiredEnv.siteUrl]!
    }
  };
}

export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checkoutEnv = readCheckoutEnv();

  if (!checkoutEnv.env) {
    return NextResponse.json({ error: checkoutEnv.error }, { status: 500 });
  }

  const { apiKey, storeId, variantId, siteUrl } = checkoutEnv.env;

  try {
    const checkout = await lemonSqueezyRequest<LemonSqueezyCheckoutResponse>(
      '/checkouts',
      {
        apiKey,
        method: 'POST',
        body: {
          data: {
            type: 'checkouts',
            attributes: {
              product_options: {
                redirect_url: new URL('/', siteUrl).toString(),
                receipt_button_text: 'Go to Product Gym'
              },
              checkout_data: {
                email: user.email ?? undefined,
                custom: {
                  user_id: user.id,
                  email: user.email ?? undefined
                }
              },
              checkout_options: {
                embed: false
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
      { error: 'Unable to create Lemon Squeezy checkout. Please try again.' },
      { status: 500 }
    );
  }
}
