
'use client';

import { SessionProvider, useSession } from "next-auth/react";
import { AuthContext } from "./Navigation";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();
  
  return (
    <AuthContext.Provider value={{ user: session?.user, loading: status === 'loading' }}>
      {children}
    </AuthContext.Provider>
  )
}

export default function Provider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  )
}
