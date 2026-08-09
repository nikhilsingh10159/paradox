'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useCallback } from 'react';

export function useGatedAction() {
  const { authenticated, login } = usePrivy();

  const handleGatedAction = useCallback(
    (actionCallback: () => void) => {
      if (!authenticated) {
        login();
      } else {
        actionCallback();
      }
    },
    [authenticated, login]
  );

  return { handleGatedAction };
}
