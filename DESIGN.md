# Dealer Smart — Design System

Este arquivo é a fonte de verdade visual do produto. Quando uma tela histórica usar tipografia, cores ou padrões divergentes, este documento prevalece.

## 1. Princípios

- Fidelidade às referências aprovadas, sem importar fragilidades técnicas dos protótipos.
- Clareza operacional: informações prioritárias devem ser reconhecidas rapidamente.
- Mobile first, responsivo e acessível conforme WCAG 2.2 AA.
- Paridade funcional entre os modos claro e escuro.
- Personalização de marca sem comprometer contraste, status ou legibilidade.
- Estados de carregamento, vazio, erro, bloqueio, sucesso e sem permissão sempre explícitos.

## 2. Tipografia normativa

| Papel | Família | Fallback recomendado |
|---|---|---|
| Headline | Outfit | ui-sans-serif, system-ui, sans-serif |
| Body | Plus Jakarta Sans | ui-sans-serif, system-ui, sans-serif |
| Label | Plus Jakarta Sans | ui-sans-serif, system-ui, sans-serif |

Regras:

- Nenhum componente pode declarar outra família localmente.
- As fontes devem ser carregadas centralmente e servidas pela própria aplicação, sem requisições externas do navegador.
- Headings, títulos de página, números destacados e títulos de cards usam o token de Headline.
- Parágrafos, conteúdo de tabela, ajuda e mensagens usam o token de Body.
- Botões, badges, inputs, navegação, metadados e rótulos usam o token de Label.
- O peso não substitui hierarquia semântica; a estrutura HTML deve continuar correta.

Escala canônica consolidada dos arquivos `DESIGN` homologados:

| Token | Tamanho / linha | Peso | Uso |
|---|---:|---:|---|
| `display-lg` | 40/48 | 600 | destaques excepcionais |
| `display-lg-mobile` | 30/38 | 600 | destaque em celular |
| `headline-xl` | 32/40 | 600 | título principal desktop |
| `headline-xl-mobile` | 24/32 | 600 | título principal em celular |
| `headline-lg` | 24/32 | 500 | título principal compacto |
| `headline-md` | 20/28 | 500 | seções |
| `headline-sm` | 16/24 | 600 | cards e dialogs |
| `body-lg` | 15/24 | 400 | introduções |
| `body-md` | 13/20 | 400 | conteúdo padrão |
| `body-sm` | 12/18 | 400 | tabelas e ajuda |
| `label-md` | 12/16 | 600 | controles e ações |
| `label-sm` | 11/14 | 600 | badges e metadados |
| `label-micro` | 10/12 | 700 | microdados excepcionais |

Em telas pequenas, usar os tokens móveis correspondentes sem quebrar a hierarquia. Tamanhos menores que 14 px são restritos a metadados auxiliares e não podem conter instruções, ações ou informação essencial.

## 3. Tokens semânticos

O tema deve ser implementado com variáveis CSS semânticas, nunca com cores de marca espalhadas em componentes:

- `--background`, `--surface`, `--surface-elevated`;
- `--foreground`, `--foreground-muted`, `--border`;
- `--brand-primary`, `--brand-secondary`, `--brand-accent`;
- `--focus-ring`, `--selection`;
- `--success`, `--warning`, `--danger`, `--info`;
- variantes `-foreground`, `-subtle` e `-border` quando necessárias.

Cores de status não podem ser substituídas livremente pela identidade do tenant. Toda combinação deve manter contraste WCAG 2.2 AA.

### Paleta bimodal padrão

| Papel | Token | Claro | Escuro |
|---|---|---|---|
| fundo do viewport | `--bg-viewport` | `#f8f9ff` | `#090e17` |
| canvas | `--surface` | `#f8f9ff` | `#0f131d` |
| card | `--surface-card` | `#ffffff` | `#171c25` |
| container elevado | `--surface-card-high` | `#f0f4fd` | `#1e2430` |
| input | `--surface-input` | `#ffffff` | `#0a0e18` |
| borda estrutural | `--border-regular` | `#e2e8f0` | `#263042` |
| divisor sutil | `--border-subtle` | `#edf2f7` | `#1e2533` |
| primária padrão | `--color-primary` | `#1e3a5f` | `#2563eb` |
| primária hover | `--color-primary-hover` | `#162c48` | `#1d4ed8` |
| texto primário | `--text-primary` | `#0f172a` | `#f8fafc` |
| texto secundário | `--text-secondary` | `#334155` | `#94a3b8` |
| texto muted | `--text-muted` | `#64748b` | `#64748b` |
| sucesso | `--status-success` | `#059669` | `#10b981` |
| alerta | `--status-warning` | `#d97706` | `#f59e0b` |
| perigo | `--status-danger` | `#dc2626` | `#ef4444` |

Esses valores constituem a identidade padrão da plataforma. Perfis de Grupo e Matriz podem substituir apenas tokens de marca autorizados; superfícies, textos estruturais e cores de estado continuam governados pelo sistema e por contraste.

### Forma e espaçamento

- raio de controles: 4 px;
- raio de cards: 8 px;
- raio de painéis elevados: 12 px;
- raio de pills/status: 9999 px;
- ritmo espacial base: 4, 8, 16, 24, 32 e 40 px;
- margem móvel: 16 px;
- margem desktop: 32–40 px;
- sidebar desktop de referência: 260 px, adaptada para rail ou drawer quando o viewport exigir.

## 4. Temas claro e escuro

- Ambos os temas devem preservar conteúdo, estrutura, recursos e permissões.
- O modo inicial pode seguir o sistema operacional; a preferência explícita do usuário prevalece e é persistida.
- Tokens de marca são derivados para superfícies claras e escuras com contraste validado.
- Imagens e logos devem possuir tratamento para fundos claros e escuros quando necessário.
- Não inverter imagens indiscriminadamente.

## 5. Identidade visual organizacional

Precedência de resolução:

1. identidade da Matriz;
2. identidade do Grupo Empresarial;
3. identidade padrão da plataforma.

A Filial não possui override próprio e sempre herda logo e cores da Matriz. A interface de Filial deve exibir a origem da identidade e não oferecer edição local.

`brand_profiles` deve versionar cores e metadados. Logos ficam no Supabase Storage, com tipo, tamanho e dimensões validados. A ativação de uma identidade exige pré-visualização nos dois temas e teste de contraste.

## 6. Componentes e interação

- Preferir componentes headless acessíveis, estilizados pelos tokens do projeto.
- Server Components são o padrão; Client Components somente quando interação exigir.
- Modais servem fluxos curtos. Cadastros extensos usam página dedicada ou dialog de tela cheia.
- Tabelas precisam de cabeçalho semântico, ordenação compreensível e alternativa adequada em telas pequenas.
- Paginação de listas extensas usa cursor.
- Foco visível nunca pode ser removido.
- Ações destrutivas exigem confirmação compatível com o impacto.
- Feedback não pode depender apenas de cor.

## 7. Documentos e contatos

- CNPJ, CPF, CEP, telefone e celular usam máscara progressiva durante a digitação.
- Os mesmos valores são exibidos mascarados em formulários, listas, relatórios, títulos e cabeçalhos.
- Valores vindos do banco são formatados antes da apresentação.
- A máscara não altera o valor canônico enviado ao servidor.
- CNPJ dispara consulta automática ao completar 14 dígitos válidos.
- CEP dispara consulta automática ao completar 8 dígitos válidos.
- Não existe botão `Consultar` para CNPJ ou CEP.

Estados obrigatórios: incompleto, inválido, consultando, encontrado, não encontrado, serviço indisponível, divergente, coordenadas pendentes e validado manualmente.

## 8. Responsividade

Viewports mínimos de validação:

- celular compacto: 320 px;
- celular padrão: 375/390 px;
- tablet: 768 px;
- desktop: 1280 px;
- desktop amplo: 1440 px ou superior.

Layouts de referência predominantemente desktop devem ser adaptados de forma conservadora: preservar hierarquia e conteúdo, reorganizar colunas, permitir scroll contextual e nunca ocultar ações críticas.

## 9. Referências Stitch

A prioridade é:

1. este `DESIGN.md` para tipografia, tokens, acessibilidade e regras normativas;
2. HTML fornecido para estrutura e comportamento visual;
3. PNG válido para conferência visual;
4. decisão documentada para estados ou viewports ausentes.

Os PNGs escuros abaixo são inválidos e seus HTMLs são a referência exclusiva:

- `agendamento_oficina_modo_escuro_aureus_crm/screen.png`;
- `atendimento_vendas_ia_modo_escuro_aureus_crm/screen.png`;
- `clientes_frotas_vip_dark_mode_aureus_crm/screen.png`;
- `dashboard_geral_modo_escuro_aureus_crm/screen.png`.

## 10. Validação visual

- Renderizar as referências HTML em viewport controlado.
- Criar screenshots determinísticos da implementação.
- Comparar claro/escuro e todos os viewports definidos.
- Verificar Outfit e Plus Jakarta Sans computadas no navegador.
- Testar teclado, foco, zoom, contraste e leitor de tela nas jornadas críticas.
- Mudança visual intencional exige atualização deste documento e aprovação explícita.
