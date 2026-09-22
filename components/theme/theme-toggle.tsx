"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";

const subscribeToMount = () => () => undefined;

export function ThemeToggle() {
  const isMounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();

  if (!isMounted) {
    return <span aria-hidden="true" className="inline-block h-10 w-44" />;
  }

  const isDark = resolvedTheme === "dark";
  const destination = isDark ? "claro" : "escuro";

  return (
    <button
      type="button"
      className="h-10 w-44 rounded-[4px] border border-[var(--border-regular)] bg-[var(--surface-card)] px-3 py-2 font-[family-name:var(--font-body)] text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      Ativar modo {destination}
    </button>
  );
}
