# Baseline dos relatórios legados

Medido em 2026-10-10T10:26:11.791Z com Chromium, frontend local http://127.0.0.1:4321 e os geradores jsPDF existentes. Nenhuma chamada de IA. Artefatos: `/tmp/lifemap-report-baseline` (PDFs, texto extraído, JSON e imagens).

## Método e limites

77 PDFs: nove produtos × PT/EN/ES × amostra/completo, mais 23 amostras natais para cobrir os 24 perfis sintéticos. O perfil principal usa 29/02/1988, São Paulo, 06:15. Relacionamento foi medido sem parceiro, como o preview legado. Horários desconhecidos usam meio-dia apenas como referência para executar o gerador antigo; isso não valida suas casas/ângulos. O navegador usa o fallback do motor, sem addon nativo.

Palavras são tokens separados por espaço extraídos com pdftotext; não equivalem a extensão editorial útil. Bounding boxes fora da página são evidência geométrica de overflow; extração pode omitir texto inteiramente cortado e não detecta toda sobreposição. Marcadores PT/EN no JSON são indícios para revisão de idioma, não uma classificação automática.

## Medições do perfil principal

| Produto | Locale | Modo | Páginas reais | Palavras extraídas | Palavras fora da página | Wheel placeholder |
| --- | --- | --- | ---: | ---: | ---: | --- |
| natal | pt | sample | 5 | 280 | 0 | sim |
| natal | pt | complete | 26 | 3560 | 0 | sim |
| annual | pt | sample | 3 | 348 | 0 | não |
| annual | pt | complete | 20 | 3109 | 0 | não |
| relationship | pt | sample | 3 | 220 | 0 | não |
| relationship | pt | complete | 18 | 2726 | 0 | não |
| psychological | pt | sample | 3 | 279 | 0 | não |
| psychological | pt | complete | 22 | 3991 | 0 | não |
| career | pt | sample | 3 | 193 | 0 | não |
| career | pt | complete | 15 | 2190 | 0 | não |
| seven-sins | pt | sample | 3 | 273 | 0 | não |
| seven-sins | pt | complete | 15 | 2077 | 0 | não |
| financial | pt | sample | 4 | 618 | 0 | não |
| financial | pt | complete | 12 | 2853 | 0 | não |
| spiritual | pt | sample | 4 | 588 | 0 | não |
| spiritual | pt | complete | 13 | 3819 | 0 | não |
| saturn-return | pt | sample | 4 | 666 | 0 | não |
| saturn-return | pt | complete | 12 | 3126 | 1 | não |
| natal | en | sample | 5 | 277 | 0 | sim |
| natal | en | complete | 26 | 3554 | 0 | sim |
| annual | en | sample | 3 | 341 | 0 | não |
| annual | en | complete | 20 | 3008 | 0 | não |
| relationship | en | sample | 3 | 210 | 0 | não |
| relationship | en | complete | 18 | 2712 | 0 | não |
| psychological | en | sample | 3 | 277 | 0 | não |
| psychological | en | complete | 22 | 3964 | 0 | não |
| career | en | sample | 3 | 195 | 0 | não |
| career | en | complete | 15 | 2164 | 0 | não |
| seven-sins | en | sample | 3 | 277 | 0 | não |
| seven-sins | en | complete | 15 | 2075 | 0 | não |
| financial | en | sample | 4 | 618 | 0 | não |
| financial | en | complete | 12 | 2853 | 0 | não |
| spiritual | en | sample | 4 | 593 | 0 | não |
| spiritual | en | complete | 13 | 3828 | 0 | não |
| saturn-return | en | sample | 4 | 671 | 0 | não |
| saturn-return | en | complete | 12 | 3131 | 1 | não |
| natal | es | sample | 5 | 280 | 0 | sim |
| natal | es | complete | 26 | 3577 | 0 | sim |
| annual | es | sample | 3 | 340 | 0 | não |
| annual | es | complete | 20 | 3007 | 0 | não |
| relationship | es | sample | 3 | 212 | 0 | não |
| relationship | es | complete | 18 | 2714 | 0 | não |
| psychological | es | sample | 3 | 277 | 0 | não |
| psychological | es | complete | 22 | 3970 | 0 | não |
| career | es | sample | 3 | 197 | 0 | não |
| career | es | complete | 15 | 2166 | 0 | não |
| seven-sins | es | sample | 3 | 277 | 0 | não |
| seven-sins | es | complete | 15 | 2075 | 0 | não |
| financial | es | sample | 4 | 618 | 0 | não |
| financial | es | complete | 12 | 2853 | 0 | não |
| spiritual | es | sample | 4 | 588 | 0 | não |
| spiritual | es | complete | 13 | 3821 | 0 | não |
| saturn-return | es | sample | 4 | 669 | 0 | não |
| saturn-return | es | complete | 12 | 3129 | 1 | não |

## Evidências e pendências

- PDFs com placeholder da wheel: 29. Comparar wheel-browser.png e natal-pdf-wheel.png.
- PDFs com palavras fora da página: 5; soma: 7.
- Falhas de geração: 0.
- Os arquivos .txt permitem verificar misturas de idioma e comparar a extensão realmente produzida.
- Inspeção visual e exemplos específicos ficam registrados abaixo após revisão dos artefatos.
