'use client';

import { PrivyProvider } from '@privy-io/react-auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  const isValidAppId = Boolean(appId && appId !== 'your-privy-app-id' && appId.trim().length > 5);

  if (!isValidAppId) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full rounded-2xl border border-amber-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 text-amber-400 mb-3">
            <span className="text-2xl">⚠️</span>
            <h2 className="text-lg font-bold">Privy App ID Configuration Needed</h2>
          </div>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Privy authentication requires a valid App ID. Please add your Privy App ID to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">frontend/.env.local</code>:
          </p>
          <div className="rounded-xl bg-slate-950 p-3.5 text-xs font-mono text-slate-300 border border-slate-800 space-y-1">
            <p className="text-slate-500"># frontend/.env.local</p>
            <p className="text-amber-400">NEXT_PUBLIC_PRIVY_APP_ID=clx...</p>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            You can obtain a free App ID at <a href="https://dashboard.privy.io" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">dashboard.privy.io</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId!}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#3b82f6',
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
