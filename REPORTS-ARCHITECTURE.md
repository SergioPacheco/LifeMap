# Motor de Relatórios Astrológicos — Arquitetura e Regras

## Princípios Fundamentais

1. **Zero IA em runtime** — nenhuma chamada a OpenAI, Gemini, Claude ou qualquer API de IA
2. **Determinístico** — mesma entrada astrológica → mesmo relatório, sempre
3. **Profundo e personalizado** — textos parecem escritos por astrólogo humano, mas usam regras pré-programadas
4. **Evoluível** — base interpretativa editável sem alterar lógica do motor

---

## Dados de Entrada

### Pessoa
```typescript
interface PersonData {
  name: string;
  birthDate: string;       // YYYY-MM-DD
  birthTime: string;       // HH:mm
  birthCity: string;
  birthCountry: string;
  houseSystem: 'placidus' | 'koch' | 'equal' | 'wholeSign';
  zodiac: 'tropical' | 'sidereal';
}
```

### Mapa Natal (já calculado por outro módulo)
```typescript
interface NatalChart {
  positions: Record<Planet, PlanetPosition>;
  houses: { cusps: number[]; ascendant: number; midheaven: number };
  planetHouses: Record<Planet, number>;
  aspects: Aspect[];
  dignities: Record<Planet, Dignity>;
  dominantElements: ElementBalance;
  dominantModalities: ModalityBalance;
  dominantPlanets: Planet[];
  angularPlanets: Planet[];
  houseRulers: Record<number, Planet>;
}

interface PlanetPosition {
  longitude: number;
  latitude: number;
  speed: number;
  isRetrograde: boolean;
}

interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  angle: number;
  orb: number;
  exactness: number;     // 0-1, quanto mais perto de 1, mais exato
  applying: boolean;
  nature: 'harmonic' | 'tense' | 'neutral';
}
```

### Dados adicionais por tipo de relatório

**Relacionamento:**
- Mapa da pessoa A + mapa da pessoa B
- Aspectos de sinastria (planet A → planet B)
- Planetas de A nas casas de B (e vice-versa)
- Mapa composto (midpoints)
- Aspectos do composto

**Previsão Anual:**
- Mapa natal
- Revolução solar do ano
- Trânsitos dos próximos 12 meses
- Profecção anual (casa ativada)
- Eclipses relevantes (conjuntos a planetas natais)
- Progressões secundárias (se disponíveis)

---

## Arquitetura em Camadas

```
┌──────────────────────────────────────────────────────┐
│              ReportAssembler (Camada 5)               │
│  Monta relatório final, ordena seções, evita         │
│  repetição, gera sínteses, aplica templates          │
├──────────────────────────────────────────────────────┤
│              ScoringEngine (Camada 4)                 │
│  Calcula pesos, temas dominantes, ranking de         │
│  importância, agrupa por área da vida                │
├──────────────────────────────────────────────────────┤
│              RuleEngine (Camada 3)                    │
│  Recebe dados astrológicos, avalia condições,        │
│  seleciona regras aplicáveis                         │
├──────────────────────────────────────────────────────┤
│         InterpretationRepository (Camada 2)          │
│  Armazena regras interpretativas em arquivos TS      │
│  Editável sem alterar lógica do motor                │
├──────────────────────────────────────────────────────┤
│           AstrologicalData (Camada 1)                │
│  Tipos e interfaces dos dados calculados             │
│  Recebidos prontos de src/engine/                    │
└──────────────────────────────────────────────────────┘
```

### Camada 1 — AstrologicalData
Tipos TypeScript representando dados calculados. Já existem em `src/engine/types.ts`.

### Camada 2 — InterpretationRepository
Textos interpretativos organizados em arquivos `.ts` dentro de `src/engine/`:
- `interpret.ts` — planetas pessoais em casas (Sol, Lua, Mercúrio, Vênus, Marte)
- `outer-planets.ts` — Júpiter, Saturno, Urano, Netuno, Plutão nas 12 casas
- `aspect-interpretations.ts` — 25+ pares de planetas × 3 tipos (conjunção, soft, hard)
- `chiron.ts` — Quíron nos signos e casas
- `dignities.ts` — dignidades essenciais, elementos, modalidades, regente do Ascendente
- `synastry-interpretation.ts` — cruzamentos entre mapas
- `synthesis.ts` — síntese por 6 temas de vida

### Camada 3 — RuleEngine
Função que recebe NatalChart e retorna lista de interpretações aplicáveis ordenadas por prioridade.

### Camada 4 — ScoringEngine
Calcula:
- Temas dominantes (amor, carreira, saúde, missão, bloqueios, talentos)
- Áreas mais ativadas
- Planetas mais importantes (angular, dignificado, muitos aspectos)

### Camada 5 — ReportAssembler
Monta o PDF final via jsPDF:
- Ordena seções por tipo de relatório
- Evita repetição de textos similares
- Junta interpretações complementares em parágrafos coesos
- Usa TemplateEngine com variáveis (`{PLANETA}`, `{SIGNO}`, `{CASA}`)

---

## Estrutura de uma Regra Interpretativa

```typescript
interface InterpretationRule {
  code: string;                    // Ex: "SUN_PISCES_HOUSE_3"
  type: RuleType;                  // Enum: PLANET_SIGN, PLANET_HOUSE, PLANET_SIGN_HOUSE, ASPECT, DIGNITY, RULER, etc.
  priority: number;                // 0-100, quanto maior mais importante
  lifeArea: LifeArea;             // 'identity' | 'emotional' | 'communication' | 'career' | 'relationship' | 'spiritual'
  tags: string[];                  // Para agrupamento e síntese
  text: string;                    // Interpretação principal
  challenge?: string;              // Desafio associado
  advice?: string;                 // Conselho prático
  intensity?: number;              // 0-1, força da manifestação
}

type RuleType =
  | 'PLANET_SIGN'
  | 'PLANET_HOUSE'
  | 'PLANET_SIGN_HOUSE'
  | 'ASPECT'
  | 'DIGNITY'
  | 'RULER_IN_HOUSE'
  | 'HOUSE_EMPHASIS'
  | 'ELEMENT_BALANCE'
  | 'MODALITY_BALANCE'
  | 'ANGULAR_PLANET'
  | 'COMPOSITE_RULE';
```

### Exemplo: Planeta + Signo + Casa
```json
{
  "code": "SUN_PISCES_HOUSE_3",
  "type": "PLANET_SIGN_HOUSE",
  "planet": "SUN",
  "sign": "PISCES",
  "house": 3,
  "priority": 80,
  "lifeArea": "communication",
  "tags": ["identity", "sensitivity", "learning"],
  "text": "O Sol em Peixes na Casa 3 indica uma identidade sensível, intuitiva e fortemente ligada à comunicação, ao aprendizado e à troca de ideias. A pessoa tende a perceber nuances emocionais nas conversas e pode expressar sua individualidade por meio da palavra, da escrita, do ensino ou da imaginação.",
  "challenge": "O desafio é evitar dispersão mental, excesso de absorção emocional e dificuldade para organizar pensamentos de forma objetiva.",
  "advice": "Desenvolver clareza na comunicação e transformar sensibilidade em linguagem prática fortalece essa posição."
}
```

### Exemplo: Aspecto
```json
{
  "code": "MOON_SQUARE_SATURN",
  "type": "ASPECT",
  "planetA": "MOON",
  "aspect": "SQUARE",
  "planetB": "SATURN",
  "priority": 95,
  "lifeArea": "emotional",
  "tags": ["emotional_control", "maturity", "fear"],
  "text": "Lua em quadratura com Saturno sugere uma tensão entre necessidade emocional e autocontrole. Pode indicar uma pessoa que aprendeu cedo a conter sentimentos, amadurecer rapidamente ou lidar com responsabilidades emocionais.",
  "challenge": "Pode haver medo de rejeição, dificuldade de pedir apoio ou sensação de que precisa ser forte o tempo todo.",
  "advice": "O caminho de integração envolve permitir vulnerabilidade sem abandonar responsabilidade."
}
```

---

## Tipos de Regras Necessárias

| # | Tipo | Exemplo | Prioridade base |
|---|------|---------|----------------|
| 1 | Planeta em signo | Sol em Peixes | 60 |
| 2 | Planeta em casa | Sol na Casa 3 | 70 |
| 3 | Planeta em signo + casa | Sol em Peixes na Casa 3 | 80 |
| 4 | Aspectos | Lua quadratura Saturno | 85-95 |
| 5 | Dignidades/debilidades | Vênus em Leão peregrina | 50-70 |
| 6 | Regentes | Regente do ASC na Casa 10 | 75 |
| 7 | Casas dominantes | Stellium na Casa 10 | 70 |
| 8 | Elementos | Predominância de Água | 55 |
| 9 | Modalidades | Predominância Cardinal | 50 |
| 10 | Planetas angulares | Saturno angular | 80 |
| 11 | Regras compostas | Sol+Lua+ASC em Água | 90 |

**Regras de prioridade:**
- Orbe menor → prioridade maior (aspecto exato tem mais peso)
- Planetas angulares → +15 prioridade
- Planetas dignificados → texto potencializado
- Planetas debilitados → texto de desafio expandido

---

## Relatórios — Estrutura de Saída

### Formato
Gerado como PDF via jsPDF (100% client-side). Estrutura interna em seções sequenciais.

### Estrutura comum a todos
1. Capa personalizada (nome, data, cidade, ícone do relatório)
2. Tabela de posições (planetas, signos, graus, casas)
3. Seções interpretativas (variáveis por tipo)
4. Conclusão e conselhos
5. Rodapé com crédito "LifeMap Pro"

---

## RELATÓRIO 1 — Mapa Natal Completo (20-30 páginas)

### Seções
1. Introdução personalizada
2. Síntese Sol + Lua + Ascendente (Big 3)
3. Elementos predominantes
4. Modalidades predominantes
5. Planetas dominantes
6. Cada planeta em signo + casa (10 planetas)
7. Aspectos principais (por prioridade, top 10-15)
8. Dignidades e debilidades
9. Casas mais importantes (angulares + stelliums)
10. Síntese da personalidade (agrupada por tema)
11. Talentos
12. Desafios
13. Conselho final

### Regras de profundidade
- Cada planeta tem interpretação própria
- Aspectos com orbe <2° têm prioridade máxima
- Planetas angulares ganham destaque
- Repetições agrupadas em "temas centrais"
- Síntese final junta padrões (não repete posições)

---

## RELATÓRIO 2 — Relacionamento (20-30 páginas)

### Seções
1. Dinâmica geral do vínculo
2. Sinastria emocional (Lua ↔ Lua, Lua ↔ Vênus)
3. Atração e desejo (Vênus ↔ Marte, Sol ↔ Vênus)
4. Comunicação (Mercúrio ↔ Mercúrio)
5. Compromisso e estabilidade (Saturno cruzamentos)
6. Pontos de tensão (quadraturas e oposições fortes)
7. Pontos de apoio (trígonos e sextis fortes)
8. Mapa composto (interpretação das posições do composto)
9. Compatibilidade por área (amor, sexo, comunicação, valores, crescimento)
10. Conselhos práticos

### Regras de peso
- Sol/Lua/Vênus/Marte = peso ALTO
- Saturno = compromisso, peso ou bloqueio
- Plutão = intensidade, controle, magnetismo
- Lua = segurança emocional
- Mercúrio = estilo de comunicação
- Casas 5, 7, 8 do parceiro = destaque
- Score de compatibilidade por dimensão (0-100)

---

## RELATÓRIO 3 — Previsão Anual (15-20 páginas)

### Seções
1. Tema central do ano (profecção)
2. Casa ativada e regente do ano
3. Revolução solar (interpretação do mapa do aniversário)
4. Trânsitos principais (Saturno, Júpiter, Urano, Netuno, Plutão)
5. Trânsitos mês a mês (12 seções)
6. Eclipses pessoais (conjuntos a planetas natais)
7. Períodos favoráveis
8. Períodos desafiadores
9. Conselho para o ano

### Regras
- Trânsitos de lentos (Saturno→Plutão) = prioridade ALTA
- Trânsitos a Sol, Lua, ASC, MC, regente do ano = mais importantes
- Profecção define a casa-tema do ano
- Linguagem: tendência, ciclo, convite, atenção
- **NUNCA prever eventos com certeza** — "O astro inclina, não obriga"

---

## RELATÓRIO 4 — Carreira e Vocação (15-20 páginas)

### Seções
1. Meio do Céu (signo + interpretação)
2. Casa 10 (planetas + regente)
3. Regente do MC (signo, casa, aspectos)
4. Casa 6 (rotina, ambiente de trabalho)
5. Casa 2 (dinheiro, talentos monetizáveis)
6. Saturno (disciplina, construção, maturidade profissional)
7. Júpiter (expansão, oportunidades, visibilidade)
8. Mercúrio, Marte, Sol (comunicação, ação, identidade profissional)
9. Áreas profissionais compatíveis (lista sugerida)
10. Timing de carreira (ciclos de Saturno e Júpiter)
11. Estratégia de crescimento

### Regras
- MC + regente do MC = prioridade MÁXIMA
- Planetas na Casa 10 = peso ALTO
- Casa 6 = rotina e colegas
- Casa 2 = dinheiro e talentos
- Sugestões concretas baseadas em combinações

---

## RELATÓRIO 5 — Análise Psicológica Profunda (20-30 páginas)

### Seções
1. Estrutura do Ego (Sol + Ascendente)
2. Mundo emocional (Lua + Casa 4)
3. Processos mentais (Mercúrio)
4. Padrões de amor (Vênus)
5. Força vital e agressividade (Marte)
6. Sombra (Plutão)
7. Ferida central (Quíron)
8. Inconsciente (Casa 12, Netuno)
9. Padrões familiares herdados (Lua + Casa 4 + Saturno)
10. Caminho de integração (Nodo Norte)
11. Padrões kármicos (Nodo Sul)
12. Conclusão e caminhos de cura

### Regras
- Lua + Casa 4 + Saturno = base emocional
- Plutão = poder, controle, transformação
- Quíron = ferida que vira dom
- Casa 12 = inconsciente, autossabotagem
- Nodo Sul = padrão repetido (zona de conforto)
- Nodo Norte = direção evolutiva
- **Texto profundo mas cuidadoso — NUNCA usar diagnóstico psicológico**
- Linguagem: padrão, tendência, convite à reflexão

---

## RELATÓRIO 6 — Mapa da Criança (15-20 páginas)

### Seções
1. Temperamento geral (Sol + Ascendente)
2. Necessidades emocionais (Lua + Casa 4)
3. Estilo de aprendizagem (Mercúrio + Casa 3)
4. Talentos (Sol, Vênus, Casa 5)
5. Desafios de limite e energia (Saturno, Marte)
6. Relação com família (Casa 4, Lua)
7. Socialização (Casa 11, Casa 7, Vênus)
8. Como apoiar o desenvolvimento
9. Fases de crescimento (ciclos de Júpiter e Saturno)

### Regras
- **NUNCA rotular a criança** ("ele É agressivo" ❌ → "pode expressar energia de forma intensa" ✅)
- Linguagem 100% positiva ou neutra
- Falar em tendência, nunca destino
- Lua = necessidade emocional primária
- Mercúrio = como aprende melhor
- Saturno/Marte = onde sente frustração ou limites
- Conselhos para pais, não julgamentos sobre a criança

---

## TemplateEngine — Variáveis

Templates usam placeholders substituídos em runtime:

```
"Com {PLANETA} em {SIGNO} na Casa {CASA}, existe uma tendência a {INTERPRETACAO_BASE}. 
Essa configuração se manifesta principalmente em {AREA_DA_VIDA}."
```

Variáveis disponíveis:
- `{PLANETA}` — nome traduzido do planeta
- `{SIGNO}` — nome traduzido do signo
- `{CASA}` — número da casa (1-12)
- `{CASA_NOME}` — nome temático da casa (ex: "Casa da Identidade")
- `{INTERPRETACAO_BASE}` — texto interpretativo da regra
- `{AREA_DA_VIDA}` — área temática (amor, carreira, saúde...)
- `{DESAFIO}` — texto do desafio
- `{CONSELHO}` — texto do conselho
- `{NOME}` — nome da pessoa
- `{PARCEIRO}` — nome do parceiro (relacionamento)
- `{ANO}` — ano da previsão

---

## Implementação Atual no Projeto

### Localização dos Arquivos

```
src/
├── engine/
│   ├── types.ts                    ← Interfaces NatalChart, Aspect, etc.
│   ├── calculations.ts            ← Cálculo de posições (Swiss Ephemeris)
│   ├── interpret.ts               ← Camada 1-2: Planetas pessoais em casas
│   ├── outer-planets.ts           ← Júpiter a Plutão nas 12 casas
│   ├── aspect-interpretations.ts  ← 25+ pares × 3 tipos (conj/soft/hard)
│   ├── chiron.ts                  ← Quíron nos signos e casas
│   ├── dignities.ts              ← Dignidades, elementos, modalidades, regente ASC
│   ├── synthesis.ts              ← Síntese por 6 temas de vida
│   ├── synastry-interpretation.ts ← Cruzamentos entre mapas
│   ├── daily-horoscope.ts        ← Horóscopo diário (trânsitos)
│   └── progressions.ts           ← Progressões secundárias
├── reports/
│   ├── pdf-generator.ts          ← Gerador PDF natal (capa, wheel, posições, interpretação)
│   └── report-generators.ts      ← 5 geradores premium (Annual, Relationship, Psychological, Career, SevenSins)
└── renderer/
    └── wheel.ts                  ← SVG do mapa astral
```

### Fluxo de Geração

```
Dados de entrada (NatalChart)
        │
        ├── interpret.ts → seleciona textos por planeta/casa/signo
        ├── outer-planets.ts → planetas exteriores
        ├── aspect-interpretations.ts → aspectos
        ├── dignities.ts → dignidades e balanço elemental
        ├── synthesis.ts → agrupa por tema (amor, carreira, etc.)
        │
        ▼
report-generators.ts / pdf-generator.ts
        │
        ├── renderCover() → capa com nome e dados
        ├── renderPositions() → tabela de planetas
        ├── [seções por tipo de relatório]
        ├── renderConclusion() → conclusão e conselhos
        ├── tryoutCut() → corta em 3 páginas se isTryout=true
        │
        ▼
    jsPDF → Blob → Download ou IndexedDB
```

### Modo Try-out vs Completo

```typescript
interface ReportOptions {
  locale: string;
  profileName: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  partnerName?: string;
  partnerChart?: NatalChart;
  isTryout?: boolean;       // Se true → 3 páginas + watermark + CTA
}
```

- **Try-out (grátis):** Capa + 2 páginas de overview + watermark "SAMPLE" + página CTA com preço
- **Completo (pago):** 15-30 páginas completas, salvo no IndexedDB

---

## Evolução Futura

Para expandir a base interpretativa:
1. Adicionar novas entradas nos arquivos `.ts` da engine (não requer mudança de lógica)
2. Novos tipos de regra → adicionar handler no RuleEngine
3. Novos relatórios → criar função `generateXxxPdf()` em `report-generators.ts`
4. Traduções → textos interpretativos atualmente em PT; para i18n completo dos relatórios, criar versões EN dos objetos de interpretação

### Princípio de extensão
> Adicionar regra = adicionar entrada no objeto/array existente.
> Adicionar tipo de relatório = criar nova função usando as mesmas regras.
> A lógica do motor não muda quando o conteúdo cresce.

---

## Qualidade Final — Requisitos de Narrativa

### Princípios de Escrita

1. **Narrativa, não colagem** — O relatório deve ler como um texto escrito por um astrólogo experiente, não como uma lista de frases soltas concatenadas. Cada seção deve fluir para a seguinte.

2. **Agrupamento temático** — Temas repetidos devem ser agrupados em um parágrafo coeso:
   ```
   ❌ "Sol em Peixes indica sensibilidade. Lua na Casa 12 indica sensibilidade. Netuno forte indica sensibilidade."
   ✅ "Seu mapa revela uma sensibilidade profunda e multifacetada: o Sol em Peixes confere intuição natural, 
      a Lua na Casa 12 amplifica a percepção do inconsciente coletivo, e Netuno forte dissolve as barreiras 
      entre você e o mundo emocional ao redor. Juntos, esses três fatores criam uma antena psíquica rara."
   ```

3. **Top 5 Potenciais + Top 5 Desafios** — Todo relatório deve extrair e destacar explicitamente:
   - Os 5 maiores talentos/potenciais do mapa (com evidência astrológica)
   - Os 5 maiores desafios (com caminho de integração)

4. **Conselhos práticos** — Não apenas "você tem X", mas "para trabalhar X, faça Y":
   ```
   ❌ "Saturno na Casa 7 indica dificuldade em relacionamentos."
   ✅ "Saturno na Casa 7 pede que você construa relacionamentos com paciência e realismo. 
      O conselho prático: não fuja de conversas difíceis — elas são o cimento do vínculo. 
      Comprometa-se com menos pessoas, mas com mais profundidade."
   ```

5. **Linguagem humana** — Profissional e acessível. Sem jargão excessivo, sem fatalismo, sem diagnósticos:
   ```
   ❌ "O nativo possui uma quadratura Lua-Saturno que indica depressão crônica."
   ✅ "A tensão entre sua Lua e Saturno sugere que desde cedo você aprendeu a ser forte — 
      às vezes forte demais. O caminho não é eliminar essa força, mas permitir que a 
      vulnerabilidade também tenha espaço."
   ```

6. **Evitar fatalismo** — Sempre incluir agência:
   - "O mapa sugere..." (não "O mapa determina...")
   - "Há uma tendência a..." (não "Você vai...")
   - "O potencial para..." (não "O destino é...")

### Regras do Assembler

O `ReportAssembler` deve aplicar estes filtros antes de gerar o texto final:

```typescript
interface AssemblerRules {
  // Detectar temas repetidos e consolidar em parágrafo único
  mergeRepeatedThemes: boolean;          // true
  maxRepetitionsBeforeMerge: number;      // 3 — se tema aparece 3+ vezes, consolidar

  // Extrair destaques
  extractTopPotentials: number;           // 5
  extractTopChallenges: number;           // 5

  // Gerar conselhos práticos para cada desafio
  requirePracticalAdvice: boolean;        // true

  // Limitar tamanho por seção (evitar seções desbalanceadas)
  maxParagraphsPerSection: number;        // 4
  minParagraphsPerSection: number;        // 2

  // Conectores narrativos entre seções
  useTransitionPhrases: boolean;          // true

  // Linguagem
  avoidFatalism: boolean;                 // true
  useAgencyLanguage: boolean;             // true — "você pode", "o convite é"
  forbiddenWords: string[];               // ['destino fixo', 'inevitável', 'condenado', 'impossível']
}
```

### Conectores Narrativos

O sistema usa frases de transição entre seções para criar fluidez:

```typescript
const TRANSITIONS = {
  afterSunMoonAsc: [
    'Essa base de identidade se manifesta de formas concretas quando olhamos os planetas em suas casas.',
    'Com essa essência definida, vejamos como ela se desdobra nas diferentes áreas da vida.',
  ],
  afterPlanets: [
    'Os aspectos entre os planetas revelam como essas energias conversam entre si.',
    'Agora que conhecemos cada planeta isoladamente, é hora de ver como eles interagem.',
  ],
  afterAspects: [
    'Dessas interações emergem padrões — temas centrais que definem sua experiência.',
    'Os padrões acima se cristalizam em talentos e desafios concretos.',
  ],
  beforeConclusion: [
    'Reunindo tudo o que vimos, sua carta conta uma história coerente.',
    'O retrato que emerge é de alguém que...',
  ],
};
```

---

## Exemplo Completo — Dados → Regras → Saída

### 1. Dados de Entrada (exemplo)

```typescript
const exampleChart: NatalChart = {
  positions: {
    sun: { longitude: 348.5, latitude: 0, speed: 1.01, isRetrograde: false },    // Peixes 18°30'
    moon: { longitude: 65.2, latitude: 2.1, speed: 13.5, isRetrograde: false },   // Gêmeos 5°12'
    mercury: { longitude: 332.8, latitude: -1, speed: 1.5, isRetrograde: false },  // Peixes 2°48'
    venus: { longitude: 10.5, latitude: 0.5, speed: 1.2, isRetrograde: false },    // Áries 10°30'
    mars: { longitude: 280.3, latitude: -0.5, speed: 0.6, isRetrograde: false },   // Capricórnio 10°18'
    jupiter: { longitude: 190.7, latitude: 0.3, speed: 0.12, isRetrograde: false }, // Libra 10°42'
    saturn: { longitude: 248.9, latitude: 1.2, speed: 0.05, isRetrograde: true },   // Sagitário 8°54' R
    uranus: { longitude: 272.1, latitude: 0, speed: 0.02, isRetrograde: false },    // Capricórnio 2°06'
    neptune: { longitude: 278.5, latitude: 0.5, speed: 0.01, isRetrograde: false }, // Capricórnio 8°30'
    pluto: { longitude: 226.3, latitude: 12, speed: 0.01, isRetrograde: false },    // Escorpião 16°18'
    northNode: { longitude: 340.0, latitude: 0, speed: -0.05, isRetrograde: true }, // Peixes 10°
    chiron: { longitude: 95.5, latitude: 3, speed: 0.04, isRetrograde: false },     // Câncer 5°30'
  },
  houses: {
    cusps: [190.0, 218.5, 250.2, 285.0, 318.5, 348.0, 10.0, 38.5, 70.2, 105.0, 138.5, 168.0],
    ascendant: 190.0,  // Libra
    midheaven: 105.0,  // Câncer
  },
  planetHouses: {
    sun: 6, moon: 9, mercury: 5, venus: 7, mars: 4,
    jupiter: 1, saturn: 3, uranus: 4, neptune: 4, pluto: 2,
    northNode: 6, chiron: 10,
  },
  aspects: [
    { planet1: 'moon', planet2: 'saturn', type: 'square', angle: 90, orb: 1.3, exactness: 0.85, applying: false, nature: 'tense' },
    { planet1: 'sun', planet2: 'neptune', type: 'trine', angle: 120, orb: 0.5, exactness: 0.95, applying: true, nature: 'harmonic' },
    { planet1: 'venus', planet2: 'mars', type: 'square', angle: 90, orb: 0.2, exactness: 0.97, applying: false, nature: 'tense' },
    { planet1: 'mars', planet2: 'uranus', type: 'conjunction', angle: 0, orb: 1.8, exactness: 0.70, applying: true, nature: 'neutral' },
    { planet1: 'sun', planet2: 'mercury', type: 'conjunction', angle: 0, orb: 2.3, exactness: 0.62, applying: false, nature: 'neutral' },
  ],
  dignities: { mars: 'exalted', venus: 'detriment', mercury: 'fall', saturn: 'peregrine' },
  dominantElements: { water: 4, earth: 3, air: 2, fire: 1 },
  dominantModalities: { cardinal: 4, mutable: 4, fixed: 2 },
  dominantPlanets: ['neptune', 'mars', 'pluto'],
  angularPlanets: ['jupiter', 'chiron'],
  houseRulers: { 1: 'venus', 4: 'saturn', 7: 'mars', 10: 'moon' },
};
```

### 2. Regras Ativadas (seleção do RuleEngine)

Para o exemplo acima, o motor seleciona:

```typescript
const activatedRules = [
  // Prioridade 95+ (aspectos exatos)
  { code: 'VENUS_SQUARE_MARS', priority: 97, text: '...', lifeArea: 'relationship' },
  { code: 'SUN_TRINE_NEPTUNE', priority: 95, text: '...', lifeArea: 'spiritual' },
  { code: 'MOON_SQUARE_SATURN', priority: 93, text: '...', lifeArea: 'emotional' },

  // Prioridade 80-90 (planeta + signo + casa)
  { code: 'SUN_PISCES_HOUSE_6', priority: 85, text: '...', lifeArea: 'identity' },
  { code: 'MARS_CAPRICORN_HOUSE_4', priority: 88, text: '...', lifeArea: 'home' },
  { code: 'CHIRON_ANGULAR', priority: 85, text: '...', lifeArea: 'healing' },
  { code: 'JUPITER_ANGULAR', priority: 82, text: '...', lifeArea: 'expansion' },

  // Prioridade 70-80 (dignidades, regentes)
  { code: 'MARS_EXALTED', priority: 75, text: '...', lifeArea: 'action' },
  { code: 'MERCURY_IN_FALL', priority: 72, text: '...', lifeArea: 'communication' },
  { code: 'ASC_RULER_IN_HOUSE_7', priority: 78, text: '...', lifeArea: 'relationship' },

  // Prioridade 50-70 (elementos, modalidades)
  { code: 'WATER_DOMINANT', priority: 60, text: '...', lifeArea: 'emotional' },
  { code: 'CARDINAL_DOMINANT', priority: 55, text: '...', lifeArea: 'action' },
];
```

### 3. ScoringEngine — Temas Dominantes

```typescript
const scoring = {
  topThemes: [
    { theme: 'emotional_depth', score: 92, sources: ['MOON_SQUARE_SATURN', 'WATER_DOMINANT', 'SUN_PISCES'] },
    { theme: 'relationship_intensity', score: 88, sources: ['VENUS_SQUARE_MARS', 'ASC_RULER_IN_7', 'PLUTO_HOUSE_2'] },
    { theme: 'spiritual_connection', score: 85, sources: ['SUN_TRINE_NEPTUNE', 'NEPTUNE_DOMINANT', 'NODE_PISCES'] },
    { theme: 'practical_power', score: 80, sources: ['MARS_EXALTED', 'MARS_URANUS_CONJ', 'CARDINAL_DOMINANT'] },
    { theme: 'healing_vocation', score: 78, sources: ['CHIRON_ANGULAR', 'SUN_HOUSE_6', 'NEPTUNE_DOMINANT'] },
  ],
  topPotentials: [
    '1. Intuição excepcional e conexão espiritual natural (Sol trígono Netuno)',
    '2. Capacidade de ação estruturada e ambiciosa (Marte exaltado em Capricórnio)',
    '3. Vocação para cura e serviço (Quíron angular + Sol na Casa 6)',
    '4. Magnetismo relacional intenso (Vênus-Marte + regente do ASC na Casa 7)',
    '5. Expansão natural por presença e carisma (Júpiter angular na Casa 1)',
  ],
  topChallenges: [
    '1. Reprimir emoções por medo de vulnerabilidade (Lua quadratura Saturno)',
    '2. Tensão entre desejo e padrão de relacionamento (Vênus quadratura Marte)',
    '3. Dificuldade de comunicar com clareza e objetividade (Mercúrio em queda)',
    '4. Tendência a se perder no serviço ao outro, negligenciando a si mesmo (Sol Peixes na Casa 6)',
    '5. Intensidade emocional que pode assustar parceiros (Plutão na Casa 2 + Água dominante)',
  ],
};
```

### 4. Saída Renderizada (exemplo de seção)

Trecho do relatório natal completo gerado:

---

> **Profundidade Emocional — Seu Tema Central**
>
> Seu mapa revela uma sensibilidade profunda e multifacetada. O Sol em Peixes na Casa 6 confere uma identidade que se realiza no serviço e na conexão com algo maior que você mesmo. A Lua em Gêmeos na Casa 9, embora curiosa e versátil intelectualmente, forma uma quadratura exata com Saturno — indicando que desde cedo você aprendeu a racionalizar emoções, a ser forte quando precisava ser vulnerável.
>
> Essa tensão Lua-Saturno é um dos eixos centrais do seu mapa. Ela não desaparece — mas pode ser integrada. O caminho não é eliminar o autocontrole emocional (que é um recurso genuíno), mas criar espaços seguros onde o controle possa ser relaxado sem medo de desmoronar.
>
> O trígono Sol-Netuno complementa esse quadro: existe em você uma antena espiritual natural, uma capacidade de perceber o que não é dito, de sentir o ambiente antes de pensar sobre ele. Quando essa intuição é honrada (em vez de descartada como "irracional"), ela se torna uma das suas maiores forças.
>
> **Conselho prático:** Busque práticas regulares que honrem sua sensibilidade sem perdê-lo nela — meditação com foco, escrita expressiva, ou trabalho terapêutico com regularidade. A chave é ritmo, não intensidade.

---

### 5. Exemplo de Componente Astro (renderização no site)

```astro
---
// src/pages/[lang]/reports/example.astro
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { getTranslations, supportedLocales, type Locale } from '../../../i18n';
import { calculateNatalChart, initSweph } from '../../../engine/index';
import { generateFullReport } from '../../../engine/synthesis';

export function getStaticPaths() {
  return supportedLocales.map(lang => ({ params: { lang } }));
}

const { lang } = Astro.params;
const locale = lang as Locale;
const t = getTranslations(locale);

// Exemplo com dados fixos (build time)
const exampleChart = calculateNatalChart({
  name: 'Maria Silva',
  date: '1990-03-09',
  time: '14:30',
  lat: -27.5954,
  lng: -48.548,
  timezone: -3,
  city: 'Florianópolis',
  country: 'Brasil',
});

const report = generateFullReport(exampleChart);
---

<BaseLayout title="Exemplo de Relatório" locale={locale}>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <h1 class="text-3xl font-serif font-bold text-cream mb-6">
      Relatório Natal — Maria Silva
    </h1>

    <!-- Overview Narrativo -->
    <section class="mb-8 glass rounded-2xl p-6">
      <h2 class="text-xl font-serif text-gold mb-3">Visão Geral</h2>
      <p class="text-cream-dark leading-relaxed">{report.overview}</p>
    </section>

    <!-- Top 5 Potenciais -->
    <section class="mb-8">
      <h2 class="text-xl font-serif text-gold mb-3">✦ Seus 5 Maiores Potenciais</h2>
      <div class="space-y-3">
        {report.themes.map((theme, i) => (
          <div class="glass rounded-xl p-4 border-l-4 border-gold/50">
            <p class="font-medium text-cream">{i + 1}. {theme.title}</p>
            <p class="text-sm text-cream-dark mt-1">{theme.text}</p>
          </div>
        ))}
      </div>
    </section>

    <!-- Planetas nas Casas -->
    {report.sections.map((section) => (
      <section class="mb-8 glass rounded-2xl p-6">
        <h2 class="text-xl font-serif text-cream mb-3">{section.title}</h2>
        <p class="text-cream-dark leading-relaxed">{section.text}</p>
        {section.advice && (
          <div class="mt-4 p-3 bg-gold/5 border border-gold/20 rounded-lg">
            <p class="text-sm text-gold">💡 {section.advice}</p>
          </div>
        )}
      </section>
    ))}

    <!-- Desafios -->
    <section class="mb-8">
      <h2 class="text-xl font-serif text-cream mb-3">⚡ Seus 5 Maiores Desafios</h2>
      <div class="space-y-3">
        {report.challenges.map((challenge, i) => (
          <div class="glass rounded-xl p-4 border-l-4 border-red-500/30">
            <p class="font-medium text-cream">{i + 1}. {challenge.title}</p>
            <p class="text-sm text-cream-dark mt-1">{challenge.text}</p>
            <p class="text-xs text-gold mt-2">→ {challenge.integration}</p>
          </div>
        ))}
      </div>
    </section>

    <!-- Conclusão -->
    <section class="glass rounded-2xl p-6 border border-gold/20">
      <h2 class="text-xl font-serif text-gold mb-3">Conclusão</h2>
      <p class="text-cream-dark leading-relaxed">{report.conclusion}</p>
    </section>
  </div>
</BaseLayout>
```

---

---

## Internacionalização dos Relatórios PDF

### Requisito
O relatório PDF deve ser gerado **no idioma escolhido pelo usuário**. Se o usuário está navegando em `/fr/`, o PDF sai em francês. Se em `/ja/`, sai em japonês.

### Idiomas Suportados (11)
`pt`, `en`, `es`, `fr`, `de`, `it`, `nl`, `tr`, `ru`, `zh`, `ja`

### Arquitetura de i18n dos Relatórios

```
src/engine/interpretations/
├── pt.ts      ← Interpretações em Português (base, mais completo)
├── en.ts      ← Interpretações em Inglês
├── es.ts      ← Interpretações em Espanhol
├── fr.ts      ← Interpretações em Francês
├── de.ts      ← Interpretações em Alemão
├── it.ts      ← Interpretações em Italiano
├── nl.ts      ← Interpretações em Holandês
├── tr.ts      ← Interpretações em Turco
├── ru.ts      ← Interpretações em Russo
├── zh.ts      ← Interpretações em Chinês
├── ja.ts      ← Interpretações em Japonês
└── index.ts   ← Loader com fallback (locale → en → pt)
```

### Estrutura de um arquivo de interpretação por idioma

```typescript
// src/engine/interpretations/en.ts
export const interpretations = {
  // Planetas nas casas
  sunInHouse: {
    1: 'The Sun in the 1st House confers a strong sense of identity...',
    2: 'The Sun in the 2nd House connects your identity to values...',
    // ... 12 casas
  },
  moonInHouse: { /* 12 casas */ },
  mercuryInHouse: { /* 12 casas */ },
  venusInHouse: { /* 12 casas */ },
  marsInHouse: { /* 12 casas */ },
  jupiterInHouse: { /* 12 casas */ },
  saturnInHouse: { /* 12 casas */ },
  uranusInHouse: { /* 12 casas */ },
  neptuneInHouse: { /* 12 casas */ },
  plutoInHouse: { /* 12 casas */ },
  chironInHouse: { /* 12 casas */ },

  // Aspectos
  aspects: {
    'sun_moon': { conjunction: '...', soft: '...', hard: '...' },
    'sun_mercury': { conjunction: '...', soft: '...', hard: '...' },
    // ... 25+ pares
  },

  // Síntese por tema
  themes: {
    love: { title: 'Love and Relationships', intro: '...' },
    career: { title: 'Career and Vocation', intro: '...' },
    money: { title: 'Money and Resources', intro: '...' },
    mission: { title: 'Life Purpose', intro: '...' },
    blocks: { title: 'Challenges and Blocks', intro: '...' },
    talents: { title: 'Talents and Gifts', intro: '...' },
  },

  // Labels do relatório
  labels: {
    cover: { title: 'Complete Natal Report', subtitle: 'Deep Interpretation' },
    positions: 'Planetary Positions',
    houses: 'House Cusps',
    overview: 'Overview',
    potentials: 'Your 5 Greatest Potentials',
    challenges: 'Your 5 Main Challenges',
    conclusion: 'Conclusion',
    advice: 'Practical Advice',
    quote: '"The stars incline, they do not determine."',
    sampleNote: 'This was a free sample!',
    sampleFull: 'The complete report contains 20-30 pages with detailed interpretation.',
    buyNow: 'Full version:',
    website: 'www.lifemap.pro/reports',
    buyInstant: 'Buy now and download instantly — 100% in your browser.',
    annualTitle: 'Annual Forecast',
    profection: 'Annual Profection — Theme of the Year',
    monthlyTransits: 'Monthly Transits',
    relationshipTitle: 'Relationship Report',
    compatibility: 'Compatibility',
    attraction: 'Attraction & Chemistry',
    communication: 'Communication',
    careerTitle: 'Career & Vocation',
    midheaven: 'Midheaven',
    psychTitle: 'Deep Psychological Analysis',
    ego: 'Ego Structure',
    shadow: 'Shadow',
    wound: 'Core Wound',
    sinsTitle: 'The Seven Sins',
    pride: 'Pride', lust: 'Lust', greed: 'Greed', gluttony: 'Gluttony',
    wrath: 'Wrath', envy: 'Envy', sloth: 'Sloth',
  },

  // Conectores narrativos
  transitions: {
    afterOverview: 'With this foundation in mind, let us explore how it unfolds in each area of life.',
    afterPlanets: 'The aspects between planets reveal how these energies interact.',
    beforeConclusion: 'Bringing everything together, your chart tells a coherent story.',
  },

  // Meses do ano
  months: ['January','February','March','April','May','June','July','August','September','October','November','December'],

  // Nomes de signos
  signNames: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],

  // Nomes de planetas
  planetNames: {
    sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
    jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
    northNode: 'North Node', chiron: 'Chiron',
  },
};
```

### Loader com Fallback

```typescript
// src/engine/interpretations/index.ts
import { interpretations as pt } from './pt';
import { interpretations as en } from './en';
// ... outros idiomas

const ALL: Record<string, typeof pt> = { pt, en, es, fr, de, it, nl, tr, ru, zh, ja };

/**
 * Retorna interpretações para um idioma.
 * Fallback: idioma solicitado → en → pt
 */
export function getInterpretations(locale: string): typeof pt {
  return ALL[locale] || ALL.en || ALL.pt;
}
```

### Como o Gerador Usa o Locale

```typescript
// src/reports/report-generators.ts
export function generateAnnualPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF();
  const locale = options.locale || 'pt';
  const i = getInterpretations(locale);     // ← Textos no idioma correto
  const signNames = i.signNames;
  const planetNames = i.planetNames;
  const labels = i.labels;

  // Capa usa labels traduzidos
  renderCover(doc, labels.annualTitle, `${labels.monthlyTransits} ${new Date().getFullYear()}`, options, '🔮');

  // Conteúdo usa textos interpretativos traduzidos
  // i.sunInHouse[casa], i.aspects['sun_moon'].hard, etc.
}
```

### Regras de Fallback

1. Se o idioma tem o texto → usa o texto do idioma
2. Se não tem → usa inglês (`en`)
3. Se inglês não tem → usa português (`pt`)
4. **Nunca mostrar chave raw** — sempre há fallback para um texto real

### Estado Atual vs Meta

| Camada | Atual | Meta |
|--------|-------|------|
| Labels do PDF (capa, seções) | PT hardcoded | Traduzido via `labels` por idioma |
| Nomes de signos/planetas | PT arrays fixos | Traduzido via `signNames`/`planetNames` |
| Textos interpretativos (planetas em casas) | PT completo | EN + outros 9 idiomas |
| Aspectos interpretados | PT completo | EN + outros 9 idiomas |
| Síntese por tema | PT completo | EN + outros 9 idiomas |
| Conectores narrativos | PT completo | EN + outros 9 idiomas |
| Profecção anual (12 textos) | PT completo | Tradução pendente |
| Textos mensais (12×12) | PT completo | Tradução pendente |

### Prioridade de Tradução

1. **Labels e nomes** (rápido, alto impacto visual)
2. **Textos interpretativos curtos** (aspectos, dignidades)
3. **Textos interpretativos longos** (planetas em casas, síntese)
4. **Conectores e textos mensais** (relatório anual)

### Fontes para CJK no PDF

Para idiomas com caracteres não-latinos (中文, 日本語, Русский):
- jsPDF suporta fontes custom via `doc.addFont()`
- Necessário incluir fonte que suporte CJK (ex: Noto Sans CJK)
- Carregada sob demanda apenas quando `locale` é `zh`, `ja` ou `ru`
- Fallback: se fonte CJK não disponível, gerar em inglês com nota

```typescript
async function loadCJKFont(doc: jsPDF, locale: string) {
  if (['zh', 'ja', 'ru'].includes(locale)) {
    const fontData = await fetch('/fonts/NotoSansCJK-Regular.ttf').then(r => r.arrayBuffer());
    doc.addFileToVFS('NotoSansCJK.ttf', fontData);
    doc.addFont('NotoSansCJK.ttf', 'NotoSansCJK', 'normal');
    doc.setFont('NotoSansCJK');
  }
}
```

---

## Checklist de Qualidade — Validação de Relatório

Antes de considerar um relatório "pronto", verificar:

- [ ] **Fluidez narrativa** — lê como texto escrito por humano, não como lista de outputs
- [ ] **Sem repetições** — mesmo tema aparece no máximo 1x de forma detalhada
- [ ] **Top 5 potenciais explícitos** — destacados com evidência astrológica
- [ ] **Top 5 desafios explícitos** — com caminho de integração
- [ ] **Conselhos práticos** — para cada desafio há pelo menos 1 conselho acionável
- [ ] **Zero fatalismo** — nenhuma frase determinista ("você vai", "é impossível")
- [ ] **Linguagem acessível** — leigo entende sem dicionário astrológico
- [ ] **Conectores entre seções** — transições naturais
- [ ] **Personalização visível** — nome da pessoa usado, dados específicos do mapa citados
- [ ] **Extensível** — adicionar nova interpretação = editar arquivo de dados, não código lógico

---

## Como Adicionar Novas Interpretações

### Adicionando uma regra de planeta + casa

1. Abra `src/engine/interpret.ts`
2. Encontre o objeto correspondente (ex: `SUN_IN_HOUSE`)
3. Adicione ou edite a entrada para a casa desejada:

```typescript
// src/engine/interpret.ts
export const SUN_IN_HOUSE: Record<number, string> = {
  // ... casas existentes ...
  6: 'O Sol na Casa 6 indica uma identidade que se realiza no serviço, na rotina bem estruturada e no cuidado com o corpo e a saúde. Você encontra propósito quando é útil — quando sua competência faz diferença concreta na vida de outros. O risco é se perder no serviço ao ponto de negligenciar suas próprias necessidades.',
};
```

### Adicionando um aspecto

1. Abra `src/engine/aspect-interpretations.ts`
2. Encontre ou crie a entrada para o par planetário:

```typescript
export const ASPECT_TEXTS: Record<string, { conjunction: string; soft: string; hard: string }> = {
  'sun_neptune': {
    conjunction: 'Sol conjunto Netuno dissolve os limites do ego...',
    soft: 'Sol trígono/sextil Netuno confere intuição natural e conexão espiritual...',
    hard: 'Sol quadratura/oposição Netuno pode gerar confusão de identidade...',
  },
  // Adicione novos pares aqui
};
```

### Adicionando um planeta exterior em casa

1. Abra `src/engine/outer-planets.ts`
2. Edite o objeto correspondente:

```typescript
export const JUPITER_IN_HOUSE: Record<number, string> = {
  1: 'Júpiter na Casa 1 confere presença expansiva e otimismo natural...',
  // ... demais casas
};
```

### Princípio fundamental
> **Nunca espalhar textos interpretativos no código de lógica.**
> Textos ficam nos objetos de dados (`interpret.ts`, `outer-planets.ts`, `aspect-interpretations.ts`).
> Lógica fica no assembler (`synthesis.ts`, `report-generators.ts`).
> Separação estrita = evolução sem risco.
