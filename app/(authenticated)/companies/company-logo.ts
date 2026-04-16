export const COMPANY_LOGO_MAP: Record<string, string> = {
  amazon: '/Amazon.svg',
  apple: '/Apple.svg',
  google: '/Google.svg',
  meta: '/Meta.svg',
  microsoft: '/Microsoft.svg',
  netflix: '/Netflix.svg',
  stripe: '/stripe.svg',
  uber: '/Uber.svg'
};

const normalizeKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');

export const getCompanyLogoSrc = ({
  companyId,
  companyName
}: {
  companyId?: string;
  companyName?: string;
}): string | null => {
  const idKey = companyId ? normalizeKey(companyId) : '';
  const nameKey = companyName ? normalizeKey(companyName) : '';

  if (idKey && COMPANY_LOGO_MAP[idKey]) return COMPANY_LOGO_MAP[idKey];
  if (nameKey && COMPANY_LOGO_MAP[nameKey]) return COMPANY_LOGO_MAP[nameKey];

  const nameParts = nameKey.split('-').filter(Boolean);
  const bestNameMatch = nameParts.find((part) => COMPANY_LOGO_MAP[part]);

  return bestNameMatch ? COMPANY_LOGO_MAP[bestNameMatch] : null;
};
