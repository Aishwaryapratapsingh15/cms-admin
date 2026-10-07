import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// false during SSR/hydration, true afterwards — lets browser-only values
// (timezone-dependent formatting) render without a hydration mismatch.
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
