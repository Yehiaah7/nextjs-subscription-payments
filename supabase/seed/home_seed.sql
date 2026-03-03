-- Seed content for the /home page tabs.
-- Inserts published company + skill tracks and sample modules.

insert into public.tracks (id, title, type, description, is_published)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Google',
    'company',
    'Focus: Metrics • Product Sense',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Amazon',
    'company',
    'Focus: Customer Obsession • Prioritization',
    true
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Discovery Fundamentals',
    'skill',
    'Learn to identify root causes and define testable hypotheses.',
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Strategy Essentials',
    'skill',
    'Strengthen product strategy and decision-making skills.',
    true
  )
on conflict (id) do update
set
  title = excluded.title,
  type = excluded.type,
  description = excluded.description,
  is_published = excluded.is_published;

insert into public.modules (track_id, title, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'North Star Metric Tradeoffs', 1),
  ('11111111-1111-1111-1111-111111111111', 'Checkout Drop-off Investigation', 2),
  ('22222222-2222-2222-2222-222222222222', 'Launch Readiness Drill', 1),
  ('33333333-3333-3333-3333-333333333333', 'Problem Framing Basics', 1),
  ('33333333-3333-3333-3333-333333333333', 'Interview Plan Design', 2),
  ('44444444-4444-4444-4444-444444444444', 'Opportunity Sizing', 1)
on conflict do nothing;
