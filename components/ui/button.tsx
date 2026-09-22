"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

export function Button({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-[4px] bg-[var(--color-primary)] px-4 py-2 font-[family-name:var(--font-body)] text-[var(--color-primary-foreground)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
