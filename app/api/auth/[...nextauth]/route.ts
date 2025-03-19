import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

// Add debugging
console.log("NextAuth configuration loading...");

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize function called with credentials:", credentials ? "credentials provided" : "no credentials");
        
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        try {
          // Find user by email
          console.log(`Looking for user with email: ${credentials.email}`);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
            },
          });

          console.log("User found:", user ? "yes" : "no");
          
          // If user doesn't exist or password doesn't match
          if (!user) {
            console.log("User not found");
            return null;
          }
          
          const passwordMatch = await compare(credentials.password, user.password);
          console.log("Password match:", passwordMatch ? "yes" : "no");
          
          if (!passwordMatch) {
            console.log("Password doesn't match");
            return null;
          }

          // Return user without password
          console.log("Authentication successful");
          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("JWT callback called", { tokenExists: !!token, userExists: !!user });
      // Add user ID to token when signing in
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback called", { sessionExists: !!session, tokenExists: !!token });
      // Add user ID to session
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth",
    signOut: "/",
    error: "/auth",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET || "your-fallback-secret-do-not-use-in-production",
});

export { handler as GET, handler as POST }; 