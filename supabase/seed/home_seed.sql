-- Seed content for the /home page tabs.
-- Inserts published company + skill tracks and sample modules.

insert into public.tracks (id, title, type, description, is_published, seniority)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Google',
    'company',
    'Focus: Metrics • Product Sense',
    true,
    'junior'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Amazon',
    'company',
    'Focus: Customer Obsession • Prioritization',
    true,
    'mid'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Discovery Fundamentals',
    'skill',
    'Learn to identify root causes and define testable hypotheses.',
    true,
    null
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Strategy Essentials',
    'skill',
    'Strengthen product strategy and decision-making skills.',
    true,
    null
  )
on conflict (id) do update
set
  title = excluded.title,
  type = excluded.type,
  description = excluded.description,
  is_published = excluded.is_published,
  seniority = excluded.seniority;

insert into public.modules (track_id, title, sort_order)
values
  ('11111111-1111-1111-1111-111111111111', 'North Star Metric Tradeoffs', 1),
  ('11111111-1111-1111-1111-111111111111', 'Checkout Drop-off Investigation', 2),
  ('22222222-2222-2222-2222-222222222222', 'Launch Readiness Drill', 1),
  ('33333333-3333-3333-3333-333333333333', 'Problem Framing Basics', 1),
  ('33333333-3333-3333-3333-333333333333', 'Interview Plan Design', 2),
  ('44444444-4444-4444-4444-444444444444', 'Opportunity Sizing', 1)
on conflict do nothing;

insert into public.skill_path_categories (key, title, sort_order)
values
  ('discovery', 'Discovery', 1),
  ('strategy', 'Strategy', 2),
  ('execution', 'Execution', 3),
  ('metrics', 'Metrics', 4),
  ('frameworks', 'Frameworks', 5)
on conflict (key) do update
set
  title = excluded.title,
  sort_order = excluded.sort_order;

with challenge_seed (category_key, title, practicing_count, duration_min, duration_max) as (
  values
    ('discovery', 'Write interview goals that uncover the root problem', 60, 3, 5),
    ('discovery', 'Map assumptions before customer conversations', 42, 4, 6),
    ('discovery', 'Draft a hypothesis tree for activation drop-offs', 78, 5, 7),
    ('discovery', 'Design an exploratory interview script for churn', 51, 4, 6),
    ('discovery', 'Cluster insights into jobs-to-be-done themes', 66, 3, 5),
    ('strategy', 'Prioritize opportunities with impact vs effort scoring', 73, 4, 6),
    ('strategy', 'Choose a growth wedge for a saturated market', 58, 5, 8),
    ('strategy', 'Set strategic guardrails for roadmap tradeoffs', 49, 3, 5),
    ('strategy', 'Define success criteria for a new market bet', 64, 4, 7),
    ('strategy', 'Stress-test a product vision with leadership concerns', 39, 5, 7),
    ('execution', 'Break strategy into milestones and owner decisions', 81, 4, 6),
    ('execution', 'Write launch readiness checks for cross-functional teams', 56, 3, 5),
    ('execution', 'Plan experiment sequencing for faster learning', 67, 4, 6),
    ('execution', 'Diagnose delivery risk using dependency mapping', 48, 5, 7),
    ('execution', 'Run a retrospective that converts into action items', 53, 4, 6),
    ('metrics', 'Pick a north star metric and supporting diagnostics', 91, 4, 7),
    ('metrics', 'Interpret retention cohort signals after a release', 62, 3, 5),
    ('metrics', 'Define leading indicators for onboarding quality', 57, 4, 6),
    ('metrics', 'Identify metric tradeoffs across acquisition channels', 46, 5, 8),
    ('metrics', 'Create alert thresholds for sudden funnel regressions', 69, 3, 5),
    ('frameworks', 'Apply RICE to prioritize competing opportunities', 74, 3, 5),
    ('frameworks', 'Use JTBD to reframe feature requests into outcomes', 55, 4, 6),
    ('frameworks', 'Use HEART metrics to evaluate product quality', 47, 4, 7),
    ('frameworks', 'Use SWOT to assess strategic positioning quickly', 44, 3, 5),
    ('frameworks', 'Apply AARRR funnel thinking to growth constraints', 59, 4, 6)
)
insert into public.skill_path_challenges (category_id, title, practicing_count, duration_min, duration_max)
select c.id, s.title, s.practicing_count, s.duration_min, s.duration_max
from challenge_seed s
join public.skill_path_categories c on c.key = s.category_key
on conflict (category_id, title) do update
set
  practicing_count = excluded.practicing_count,
  duration_min = excluded.duration_min,
  duration_max = excluded.duration_max;
