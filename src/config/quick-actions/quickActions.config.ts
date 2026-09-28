import { QuickActionId } from '../../constants/quick-actions/quickActions.routes';
import type { QuickActionItem } from '../../components/quick-actions/quickActions.types';

// Default quick actions configuration. This file is purely declarative and
// can be overridden or extended by feature modules at runtime.
export const defaultQuickActions: QuickActionItem[] = [
  {
    id: QuickActionId.ADD_LEAD,
    label: 'Add Lead',
    // icons: consumer may pass a React element; fallback handled by menu item
  },
  {
    id: QuickActionId.ADD_NOTE,
    label: 'Add Note',
  },
  {
    id: QuickActionId.ADD_EXPENSE,
    label: 'Add Expense',
  },
];

export default {
  defaultQuickActions,
};
