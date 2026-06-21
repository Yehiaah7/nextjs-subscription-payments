export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/service-role';

type LemonSqueezyWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
      email?: string;
      [key: string]: unknown;
    };
  };
  data?: {
    id?: string;
    type?: string;
    attributes?: Record<string, any>;
    relationships?: Record<string, any>;
  };
};

const handledEvents = new Set([
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_resumed',
  'subscription_expired',
  'subscription_paused',
  'subscription_unpaused',
  'subscription_payment_success',
  'subscription_payment_failed'
]);

function verifySignature(rawBody: string, signature: string | null) {
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!webhookSecret || !signature) {
    return false;
  }

  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const signatureBuffer = Buffer.from(signature.trim(), 'hex');

    return (
      expectedBuffer.length === signatureBuffer.length &&
      timingSafeEqual(expectedBuffer, signatureBuffer)
    );
  } catch {
    return false;
  }
}

function normalizeDate(value: unknown) {
  if (typeof value !== 'string' || !value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
}

function getRelationshipId(payload: LemonSqueezyWebhookPayload, name: string) {
  return payload.data?.relationships?.[name]?.data?.id ?? null;
}

function getSubscriptionId(payload: LemonSqueezyWebhookPayload) {
  const attributes = payload.data?.attributes ?? {};

  return (
    (payload.data?.type === 'subscriptions' ? payload.data?.id : null) ??
    attributes.subscription_id ??
    getRelationshipId(payload, 'subscription')
  );
}

function getEventName(
  payload: LemonSqueezyWebhookPayload,
  headers: Headers
): string | null {
  return (
    payload.meta?.event_name ??
    headers.get('x-event-name') ??
    headers.get('x-lemonsqueezy-event-name') ??
    headers.get('x-lemon-squeezy-event-name')
  );
}

function getSubscriptionRecord(
  payload: LemonSqueezyWebhookPayload,
  eventName: string,
  userId: string
) {
  const attributes = payload.data?.attributes ?? {};
  const subscriptionId = getSubscriptionId(payload);

  if (!subscriptionId) {
    throw new Error(`Missing Lemon Squeezy subscription id for ${eventName}.`);
  }

  const fallbackStatusByEvent: Record<string, string> = {
    subscription_cancelled: 'cancelled',
    subscription_expired: 'expired',
    subscription_paused: 'paused',
    subscription_payment_failed: 'past_due',
    subscription_payment_success: 'active',
    subscription_resumed: 'active',
    subscription_unpaused: 'active'
  };
  const status =
    typeof attributes.status === 'string'
      ? attributes.status
      : (fallbackStatusByEvent[eventName] ?? 'unknown');

  return {
    user_id: userId,
    lemon_squeezy_subscription_id: String(subscriptionId),
    lemon_squeezy_customer_id: attributes.customer_id
      ? String(attributes.customer_id)
      : getRelationshipId(payload, 'customer'),
    lemon_squeezy_order_id: attributes.order_id
      ? String(attributes.order_id)
      : null,
    lemon_squeezy_product_id: attributes.product_id
      ? String(attributes.product_id)
      : getRelationshipId(payload, 'product'),
    lemon_squeezy_variant_id: attributes.variant_id
      ? String(attributes.variant_id)
      : getRelationshipId(payload, 'variant'),
    status,
    trial_ends_at: normalizeDate(attributes.trial_ends_at),
    renews_at: normalizeDate(attributes.renews_at),
    ends_at: normalizeDate(attributes.ends_at),
    cancelled:
      typeof attributes.cancelled === 'boolean'
        ? attributes.cancelled
        : eventName === 'subscription_cancelled' ||
          eventName === 'subscription_expired',
    raw_payload: payload,
    updated_at: new Date().toISOString()
  };
}

async function getUserIdForSubscription(
  payload: LemonSqueezyWebhookPayload,
  subscriptionId: string | null
) {
  const customUserId = payload.meta?.custom_data?.user_id;

  if (customUserId) {
    return customUserId;
  }

  if (!subscriptionId) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase as any)
    .from('lemonsqueezy_subscriptions')
    .select('user_id')
    .eq('lemon_squeezy_subscription_id', subscriptionId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Lemon Squeezy subscription lookup failed: ${error.message}`
    );
  }

  return data?.user_id ?? null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');

  if (!verifySignature(rawBody, signature)) {
    return new Response('Invalid Lemon Squeezy webhook signature.', {
      status: 400
    });
  }

  let payload: LemonSqueezyWebhookPayload;

  try {
    payload = JSON.parse(rawBody) as LemonSqueezyWebhookPayload;
  } catch {
    return new Response('Invalid Lemon Squeezy webhook payload.', {
      status: 400
    });
  }

  const eventName = getEventName(payload, request.headers);

  if (!eventName || !handledEvents.has(eventName)) {
    console.log('Lemon Squeezy webhook ignored:', {
      eventName: eventName ?? 'unknown'
    });
    return NextResponse.json({ received: true, ignored: true });
  }

  try {
    const subscriptionId = getSubscriptionId(payload);
    if (!subscriptionId) {
      console.warn('Lemon Squeezy webhook missing subscription id:', {
        eventName
      });
      return NextResponse.json({ received: true, ignored: true });
    }

    const userId = await getUserIdForSubscription(
      payload,
      String(subscriptionId)
    );

    if (!userId) {
      console.warn('Lemon Squeezy webhook missing Supabase user id:', {
        eventName,
        subscriptionId: String(subscriptionId)
      });
      return NextResponse.json({ received: true, ignored: true });
    }

    const subscriptionRecord = getSubscriptionRecord(
      payload,
      eventName,
      userId
    );
    const supabase = createAdminClient();
    const { error } = await (supabase as any)
      .from('lemonsqueezy_subscriptions')
      .upsert(subscriptionRecord, {
        onConflict: 'lemon_squeezy_subscription_id'
      });

    if (error) {
      throw new Error(
        `Lemon Squeezy subscription upsert failed: ${error.message}`
      );
    }

    console.log('Lemon Squeezy webhook handled:', {
      eventName,
      subscriptionId: subscriptionRecord.lemon_squeezy_subscription_id,
      userId,
      status: subscriptionRecord.status
    });
  } catch (error) {
    console.error('Lemon Squeezy webhook handler failed:', error);
    return new Response('Lemon Squeezy webhook handler failed.', {
      status: 400
    });
  }

  return NextResponse.json({ received: true });
}
