import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../../lib/db';
import { users } from '../../../lib/schema';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, credentials.username))
          .limit(1);

        if (!user) return null;

        // Support both bcrypt and scrypt hashed passwords (existing site uses scrypt)
        let isValid = false;
        try {
          isValid = await bcrypt.compare(credentials.password, user.password);
        } catch {
          // If bcrypt fails, the password may be scrypt-hashed from the existing site
          // For now, fall through — will need scrypt verification for legacy passwords
          isValid = false;
        }

        if (!isValid) return null;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          isDoctor: user.isDoctor,
          firstName: user.firstName,
          lastName: user.lastName,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.isDoctor = user.isDoctor;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.isAdmin = token.isAdmin;
      session.user.isDoctor = token.isDoctor;
      session.user.username = token.username;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
