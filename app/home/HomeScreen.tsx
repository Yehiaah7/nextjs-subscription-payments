'use client';

import {
  Bell,
  Briefcase,
  CircleDot,
  Clock3,
  Flame,
  Gauge,
  Home,
  Medal,
  Target,
  Trophy,
  User,
  Users,
  Zap
} from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';

type MainTab = 'companies' | 'skill-paths' | 'products';
type SkillFilter = 'discovery' | 'strategy' | 'execution';

const interviewChallenges = [1, 2, 3].map((item) => ({
  id: item,
  company: 'Google',
  focus: 'Focus: Metrics • Product Sense',
  challenges: '12 CHALLENGES',
  practicing: '1.2K PRACTICING',
  progress: 45
}));

const skillPathRows = [
  'Why is user retention dropping in the checkout flow?',
  'Mastering User Interview Techniques',
  'How to validate the "Social Proof" hypothesis for Gen Z?',
  'Quantitative Data Analysis Skills'
].map((title, index) => ({
  id: index + 1,
  title,
  practicing: '60 PRACTICING',
  duration: '3-5 MINS'
}));

export default function HomeScreen() {
  const [tab, setTab] = useState<MainTab>('companies');
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('discovery');

  useEffect(() => {
    document.body.classList.add('home-page');

    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);
  const skillHeading = useMemo(() => {
    if (skillFilter === 'strategy') return 'Strategy Challenges';
    if (skillFilter === 'execution') return 'Execution Challenges';
    return 'Discovery Challenges';
  }, [skillFilter]);

  return (
    <section className="bg-[#e9edf3] text-[#1f2937]">
      <div className="mx-auto min-h-dvh w-full max-w-[590px] px-4 pt-10">
        <header className="mb-6 flex items-start justify-between">
          <h1 className="text-[48px] font-bold leading-[1.1] tracking-[-0.02em] text-[#111827]">
            Product Gym Floor
          </h1>
          <div className="pt-2 text-right">
            <p className="text-xs font-bold tracking-[0.12em] text-[#3b82f6]">
              STREAK ⓘ
            </p>
            <p className="flex items-center justify-end gap-1 text-[34px] font-bold leading-none text-[#f97316]">
              <Flame className="h-7 w-7 fill-current" />
              12 Days
            </p>
          </div>
        </header>

        <div className="mb-5 rounded-3xl bg-white px-5 py-4 shadow-[0_1px_0_rgba(17,24,39,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xl font-bold uppercase tracking-[0.08em] text-[#2563eb]">
                FREE TRIAL ACTIVE
              </p>
              <p className="text-2xl font-semibold text-[#64748b]">
                7 days remaining in your Pro trial
              </p>
            </div>
            <button className="rounded-full bg-[#ffbf00] px-5 py-2 text-xl font-bold uppercase tracking-[0.04em] text-[#111827]">
              Upgrade
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-3xl bg-[#cfe0ff] p-5">
          <div className="mb-4 flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1546525848-3ce03ca516f6?auto=format&fit=crop&w=120&q=80"
              alt="Ahmed Yehia avatar"
              className="h-11 w-11 rounded-full object-cover"
            />
            <div>
              <p className="text-4xl font-bold text-[#1e293b]">Ahmed Yehia</p>
              <p className="text-xl font-bold uppercase tracking-[0.08em] text-[#2563eb]">
                PRODUCT GYM MEMBER
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              icon={<Trophy className="h-4 w-4 text-[#f59e0b]" />}
              label="Rank"
              value="#12"
            />
            <StatBox
              icon={<Target className="h-4 w-4 text-[#10b981]" />}
              label="Solved"
              value="42"
            />
            <StatBox
              icon={<Briefcase className="h-4 w-4 text-[#f97316]" />}
              label="Solving Days"
              value="32"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 text-[42px] font-bold leading-tight text-[#111827]">
          <span>Practice</span>
          <button className="flex items-center text-[#2563eb]">JUNIOR⌄</button>
          <span>PM skills with:</span>
        </div>

        <div className="mb-4 grid grid-cols-3 rounded-full bg-[#dce3ec] p-1 text-center">
          <TabButton
            label="Companies"
            active={tab === 'companies'}
            onClick={() => setTab('companies')}
          />
          <TabButton
            label="Skill Paths"
            active={tab === 'skill-paths'}
            onClick={() => setTab('skill-paths')}
          />
          <TabButton
            label="Products"
            active={tab === 'products'}
            onClick={() => setTab('products')}
          />
        </div>

        {tab === 'companies' && (
          <div className="space-y-4 pb-28">
            <SectionTitle title="Mock Interview Challenges" />
            {interviewChallenges.map((challenge) => (
              <article key={challenge.id} className="rounded-3xl bg-white p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f1f5f9] font-bold text-[#4285f4]">
                    G
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold leading-none text-[#1e293b]">
                      {challenge.company}
                    </h3>
                    <p className="mt-1 text-2xl font-medium text-[#64748b]">
                      {challenge.focus}
                    </p>
                    <div className="mt-1 flex items-center gap-4 text-xl font-bold text-[#94a3b8]">
                      <span className="flex items-center gap-1">
                        <CircleDot className="h-4 w-4" />
                        {challenge.challenges}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {challenge.practicing}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-[#e5e7eb]">
                    <div
                      className="h-2 rounded-full bg-[#2563eb]"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                  <span className="text-xl font-bold text-[#94a3b8]">45%</span>
                  <button className="text-xl font-bold uppercase tracking-[0.06em] text-[#2563eb]">
                    Resume
                  </button>
                  <button className="grid h-7 w-7 place-items-center rounded-full bg-[#eaf1ff] text-[#2563eb]">
                    ›
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {tab === 'skill-paths' && (
          <div className="pb-28">
            <div className="mb-3 grid grid-cols-3 gap-2">
              <FilterButton
                icon={<Gauge className="h-4 w-4" />}
                label="Discovery"
                active={skillFilter === 'discovery'}
                onClick={() => setSkillFilter('discovery')}
              />
              <FilterButton
                icon={<Medal className="h-4 w-4" />}
                label="Strategy"
                active={skillFilter === 'strategy'}
                onClick={() => setSkillFilter('strategy')}
              />
              <FilterButton
                icon={<Zap className="h-4 w-4" />}
                label="Execution"
                active={skillFilter === 'execution'}
                onClick={() => setSkillFilter('execution')}
              />
            </div>
            <SectionTitle title={skillHeading} />
            <div className="mt-3 space-y-3">
              {skillPathRows.map((row) => (
                <article key={row.id} className="rounded-3xl bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[38px] font-bold leading-tight text-[#1e293b]">
                      {row.title}
                    </h3>
                    <button className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f1f5f9] text-[#cbd5e1]">
                      ›
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xl font-bold text-[#94a3b8]">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {row.practicing}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {row.duration}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="pb-28">
            <SectionTitle title="Products" />
            <div className="mt-3 rounded-3xl bg-white p-7 text-center">
              <p className="text-5xl font-bold text-[#1e293b]">Coming Soon</p>
              <p className="mt-2 text-2xl font-medium text-[#94a3b8]">
                Product-specific challenge tracks are on the way.
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto grid w-full max-w-[590px] grid-cols-4 border-t border-[#e2e8f0] px-6 py-3">
          <BottomItem icon={<Home className="h-6 w-6" />} label="Home" active />
          <BottomItem
            icon={<Trophy className="h-6 w-6" />}
            label="Leaderboard"
          />
          <BottomItem icon={<Bell className="h-6 w-6" />} label="Alerts" />
          <BottomItem icon={<User className="h-6 w-6" />} label="Profile" />
        </div>
      </nav>
    </section>
  );
}

function StatBox({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#edf2f8] p-3 text-center">
      <div className="mb-1 flex justify-center">{icon}</div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
        {label}
      </p>
      <p className="text-4xl font-bold text-[#1e293b]">{value}</p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-[40px] font-bold text-[#111827]">{title}</h2>
      <button className="text-xl font-bold uppercase tracking-[0.08em] text-[#2563eb]">
        View all
      </button>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-2 py-2 text-lg font-bold uppercase tracking-[0.08em] ${
        active ? 'bg-white text-[#2563eb]' : 'text-[#64748b]'
      }`}
    >
      {label}
    </button>
  );
}

function FilterButton({
  icon,
  label,
  active,
  onClick
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1 rounded-full px-2 py-2 text-lg font-bold uppercase tracking-[0.08em] ${
        active ? 'bg-[#2563eb] text-white' : 'bg-[#edf2f7] text-[#64748b]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function BottomItem({
  icon,
  label,
  active = false
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1 ${active ? 'text-[#2563eb]' : 'text-[#94a3b8]'}`}
    >
      {icon}
      <span className="text-xs font-bold uppercase tracking-[0.08em]">
        {label}
      </span>
    </button>
  );
}
