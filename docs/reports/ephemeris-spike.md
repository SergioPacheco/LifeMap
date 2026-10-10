# Spike: sweph nativo × fallback JS (decisão serverless)

Data: 10/10/2026. Script: `scripts/reports/ephemeris-spike.ts` (reexecutável).
Motivo: Workers (Cloudflare) não executam o addon nativo `sweph`; o path
serverless usaria `astronomy-engine` + mean elements. O spike mede se isso
basta antes de reescrever o runtime da Tarefa 3.

## Método

`sweph` 2.10.03 nativo (Node, `initSweph()`) contra o fallback puro em três
frentes: longitudes em 2025-03-14T06:55Z, instantes de fases por bissecção
da elongação e dia da estação retrógrada de Mercúrio em março/2025.

## Resultados

| Corpo | Delta sweph − fallback |
|---|---|
| Sol | 0.00' |
| Lua | 0.05' |
| Mercúrio | 0.05' |
| Vênus | 0.09' |
| Marte | 0.02' |
| Júpiter | 0.03' |
| Saturno | 0.11' |
| Urano | 0.02' |
| Netuno | 0.19' |
| Plutão | 0.02' |
| Nodo Norte | 18.66' (mean × true — esperado) |
| Lilith | 179.9° — **bug nosso** (constante era o perigeu), corrigido para 263.35 |
| Quíron | 29° — modelo linear inadequado por construção |

Fases: cheia 14/03 delta 0.1 min; nova 29/03 delta 0.0 min.
Estação retrógrada de Mercúrio: dia 15/03 nos dois motores.
Lilith corrigida: ≤ 0.11° contra `SE_MEAN_APOG` em 2000–2030
(pinos em `tests/engine/fallback-quality.test.ts`).

## Decisão

1. **Fallback suficiente** para planetas, Lua, fases, estações, ingressos e
   retornos (≤ 0.2' ≪ orbes de 1–2°). WASM da Swiss Ephemeris **não** é
   necessário para o path serverless v1.
2. **Lilith**: constante corrigida (83.35 → 263.35); segue mean-grade
   (`approximate`), participa de fatos natais/sinastria, **fora** de
   contatos cronometrados no fallback.
3. **Quíron**: omitido de fatos, sinastria, overlays e buscas quando a
   fonte ativa for mean-elements (nunca publicado como computado); mantido
   com Swiss Ephemeris. A omissão vale para o pipeline factual; o calendário
   em tela legado segue com o motor como antes (issue conhecido, fora do
   escopo desta entrega).
4. **Nodo Norte**: mantido como `approximate` em fatos (18' ≪ orbes natais),
   fora de contatos cronometrados no fallback.
5. Efeito colateral positivo: a correção da Lilith beneficia o calendário
   em tela, que já rodava em fallback no navegador.

## Regras implementadas

- `calculations.ts`: constante + comentário de verificação.
- `natal-facts.ts` / `relationship-facts.ts`: omissão de Quíron por
  proveniência, `approximate` em endpoints mean-grade.
- `forecast/dataset.ts`: `DatasetOptions.positionsProvenance`; busca de
  trânsitos/ingressos só com grau computado nas duas pontas.
- Testes: `fallback-quality.test.ts`, caso Quíron em `facts.test.ts`,
  exclusão de trânsitos mean-grade em `forecast-dataset.test.ts`.
