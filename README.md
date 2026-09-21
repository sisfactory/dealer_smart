# Dealer Smart

Base local do Dealer Smart, um SaaS automotivo multitenant apoiado por
Supabase.

## Pré-requisitos

- Node.js 24.21.0 (consulte [`.node-version`](.node-version));
- Corepack habilitado para pnpm 12.5.1;
- Docker em execução para a stack local do Supabase.

## Início local

Instale as dependências reproduzíveis pelo lockfile:

```bash
corepack enable
corepack prepare pnpm@12.5.1 --activate
pnpm install
```

Crie o ambiente local a partir do exemplo, sem inserir chaves reais:

```bash
cp .env.example .env.local
```

Inicie a stack local do Supabase e use os valores locais exibidos pelo status
para completar o `.env.local`:

```bash
pnpm supabase:start
pnpm supabase:status
```

Inicie a aplicação:

```bash
pnpm dev
```

Execute os gates locais de qualidade e o conjunto Chromium:

```bash
pnpm verify
pnpm test:e2e
```

Pare a stack local quando terminar:

```bash
pnpm supabase:stop
```

## Mapa de documentação

1. [`AGENTS.md`](AGENTS.md) — regras obrigatórias para qualquer contribuição.
2. [`DESIGN.md`](DESIGN.md) — fonte de verdade visual e tipográfica.
3. [`docs/DEVELOPMENT_GUIDELINES.md`](docs/DEVELOPMENT_GUIDELINES.md) — padrões de engenharia, dados, validação, testes e operação.
4. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arquitetura, domínios, multitenancy e modelo de dados.
5. [`docs/SECURITY_AND_AUTHORIZATION.md`](docs/SECURITY_AND_AUTHORIZATION.md) — autenticação, RBAC, ACL, RLS, Storage e auditoria.
6. [`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md) — responsabilidades e gates de cada ambiente.
7. [`docs/ROADMAP.md`](docs/ROADMAP.md) — decomposição obrigatória das entregas.
8. [`docs/REFERENCE_AUDIT.md`](docs/REFERENCE_AUDIT.md) — análise das referências históricas do Stitch.

A especificação arquitetural aprovada está em [`docs/superpowers/specs/2026-09-21-dealer-smart-architecture-design.md`](docs/superpowers/specs/2026-09-21-dealer-smart-architecture-design.md).

## Limites desta etapa

Os comandos e os gates acima provam apenas o estado local. Eles não provam o
estado, a configuração, as migrations, a autenticação ou a segurança de nenhum
ambiente remoto. Projeto Supabase remoto, migrations remotas, deploy, smoke
autenticado e homologação permanecem gates separados que exigem autorização
explícita.
