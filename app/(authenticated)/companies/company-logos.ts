const COMPANY_LOGO_PATHS = {
  amazon: '/Amazon.svg',
  apple: '/Apple.svg',
  google: '/Google.svg',
  meta: '/Meta.svg',
  microsoft: '/Microsoft.svg',
  netflix: '/Netflix.svg',
  uber: '/Uber.svg'
} as const;

const normalizeCompanyName = (name: string) => name.trim().toLowerCase();

export const getCompanyLogoPath = (companyName: string) =>
  COMPANY_LOGO_PATHS[
    normalizeCompanyName(companyName) as keyof typeof COMPANY_LOGO_PATHS
  ] ?? null;

export const getCompanyInitial = (companyName: string) =>
  companyName.trim().charAt(0).toUpperCase() || '?';
