# Roadmap arquitetural

Este roadmap define dependências, não datas. Cada fase recebe especificação e plano próprios antes da implementação.

## Fase 0 — Fundação

- scaffold Next.js/TypeScript/Tailwind;
- projetos Supabase por ambiente;
- CI, lint, tipos, testes e build;
- design tokens, fontes e shell;
- clientes Supabase separados;
- convenções de módulos, erros e observabilidade.

**Gate:** aplicação base executável, temas e fontes validados, sem feature de negócio.

## Fase 1 — Governança multitenant

- Tenant Proprietário;
- Contratantes, Grupos, Empresas, Matrizes e Filiais;
- constraints e FKs compostas;
- BrasilAPI CNPJ, ViaCEP e BrasilAPI CEP v2;
- normalização, máscaras e estados de consulta;
- identidade visual e Storage.

**Gate:** isolamento estrutural e cadastro completo homologados.

## Fase 2 — Identidade, RBAC, ACL e auditoria

- `user_profiles`;
- criação administrativa sem confirmação por e-mail;
- senha temporária e primeiro acesso;
- memberships, papéis, permissões e ACLs;
- RLS e policies de Storage;
- auditoria append-only e interface administrativa.

**Gate:** testes negativos de isolamento e personas autenticadas aprovados.

## Fase 3 — Núcleo CRM

- clientes, contatos e leads;
- atividades e histórico;
- frotas;
- busca e notificações;
- importação controlada quando especificada.

**Gate:** jornada CRM fim a fim homologada por escopo.

## Fase 4 — Estoque e dossiê

- veículos e estoque;
- mídia e documentos;
- procedência e inspeções;
- dossiê;
- adaptador Dekra.

**Gate:** privacidade de documentos, Storage e dossiê homologados.

## Fase 5 — Atendimento comercial com IA

- inbox e conversas;
- qualificação e distribuição;
- takeover humano atômico;
- regras de atuação da IA;
- mensageria por adaptador;
- auditoria de decisões automatizadas.

**Gate:** nenhum envio duplicado, vazamento entre tenants ou decisão fora da política.

## Fase 6 — Oficina

- agenda;
- ordem de serviço;
- etapas e técnicos;
- veículos e responsáveis;
- comunicação e histórico.

**Gate:** conflitos de agenda e escopo tratados corretamente.

## Fase 7 — Regras comerciais e FIPE

- fonte FIPE por adaptador;
- avaliações e preços;
- políticas versionadas;
- limites de negociação;
- aprovações e desafios de uso único;
- rastreabilidade de decisões.

**Gate:** cálculos determinísticos e aprovações concorrentes testados.

## Fase 8 — Integrações avançadas e conhecimento

- DMS;
- ingestão e RAG isolados por tenant;
- webhooks e filas;
- reprocessamento;
- configuração e saúde dos provedores.

**Gate:** isolamento, idempotência e recuperação de falhas homologados.

## Fase 9 — Dashboard e preparação operacional

- indicadores por escopo;
- relatórios e exportações;
- desempenho e acessibilidade final;
- backup e restauração testados;
- observabilidade e runbooks;
- smoke autenticado por persona.

**Gate:** homologação formal. Deploy técnico, smoke e aceite funcional são evidências distintas.

## Regra de passagem

Uma fase só inicia implementação após sua especificação escrita ser aprovada. Uma fase só promove ambiente após migrations, testes, segurança, acessibilidade e critérios de aceite correspondentes passarem.

