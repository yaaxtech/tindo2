# 🔄 RETOMAR — Fase 0

> Sessão 2026-04-17 noite (autônoma). Bootstrap novo em `/tindo2`. Falta: suas ações + deploy.

## ✅ Feito nesta sessão (sem você)

- Next 15 + React 19 + Tailwind 4 + TS strict + Bun, bootstrapped do zero
- Tokens CSS Obsidian + Jade YaaX com 6 gradientes, sombras, motion
- Supabase client (browser lazy proxy + server com cookies) + middleware de auth
- Rotas: `/` (landing), `/login` (magic link), `/auth/callback`, `/feed` (protegida, com card demo funcional)
- TaskCard com swipe 4-direções (Framer Motion), hints visuais, threshold 96px / 600px/s
- Atalhos de teclado no feed (← → ↑ ↓ Enter)
- Feedback háptico via `navigator.vibrate` (4 padrões)
- Feedback sonoro via Tone.js (lazy, swipe tick + arpejo de conclusão)
- CompletionBurst celebrativo (glow + 18 partículas + ✓ spring)
- Score algoritmo determinístico com pesos ajustáveis, heat de prioridade, tags
- Schema SQL completo com 10 tabelas, RLS, triggers, 2 views
- Services CRUD (tasks, projects, tags, reviews, weights)
- Feed store Zustand
- PWA manifest + ícones 192/512 + apple-touch + favicon (gerados via qlmanage + sips)
- **`bun install` ✓**, **typecheck ✓**, **lint ✓**, **build ✓** (5 rotas + middleware)
- **git init + commit inicial** (hash `11c9a22`, branch `main` local, sem remote ainda)
- CLAUDE.md, PLAN.md, 10 docs em `docs/` (arquitetura, score, roadmap, kpis, card, neuro, interação, todoist, ia)
- Caffeinate rodando (6h) pra MacBook não dormir

**Versão antiga preservada** em `/Users/maiaemanuel/tindo antigo/` (não foi deletada).

---

## ⏳ Próximos passos — humano age (ordem sugerida)

### 1. Copiar anon key do Supabase pro `.env.local` (~2 min)
1. Abrir https://supabase.com/dashboard/project/cpcglkytrtkisrehqvsc/settings/api
2. Copiar **anon public** key
3. Criar `/Users/maiaemanuel/tindo2/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://cpcglkytrtkisrehqvsc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua-anon-key...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

### 2. Aplicar schema no Supabase (~5 min)
1. Abrir https://supabase.com/dashboard/project/cpcglkytrtkisrehqvsc/sql/new
2. Colar **TODO** o conteúdo de `docs/01-schema.sql`
3. **Run** → verificar que não dá erro
4. Validar em **Table Editor**: deve listar `users`, `projects`, `tasks`, `tags`, `task_tags`, `task_dependencies`, `score_weights`, `reviews`, `todoist_sync_state`, `ai_calibrations` com **cadeado (RLS ativo)**

**Se já aplicou o schema antigo:** esse novo pode dar conflito em alguns objetos. Solução segura: em um novo SQL, `drop schema public cascade; create schema public;` antes de rodar (⚠️ destrói dados existentes — só faça se for desenvolvimento sem dados reais).

### 3. Configurar Redirect URLs do Supabase Auth (~1 min)
1. Abrir https://supabase.com/dashboard/project/cpcglkytrtkisrehqvsc/auth/url-configuration
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs** (adicionar ambos):
   - `http://localhost:3000/**`
   - `https://tindo.vercel.app/**` (ou domínio Cloudflare)

### 4. Rodar local e testar (~3 min)
```bash
cd /Users/maiaemanuel/tindo2
bun dev
```
- Abrir http://localhost:3000
- Ver landing com aurora jade
- Clicar "Entrar" → colocar seu email → checar caixa de entrada
- Clicar link mágico → vai pro `/feed` com 3 cards demo
- Testar: setas ← → ↑ ↓, Enter, arrastar no touchpad
- Som: clica "Concluir" → deve tocar arpejo (navegador precisa de interação pra liberar áudio)

### 5. Decidir host + deploy (~10 min)

#### Opção A — Vercel (recomendado pra rapidez)
1. https://vercel.com/new → Import `yaaxtech/tindo` (ou o repo que decidir em §7)
2. Framework: Next.js (detecta automaticamente)
3. Environment Variables (Production):
   - `NEXT_PUBLIC_SUPABASE_URL=https://cpcglkytrtkisrehqvsc.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<a real>`
   - `NEXT_PUBLIC_APP_URL=https://tindo.vercel.app`
   - `NEXT_PUBLIC_APP_ENV=production`
4. Deploy → URL verde. Adicionar ao Supabase Redirect URLs.

#### Opção B — Cloudflare Pages
1. https://dash.cloudflare.com/?to=/:account/pages → Connect GitHub
2. Framework preset: Next.js
3. Build command: `bun run build`
4. Build output: `.next`
5. Precisa do adaptador `@cloudflare/next-on-pages` (adicionar depois).

### 6. Decidir estratégia do repo GitHub
Repo `yaaxtech/tindo` já tem commits da versão antiga. Três opções:

- **A)** Force-push substituindo main (limpo mas destrutivo) → me fala pra eu rodar.
- **B)** Push pra nova branch `v2` e promover pra default no GitHub → **recomendado**:
```bash
cd /Users/maiaemanuel/tindo2
git branch -M main-v2
git remote add origin https://github.com/yaaxtech/tindo.git
git push -u origin main-v2
# Depois no GitHub: Settings → Branches → Default branch → main-v2
```
- **C)** Novo repo `yaaxtech/tindo-v2`:
```bash
gh repo create yaaxtech/tindo-v2 --public --description "TinDo v2 (clean bootstrap)"
cd /Users/maiaemanuel/tindo2
git remote add origin https://github.com/yaaxtech/tindo-v2.git
git push -u origin main
```

Me avise qual escolheu e eu rodo (exceto A, que precisa sua confirmação explícita pelo auto-mode).

### 7. (Opcional) Re-gerar ícones com design final
Os ícones em `public/icons/` são placeholders bonitos (T jade em fundo obsidian, gerados via qlmanage do SVG + sips). Se você tiver design definitivo, substitua:
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/apple-touch-icon.png`
- `public/favicon.png`

---

## 🎯 Critério de "Fase 0 pronta"

- [x] `bun install` sem erro (692 pacotes)
- [x] Typecheck + Lint + Build verdes
- [x] Ícones PWA gerados (192/512 + apple-touch + favicon)
- [x] Commit inicial local (hash `11c9a22`)
- [ ] `.env.local` preenchido
- [ ] Schema aplicado, RLS ativo
- [ ] Redirect URLs configuradas
- [ ] `bun dev` → landing carrega, login envia email, feed com cards demo
- [ ] Deploy verde em Vercel ou Cloudflare
- [ ] Repo estratégia decidida e pushada

Quando os 10 check ✓, abre Fase 1 em `docs/03-roadmap.md`.

---

## 🔐 Lembretes de segurança

- Nunca commitar `.env.local`.
- `SUPABASE_SERVICE_ROLE_KEY` só em Edge Function, nunca no client.
- Tokens Todoist + Anthropic vêm depois, em Fase 2+, via Supabase Vault.
- Toda tabela tem RLS — se você desligar por debug, não esqueça de religar.

---

## 📞 Se algo deu errado

Me chama com o erro. Eu olho:
- Build quebrou → `bun run build` cola o stdout.
- `bun dev` não sobe → cola stdout.
- Schema não aplicou → cola o erro SQL.
- Login não manda email → abre DevTools Network na aba /login, vê a resposta do Supabase.
- Swipe não funciona no mobile → confirma que testa em Chrome Android (iOS Safari tem particularidades que conferimos).

---

Bom dia quando ler isso ☀️
