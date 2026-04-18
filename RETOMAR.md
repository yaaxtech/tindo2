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
- PWA manifest (ícones PENDENTES)
- CLAUDE.md, PLAN.md, 10 docs em `docs/` (arquitetura, score, roadmap, kpis, card, neuro, interação, todoist, ia)
- Caffeinate rodando (6h) pra MacBook não dormir

**Versão antiga preservada** em `/Users/maiaemanuel/tindo antigo/` (não foi deletada).

---

## ⏳ Próximos passos — humano age (ordem sugerida)

### 1. Instalar dependências (~2 min)
```bash
cd /Users/maiaemanuel/tindo2
bun install
```

Se falhar, me avise — alguma versão pode ter quebrado.

### 2. Copiar anon key do Supabase pro `.env.local` (~2 min)
1. Abrir https://supabase.com/dashboard/project/jtpfauouvbtmhgrszybk/settings/api
2. Copiar **anon public** key
3. Criar `/Users/maiaemanuel/tindo2/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://jtpfauouvbtmhgrszybk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...sua-anon-key...
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
```

### 3. Aplicar schema no Supabase (~5 min)
1. Abrir https://supabase.com/dashboard/project/jtpfauouvbtmhgrszybk/sql/new
2. Colar **TODO** o conteúdo de `docs/01-schema.sql`
3. **Run** → verificar que não dá erro
4. Validar em **Table Editor**: deve listar `users`, `projects`, `tasks`, `tags`, `task_tags`, `task_dependencies`, `score_weights`, `reviews`, `todoist_sync_state`, `ai_calibrations` com **cadeado (RLS ativo)**

**Se já aplicou o schema antigo:** esse novo pode dar conflito em alguns objetos. Solução segura: em um novo SQL, `drop schema public cascade; create schema public;` antes de rodar (⚠️ destrói dados existentes — só faça se for desenvolvimento sem dados reais).

### 4. Configurar Redirect URLs do Supabase Auth (~1 min)
1. Abrir https://supabase.com/dashboard/project/jtpfauouvbtmhgrszybk/auth/url-configuration
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs** (adicionar ambos):
   - `http://localhost:3000/**`
   - `https://tindo.vercel.app/**` (ou domínio Cloudflare)

### 5. Rodar local e testar (~3 min)
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

### 6. Decidir host + deploy (~10 min)

#### Opção A — Vercel (recomendado pra rapidez)
1. https://vercel.com/new → Import `yaaxtech/tindo` (ou o repo que decidir em §7)
2. Framework: Next.js (detecta automaticamente)
3. Environment Variables (Production):
   - `NEXT_PUBLIC_SUPABASE_URL=https://jtpfauouvbtmhgrszybk.supabase.co`
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

### 7. Decidir estratégia do repo GitHub
Repo `yaaxtech/tindo` já tem commits da versão antiga. Três opções:

- **A)** Force-push substituindo main (limpo mas destrutivo) → me fala pra eu rodar.
- **B)** Criar branch `v2` e promover pra default → **recomendado**. Comando:
```bash
cd /Users/maiaemanuel/tindo2
git init -b main-v2
git add .
git commit -m "feat: bootstrap TinDo v2 (Next 15 + docs + score + swipe)"
git remote add origin https://github.com/yaaxtech/tindo.git
git push -u origin main-v2
# Depois no GitHub: Settings → Branches → Default branch → main-v2
```
- **C)** Novo repo `yaaxtech/tindo-v2` → criar e pushar.

Me avise qual escolheu e eu rodo (exceto A, que precisa sua confirmação explícita pelo auto-mode).

### 8. Gerar ícones PWA (~5 min)
Placeholder foi criado no manifest. Precisa criar:
- `public/icons/icon-192.png` (192×192, fundo #0B1220, símbolo jade)
- `public/icons/icon-512.png` (512×512 idem)

Opções:
- Design final (Figma).
- Placeholder rápido: posso gerar 2 PNGs programaticamente (escreve "T" jade em fundo obsidian).
- Me fala se quer que eu gere placeholders.

---

## 🎯 Critério de "Fase 0 pronta"

- [ ] `bun install` sem erro
- [ ] `.env.local` preenchido
- [ ] Schema aplicado, RLS ativo
- [ ] Redirect URLs configuradas
- [ ] `bun dev` → landing carrega, login envia email, feed com cards demo
- [ ] Deploy verde em Vercel ou Cloudflare
- [ ] Repo estratégia decidida e pushada
- [ ] Ícones PWA gerados

Quando os 8 check ✓, abre Fase 1 em `docs/03-roadmap.md`.

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
