export type UserRole = 'admin' | 'accountant';
export type AccountStatus = 'live' | 'breached';

export interface FundedAccount {
  id: string;
  traderName: string;
  firmName: string;
  accountSize: number;
  equity: number;
  profitPct: number;
  month: number;
  year: number;
  status: AccountStatus;
  notes: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: { username: string; role: string } | null;
}

export interface SessionUser {
  id: string;
  username: string;
  role: UserRole;
}

export interface MonthSummary {
  month: number;
  year: number;
  liveCount: number;
  liveTotal: number;
  breachedCount: number;
  breachedTotal: number;
}

declare module 'next-auth' {
  interface Session {
    user: { id: string; name: string; email: string; role: string }
  }
}
declare module 'next-auth/jwt' {
  interface JWT { id: string; role: string }
}
