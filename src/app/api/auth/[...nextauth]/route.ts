import NextAuth, {
  Account,
  CallbacksOptions,
  CookiesOptions,
  EventCallbacks,
  NextAuthOptions,
  Profile,
} from "next-auth";
import { JWT } from "next-auth/jwt";
import KeycloakProvider, {
  KeycloakProfile,
} from "next-auth/providers/keycloak";
import { OAuthConfig } from "next-auth/providers/oauth";

declare module "next-auth/jwt" {
  interface JWT {
    id_token?: string;
    provider?: string;
  }
}

// This helper function will allows us to get the domain name regardless of its form
// beta.example.com => example.com
// example.com/* => example.com
// localhost:3000 => localhost
const getDomainWithoutSubdomain = (url: string) => {
  const urlParts = new URL(url).hostname.split(".");

  return urlParts
    .slice(0)
    .slice(-(urlParts.length === 4 ? 3 : 2))
    .join(".");
};

const useSecureCookies = process.env.NEXTAUTH_URL.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const hostName = getDomainWithoutSubdomain(process.env.NEXTAUTH_URL);

// Define how we want the session token to be stored in our browser
const cookies: Partial<CookiesOptions> = {
  sessionToken: {
    name: `${cookiePrefix}next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
      domain: hostName == "localhost" ? hostName : "." + hostName, // add a . in front so that subdomains are included
    },
  },
};

const callbacks: Partial<CallbacksOptions<Profile, Account>> = {
  jwt: async ({ token, account, profile }) => {
    if (profile) token.profile = profile;
    if (account?.id_token) token.id_token = account?.id_token; // comes from keycloak; you can do the same with every other property returned by it
    if (account?.access_token) token.access_token = account?.access_token; // comes from keycloak; you can do the same with every other property returned by it
    if (account?.provider) {
      token.provider = account?.provider;
    }

    return token;
  },
  session: async ({ session, token }) => {
    if (token?.profile) session.user = token.profile;
    if (token?.id_token && typeof token?.id_token === "string") {
      session.id_token = token.id_token; // you can now access idToken anywhere in your app with getSession()
    }
    if (token?.access_token && typeof token?.access_token === "string") {
      session.access_token = token.access_token; // you can now access idToken anywhere in your app with getSession()
    }

    return session;
  },
};

const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  debug: false, // if you want to debug
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies,
  callbacks,
  cookies,
  events: {
    async signOut({ token }: { token: JWT }) {
      if (token.provider === "keycloak") {
        const issuerUrl = (
          authOptions.providers.find(
            (p) => p.id === "keycloak"
          ) as OAuthConfig<KeycloakProfile>
        ).options!.issuer!;
        const logOutUrl = new URL(
          `${issuerUrl}/protocol/openid-connect/logout`
        );
        logOutUrl.searchParams.set("id_token_hint", token.id_token!);
        await fetch(logOutUrl);
      }
    },
  },
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}`,
      accessTokenUrl: `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      profileUrl: `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`,
      wellKnown: `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/.well-known/openid-configuration`,
      requestTokenUrl: `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth`,
      authorization: `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/auth?response_type=code`,
      profile(profile) {
        return { profile, id: profile.sub };
      },
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
