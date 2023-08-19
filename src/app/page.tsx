"use client";

import {
  LoginButton,
  LogoutButton,
  RegisterButton,
} from "@/components/Buttons";
import { Session } from "@/components/Session";

export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100vh",
        gap: "16px",
      }}
    >
      <Session />
      <div>
        <LoginButton />
        <RegisterButton />
        <LogoutButton />
      </div>
    </main>
  );
}
