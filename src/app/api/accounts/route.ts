import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  const where: any = {};
  if (status) where.status = status;
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);

  const accounts = await prisma.fundedAccount.findMany({
    where,
    include: { creator: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { traderName, firmName, accountSize, equity, profitPct, month, year, status, notes } = body;

  if (!traderName || !month || !year || equity === undefined) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const userId = (session.user as any).id;
  const account = await prisma.fundedAccount.create({
    data: {
      traderName,
      firmName: firmName || '',
      accountSize: parseFloat(accountSize) || 0,
      equity: parseFloat(equity),
      profitPct: parseFloat(profitPct) || 0,
      month: parseInt(month),
      year: parseInt(year),
      status: status || 'live',
      notes: notes || '',
      createdBy: userId,
    },
    include: { creator: { select: { username: true } } },
  });
  return NextResponse.json(account, { status: 201 });
}
