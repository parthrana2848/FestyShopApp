import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectIsUserOnline } from '../store/presenceSelectors';
import type { RootState } from '../../../store';

/**
 * Hook to check if a specific user is online
 *
 * Usage:
 * const { isOnline } = useUserPresence(userId);
 *
 * @param userId - The ID of the user to check
 * @returns { isOnline: boolean }
 */
export function useUserPresence(userId: string) {
  const isOnline = useSelector((state: RootState) =>
    selectIsUserOnline(state, userId),
  );

  return useMemo(
    () => ({
      isOnline,
    }),
    [isOnline],
  );
}
