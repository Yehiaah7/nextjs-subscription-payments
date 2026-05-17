export const COMPANY_CHALLENGE_REFRESH_KEY = 'companyChallengeListRefresh';

const createRefreshValue = (companyId: string) =>
  JSON.stringify({ companyId, updatedAt: Date.now() });

export const markCompanyChallengeListStale = (companyId: string | null) => {
  if (!companyId || typeof window === 'undefined') return;

  window.sessionStorage.setItem(
    COMPANY_CHALLENGE_REFRESH_KEY,
    createRefreshValue(companyId)
  );
};

export const consumeCompanyChallengeListRefresh = (companyId: string) => {
  if (typeof window === 'undefined') return false;

  const pendingRefresh = window.sessionStorage.getItem(
    COMPANY_CHALLENGE_REFRESH_KEY
  );
  if (!pendingRefresh) return false;

  try {
    const parsed = JSON.parse(pendingRefresh) as { companyId?: string };
    if (parsed.companyId !== companyId) return false;
  } catch {
    window.sessionStorage.removeItem(COMPANY_CHALLENGE_REFRESH_KEY);
    return false;
  }

  window.sessionStorage.removeItem(COMPANY_CHALLENGE_REFRESH_KEY);
  return true;
};
