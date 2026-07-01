import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { username, password, role } = await req.json();
  if (!username || !password) return NextResponse.json({ error: 'Username and password required' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashed, role: role || 'accountant' },
    select: { id: true, username: true, role: true, isActive: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
