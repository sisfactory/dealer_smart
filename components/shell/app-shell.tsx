import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const mainContentId = "conteudo-principal";

function NavigationItems({ descriptionId }: { descriptionId: string }) {
  return (
    <ul className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <li>
        <a
          aria-current="page"
          className="block rounded-[4px] px-3 py-2 font-[family-name:var(--font-body)] text-sm leading-5 font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-card-high)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          href={`#${mainContentId}`}
        >
          Visão geral
        </a>
      </li>
      <li>
        <button
          aria-describedby={descriptionId}
          className="rounded-[4px] px-3 py-2 font-[family-name:var(--font-body)] text-sm leading-5 font-semibold text-[var(--text-muted)] disabled:cursor-not-allowed"
          disabled
          type="button"
        >
          Governança
        </button>
        <span className="sr-only" id={descriptionId}>
          indisponível nesta fase inicial
        </span>
      </li>
    </ul>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)]">
      <a
        className="sr-only fixed top-4 left-4 z-50 rounded-[4px] bg-[var(--color-primary)] px-4 py-2 font-[family-name:var(--font-body)] text-[var(--color-primary-foreground)] focus:not-sr-only focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        href={`#${mainContentId}`}
      >
        Pular para o conteúdo principal
      </a>
      <header className="border-b border-[var(--border-regular)] bg-[var(--surface-card)]">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          <p className="mr-auto min-w-0 truncate font-[family-name:var(--font-headline)] text-[length:var(--font-size-headline-sm)] leading-[var(--line-height-headline-sm)] font-semibold text-[var(--text-primary)]">
            Dealer Smart
          </p>
          <div className="shrink-0">
            <ThemeToggle />
          </div>
          <nav
            aria-label="Navegação principal"
            className="hidden w-full sm:block sm:w-auto"
          >
            <NavigationItems descriptionId="governanca-indisponivel-principal" />
          </nav>
          <details className="w-full sm:hidden">
            <summary className="w-fit cursor-pointer rounded-[4px] px-3 py-2 font-[family-name:var(--font-body)] text-sm leading-5 font-semibold text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]">
              Navegação
            </summary>
            <nav aria-label="Navegação móvel" className="mt-2">
              <NavigationItems descriptionId="governanca-indisponivel-movel" />
            </nav>
          </details>
        </div>
      </header>
      <main
        className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        id={mainContentId}
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
