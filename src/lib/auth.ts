import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      authorize: async (c) => {
        const user = await prisma.user.findUnique({ where: { username: c.username as string } });
        if (!user || !user.isActive) return null;
        if (!await bcrypt.compare(c.password as string, user.password)) return null;
        return { id: user.id, name: user.username, email: user.username, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = (user as any).role; }
      return token;
    },
    session({ session, token }) {
      (session.user as any).id   = token.id;
      (session.user as any).role = token.role;
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
});

export async function getSession() {
  const session = await auth();
  if (!session?.user) return null;
  return {
    id:       (session.user as any).id   as string,
    username: session.user.name           as string,
    role:     (session.user as any).role  as string,
  };
}
