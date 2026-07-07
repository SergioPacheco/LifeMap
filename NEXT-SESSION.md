# PRÓXIMA SESSÃO — Consolidação do Sistema i18n

## O que fazer

Refatorar o sistema de internacionalização para eliminar duplicação e seguir boas práticas.
Mover todas as traduções inline dos componentes para o sistema centralizado `src/i18n/*.json`.

---

## Contexto do Projeto

- **Projeto:** LifeMap Pro — plataforma de astrologia 100% client-side
- **Path:** /home/user-sn-387444/Documentos/code/LifeMap
- **Branch:** main
- **Build:** `source ~/.nvm/nvm.sh && nvm use 22 && npx astro build`
- **453 páginas, 11 idiomas, 9 relatórios premium**

---

## Problema Atual

4 sistemas de i18n coexistem:
1. `src/i18n/*.json` — UI labels (sistema principal, bom)
2. `src/content/{locale}/*.ts` — conteúdo educacional longo (aceitável separado)
3. `src/engine/interpretations/{locale}.ts` — textos PDF de relatórios (aceitável separado)
4. **Traduções inline nos componentes** ← PROBLEMA

O item 4 é o que precisa ser resolvido. Componentes como `ReportsShop.tsx` têm ~500 linhas de traduções hardcoded dentro do código.

---

## Plano de Execução

### Fase 1 — Mover produtos do ReportsShop para i18n/*.json

**Arquivo fonte:** `src/components/premium/ReportsShop.tsx`

**O que extrair:**
- Array PRODUCTS (9 produtos × { name, description, features, pages } × 11 idiomas)
- CATEGORIES (5 categorias × 11 idiomas)
- TRUST (3 frases × 11 idiomas)
- ADDED (1 frase × 11 idiomas)

**Destino:** Namespace `reports.products` dentro de cada `src/i18n/{locale}.json`:

```json
{
  "reports": {
    "products": {
      "natal-completo": {
        "name": "Mapa Natal Completo",
        "description": "Análise profunda de todas as posições...",
        "pages": "20-30 páginas",
        "features": [
          "Todos os planetas em signos e casas",
          "Aspectos com interpretação detalhada",
          "..."
        ]
      },
      "relacionamento": { ... },
      ...
    },
    "categories": {
      "all": "Todos",
      "personality": "Personalidade",
      "forecast": "Previsão",
      "relationship": "Relacionamento",
      "career": "Carreira"
    },
    "trust": {
      "instant": "Gerado instantaneamente no seu navegador",
      "privacy": "Seus dados nunca saem do dispositivo",
      "offline": "PDF disponível offline após geração"
    },
    "added": "✓ Adicionado!"
  }
}
```

**ReportsShop.tsx depois:**
```typescript
const t = () => getTranslations(locale());
const products = () => t().reports.products;
// PRODUCTS vira array de { id, icon, category, price, currency } — SEM traduções
```

### Fase 2 — Mover textos do ReportPreview para i18n

O `ReportPreview.tsx` já usa `t().reportPreview.*` — só confirmar que não tem strings soltas.

### Fase 3 — Mover textos dos relatórios PDF para sistema unificado

**Arquivo:** `src/reports/report-texts.ts` (já criado parcialmente)

Os relatórios (financial, spiritual, saturn-return + os 6 originais) têm parágrafos de contexto hardcoded em inglês/português. A melhor abordagem:

1. Manter `src/reports/report-texts.ts` como repositório central de textos de relatórios
2. Organizar por: `{ financial: { ... }, spiritual: { ... }, saturnReturn: { ... }, career: { ... }, ... }`
3. Cada gerador importa de lá: `const rt = getReportTexts(options.locale)`
4. Os 6 relatórios originais em `report-generators.ts` (~189 wrapText com strings PT) precisam ser extraídos também

**Nota:** Os textos de relatórios são LONGOS (parágrafos de 50-200 palavras cada). Mantê-los em arquivo TS separado é aceitável — não faz sentido colocar parágrafos de 200 palavras num JSON.

### Fase 4 — Type-safety (opcional, alto impacto)

Gerar tipo TypeScript a partir do JSON PT (canônico):
```typescript
// Auto-gerado a partir de pt.json
export interface Translations {
  nav: { home: string; dashboard: string; ... };
  reports: {
    products: Record<string, { name: string; description: string; pages: string; features: string[] }>;
    categories: Record<string, string>;
    ...
  };
  ...
}
```

Isso faz o TypeScript reclamar se acessar `t().chave.que.nao.existe`.

---

## Critérios de Sucesso

- [x] Zero traduções inline em componentes TSX (PRODUCTS, CATEGORIES, TRUST, ADDED movidos)
- [x] ReportsShop.tsx < 160 linhas (só lógica, sem dados de tradução) — era ~300
- [x] Build OK (453 páginas)
- [x] Trocar idioma em /reports mostra tudo traduzido (mesmo comportamento atual)
- [x] Adicionar um novo produto = editar 11 JSONs + 1 linha no componente
- [x] report-labels.ts criado com getReportLabels(locale) — 11 idiomas
- [x] 5 geradores PDF usam labels localizados (signs, planets, months)

---

## Ordem de prioridade geral

1. ~~**Fase 1** — Mover PRODUCTS/CATEGORIES/TRUST do ReportsShop~~ ✅ (commit 1ef2267)
2. ~~**Fase 3a** — Constantes compartilhadas (signs, planets, months) extraídas para report-labels.ts~~ ✅ (commit 5162153)
3. ~~**Fase 3b-annual** — Textos do generateAnnualPdf extraídos para annual-texts.ts (EN+PT)~~ ✅ (commit 38b7b4e)
4. ~~**Fase 4** — Type-safety (tipos auxiliares exportados, casts removidos)~~ ✅ (commit f5db6c8)
5. **Fase 3b-sevenSins** — Textos do generateSevenSinsPdf para seven-sins-texts.ts (EN+PT)
6. **Fase 3b-relationship** — Textos do generateRelationshipPdf (mais complexo: condicionais partner/solo)
7. **Fase 3b-psychological** — Textos do generatePsychologicalPdf
8. **Fase 3b-career** — Textos do generateCareerPdf
9. **Monetização** — Stripe Checkout real + Cloudflare webhook (T38/T39)

### Padrão estabelecido para Fase 3b

Cada relatório segue o mesmo pattern:
1. Criar `src/reports/<name>-texts.ts` com interface + EN (base completa) + PT (override)
2. Exportar `get<Name>Texts(locale)` que retorna EN por default
3. No gerador, adicionar `const xt = get<Name>Texts(options.locale)` e substituir strings inline
4. Outros idiomas: adicionar override para cada locale via `buildLocale()`

**Estimativa**: cada relatório leva ~30min (extrair EN+PT). Traduzir para os 9 idiomas restantes pode ser feito em batch com AI depois.

---

## Comando para iniciar sessão:
```
Refatore o sistema i18n do LifeMap Pro conforme NEXT-SESSION.md.
Fase 1: mover traduções inline do ReportsShop.tsx para os i18n/*.json.
Projeto: /home/user-sn-387444/Documentos/code/LifeMap
```

---

## Estado do Projeto (completo)

### ✅ Implementado
- 453 páginas (11 idiomas × 41 rotas)
- 9 relatórios premium (natal, relacionamento, anual, carreira, psicológico, 7 pecados, financeiro, espiritual, retorno de saturno)
- 11 idiomas com cobertura total em UI, conteúdo educacional e relatórios PDF
- Seletor de idioma independente para relatórios
- Carrinho com prevenção de duplicatas e exigência de perfil
- UX do carrinho com toast, badge e estado persistente
- Bug de hydration corrigido (sweph excluído do bundle client)

### 📋 Pendente
- Refatoração i18n (esta sessão)
- Monetização real: Stripe Checkout + Cloudflare webhook
- Textos de contexto dos PDFs em idioma nativo (report-texts.ts para 11 idiomas)

---

*Atualizado: 2026-07-06 22:55*
*Projeto: /home/user-sn-387444/Documentos/code/LifeMap*
*Branch: main*
*Último commit: f5db6c8*
