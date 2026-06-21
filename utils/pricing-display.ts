const PRODUCT_GYM_MONTHLY_PRICE_CENTS = 700;
const LEGACY_PRODUCT_GYM_MONTHLY_PRICE_CENTS = 1200;
const OLDEST_PRODUCT_GYM_MONTHLY_PRICE_CENTS = 2000;

export const PRODUCT_GYM_MONTHLY_PRICE_LABEL = '$7/month';

export function formatProductGymDisplayPrice({
  currency,
  interval,
  unitAmount
}: {
  currency: string | null | undefined;
  interval: string | null | undefined;
  unitAmount: number | null | undefined;
}) {
  const displayUnitAmount =
    currency?.toLowerCase() === 'usd' &&
    interval === 'month' &&
    (unitAmount === LEGACY_PRODUCT_GYM_MONTHLY_PRICE_CENTS ||
      unitAmount === OLDEST_PRODUCT_GYM_MONTHLY_PRICE_CENTS)
      ? PRODUCT_GYM_MONTHLY_PRICE_CENTS
      : (unitAmount ?? 0);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency!,
    minimumFractionDigits: 0
  }).format(displayUnitAmount / 100);
}
