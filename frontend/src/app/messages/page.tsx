'use client';

const conversations = [
  {
    id: 1,
    name: 'Ava Morgan',
    handle: 'ava_audit',
    avatar: 'https://i.pravatar.cc/150?u=ava',
    project: 'DeFi Staking Contract Audit',
    lastMessage: 'Audit report PR is ready for your review.',
    time: '2h ago',
    unread: true,
  },
  {
    id: 2,
    name: 'Lucas Holt',
    handle: 'lucas_web3',
    avatar: 'https://i.pravatar.cc/150?u=lucas',
    project: 'Multi-Sig Treasury Frontend',
    lastMessage: 'Vault actions module deployed to staging.',
    time: '1d ago',
    unread: false,
  },
  {
    id: 3,
    name: 'Nina Patel',
    handle: 'nina_protocol',
    avatar: 'https://i.pravatar.cc/150?u=nina',
    project: 'L2 Bridge Monitoring Dashboard',
    lastMessage: 'Can we align on alert thresholds before merge?',
    time: '3d ago',
    unread: true,
  },
];

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Messages</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Freelancer Conversations</h1>
          <p className="mt-2 text-slate-500">Direct chat threads tied to active escrow contracts.</p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {conversations.map((thread) => (
            <button
              key={thread.id}
              type="button"
              className="flex w-full items-start gap-4 border-b border-slate-100 px-5 py-4 text-left transition last:border-b-0 hover:bg-slate-50"
            >
              <img src={thread.avatar} alt={thread.name} className="h-11 w-11 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-slate-900">
                    {thread.name} <span className="font-normal text-slate-500">@{thread.handle}</span>
                  </p>
                  <span className="shrink-0 text-xs text-slate-400">{thread.time}</span>
                </div>
                <p className="mt-0.5 text-xs font-medium text-blue-600">{thread.project}</p>
                <p className="mt-1 truncate text-sm text-slate-600">{thread.lastMessage}</p>
              </div>
              {thread.unread && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
