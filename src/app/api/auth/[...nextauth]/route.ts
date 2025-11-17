import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/", // login page
  },

  callbacks: {
    async redirect() {
      return "/dashboard"; // after login
    },

    async jwt({ token, account, profile }) {
      if (account && profile) {
        const p = profile as any; // FIX TS error: Google profile has extra fields

        // Store Google user data in the token
        token.id = p.sub;
        token.name = p.name;
        token.email = p.email;

        // FIX: GOOGLE PROFILE IMAGE (safe for TypeScript)
        token.picture =
          p.picture ||       // Google standard field
          p.pictureUrl ||    // some providers use this
          p.avatar_url ||    // GitHub-style
          null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // Pass basic fields
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;

        // FIX: PASS IMAGE TO FRONTEND
        session.user.image =
          (token.picture as string) ||
          session.user.image ||
          null;
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
});

export { handler as GET, handler as POST };
