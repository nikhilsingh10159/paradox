'use client';
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export type EscrowStatus = 'Funded' | 'Under AI Review' | 'Disputed' | 'Released';

export interface Escrow {
  id: string;
  freelancerAddress: string;
  amount: number;
  status: EscrowStatus;
  description: string;
  deliverableLink?: string;
  payoutSplit?: { freelancer: number; client: number };
}

export interface UserProfile {
  handle: string;
  role: 'Client' | 'Freelancer' | null;
  skills: string[];
  bio: string;
  avatar: string;
  walletAddress?: string;
  email?: string;
}

interface AppContextType {
  userAddress: string | null;
  userProfile: UserProfile;
  login: (address: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  hasProfile: (address: string) => boolean;
  escrows: Escrow[];
  createEscrow: (freelancerAddress: string, amount: number, description: string) => void;
  updateEscrowStatus: (id: string, newStatus: EscrowStatus, extras?: Partial<Escrow>) => void;
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
    avatar: 'https://i.pravatar.cc/150?u=newuser'
  });
  const [escrows, setEscrows] = useState<Escrow[]>([
    {
      id: "1024",
      freelancerAddress: "0x8B2...4D1A",
      amount: 1000,
      status: "Funded",
      description: "Build a responsive React Dashboard"
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
        avatar: 'https://i.pravatar.cc/150?u=newuser'
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

  const createEscrow = useCallback((freelancerAddress: string, amount: number, description: string) => {
    const newEscrow: Escrow = {
      id: Math.floor(Math.random() * 10000).toString(),
      freelancerAddress,
      amount,
      status: "Funded",
      description
    };
    setEscrows(prev => [newEscrow, ...prev]);
  }, []);

  const updateEscrowStatus = useCallback((id: string, newStatus: EscrowStatus, extras?: Partial<Escrow>) => {
    setEscrows(prev => prev.map(e => 
      e.id === id ? { ...e, status: newStatus, ...extras } : e
    ));
  }, []);

  const totalEarnings = useMemo(() => {
    return escrows
      .filter(e => e.status === 'Released')
      .reduce((acc, curr) => {
        // if there's a split, only count client's refund for this mock (assuming user is client)
        if (curr.payoutSplit) {
          return acc + curr.amount * (curr.payoutSplit.client / 100);
        }
        return acc + curr.amount; // full refund/release
      }, 0);
  }, [escrows]);

  const contextValue = useMemo(() => ({
    userAddress,
    userProfile,
    login,
    logout,
    updateProfile,
    hasProfile,
    escrows,
    createEscrow,
    updateEscrowStatus,
    totalEarnings
  }), [
    userAddress, 
    userProfile, 
    login, 
    logout, 
    updateProfile, 
    hasProfile, 
    escrows, 
    createEscrow, 
    updateEscrowStatus, 
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
