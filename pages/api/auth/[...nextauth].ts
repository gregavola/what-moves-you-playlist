import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
// eslint-disable-next-line new-cap
export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    // eslint-disable-next-line new-cap
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email,playlist-read-private,playlist-modify-private,playlist-modify-public,ugc-image-upload",
    }),
    // ...add more providers here
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.AUTH_SECRET,
  },
  pages: {
    error: "/error",
  },
  callbacks: {
    async signIn() {
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.uid = account.id;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresIn = account.expires_at;
      }
      return Promise.resolve(token);
    },
    async session({ session, token }) {
      if (token.sub) {
        session.userId = token.sub;
      }

      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresIn = token.expiresIn;
      return Promise.resolve(session);
    },
  },
  // Enable debug messages in the console if you are having problems
  debug: false,
});
