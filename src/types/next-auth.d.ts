import NextAuth, { JWT } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: any;
    access_token: string;
    id_token: string;
  }
}
