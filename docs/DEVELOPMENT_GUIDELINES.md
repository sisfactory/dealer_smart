# Diretrizes de desenvolvimento

## 1. Objetivo

Estas diretrizes transformam as referências históricas do Dealer Smart em regras implementáveis, seguras e testáveis. São obrigatórias em todas as fases descritas no roadmap.

## 2. Fronteiras de código

- Um módulo possui interface pública pequena e responsabilidades claras.
- UI depende de casos de uso, não de queries ou SDKs de provedores.
- Casos de uso recebem dependências por interfaces e retornam resultados tipados.
- Adaptadores convertem protocolos externos em contratos internos.
- Erros de domínio possuem códigos estáveis; textos de UI são traduzidos na borda.
- Componentes de página não concentram regras de negócio.
- Server Components são padrão; adicionar estado no cliente somente por necessidade de interação.

## 3. Contratos e validação

- TypeScript em modo estrito.
- Zod nas fronteiras HTTP, server actions, jobs, webhooks e integrações.
- Validar novamente no servidor mesmo quando o cliente já validou.
- Constraints do PostgreSQL protegem invariantes que não podem depender do código.
- Respostas externas são tratadas como `unknown` até validação.
- Não usar coerção silenciosa que transforme valor inválido em dado aparentemente válido.

## 4. Normalização canônica

Antes da persistência:

| Campo | Regra canônica |
|---|---|
| CNPJ | somente 14 dígitos e dígitos verificadores válidos |
| CPF | somente 11 dígitos e dígitos verificadores válidos |
| CEP | somente 8 dígitos |
| telefone/celular | somente dígitos, com tamanho permitido validado |
| e-mail | `trim`, lowercase e formato válido |
| textos | somente espaços periféricos removidos |

Exemplos:

- `(69) 99999-7555` → `69999997555`;
- `05.891.726/0001-85` → `05891726000185`;
- `029.830.977-07` → `02983097707`;
- `76.871-002` → `76871002`.

Máscaras são aplicadas na apresentação, nunca persistidas. Formatadores compartilhados são usados em inputs, edição, listas, relatórios, títulos e cabeçalhos.

E-mail inválido não pode ser persistido. Validação de sintaxe não afirma que a caixa postal existe.

## 5. Consultas automáticas

- CNPJ: consultar automaticamente ao completar 14 dígitos válidos.
- CEP: consultar automaticamente ao completar 8 dígitos válidos.
- Debounce e cancelamento evitam chamadas duplicadas durante edição.
- Repetir o mesmo valor dentro da validade do cache não dispara nova consulta desnecessária.
- Não existe botão `Consultar`.
- O usuário pode revisar e corrigir dados retornados; correção manual exige origem e auditoria.

Estados de resultado não podem ser colapsados em “erro”: inválido, não encontrado, indisponível, timeout, limite, divergente e coordenadas pendentes são diferentes.

## 6. Transações e concorrência

- Mutações relacionadas usam transações curtas.
- Não manter transação aberta durante chamada HTTP externa.
- Operações suscetíveis a repetição usam idempotency key e constraint única.
- Atualizações concorrentes críticas usam versão/lock apropriado e retornam conflito compreensível.
- Jobs usam claim atômico ou `SKIP LOCKED` quando houver múltiplos workers.
- Deadlocks são evitados atualizando recursos sempre na mesma ordem.

## 7. Banco e migrations

- Toda mudança de schema nasce em migration versionada.
- Criar migration com o comando oficial da CLI disponível; não inventar formato baseado em memória.
- Migrations são revisáveis, determinísticas e compatíveis com rollout progressivo.
- PostgreSQL não suporta `ADD CONSTRAINT IF NOT EXISTS`; verificar `pg_constraint` quando idempotência for necessária.
- FKs não criam índices automaticamente; criar índices correspondentes.
- Não versionar explicitamente extensões Supabase quando a plataforma ignorar essa versão.
- Rodar advisors de segurança e desempenho antes de promover migrations.
- Nunca usar o banco de produção como ambiente de descoberta.

## 8. Supabase

- Projetos separados para desenvolvimento, homologação e produção.
- Chaves publicáveis podem estar no cliente; secret/service role somente no servidor.
- Clientes Supabase browser, server e admin ficam em módulos distintos.
- Cookies SSR usam integração oficial e opções seguras.
- RLS permanece ativa mesmo quando o servidor realiza a operação com sessão do usuário.
- O uso de `service_role` é restrito a casos administrativos explícitos e auditáveis.
- Não modificar objetos internos dos schemas `auth`, `storage` ou `realtime`, salvo interfaces oficialmente suportadas.
- Antes de atualização relevante, revisar o changelog do Supabase por breaking changes.

## 9. Integrações

Todo provedor implementa uma porta interna. O domínio não conhece URLs, formatos ou SDKs específicos.

Obrigatório:

- timeout por tentativa;
- retry apenas para falhas transitórias e operações idempotentes;
- backoff com jitter;
- rate limiting;
- circuit breaker quando o impacto justificar;
- métricas por provedor;
- payload validado e sanitizado;
- segredos redigidos;
- dead-letter/reprocessamento para jobs;
- webhook autenticado, idempotente e auditável.

Mocks somente em testes e explicitamente identificados. Produção não pode esconder indisponibilidade com dados fictícios.

## 10. Erros e experiência

Cada resultado de operação usa um código estável, por exemplo `CNPJ_INVALID`, `CNPJ_NOT_FOUND`, `PROVIDER_UNAVAILABLE`, `FORBIDDEN_SCOPE` ou `VERSION_CONFLICT`.

- Mensagem ao usuário explica o que ocorreu e ação possível.
- Log técnico contém correlação e causa sem dados sensíveis.
- Erros esperados não viram exceções genéricas.
- Formulários preservam dados válidos após falha.
- A interface nunca informa sucesso antes da confirmação da operação.

## 11. Testes

### Unitários

- máscaras, normalização e formatadores;
- CPF/CNPJ e raiz Matriz–Filial;
- e-mail;
- resolução de marca;
- avaliação RBAC/ACL;
- regras comerciais determinísticas.

### Banco

- constraints e FKs compostas;
- RLS entre tenants e níveis hierárquicos;
- precedência de `deny`;
- `USING` e `WITH CHECK`;
- policies do Storage;
- imutabilidade e antes/depois da auditoria.

### Integração

- BrasilAPI CNPJ;
- ViaCEP;
- BrasilAPI CEP v2 sem coordenadas;
- criação idempotente de Auth + perfil;
- webhooks duplicados;
- falhas transitórias e reconciliação.

### UI e E2E

- componentes e acessibilidade;
- regressão visual claro/escuro;
- viewports do `DESIGN.md`;
- jornadas por persona e escopo;
- primeiro acesso e troca obrigatória de senha;
- administração de auditoria.

Testes de autorização devem privilegiar casos negativos. Uma policy não está validada apenas porque o acesso permitido funciona.

## 12. CI e gates

O pipeline bloqueia promoção quando falham formatação, lint, tipos, testes, build, migrations, auditoria de dependências, checks de RLS, acessibilidade ou regressão visual aprovada.

Estados são reportados separadamente:

- implementação local;
- testes locais;
- migration aplicada;
- deploy;
- smoke autenticado;
- homologação;
- produção.

Um estado não prova o seguinte.

## 13. Observabilidade

- Logs estruturados com `correlation_id`.
- Métricas de latência, erro, saturação, filas e provedores.
- Traces nas jornadas críticas quando disponíveis.
- Alertas acionáveis; não alertar por ruído sem ação possível.
- Auditoria de negócio é separada de log técnico.
- Nunca registrar senha, token, chave, documento completo ou payload sensível desnecessário.
- Monitorar advisors e saúde de Auth, Storage, Edge Functions e Data API.

## 14. Privacidade e ciclo de vida

- Coletar somente dados necessários.
- Definir finalidade, retenção e acesso por categoria.
- Permitir correção, exportação e tratamento de solicitações legais.
- Anonimização ou exclusão não destrói registros que devam ser preservados por obrigação ou auditoria; nesses casos, minimizar e restringir.
- Dados de produção não são copiados para desenvolvimento.

## 15. Definition of Done

Uma entrega exige critérios de aceite atendidos, autorização em servidor e banco, testes proporcionais ao risco, auditoria aplicável, todos os estados de interface, documentação, validação responsiva e bimodal, observabilidade e ausência de segredos.

