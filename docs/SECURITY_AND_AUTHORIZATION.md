# Segurança, autenticação, autorização e auditoria

## 1. Princípio central

Segurança é aplicada em camadas: cliente, servidor, PostgreSQL e Storage. Verificação visual ou middleware de rota não substitui autorização na operação e no banco.

## 2. Autenticação Supabase

- Cadastro público desabilitado.
- Confirmação de e-mail e fluxo de convite não participam do provisionamento administrativo.
- O backend autorizado cria terceiros com `supabase.auth.admin.createUser({ email, password, email_confirm: true })`.
- `inviteUserByEmail()` não deve ser usado nesse fluxo.
- O cliente administrativo usa credencial privilegiada somente no servidor.
- Uma identidade global pode receber memberships em mais de uma Contratante; não duplicar usuário por tenant.

Fluxo de criação:

1. validar e normalizar e-mail e perfil;
2. autorizar o administrador por RBAC, ACL e escopo;
3. gerar senha temporária criptograficamente forte;
4. criar `auth.users` com e-mail confirmado;
5. criar `user_profiles`, membership e papéis;
6. registrar auditoria e idempotency key;
7. exibir a senha uma única vez, sem log ou persistência em texto claro;
8. exigir troca no primeiro login.

Enquanto `must_change_password` estiver ativo, todas as operações normais devem ser negadas também no backend/banco; liberar apenas a jornada estritamente necessária para atualizar a senha, concluir o perfil e encerrar a sessão.

Se a etapa pública falhar após a criação em Auth, o caso de uso tenta compensação segura ou registra item de reconciliação. Retry com a mesma idempotency key não pode criar outro usuário.

## 3. Perfil cadastral

`public.user_profiles.id` é PK e FK para `auth.users(id)`, usando apenas a PK estável administrada pelo Supabase e `on delete cascade`. A tabela contém dados de negócio como nome completo, CPF, RG, órgão emissor, telefone, celular, avatar, locale, timezone, status e `must_change_password`.

`auth.users` continua responsável por identidade e credenciais. `user_profiles` é protegido por RLS. Autorização não usa `raw_user_meta_data`; `app_metadata` pode carregar apenas hints controlados pelo servidor, nunca ser a única decisão para operações sensíveis.

Auditorias preservam snapshot mínimo do ator para que desativação ou eliminação posterior não destrua rastreabilidade.

## 4. RBAC

Estruturas mínimas:

- `permissions` — capacidade atômica, como `audit.read`;
- `roles` — papel pertencente à plataforma ou tenant;
- `role_permissions` — permissões do papel;
- `user_memberships` — vínculo do usuário com tenant e escopo;
- `membership_roles` — papéis associados ao vínculo.

Papéis não devem ser codificados em condicionais espalhadas. O código verifica permissões; seeds/migrations definem os papéis iniciais.

## 5. ACL

`acl_entries` representa exceções específicas e contém:

- tenant;
- sujeito usuário ou papel;
- recurso/tipo de recurso;
- ação;
- efeito `allow` ou `deny`;
- escopo;
- justificativa;
- início e expiração;
- autor e timestamps.

Regras:

- `deny` explícito prevalece sobre qualquer `allow`;
- ACL nunca atravessa o tenant;
- o concedente não pode delegar capacidade ou escopo que não possui;
- uma ACL expirada não produz efeito;
- concessões críticas são temporárias quando aplicável e sempre auditadas;
- ACL complementa o RBAC, não substitui RLS.

## 6. Avaliação efetiva

Uma operação só é autorizada quando todas as condições são verdadeiras:

1. sessão e usuário ativos;
2. perfil ativo e primeiro acesso concluído;
3. membership ativo na Contratante;
4. recurso pertence ao mesmo tenant;
5. escopo inclui o recurso pela hierarquia descendente;
6. não existe ACL `deny` aplicável;
7. existe permissão RBAC ou ACL `allow` válida;
8. invariantes específicas do domínio foram atendidas.

## 7. RLS e PostgreSQL

- RLS em toda tabela exposta, inclusive tabelas auxiliares.
- Policies indicam `TO authenticated`; não usar `auth.role()`.
- `TO authenticated` sem predicado é proibido.
- `UPDATE` exige policies de `SELECT`, `USING` e `WITH CHECK`.
- Chamadas estáveis como `auth.uid()` devem usar `(select auth.uid())` nas policies.
- Colunas usadas por RLS e FKs devem ser indexadas.
- Helpers complexos ficam em schema privado.
- `SECURITY DEFINER` requer necessidade comprovada, `search_path = ''`, checagem explícita do chamador e `EXECUTE` revogado por padrão.
- Views expostas usam `security_invoker = true`.
- Funções privilegiadas nunca aceitam `tenant_id` como confiança suficiente; derivam e validam o escopo do ator.
- Testes negativos entre tenants são obrigatórios para `SELECT`, `INSERT`, `UPDATE` e `DELETE`.

## 8. Storage

Objetos seguem caminho canônico com tenant e domínio, por exemplo:

```text
tenant/{tenant_id}/branding/{brand_profile_id}/{asset_id}
tenant/{tenant_id}/vehicles/{vehicle_id}/{asset_id}
```

Policies validam membership, tenant, ação e escopo. Documentos e dossiês são privados e usam URLs assinadas curtas. Logos podem ser públicos somente por decisão explícita; o upload e a alteração permanecem protegidos. Upsert requer policies de `INSERT`, `SELECT` e `UPDATE`.

Tipo MIME, extensão, assinatura real, tamanho e dimensões devem ser validados no servidor. Nome fornecido pelo usuário não é usado como caminho confiável.

## 9. Auditoria

`audit_events` é append-only e registra:

- ator, snapshot do ator e método de autenticação;
- tenant e escopo organizacional;
- ação, entidade e identificador;
- resultado e justificativa;
- `before_data` e `after_data` quando aplicável;
- campos alterados;
- origem, IP e user agent quando disponíveis;
- `request_id`/`correlation_id`;
- timestamp UTC.

Senhas, tokens, chaves, segredos e credenciais nunca entram em antes/depois. Dados pessoais podem ser armazenados apenas na medida necessária e sua visualização é restrita.

A aplicação não recebe `UPDATE` ou `DELETE` em auditoria. Retenção, particionamento e arquivamento serão definidos por volume e obrigação legal sem quebrar imutabilidade.

## 10. Interface administrativa de auditoria

Rota normativa: `/governanca/auditoria`.

Recursos:

- filtros por tenant, escopo, ator, ação, recurso, resultado, origem, período e correlação;
- paginação por cursor;
- detalhe lado a lado de antes/depois;
- destaque dos campos alterados;
- mascaramento conforme permissão do auditor;
- exportação CSV/JSON controlada e auditada;
- estados vazio, erro, carregamento e sem permissão.

## 11. Sessões e usuários desativados

Desativar apenas `user_profiles` não basta. O fluxo deve impedir novas autenticações/refreshes conforme recurso do Supabase e considerar que JWT já emitido permanece válido até expirar. Operações sensíveis verificam estado de sessão e perfil atual. Expiração de access token deve ser curta e proporcional ao risco.

## 12. Referências oficiais

- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase Admin createUser](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Security](https://supabase.com/docs/guides/security/product-security)
