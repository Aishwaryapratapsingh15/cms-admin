"use client";

import { createContext, useCallback, useContext, useRef } from "react";
import type { useRouter } from "next/navigation";

type Blocker = (proceed: () => void) => void;

type Router = ReturnType<typeof useRouter>;

const UnsavedChangesContext = createContext<{
  setBlocker: (blocker: Blocker | null) => void;
  guardedNavigate: (href: string, router: Router) => void;
} | null>(null);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const blockerRef = useRef<Blocker | null>(null);

  const setBlocker = useCallback((blocker: Blocker | null) => {
    blockerRef.current = blocker;
  }, []);

  const guardedNavigate = useCallback((href: string, router: Router) => {
    const proceed = () => router.push(href);
    if (blockerRef.current) {
      blockerRef.current(proceed);
    } else {
      proceed();
    }
  }, []);

  return (
    <UnsavedChangesContext.Provider value={{ setBlocker, guardedNavigate }}>
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChangesGuard() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    throw new Error("useUnsavedChangesGuard must be used within UnsavedChangesProvider");
  }
  return ctx;
}
