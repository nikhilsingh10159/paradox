'use client';
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export type TrancheStatus = 'Pending' | 'Funded' | 'Submitted' | 'Under AI Review' | 'Released' | 'Disputed';

export interface Tranche {
  id: string;
  amount: number;
  status: TrancheStatus;
  requirements: string;
  deliverableLink?: string;
}

export interface Job {
  id: string;
  title: string;
  clientAddress: string;
  freelancerAddress: string;
  freelancerName?: string;
  freelancerAvatar?: string;
  totalAmount: number;
  tranches: Tranche[];
  createdAt: string;
}

export interface ReputationData {
  deliverySpeed: number;
  disputeWinRate: number;
  antiGhostingRating: number;
  completionRate: number;
  trustTier: number; // 1-5
  totalJobs: number;
  successfulJobs: number;
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

interface AppContextType {
  userAddress: string | null;
  userProfile: UserProfile;
  login: (address: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  hasProfile: (address: string) => boolean;
  jobs: Job[];
  createJob: (freelancerAddress: string, tranches: { amount: number; requirements: string }[], title?: string) => void;
  submitTranche: (jobId: string, trancheId: string, deliverableLink: string) => void;
  releaseTranche: (jobId: string, trancheId: string) => void;
  disputeTranche: (jobId: string, trancheId: string) => void;
  totalEarnings: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const PROFILES_KEY = 'web3hub_profiles';

const getProfiles = (): Record<string, UserProfile> => {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(PROFILES_KEY);
  return stored ? JSON.parse(stored) : {};
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
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
      successfulJobs: 27
    }
  });
  
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1024",
      title: "DeFi Staking Contract Audit",
      clientAddress: "0xABC...1234",
      freelancerAddress: "0x8B2...4D1A",
      freelancerName: "Ava Morgan",
      freelancerAvatar: "https://i.pravatar.cc/150?u=ava",
      totalAmount: 3000,
      createdAt: new Date().toISOString(),
      tranches: [
        { id: "1024-1", amount: 1000, status: "Released", requirements: "Design mockups for dashboard UI", deliverableLink: "https://figma.com/example" },
        { id: "1024-2", amount: 1000, status: "Submitted", requirements: "Implement responsive React components", deliverableLink: "https://github.com/example/staking-audit" },
        { id: "1024-3", amount: 1000, status: "Funded", requirements: "Integration testing and deployment" }
      ]
    },
    {
      id: "1025",
      title: "Multi-Sig Treasury Frontend",
      clientAddress: "0xABC...1234",
      freelancerAddress: "0xC4F...99E2",
      freelancerName: "Lucas Holt",
      freelancerAvatar: "https://i.pravatar.cc/150?u=lucas",
      totalAmount: 4200,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      tranches: [
        { id: "1025-1", amount: 1500, status: "Released", requirements: "Landing page and wallet connect flows", deliverableLink: "https://github.com/example/treasury-ui" },
        { id: "1025-2", amount: 1500, status: "Released", requirements: "Transaction history and vault actions", deliverableLink: "https://github.com/example/treasury-ui" },
        { id: "1025-3", amount: 1200, status: "Funded", requirements: "Accessibility audit and QA signoff" }
      ]
    },
    {
      id: "1026",
      title: "L2 Bridge Monitoring Dashboard",
      clientAddress: "0xABC...1234",
      freelancerAddress: "0x2A1...9F0B",
      freelancerName: "Nina Patel",
      freelancerAvatar: "https://i.pravatar.cc/150?u=nina",
      totalAmount: 5100,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      tranches: [
        { id: "1026-1", amount: 2200, status: "Released", requirements: "Bridge event ingestion pipeline", deliverableLink: "https://github.com/example/l2-monitor" },
        { id: "1026-2", amount: 1900, status: "Disputed", requirements: "Risk scoring UI and anomaly alerts", deliverableLink: "https://figma.com/example/alerts" },
        { id: "1026-3", amount: 1000, status: "Pending", requirements: "Mobile optimization and handoff" }
      ]
    }
  ]);

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
      // Reset to default if no profile exists for this address
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
          successfulJobs: 27
        }
      });
    }
  }, []);

  const logout = useCallback(() => {
    setUserAddress(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const newProfile = { ...prev, ...updates };
      if (userAddress) {
        const profiles = getProfiles();
        profiles[userAddress] = newProfile;
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
      }
      return newProfile;
    });
  }, [userAddress]);

  const createJob = useCallback((freelancerAddress: string, tranchesData: { amount: number; requirements: string }[], title?: string) => {
    const jobId = Math.floor(Math.random() * 10000).toString();
    const totalAmount = tranchesData.reduce((sum, t) => sum + t.amount, 0);
    const newJob: Job = {
      id: jobId,
      title: title || `Project ${jobId}`,
      clientAddress: userAddress || "0xClient",
      freelancerAddress,
      totalAmount,
      createdAt: new Date().toISOString(),
      tranches: tranchesData.map((t, index) => ({
        id: `${jobId}-${index + 1}`,
        amount: t.amount,
        status: 'Pending',
        requirements: t.requirements
      }))
    };
    setJobs(prev => [newJob, ...prev]);
  }, [userAddress]);

  const submitTranche = useCallback((jobId: string, trancheId: string, deliverableLink: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          tranches: job.tranches.map(t => 
            t.id === trancheId ? { ...t, status: 'Submitted', deliverableLink } : t
          )
        };
      }
      return job;
    }));
  }, []);

  const releaseTranche = useCallback((jobId: string, trancheId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          tranches: job.tranches.map(t => 
            t.id === trancheId ? { ...t, status: 'Released' } : t
          )
        };
      }
      return job;
    }));
  }, []);

  const disputeTranche = useCallback((jobId: string, trancheId: string) => {
    setJobs(prev => prev.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          tranches: job.tranches.map(t => 
            t.id === trancheId ? { ...t, status: 'Disputed' } : t
          )
        };
      }
      return job;
    }));
  }, []);

  const totalEarnings = useMemo(() => {
    return jobs.reduce((acc, job) => {
      const releasedAmount = job.tranches
        .filter(t => t.status === 'Released')
        .reduce((sum, t) => sum + t.amount, 0);
      return acc + releasedAmount;
    }, 0);
  }, [jobs]);

  const contextValue = useMemo(() => ({
    userAddress,
    userProfile,
    login,
    logout,
    updateProfile,
    hasProfile,
    jobs,
    createJob,
    submitTranche,
    releaseTranche,
    disputeTranche,
    totalEarnings
  }), [
    userAddress, 
    userProfile, 
    login, 
    logout, 
    updateProfile, 
    hasProfile, 
    jobs, 
    createJob, 
    submitTranche, 
    releaseTranche, 
    disputeTranche, 
    totalEarnings
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
