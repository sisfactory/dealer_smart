# Dealer Smart — Especificação arquitetural aprovada

**Data:** 2026-09-21  
**Status:** design conversacional aprovado; aguardando revisão deste documento  
**Tipo:** arquitetura mestre; implementação dividida em fases

## 1. Objetivo

Construir um SaaS automotivo multitenant completo, com governança organizacional, CRM, veículos, atendimento comercial com IA, oficina, regras comerciais, integrações, relatórios e auditoria. Supabase é obrigatório para autenticação, banco e Storage. A interface deve reproduzir fielmente as referências fornecidas, nos modos claro e escuro, respeitando o design system normativo.

Esta especificação define as regras transversais. Cada fase de `docs/ROADMAP.md` terá especificação e plano próprios; não se tentará implementar o produto inteiro em uma única mudança.

## 2. Decisões aprovadas

### Arquitetura

- monólito modular em Next.js/TypeScript;
- Supabase Auth, PostgreSQL, Storage, Realtime e funções quando aplicável;
- domínio isolado de SDKs e provedores por casos de uso e adaptadores;
- Server Components por padrão;
- migrations como fonte de verdade do schema;
- ambientes separados de desenvolvimento, homologação e produção.

### Hierarquia obrigatória

```text
Tenant Proprietário da Plataforma
└── Contratante
    └── Grupo Empresarial
        └── Empresa
            └── Matriz
                └── Filial
```

Cada filho tem exatamente um pai. Uma Empresa pode possuir várias Matrizes. Uma Matriz pode possuir várias Filiais. A Contratante é a fronteira operacional do tenant; tabelas operacionais carregam `tenant_id` e relações usam FKs compostas.

### Governança cadastral

- cadastro completo de Contratante e hierarquia;
- consulta automática de CNPJ com 14 dígitos válidos pela BrasilAPI;
- endereço pelo ViaCEP;
- coordenadas pela BrasilAPI CEP v2;
- coordenadas ausentes permanecem nulas e pendentes;
- revisão e correção manual auditada;
- Grupo e Matriz com identidade visual própria;
- Filial herda obrigatoriamente a Matriz;
- Filial e Matriz têm CNPJs diferentes e compartilham a raiz de oito dígitos.

### Dados canônicos

- CNPJ, CPF, CEP, telefone e celular: somente dígitos;
- e-mail: `trim`, lowercase e formato válido;
- demais textos: `trim` sem alterar conteúdo legítimo;
- máscaras progressivas e exibição formatada em toda a UI;
- validação em cliente, servidor e constraints apropriadas no banco.

### Usuários e autenticação

- cadastro público desabilitado;
- sem convite ou confirmação por e-mail;
- criação por backend autorizado com `auth.admin.createUser` e `email_confirm: true`;
- senha temporária forte, exibida uma vez e nunca persistida em texto claro;
- troca obrigatória no primeiro acesso;
- dados cadastrais em `public.user_profiles`, vinculada por PK/FK a `auth.users(id)`;
- uma identidade pode ter memberships em mais de uma Contratante.

### Autorização

- RBAC define permissões padrão;
- ACL permite exceções por recurso/escopo;
- `deny` explícito prevalece;
- concessão nunca ultrapassa tenant ou autoridade do concedente;
- escopo superior herda apenas para descendentes;
- RLS é obrigatória nas tabelas expostas e não depende apenas do frontend.

### Auditoria

- interface administrativa em `/governanca/auditoria`;
- eventos append-only;
- antes/depois e campos alterados quando aplicável;
- ator, snapshot, tenant, escopo, resultado, justificativa, origem e correlação;
- segredos e credenciais sempre redigidos;
- exportação controlada e também auditada.

### Design

- `DESIGN.md` é a fonte de verdade;
- Headline: Outfit;
- Body: Plus Jakarta Sans;
- Label: Plus Jakarta Sans;
- HTMLs orientam estrutura; PNGs válidos confirmam aparência;
- quatro PNGs escuros inválidos não bloqueiam o projeto e são substituídos como referência pelos HTMLs correspondentes;
- mobile first, responsivo, claro/escuro e WCAG 2.2 AA.

## 3. Fluxo cadastral de CNPJ

```text
digitação → máscara progressiva → normalização → validação
→ BrasilAPI CNPJ → ViaCEP → BrasilAPI CEP v2
→ revisão humana → autorização → transação
→ auditoria + snapshot da consulta → resposta
```

Estados obrigatórios: incompleto, inválido, consultando, encontrado, não encontrado, indisponível, divergente, coordenadas pendentes e validado manualmente. Não haverá botão `Consultar`.

## 4. Segurança de dados

- menor privilégio em banco e Storage;
- `service_role` somente no servidor;
- `user_metadata` não autoriza;
- `TO authenticated` nunca aparece sem predicado de autorização;
- `UPDATE` usa `USING` e `WITH CHECK`;
- views expostas usam `security_invoker`;
- helpers privilegiados ficam em schema privado e recebem hardening explícito;
- FKs e colunas de RLS são indexadas;
- documentos privados usam URLs assinadas curtas;
- IA e RAG são isolados por tenant e tratam conteúdo como não confiável.

## 5. Consistência e falhas

- transações PostgreSQL curtas;
- efeitos externos por outbox/jobs idempotentes;
- webhooks deduplicados;
- Auth + perfil público com idempotência, compensação e reconciliação;
- integrações com timeout, retry limitado, backoff, métricas e fila de falhas;
- nenhum fallback fictício em produção;
- erros distinguem entrada inválida, não encontrado, indisponível, timeout, limite e divergência.

## 6. Qualidade

Testes cobrem normalização, documentos, hierarquia, RBAC, ACL, RLS, Storage, auditoria, integrações, acessibilidade, regressão visual e E2E por persona. Casos negativos entre tenants são obrigatórios.

CI bloqueia formatação, lint, tipos, testes, migrations, dependências, build, acessibilidade, RLS e regressão visual. Implementação local, migration aplicada, deploy, smoke autenticado, homologação e produção são gates distintos.

## 7. Documentos normativos

- `AGENTS.md` — regras operacionais;
- `DESIGN.md` — fonte visual;
- `docs/ARCHITECTURE.md` — arquitetura e dados;
- `docs/SECURITY_AND_AUTHORIZATION.md` — segurança e acesso;
- `docs/DEVELOPMENT_GUIDELINES.md` — engenharia e qualidade;
- `docs/ROADMAP.md` — fases;
- `docs/REFERENCE_AUDIT.md` — análise das fontes históricas.

## 8. Fora desta etapa

Esta especificação não autoriza nem declara executados: scaffold, instalação de dependências, criação de projeto Supabase, migrations locais ou remotas, secrets, deploy, smoke ou produção.

## 9. Critério para avançar

Após a revisão e aprovação explícita deste arquivo, o próximo passo é escrever o plano de implementação da Fase 0. O plano deverá ser revisado antes de qualquer código de produto.

