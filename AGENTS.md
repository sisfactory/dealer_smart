# Diretrizes obrigatórias do Dealer Smart

Estas regras são normativas para pessoas e agentes que alterem este projeto.

## Fontes de verdade

- `DESIGN.md` prevalece para tipografia, tokens e comportamento visual.
- Os HTMLs e PNGs históricos orientam composição e aparência, mas não prevalecem sobre `DESIGN.md`.
- `docs/ARCHITECTURE.md` prevalece para arquitetura e multitenancy.
- `docs/SECURITY_AND_AUTHORIZATION.md` prevalece para autenticação, autorização e auditoria.
- Migrations versionadas são a única fonte de verdade do schema.
- Em conflito, requisito explícito mais recente do proprietário do produto prevalece e deve ser incorporado à documentação antes do código.

## Requisitos inegociáveis

- Supabase será usado para Auth, PostgreSQL, Storage, Realtime e funções server-side quando aplicável.
- A hierarquia é: Tenant Proprietário da Plataforma → Contratante → Grupo Empresarial → Empresa → Matriz → Filial.
- Uma Matriz pode ter várias Filiais; cada filho possui exatamente um pai direto.
- Toda tabela operacional deve carregar `tenant_id` e ser protegida por RLS.
- Permissões combinam RBAC, ACL e escopo hierárquico. Negação explícita prevalece.
- A aplicação deve funcionar em modo claro e escuro e seguir `DESIGN.md`.
- Headline usa Outfit. Body e Label usam Plus Jakarta Sans.

## Dados cadastrais

- Máscaras são exclusivamente visuais.
- CNPJ, CPF, CEP, telefone e celular são persistidos somente com dígitos.
- E-mail é persistido com `trim` e em lowercase e somente quando válido.
- Demais textos recebem apenas `trim`; conteúdo legítimo não pode ser alterado silenciosamente.
- CNPJ e CEP são consultados automaticamente quando atingem 14 e 8 dígitos válidos. Não criar botão `Consultar`.
- CNPJ usa BrasilAPI. Endereço usa ViaCEP. Coordenadas usam BrasilAPI CEP v2.
- Coordenadas ausentes permanecem pendentes; nunca inventar latitude ou longitude.
- Campos CNPJ, CPF, CEP, telefone e celular usam máscara progressiva na digitação e são exibidos formatados em toda a interface.
- Distinguir entrada inválida, não encontrada e serviço indisponível.

## Autenticação e usuários

- Cadastro público permanece desabilitado.
- Usuários administrativos são criados no backend com `auth.admin.createUser`, `email_confirm: true` e sem convite.
- A `service_role` nunca pode ser exposta no cliente, em logs ou commits.
- Dados cadastrais completos pertencem a `public.user_profiles`, vinculada a `auth.users(id)`.
- Senha temporária forte é exibida uma única vez, nunca persistida ou registrada, e deve ser alterada no primeiro acesso.
- `user_metadata` nunca participa de decisões de autorização.

## Banco e segurança

- Habilitar RLS em toda tabela de schema exposto e aplicar menor privilégio.
- `TO authenticated` sozinho não é autorização; toda policy precisa de predicado de tenant, vínculo e escopo.
- Policies de `UPDATE` exigem `USING` e `WITH CHECK`.
- Não usar `auth.role()`.
- Views expostas usam `security_invoker = true`.
- `SECURITY DEFINER` só é permitido em schema privado, com `search_path` fixo, checagem explícita de identidade e privilégios revogados por padrão.
- Indexar chaves estrangeiras e colunas usadas por RLS.
- Relações hierárquicas devem usar FKs compostas com `tenant_id` para impedir referências entre tenants.
- Alterações cadastrais e de autorização devem produzir auditoria imutável com antes/depois quando aplicável.

## Desenvolvimento

- TypeScript permanece em modo estrito; não usar `any` como atalho.
- Validação no cliente nunca substitui validação no servidor e no banco.
- UI não acessa diretamente provedores externos; usar casos de uso e adaptadores server-side.
- Não copiar CDN, scripts embutidos, hotlinks ou segredos dos protótipos.
- Dependências usam versões fixadas e lockfile versionado.
- Implementar por fases conforme `docs/ROADMAP.md`; cada fase requer especificação e aceite próprios.
- Preservar alterações existentes. Não executar commit, push, deploy, migrations remotas ou mudanças externas sem autorização correspondente.

## Critério de conclusão

Uma funcionalidade só está concluída quando possui autorização no servidor e banco, testes proporcionais ao risco, auditoria quando necessária, estados completos de UI, documentação atualizada e validação responsiva nos modos claro e escuro.


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
