# TRADUÇÃO DOS RELATÓRIOS — Sessões Dedicadas

## Status Geral

| # | Idioma | Arquivo | Metadados | Textos Interpretativos | Status |
|---|--------|---------|-----------|----------------------|--------|
| 1 | 🇧🇷 PT | pt.ts + pt-mercury.ts | ✅ | ✅ Nativo | COMPLETO |
| 2 | 🇺🇸 EN | en.ts (387 linhas) | ✅ | ✅ Nativo | COMPLETO |
| 3 | 🇪🇸 ES | es.ts (400 linhas) | ✅ | ✅ Nativo | COMPLETO |
| 4 | 🇫🇷 FR | fr.ts | ✅ | ⏳ EN provisório | PENDENTE |
| 5 | 🇩🇪 DE | de.ts | ✅ | ⏳ EN provisório | PENDENTE |
| 6 | 🇮🇹 IT | it.ts | ✅ | ⏳ EN provisório | PENDENTE |
| 7 | 🇳🇱 NL | nl.ts | ✅ | ⏳ EN provisório | PENDENTE |
| 8 | 🇹🇷 TR | tr.ts | ✅ | ⏳ EN provisório | PENDENTE |
| 9 | 🇷🇺 RU | ru.ts | ✅ | ⏳ EN provisório | PENDENTE |
| 10 | 🇨🇳 ZH | zh.ts | ✅ | ⏳ EN provisório | PENDENTE |
| 11 | 🇯🇵 JA | ja.ts | ✅ | ⏳ EN provisório | PENDENTE |

---

## O que cada sessão precisa fazer

### Arquivo: `src/engine/interpretations/{locale}.ts`

### Arrays a traduzir (14 arrays × 12 textos = 168 parágrafos por idioma)

```
SUN_IN_HOUSE[12]       — Sol nas 12 casas (identidade, propósito)
MOON_IN_HOUSE[12]      — Lua nas 12 casas (emoções, segurança)
MERCURY_IN_HOUSE[12]   — Mercúrio nas 12 casas (mente, comunicação)
VENUS_IN_HOUSE[12]     — Vênus nas 12 casas (amor, valores)
MARS_IN_HOUSE[12]      — Marte nas 12 casas (ação, desejo)
JUPITER_IN_HOUSE[12]   — Júpiter nas 12 casas (expansão, sorte)
SATURN_IN_HOUSE[12]    — Saturno nas 12 casas (disciplina, maestria)
URANUS_IN_HOUSE[12]    — Urano nas 12 casas (revolução, originalidade)
NEPTUNE_IN_HOUSE[12]   — Netuno nas 12 casas (espiritualidade, ilusão)
PLUTO_IN_HOUSE[12]     — Plutão nas 12 casas (poder, transformação)
CHIRON_IN_HOUSE[12]    — Quíron nas 12 casas (ferida, cura)
CHIRON_IN_SIGN[12]     — Quíron nos 12 signos (natureza da ferida)
NORTH_NODE_HOUSE[12]   — Nodo Norte nas 12 casas (propósito evolutivo)
NORTH_NODE_IN_SIGN[12] — Nodo Norte nos 12 signos (direção da alma)
```

### Fonte para tradução
Usar como base: `src/engine/interpretations/en.ts` (textos em inglês, já traduzidos do PT)

### Tom e estilo obrigatórios
- Linguagem humanística, profissional, acessível
- Não-fatalista: "tendência a", "convite para", "potencial de"
- Cada texto tem 80-250 palavras
- Incluir: descrição + desafio + caminho de integração
- Nunca usar diagnóstico ou determinismo

### O que NÃO mudar
- SIGN_NAMES, PLANET_NAMES, MONTHS — já traduzidos corretamente
- SECTION_TITLES, PLANET_SUBTITLES — já traduzidos
- LABELS (60+ chaves) — já traduzidos
- TRANSITIONS — já traduzidos

### Formato do arquivo final
```typescript
// INTERPRETATIONS — {IDIOMA} ({locale})
// Complete interpretive texts — no PT imports/fallback

export const SUN_IN_HOUSE: string[] = [
  /* House 1 */ 'Texto completo traduzido no idioma nativo...',
  /* House 2 */ '...',
  // ... 12 casas
];

export const MOON_IN_HOUSE: string[] = [ ... ];
// ... todos os 14 arrays

// METADADOS (já traduzidos, manter como está)
export const SIGN_NAMES = [...];
export const PLANET_NAMES = {...};
export const MONTHS = [...];
export const SECTION_TITLES = {...};
export const PLANET_SUBTITLES = {...};
export const LABELS = {...};
export const TRANSITIONS = {...};
```

---

## Prompt para cada sessão

```
Você é um tradutor especializado em astrologia humanística. Sua tarefa é traduzir
os textos interpretativos do arquivo src/engine/interpretations/en.ts para {IDIOMA}.

Projeto: /home/user-sn-387444/Documentos/code/LifeMap

1. Leia src/engine/interpretations/en.ts (387 linhas) — é a fonte EN
2. Traduza TODOS os 14 arrays (168 textos) para {IDIOMA} nativo
3. Reescreva src/engine/interpretations/{locale}.ts com os textos traduzidos
4. MANTENHA os metadados existentes (SIGN_NAMES, LABELS etc.) — já estão traduzidos
5. Verifique o build: cd /home/user-sn-387444/Documentos/code/LifeMap && source ~/.nvm/nvm.sh && nvm use 22 && npx astro build
6. Faça commit: git add -A && git commit -m "feat: traduz textos interpretativos para {IDIOMA}" && git push

Tom: humanístico, profissional, não-fatalista, com linguagem de potencial.
Volume: ~168 textos de 80-250 palavras cada.
```

---

## Ordem recomendada de execução

1. **FR** (Francês) — mercado europeu importante
2. **DE** (Alemão) — segundo idioma europeu
3. **IT** (Italiano) — romance, fácil do ES/FR
4. **RU** (Russo) — mercado grande de astrologia
5. **ZH** (Chinês) — maior mercado potencial
6. **JA** (Japonês) — mercado premium
7. **NL** (Holandês) — pode usar FR/DE como referência
8. **TR** (Turco) — último por menor prioridade

---

## Validação pós-tradução

Após cada sessão, verificar:
- [ ] Build OK (420 páginas)
- [ ] Zero imports de outros idiomas (grep "from.*'/pt'\|from.*'../interpret'" {locale}.ts)
- [ ] 21 exports (grep -c "^export const" {locale}.ts)
- [ ] ~270-400 linhas (wc -l {locale}.ts)
- [ ] Nenhum texto em inglês nos arrays (spot check visual)

---

*Criado: 2026-07-06 09:46*
*Projeto: /home/user-sn-387444/Documentos/code/LifeMap*
*Branch: main*
*Último commit: 3743ab2*
