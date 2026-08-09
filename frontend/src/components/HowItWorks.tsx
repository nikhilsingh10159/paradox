'use client';

import type { ReactNode } from 'react';

interface Step {
  number: string;
  title: string;
  description: string;
  highlights: string[];
  icon: ReactNode;
}

function IconPost() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function IconEscrow() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function IconBuild() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
    </svg>
  );
}

function IconPayout() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 0v1.5c0 .621.504 1.125 1.125 1.125h.375m1.5-1.5H21" />
    </svg>
  );
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Post or Browse Jobs',
    description:
      'Clients define project milestones and scope. Freelancers filter opportunities by tech stack and payout rate.',
    highlights: ['Smart Contract Audits', 'Frontend UI', 'Tokenomics'],
    icon: <IconPost />,
  },
  {
    number: '02',
    title: 'Lock Funds in Escrow',
    description:
      'Clients deposit milestone funds into immutable smart contracts. Freelancers work with 100% payment guarantee.',
    highlights: ['Non-custodial vault', 'Multi-sig protection'],
    icon: <IconEscrow />,
  },
  {
    number: '03',
    title: 'Deliver & Collaborate',
    description:
      'Submit code, designs, or audit reports directly through the platform dashboard with transparent version tracking.',
    highlights: ['GitHub integration', 'Live preview links'],
    icon: <IconBuild />,
  },
  {
    number: '04',
    title: 'Instant Payout & Rating',
    description:
      "Milestones are approved, funds release instantly to the freelancer's wallet, and on-chain feedback is minted.",
    highlights: ['Zero withdrawal delay', 'On-chain credential'],
    icon: <IconPayout />,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-24 scroll-mt-24">
      <div className="text-center">
        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          SIMPLE WORKFLOW
        </span>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">How It Works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          A seamless end-to-end process for both Web3 builders and clients.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <article
            key={step.number}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-sm font-extrabold text-blue-600">
                {step.number}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                {step.icon}
              </div>
            </div>
            <h3 className="font-bold text-slate-900">{step.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{step.description}</p>
            <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
              {step.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
