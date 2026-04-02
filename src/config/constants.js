const PERMISSIONS = {
  READ_RECORD: 'read:record',
  CREATE_RECORD: 'create:record',
  UPDATE_RECORD: 'update:record',
  DELETE_RECORD: 'delete:record',
  READ_ANALYTICS: 'read:analytics',
  READ_AUDIT: 'read:audit',
  MANAGE_USERS: 'manage:users',
  MANAGE_ROLES: 'manage:roles',
  MANAGE_BUDGETS: 'manage:budgets',
};

const USER_STATUS = { ACTIVE: 'active', INACTIVE: 'inactive' };
const RECORD_TYPES = { INCOME: 'income', EXPENSE: 'expense' };
const BUDGET_PERIODS = { MONTHLY: 'monthly', WEEKLY: 'weekly' };

const AUDIT_ACTIONS = {
  CREATE_RECORD: 'CREATE_RECORD',
  UPDATE_RECORD: 'UPDATE_RECORD',
  DELETE_RECORD: 'DELETE_RECORD',
  CREATE_USER: 'CREATE_USER',
  UPDATE_USER: 'UPDATE_USER',
  DELETE_USER: 'DELETE_USER',
  CREATE_ROLE: 'CREATE_ROLE',
  UPDATE_ROLE: 'UPDATE_ROLE',
  DELETE_ROLE: 'DELETE_ROLE',
  CREATE_BUDGET: 'CREATE_BUDGET',
  UPDATE_BUDGET: 'UPDATE_BUDGET',
  DELETE_BUDGET: 'DELETE_BUDGET',
  LOGIN: 'LOGIN',
  REGISTER: 'REGISTER',
};

const DEFAULT_ROLES = { VIEWER: 'viewer', ANALYST: 'analyst', ADMIN: 'admin' };

const SEED_ROLES = [
  {
    name: 'Viewer', slug: 'viewer',
    permissions: [PERMISSIONS.READ_RECORD, PERMISSIONS.READ_ANALYTICS],
    description: 'Can view financial records and analytics',
    isSystem: true,
  },
  {
    name: 'Analyst', slug: 'analyst',
    permissions: [PERMISSIONS.READ_RECORD, PERMISSIONS.READ_ANALYTICS, PERMISSIONS.READ_AUDIT],
    description: 'Can view records, analytics, and audit logs',
    isSystem: true,
  },
  {
    name: 'Admin', slug: 'admin',
    permissions: Object.values(PERMISSIONS),
    description: 'Full access to all features',
    isSystem: true,
  },
];

module.exports = {
  PERMISSIONS, USER_STATUS, RECORD_TYPES, BUDGET_PERIODS,
  AUDIT_ACTIONS, DEFAULT_ROLES, SEED_ROLES,
};
