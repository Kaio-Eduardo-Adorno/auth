"use client";

import { useSession } from "next-auth/react";

export const Session = () => {
  const { data: session, status } = useSession();
  return (
    <>
      <p>
        Status: <span>{status}</span>
      </p>
      <p>
        Session: <span>{JSON.stringify(session)}</span>
      </p>
    </>
  );
};
