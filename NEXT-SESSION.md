# PRÓXIMA SESSÃO — Status do Projeto LifeMap Pro

## ✅ CONCLUÍDO

### Redesign Visual Dark Premium (Estilo Astroma.co)
- [x] tailwind.config.js — paleta dark/gold/cream
- [x] BaseLayout, Header, Footer — dark por padrão
- [x] Todos os componentes e páginas — zero `dark:` ou `bg-white`
- [x] Wheel SVG — cores adaptadas para fundo escuro
- [x] Onboarding + Dashboard — nova UX

### Motor de Interpretação — 5 Camadas
- [x] **Camada 1 (básica)**: planeta + signo → `interpret.ts` (SUN_SIGN_FLAVOR, MOON_SIGN_FLAVOR)
- [x] **Camada 2 (intermediária)**: planeta + signo + casa → `interpret.ts` (SUN/MOON/MERCURY/VENUS/MARS_IN_HOUSE)
- [x] **Camada 3 (profunda)**: planeta + signo + casa + aspectos → `aspect-interpretations.ts`
- [x] **Camada 4 (premium)**: síntese por tema → `synthesis.ts` (amor, dinheiro, carreira, missão, bloqueios, talentos)
- [x] **Camada 5 (narrativa)**: texto bonito e humano → `synthesis.ts` (generateOverview, getHouseTheme)

### Biblioteca de Interpretação
- [x] `interpret.ts` — Planetas pessoais nas casas (narrativa aprofundada) + Ascendente + Nodo Norte
- [x] `outer-planets.ts` — Jupiter, Saturn, Uranus, Neptune, Pluto nas 12 casas
- [x] `aspect-interpretations.ts` — 25+ pares de planetas × 3 tipos (conjunção, soft, hard)
- [x] `dignities.ts` — Regente do Ascendente, dignidades essenciais, elementos, modalidades
- [x] `synthesis.ts` — Síntese por 6 temas de vida com regentes das casas

### Gerador de PDF
- [x] Relatório tryout (3 páginas gratuitas)
- [x] Relatório completo com: overview narrativo, regente do mapa, elementos/modalidades, dignidades, 6 temas, planetas exteriores

---

## ARQUITETURA DAS CAMADAS

```
GRATUITO (site)         → Camada 1+2: interpret.ts (InterpretationPanel)
                          Ascendente + Sol/Lua/Mercúrio/Vênus/Marte nas casas + Nodo Norte

RELATÓRIO PDF (pago)    → Camada 3+4+5: synthesis.ts + aspect-interpretations.ts
                          Overview narrativo
                          Regente do Ascendente
                          Elementos e Modalidades  
                          Dignidades Essenciais
                          6 Temas (amor, carreira, dinheiro, missão, bloqueios, talentos)
                          Planetas exteriores (5 planetas × 12 casas)
                          Aspectos interpretados (quadraturas, oposições, trígonos)
```

---

## 🐛 BUG PENDENTE — Retrógrados não carrega no browser

**Página:** `/pt/tools/retrogrades` (RetrogradesApp.tsx)
**Sintoma:** Mostra "Nenhum período retrógrado encontrado para 2026" — o cálculo retorna array vazio.
**Causa provável:** O `astronomy-engine` funciona corretamente no Node.js (testado via `npx tsx`) mas algo falha no contexto do browser (SolidJS island hydration). Possíveis causas:
- Cache persistente do browser servindo versão antiga do componente
- Conflito entre SwissEph WASM e Astronomy Engine no mesmo contexto
- O `await` dentro do `onMount` pode não estar executando o `calculate()` corretamente

**O que já foi tentado:**
1. ✅ Detecção por `pos[].isRetrograde` (campo pode ser `false` quando sweph retorna sem speed)
2. ✅ Detecção por comparação de longitude (`checkRetro` com diff entre ontem/amanhã)
3. ✅ Usar `astronomy-engine` diretamente (sem depender do `calculatePositions` dual-engine)
4. ✅ Cache de posições com `lonCache` para evitar recalcular
5. ✅ Reinício do servidor Astro com limpeza de `.astro/`
6. ✅ Confirmado que no Node.js o cálculo funciona (Mercury retro Mar 1-20 detectado)

**Para resolver:**
- Abrir console do browser (F12) na página e verificar erros JavaScript
- Testar http://localhost:4321/test-retro.html (teste isolado do Astronomy Engine)
- Se `test-retro.html` funcionar, o bug é na integração SolidJS/Astro island
- Possível solução: pré-calcular retrógrados no build time (SSR) em vez de client-side

---

## PRÓXIMOS PASSOS

### Prioridade 1 — Monetização
- [ ] Integrar Stripe Checkout (pagamento real)
- [ ] Relatório de Relacionamento (sinastria + composto)
- [ ] Relatório de Previsão Anual (trânsitos + profecção)

### Prioridade 2 — Conteúdo
- [ ] Expandir biblioteca de aspectos (Urano, Netuno, Plutão entre si)
- [ ] Adicionar interpretações em inglês (i18n do interpret.ts)
- [ ] Seção de "recomendações" por tema (cristais, meditações, práticas)

### Prioridade 3 — UX/SEO
- [ ] SSR para SEO (meta tags dinâmicas por página)
- [ ] PWA offline completa (cache de efemérides)
- [ ] Google Analytics / Plausible
- [ ] Landing page de conversão para relatórios

---

*Atualizado: 2026-07-05 14:45*
*Projeto: /home/user-sn-387444/Documentos/code/LifeMap*
