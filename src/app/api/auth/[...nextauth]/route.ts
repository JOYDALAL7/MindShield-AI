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
    signIn: "/", // Optional: Send users to homepage for login
  },

  callbacks: {
    async redirect() {
      return "/dashboard";
    },

    async jwt({ token, account, profile }) {
      // Attach user ID when logging in
      if (account && profile) {
        token.id = profile.sub;
      }
      return token;
    },

    async session({ session, token }) {
      // If session.user exists, safely attach the token id
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET!,
});

export { handler as GET, handler as POST };
