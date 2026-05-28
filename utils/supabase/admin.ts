import { toDateTime } from '@/utils/helpers';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database, Tables, TablesInsert } from 'types_db';

type Product = Tables<'products'>;
type Price = Tables<'prices'>;

// Change to control trial period length
const TRIAL_PERIOD_DAYS = 0;

export const createSupabaseAdminClient = () => {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      'Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.'
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY.');
  }

  // Note: this client uses the SERVICE_ROLE_KEY and must only be used server-side.
  // It has admin privileges and bypasses RLS policies.
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

const upsertProductRecord = async (product: Stripe.Product) => {
  const supabaseAdmin = createSupabaseAdminClient();

  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { error: upsertError } = await supabaseAdmin
    .from('products')
    .upsert([productData]);

  if (upsertError) {
    throw new Error(`Product insert/update failed: ${upsertError.message}`);
  }

  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3
) => {
  const supabaseAdmin = createSupabaseAdminClient();

  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS
  };

  const { error: upsertError } = await supabaseAdmin
    .from('prices')
    .upsert([priceData]);

  if (upsertError?.message.includes('foreign key constraint')) {
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
      return;
    }

    throw new Error(
      `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
    );
  }

  if (upsertError) {
    throw new Error(`Price insert/update failed: ${upsertError.message}`);
  }

  console.log(`Price inserted/updated: ${price.id}`);
};

const deleteProductRecord = async (product: Stripe.Product) => {
  const supabaseAdmin = createSupabaseAdminClient();

  const { error: deletionError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', product.id);

  if (deletionError) {
    throw new Error(`Product deletion failed: ${deletionError.message}`);
  }

  console.log(`Product deleted: ${product.id}`);
};

const deletePriceRecord = async (price: Stripe.Price) => {
  const supabaseAdmin = createSupabaseAdminClient();

  const { error: deletionError } = await supabaseAdmin
    .from('prices')
    .delete()
    .eq('id', price.id);

  if (deletionError) {
    throw new Error(`Price deletion failed: ${deletionError.message}`);
  }

  console.log(`Price deleted: ${price.id}`);
};

const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
  const supabaseAdmin = createSupabaseAdminClient();

  const { error: upsertError } = await supabaseAdmin
    .from('customers')
    .upsert([{ id: uuid, stripe_customer_id: customerId }]);

  if (upsertError) {
    throw new Error(
      `Supabase customer record creation failed: ${upsertError.message}`
    );
  }

  return customerId;
};

const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = {
    metadata: {
      supabaseUUID: uuid
    },
    email
  };

  const newCustomer = await stripe.customers.create(customerData);

  if (!newCustomer) {
    throw new Error('Stripe customer creation failed.');
  }

  return newCustomer.id;
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: existingSupabaseCustomer, error: queryError } =
    await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', uuid)
      .maybeSingle();

  if (queryError) {
    throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
  }

  let stripeCustomerId: string | undefined;

  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id
    );

    stripeCustomerId = existingStripeCustomer.id;
  } else {
    const stripeCustomers = await stripe.customers.list({ email });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email);

  if (!stripeIdToInsert) {
    throw new Error('Stripe customer creation failed.');
  }

  if (existingSupabaseCustomer && stripeCustomerId) {
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      const { error: updateError } = await supabaseAdmin
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', uuid);

      if (updateError) {
        throw new Error(
          `Supabase customer record update failed: ${updateError.message}`
        );
      }

      console.warn(
        'Supabase customer record mismatched Stripe ID. Supabase record updated.'
      );
    }

    return stripeCustomerId;
  }

  console.warn('Supabase customer record was missing. A new record was created.');

  const upsertedStripeCustomer = await upsertCustomerToSupabase(
    uuid,
    stripeIdToInsert
  );

  if (!upsertedStripeCustomer) {
    throw new Error('Supabase customer record creation failed.');
  }

  return upsertedStripeCustomer;
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  paymentMethod: Stripe.PaymentMethod
) => {
  const supabaseAdmin = createSupabaseAdminClient();

  const customer = paymentMethod.customer as string;
  const { name, phone, address } = paymentMethod.billing_details;

  if (!name || !phone || !address) {
    return;
  }

  await stripe.customers.update(customer, {
    name,
    phone,
    address
  });

  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...paymentMethod[paymentMethod.type] }
    })
    .eq('id', uuid);

  if (updateError) {
    throw new Error(`Customer update failed: ${updateError.message}`);
  }
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (noCustomerError) {
    throw new Error(`Customer lookup failed: ${noCustomerError.message}`);
  }

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });

  const subscriptionData: TablesInsert<'subscriptions'> = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null
  };

  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert([subscriptionData]);

  if (upsertError) {
    throw new Error(
      `Subscription insert/update failed: ${upsertError.message}`
    );
  }

  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
  );

  if (createAction && subscription.default_payment_method && uuid) {
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
  }
};

export {
  upsertProductRecord,
  upsertPriceRecord,
  deleteProductRecord,
  deletePriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange
};
