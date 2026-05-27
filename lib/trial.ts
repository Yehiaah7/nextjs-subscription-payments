export const getTrialDaysLeft = (trialDaysLeft: number) =>
  Math.max(0, Math.round(trialDaysLeft));

export const getProTrialRemainingCopy = (trialDaysLeft: number) => {
  const daysLeft = getTrialDaysLeft(trialDaysLeft);

  if (daysLeft <= 0) {
    return 'Trial ended';
  }

  const dayLabel = daysLeft === 1 ? 'day' : 'days';
  return `${daysLeft} ${dayLabel} remaining in your Pro trial`;
};
