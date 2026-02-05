
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAILS = ['oliver.meimberg@gmail.com', 'oli@meimberg.io'];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return ALLOWED_EMAILS.includes(user.email);
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.isAdmin = ALLOWED_EMAILS.includes(user.email);
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.isAdmin = token.isAdmin;
      return session;
    },
  },
});
