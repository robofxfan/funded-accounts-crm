import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        username: 'admin',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
      },
    });
    console.log('✅ Admin created  →  username: admin  |  password: admin123');
  }

  // Accountant
  const accExists = await prisma.user.findUnique({ where: { username: 'accounts' } });
  if (!accExists) {
    await prisma.user.create({
      data: {
        username: 'accounts',
        password: await bcrypt.hash('accounts123', 12),
        role: 'accountant',
      },
    });
    console.log('✅ Accountant created  →  username: accounts  |  password: accounts123');
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin     →  admin / admin123');
  console.log('  Accountant→  accounts / accounts123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
