# CLAUDE.md — SeuCamarão

> Fonte de verdade sobre como o AI deve se comportar neste projeto.

---

## AUTONOMIA — REGRAS DE DECISÃO AUTÔNOMA

> Estas regras reduzem o input necessário do desenvolvedor. Siga-as antes de fazer qualquer pergunta.

### Quando NÃO perguntar

| Situação | Ação autônoma |
|----------|---------------|
| Dúvida sobre schema/colunas | Leia `banco_de_dados/01_schema_sql.md` e decida |
| Dúvida sobre qual componente usar | Leia `desenvolvimento/05_design_system.md` e decida |
| Dúvida sobre convenção de código | Leia `desenvolvimento/01_stack_decisoes.md` e decida |
| Dúvida sobre regra de negócio | Leia `logica_negocio/02_regras_negocio.md` e decida |
| Task com escopo claro (<3 arquivos) | Execute diretamente — sem Plan Mode |
| Typecheck/lint após edição | Rode e corrija sem pedir permissão |
| Mensagem de commit | Analise o diff e decida — não pergunte |
| Escolha de nome de variável/função | Siga as convenções do projeto e decida |

> **Transparência:** Ao executar autonomamente, declare as suposições assumidas no início da resposta. Isso evita retrabalho por premissas erradas.

### Quando perguntar

- Ambiguidade genuína de **regra de negócio** que os docs não cobrem
- Mudança que afeta **múltiplos domínios não relacionados**
- Ação **destrutiva irreversível** (drop de tabela, delete de dados reais)
- Requisito que **contradiz** algo nos docs internos

### Padrão de execução por tipo de task

- **CRUD de entidade nova**: schema → service → page → FazendaExpandableCard
- **Nova tela**: rota em `App.tsx` → page component → serviço → permissão em RBAC
- **KPI novo**: apenas VIEW no Supabase, nunca coluna calculada
- **Migration**: arquivo em `supabase/migrations/`, seguir convenções, não aplicar automaticamente

---

## REGRA ZERO

**Consulte os arquivos do projeto antes de responder qualquer coisa técnica.**
Não invente, não assuma — verifique. Se não souber, pergunte.
Se houver conflito entre documentos, PARE e avise.

---

## FLUXO DE DESENVOLVIMENTO

1. **Plan Mode** para tarefas complexas (>3 arquivos).
2. **Antes de implementar, defina critérios de verificação** — o que significa "pronto" para esta tarefa (ex: "typecheck passa, badge atualiza, dialog fecha com Enter").
3. Implemente seguindo as regras abaixo.
4. Rode `npm run typecheck` e `npm run lint` antes de commitar.
5. Verifique os critérios definidos no passo 2.
6. Ao finalizar uma feature, atualize o checklist do sprint.

---

## HIERARQUIA DE CONSULTA

| Dúvida sobre... | Consulte |
|----------------|---------|
| Tabelas e colunas | `banco_de_dados/01_schema_sql.md` + `02_dicionario_dados.md` |
| Fórmulas e KPIs | `logica_negocio/01_kpis_e_formulas.md` |
| Regras de negócio | `logica_negocio/02_regras_negocio.md` |
| Motor do Acompanhamento | `logica_negocio/04_motor_acompanhamento.md` |
| Views e dashboards | `banco_de_dados/03_views.md` |
| Permissões e RLS | `banco_de_dados/04_rls_permissoes.md` |
| RBAC por tela | `banco_de_dados/05_rbac_por_tela.md` |
| Stack e convenções | `desenvolvimento/01_stack_decisoes.md` |
| Design System e UI | `desenvolvimento/05_design_system.md` |
| O que implementar agora | `desenvolvimento/02_sprints.md` |
| Dados para seeds | `desenvolvimento/07_seeds_dados_reais.md` |
| Termos do domínio | `produto/02_glossario.md` |
| Mapa das 53 abas | `banco_de_dados/08_mapa_abas_planilha.md` |

---

## STACK (FIXADO — NÃO ALTERAR SEM APROVAÇÃO)

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18+ com TypeScript 5.3+ (strict mode SEMPRE) |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL 15) + RLS |
| Auth | Supabase Auth + OTP WhatsApp via Z-API |
| Dev tool | Claude Code |
| Deploy Frontend | Cloudflare Pages |
| Deploy BD | Supabase hosted |
| Roteamento | React Router |
| Testes | Jest + Testing Library |
| Package manager | Bun |

**Formatação:** 2 espaços, aspas simples, ponto-e-vírgula sempre, ~80 chars.
**Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`).

---

## DOMÍNIO DO NEGÓCIO

**SeuCamarão** = SaaS multi-tenant de gestão de carcinicultura.

### Hierarquia de dados
```
Organizacao → Fazenda → Área → Centro Produtivo (CP) → Cultivo
                                                      ├── Biometrias
                                                      ├── Racoes_diarias
                                                      ├── Parametros_agua
                                                      └── Despescas
```

> **Terminologia:** "Fazenda" é o agrupador principal (ex: Fazenda Maioli). "Área" é a unidade física dentro da Fazenda (ex: Área A, Área B). Os CPs ficam dentro de cada Área.

### Ambiente Supabase
- PRODUÇÃO: qsccnvdwlpgvhufbboh (único ambiente — não usar DEV)

### Ciclo de vida de um cultivo
```
Planejado → Preparando → Povoado (ativo) → Despescado
                                ↓
                      Despesca Parcial (permanece Povoado)
```

### KPIs críticos (fórmulas completas em `logica_negocio/01_kpis_e_formulas.md`)
- **KG/HA/DIAT** — inclui dias de preparação
- **LU/HA/DIAT** — lucro por ha por dia total
- **FCA** — menor = melhor
- **CDA** — usa 1ª e 3ª biometria (não 2ª)
- **Biomassa** — `(pop × peso_g × sob%) / 1000`

---

## REGRAS DE BANCO (PostgreSQL / Supabase)

### Convenções obrigatórias
```sql
-- PK sempre uuid
id uuid PRIMARY KEY DEFAULT gen_random_uuid()

-- Multi-tenant obrigatório (tudo é organizacao_id, nunca empresa_id)
organizacao_id uuid NOT NULL REFERENCES organizacoes(id)

-- Dinheiro: NUNCA float
valor numeric(12,2)

-- Peso e área
peso_medio_g  numeric(8,4)
biomassa_kg   numeric(10,2)
area_ha       numeric(10,4)

-- Soft delete: NUNCA DELETE físico em dados operacionais
deleted_at timestamptz NULL
-- Toda query: WHERE deleted_at IS NULL

-- Timestamps padrão
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()  -- via trigger set_updated_at()

-- Status: varchar com CHECK, nunca enum PostgreSQL
status varchar(20) NOT NULL
  CHECK (status IN ('Planejado','Preparando','Povoado','Despescado','Cancelado'))
```

### RLS
- Toda tabela operacional: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- Tabelas sem RLS (globais): `papeis`
- Padrão de policy (subquery, NUNCA jwt claim):
```sql
USING (organizacao_id IN (
  SELECT organizacao_id FROM usuario_papeis
  WHERE usuario_id = auth.uid() AND ativo = true
))
```
- Detalhes completos: `banco_de_dados/04_rls_permissoes.md`

---

## REGRAS DE CÓDIGO

- Nenhum `any` sem justificativa explícita no comentário
- Supabase client via `lib/supabase.ts` (singleton)
- Types em `types/` espelhando o schema do banco (snake_case)
- **Toda leitura/escrita de dados passa por `src/services/`; componentes NÃO acessam o client Supabase diretamente**
- Testes primeiro: escreva testes antes de implementar funcionalidades novas
- Mensagens de erro em português para o usuário final

---

## ARQUITETURA FRONTEND

### Roteamento
```
/                    → redirect para /dashboard
/login               → tela de OTP WhatsApp
/cadastro            → cadastro de novo usuário
/dashboard           → visão geral da fazenda selecionada
/acompanhamento      → acompanhamento de cultivos ativos
/fazendas            → CRUD fazendas
/centros-produtivos  → CRUD CPs
/cultivos            → lista + detalhes (abas: Visão Geral, Raçoamento, Biometrias, Parâmetros Água, Financeiro, Observações)
/racoes              → lançamento diário (mobile-first)
/biometrias          → lançamento em lote
/despescas           → registro parcial/total
/financeiro          → transações + dashboard (abas: Transações, Resumo, Fazendas, DRE)
/compras             → solicitações de compra
/estoque             → recursos, posição atual, movimentações
/listas              → listas de notificação e membros
/laboratorios        → CRUD laboratórios
/relatorios          → relatórios e análises históricas
/equipe              → membros, convites, papéis e permissões
/minha-conta         → perfil do usuário logado
/aceitar-convite     → fluxo de aceite por token
/configuracoes       → abas: Organização, Fazendas, CPs, Parâmetros, Estoque, Financeiro
```

### Camada de Serviços (`src/services/`)
- `client.ts` — re-exporta o client Supabase como `db`
- `organizacoes.ts`, `usuario-preferencias.ts`, `fazendas.ts`, `areas.ts`, `centros-produtivos.ts`
- `cultivos.ts`, `biometrias.ts`, `racoes-diarias.ts`, `parametros-agua.ts`, `despescas.ts`
- `laboratorios.ts`, `fornecedores.ts`, `recursos.ts`, `movimentacoes-estoque.ts`
- `transacoes.ts`, `categorias-transacao.ts`, `contas-bancarias.ts`
- `equipe.ts`, `convites.ts`, `notificacoes.ts`, `compras.ts`, `listas.ts`
- `views/estoque-atual.ts`, `views/cultivos-ativos.ts`
- `index.ts` — re-exporta todos

### Layout Shell
- Sidebar navy (#162032), header com seletor de fazenda, fundo off-white (#F8F9FB)
- Design System completo em `desenvolvimento/05_design_system.md`

### Componentes reutilizáveis (`src/components/ui-kit/`)
`DataTable`, `FormModal`, `StatusBadge`, `KPICard`, `EmptyState`, `FarmSelector`,
`PageHeader`, `FazendaExplorer`, `FazendaDropdown`, `FazendaSelector`, `ColorPicker`,
`FornecedorCombobox`, `PairedQtyFields`, `ResourceSearchCombobox`, `UnitPriceFields`,
`NotificationBell`, `WorkspaceSwitcher`, `HoverStickyPopover`, `FazendaExpandableCard`

### Padrão de Agrupamento por Fazenda (OBRIGATÓRIO)
**Toda listagem de dados operacionais deve ser agrupada por Fazenda (agrupador principal)** usando `FazendaExpandableCard` (`src/components/ui-kit/FazendaExpandableCard.tsx`).
- Carregar fazendas via `getFazendasPageData(organizacao.id)` no load.
- Agrupar itens por Fazenda (matching `fazenda_id` → `fazenda.areas`).
- Usar `useAutoExpandFazenda` para auto-expandir quando só 1 Fazenda visível.
- Usar `toggleSetId` para alternar expand/collapse.
- Header mostra: nome da Fazenda, siglas das Áreas (com cor), badges com contagem/totais.
- Áreas ficam listadas dentro do card da Fazenda.
- Remover coluna "Fazenda" das tabelas internas (redundante com o header do card).
- **Páginas que já usam:** Estoque, Despescas, Cultivos, Povoamentos, Equipe, Acompanhamento (visão geral), Compras, Rações.

### Padrão de Dialogs (OBRIGATÓRIO)
**Todo Dialog/AlertDialog/FormModal deve ter atalhos de teclado:**
- **Enter** → aciona o botão primário (salvar/confirmar), respeitando `disabled`.
- **Esc** → cancela/fecha a janela (Radix já faz por padrão — manter).
- Implementar Enter via `onKeyDown` no `AlertDialogContent`/`DialogContent` ou via `<form onSubmit>` com botão `type="submit"`.
- Se houver campo de confirmação (ex.: digitar "CANCELAR"), Enter só dispara se a validação passar.
- Revisar dialogs existentes ao tocá-los.

### Padrão de Popover (OBRIGATÓRIO)
**Todo popover informativo deve usar `HoverStickyPopover`** (`src/components/ui-kit/HoverStickyPopover.tsx`).
- Hover abre com fade-in + scale; mouse-out fecha.
- Click trava (sticky); click-outside ou click no trigger fecha.
- Visual glassmorphism: `backdrop-blur-xl`, `bg-white/80`, borda semitransparente, soft shadow.
- **NÃO usar** `Popover` do Radix/shadcn para exibir informações ao passar o mouse. O Radix `Popover` fica reservado para formulários inline (calendário, color picker, etc.).

### Contextos e Hooks
- `PermissoesContext.tsx` — RBAC client-side (`papel`, `permissoes`, `podeVer`, `podeEditar`, `podeAdmin`)
- `usePermissoes.ts`, `useOrgConfig.ts`, `useFormatNumber.ts`
- `PrivateRoute.tsx` — protege rotas por papel mínimo

---

## REGRAS DE NEGÓCIO CRÍTICAS

| ID | Regra |
|----|-------|
| RN-01 | Máximo 1 cultivo `Povoado` por CP ao mesmo tempo |
| RN-02 | Sigla da fazenda é imutável após criação |
| RN-03 | Despesca Parcial não encerra o cultivo — só a Total muda status |
| RN-04 | Cultivo com `desconsiderar = true` excluído de médias |
| RN-05 | Total de ração só conta a partir de `data_povoamento` |
| RN-06 | CDA usa 1ª e 3ª biometria (não 2ª) |
| RN-07 | Soft delete em tudo — `deleted_at`, nunca DELETE físico |
| RN-08 | Despesca total: snapshots de FCA, SOB%, KG/HA/DIAT salvos em `despescas` |
| RN-09 | Bioensaio medido 3 dias após povoamento |
| RN-10 | Densidade calculada no momento do stocking (snapshot) |
| RN-11 | Labs com `organizacao_id = NULL` são globais |
| RN-12 | Campo `ciclo` é sequencial por CP (V1C1, V1C2...) |
| RN-13 | UNIQUE (cultivo_id, data) em `racoes_diarias` |
| RN-14 | KPIs históricos usam `area_ha` vigente na data da despesca |

---

## NUNCA FAZER

- `float` para valores monetários ou de biomassa
- Armazenar KPIs calculados (FCA, KG/HA, CDA, LU/HA) em colunas — usar VIEWs
- Biomassa estimada retroativamente antes da 1ª biometria do ciclo
- `schema_visual.html` sem atualizar ao adicionar tabelas

---

## DevPilot

> Gerenciado pelo DevPilot. Todas as instruções estão no backlog.

OBRIGATÓRIO: Antes de qualquer ação, leia o backlog completo:
https://xgnoqutwbwtnzxtejazo.supabase.co/storage/v1/object/public/project-files/d8d0f95b-c068-44c4-a87d-549ffd9935ab/BACKLOG.md

O backlog contém: tarefas priorizadas, API, fluxo de trabalho e regras.
Config local: `.devpilot.json`