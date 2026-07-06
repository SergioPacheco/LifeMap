# LifeMap Pro — Documentação do Projeto

## Visão Geral

**LifeMap Pro** é uma plataforma de astrologia profissional, 100% client-side (site estático), que replica e supera as funcionalidades do [astro.com](https://www.astro.com) com design moderno, multi-idioma, sem necessidade de conta/login, com relatórios premium em PDF para venda.

**Repositório:** `/home/user-sn-387444/Documentos/code/lifemap-pro`

---

## Stack Tecnológica

| Camada | Tecnologia | Versão | Motivo |
|--------|-----------|--------|--------|
| Framework | Astro | 7.0.6 | SSG, islands architecture, ultra rápido |
| UI Reativa | SolidJS | latest | Hidratação parcial, performance |
| Estilos | Tailwind CSS | 3.x | Responsivo, dark/light mode |
| Engine Primário | Swiss Ephemeris (sweph) | 2.10.03 | Mesma engine do astro.com, precisão sub-arcsecond |
| Engine Fallback | Astronomy Engine | latest | Sub-arcminute, funciona offline sem WASM |
| Storage | Dexie.js (IndexedDB) | latest | Perfis, mapas, carrinho, compras — zero backend |
| PDF | jsPDF (futuro) | — | Geração 100% client-side |
| Pagamento | Stripe Checkout (futuro) | — | Sessionless, sem backend |
| Deploy | Cloudflare Pages / Vercel | — | CDN global, zero servidor |
| Node.js | v22.23.1 (via nvm) | — | Requerido pelo Astro 7 |
| TypeScript | strict | — | Type safety em todo o engine |

---

## Arquitetura

```
┌────────────────────────────────────────────────────────────┐
│                       BROWSER                               │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐ │
│  │  Astro   │  │ SolidJS  │  │  Swiss Ephemeris (WASM)  │ │
│  │  (SSG)   │  │ (islands)│  │  + Astronomy Engine      │ │
│  └──────────┘  └──────────┘  └──────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          IndexedDB (via Dexie.js)                    │  │
│  │  • Perfis • Mapas • Carrinho • Compras • Settings   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐           │
│  │  jsPDF   │  │  Stripe  │  │  Nominatim API │           │
│  │  (local) │  │ Checkout │  │  (geocoding)   │           │
│  └──────────┘  └──────────┘  └────────────────┘           │
└────────────────────────────────────────────────────────────┘
```

### Engine Dual (3 níveis de fallback)

```
calculatePositions(date)
        │
        ├── 1. Swiss Ephemeris (sweph WASM) → ±0.001" precisão
        │       Planetas, Quíron, Nodo Verdadeiro, Lilith
        │       Casas Placidus reais (iterativas)
        │
        ├── 2. Astronomy Engine (fallback) → ±1' precisão
        │       Planetas principais via NASA/JPL
        │       Extras via elementos médios
        │
        └── 3. Mean Elements (último recurso) → ±1° precisão
                Zero dependências, funciona sempre
```

---

## Estrutura de Diretórios

```
lifemap-pro/
├── astro.config.mjs              ← Astro + SolidJS + Tailwind + i18n (10 locales)
├── tsconfig.json                 ← Strict + path aliases (@engine, @store, etc.)
├── tailwind.config.js            ← Tema brand + cores por elemento + fonts
├── package.json
├── src/
│   ├── engine/                   ← Motor astrológico TypeScript puro
│   │   ├── types.ts              ← Interfaces: NatalChart, Positions, Aspect, etc.
│   │   ├── calculations.ts      ← Engine dual: sweph → AstroEngine → mean
│   │   ├── sweph-provider.ts    ← Wrapper Swiss Ephemeris (init, calc, houses)
│   │   ├── houses.ts            ← Casas: sweph real → trig approx
│   │   ├── aspects.ts           ← 5 aspectos com orbes configuráveis
│   │   └── index.ts             ← API pública: natal, transits, synastry, etc.
│   ├── renderer/                 ← SVG rendering engine
│   │   └── wheel.ts             ← Wheel profissional estilo Astro.com
│   ├── components/               ← SolidJS islands
│   │   ├── chart/
│   │   │   ├── NatalApp.tsx     ← Orquestrador: form → cálculo → chart
│   │   │   ├── NatalWheel.tsx   ← Renderiza SVG do wheel
│   │   │   └── PlanetTable.tsx  ← Tabela de posições colorida
│   │   ├── forms/
│   │   │   └── BirthDataForm.tsx ← Formulário + geocoding (Nominatim)
│   │   └── layout/
│   │       ├── Header.tsx       ← Nav + Language Switcher + Cart
│   │       └── Footer.tsx       ← Links + copyright
│   ├── store/
│   │   └── db.ts                ← IndexedDB: profiles, charts, cart, purchases
│   ├── i18n/
│   │   ├── index.ts             ← Helper functions (t, getLocale, localePath)
│   │   ├── pt.json              ← Português (completo)
│   │   └── en.json              ← English (completo)
│   ├── layouts/
│   │   └── BaseLayout.astro     ← HTML base + fonts + dark mode
│   ├── pages/
│   │   ├── index.astro          ← Redirect → /pt/
│   │   ├── pt/
│   │   │   ├── index.astro      ← Home PT (hero + features + premium)
│   │   │   └── chart/
│   │   │       └── natal.astro  ← Mapa Natal funcional
│   │   └── en/
│   │       └── index.astro      ← Home EN
│   ├── styles/
│   └── utils/
└── public/
    ├── fonts/
    └── icons/
```

---

## Progresso por Fase

### ✅ Fase 1 — Fundação (COMPLETA)

| Item | Status | Detalhes |
|------|--------|----------|
| Projeto Astro + SolidJS + Tailwind | ✅ | Build OK, 4 páginas, 780ms |
| TypeScript strict + path aliases | ✅ | tsconfig.json configurado |
| i18n PT + EN com rotas | ✅ | 10 locales preparados |
| IndexedDB (Dexie.js) | ✅ | Schema: profiles, charts, cart, purchases, settings |
| Engine TypeScript modular | ✅ | 6 arquivos, API completa |
| Swiss Ephemeris (sweph WASM) | ✅ | v2.10.03, mesma engine do astro.com |
| Engine dual (sweph + fallback) | ✅ | 3 níveis de fallback |

### ✅ Fase 2 — Renderer + Mapa Natal (COMPLETA)

| Item | Status | Detalhes |
|------|--------|----------|
| Renderer SVG profissional | ✅ | wheel.ts (365 linhas), estilo Astro.com |
| Componente NatalWheel | ✅ | SolidJS, renderiza via innerHTML |
| Formulário BirthDataForm | ✅ | Geocoding via Nominatim OSM |
| Tabela PlanetTable | ✅ | Cores por elemento, retrógrado |
| Página /pt/chart/natal | ✅ | Funcional com client:load |
| Header + Footer + Layout | ✅ | Nav, Language Switcher, Cart icon |
| Home PT (hero + features) | ✅ | Design moderno com CTAs |

### ⏳ Fase 3 — Interpretações Gratuitas (PRÓXIMA)

| Item | Status | Descrição |
|------|--------|-----------|
| Salvar/carregar perfis | ⏳ | IndexedDB + ProfileSelector component |
| Página de Trânsitos | ⏳ | Bi-wheel: planetas do dia vs natal |
| Página de Sinastria | ⏳ | Comparação entre 2 mapas |
| Horóscopo diário pessoal | ⏳ | Trânsitos do dia com interpretação |
| Retrato de personalidade | ⏳ | Interpretação resumida gratuita |

### ⏳ Fase 4 — Loja & Premium

| Item | Status | Descrição |
|------|--------|-----------|
| Carrinho de compras | ⏳ | CartDrawer + IndexedDB |
| Stripe Checkout | ⏳ | Pagamento sem backend |
| Geração de PDF | ⏳ | jsPDF client-side |
| Relatório Natal Completo | ⏳ | 20-30 páginas |
| Relatório Relacionamento | ⏳ | Sinastria + Composto |
| Relatório Previsão Anual | ⏳ | Trânsitos + Profecção |
| Relatório Carreira | ⏳ | MC, Casa 10, Saturno |
| Preview gratuito (try-out) | ⏳ | Primeiras 2-3 páginas free |

### ⏳ Fase 5 — Funcionalidades Avançadas

| Item | Status | Descrição |
|------|--------|-----------|
| Efemérides customizáveis | ⏳ | Tabela mensal/anual |
| Fases da Lua | ⏳ | Calendário lunar |
| Retrógrados anuais | ⏳ | Tabela com datas |
| Revolução Solar | ⏳ | Mapa do aniversário |
| Progressões | ⏳ | Arco solar + secundárias |
| Astrologia Locacional | ⏳ | Mapa-múndi com linhas |
| AstroClick (interativo) | ⏳ | Click no mapa = interpretação |
| Astrologia Eletiva | ⏳ | Melhor momento |
| PWA + modo offline | ⏳ | Service Worker |
| Mais idiomas (ES, FR, DE...) | ⏳ | Traduções completas |

---

## Diferencial vs Astro.com

| Aspecto | Astro.com | LifeMap Pro |
|---------|-----------|-------------|
| Visual | Datado (2000s) | Moderno, dark/light mode |
| Performance | Lento (server render) | Instantâneo (client-side + WASM) |
| Conta | Requer cadastro para salvar | Zero login (IndexedDB) |
| PDF | Enviado por email | Gerado instantaneamente no browser |
| Offline | Não funciona | PWA — funciona offline |
| Mobile | Desktop-first | Mobile-first responsivo |
| Engine | Swiss Ephemeris (servidor) | Swiss Ephemeris (WASM no browser!) |
| Privacidade | Dados no servidor deles | 100% local, zero rastreamento |
| Idiomas | 11 | 10 (expandível) |
| Preço dos relatórios | €15-50 | R$25-40 (mais acessível) |

---

## Como Rodar

```bash
# Usar Node 22
source ~/.nvm/nvm.sh && nvm use 22

# Navegar até o projeto
cd ~/Documentos/code/lifemap-pro

# Dev server
npx astro dev

# Build para produção
npx astro build

# Preview do build
npx astro preview
```

Acesse:
- `http://localhost:4321/pt/` — Home
- `http://localhost:4321/pt/chart/natal/` — Mapa Natal
- `http://localhost:4321/en/` — Home (English)

---

## Decisões Técnicas

### Por que Swiss Ephemeris + Astronomy Engine (dual)?
- Swiss Ephemeris = mesma precisão do astro.com (sub-arcsecond)
- Astronomy Engine = resposta instantânea enquanto WASM carrega + offline
- Mean elements = último recurso (zero deps, funciona sempre)

### Por que Astro + SolidJS (não React/Next)?
- Astro gera HTML estático puro (zero JS por padrão)
- SolidJS hidrata apenas os componentes interativos (islands)
- Resultado: First Load < 100KB, LCP < 1s

### Por que IndexedDB (não localStorage)?
- Suporta blobs (PDFs gerados ficam offline)
- Queries por índice (buscar perfis por nome)
- Sem limite de 5MB (localStorage) — até centenas de MB
- Async (não bloqueia main thread)

### Por que Stripe Checkout (não Mercado Pago)?
- Funciona sem backend (redirect-only)
- Suporta múltiplas moedas
- Aceita PIX no Brasil
- Fallback: pode adicionar MP depois como segundo gateway

---

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Adicionar novo idioma
# 1. Criar src/i18n/es.json (copiar de en.json e traduzir)
# 2. Importar em src/i18n/index.ts
# 3. Criar src/pages/es/ com páginas

# Testar engine isoladamente
node -e "const s = require('sweph'); console.log(s.version())"
```

---

*Última atualização: 2026-07-05*
