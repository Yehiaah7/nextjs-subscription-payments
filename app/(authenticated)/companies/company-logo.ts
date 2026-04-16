export const COMPANY_LOGO_MAP: Record<string, string> = {
  amazon: '/Amazon.svg',
  apple: '/Apple.svg',
  google: '/Google.svg',
  meta: '/Meta.svg',
  microsoft: '/Microsoft.svg',
  netflix: '/Netflix.svg',
  uber: '/Uber.svg'
};

export const getCompanyLogoSrc = (companyName: string): string | null => {
  const normalizedName = companyName.trim().toLowerCase();
  return COMPANY_LOGO_MAP[normalizedName] ?? null;
};
