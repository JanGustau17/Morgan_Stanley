import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { createServiceClient } from './supabase/server';
import { verifyPhoneToken } from './phone-token';
import authConfig from '@/auth.config';

// On Vercel: set NEXTAUTH_URL to your exact production URL (e.g. https://your-app.vercel.app) with no trailing slash.
// Ensure Google Cloud Console redirect URI matches: ${NEXTAUTH_URL}/api/auth/callback/google
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  cookies: {
    pkceCodeVerifier: {
      name: process.env.NEXTAUTH_URL?.startsWith('https://')
        ? '__Secure-authjs.pkce.code_verifier'
        : 'authjs.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? true,
        maxAge: 60 * 15,
      },
    },
  },
  providers: [
    ...(authConfig.providers ?? []),
    Credentials({
      credentials: { token: { label: 'Token', type: 'text' } },
      authorize: async (credentials) => {
        const token = credentials?.token as string | undefined;
        if (!token) return null;
        const payload = verifyPhoneToken(token);
        if (!payload) return null;
        return { id: payload.volunteerId, email: null, name: null };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        const supabase = createServiceClient();
        const { error } = await supabase.from('volunteers').upsert(
          {
            email: user.email,
            name: user.name,
            avatar_url: user.image,
          },
          { onConflict: 'email' }
        );
        return !error;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const supabase = createServiceClient();
        const { data } = await supabase
          .from('volunteers')
          .select('id, role')
          .eq('email', user.email)
          .single();
        if (data) {
          token.volunteerId = data.id;
          token.role = data.role;
        }
      } else if (user?.id) {
        token.volunteerId = user.id;
        const supabase = createServiceClient();
        const { data } = await supabase
          .from('volunteers')
          .select('role')
          .eq('id', user.id)
          .single();
        if (data) token.role = data.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.volunteerId = token.volunteerId as string | undefined;
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
});
