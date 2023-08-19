declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";

      NEXT_PRIVATE_STANDALONE: string;
      NEXTAUTH_SECRET: string;
      NEXT_URL: string;
      NEXTAUTH_URL: string;

      KEYCLOAK_REALM: string;
      KEYCLOAK_CLIENT_ID: string;
      KEYCLOAK_CLIENT_SECRET: string;
      KEYCLOAK_BASE_URL: string;
      KEYCLOAK_PUBLIC_KEY: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
