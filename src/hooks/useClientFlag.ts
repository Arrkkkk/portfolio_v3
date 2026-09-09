"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * Reads a browser-only boolean without a setState-in-effect cascade.
 * `read` is evaluated on the client only; the server always sees `false`.
 */
export function useClientFlag(read: () => boolean) {
  return useSyncExternalStore(
    noopSubscribe,
    () => read(),
    () => false,
  );
}
