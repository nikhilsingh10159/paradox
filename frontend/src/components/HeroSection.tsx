'use client';

interface Metric {
  value: string;
  label: string;
  subtext: string;
  icon: string;
}

interface HeroSectionProps {
  onPostJob: () => void;
  onExploreTalent: () => void;
}

const metrics: Metric[] = [
  { value: '$2.4M+', label: 'Total Volume Escrowed', subtext: 'Secured via YieldEscrow.sol', icon: '🔒' },
  { value: '1,250+', label: 'Verified Builders', subtext: 'Soulbound EIP-5192 reputation', icon: '💎' },
  { value: '3,840', label: 'Completed Contracts', subtext: '0% ghosting rate recorded', icon: '⚡' },
];

export default function HeroSection({ onPostJob, onExploreTalent }: HeroSectionProps) {
  return (
    <section className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur-md shadow-xs mb-6">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
          AI-POWERED FREELANCE ESCROW PLATFORM
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 lg:text-6xl lg:leading-[1.12]">
          The Trustless Hub for{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Web3 Talent
          </span>
        </h1>
        
        <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-600">
          Hire top-tier developers, designers, and auditors. Lock funds in Aave yield-generating smart contracts with objective AI dispute resolution.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={onPostJob}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-slate-900 px-7 py-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-slate-800 hover:shadow-xl active:scale-[0.99]"
          >
            <span>+ Post a New Job</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </button>

          <button
            onClick={onExploreTalent}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-4 text-sm font-bold text-slate-700 shadow-xs transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm active:scale-[0.99]"
          >
            <span>Explore Verified Talent</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 lg:col-span-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm backdrop-blur card-shadow-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-extrabold text-slate-900">{metric.value}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{metric.subtext}</p>
              </div>
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
