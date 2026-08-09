'use client';

import { useWallets } from '@privy-io/react-auth';
import { BrowserProvider, Contract } from 'ethers';
import {
  ESCROW_CONTRACT_ADDRESS,
  ESCROW_ABI,
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_ABI,
  TRANCHE_STATUS_MAP,
} from '@/config/contracts';
import { useState, useEffect, useCallback } from 'react';
import type { Job, Tranche, TrancheStatus } from '@/context/AppContext';

/**
 * useEscrowContract
 * -----------------
 * Initialises ethers Contract instances for the YieldEscrow and MockERC20
 * contracts when a wallet is connected to chain ID 31337 (local Hardhat).
 *
 * Falls back to `isDemo = true` when:
 * - No wallet is connected
 * - The escrow contract has no bytecode at ESCROW_CONTRACT_ADDRESS
 * - Chain switching fails
 */
export function useEscrowContract() {
  const { wallets } = useWallets();
  const [contract, setContract] = useState<Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    async function initContracts() {
      if (wallets.length === 0) {
        setIsDemo(true);
        setContract(null);
        setTokenContract(null);
        return;
      }

      try {
        const wallet = wallets[0];
        await wallet.switchChain(31337); // Local Hardhat network
        const ethereumProvider = await wallet.getEthereumProvider();
        const provider = new BrowserProvider(ethereumProvider);
        const signer = await provider.getSigner();

        // Check bytecode to detect whether contracts are deployed
        const escrowCode = await provider.getCode(ESCROW_CONTRACT_ADDRESS);
        const tokenCode = await provider.getCode(TOKEN_CONTRACT_ADDRESS);

        if (escrowCode !== '0x' && tokenCode !== '0x') {
          setContract(new Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer));
          setTokenContract(new Contract(TOKEN_CONTRACT_ADDRESS, TOKEN_ABI, signer));
          setIsDemo(false);
        } else {
          console.warn('[useEscrowContract] Contract(s) not deployed at configured addresses. Falling back to demo mode.');
          setIsDemo(true);
          setContract(null);
          setTokenContract(null);
        }
      } catch (e) {
        console.error('[useEscrowContract] Failed to connect to contracts:', e);
        setIsDemo(true);
        setContract(null);
        setTokenContract(null);
      }
    }

    initContracts();
  }, [wallets]);

  /**
   * syncJobsFromChain
   * -----------------
   * Reads all jobs for the connected address from the smart contract and
   * returns them in the shape of the AppContext `Job[]` type.
   *
   * Converts uint256 jobId → string, uint8 status → TrancheStatus label.
   * Only available when `isDemo === false`.
   */
  const syncJobsFromChain = useCallback(
    async (userAddress: string): Promise<Job[]> => {
      if (!contract || isDemo) return [];

      try {
        const jobCountVal: bigint = await contract.jobCount();
        const totalJobs = Number(jobCountVal);
        const jobs: Job[] = [];

        for (let i = 1; i <= totalJobs; i++) {
          const jobData = await contract.jobs(i);

          const isParticipant =
            jobData.client.toLowerCase() === userAddress.toLowerCase() ||
            jobData.freelancer.toLowerCase() === userAddress.toLowerCase();

          if (!isParticipant) continue;

          const trancheCount = Number(jobData.trancheCount);
          const tranches: Tranche[] = [];

          for (let t = 0; t < trancheCount; t++) {
            const trancheData = await contract.tranches(i, t);
            const statusNum = Number(trancheData.status) as keyof typeof TRANCHE_STATUS_MAP;
            // Map on-chain status uint8 → TrancheStatus UI string
            const rawStatus = TRANCHE_STATUS_MAP[statusNum] ?? 'Pending';
            // Normalise 'Delivered' (on-chain) → 'Submitted' (UI label)
            const uiStatus: TrancheStatus = rawStatus === 'Delivered' ? 'Submitted' : (rawStatus as TrancheStatus);

            tranches.push({
              id: `${i}-${t}`,
              amount: Number(trancheData.amount) / 1e6, // USDC 6-decimal to human
              status: uiStatus,
              requirements: trancheData.requirementsCID,
              deliverableLink: trancheData.deliverableCID || undefined,
            });
          }

          jobs.push({
            id: i.toString(),
            title: `Job #${i.toString()}`,
            clientAddress: jobData.client,
            freelancerAddress: jobData.freelancer,
            totalAmount: Number(jobData.totalAmount) / 1e6,
            tranches,
            createdAt: new Date().toISOString(),
          });
        }

        return jobs;
      } catch (e) {
        console.error('[useEscrowContract] syncJobsFromChain failed:', e);
        return [];
      }
    },
    [contract, isDemo],
  );

  return { contract, tokenContract, isDemo, syncJobsFromChain };
}
