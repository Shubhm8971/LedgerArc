import { ExpenseLog as BaseExpenseLog } from '@/app/dashboard/hooks/useDashboardLedger';

export interface ExpenseLog extends BaseExpenseLog {
  exceeds_ceiling?: boolean;
  is_weekend_violation?: boolean;
}