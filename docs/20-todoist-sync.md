# 20 — Sincronização com Todoist

## Fonte da verdade
Nas primeiras fases: **Todoist é a fonte da verdade**. TinDo reflete Todoist. Quando confiarmos que o TinDo está robusto, invertemos: TinDo como source of truth e Todoist como espelho.

## Escopo de sync
Apenas tarefas com uma destas etiquetas:
- `Todo` → `tipo = 'tarefa'`
- `Lembretes` (ou variantes: `fazer 2min`, `criar /`, `criar todo`) → `tipo = 'lembrete'`

Demais tarefas do Todoist não aparecem no TinDo (voluntário).

## Arquitetura
```
Todoist (OAuth + Sync API) ←→ Edge Function (Deno, Supabase) ←→ tasks table
                                       ↕
                               todoist_sync_state
                               (sync_token por usuário)
```

### Armazenamento de token
- OAuth2 Authorization Code.
- Token salvo em **Supabase Vault** via RPC `vault.create_secret` (nunca em coluna aberta).
- Refresh token também em Vault. Rotação a cada 60 dias.

### Fluxo PULL (inicial e incremental)
1. Edge Function `todoist-pull` (cron 10min ou trigger manual):
   - Lê `sync_token` de `todoist_sync_state` (primeiro run: `*`).
   - Chama `POST https://api.todoist.com/sync/v9/sync` com `sync_token` + `resource_types=["items","projects","labels"]`.
   - Recebe `items` (adicionados/modificados/removidos).
   - Filtra por etiquetas (`Todo`, `Lembretes`).
   - `upsert ON CONFLICT (user_id, todoist_id)` em `tasks`.
   - Salva novo `sync_token`.
2. User vê feed atualizado (SSR ou via Supabase Realtime).

### Fluxo PUSH (mudanças locais → Todoist)
Cada ação dispara um call REST ao Todoist:

| Ação local | Endpoint Todoist |
|---|---|
| `concluir` | `POST /rest/v2/tasks/{id}/close` |
| `editar titulo/descricao/prazo` | `POST /rest/v2/tasks/{id}` |
| `adiar` (muda `due`) | `POST /rest/v2/tasks/{id}` com `due_string` |
| `excluir` | `POST /rest/v2/tasks/{id}/delete` (ou `close` se soft) |

Erro em push: toast + fila retry (`todoist_push_queue` — backlog).

### Webhook (bidirecional em tempo real, Fase 3)
- Todoist webhook → Edge Function `todoist-webhook`.
- Verifica `X-Todoist-Hmac-SHA256`.
- Events: `item:added`, `item:updated`, `item:completed`, `item:deleted`.
- Aplica no banco, Supabase Realtime dispara refresh no client.

## Mapeamento de campos

| Todoist | TinDo | Observação |
|---|---|---|
| `id` | `todoist_id` | chave de dedupe |
| `content` | `titulo` | |
| `description` | `descricao` | |
| `priority` (1..4, invertido) | `prioridade` | Todoist 4=alta, 1=baixa; invertemos pra 1=alta |
| `due.date` | `data_vencimento` | timestamptz |
| `project_id` | `project_id` | resolve via `projects.todoist_id` |
| `labels` | etiquetas → `tipo` + tags | |
| `checked` | `status = 'concluida'` | |
| `is_deleted` | `deleted_at = now()` | |

## Resolução de conflito
- **Last write wins** por timestamp `updated_at`.
- Se `updated_at` empata: server-side (Todoist) vence.

## Offline / falha
- Se Todoist está fora: TinDo continua funcionando local; mudanças ficam em `todoist_push_queue` até reconectar.
- Se TinDo está fora: Todoist continua recebendo edições; no próximo pull, sync pega tudo.

## Feature flag
`NEXT_PUBLIC_FEATURE_TODOIST_SYNC=true` ativa UI de conectar/desconectar. Default `false` até Fase 2 validada.
