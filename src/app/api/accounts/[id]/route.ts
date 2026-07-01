import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { traderName, firmName, accountSize, equity, profitPct, month, year, status, notes } = body;

  const account = await prisma.fundedAccount.update({
    where: { id },
    data: {
      ...(traderName !== undefined && { traderName }),
      ...(firmName !== undefined && { firmName }),
      ...(accountSize !== undefined && { accountSize: parseFloat(accountSize) }),
      ...(equity !== undefined && { equity: parseFloat(equity) }),
      ...(profitPct !== undefined && { profitPct: parseFloat(profitPct) }),
      ...(month !== undefined && { month: parseInt(month) }),
      ...(year !== undefined && { year: parseInt(year) }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
    },
    include: { creator: { select: { username: true } } },
  });
  return NextResponse.json(account);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await prisma.fundedAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
