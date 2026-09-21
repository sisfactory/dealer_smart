# Auditoria das referências históricas

## Escopo analisado

As referências permanecem fora deste repositório, em:

`/Users/andersonfreitas/Desktop/EmDesenvolvimento/Compyware/dealer_smart/docs/stitch_elegance_ai_automotive_crm`

Foram considerados os manuais, handoff técnico, contratos TypeScript/Zod, design system bimodal, mapas homologados, arquivos `DESIGN.md`, HTMLs e PNGs das seguintes áreas:

- dashboard geral;
- atendimento de vendas com IA;
- clientes e frotas;
- agendamento de oficina;
- regras comerciais e FIPE;
- configuração de IA e integrações;
- dossiê do veículo;
- logo e referências de identidade.

## O que foi preservado

- linguagem visual executiva e automotiva;
- composição das telas e seus modos claro/escuro;
- módulos funcionais propostos;
- intenção de usar Supabase;
- integrações com mensageria, Dekra, FIPE e DMS/RAG;
- contratos tipados como objetivo de fronteira;
- necessidade de rastreabilidade e operação assistida por IA.

## Correções normativas

### Stack

A referência antiga indicava Next.js 14 e Tailwind 3.4. Next.js 14 está fora da política de suporte atual. A base normativa passa a ser Next.js 16 Active LTS, Node.js 24 LTS e Tailwind CSS 4.3, com versões exatas fixadas no momento do scaffold.

### Tipografia

Algumas telas usam famílias divergentes. `DESIGN.md` prevalece:

- Headline: Outfit;
- Body: Plus Jakarta Sans;
- Label: Plus Jakarta Sans.

A paleta bimodal, a escala tipográfica, a forma e o espaçamento homologados foram consolidados no `DESIGN.md` do projeto. Exemplos históricos que usem tokens ou famílias divergentes não prevalecem.

### Multitenancy

Policies históricas amplas, baseadas apenas em usuário autenticado, não atendem ao produto. A arquitetura atual exige Tenant Proprietário, Contratante, Grupo, Empresa, Matriz e Filial, com `tenant_id`, FKs compostas, RBAC, ACL e RLS.

### Supabase

- `auth.role()` não deve ser usado;
- `TO authenticated` isolado não autoriza acesso ao recurso;
- views expostas precisam de `security_invoker`;
- `service_role` permanece exclusivamente server-side;
- dados completos do usuário ficam em `public.user_profiles` vinculada a `auth.users`;
- criação administrativa usa `auth.admin.createUser` com e-mail confirmado e sem convite.

### Segredos e recursos remotos

HTMLs de protótipo contêm valores semelhantes a credenciais e dependências por CDN/hotlink. Nenhum desses valores pode ser copiado. Se alguma chave for real, deve ser rotacionada. Assets de produção serão internos ou armazenados de forma controlada.

### Contratos e schema

Os contratos históricos são referências conceituais, não schema executável. Há lacunas entre telas, tipos e tabelas. O schema será criado exclusivamente por migrations a partir das diretrizes atuais.

### Acessibilidade

Os protótipos não cobrem integralmente semântica, teclado, foco, contraste e responsividade. WCAG 2.2 AA e os estados completos definidos em `DESIGN.md` são requisitos adicionais obrigatórios.

## Arquivos inválidos

As quatro tentativas de download abaixo resultaram em texto ASCII, não em imagens PNG válidas:

- `agendamento_oficina_modo_escuro_aureus_crm/screen.png`;
- `atendimento_vendas_ia_modo_escuro_aureus_crm/screen.png`;
- `clientes_frotas_vip_dark_mode_aureus_crm/screen.png`;
- `dashboard_geral_modo_escuro_aureus_crm/screen.png`.

Os respectivos `code.html` são a referência exclusiva do modo escuro dessas telas. Isso não bloqueia o projeto.

## Precedência final

1. requisitos explícitos mais recentes do proprietário do produto;
2. documentos normativos deste repositório;
3. HTMLs históricos;
4. PNGs históricos válidos;
5. demais textos históricos.

## Referências técnicas atuais

- [Next.js Support Policy](https://nextjs.org/support-policy)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [Tailwind CSS Blog](https://tailwindcss.com/blog)
- [Supabase Changelog](https://supabase.com/changelog)
- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase Admin createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [BrasilAPI](https://brasilapi.com.br/docs)
- [ViaCEP](https://viacep.com.br/)
