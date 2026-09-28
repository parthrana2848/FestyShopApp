import { ReactNode } from 'react';
import { Animated } from 'react-native';
import { QuickActionId } from '../../constants/quick-actions/quickActions.routes';
import type { QuickActionNavigationTarget } from '../../types/quick-actions/quickActions.navigation.types';

export type QuickActionItem = {
  id: QuickActionId;
  label: string;
  icon?: ReactNode; // renderable icon provided by host app
  color?: string; // optional override for icon/background color
  accessibleLabel?: string;
  testID?: string;
  // optional explicit navigation target; if omitted, navigation helper will resolve by id
  navigationTarget?: QuickActionNavigationTarget;
  // optional callback instead of navigation
  onPress?: () => void | Promise<void>;
};

export type QuickActionsFABProps = {
  actions: QuickActionItem[];
  // optional: primary color for FAB, falls back to theme/default
  color?: string;
  // optional callback when an action is triggered (UI-level hook); navigation should be done by host
  onActionSelected?: (action: QuickActionItem) => void;
  // optional: render nothing if true
  disabled?: boolean;
};

export type QuickActionMenuProps = {
  actions: QuickActionItem[];
  isOpen: boolean;
  onRequestClose: () => void;
  onActionPress: (action: QuickActionItem) => void;
  anchorColor?: string;
};

export type QuickActionMenuItemProps = {
  action: QuickActionItem;
  onPress: () => void;
  index: number;
};

export type QuickActionBackdropProps = {
  visible: boolean;
  onRequestClose: () => void;
  // optional: animated value controlled by hook for opacity
  backdropAnim?: Animated.Value;
};

export type UseQuickActionsReturn = {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  handleActionPress: (action: QuickActionItem) => void;
  // animated values and refs exposed for render-only components
  rotation: { value: any };
  backdropOpacity: { value: any };
  scale: { value: any };
  translateY: { value: any };
};
