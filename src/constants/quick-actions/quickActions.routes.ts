export enum QuickActionId {
  ADD_NOTE = 'add_note',
  ADD_EXPENSE = 'add_expense',
  ADD_LEAD = 'add_lead',
  ADD_TASK = 'add_task',
}

export const QuickActionRouteMap: Record<QuickActionId, string> = {
  [QuickActionId.ADD_NOTE]: 'CreateNoteScreen',
  [QuickActionId.ADD_EXPENSE]: 'CreateExpenseScreen',
  [QuickActionId.ADD_LEAD]: 'CreateLeadScreen',
  [QuickActionId.ADD_TASK]: 'CreateTaskScreen',
};
