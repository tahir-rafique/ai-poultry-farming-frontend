"use client";

/**
 * ClerkAuthProvider
 *
 * A zero-UI client component that lives at the root layout.
 * On every mount it registers Clerk's `getToken` function with the
 * axios interceptor in api.ts so every outgoing request automatically
 * carries the signed-in user's JWT as `Authorization: Bearer <token>`.
 */

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { setTokenGetter } from "@/lib/api";

export default function ClerkAuthProvider() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Hand the token getter to the axios layer.
    // The interceptor calls it before each request, so the token is always fresh.
    setTokenGetter(() => getToken());
  }, [getToken]);

  return null; // renders nothing — side-effect only
}
