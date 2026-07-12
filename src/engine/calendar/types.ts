// ============================================================
// CALENDAR TYPES — Tipos para o Calendário Astrológico
// ============================================================

import type { AspectType, NatalChart, Positions, CelestialPosition } from '../types';

// ============================================================
// CONFIGURAÇÃO
// ============================================================

export interface CalendarConfig {
  // Aspectos
  aspects: {
    major: boolean;          // Conjunção, Sextil, Quadratura, Trígono, Oposição
    minor: boolean;          // Semi-sextil(30), Semi-quadratura(45), Sesqui(135), Quincunce(150)
    orbs: Record<string, number>;
    applicationBonus: boolean; // Aspecto aplicativo pesa mais que separativo
  };

  // Planetas
  planets: {
    transiting: string[];    // Planetas a considerar em trânsito
    natal: string[];         // Pontos natais a monitorar
    includeAngles: boolean;  // Incluir ASC/MC/DC/IC como pontos natais
  };

  // Lua
  moon: {
    showPhases: boolean;
    showIngresses: boolean;
    showVoidOfCourse: boolean;
    vocMinDuration: number;        // minutos mínimos para exibir VoC
    vocAspects: 'traditional' | 'modern';  // 5 maiores vs incluir menores
    vocPlanets: 'traditional' | 'modern';  // Até Saturno vs até Plutão
  };

  // Retrógrados
  retrogrades: {
    show: boolean;
    showStations: boolean;     // Dia exato da estação
    showShadow: boolean;       // Zona de sombra pré/pós
    stationSpeedThreshold: number; // "/dia para considerar "parado" (ex: 0.02)
  };

  // Eclipses
  eclipses: {
    show: boolean;
    personalOrb: number;       // Orbe para impacto pessoal (graus)
    showPreEffect: boolean;    // Efeito começa antes
    preEffectDays: number;     // Dias antes do eclipse que já se sente
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
    approachOrb: number;      // Graus antes do retorno exato para avisar
  };

  // Classificação do dia
  dayClassification: {
    aspectWeights: Record<string, number>;    // peso por tipo de aspecto
    planetWeights: Record<string, number>;    // peso por planeta
    orbDecay: boolean;         // Aspecto exato pesa mais, orbe grande pesa menos
    favorableThreshold: number;
    tenseThreshold: number;
    voidMoonPenalty: number;   // Penalidade por Lua Vazia
    retroPenalty: number;      // Penalidade por estação retrógrada
  };

  // Temas
  themes: {
    enabled: string[];          // Quais temas exibir
    useHouseRulers: boolean;    // Considerar regentes de casa
  };

  // Eletiva
  elective: {
    enabled: boolean;
    searchRange: number;        // Dias para buscar
  };

  // UI
  ui: {
    view: 'month' | 'week' | 'list';
    firstDayOfWeek: 0 | 1;     // 0=Dom, 1=Seg
    maxEventsPerCell: number;
    compactMode: boolean;
  };
}

// ============================================================
// DEFAULT CONFIG
// ============================================================

export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  aspects: {
    major: true,
    minor: false,
    orbs: {
      conjunction: 2,
      sextile: 1.5,
      square: 2,
      trine: 2,
      opposition: 2,
      // Menores (se ativados)
      'semi-sextile': 1,
      'semi-square': 1,
      'sesquiquadrate': 1,
      quincunx: 1.5,
    },
    applicationBonus: true,
  },
  planets: {
    transiting: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'northNode'],
    natal: ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'northNode'],
    includeAngles: true,
  },
  moon: {
    showPhases: true,
    showIngresses: true,
    showVoidOfCourse: true,
    vocMinDuration: 30,
    vocAspects: 'traditional',
    vocPlanets: 'traditional',
  },
  retrogrades: {
    show: true,
    showStations: true,
    showShadow: false,
    stationSpeedThreshold: 0.02,
  },
  eclipses: {
    show: true,
    personalOrb: 3,
    showPreEffect: true,
    preEffectDays: 14,
  },
  profection: {
    show: true,
    level: 'annual',
    rulers: 'traditional',
  },
  returns: {
    saturn: true,
    jupiter: true,
    mars: false,
    venus: false,
    approachOrb: 3,
  },
  dayClassification: {
    aspectWeights: {
      conjunction: 2,    // Pode ser + ou - dependendo dos planetas
      sextile: 2,
      square: -3,
      trine: 3,
      opposition: -2,
      'semi-sextile': 1,
      'semi-square': -1,
      'sesquiquadrate': -1.5,
      quincunx: -1,
    },
    planetWeights: {
      sun: 3, moon: 3,
      mercury: 2, venus: 2, mars: 2,
      jupiter: 2.5, saturn: 2.5,
      uranus: 1.5, neptune: 1.5, pluto: 1.5,
      chiron: 1, northNode: 1,
    },
    orbDecay: true,
    favorableThreshold: 4,
    tenseThreshold: -3,
    voidMoonPenalty: -1,
    retroPenalty: -0.5,
  },
  themes: {
    enabled: ['love', 'career', 'finances', 'health', 'spirituality', 'family', 'creativity', 'communication'],
    useHouseRulers: true,
  },
  elective: {
    enabled: false,
    searchRange: 30,
  },
  ui: {
    view: 'month',
    firstDayOfWeek: 1,
    maxEventsPerCell: 4,
    compactMode: false,
  },
};

// ============================================================
// EVENTOS DO DIA
// ============================================================

export type DayEnergy = 'favorable' | 'neutral' | 'tense' | 'special';

export type EventType =
  | 'transit-aspect'      // Trânsito faz aspecto ao natal
  | 'moon-phase'          // Fase da Lua (Nova, Cheia, etc)
  | 'moon-ingress'        // Lua muda de signo
  | 'planet-ingress'      // Planeta muda de signo
  | 'void-of-course'      // Lua Vazia de Curso
  | 'retrograde-start'    // Planeta fica retrógrado
  | 'retrograde-end'      // Planeta fica direto
  | 'station'             // Planeta "parado" (velocidade ~0)
  | 'eclipse-solar'       // Eclipse Solar
  | 'eclipse-lunar'       // Eclipse Lunar
  | 'planetary-return'    // Retorno planetário
  | 'profection'          // Mudança de casa de profecção
  | 'elective';           // Data eletiva recomendada

export type Theme =
  | 'love'           // ♡ Amor e Relacionamentos
  | 'career'         // 💼 Carreira e Vocação
  | 'finances'       // 💰 Finanças
  | 'health'         // 🧘 Saúde e Bem-estar
  | 'spirituality'   // 🔮 Espiritualidade
  | 'family'         // 🏠 Lar e Família
  | 'creativity'     // ⭐ Criatividade e Prazer
  | 'communication'  // 🧠 Comunicação e Estudos
  | 'transformation' // ♇ Transformação
  | 'freedom'        // ⚡ Liberdade e Mudança
  | 'travel'         // ✈ Viagens
  | 'sexuality';     // 🔥 Sexualidade

export interface CalendarEvent {
  type: EventType;
  date: Date;
  startTime?: Date;           // Para VoC: início do período
  endTime?: Date;             // Para VoC: fim do período

  // Aspecto (se type = transit-aspect)
  transitPlanet?: string;
  natalPlanet?: string;
  aspectType?: AspectType | string;
  orb?: number;
  isApplying?: boolean;       // Aspecto aplicativo (mais forte)
  transitSign?: number;       // Signo do planeta em trânsito (0-11)
  natalHouse?: number;        // Casa natal ativada (1-12)

  // Lua (se moon-phase/ingress)
  moonPhase?: 'new' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  moonSign?: number;          // Signo da Lua (0-11)
  moonHouseNatal?: number;    // Casa natal onde a Lua cai

  // Retro (se retrograde-start/end/station)
  retroPlanet?: string;
  retroSign?: number;

  // Eclipse
  eclipseType?: 'solar-total' | 'solar-annular' | 'solar-partial' | 'lunar-total' | 'lunar-partial' | 'lunar-penumbral';
  eclipseDegree?: number;
  eclipseNatalAspect?: string; // Ponto natal que o eclipse toca

  // Profecção
  profectedHouse?: number;
  yearLord?: string;

  // Return
  returnPlanet?: string;
  returnType?: 'exact' | 'approaching' | 'separating';

  // Classificação
  themes: Theme[];
  importance: number;          // 1-10 (quanto maior, mais significativo)
  energy: 'positive' | 'negative' | 'neutral';

  // Texto
  title: string;               // Ex: "☉ trígono ♃ natal"
  summary: string;             // 1-2 frases de interpretação
  detail?: string;             // Interpretação completa (expandida)
  advice?: string;             // Dica prática para o dia
}

// ============================================================
// DADOS DO DIA
// ============================================================

export interface DayData {
  date: Date;
  dayOfWeek: number;          // 0=Dom, 6=Sáb
  events: CalendarEvent[];
  energy: DayEnergy;
  energyScore: number;        // Score numérico (-10 a +10)
  moonPhase?: string;
  moonSign?: number;
  isVoidOfCourse: boolean;
  voidPeriods: { start: Date; end: Date }[];
  themes: Theme[];            // Temas dominantes do dia
  tip?: string;               // Dica do dia (frase síntese)
}

// ============================================================
// DADOS DO MÊS
// ============================================================

export interface MonthData {
  year: number;
  month: number;              // 0-11
  days: DayData[];
  retroPeriods: RetroPeriod[];
  eclipses: CalendarEvent[];
  profection?: ProfectionData;
  summary: MonthSummary;
}

export interface RetroPeriod {
  planet: string;
  startDate: Date;
  endDate: Date;
  sign: number;
  shadowStart?: Date;
  shadowEnd?: Date;
  stationRetroDate?: Date;
  stationDirectDate?: Date;
  natalHouse?: number;        // Casa natal onde ocorre
}

export interface ProfectionData {
  house: number;              // Casa ativada (1-12)
  sign: number;               // Signo da casa
  lord: string;               // Regente do ano
  lordNatalHouse: number;     // Casa natal do regente
  lordNatalSign: number;      // Signo natal do regente
  age: number;
  startDate: Date;            // Aniversário
  endDate: Date;              // Próximo aniversário
  monthlyHouse?: number;      // Casa mensal (se level=monthly)
}

export interface MonthSummary {
  bestDays: number[];         // Dias mais favoráveis (1-31)
  challengingDays: number[];  // Dias mais tensos
  specialDays: number[];      // Dias especiais (eclipses, retornos)
  dominantThemes: Theme[];    // Temas que mais aparecem no mês
  overview: string;           // Resumo textual do mês
}
