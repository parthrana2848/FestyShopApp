import { QuickActionRouteMap } from '../../constants/quick-actions/quickActions.routes';
import type { QuickActionItem } from '../../components/quick-actions/quickActions.types';
import type { QuickActionNavigationTarget } from '../../types/quick-actions/quickActions.navigation.types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import logger from '../../utils/biometric.logger';

// navigation helper hook: maps QuickActionItem to navigation calls or throws
export function useQuickActionsNavigation(rootMap: Partial<typeof QuickActionRouteMap> = QuickActionRouteMap) {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();

  const navigateTo = useCallback(
    (target: QuickActionNavigationTarget) => {
      try {
        navigation.navigate(target.routeName as any, target.params as any);
      } catch (err) {
        logger.error('[QuickActions] navigation failure', { error: err });
      }
    },
    [navigation],
  );

  const resolveAndNavigate = useCallback(
    (action: QuickActionItem) => {
      // If action has explicit navigation target, use it
      if (action.navigationTarget) return navigateTo(action.navigationTarget);

      const mapped = rootMap[action.id];
      if (!mapped) {
        logger.warn('[QuickActions] missing route mapping for action', { actionId: action.id });
        return;
      }

      try {
        navigation.navigate(mapped as any);
      } catch (err) {
        logger.error('[QuickActions] navigation failure for mapped route', { error: err, route: mapped });
      }
    },
    [navigation, navigateTo, rootMap],
  );

  return { resolveAndNavigate, navigateTo };
}
