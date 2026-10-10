# LifeMap — plano de implementação da refatoração com OpenAI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans para execução inline, ou superpowers:subagent-driven-development se o usuário escolher delegação. Executar por tarefas; os checkboxes registram progresso. Este documento é um plano, não uma autorização de implantação.

**Goal:** Entregar relatórios e previsões profundos, baseados em cálculos verificáveis, com OpenAI no servidor, leitor online e PDFs com composição editorial.

**Architecture:** Frontend Astro/SolidJS estático, API e worker Node separados, PostgreSQL para trabalhos/edições e armazenamento privado para artefatos. Motor determinístico produz contexto; OpenAI redige capítulos estruturados; validação antecede leitura e PDF. Conteúdo e apresentação são independentes.

**Tech Stack:** Astro, SolidJS, Tailwind, TypeScript, motor existente, Swiss Ephemeris no Node, SDK oficial OpenAI, Zod, PostgreSQL, Playwright/Chromium, Dexie. Adicionar Vitest e testes de integração/E2E. Fixar versões compatíveis no lockfile durante a primeira tarefa; não atualizar toda a stack como parte do planejamento.

**Spec:** [Desenho e requisitos](../specs/2026-10-10-openai-relatorios-design.md).

**Status:** Plano pronto para revisão; nenhuma tarefa de implementação executada em 10/10/2026.

## Global Constraints

- A chave OpenAI e os parâmetros financeiros ficam somente no servidor; no frontend, apenas `PUBLIC_REPORT_API_URL`.
- Nenhuma data/posição astronômica vem do modelo.
- Não entregar documento parcial como relatório completo nem trocar silenciosamente para um modelo mais barato.
- Natal completo: 8.000–12.000 palavras; anual completo: 10.000–15.000 palavras; capítulo mensal do anual: 450–650 palavras. São metas iniciais PT/EN/ES; métricas JA/ZH serão calibradas antes do rollout.
- Cada análise conserva vínculos às evidências; ausência de dados não é substituída por posição zero ou casa 1.
- Períodos: início inclusivo e fim exclusivo em UTC, apresentação no fuso IANA selecionado.
- Retry OpenAI: no máximo 2 retries transitórios; reescrita editorial: no máximo uma por capítulo reprovado.
- Entrada bruta criptografada até conclusão ou 24h; contexto, JSON e PDF privados por 30 dias; cópia local até exclusão pelo usuário.
- Preservar `LifeMapDB`, os perfis, carrinho e PDFs antigos, sem renomear a base ou limpar IndexedDB.
- Amostra pública local/pré-gerada; gasto pessoal com IA exige entitlement no servidor. O mock de pagamento nunca autoriza gasto público real.
- Não reescrever ferramentas gratuitas sem relação com relatórios/previsões nem migrar o framework.

## Review Focus

1. Hora desconhecida, ponto ausente e latitude problemática: omitir inferências dependentes; explicitar limites. Testes nas tarefas 1 e 2.
2. Período que cruza aniversário, DST, ano ou fronteira zodiacal: preservar profecção e datas corretas. Testes na tarefa 2.
3. Duplo clique, refresh, perda de conexão e restart após chamada paga: retomar sem duplicar pedido; registrar consumo ambíguo. Testes nas tarefas 3 e 4.
4. Relacionamento sem parceiro, produto legado e perfil editado durante geração: rejeitar ou usar snapshot correto; nunca entregar natal por fallback. Testes nas tarefas 1 e 6.
5. Documento muito longo, nomes extensos, caracteres CJK e versão nova de layout: preservar conteúdo, fontes, navegação e isolamento de cache. Testes nas tarefas 5 e 7.

## Entregas, dependências e arquivos

| Tarefa | Entrega independente | Dependências |
| --- | --- | --- |
| 1 | Contratos, produtos corretos e baseline | Nenhuma |
| 2 | Contexto e previsões calculadas | 1 |
| 3 | Serviço privado assíncrono, testável com gerador falso | 1 |
| 4 | Natal e anual com OpenAI e validação | 2, 3 |
| 5 | Leitor e PDF a partir de fixtures aprovadas | 1; integrar 4 depois |
| 6 | Fluxo ponta a ponta e biblioteca | 3, 4, 5 |
| 7 | Demais produtos, previsões e idiomas | 2, 4, 6 |
| 8 | Benchmark, observabilidade e rollout | Todas |

Não executar tarefas 4, 6 e 7 como alterações independentes do contrato compartilhado. A tarefa 5 pode começar com fixtures sem aguardar chamadas reais à API.

## Tarefa 1 — Contratos, catálogo central e baseline

**Files — criar:**

- `src/reports/core/types.ts`: contratos da spec e metadados de edição/apresentação.
- `src/reports/core/schemas.ts`: schemas Zod e invariantes de negócio.
- `src/reports/core/products.ts`: produto canônico, aliases, preço atual, reportType, perfis e período exigidos.
- `src/reports/core/policies.ts`: limites editoriais, quotas e features por produto/locale.
- `tests/reports/contracts.test.ts`, `tests/reports/products.test.ts`.
- `tests/fixtures/reports/profiles.ts`, `tests/fixtures/reports/documents.ts`: 24 perfis sintéticos e documentos curtos/longos, sem dados pessoais reais.
- `scripts/reports/baseline.ts`, `docs/reports/baseline.md`: inventário de conteúdo/idioma/defeitos visuais observados.
- `vitest.config.ts`.

**Files — modificar:** `package.json`, `package-lock.json`, `src/store/db.ts`, `src/store/payment.ts`, `src/components/premium/ReportsShop.tsx`.

**Interfaces:**

- Tipos da seção 5 da spec; `PresentationData = { subjects: Array<{ displayName: string; birthDate: string; birthTime: string | null; birthCity: string }>; editionLabel: string }`.
- `ProductDefinition = { id: string; aliases: string[]; reportType: ReportType; price: number; currency: string; subjectCount: 1 | 2; requiresPeriod: boolean }`.
- `resolveProduct(productId: string): ProductDefinition` lança `UNKNOWN_PRODUCT` para IDs inválidos.
- `validateReportRequest(input: unknown): ReportRequest` rejeita período inválido, locale desconhecido, `focus` > 1.000 caracteres, relacionamento completo sem duas pessoas, horário aproximado sem faixa de incerteza e forecast sem período/granularidade.
- `ReportPolicy = { totalMinWords: number; totalMaxWords: number; chapterRanges: Record<string, { min: number; max: number }>; enabled: boolean }`.

**Steps:**

- [ ] Adicionar runner e dependências de contrato; scripts `test` e `test:reports` executam `vitest run`, `test:e2e:reports` executa `playwright test --config playwright.reports.config.ts`. Vitest exclui `tests/e2e/**`. Incluir `@astrojs/check` se necessário para tornar `npm run check` executável.
- [ ] Escrever testes que falham para todos os aliases atuais, três produtos ausentes no `PRODUCT_MAP`, tipo desconhecido, parceiro obrigatório, período com `end <= start` e birth time desconhecido.
- [ ] Rodar `npm run test:reports -- tests/reports/contracts.test.ts tests/reports/products.test.ts`; confirmar falha pelos contratos ainda ausentes.
- [ ] Implementar contratos e catálogo; preservar preços atuais e distinguir sample/complete. Adicionar `timeQuality` ao Profile por migração Dexie v3; registros antigos ficam `exact` como compatibilidade histórica, com possibilidade de correção pelo usuário, sem afirmar que foram verificados.
- [ ] Migrar somente leitura de catálogo/preços da loja e payment para registro central, mantendo interfaces existentes durante a transição.
- [ ] Gerar baseline via navegador com as fixtures: páginas, palavras extraídas, textos cortados, wheel e misturas de idioma. PDF legado pode depender do DOM; não tentar executá-lo diretamente em Node.
- [ ] Reexecutar testes e `npm run build`; esperado: novos contratos passam e site estático continua compilando.
- [ ] Registrar checkpoint em commit contendo só esta entrega e suas fixtures, após revisão do diff.

**Aceite:** cada produto tem um destino explícito; registros antigos abrem; relação exige parceiros; baseline documenta evidências reais, sem converter páginas planejadas em números medidos.

## Tarefa 2 — Motor factual e preditivo com procedência

**Files — criar:**

- `src/reports/facts/context.ts`, `src/reports/facts/natal-facts.ts`, `src/reports/facts/relationship-facts.ts`: converter mapas em evidências e limites.
- `src/engine/forecast/dataset.ts`, `src/engine/forecast/transit-windows.ts`, `src/engine/forecast/event-ranking.ts`, `src/engine/forecast/coverage.ts`: período, janelas, ranking e cobertura.
- `tests/engine/forecast-dataset.test.ts`, `tests/engine/transit-windows.test.ts`, `tests/reports/facts.test.ts`.
- `tests/fixtures/engine/reference-events.json`: eventos de referência com fonte e tolerância, obtidos e verificados nesta tarefa.

**Files — modificar:** `src/engine/calculations.ts`, `src/engine/sweph-provider.ts`, `src/engine/index.ts`, `src/engine/calendar/month-calculator.ts`, `src/engine/calendar/types.ts`, `src/engine/calendar/profection.ts`, `src/engine/calendar/eclipses.ts`, `src/engine/calendar/planetary-returns.ts`, `src/engine/progressions.ts`.

**Interfaces:**

- `buildReportContext(request: ReportRequest): Promise<ReportContext>` recalcula os mapas no ambiente autorizado e devolve fatos, eventos e hash canônico.
- `buildForecastDataset(request: ReportRequest): Promise<ForecastEvent[]>` exige `period` para conteúdo temporal.
- `findTransitWindows(sample: (utcMs: number) => number, startUtcMs: number, endUtcMs: number, orbDeg: number): Array<{ startUtcMs: number; peakUtcMs: number | null; endUtcMs: number }>`; `sample` fornece desvio angular assinado e normalizado do contato.
- `CalculationProvenance = { engine: 'swisseph' | 'astronomy-engine' | 'mean-elements'; source: string; precision: AstroFact['precision'] }` por posição/evento. Não usar apenas `isSwephReady()` como prova de procedência.

**Steps:**

- [ ] Escrever testes determinísticos com movimento simulado para três passagens retrógradas, passagem 359°→0°, tangência de orbe e evento ativo na borda do período.
- [ ] Escrever testes de aniversário antes/depois da data, mudança de profecção dentro do período, DST em fuso IANA e ano bissexto. Testar ausência de casas/ângulos com horário desconhecido.
- [ ] Rodar `npm run test:reports -- tests/engine tests/reports/facts.test.ts`; confirmar falha das interfaces novas.
- [ ] Implementar procedência por resultado, contexto natal e relação usando `calculateComposite()` existente. Não reproduzir a média simples de longitudes do PDF antigo.
- [ ] Implementar dataset agregando meses e deduplicando eventos entre meses. Reaproveitar fases/profecções, acrescentar busca refinada de trânsitos/retornos. Usar tolerância temporal de 60 segundos apenas onde a fonte também suporta essa precisão; catálogo de dia mantém precisão `day`.
- [ ] Validar catálogo de eclipses e bloquear anual completo sem cobertura. Corrigir estimativas de retorno/contatos de progressões no pipeline novo; remover datas simbólicas do caminho novo.
- [ ] Produzir fixtures de referência astronômica com fonte primária e limites documentados; testar cálculos e fallback em ambientes Node/browser. Não colocar datas copiadas sem validação nas fixtures.
- [ ] Rodar testes de cálculo e build; esperado: dataset reproduzível, contagem consistente de janelas, precisão real registrada, nenhuma posição ausente convertida em zero.
- [ ] Registrar checkpoint em commit.

**Aceite:** o backend entrega fatos e períodos úteis sem depender de IA; Swiss Ephemeris só é anunciado quando foi realmente usado e a qualidade dos pontos extras é conhecida.

## Tarefa 3 — API privada, jobs retomáveis e custo reservado

**Files — criar:**

- `services/report-api/main.ts`, `services/report-api/routes.ts`, `services/report-api/auth.ts`: servidor, rotas e sessões.
- `services/report-api/entitlements.ts`, `services/report-api/budget.ts`, `services/report-api/validation.ts`: permissão de consumo, reserva e entrada.
- `services/report-worker/main.ts`, `services/report-worker/jobs.ts`: claim, lease, heartbeat e etapas.
- `services/shared/db.ts`, `services/shared/storage.ts`, `services/shared/errors.ts`, `services/shared/config.ts`.
- `services/migrations/001-reports.sql`: sessões, trabalhos, capítulos, documentos, artefatos, entitlements, reservas e tentativas.
- `services/tsconfig.json`, `services/Dockerfile`, `compose.reports.yml`, `.env.example`.
- `tests/services/report-api.test.ts`, `tests/services/jobs.test.ts`, `tests/services/budget.test.ts`.

**Files — modificar:** `package.json`, `package-lock.json`; manter `.github/workflows/deploy.yml` estático.

**Interfaces:**

- `JobSnapshot = { jobId: string; stage: JobStage; completedChapters: number; totalChapters: number; documentAvailable: boolean; errorCode: string | null; retryable: boolean; updatedAt: string }`.
- `createReportJob(ownerId: string, request: ReportRequest, idempotencyKey: string): Promise<JobSnapshot>`.
- `getReportJob(ownerId: string, jobId: string): Promise<JobSnapshot>`.
- `claimReportJob(workerId: string): Promise<JobSnapshot | null>`.
- `processReportJob(jobId: string, pipeline: ReportPipeline): Promise<void>`.
- `ReportPipeline` expõe `calculate(request: ReportRequest): Promise<ReportContext>`, `plan(request: ReportRequest, context: ReportContext): Promise<ReportPlan>`, `write(request: ReportRequest, context: ReportContext, plan: ReportPlan, approved: ChapterDraft[], onApproved: (chapter: ChapterDraft) => Promise<void>): Promise<ChapterDraft[]>`, `review(document: ReportDocument): Promise<ReportDocument>` e `render(document: ReportDocument, presentation: PresentationData): Promise<Uint8Array>`. Na primeira entrega, injetar pipeline falso sem OpenAI.
- `authorizeConsumption(ownerId: string, request: ReportRequest): Promise<void>` e `reserveBudget(jobId: string, estimateUsd: number): Promise<void>`.

**Steps:**

- [ ] Escrever integração que envia 2 POSTs com a mesma chave e obtém 1 job; mesma chave com outro payload retorna 409. Acesso de outro owner retorna 404 sem revelar existência.
- [ ] Escrever testes de sessão sem entitlement, teto excedido e quota esgotada: nenhum trabalho pago é aceito. CORS sozinho não libera consumo.
- [ ] Escrever testes com worker encerrado após um capítulo, lease expirado e retomada: capítulo aprovado é reutilizado; duas instâncias não reivindicam o mesmo lease ativo.
- [ ] Rodar `npm run test:reports -- tests/services/report-api.test.ts tests/services/jobs.test.ts tests/services/budget.test.ts` com banco de teste isolado; confirmar falhas dos serviços ausentes.
- [ ] Implementar as rotas da spec, migração PostgreSQL, hashing de token convidado, limites de payload/rate e claims transacionais. Commits de etapas exigem lease/fencing token atual para impedir que worker com lease expirado sobrescreva o progresso. Separar documento aprovado de artefato PDF pronto.
- [ ] Implementar retenção, cancelamento e deleção; storage local apenas para dev. Jobs não dependem de uma requisição HTTP longa aberta.
- [ ] Montar container com Node, dependências nativas e Chromium; scripts `api:dev`, `worker:dev`, `services:build`, `test:services`. Testar carregamento de `sweph` no container.
- [ ] Reexecutar testes e `npm run services:build`; executar smoke local do worker falso. Esperado: job conclui/retoma, chave não aparece no frontend e request negado não reserva custo.
- [ ] Registrar checkpoint em commit.

**Aceite:** infraestrutura opera de modo privado com gerador falso, sem gastos de API; testes demonstram isolamento, persistência e retomada.

## Tarefa 4 — Blueprints, OpenAI e qualidade: natal/anual

**Files — criar:**

- `src/reports/planning/plan.ts`, `src/reports/planning/blueprints/natal.ts`, `src/reports/planning/blueprints/annual.ts`.
- `src/reports/knowledge/select.ts`, `src/reports/knowledge/catalog.ts`: base curada, versionada e selecionada por evidência.
- `services/report-worker/openai/client.ts`, `services/report-worker/openai/chapter-writer.ts`, `services/report-worker/openai/editor.ts`, `services/report-worker/openai/usage.ts`.
- `services/report-worker/prompts/system-v1.ts`, `services/report-worker/prompts/chapter-v1.ts`, `services/report-worker/prompts/editor-v1.ts`.
- `src/reports/quality/validate.ts`, `src/reports/quality/evidence.ts`, `src/reports/quality/coverage.ts`, `src/reports/quality/repetition.ts`.
- `tests/reports/planning.test.ts`, `tests/reports/quality.test.ts`, `tests/services/openai-pipeline.test.ts`.

**Files — modificar:** `services/report-worker/jobs.ts`, `src/reports/core/policies.ts`.

**Interfaces:**

- `planReport(request: ReportRequest, context: ReportContext): ReportPlan`.
- `generateChapter(chapter: PlannedChapter, context: ReportContext, locale: Locale): Promise<ChapterDraft>`.
- `validateReport(document: ReportDocument): QualityResult`.
- `reviewReport(document: ReportDocument): Promise<ReportDocument>` preserva IDs e retorna conteúdo sujeito à revalidação.
- `computeUsageCost(usage: ProviderUsage, prices: PriceTable): number`; `ProviderUsage = { inputTokens: number; cachedInputTokens: number; cacheWriteTokens: number; outputTokens: number; reasoningTokens: number }`, com categorias mutuamente exclusivas para cálculo e raciocínio identificado como subconjunto da saída quando assim faturado pelo provedor. `PriceTable = { model: string; mode: string; version: string; inputUsdPerMillion: number; cachedInputUsdPerMillion: number; cacheWriteUsdPerMillion: number; outputUsdPerMillion: number }`.

**Steps:**

- [ ] Escrever testes de planos: anual tem 12 capítulos mensais no período; evidências prioritárias aparecem; cada mês recebe seus eventos; natal integra indicadores e não apenas lista planetas.
- [ ] Escrever testes de rejeição: ID inexistente, data técnica divergente, capítulo abaixo da faixa, duplicação de parágrafos, locale errado, resposta truncada e refusal. Texto factual contraditório é reprovado mesmo com evidenceId existente.
- [ ] Escrever testes do client falso: 429/503 têm retry limitado; 400 não é repetido; JSON incompleto não vira PDF; teto inclui revisão/retries; nomes/notas de perfil não entram no payload enviado.
- [ ] Rodar `npm run test:reports -- tests/reports/planning.test.ts tests/reports/quality.test.ts tests/services/openai-pipeline.test.ts`; confirmar falha das unidades novas.
- [ ] Implementar geração pelo SDK/Responses com Structured Outputs e `store: false`; schemas e instruções versionados. Resumos globais compactos limitam contexto; evidências completas ficam por capítulo.
- [ ] Implementar revisão global e regeneração seletiva, max. uma reescrita editorial por capítulo. Validação por código usa fatos normalizados; checagem semântica e revisão humana complementam sem prometer prova automática de toda a prosa.
- [ ] Integrar checkpoints e reserva de custo ao worker. A chamada externa pode ter sido cobrada mesmo sem resposta local; registrar tentativa ambígua e reservar margem antes de repetir.
- [ ] Reexecutar testes com mocks e `npm run services:build`; esperado: report só avança a renderização se aceito. Não adicionar chamadas pagas aos testes comuns.
- [ ] Executar um smoke real somente quando chave e teto do piloto estiverem configurados; registrar tokens, modelo, custo e qualidade, sem usar perfis pessoais reais.
- [ ] Registrar checkpoint em commit.

**Aceite:** natal/anual produzem JSON aprovado com profundidade, locale e evidências; indisponibilidade da IA resulta em estado retomável e informado.

## Tarefa 5 — Layout editorial, leitor e PDF

**Files — criar:**

- `src/reports/presentation/theme.ts`, `src/reports/presentation/report-html.ts`, `src/reports/presentation/print.css`, `src/reports/presentation/charts.ts`.
- `services/report-worker/pdf/render.ts`, `services/report-worker/pdf/assets.ts`.
- `src/components/reports/ReportReader.tsx`, `ReportContents.tsx`, `ReportChapter.tsx`, `ReportEvidence.tsx`, `ReportTimeline.tsx` no mesmo diretório.
- `src/pages/[lang]/reports/view.astro`: página estática; carregar ID pela query e buscar dados com sessão. Não exigir geração SSG para IDs privados.
- `public/fonts/reports/`: fontes locais com licenças e cobertura verificada; assets compartilhados no container.
- `tests/reports/presentation.test.ts`, `tests/e2e/report-reader.spec.ts`, `tests/e2e/report-pdf.spec.ts`, `playwright.reports.config.ts`.

**Files — modificar:** `src/styles/global.css`, `tailwind.config.js`, `src/renderer/wheel.ts` somente se necessário para renderização segura fora do DOM.

**Interfaces:**

- `renderReportHtml(document: ReportDocument, presentation: PresentationData): string`.
- `renderReportPdf(document: ReportDocument, presentation: PresentationData): Promise<Uint8Array>`.
- `ReportReader` recebe `document: ReportDocument` e `presentation: PresentationData`; só renderiza texto/estrutura permitidos.
- `ReportTimeline` recebe `events: ForecastEvent[]`, `locale: Locale`, `timeZoneId: string`.

**Steps:**

- [ ] Escrever testes de escaping de texto/nome, ausência de scripts externos e renderização de todos os capítulos/evidências.
- [ ] Escrever E2E de sumário/link, drawer mobile, leitura por teclado, expansão de fundamentos e timeline no fuso escolhido.
- [ ] Criar fixture de capítulo com 3 páginas de texto, tabela longa e nomes extensos; verificar continuidade e ausência de conteúdo fora da área imprimível. Incluir PT, ES, RU, JA e ZH com fontes reais.
- [ ] Rodar `npm run test:reports -- tests/reports/presentation.test.ts` e `npm run test:e2e:reports -- tests/e2e/report-reader.spec.ts tests/e2e/report-pdf.spec.ts`; confirmar falha da apresentação ausente.
- [ ] Implementar tokens visuais da spec, corpo editorial claro, leitura com 65–75 caracteres por linha e navegação dark/gold. Componentes respeitam mobile e hierarquia sem blocos técnicos obrigatórios na leitura principal.
- [ ] Implementar PDF com fontes locais aguardadas, SVG inline, `@page`, cabeçalhos/rodapés e quebra segura de blocos. Usar Chromium com outline/tagged e sumário por links; impedir requests de rede arbitrários no renderer.
- [ ] Extrair texto do PDF e comparar a sequência de parágrafos com o documento; inspecionar screenshots de capa, tabela, capítulo longo e último capítulo. Screenshot sozinha não prova que todo conteúdo foi preservado.
- [ ] Rodar testes e build; esperado: todo texto existe no PDF, wheel aparece e não há glifos ausentes/overflow nas fixtures. Inspecionar bookmarks e tags antes de anunciar PDF acessível.
- [ ] Registrar checkpoint em commit.

**Aceite:** o novo visual funciona com documentos longos, mesmo antes da integração OpenAI; não depende de código gerado pelo modelo.

## Tarefa 6 — Fluxo assíncrono, loja e biblioteca

**Files — criar:**

- `src/reports/client/api.ts`, `src/reports/client/jobs.ts`: sessão, polling, retry, cancelamento e cache local.
- `src/components/reports/ReportSetup.tsx`, `GenerationProgress.tsx`, `ReportLibrary.tsx` no mesmo diretório.
- `tests/reports/client-jobs.test.ts`, `tests/reports/dexie-migration.test.ts`, `tests/e2e/report-purchase.spec.ts`.

**Files — modificar:**

- `src/components/premium/ReportPreview.tsx`, `BuyReportButton.tsx`, `ReportsShop.tsx`, `PurchasesApp.tsx`, `PurchasesPage.tsx`.
- `src/components/cart/CartPage.tsx`, `src/store/db.ts`, `src/store/payment.ts`.
- `src/components/layout/Header.tsx`, `src/pages/[lang]/dashboard.astro`, `src/pages/[lang]/purchases.astro`, `src/pages/[lang]/reports/index.astro`.
- `src/i18n/*.json`: fluxos, dados remotos, geração e biblioteca.
- `services/report-api/entitlements.ts`; adicionar adaptador de checkout/webhook em `services/report-api/payments.ts` antes da venda pública.

**Interfaces:**

- `requestReport(request: ReportRequest, idempotencyKey: string): Promise<JobSnapshot>`.
- `pollReport(jobId: string): Promise<JobSnapshot>`; usar backoff local entre 2 e 10 segundos e parar em estados terminais/aba oculta.
- `downloadReport(jobId: string): Promise<Blob>`.
- `saveReportEdition(document: ReportDocument, pdf: Blob, localProfileIds: number[]): Promise<number>`.
- `StoredReportEdition` guarda documento, pdfData, perfil/período/locale, versão, jobId e createdAt; `StoredGenerationJob` guarda jobId, chave e snapshot de exibição. Migração Dexie v4 adiciona tabelas, sem apagar `purchases`.

**Steps:**

- [ ] Escrever testes de migração v2→v4 com compras/PDFs existentes, relacionamentos com dois perfis e aliases antigos. Nenhum item desconhecido cai no natal.
- [ ] Escrever E2E com duplo clique, reload na escrita, falha de PDF após conteúdo aprovado, retomada sem nova compra e edição de perfil durante geração.
- [ ] Escrever teste server-side em que compra local/mock é forjada: entitlement pago é negado. Webhook inválido/duplicado não concede benefício em duplicidade; preço vem do catálogo do servidor.
- [ ] Rodar os testes específicos; confirmar falha do fluxo novo.
- [ ] Implementar preparação e progresso reais; trocar contrato síncrono `generatePdf(...): Blob` por solicitação assíncrona. Snapshot inicial é autoritativo e o segundo perfil é obrigatório onde necessário.
- [ ] Unificar loja/carrinho/botão/amostra pelo registro central. Não usar perfil mais recente se o perfil escolhido desapareceu: solicitar seleção novamente. Carrinho parcial conserva itens não concluídos e IDs dos já processados.
- [ ] Implementar biblioteca de edições, documentos prontos e jobs pendentes; salvar PDF/JSON em Dexie. Leitor consulta a cópia local antes de pedir servidor; origens privadas não entram em cache público.
- [ ] Atualizar navegação, dashboard e textos sobre processamento local, download instantâneo e limites de retenção. Manter rotas antigas para não quebrar atalhos.
- [ ] Conectar entitlement do piloto privado; antes de habilitar venda pública, integrar checkout/webhook real verificado e retorno ao mesmo job. Não enviar e-mail automaticamente como parte do fluxo.
- [ ] Rodar E2E, testes de migração e build; esperado: produto/perfil/parceiros/período corretos em todo fluxo, PDF antigo abre, novo job retoma e não repete pagamento.
- [ ] Registrar checkpoint em commit.

**Aceite:** experiência completa do piloto funciona; UI distingue falha, conteúdo aprovado e PDF pronto; venda pública segue bloqueada se entitlement real não estiver integrado.

## Tarefa 7 — Demais relatórios, previsões online e idiomas

**Files — criar:**

- `src/reports/planning/blueprints/relationship.ts`, `career.ts`, `financial.ts`, `psychological.ts`, `spiritual.ts`, `saturn-return.ts`, `seven-sins.ts`, `child.ts`, `forecasts.ts` no mesmo diretório.
- `src/components/forecasts/ForecastReader.tsx`, `ForecastPeriodPicker.tsx`, `ForecastSummary.tsx`.
- `services/report-worker/public-forecasts.ts`: geração programada e publicação de leitura por signo.
- `tests/reports/product-blueprints.test.ts`, `tests/reports/locales.test.ts`, `tests/e2e/forecasts.spec.ts`.

**Files — modificar:** `src/components/chart/DailyHoroscopeApp.tsx`, `WeeklyHoroscopeApp.tsx`, `AllSignsDailyHoroscope.tsx`, `src/components/chart/calendar/MonthInsights.tsx`, `src/pages/[lang]/horoscope/weekly.astro`, `src/engine/daily-horoscope.ts`, `src/reports/core/policies.ts`, módulos de i18n necessários.

**Interfaces:**

- `planForecast(context: ReportContext, granularity: ForecastGranularity, locale: Locale): ReportPlan`.
- `getPublicForecast(signIndex: number, period: ForecastPeriod, locale: Locale): Promise<ReportDocument | null>`; serve conteúdo publicado, não dispara custo por visitante.
- Os blueprints usam `planReport()` e o mesmo contrato de narrativa/presentation; nenhum gerador de produto volta a desenhar PDF diretamente.

**Steps:**

- [ ] Escrever testes de cada blueprint com seus indicadores próprios, faixa editorial da spec e cobertura de fatos. Criança usa linguagem de desenvolvimento; financeiro não promete retornos; psicológico não atribui diagnóstico/biografia.
- [ ] Escrever testes de Saturno com múltiplas passagens calculadas e relação com mapas A/B distintos. Verificar composto em fronteira 0°/360°.
- [ ] Escrever testes de weekly como síntese da semana, monthly com eventos do período e por-signo claramente geral. Cache público não contém nomes/perfis/fatos pessoais.
- [ ] Rodar `npm run test:reports -- tests/reports/product-blueprints.test.ts tests/reports/locales.test.ts`; confirmar falha dos blueprints novos.
- [ ] Implementar blueprints em ordem de lançamento da spec; reutilizar conhecimento curado. Preservar arquivos de textos antigos somente como fontes ou modo legado explícito durante rollout.
- [ ] Integrar componentes preditivos, seleção de período e leitura completa. Retirar truncamento permanente de 60 caracteres na leitura semanal; resumo continua curto com acesso ao conteúdo completo.
- [ ] Localizar UI e narrativa; semanal recebe `locale`. Calibrar métrica de extensão JA/ZH e validar fontes/glossário por locale antes de habilitar geração paga.
- [ ] Implementar geração pública agendada com orçamento próprio e último conteúdo válido; distinguir “não publicado” de “sem eventos”. Não gerar novos relatórios pessoais só porque o mês foi navegado.
- [ ] Rodar testes de blueprints, locales, E2E de previsões e build. Esperado: cada produto usa seu conteúdo, período correto, idioma consistente e compartilhamento apenas de conteúdo geral.
- [ ] Registrar checkpoint em commit.

**Aceite:** catálogo e previsões online usam a mesma base de evidências e qualidade; rollout por produto/locale permite validar cada família.

## Tarefa 8 — Avaliação, rollout e documentação

**Files — criar:**

- `scripts/reports/evaluate.ts`, `scripts/reports/cost-summary.ts`.
- `tests/e2e/reports-regression.spec.ts`, `docs/reports/evaluation.md`, `docs/reports/operations.md`, `docs/reports/deployment.md`.
- `.github/workflows/reports-ci.yml`: testes com mocks, build de frontend/serviços e integração com banco isolado.

**Files — modificar:** `REPORTS-ARCHITECTURE.md`, `REPORTS-SKELETONS.md`, `PROJETO.md`, `TASKS.md`, políticas/flags do servidor e frontend.

**Interfaces:**

- Feature flags por `reportType`, `locale` e modo: legado, piloto ou novo. O nome/edição entregues deixam claro qual caminho foi utilizado.
- Avaliação registra tamanho útil, cobertura, rubrica editorial, erros, tokens, USD, duração por etapa e p50/p95 por produto. Modelo e tabela de preços ficam associados à execução.

**Steps:**

- [ ] Escrever regressão que exercita migração, todos os aliases e caminhos de aquisição; flags desligadas não expõem jobs pagos e PDFs antigos continuam baixáveis.
- [ ] Rodar a regressão e corrigir falhas reais de integração antes do piloto.
- [ ] Executar conjunto offline dos 24 perfis e renderizar documentos longos nos 11 idiomas; inspecionar amostras críticas e confirmar preservação de texto.
- [ ] Executar benchmark pago dos 12 relatórios previstos na spec, com teto configurado, comparando candidatos de modelo. Revisão editorial humana verifica especificidade, integração, clareza, utilidade e repetição; exigir ≥ 4/5 em cada dimensão.
- [ ] Registrar falhas e custo real, calibrar concorrência/blueprints/modelos e confirmar margem operacional dos produtos sem alterar preços automaticamente. Não habilitar catálogo inteiro se apenas natal foi avaliado.
- [ ] Habilitar piloto privado natal/anual; testar falha/restart/cancelamento/expiração no ambiente de homologação e coleta de métricas sem payload pessoal nos logs.
- [ ] Atualizar documentação: backend, motor nativo versus fallback, retenção, chave, custos, operação de fila, backups/exclusão e recuperação de jobs. Remover “Zero IA em runtime” e promessas de “100% local” onde o novo fluxo as invalidou.
- [ ] Executar `npm run test:reports`, `npm run test:services`, `npm run test:e2e:reports`, `npm run check`, `npm run build`, `npm run services:build` e `git diff --check`; registrar resultados efetivos, sem declarar checks não executados como passados.
- [ ] Produzir release revisável e instruções de implantação. Publicar gradualmente somente depois da autorização de implantação e das credenciais/requisitos operacionais disponíveis; reduzir flags permite rollback do fluxo, preservando artefatos já gerados.
- [ ] Registrar checkpoint final em commit; remover geradores antigos somente quando todos seus consumidores migrarem e a regressão demonstrar equivalência dos fluxos necessários.

**Aceite:** evidências de ganho editorial/visual, custos e tempos medidos, catálogo validado por flags e documentação operacional coerente com o software entregue.

## Revisão do plano e condições para execução

O desenho e o plano abrangem a cadeia completa solicitada. A escolha inicial recomendada é execução inline por entregas, começando com contratos e dataset factual, seguida de um piloto natal/anual. Isso mantém os contratos compartilhados sob uma implementação consistente e permite validar qualidade/custo antes de expandir.

Antes de executar, revisar as metas de conteúdo e o desenho de layout. Não é necessário obter uma chave para revisar este plano; chave, teto de gasto, ambiente de backend e pagamento real só passam a ser necessários nas respectivas etapas. Nenhuma infraestrutura externa, compra, chamada paga ou publicação foi realizada durante o planejamento.
