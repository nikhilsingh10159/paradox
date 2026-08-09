'use client';

interface Talent {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rate: string;
  rating: number;
  completedJobs: number;
  skills: string[];
  availability: string;
}

interface Job {
  id: number;
  title: string;
  category: string;
  posted: string;
}

const featuredTalent: Talent[] = [
  {
    id: 1,
    name: 'Alice Morgan',
    role: 'Smart Contract Auditor',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    rate: '$120/hr',
    rating: 4.9,
    completedJobs: 47,
    skills: ['Solidity', 'Slither', 'Foundry'],
    availability: 'Available now',
  },
  {
    id: 2,
    name: 'Charlie Reid',
    role: 'DeFi Architect',
    avatar: 'https://i.pravatar.cc/150?u=charlie',
    rate: '$150/hr',
    rating: 5.0,
    completedJobs: 32,
    skills: ['Tokenomics', 'Uniswap V3', 'Rust'],
    availability: '2 slots open',
  },
  {
    id: 3,
    name: 'Farah Ali',
    role: 'Protocol Developer',
    avatar: 'https://i.pravatar.cc/150?u=farah',
    rate: '$110/hr',
    rating: 4.8,
    completedJobs: 61,
    skills: ['Solidity', 'Layer 2', 'ZK Proofs'],
    availability: 'Available now',
  },
];

const openJobs: Job[] = [
  {
    id: 1,
    title: 'Build DEX Aggregator Smart Contracts',
    category: 'Solidity',
    posted: '2h ago',
  },
  {
    id: 2,
    title: 'Frontend UI for NFT Marketplace',
    category: 'React/Next.js',
    posted: '5h ago',
  },
];

export default function FeaturedGrid() {
  return (
    <section id="showcase" className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Featured Talent</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredTalent.map((talent) => (
            <article
              key={talent.id}
              className="cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-slate-300"
            >
              <div className="flex items-start gap-3">
                <img
                  src={talent.avatar}
                  alt={talent.name}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">{talent.name}</h3>
                      <p className="truncate text-sm text-slate-500">{talent.role}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-blue-600">{talent.rate}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="font-medium text-amber-600">★ {talent.rating.toFixed(1)}</span>
                    <span>{talent.completedJobs} contracts</span>
                    <span className="text-emerald-600">{talent.availability}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {talent.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Open Jobs</h2>
        <div className="space-y-4">
          {openJobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {job.category}
                </span>
                <span className="shrink-0 text-xs text-slate-500">{job.posted}</span>
              </div>
              <h3 className="cursor-pointer text-lg font-bold text-white transition-colors hover:text-blue-400">
                {job.title}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
