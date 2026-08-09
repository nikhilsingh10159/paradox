'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useEscrowContract } from '@/hooks/useEscrowContract';

export type TrancheStatus = 'Pending' | 'Funded' | 'Submitted' | 'Under AI Review' | 'Released' | 'Disputed';

export interface Tranche {
  id: string;
  amount: number;
  status: TrancheStatus;
  requirements: string;
  deliverableLink?: string;
  submissionNotes?: string;
  deadline?: string;
}

export interface Job {
  id: string;
  title: string;
  description?: string;
  requiredSkills?: string[];
  clientAddress: string;
  freelancerAddress: string;
  freelancerName?: string;
  freelancerHandle?: string;
  freelancerAvatar?: string;
  freelancerSkills?: string[];
  totalAmount: number;
  tranches: Tranche[];
  createdAt: string;
}

export interface ReputationData {
  deliverySpeed: number;
  disputeWinRate: number;
  antiGhostingRating: number;
  completionRate: number;
  trustTier: number;
  totalJobs: number;
  successfulJobs: number;
  totalDisputes: number;
  disputesWon: number;
}

export interface UserProfile {
  handle: string;
  role: 'Client' | 'Freelancer' | null;
  skills: string[];
  bio: string;
  avatar: string;
  walletAddress?: string;
  email?: string;
  reputation?: ReputationData;
}

export interface CreateJobPayload {
  title: string;
  description: string;
  requiredSkills: string[];
  freelancerAddress: string;
  tranches: { amount: number; requirements: string }[];
}

interface AppContextType {
  userAddress: string | null;
  userProfile: UserProfile;
  login: (address: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  hasProfile: (address: string) => boolean;
  jobs: Job[];
  platformBalance: number;
  postJobModalOpen: boolean;
  setPostJobModalOpen: (open: boolean) => void;
  createJob: (payload: CreateJobPayload) => void;
  submitTranche: (jobId: string, trancheId: string, deliverableLink: string, submissionNotes?: string) => void;
  releaseTranche: (jobId: string, trancheId: string) => void;
  disputeTranche: (jobId: string, trancheId: string) => void;
  requestRevision: (jobId: string, trancheId: string, feedback: string) => void;
  requestRefund: (jobId: string, trancheId: string) => void;
  topUpBalance: (amount: number) => void;
  totalEarnings: number;
  lockedInEscrow: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PROFILES_KEY = 'web3hub_profiles';

const getProfiles = (): Record<string, UserProfile> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(PROFILES_KEY);
  return stored ? JSON.parse(stored) : {};
};

const MOCK_JOBS: Job[] = [
  {
    id: '1024',
    title: 'DeFi Staking Contract Audit',
    description: 'Full security audit of staking vault contracts including reentrancy and oracle checks.',
    requiredSkills: ['Solidity', 'Security', 'Foundry'],
    clientAddress: '0xABC1234567890abcdef1234567890abcdef1234',
    freelancerAddress: '0x8B2a4D1a567890abcdef1234567890abcdef5678',
    freelancerName: 'Ava Morgan',
    freelancerHandle: 'ava_audit',
    freelancerAvatar: 'https://i.pravatar.cc/150?u=ava',
    freelancerSkills: ['Solidity', 'Slither', 'Foundry'],
    totalAmount: 3000,
    createdAt: new Date().toISOString(),
    tranches: [
      {
        id: '1024-1',
        amount: 1000,
        status: 'Released',
        requirements: 'Initial threat model and scope review',
        deliverableLink: 'https://github.com/example/staking-audit/pull/1',
        submissionNotes: 'Threat model doc attached in PR description.',
        deadline: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
      {
        id: '1024-2',
        amount: 1000,
        status: 'Submitted',
        requirements: 'Implement responsive React components and audit report',
        deliverableLink: 'https://github.com/example/staking-audit/pull/2',
        submissionNotes: 'Audit report PDF linked in PR. Two medium findings documented with fixes.',
        deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      },
      {
        id: '1024-3',
        amount: 1000,
        status: 'Funded',
        requirements: 'Integration testing and deployment sign-off',
        deadline: new Date(Date.now() + 86400000 * 14).toISOString(),
      },
    ],
  },
  {
    id: '1025',
    title: 'Multi-Sig Treasury Frontend',
    description: 'Production-grade dashboard for multi-sig treasury operations.',
    requiredSkills: ['React', 'Next.js', 'Wagmi'],
    clientAddress: '0xABC1234567890abcdef1234567890abcdef1234',
    freelancerAddress: '0xC4F99E2567890abcdef1234567890abcdef99E2',
    freelancerName: 'Lucas Holt',
    freelancerHandle: 'lucas_web3',
    freelancerAvatar: 'https://i.pravatar.cc/150?u=lucas',
    freelancerSkills: ['React', 'Next.js', 'Tailwind'],
    totalAmount: 4200,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tranches: [
      {
        id: '1025-1',
        amount: 1500,
        status: 'Released',
        requirements: 'Landing page and wallet connect flows',
        deliverableLink: 'https://github.com/example/treasury-ui',
        deadline: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: '1025-2',
        amount: 1500,
        status: 'Released',
        requirements: 'Transaction history and vault actions',
        deliverableLink: 'https://github.com/example/treasury-ui/pull/4',
        deadline: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: '1025-3',
        amount: 1200,
        status: 'Funded',
        requirements: 'Accessibility audit and QA signoff',
        deadline: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
  {
    id: '1026',
    title: 'L2 Bridge Monitoring Dashboard',
    description: 'Real-time bridge event monitoring with risk scoring UI.',
    requiredSkills: ['TypeScript', 'GraphQL', 'Data Viz'],
    clientAddress: '0xABC1234567890abcdef1234567890abcdef1234',
    freelancerAddress: '0x2A19F0B567890abcdef1234567890abcdef9F0B',
    freelancerName: 'Nina Patel',
    freelancerHandle: 'nina_protocol',
    freelancerAvatar: 'https://i.pravatar.cc/150?u=nina',
    freelancerSkills: ['TypeScript', 'D3.js', 'Subgraph'],
    totalAmount: 5100,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    tranches: [
      {
        id: '1026-1',
        amount: 2200,
        status: 'Released',
        requirements: 'Bridge event ingestion pipeline',
        deliverableLink: 'https://github.com/example/l2-monitor',
        deadline: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
      {
        id: '1026-2',
        amount: 1900,
        status: 'Disputed',
        requirements: 'Risk scoring UI and anomaly alerts',
        deliverableLink: 'https://figma.com/example/alerts',
        submissionNotes: 'Alert thresholds need client approval before merge.',
        deadline: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      {
        id: '1026-3',
        amount: 1000,
        status: 'Pending',
        requirements: 'Mobile optimization and handoff',
        deadline: new Date(Date.now() + 86400000 * 21).toISOString(),
      },
    ],
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [platformBalance, setPlatformBalance] = useState(12500);
  const [postJobModalOpen, setPostJobModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    handle: '',
    role: null,
    skills: [],
    bio: '',
    avatar: 'https://i.pravatar.cc/150?u=newuser',
    reputation: {
      deliverySpeed: 92,
      disputeWinRate: 85,
      antiGhostingRating: 100,
      completionRate: 96,
      trustTier: 3,
      totalJobs: 28,
      successfulJobs: 27,
      totalDisputes: 2,
      disputesWon: 1,
    },
  });

  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  // ---- On-chain sync ----
  // When connected to a live Hardhat node (isDemo=false), replace mock jobs
  // with real state read from the YieldEscrow smart contract.
  const { isDemo, syncJobsFromChain } = useEscrowContract();

  useEffect(() => {
    if (isDemo || !userAddress) return;

    let cancelled = false;
    (async () => {
      try {
        const onChainJobs = await syncJobsFromChain(userAddress);
        if (!cancelled && onChainJobs.length > 0) {
          setJobs(onChainJobs);
        }
      } catch (e) {
        console.error('[AppContext] Failed to sync jobs from chain:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [isDemo, userAddress, syncJobsFromChain]);

  const hasProfile = useCallback((address: string) => {
    const profiles = getProfiles();
    return !!profiles[address];
  }, []);

  const login = useCallback((address: string) => {
    setUserAddress(address);
    const profiles = getProfiles();
    if (profiles[address]) {
      setUserProfile(profiles[address]);
    } else {
      setUserProfile({
        handle: '',
        role: null,
        skills: [],
        bio: '',
        avatar: 'https://i.pravatar.cc/150?u=newuser',
        reputation: {
          deliverySpeed: 92,
          disputeWinRate: 85,
          antiGhostingRating: 100,
          completionRate: 96,
          trustTier: 3,
          totalJobs: 28,
          successfulJobs: 27,
          totalDisputes: 2,
          disputesWon: 1,
        },
      });
    }
  }, []);

  const logout = useCallback(() => {
    setUserAddress(null);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setUserProfile((prev) => {
        const newProfile = { ...prev, ...updates };
        if (userAddress) {
          const profiles = getProfiles();
          profiles[userAddress] = newProfile;
          localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        }
        return newProfile;
      });
    },
    [userAddress],
  );

  const createJob = useCallback(
    (payload: CreateJobPayload) => {
      const jobId = Math.floor(Math.random() * 10000).toString();
      const totalAmount = payload.tranches.reduce((sum, t) => sum + t.amount, 0);
      const newJob: Job = {
        id: jobId,
        title: payload.title,
        description: payload.description,
        requiredSkills: payload.requiredSkills,
        clientAddress: userAddress || '0xClient',
        freelancerAddress: payload.freelancerAddress,
        totalAmount,
        createdAt: new Date().toISOString(),
        tranches: payload.tranches.map((t, index) => ({
          id: `${jobId}-${index + 1}`,
          amount: t.amount,
          status: 'Funded',
          requirements: t.requirements,
          deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
        })),
      };
      setJobs((prev) => [newJob, ...prev]);
      setPlatformBalance((prev) => Math.max(0, prev - totalAmount));
    },
    [userAddress],
  );

  const submitTranche = useCallback(
    (jobId: string, trancheId: string, deliverableLink: string, submissionNotes?: string) => {
      setJobs((prev) =>
        prev.map((job) => {
          if (job.id === jobId) {
            return {
              ...job,
              tranches: job.tranches.map((t) =>
                t.id === trancheId ? { ...t, status: 'Submitted', deliverableLink, submissionNotes } : t,
              ),
            };
          }
          return job;
        }),
      );
    },
    [],
  );

  const releaseTranche = useCallback((jobId: string, trancheId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            tranches: job.tranches.map((t) => (t.id === trancheId ? { ...t, status: 'Released' } : t)),
          };
        }
        return job;
      }),
    );
  }, []);

  const disputeTranche = useCallback((jobId: string, trancheId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            tranches: job.tranches.map((t) => (t.id === trancheId ? { ...t, status: 'Disputed' } : t)),
          };
        }
        return job;
      }),
    );
  }, []);

  const requestRevision = useCallback((jobId: string, trancheId: string, feedback: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            tranches: job.tranches.map((t) =>
              t.id === trancheId
                ? {
                    ...t,
                    status: 'Funded',
                    submissionNotes: feedback ? `Revision requested: ${feedback}` : t.submissionNotes,
                  }
                : t,
            ),
          };
        }
        return job;
      }),
    );
  }, []);

  const requestRefund = useCallback((jobId: string, trancheId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          const tranche = job.tranches.find((t) => t.id === trancheId);
          if (tranche && (tranche.status === 'Funded' || tranche.status === 'Disputed')) {
            setPlatformBalance((balance) => balance + tranche.amount);
          }
          return {
            ...job,
            tranches: job.tranches.map((t) =>
              t.id === trancheId ? { ...t, status: 'Disputed' } : t,
            ),
          };
        }
        return job;
      }),
    );
  }, []);

  const topUpBalance = useCallback((amount: number) => {
    setPlatformBalance((prev) => prev + amount);
  }, []);

  const totalEarnings = useMemo(() => {
    return jobs.reduce((acc, job) => {
      const releasedAmount = job.tranches
        .filter((t) => t.status === 'Released')
        .reduce((sum, t) => sum + t.amount, 0);
      return acc + releasedAmount;
    }, 0);
  }, [jobs]);

  const lockedInEscrow = useMemo(() => {
    return jobs.reduce((acc, job) => {
      const locked = job.tranches
        .filter((t) => t.status === 'Funded' || t.status === 'Submitted' || t.status === 'Disputed')
        .reduce((sum, t) => sum + t.amount, 0);
      return acc + locked;
    }, 0);
  }, [jobs]);

  const contextValue = useMemo(
    () => ({
      userAddress,
      userProfile,
      login,
      logout,
      updateProfile,
      hasProfile,
      jobs,
      platformBalance,
      postJobModalOpen,
      setPostJobModalOpen,
      createJob,
      submitTranche,
      releaseTranche,
      disputeTranche,
      requestRevision,
      requestRefund,
      topUpBalance,
      totalEarnings,
      lockedInEscrow,
    }),
    [
      userAddress,
      userProfile,
      login,
      logout,
      updateProfile,
      hasProfile,
      jobs,
      platformBalance,
      postJobModalOpen,
      createJob,
      submitTranche,
      releaseTranche,
      disputeTranche,
      requestRevision,
      requestRefund,
      topUpBalance,
      totalEarnings,
      lockedInEscrow,
    ],
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
