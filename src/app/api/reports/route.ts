import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

function getDateRange(period: string): { startMonth: number; startYear: number; endMonth: number; endYear: number } {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  if (period === 'daily' || period === 'weekly' || period === 'biweekly') {
    return { startMonth: m, startYear: y, endMonth: m, endYear: y };
  }
  if (period === 'monthly') {
    return { startMonth: m, startYear: y, endMonth: m, endYear: y };
  }
  if (period === '6month') {
    let sm = m - 5; let sy = y;
    if (sm <= 0) { sm += 12; sy -= 1; }
    return { startMonth: sm, startYear: sy, endMonth: m, endYear: y };
  }
  // yearly
  return { startMonth: 1, startYear: y, endMonth: 12, endYear: y };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period') || 'monthly';

  const { startMonth, startYear, endMonth, endYear } = getDateRange(period);

  // Fetch all accounts in range
  const accounts = await prisma.fundedAccount.findMany({
    where: {
      OR: [
        { year: { gt: startYear } },
        { year: startYear, month: { gte: startMonth } },
      ],
      AND: [
        {
          OR: [
            { year: { lt: endYear } },
            { year: endYear, month: { lte: endMonth } },
          ],
        },
      ],
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  });

  // Monthly breakdown
  const monthMap: Record<string, { month: number; year: number; liveCount: number; liveEquity: number; breachedCount: number; breachedEquity: number }> = {};
  for (const a of accounts) {
    const key = `${a.year}-${a.month}`;
    if (!monthMap[key]) monthMap[key] = { month: a.month, year: a.year, liveCount: 0, liveEquity: 0, breachedCount: 0, breachedEquity: 0 };
    if (a.status === 'live') { monthMap[key].liveCount++; monthMap[key].liveEquity += a.equity; }
    else { monthMap[key].breachedCount++; monthMap[key].breachedEquity += a.equity; }
  }

  const monthlyBreakdown = Object.values(monthMap).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

  const liveAccounts = accounts.filter(a => a.status === 'live');
  const breachedAccounts = accounts.filter(a => a.status === 'breached');
  const totalLiveEquity = liveAccounts.reduce((s, a) => s + a.equity, 0);
  const totalBreachedEquity = breachedAccounts.reduce((s, a) => s + a.equity, 0);

  return NextResponse.json({
    period,
    accounts,
    liveAccounts,
    breachedAccounts,
    totalLiveEquity,
    totalBreachedEquity,
    monthlyBreakdown,
    startMonth, startYear, endMonth, endYear,
  });
}
