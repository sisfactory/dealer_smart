import { AppShell } from "@/components/shell/app-shell";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="font-[family-name:var(--font-headline)] text-[length:var(--font-size-headline-xl-mobile)] leading-[var(--line-height-headline-xl-mobile)] font-semibold text-[var(--text-primary)] sm:text-[length:var(--font-size-headline-xl)] sm:leading-[var(--line-height-headline-xl)]">
            Dealer Smart
          </h1>
          <p className="max-w-2xl font-[family-name:var(--font-body)] text-[length:var(--font-size-body-lg)] leading-[var(--line-height-body-lg)] text-[var(--text-secondary)]">
            Fundação técnica
          </p>
        </div>
        <Card title="Visão geral">
          A fundação do Dealer Smart está preparada para as próximas fases do
          produto.
        </Card>
      </div>
    </AppShell>
  );
}
