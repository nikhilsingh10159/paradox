'use client';

const talent = [
  {
    id: 1,
    name: 'Alice Morgan',
    role: 'Smart Contract Auditor',
    rate: '180',
    successRate: 98,
    earnings: '$45.2K',
    avatar: 'https://i.pravatar.cc/150?u=alice',
    skills: ['Solidity', 'Foundry', 'Security'],
  },
  {
    id: 2,
    name: 'Bob Chen',
    role: 'Frontend Engineer',
    rate: '120',
    successRate: 95,
    earnings: '$18.6K',
    avatar: 'https://i.pravatar.cc/150?u=bob',
    skills: ['React', 'Next.js', 'Tailwind'],
  },
  {
    id: 3,
    name: 'Charlie Reid',
    role: 'DeFi Architect',
    rate: '210',
    successRate: 99,
    earnings: '$89.4K',
    avatar: 'https://i.pravatar.cc/150?u=charlie',
    skills: ['DeFi', 'Tokenomics', 'Go'],
  },
  {
    id: 4,
    name: 'Diana Patel',
    role: 'UI/UX Designer',
    rate: '95',
    successRate: 94,
    earnings: '$12.1K',
    avatar: 'https://i.pravatar.cc/150?u=diana',
    skills: ['Figma', 'UX Research', 'Design Systems'],
  },
  {
    id: 5,
    name: 'Evan Brooks',
    role: 'Web3 Growth Strategist',
    rate: '140',
    successRate: 92,
    earnings: '$31.7K',
    avatar: 'https://i.pravatar.cc/150?u=evan',
    skills: ['Marketing', 'Launch Ops', 'Community'],
  },
  {
    id: 6,
    name: 'Farah Ali',
    role: 'Protocol Developer',
    rate: '175',
    successRate: 97,
    earnings: '$67.3K',
    avatar: 'https://i.pravatar.cc/150?u=farah',
    skills: ['Rust', 'Substrate', 'Protocols'],
  },
];

import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';
import HireModal from '@/components/HireModal';

export default function FindTalentPage() {
  const { setPostJobModalOpen, postJobModalOpen } = useAppContext();

  const handleHireClick = () => {
    setPostJobModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="mb-8 rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Talent Market</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Find Verified Builders</h1>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="text"
                placeholder="Search by skill or address"
                className="w-full bg-transparent text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {talent.map((person) => (
            <article key={person.id} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-4">
                <img src={person.avatar} alt={person.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100" />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-slate-900">{person.name}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-600">{person.role}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Rate</span>
                <span className="text-base font-bold text-slate-900">{person.rate} Coins/hr</span>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Verified Skills</p>
                <div className="flex flex-wrap gap-2">
                  {person.skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Success</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{person.successRate}%</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Escrowed</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">{person.earnings}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Link
                  href="/messages"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Send Message
                </Link>
                <button
                  type="button"
                  onClick={() => handleHireClick()}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Hire & Fund Escrow
                </button>
              </div>
            </article>
          ))}
        </section>

        {postJobModalOpen && (
          <HireModal onClose={() => setPostJobModalOpen(false)} />
        )}
      </main>
    </div>
  );
}
