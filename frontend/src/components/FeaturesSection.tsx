'use client';

import type { ReactNode } from 'react';

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

function IconShield() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  );
}

function IconUserCheck() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function IconWallet() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function IconScale() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a15.933 15.933 0 0 1-1.271.232c-.408.046-.816.07-1.224.07s-.816-.024-1.224-.07a15.933 15.933 0 0 1-1.271-.232c-.483-.174-.711-.703-.589-1.202L18.75 4.971Zm-16.5 0c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a15.933 15.933 0 0 0 1.271.232c.408.046.816.07 1.224.07s.816-.024 1.224-.07a15.933 15.933 0 0 0 1.271-.232c.483-.174.711-.703.589-1.202L5.25 4.971Z" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  );
}

const features: Feature[] = [
  {
    title: 'Smart Contract Escrow',
    description:
      'Milestone-based fund locking ensures client security and guaranteed freelancer payouts upon delivery.',
    icon: <IconShield />,
  },
  {
    title: 'On-Chain Reputation & CV',
    description:
      'Verified work history, completed contracts, and client reviews recorded permanently on-chain.',
    icon: <IconUserCheck />,
  },
  {
    title: 'Multi-Chain Instant Payouts',
    description:
      'Receive payments instantly in ETH, USDC, or stablecoins across Ethereum, Arbitrum, Polygon, and Base.',
    icon: <IconWallet />,
  },
  {
    title: 'Decentralized Dispute Resolution',
    description:
      'Fair, transparent arbitration through DAO governance in the event of milestone disagreements.',
    icon: <IconScale />,
  },
  {
    title: 'Zero-Fee Options & Low Protocol Take',
    description:
      'Keep up to 97% of your earnings with market-leading low protocol fee structures.',
    icon: <IconTag />,
  },
  {
    title: 'Non-Custodial Wallet Login',
    description:
      'Sign in with MetaMask, WalletConnect, or Coinbase Wallet. No password resets or email friction.',
    icon: <IconKey />,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="mt-24 scroll-mt-24">
      <div className="text-center">
        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
          WHY PARADOX
        </span>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          Everything you need to hire, collaborate, and settle payments on-chain without friction.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              {feature.icon}
            </div>
            <h3 className="font-bold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
