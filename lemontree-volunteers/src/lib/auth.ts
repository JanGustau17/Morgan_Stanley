import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { createServiceClient } from './supabase/server';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
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
    async session({ session }) {
      if (session.user?.email) {
        const supabase = createServiceClient();
        const { data } = await supabase
          .from('volunteers')
          .select('id, role')
          .eq('email', session.user.email)
          .single();
        if (data) {
          (session.user as unknown as Record<string, unknown>).volunteerId = data.id;
          (session.user as unknown as Record<string, unknown>).role = data.role;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
});
