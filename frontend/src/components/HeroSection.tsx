'use client';

interface Metric {
  value: string;
  label: string;
}

interface HeroSectionProps {
  onPostJob: () => void;
  onExploreTalent: () => void;
}

const metrics: Metric[] = [
  { value: '$2.4M+', label: 'Total Volume Escrowed' },
  { value: '1,250+', label: 'Active Freelancers' },
  { value: '3,840', label: 'Completed Contracts' },
];

export default function HeroSection({ onPostJob, onExploreTalent }: HeroSectionProps) {
  return (
    <section className="grid grid-cols-1 items-center gap-12 py-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 lg:text-6xl lg:leading-tight">
          The Premier Hub for{' '}
          <span className="text-blue-600">Web3 Talent</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Connect with top-tier developers, designers, and auditors. Escrow funds securely and
          manage your projects with ease.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={onPostJob}
            className="rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            Post a New Job
          </button>
          <button
            onClick={onExploreTalent}
            className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Explore Talent
          </button>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur"
          >
            <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {metric.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
