import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import Credentials from "next-auth/providers/credentials"
// Your own logic for dealing with plaintext password strings; be careful!
import { getUser } from "./app/database/auth";
import { ZodError } from "zod";
import { signInSchema } from "./app/components/auth/signinschema";


declare module "next-auth" {
  interface Session {
    user: {
      username: string,
      first_name: string,
      last_name?:string,
      rba:string[],
      id:string,
      _role?:string,
      email?:string,
      first_logon:boolean,
      is_admin:boolean,
      creator?:{first_name:string, last_name?:string}
    } & DefaultSession["user"]
  }
  
  interface User {
      username: string,
      first_name: string,
      last_name?:string,
      rba:string[],
      id:string,
      _role?:string,
      email?:string,
      first_logon:boolean,
      is_admin:boolean,
      creator?:{first_name:string, last_name?:string}
  }
}

declare module "next-auth/jwt" {
  interface JWT {
      username: string,
      first_name: string,
      last_name?:string,
      rba:string[],
      id:string,
      _role?:string,
      email?:string,
      first_logon:boolean,
      is_admin:boolean,
      creator?:{first_name:string, last_name?:string}
  }
}
 

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  pages: {
    signIn: '/auth/signin',
  },
  providers: [
    Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: {
          type: "username",
          label: "username",
          placeholder: "",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },
     authorize: async (credentials, request) => {
        try{
          let user = null
          // const {username, password } = await signInSchema.parseAsync(credentials)
          // console.log(username, password)
          // logic to salt and hash password using Web Crypto API (Edge Runtime compatible)
          const encoder = new TextEncoder();
          const data = encoder.encode(credentials.password as string);
          const hashBuffer = await crypto.subtle.digest('SHA-256', data);
          const hashArray = new Uint8Array(hashBuffer);
          
          // Convert to base64url format
          const pwHash = btoa(String.fromCharCode(...hashArray))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
  
          // logic to verify if the user exists
          user = await getUser(credentials.username as string, pwHash)
  
          if (!user) {
            // No user found, so this is their first attempt to login
            // Optionally, this is also the place you could do a user registration
            throw new Error("Invalid credentials.")
          }
  
          // return user object with their profile data
          return user as any
        }
        catch (error){
          // Always return null on error to satisfy the expected return type (User | null)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // If user is present (login), add user data to token
      if (user) {
        token.username = user.username;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.rba = user.rba;
        token.id = user.id;
        token._role = user._role;
        token.email = user.email;
        token.first_logon = user.first_logon;
        token.is_admin = user.is_admin;
        token.creator = user.creator

      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.username = token.username as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string | undefined;
        session.user.rba = token.rba as string[];
        session.user.id = token.id as string;
        session.user._role = token._role as string | undefined;
        session.user.email = token.email as string;
        session.user.first_logon = token.first_logon as boolean;
        session.user.is_admin = token.is_admin as boolean;
        session.user.creator = token.creator as {first_name:string, last_name?:string}
        session.user.username = token.username as string;
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string | undefined;
        session.user.rba = token.rba as string[];
        session.user.id = token.id as string;
      }
      return session;
    },
  },
})