'use client';

import { useCallback, useState } from 'react';
import { useToast } from '@/components/Toast';
import { useEscrowContract } from './useEscrowContract';
import { parseUnits, Contract, TransactionResponse } from 'ethers';

export type BlockchainActionKey = string;

/**
 * useBlockchainAction
 * -------------------
 * Provides an `execute` wrapper that dispatches either a simulated demo
 * action (when not connected to a live Hardhat node) or a real on-chain
 * transaction with correct BigInt / parseUnits parameter types.
 *
 * Contract method dispatch rules:
 * - All USDC amounts are expressed as BigInt with 6 decimals: parseUnits(amount.toString(), 6)
 * - jobId and trancheIndex are passed as plain numbers (ethers auto-converts to uint256)
 * - CIDS are plain UTF-8 strings
 */
export function useBlockchainAction() {
  const { showToast } = useToast();
  const [loadingKey, setLoadingKey] = useState<BlockchainActionKey | null>(null);
  const { contract, isDemo } = useEscrowContract();

  /**
   * execute
   * -------
   * @param key         Unique identifier for this action (for loading state tracking)
   * @param label       Human-readable action label shown in toasts
   * @param demoAction  Local state mutation to run in demo mode (or after tx confirms)
   * @param realAction  On-chain transaction builder. Receives the typed Contract instance.
   *                    Must return a TransactionResponse (has `.wait()` method).
   */
  const execute = useCallback(
    async (
      key: BlockchainActionKey,
      label: string,
      demoAction: () => void | Promise<void>,
      realAction?: (contract: Contract) => Promise<TransactionResponse>,
    ) => {
      setLoadingKey(key);

      try {
        if (isDemo || !contract || !realAction) {
          showToast(`[DEMO] ${label} — simulating on-chain action...`, 'info');
          await new Promise((resolve) => setTimeout(resolve, 1600));
          await demoAction();
          showToast(`[DEMO] ${label} simulated successfully`, 'success');
        } else {
          showToast(`${label} — awaiting wallet confirmation...`, 'info');
          const tx = await realAction(contract);
          showToast(`${label} — transaction submitted, waiting for confirmation...`, 'info');
          await tx.wait();
          // Sync local state after on-chain confirmation
          await demoAction();
          showToast(`✅ ${label} confirmed on-chain`, 'success');
        }
      } catch (err: unknown) {
        console.error(`[useBlockchainAction] ${label} failed:`, err);
        const errorObj = err as { reason?: string; data?: { message?: string }; message?: string };
        const reason =
          errorObj?.reason ??
          errorObj?.data?.message ??
          errorObj?.message ??
          'Transaction reverted.';
        showToast(`❌ ${label} failed: ${reason}`, 'error');
      } finally {
        setLoadingKey(null);
      }
    },
    [showToast, contract, isDemo],
  );

  // -------------------------------------------------------------------------
  // Typed contract action helpers
  // These are pre-built for each contract method with correct param types.
  // -------------------------------------------------------------------------

  /**
   * Calls `createJob` on-chain.
   * @param freelancerAddress  Checksummed wallet address
   * @param trancheAmounts     Per-tranche amounts in human-readable USDC (e.g. 500 = $500)
   * @param requirementsCIDs   IPFS CIDs per tranche
   */
  const buildCreateJobAction = useCallback(
    (
      freelancerAddress: string,
      trancheAmounts: number[],
      requirementsCIDs: string[],
    ) =>
      async (c: Contract) =>
        c.createJob(
          freelancerAddress,
          trancheAmounts.map((a) => parseUnits(a.toString(), 6)),
          requirementsCIDs,
        ),
    [],
  );

  /**
   * Calls `fundJob` on-chain.
   * NOTE: Caller must have approved the escrow contract to spend
   *       totalAmount + STAKE_AMOUNT USDC before calling this.
   */
  const buildFundJobAction = useCallback(
    (jobId: number) =>
      async (c: Contract) =>
        c.fundJob(BigInt(jobId)),
    [],
  );

  /**
   * Calls `stakeFreelancerJob` on-chain.
   * NOTE: Caller (freelancer) must have approved STAKE_AMOUNT USDC.
   */
  const buildStakeFreelancerAction = useCallback(
    (jobId: number) =>
      async (c: Contract) =>
        c.stakeFreelancerJob(BigInt(jobId)),
    [],
  );

  /**
   * Calls `submitDeliverable` on-chain.
   */
  const buildSubmitDeliverableAction = useCallback(
    (jobId: number, trancheIndex: number, deliverableCID: string) =>
      async (c: Contract) =>
        c['submitDeliverable(uint256,uint256,string)'](
          BigInt(jobId),
          BigInt(trancheIndex),
          deliverableCID,
        ),
    [],
  );

  /**
   * Calls `releaseTranche` on-chain.
   */
  const buildReleaseTrancheAction = useCallback(
    (jobId: number, trancheIndex: number) =>
      async (c: Contract) =>
        c.releaseTranche(BigInt(jobId), BigInt(trancheIndex)),
    [],
  );

  /**
   * Calls `raiseDispute` on-chain.
   */
  const buildRaiseDisputeAction = useCallback(
    (jobId: number, trancheIndex: number) =>
      async (c: Contract) =>
        c['raiseDispute(uint256,uint256)'](BigInt(jobId), BigInt(trancheIndex)),
    [],
  );

  const isLoading = useCallback(
    (key: BlockchainActionKey) => loadingKey === key,
    [loadingKey],
  );

  return {
    execute,
    isLoading,
    loadingKey,
    isDemo,
    // Exported action builders for use in components
    buildCreateJobAction,
    buildFundJobAction,
    buildStakeFreelancerAction,
    buildSubmitDeliverableAction,
    buildReleaseTrancheAction,
    buildRaiseDisputeAction,
  };
}
