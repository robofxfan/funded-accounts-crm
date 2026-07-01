import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const all = await prisma.fundedAccount.findMany({ orderBy: { createdAt: 'desc' } });
  const live = all.filter(a => a.status === 'live');
  const breached = all.filter(a => a.status === 'breached');
  const totalLiveEquity = live.reduce((s, a) => s + a.equity, 0);
  const totalBreachedEquity = breached.reduce((s, a) => s + a.equity, 0);

  const year = new Date().getFullYear();
  const monthMap: Record<number, { live: number; breached: number }> = {};
  for (let m = 1; m <= 12; m++) monthMap[m] = { live: 0, breached: 0 };
  for (const a of all) {
    if (a.year === year && monthMap[a.month]) {
      if (a.status === 'live') monthMap[a.month].live += a.equity;
      else monthMap[a.month].breached += a.equity;
    }
  }
  const monthlyChart = Object.entries(monthMap).map(([m, v]) => ({ month: parseInt(m), ...v }));
  const recent = all.slice(0, 10);

  return NextResponse.json({ totalAccounts: all.length, liveCount: live.length, breachedCount: breached.length, totalLiveEquity, totalBreachedEquity, monthlyChart, recent });
}
