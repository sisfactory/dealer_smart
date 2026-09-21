import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type CardProps = Omit<ComponentProps<"article">, "title"> & {
  title: string;
  children: ReactNode;
};

export function Card({ className, title, children, ...props }: CardProps) {
  const titleId = useId();

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "rounded-[8px] border border-[var(--border-regular)] bg-[var(--surface-card)] p-4",
        className,
      )}
      {...props}
    >
      <h2
        id={titleId}
        className="font-[family-name:var(--font-headline)] text-[length:var(--font-size-headline-sm)] leading-[var(--line-height-headline-sm)] font-semibold text-[var(--text-primary)]"
      >
        {title}
      </h2>
      <div className="mt-2 text-[length:var(--font-size-body-md)] leading-[var(--line-height-body-md)] text-[var(--text-secondary)]">
        {children}
      </div>
    </article>
  );
}
