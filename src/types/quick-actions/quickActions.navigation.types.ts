import { QuickActionId } from '../../constants/quick-actions/quickActions.routes';

export type ApprovedScreenRoutes =
  | 'HomeScreen'
  | 'DashboardScreen'
  | 'NotesScreen'
  | 'CRMScreen'
  | 'FinanceScreen'
  | 'CreateNoteScreen'
  | 'CreateExpenseScreen'
  | 'CreateLeadScreen'
  | 'CreateTaskScreen';

export type HiddenScreenRoutes = 'LoginScreen' | 'RegisterScreen' | 'OTPScreen' | 'SplashScreen';

export type QuickActionNavigationTarget = {
  routeName: ApprovedScreenRoutes;
  params?: Record<string, unknown>;
};

export type QuickActionRouteMap = Partial<Record<QuickActionId, ApprovedScreenRoutes>>;
