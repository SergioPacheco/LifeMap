# Calendário Astrológico Personalizado — Tasks de Desenvolvimento

## Visão Geral

Calendário interativo que cruza trânsitos planetários com o mapa natal do usuário, mostrando dia a dia os eventos astrológicos relevantes organizados por temas da vida.

---

## FASE 1 — MVP (Engine + Grid Básico)

### T01: Engine — Calculador Mensal de Trânsitos
**Arquivo:** `src/engine/calendar/month-calculator.ts`
**Descrição:** Calcula todos os aspectos exatos (trânsito × natal) para cada dia de um mês.
**Parâmetros configuráveis:**
- Orbes por aspecto (conjunção: 1-8°, trígono: 1-7°, quadratura: 1-7°, etc.)
- Planetas de trânsito a considerar (Sol a Plutão + Quíron + Nodos)
- Planetas natais a considerar (todos ou só luminares + pessoais)
- Pontos sensíveis (ASC, MC, Vertex, Fortuna)
- Tipos de aspecto (maiores: 0/60/90/120/180, menores: 30/45/135/150)
- Limiar de "aspecto aplicativo vs separativo"
- Velocidade de aplicação (crescente = mais intenso)

**Entrega:** `getMonthTransits(natal, year, month, config) → DayEvent[][]`

---

### T02: Engine — Fases da Lua e Ingressos Lunares
**Arquivo:** `src/engine/calendar/moon-phases.ts`
**Descrição:** Calcula fase da Lua (Nova/Crescente/Cheia/Minguante), signo da Lua e ingressos.
**Parâmetros configuráveis:**
- Incluir quartos intermediários (Crescente Gibosa, Minguante Gibosa)
- Casa natal onde cai a Lua de cada dia
- Saros do eclipse (se aplicável)
- Distância angular Sol-Lua (iluminação %)

**Entrega:** `getMoonDataForMonth(year, month, natal?) → MoonDay[]`

---

### T03: Engine — Lua Vazia de Curso (Void of Course)
**Arquivo:** `src/engine/calendar/void-moon.ts`
**Descrição:** Calcula períodos em que a Lua não faz aspectos antes de mudar de signo.
**Parâmetros configuráveis:**
- Aspectos considerados (tradicionais: 5 maiores; modernos: incluir menores)
- Incluir aspectos a planetas transpessoais ou apenas até Saturno
- Orbe para considerar "último aspecto feito"
- Duração mínima para exibir (ex: ignorar VoC < 30min)

**Entrega:** `getVoidMoonPeriods(year, month, config) → VoidPeriod[]`

---

### T04: Engine — Classificador de Energia do Dia
**Arquivo:** `src/engine/calendar/day-classifier.ts`
**Descrição:** Classifica cada dia como Favorável/Neutro/Tenso baseado nos aspectos ativos.
**Parâmetros configuráveis:**
- Peso por tipo de aspecto (trígono=+3, sextil=+2, conjunção=±2, quadratura=-3, oposição=-2)
- Peso por planeta (Sol/Lua=peso 3, Vênus/Marte=2, lentos=1)
- Peso por orbe (aspecto exato=peso dobrado, orbe >3°=peso reduzido)
- Thresholds de classificação (score>5=favorável, <-3=tenso, entre=neutro)
- Considerar aspectos entre trânsitos (não só trânsito×natal)
- Bonus/penalty por Lua Vazia, retrógrado, eclipse

**Entrega:** `classifyDay(events, config) → { score, energy: 'favorable'|'neutral'|'tense', reasons[] }`

---

### T05: Engine — Mapeador de Temas
**Arquivo:** `src/engine/calendar/theme-mapper.ts`
**Descrição:** Associa cada evento astrológico a um ou mais temas de vida.
**Parâmetros configuráveis:**
- Mapeamento planeta → tema(s) padrão
- Mapeamento casa natal → tema
- Considerar regência (regente da Casa 7 ativado = tema Amor)
- Prioridade de temas quando conflitam
- Temas customizáveis pelo usuário

**Mapeamento base:**
| Planeta/Ponto | Temas |
|---------------|-------|
| Sol | Identidade, Vitalidade, Carreira |
| Lua | Emoções, Família, Saúde, Lar |
| Mercúrio | Comunicação, Estudos, Negócios, Viagens curtas |
| Vênus | Amor, Dinheiro, Beleza, Prazer, Relacionamentos |
| Marte | Energia, Ação, Conflitos, Sexo, Esporte |
| Júpiter | Expansão, Finanças, Viagens, Filosofia, Otimismo |
| Saturno | Carreira, Disciplina, Limitações, Maturidade |
| Urano | Mudanças, Liberdade, Tecnologia, Surpresas |
| Netuno | Espiritualidade, Criatividade, Ilusões, Intuição |
| Plutão | Transformação, Poder, Crises, Regeneração |
| Quíron | Cura, Ferida, Ensino, Vulnerabilidade |
| Nodo Norte | Propósito, Destino, Crescimento |
| Nodo Sul | Passado, Zona de conforto, Liberação |

| Casa Natal Ativada | Tema |
|--------------------|------|
| Casa 1 | Identidade, Aparência |
| Casa 2 | Finanças, Valores |
| Casa 3 | Comunicação, Irmãos, Estudos |
| Casa 4 | Lar, Família, Raízes |
| Casa 5 | Amor, Criatividade, Filhos, Prazer |
| Casa 6 | Saúde, Trabalho, Rotina |
| Casa 7 | Relacionamentos, Parcerias |
| Casa 8 | Transformação, Sexo, Dinheiro conjunto |
| Casa 9 | Viagens, Filosofia, Expansão |
| Casa 10 | Carreira, Reputação, Vocação |
| Casa 11 | Amizades, Grupos, Futuro |
| Casa 12 | Espiritualidade, Inconsciente, Retiro |

**Entrega:** `mapThemes(event, natal, config) → Theme[]`

---

### T06: Engine — Retrógrados e Estações
**Arquivo:** `src/engine/calendar/retrogrades.ts`
**Descrição:** Detecta períodos retrógrados, estações (parada direta/retrógrada) e grau de sombra.
**Parâmetros configuráveis:**
- Planetas a monitorar (Mercúrio a Plutão + Quíron)
- Mostrar grau da estação (máxima intensidade)
- Zona de sombra pré/pós retrógrado
- Orbe de estação (planeta "parado" — velocidade <X"/dia)
- Impacto na casa natal onde ocorre
- Se planeta retrógrado está em aspecto natal (intensifica)

**Entrega:** `getRetroPeriodsForMonth(year, month, config) → RetroPeriod[]`

---

### T07: Engine — Eclipses Pessoais
**Arquivo:** `src/engine/calendar/eclipses.ts`
**Descrição:** Identifica eclipses solares/lunares e calcula impacto pessoal.
**Parâmetros configuráveis:**
- Orbe para considerar "eclipse pessoal" (conjunção a ponto natal: 3-5°)
- Pontos natais sensíveis (Sol, Lua, ASC, MC, Nodos, regentes de angular)
- Tipo: Solar (novo começo) vs Lunar (finalização/liberação)
- Família Saros (eclipses conectados)
- Eclipse no eixo nodal natal (mais intenso)
- Duração do efeito (6 meses antes/depois)

**Entrega:** `getEclipseImpact(year, natal, config) → EclipseEvent[]`

---

### T08: Engine — Profecção Anual
**Arquivo:** `src/engine/calendar/profection.ts`
**Descrição:** Calcula a casa de profecção do ano e regente ativado.
**Parâmetros configuráveis:**
- Sistema: anual (casa por ano) ou mensal (casa por mês)
- Regente tradicional vs moderno
- Casas derivadas
- Planetas que transitam sobre o regente de profecção (gatilhos)
- Nível de profecção: 1° (anual), 2° (mensal), 3° (semanal)

**Entrega:** `getProfection(birthDate, currentDate, natal, config) → ProfectionData`

---

### T09: Engine — Retornos Planetários
**Arquivo:** `src/engine/calendar/planetary-returns.ts`
**Descrição:** Calcula retornos de Saturno, Júpiter, Vênus e Marte.
**Parâmetros configuráveis:**
- Planetas: Saturno (~29 anos), Júpiter (~12 anos), Marte (~2 anos), Vênus (~1 ano)
- Orbe de aplicação (approaching return: 2-5°)
- Fases do retorno (waxing square, opposition, waning square)
- Semi-retorno e quartos
- Countdown para próximo retorno exato

**Entrega:** `getPlanetaryReturn(planet, natal, currentDate, config) → ReturnData`

---

### T10: Engine — Astrologia Eletiva (Melhores Datas)
**Arquivo:** `src/engine/calendar/elective.ts`
**Descrição:** Busca melhores datas para ações específicas.
**Parâmetros configuráveis:**
- Tipo de ação: casamento, abrir empresa, viagem, cirurgia, mudança, lançamento
- Regras por ação (ex: casamento = Vênus forte, sem Lua VoC, sem retrógrado)
- Range de busca (próximos 30/60/90 dias)
- Peso mínimo para recomendar
- Evitar: Lua Vazia, Mercúrio ℞, aspecto tenso ao MC/ASC
- Favorecer: Lua crescente, aspecto harmonioso ao regente da ação

**Entrega:** `findBestDates(action, natal, range, config) → ElectiveResult[]`

---

### T11: UI — Componente Principal AstroCalendarApp
**Arquivo:** `src/components/chart/AstroCalendarApp.tsx`
**Descrição:** Container principal com seleção de perfil, navegação e estado.
**Features:**
- Seletor de perfil (reusa ProfileSelector)
- Navegação mês anterior/próximo
- Botão "hoje"
- Toggle de vista (mês/semana/lista)
- Estado reativo: mês selecionado, dia expandido, filtros ativos

---

### T12: UI — Grid Mensal (CalendarGrid)
**Arquivo:** `src/components/chart/calendar/CalendarGrid.tsx`
**Descrição:** Grid de 7 colunas × 5-6 linhas com células por dia.
**Features:**
- Dias do mês com destaque no dia atual
- Indicador de energia (cor de fundo: verde/amarelo/vermelho)
- Mini-ícones dos eventos principais (até 3-4 por célula)
- Badge de temas ativos
- Click para expandir detalhe

---

### T13: UI — Célula do Dia (DayCell)
**Arquivo:** `src/components/chart/calendar/DayCell.tsx`
**Descrição:** Célula individual com resumo visual compacto.
**Features:**
- Número do dia + indicador de energia
- Fase da Lua (emoji ou ícone SVG)
- Até 3 ícones de planetas com aspectos importantes
- Badge "VoC" se Lua Vazia > 2h
- Badge "℞" se algum planeta faz estação
- Borda dourada para "dias especiais" (eclipses, retornos)

---

### T14: UI — Painel de Detalhe do Dia (DayDetail)
**Arquivo:** `src/components/chart/calendar/DayDetail.tsx`
**Descrição:** Painel expandido com interpretação completa.
**Features:**
- Header: data, dia da semana, fase da Lua, energia
- Lista de eventos ordenados por importância
- Para cada evento: símbolo + nome + interpretação (2-3 frases)
- Seção temática: ♡ Amor | 💼 Carreira | 💰 Finanças | 🧘 Saúde
- Períodos de Lua Vazia (horários)
- Dica do dia (frase síntese baseada no evento mais forte)

---

### T15: UI — Barra de Filtros (FilterBar)
**Arquivo:** `src/components/chart/calendar/FilterBar.tsx`
**Descrição:** Barra de filtros com toggles por tipo e tema.
**Features:**
- Grupo 1 — Tipo: Trânsitos | Lua | Retrógrados | Eclipses | Ingressos | VoC
- Grupo 2 — Tema: ♡ Amor | 💼 Carreira | 💰 Finanças | 🧘 Saúde | 🔮 Espiritual | 🏠 Família | ⭐ Criativo | 🧠 Mental
- Grupo 3 — Energia: 🟢 Favoráveis | 🟡 Neutros | 🔴 Tensos | ⭐ Especiais
- Botão "Limpar filtros"
- Estado persistido no localStorage

---

### T16: UI — Vista Semanal (CalendarWeek)
**Arquivo:** `src/components/chart/calendar/CalendarWeek.tsx`
**Descrição:** Vista expandida da semana com mais espaço por dia.
**Features:**
- 7 colunas com mais detalhes visíveis
- Timeline vertical por dia (horários de aspectos exatos)
- Destaque visual para transições (ingresso, estação)

---

### T17: UI — Vista Lista (CalendarList)
**Arquivo:** `src/components/chart/calendar/CalendarList.tsx`
**Descrição:** Lista cronológica de todos os eventos do mês.
**Features:**
- Agrupado por dia
- Cada evento: horário + símbolo + descrição + temas
- Filtros aplicados reduzem a lista
- Ideal para mobile (scroll vertical)

---

### T18: Engine — Textos Interpretativos do Calendário
**Arquivo:** `src/engine/calendar/calendar-texts.ts`
**Descrição:** Banco de interpretações para cada combinação trânsito × natal.
**Estrutura:**
- Por planeta transitante × planeta natal × aspecto
- Por planeta transitante × casa natal
- Por tema (resumo temático do dia)
- Dica do dia (frase curta e prática)
- Textos dinâmicos com variáveis (ex: "{planeta} em {signo} ativa sua Casa {n}")

---

### T19: UI — Configurações do Calendário (CalendarSettings)
**Arquivo:** `src/components/chart/calendar/CalendarSettings.tsx`
**Descrição:** Modal de configuração avançada.
**Features:**
- Orbes (slider por aspecto)
- Planetas ativos (toggle cada um)
- Aspectos (toggle maiores/menores)
- Sistema de casas
- Tradicionais vs Modernos (regentes, aspectos)
- Tema escuro/claro do calendário
- Formato de data (DD/MM ou MM/DD)
- Primeiro dia da semana (Dom ou Seg)
- Salvar preset de configuração

---

### T20: Page — Rota e Integração
**Arquivo:** `src/pages/[lang]/tools/calendar.astro`
**Descrição:** Página Astro que monta o componente.
**Features:**
- SEO (title, description, og tags)
- Adicionar ao menu de Ferramentas no Header
- Responsive (mobile-first)

---

## FASE 2 — Funcionalidades Premium

### T21: Export — PDF do Mês
Gerar PDF com resumo mensal: energia por dia, eventos principais, recomendações por tema.

### T22: Export — iCal (.ics)
Exportar eventos como calendário importável no Google Calendar / Apple Calendar.

### T23: Notificações
"Amanhã: ☉ trígono ♃ natal — dia excepcional para expansão" (via Push ou email digest).

### T24: Astrologia Mundana
Aspectos entre planetas lentos que afetam o coletivo (overlay no calendário pessoal).

### T25: Revolução Lunar Mensal
Calcular o mapa do mês (ingresso lunar no signo do Sol natal) como overlay.

---

## Configurações Globais do Calendário

```typescript
interface CalendarConfig {
  // Aspectos
  aspects: {
    major: boolean;        // Conjunção, Sextil, Quadratura, Trígono, Oposição
    minor: boolean;        // Semi-sextil, Semi-quadratura, Sesquiquadratura, Quincunce
    orbs: Record<AspectType, number>;
  };
  
  // Planetas
  planets: {
    transiting: string[];   // Quais considerar em trânsito
    natal: string[];        // Quais pontos natais monitorar
    includeChiron: boolean;
    includeNodes: boolean;
    includeVertex: boolean;
    includeLilith: boolean;
  };
  
  // Lua
  moon: {
    showPhases: boolean;
    showIngresses: boolean;
    showVoidOfCourse: boolean;
    vocMinDuration: number;  // minutos mínimos para exibir
    vocAspects: 'traditional' | 'modern';  // Apenas 5 maiores vs todos
  };
  
  // Retrógrados
  retrogrades: {
    showPeriods: boolean;
    showStations: boolean;
    showShadow: boolean;     // Zona de sombra pré/pós
    stationOrb: number;      // velocidade em "/dia para considerar "parado"
  };
  
  // Eclipses
  eclipses: {
    show: boolean;
    personalOrb: number;     // Orbe para impacto pessoal (3-5°)
    showFamilySaros: boolean;
  };
  
  // Profecção
  profection: {
    show: boolean;
    level: 'annual' | 'monthly' | 'both';
    rulers: 'traditional' | 'modern';
  };
  
  // Retornos Planetários
  returns: {
    saturn: boolean;
    jupiter: boolean;
    mars: boolean;
    venus: boolean;
    approachOrb: number;    // graus antes do retorno exato
  };
  
  // Classificação do dia
  dayClassification: {
    weights: Record<AspectType, number>;
    planetWeights: Record<string, number>;
    orbWeight: boolean;     // Aspecto exato pesa mais
    favorableThreshold: number;
    tenseThreshold: number;
  };
  
  // Temas
  themes: {
    enabled: string[];      // Quais temas exibir
    useHouseRulers: boolean; // Considerar regentes de casa
    customMappings: Record<string, string[]>; // Override do mapeamento
  };
  
  // UI
  ui: {
    view: 'month' | 'week' | 'list';
    firstDayOfWeek: 0 | 1;  // 0=Dom, 1=Seg
    dateFormat: 'DD/MM' | 'MM/DD';
    showDegrees: boolean;
    compactMode: boolean;    // Menos detalhes na célula
    maxEventsPerCell: number;
  };
  
  // Eletiva
  elective: {
    enabled: boolean;
    searchRange: 30 | 60 | 90; // dias
  };
}
```

---

## Ordem de Execução

1. **T01** → Engine de trânsitos mensais (base de tudo)
2. **T02** → Fases da Lua (segundo layer mais importante)
3. **T04** → Classificador de energia (feedback visual imediato)
4. **T05** → Mapeador de temas (organização por área de vida)
5. **T11** → AstroCalendarApp (container)
6. **T12+T13** → Grid + DayCell (UI visual)
7. **T14** → DayDetail (interpretação)
8. **T15** → FilterBar (interatividade)
9. **T18** → Textos interpretativos
10. **T03** → Lua Vazia
11. **T06** → Retrógrados
12. **T07** → Eclipses
13. **T08** → Profecção
14. **T09** → Retornos Planetários
15. **T10** → Eletiva
16. **T16+T17** → Vistas semanal/lista
17. **T19** → Configurações
18. **T20** → Rota + menu
19. **T21-T25** → Premium (Fase 2)

---

## Referências de Interpretação

- Trânsitos: Robert Hand "Planets in Transit"
- Profecção: Chris Brennan "Hellenistic Astrology"
- Retrógrados: Erin Sullivan "Retrograde Planets"
- Eclipses: Celeste Teal "Eclipses"
- Eletiva: Joann Hampar "Electional Astrology"
- Lua Vazia: Ivy Goldstein-Jacobson "Simplified Horary Astrology"
