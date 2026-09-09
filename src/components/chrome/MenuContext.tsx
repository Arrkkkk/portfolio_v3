"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const Ctx = createContext<{ open: boolean; toggle: () => void; close: () => void }>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, toggle, close }), [open, toggle, close]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMenu = () => useContext(Ctx);
