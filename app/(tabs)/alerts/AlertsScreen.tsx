'use client';

import MobileScreen from '@/components/mobile/MobileScreen';

const alerts = [
  {
    title: 'New Company Mock',
    message: 'A new Tesla product strategy challenge is now available.',
    time: 'Just now'
  },
  {
    title: 'Weekly Rank Updated',
    message: 'You moved up to #12 on the leaderboard this week.',
    time: '2h ago'
  },
  {
    title: 'Subscription Reminder',
    message: 'Your Pro Gym Pass trial ends in 7 days.',
    time: 'Today'
  }
];

export default function AlertsScreen() {
  return (
    <MobileScreen>
      <section className="mx-auto w-full max-w-[361px]">
        <header className="mb-4">
          <h1 className="text-[var(--alerts-title-size)] font-bold leading-[1.4] tracking-[var(--alerts-title-track)] text-[var(--alerts-title-color)]">Alerts</h1>
        </header>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <article key={alert.title} className="h-[82px] w-full rounded-[var(--alerts-card-radius)] border border-[var(--alerts-card-stroke)] bg-[var(--alerts-card-bg)] p-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-[14px] font-bold tracking-[-0.35px] text-[var(--alerts-heading-color)]">{alert.title}</h2>
                <p className="shrink-0 text-[10px] font-bold text-[var(--alerts-time-color)]">{alert.time}</p>
              </div>
              <p className="mt-2 line-clamp-2 text-[12px] font-medium leading-[1.35] text-[var(--alerts-body-color)]">{alert.message}</p>
            </article>
          ))}
        </div>
      </section>
    </MobileScreen>
  );
}
