# Arquitetura do Dealer Smart

## 1. Visão geral

O Dealer Smart será um monólito modular web, multitenant, com fronteiras de domínio explícitas. A aplicação utiliza Next.js no frontend e backend web e Supabase para autenticação, PostgreSQL, Storage, Realtime e funções server-side quando necessárias.

A escolha por monólito modular reduz complexidade operacional no início sem misturar responsabilidades. Módulos conversam por casos de uso e contratos tipados; não acessam internals uns dos outros.

## 2. Stack de referência

- Next.js 16, atualmente em Active LTS;
- React 19;
- Node.js 24 LTS;
- TypeScript estrito, em versão estável compatível com a stack;
- Tailwind CSS 4.3;
- Supabase JS e integração SSR oficial;
- Zod para contratos de entrada e saída;
- pnpm, versões fixadas e lockfile versionado;
- Vitest, Testing Library, Playwright e testes PostgreSQL/RLS.

Versões exatas serão pinadas no scaffold. Antes de atualizar dependências, conferir suporte oficial, changelogs e incompatibilidades.

## 3. Organização sugerida

```text
app/                       rotas, layouts e composição
modules/                   domínios isolados
  governance/
  identity-access/
  crm/
  vehicles/
  sales-ai/
  workshop/
  commercial/
  integrations/
  audit/
components/ui/             componentes primitivos
components/shell/          navegação e layout
lib/supabase/              clientes browser/server/admin separados
lib/integrations/          contratos e adaptadores
lib/validation/            schemas e normalização compartilhados
supabase/migrations/       schema versionado
supabase/functions/        funções server-side
supabase/tests/            testes de banco, RLS e Storage
tests/e2e/                 jornadas por persona
docs/                      decisões normativas
```

Views e componentes não acessam diretamente o banco ou provedores. O fluxo padrão é:

```text
UI → schema de entrada → autorização → caso de uso → repositório/adaptador
   → transação → auditoria/outbox → resposta tipada → apresentação
```

## 4. Hierarquia multitenant

```text
Tenant Proprietário da Plataforma
└── Contratante
    └── Grupo Empresarial
        └── Empresa
            └── Matriz
                └── Filial
```

Regras invariáveis:

- existe um Tenant Proprietário superior, responsável pela plataforma;
- cada Contratante pertence à plataforma e constitui a fronteira de isolamento dos dados operacionais;
- cada filho possui exatamente um pai direto;
- uma Empresa pode possuir várias Matrizes;
- uma Matriz pode possuir várias Filiais;
- uma Filial pertence a uma única Matriz;
- acesso em nível superior pode abranger descendentes, nunca ascendentes ou organizações irmãs sem concessão explícita;
- acesso do Tenant Proprietário a dados de Contratantes deve ser explícito, justificado, temporário quando aplicável e auditado.

Toda tabela operacional contém `tenant_id`. Relações internas usam FKs compostas, por exemplo `(tenant_id, headquarters_id)`, para que um identificador válido de outro tenant não possa ser associado.

## 5. Entidades estruturais

| Entidade | Responsabilidade |
|---|---|
| `platform_tenants` | proprietário da plataforma |
| `contractor_tenants` | concessionária contratante e fronteira operacional |
| `business_groups` | agrupamento empresarial da contratante |
| `companies` | empresa pertencente ao grupo |
| `headquarters` | matriz pertencente à empresa |
| `branches` | filial vinculada à matriz |
| `brand_profiles` | identidade visual versionada |
| `brand_assets` | referência segura a logos e ativos |
| `addresses` | endereço canônico normalizado |
| `address_lookup_snapshots` | evidência controlada das consultas externas |
| `user_profiles` | cadastro completo vinculado a `auth.users(id)` |
| `user_memberships` | vínculo do usuário com tenant e escopo |
| `roles` / `permissions` | RBAC configurável |
| `acl_entries` | exceções de acesso por sujeito, recurso e ação |
| `audit_events` | trilha append-only com antes/depois |

Entidades mutáveis usam status ativo/inativo e datas de vigência quando necessário. Registros de auditoria, eventos e relações históricas seguem sua semântica própria e não recebem soft delete artificial.

## 6. Regras de CNPJ

- O valor canônico tem 14 dígitos e deve passar pelo algoritmo de validação dos dígitos verificadores.
- Grupo e Matriz possuem CNPJs completos distintos.
- Filial e sua Matriz compartilham a raiz de oito dígitos.
- Filial e Matriz possuem CNPJ completo diferente; os seis últimos dígitos diferem.
- A regra de raiz é validada no servidor e protegida no banco.
- Unicidade é definida no escopo correto e deve considerar registros ativos e históricos conforme a política de ciclo de vida.
- A aplicação não deve presumir que toda Matriz termina em `0001`; a regra normativa é a raiz compartilhada com suas Filiais.

Exemplo: `05.891.726/0001-85` é persistido como `05891726000185`. Uma filial como `05.891.726/0002-66` é persistida como `05891726000266`.

## 7. Domínios funcionais

- **Governança:** contratantes, grupos, empresas, matrizes, filiais e identidade visual.
- **Identidade e acesso:** usuários, perfis, memberships, RBAC, ACL e escopo.
- **CRM:** clientes, contatos, leads, atividades, histórico e frotas.
- **Veículos:** estoque, documentação, mídia, procedência, inspeções e dossiê.
- **Vendas com IA:** inbox, conversas, qualificação, distribuição e takeover humano.
- **Oficina:** agendamento, ordens, etapas, técnicos e comunicação.
- **Comercial:** FIPE, avaliação, preço, limites, regras e aprovações.
- **Integrações:** BrasilAPI, ViaCEP, mensageria, Dekra, DMS e webhooks.
- **Auditoria:** eventos imutáveis, consulta administrativa e exportação controlada.
- **Plataforma:** dashboard, notificações, busca e saúde operacional.

## 8. Modelo de dados operacional

Cada módulo define tabelas próprias, todas com convenções comuns:

- PK `uuid` gerada no banco;
- `tenant_id` obrigatório em dados de Contratantes;
- `created_at` e `updated_at` em `timestamptz` UTC;
- `created_by` e `updated_by` quando houver ator humano;
- status com enum/check ou tabela de referência, não texto livre;
- constraints para invariantes simples;
- FKs para integridade relacional;
- índices em FKs, colunas de RLS, filtros frequentes e ordenação;
- índices compostos com igualdade antes de intervalos;
- paginação por cursor para listas extensas;
- JSONB somente para payloads variáveis ou snapshots, nunca como substituto automático do modelo relacional.

Datas e valores financeiros usam tipos adequados. Dinheiro usa unidade e moeda explícitas e nunca `float`.

## 9. Identidade visual

Cada Grupo possui perfil visual configurável. Cada Matriz possui perfil próprio. A resolução segue Matriz → Grupo → padrão da plataforma. A Filial sempre herda integralmente a Matriz e não possui override.

Logos são armazenados no Supabase Storage. O banco guarda metadados, versão, status e referência ao objeto; não armazena binário em tabelas operacionais.

## 10. Integrações e fluxo cadastral

Ao completar um CNPJ válido:

1. normalizar para 14 dígitos;
2. validar dígitos verificadores;
3. consultar BrasilAPI CNPJ;
4. normalizar o CEP retornado;
5. consultar ViaCEP para endereço completo;
6. consultar BrasilAPI CEP v2 para coordenadas;
7. apresentar dados para revisão;
8. permitir correção manual identificada e auditada;
9. persistir dados canônicos e metadados da consulta.

ViaCEP é a fonte primária de endereço. BrasilAPI CEP v2 é a fonte de coordenadas. Se não houver coordenadas, o cadastro permanece válido com status `coordinates_pending`; latitude e longitude ficam nulas.

Integrações executam apenas no servidor, com timeout, retry limitado com backoff e jitter, circuit breaker quando justificável, idempotência e fila de falhas. Respostas externas são validadas por schemas; dados externos nunca são confiáveis por padrão.

Credenciais permanecem em cofre/variáveis server-side. Chaves encontradas em HTMLs históricos não podem ser copiadas; caso sejam reais, devem ser rotacionadas.

## 11. Eventos e consistência

- Mutações que atualizam várias tabelas do PostgreSQL usam transação.
- Efeitos externos usam outbox/idempotência, não chamadas frágeis dentro de transações longas.
- Webhooks registram identificador do provedor e rejeitam duplicatas.
- Criação de Auth e perfil público usa operação idempotente com compensação, pois Admin API e transação PostgreSQL não são uma única transação.
- Datas e correlação trafegam em UTC; localização ocorre na borda de apresentação.

## 12. IA e RAG

- Políticas comerciais e limites são determinísticos; o modelo não redefine regras.
- Toda ação proposta pela IA que altera estado passa por caso de uso autorizado.
- Aprovações críticas usam desafios de uso único, com hash, expiração e consumo atômico.
- Takeover humano é atômico e impede respostas simultâneas da IA.
- Conteúdo externo e documentos RAG são tratados como entrada não confiável.
- Índices e buscas de conhecimento são isolados por tenant e escopo.
- Dados pessoais são minimizados ou redigidos antes de envio a provedores.
- Prompts, versão do modelo, ferramentas usadas, decisão e resultado são auditáveis sem registrar segredos.

## 13. Referências oficiais

- [Next.js Support Policy](https://nextjs.org/support-policy)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [Tailwind CSS Blog](https://tailwindcss.com/blog)
- [Supabase Documentation](https://supabase.com/docs)
- [BrasilAPI CNPJ OpenAPI](https://github.com/BrasilAPI/BrasilAPI/blob/main/pages/docs/doc/cnpj.json)
- [ViaCEP](https://viacep.com.br/)
