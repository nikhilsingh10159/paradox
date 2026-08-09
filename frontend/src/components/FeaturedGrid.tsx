'use client';

import React from 'react';
import Link from 'next/link';
import { useAppContext } from '@/context/AppContext';

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
  const { setPostJobModalOpen } = useAppContext();

  return (
    <section id="showcase" className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Featured Talent</h2>
          <Link href="/find-talent" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View All Talent →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {featuredTalent.map((talent) => (
            <div
              key={talent.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 card-shadow-hover transition-all duration-300 hover:border-blue-300"
            >
              <div>
                <Link href="/find-talent" className="flex items-start gap-3">
                  <img
                    src={talent.avatar}
                    alt={talent.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100 transition-transform group-hover:scale-105"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                          {talent.name}
                        </h3>
                        <p className="truncate text-xs font-semibold text-slate-500">{talent.role}</p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-blue-600">{talent.rate}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-amber-600">★ {talent.rating.toFixed(1)}</span>
                      <span>{talent.completedJobs} contracts</span>
                      <span className="font-semibold text-emerald-600">● {talent.availability}</span>
                    </div>
                  </div>
                </Link>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {talent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-3">
                <Link
                  href="/messages"
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Message
                </Link>
                <button
                  type="button"
                  onClick={() => setPostJobModalOpen(true)}
                  className="flex-1 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Hire & Escrow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Open Opportunities</h2>
          <Link href="/my-jobs" className="text-xs font-bold text-blue-600 hover:text-blue-700">
            Browse All Jobs →
          </Link>
        </div>
        <div className="space-y-4">
          {openJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white card-shadow-hover transition-all"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {job.category}
                </span>
                <span className="shrink-0 text-xs text-slate-400">{job.posted}</span>
              </div>
              <Link href="/my-jobs">
                <h3 className="text-lg font-bold text-white transition-colors hover:text-blue-400">
                  {job.title}
                </h3>
              </Link>
              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                <span className="text-xs font-semibold text-slate-400">Verified Client Escrow</span>
                <button
                  type="button"
                  onClick={() => setPostJobModalOpen(true)}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
