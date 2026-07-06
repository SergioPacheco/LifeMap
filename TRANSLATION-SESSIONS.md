# TRADUÇÃO COMPLETA — Sessões Dedicadas

## VISÃO GERAL — O que precisa tradução para que NENHUM texto fique misturado

### Camada 1: Interface do Site (i18n/*.json)
Textos de navegação, botões, formulários, labels da UI.

### Camada 2: Páginas (src/pages/[lang]/*.astro)
Textos inline em ternários `locale === 'pt' ? ... : ...` que só cobrem PT/EN.

### Camada 3: Componentes (src/components/**/*.tsx)
TEXTS inline, ternários PT/EN, textos de formulários.

### Camada 4: Conteúdo educacional (src/content/{locale}/*.ts)
Artigos de learn (Quíron, Ciclos Planetários, Lua Nova, etc.)

### Camada 5: Relatórios PDF (src/engine/interpretations/{locale}.ts)
168 parágrafos interpretativos × idioma.

---

## STATUS POR CAMADA

### Camada 1 — i18n/*.json ✅ COMPLETO
Todos os 11 idiomas com a mesma estrutura completa:
`site, nav, chart, planets, signs, cart, reports, purchases, dashboard, onboarding, common`

### Camada 2 — Páginas Astro ⚠️ PARCIAL
**Problema:** Páginas usam `locale === 'pt' ? 'texto PT' : 'texto EN'` — qualquer idioma que não seja PT vê inglês.

Páginas afetadas:
- `src/pages/[lang]/index.astro` — Hero, features, CTAs (~15 textos inline)
- `src/pages/[lang]/about.astro` — Toda a página está em PT/EN ternário
- `src/pages/[lang]/reports/annual-sample.astro` — Breadcrumb em ternário
- `src/pages/[lang]/reports/career-sample.astro` — idem
- `src/pages/[lang]/reports/relationship-sample.astro` — idem
- `src/pages/[lang]/reports/psychological-sample.astro` — idem
- `src/pages/[lang]/reports/seven-sins-sample.astro` — idem

**Solução:** Migrar os textos inline para chaves no i18n/*.json e usar `t.chave`.

### Camada 3 — Componentes TSX ⚠️ PARCIAL
**Problema:** Componentes que ainda usam TEXTS inline (PT/EN only):

- `src/components/dashboard/DashboardApp.tsx` — 14 textos inline (greeting, dailyTitle, moonToday, quickLinks, etc.)
- `src/components/premium/ReportPreview.tsx` — REPORT_TITLES e LABELS internos (PT/EN only)
- `src/components/chart/InterpretationPanel.tsx` — usa engine que retorna PT

**Solução:** Migrar TEXTS para getTranslations(locale) do i18n global.

### Camada 4 — Conteúdo Educacional ⚠️ PARCIAL
**Status:**
- PT: ✅ Completo (learn, horoscope, chiron, planetaryCycles, newMoon, planets, signs, houses, aspects)
- EN: ✅ Completo (todos os mesmos módulos)
- Outros 9: usam fallback para EN via getContent() — **aceitável** (conteúdo educacional é extenso, prioridade menor)

**Nota:** O sistema de content já faz fallback EN → PT automaticamente. Traduzir conteúdo educacional (milhares de palavras por idioma) é prioridade BAIXA vs. relatórios.

### Camada 5 — Relatórios PDF ⚠️ PARCIAL
**Status:**
- PT: ✅ 168 textos nativos
- EN: ✅ 168 textos nativos
- ES: ✅ 168 textos nativos
- FR, DE, IT, NL, TR, RU, ZH, JA: ⏳ Metadados traduzidos, textos narrativos em EN

---

## SESSÕES DE TRABALHO

### Sessão Tipo A — Página/Componente (1 sessão resolve tudo)
```
Tarefa: Migrar TODOS os textos inline das páginas e componentes para i18n.

1. Home page (index.astro): mover ~15 ternários para t.home.*
2. About page: mover para t.about.*  
3. DashboardApp.tsx: mover TEXTS para getTranslations()
4. ReportPreview.tsx: mover REPORT_TITLES e LABELS para getTranslations()
5. Report sample pages: usar t.reports.* para breadcrumbs

Adicionar as novas chaves em TODOS os 11 i18n/*.json.
```

### Sessão Tipo B — Tradução de Relatórios (1 sessão por idioma)
```
Traduzir 168 textos interpretativos de EN → {IDIOMA}
Arquivo: src/engine/interpretations/{locale}.ts
```

---

## PLANO COMPLETO DE SESSÕES

| # | Tipo | Descrição | Prioridade |
|---|------|-----------|------------|
| 1 | A | Migrar textos inline (páginas + componentes) para i18n | ALTA |
| 2 | B | Traduzir relatórios → FR (Francês) | ALTA |
| 3 | B | Traduzir relatórios → DE (Alemão) | ALTA |
| 4 | B | Traduzir relatórios → IT (Italiano) | MÉDIA |
| 5 | B | Traduzir relatórios → RU (Russo) | MÉDIA |
| 6 | B | Traduzir relatórios → ZH (Chinês) | MÉDIA |
| 7 | B | Traduzir relatórios → JA (Japonês) | MÉDIA |
| 8 | B | Traduzir relatórios → NL (Holandês) | BAIXA |
| 9 | B | Traduzir relatórios → TR (Turco) | BAIXA |

---

## SESSÃO 1 — Migrar textos inline para i18n

### Prompt:
```
Migrar TODOS os textos hardcoded PT/EN das páginas e componentes para o sistema i18n global.

Projeto: /home/user-sn-387444/Documentos/code/LifeMap

1. Páginas com ternários locale === 'pt':
   - src/pages/[lang]/index.astro (~15 textos: hero, features, CTAs)
   - src/pages/[lang]/about.astro (toda a página)
   - src/pages/[lang]/reports/*-sample.astro (breadcrumbs)

2. Componentes com TEXTS inline:
   - src/components/dashboard/DashboardApp.tsx (TEXTS com 14 chaves PT/EN)
   - src/components/premium/ReportPreview.tsx (REPORT_TITLES, LABELS internos)

3. Para cada texto inline encontrado:
   a. Criar chave no i18n/pt.json (seção home, about, dashboard)
   b. Traduzir para TODOS os 11 idiomas (en, es, fr, de, it, nl, tr, ru, zh, ja)
   c. Substituir ternário por t.chave no componente/página

4. Build: source ~/.nvm/nvm.sh && nvm use 22 && npx astro build
5. Commit e push
```

### Chaves a adicionar ao i18n (estimativa):
```json
{
  "home": {
    "tagline": "Astrologia profissional · 100% no seu navegador",
    "headline": "Leia as estrelas.",
    "headlineHighlight": "Conheça-se.",
    "cta": "Começar Grátis",
    "featuresTitle": "Ferramentas profissionais. Acesso livre.",
    "featuresSubtitle": "Tudo roda no seu navegador — seus dados nunca saem do dispositivo.",
    "natalDesc": "Mapa completo com interpretação",
    "transitsDesc": "Trânsitos do dia sobre seu mapa",
    "synastryDesc": "Compatibilidade entre dois mapas",
    "reportsDesc": "Análises premium em PDF",
    "learnTitle": "Aprenda Astrologia",
    "premiumTitle": "Relatórios Premium",
    "premiumSubtitle": "Interpretação profunda, gerada instantaneamente"
  },
  "about": {
    "title": "Sobre o LifeMap Pro",
    "mission": "...",
    "privacy": "...",
    "tech": "...",
    "contact": "..."
  },
  "dashboard": {
    "greeting": "Olá",
    "dailyTitle": "Seu dia",
    "moonToday": "Lua hoje",
    "quickLinks": "Atalhos",
    "switchProfile": "Trocar perfil",
    "addProfile": "+ Novo perfil",
    "engine": "Engine"
  }
}
```

---

## SESSÃO 2+ — Tradução de Relatórios (por idioma)

### Prompt modelo:
```
Traduza os textos interpretativos de src/engine/interpretations/en.ts para {IDIOMA}.
Reescreva src/engine/interpretations/{locale}.ts com todos os 14 arrays (168 textos) 
traduzidos para {idioma} nativo. Mantenha os metadados (SIGN_NAMES, LABELS etc) como estão.
Siga as instruções de TRANSLATION-SESSIONS.md.
```

### Arrays a traduzir (14 arrays × 12 textos = 168 parágrafos):
```
SUN_IN_HOUSE[12]       — identidade, propósito
MOON_IN_HOUSE[12]      — emoções, segurança
MERCURY_IN_HOUSE[12]   — mente, comunicação
VENUS_IN_HOUSE[12]     — amor, valores
MARS_IN_HOUSE[12]      — ação, desejo
JUPITER_IN_HOUSE[12]   — expansão, sorte
SATURN_IN_HOUSE[12]    — disciplina, maestria
URANUS_IN_HOUSE[12]    — revolução, originalidade
NEPTUNE_IN_HOUSE[12]   — espiritualidade, ilusão
PLUTO_IN_HOUSE[12]     — poder, transformação
CHIRON_IN_HOUSE[12]    — ferida, cura
CHIRON_IN_SIGN[12]     — natureza da ferida geracional
NORTH_NODE_HOUSE[12]   — propósito evolutivo
NORTH_NODE_IN_SIGN[12] — direção da alma
```

### Tom obrigatório:
- Humanístico, profissional, acessível
- Não-fatalista: "tendência a", "convite para", "potencial de"
- 80-250 palavras por texto
- Inclui: descrição + desafio + caminho de integração

### Validação pós-sessão:
- [ ] Build OK (420 páginas)
- [ ] Zero imports de PT (`grep "from.*'./pt'" {locale}.ts` = 0)
- [ ] 21 exports (`grep -c "^export const" {locale}.ts` = 21)
- [ ] ~270-400 linhas (`wc -l`)
- [ ] Nenhum texto em inglês nos arrays interpretativos

---

## REFERÊNCIAS

- Arquitetura: `REPORTS-ARCHITECTURE.md`
- Catálogo de mapas: `CATALOG.md`
- i18n da UI: `src/i18n/*.json`
- Interpretações: `src/engine/interpretations/*.ts`
- Conteúdo educacional: `src/content/{pt,en}/*.ts`
- Geradores PDF: `src/reports/pdf-generator.ts` + `report-generators.ts`

---

*Criado: 2026-07-06*
*Projeto: /home/user-sn-387444/Documentos/code/LifeMap*
*Branch: main*
