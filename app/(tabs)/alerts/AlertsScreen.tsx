'use client';

import MobileScreen from '@/components/mobile/MobileScreen';

const alerts = [
  {
    title: 'New company challenge unlocked',
    message: 'You can now start the Airbnb mock interview set.',
    time: '2m ago'
  },
  {
    title: 'Weekly leaderboard update',
    message: 'You moved up to #2 this week. Keep your streak going!',
    time: '1h ago'
  },
  {
    title: 'Trial reminder',
    message: 'Your Pro trial has 7 days left. Upgrade any time.',
    time: 'Today'
  }
];

export default function AlertsScreen() {
  return (
    <MobileScreen>
      <header className="mb-5">
        <h1 className="t-title">Alerts</h1>
      </header>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <article key={alert.title} className="app-card">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted">
              {alert.time}
            </p>
            <h2 className="mt-1 text-xl font-bold text-text">
              {alert.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{alert.message}</p>
          </article>
        ))}
      </div>
    </MobileScreen>
  );
}
