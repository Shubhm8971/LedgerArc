export type WorkspaceRole = 'admin' | 'manager' | 'member';

const permissions: Record<WorkspaceRole, string[]> = {
  admin: [
    'policy:modify',
    'expense:approve',
    'expense:reject',
    'audit:override',
    'export:gstr1',
    'export:csv',
  ],
  manager: [
    'expense:approve',
    'expense:reject',
    'export:csv',
  ],
  member: [
    'expense:create',
  ],
};

export const hasPermission = (role: WorkspaceRole, action: string): boolean => {
  const allowedActions = permissions[role] || [];
  return allowedActions.includes(action);
};