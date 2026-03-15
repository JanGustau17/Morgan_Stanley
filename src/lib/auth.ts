import NextAuth from 'next-auth';
import { createServiceClient } from './supabase/server';
import authConfig from '@/auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  callbacks: {
    // Upsert volunteer by email so the same Google account always maps to the same row.
    // On sign-out and sign-back-in, the same volunteerId is restored in the new session.
    async signIn({ user }) {
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
    },
    // On each sign-in (including after sign-out), load volunteer id and role so session is consistent.
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
