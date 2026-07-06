// ============================================================
// DIGNITIES.TS — Dignidades Essenciais + Regente do Ascendente
// Domicílio, Exaltação, Detrimento, Queda
// ============================================================

import { getSignIndex } from './calculations';
import type { NatalChart } from './types';

// ============================================================
// TABELA DE DIGNIDADES ESSENCIAIS
// Índice = signo (0=Áries, 1=Touro, etc.)
// ============================================================

// Regentes tradicionais (domicílio)
export const SIGN_RULERS: Record<number, string> = {
  0: 'mars',      // Áries → Marte
  1: 'venus',     // Touro → Vênus
  2: 'mercury',   // Gêmeos → Mercúrio
  3: 'moon',      // Câncer → Lua
  4: 'sun',       // Leão → Sol
  5: 'mercury',   // Virgem → Mercúrio
  6: 'venus',     // Libra → Vênus
  7: 'pluto',     // Escorpião → Plutão (moderno) / Marte (trad)
  8: 'jupiter',   // Sagitário → Júpiter
  9: 'saturn',    // Capricórnio → Saturno
  10: 'uranus',   // Aquário → Urano (moderno) / Saturno (trad)
  11: 'neptune',  // Peixes → Netuno (moderno) / Júpiter (trad)
};

// Co-regentes tradicionais
export const SIGN_TRADITIONAL_RULERS: Record<number, string> = {
  0: 'mars',
  1: 'venus',
  2: 'mercury',
  3: 'moon',
  4: 'sun',
  5: 'mercury',
  6: 'venus',
  7: 'mars',      // Escorpião trad = Marte
  8: 'jupiter',
  9: 'saturn',
  10: 'saturn',   // Aquário trad = Saturno
  11: 'jupiter',  // Peixes trad = Júpiter
};

// Exaltações
export const EXALTATIONS: Record<string, number> = {
  sun: 0,       // Sol exaltado em Áries
  moon: 1,      // Lua exaltada em Touro
  mercury: 5,   // Mercúrio exaltado em Virgem
  venus: 11,    // Vênus exaltada em Peixes
  mars: 9,      // Marte exaltado em Capricórnio
  jupiter: 3,   // Júpiter exaltado em Câncer
  saturn: 6,    // Saturno exaltado em Libra
};

// ============================================================
// TIPOS DE DIGNIDADE
// ============================================================

export type DignityType = 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine';

export interface PlanetDignity {
  planet: string;
  sign: number;
  dignity: DignityType;
  label: string;
  description: string;
}

/**
 * Calcula a dignidade de um planeta em um signo
 */
export function getPlanetDignity(planet: string, signIndex: number): DignityType {
  // Domicílio: planeta rege o signo
  const ruler = SIGN_RULERS[signIndex];
  if (ruler === planet) return 'domicile';

  // Exaltação
  if (EXALTATIONS[planet] === signIndex) return 'exaltation';

  // Detrimento: signo oposto ao domicílio
  const ruledSigns = Object.entries(SIGN_RULERS)
    .filter(([_, p]) => p === planet)
    .map(([s, _]) => parseInt(s));
  for (const ruled of ruledSigns) {
    if ((ruled + 6) % 12 === signIndex) return 'detriment';
  }

  // Queda: signo oposto à exaltação
  if (EXALTATIONS[planet] !== undefined) {
    const exaltSign = EXALTATIONS[planet];
    if ((exaltSign + 6) % 12 === signIndex) return 'fall';
  }

  return 'peregrine';
}

const DIGNITY_LABELS: Record<DignityType, string> = {
  domicile: 'Domicílio',
  exaltation: 'Exaltação',
  detriment: 'Detrimento',
  fall: 'Queda',
  peregrine: 'Peregrino',
};

const DIGNITY_DESCRIPTIONS: Record<DignityType, string> = {
  domicile: 'O planeta está "em casa" — expressa sua energia com naturalidade e força máxima.',
  exaltation: 'O planeta está honrado — funciona especialmente bem, com foco e elevação.',
  detriment: 'O planeta está desconfortável — precisa encontrar formas criativas e não convencionais de se expressar.',
  fall: 'O planeta está enfraquecido — há fragilidade, mas também sabedoria profunda que vem do esforço.',
  peregrine: 'O planeta não tem dignidade especial — funciona de forma neutra, moldado pela casa e aspectos.',
};

/**
 * Calcula dignidades de todos os planetas do mapa
 */
export function calculateDignities(chart: NatalChart): PlanetDignity[] {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const results: PlanetDignity[] = [];

  for (const planet of planets) {
    const pos = chart.positions[planet];
    if (!pos) continue;

    const signIdx = getSignIndex(pos.longitude);
    const dignity = getPlanetDignity(planet, signIdx);

    // Só incluir se não for peregrino (peregrino é neutro, não agrega)
    if (dignity !== 'peregrine') {
      results.push({
        planet,
        sign: signIdx,
        dignity,
        label: DIGNITY_LABELS[dignity],
        description: DIGNITY_DESCRIPTIONS[dignity],
      });
    }
  }

  return results;
}

// ============================================================
// REGENTE DO ASCENDENTE (Chart Ruler)
// ============================================================

export interface ChartRuler {
  planet: string;
  planetName: string;
  ascSign: number;
  rulerSign: number;
  rulerHouse: number;
  interpretation: string;
}

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
};

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

/**
 * Identifica o regente do ascendente e interpreta sua posição
 */
export function getChartRuler(chart: NatalChart): ChartRuler | null {
  const ascSign = getSignIndex(chart.houses.ascendant);
  const rulerPlanet = SIGN_RULERS[ascSign];

  if (!rulerPlanet || !chart.positions[rulerPlanet]) return null;

  const rulerPos = chart.positions[rulerPlanet];
  const rulerSign = getSignIndex(rulerPos.longitude);
  const rulerHouse = chart.planetHouses[rulerPlanet] || 1;

  const interpretation = generateChartRulerText(rulerPlanet, rulerSign, rulerHouse, ascSign);

  return {
    planet: rulerPlanet,
    planetName: PLANET_NAMES[rulerPlanet] || rulerPlanet,
    ascSign,
    rulerSign,
    rulerHouse,
    interpretation,
  };
}

function generateChartRulerText(planet: string, sign: number, house: number, ascSign: number): string {
  const pName = PLANET_NAMES[planet] || planet;
  const sName = SIGN_NAMES[sign];
  const ascName = SIGN_NAMES[ascSign];

  return `O regente do seu mapa é ${pName} (rege ${ascName}, seu Ascendente). ` +
    `${pName} está na casa ${house} em ${sName}. ` +
    `Isso significa que os temas da casa ${house} são centrais na sua vida — ` +
    `é para lá que sua energia de vida se direciona naturalmente. ` +
    `A casa do regente do Ascendente mostra ONDE você está destinado a atuar com mais intensidade.`;
}

// ============================================================
// DISTRIBUIÇÃO DE ELEMENTOS E MODALIDADES
// ============================================================

export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
  dominant: string;
  lacking: string;
  interpretation: string;
}

export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
  dominant: string;
  interpretation: string;
}

const ELEMENT_OF_SIGN: Record<number, 'fire' | 'earth' | 'air' | 'water'> = {
  0: 'fire', 1: 'earth', 2: 'air', 3: 'water',
  4: 'fire', 5: 'earth', 6: 'air', 7: 'water',
  8: 'fire', 9: 'earth', 10: 'air', 11: 'water',
};

const MODALITY_OF_SIGN: Record<number, 'cardinal' | 'fixed' | 'mutable'> = {
  0: 'cardinal', 1: 'fixed', 2: 'mutable', 3: 'cardinal',
  4: 'fixed', 5: 'mutable', 6: 'cardinal', 7: 'fixed',
  8: 'mutable', 9: 'cardinal', 10: 'fixed', 11: 'mutable',
};

const ELEMENT_INTERPRETATIONS: Record<string, { dominant: string; lacking: string }> = {
  fire: {
    dominant: 'Predominância de Fogo: energia, entusiasmo, ação, iniciativa. Você é motivado por inspiração e paixão. Pode ser impaciente ou consumir energia rapidamente.',
    lacking: 'Falta de Fogo: pode faltar iniciativa espontânea ou confiança para agir. Precisa cultivar coragem e entusiasmo conscientemente.',
  },
  earth: {
    dominant: 'Predominância de Terra: praticidade, estabilidade, foco material. Você valoriza resultados concretos e construção gradual. Pode resistir a mudanças.',
    lacking: 'Falta de Terra: dificuldade com materialização — muitas ideias, pouca execução. Precisa criar estruturas práticas para ancorar seus planos.',
  },
  air: {
    dominant: 'Predominância de Ar: mente ativa, sociabilidade, comunicação, ideias. Você processa o mundo intelectualmente. Pode ter dificuldade com emoções profundas.',
    lacking: 'Falta de Ar: pode ter dificuldade em se comunicar ou ver diferentes perspectivas. Precisa cultivar objetividade e diálogo.',
  },
  water: {
    dominant: 'Predominância de Água: sensibilidade, intuição, profundidade emocional. Você sente antes de pensar e tem empatia natural. Pode se sobrecarregar emocionalmente.',
    lacking: 'Falta de Água: dificuldade em acessar emoções ou conectar-se intimamente. Pode parecer frio, mas na verdade tem medo da vulnerabilidade.',
  },
};

const MODALITY_INTERPRETATIONS: Record<string, string> = {
  cardinal: 'Predominância Cardinal: você inicia coisas com facilidade — líder natural, empreendedor, impulsionador. O desafio é manter e finalizar o que começa.',
  fixed: 'Predominância Fixa: persistência, determinação, lealdade. Você vai até o fim uma vez que se compromete. O desafio é flexibilidade e adaptação a mudanças.',
  mutable: 'Predominância Mutável: adaptabilidade, versatilidade, fluidez. Você se ajusta a qualquer situação. O desafio é foco e compromisso de longo prazo.',
};

/**
 * Calcula distribuição de elementos nos planetas pessoais
 */
export function calculateElementBalance(chart: NatalChart): ElementBalance {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };

  for (const planet of planets) {
    const pos = chart.positions[planet];
    if (!pos) continue;
    const sign = getSignIndex(pos.longitude);
    counts[ELEMENT_OF_SIGN[sign]]++;
  }

  // Peso extra para Sol, Lua e Ascendente
  const ascSign = getSignIndex(chart.houses.ascendant);
  counts[ELEMENT_OF_SIGN[ascSign]]++;

  const entries = Object.entries(counts) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const dominant = entries[0][0];
  const lacking = entries[3][1] === 0 ? entries[3][0] : '';

  const interpParts: string[] = [ELEMENT_INTERPRETATIONS[dominant].dominant];
  if (lacking) interpParts.push(ELEMENT_INTERPRETATIONS[lacking].lacking);

  return {
    ...counts,
    dominant,
    lacking,
    interpretation: interpParts.join(' '),
  };
}

/**
 * Calcula distribuição de modalidades
 */
export function calculateModalityBalance(chart: NatalChart): ModalityBalance {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  const counts = { cardinal: 0, fixed: 0, mutable: 0 };

  for (const planet of planets) {
    const pos = chart.positions[planet];
    if (!pos) continue;
    const sign = getSignIndex(pos.longitude);
    counts[MODALITY_OF_SIGN[sign]]++;
  }

  const entries = Object.entries(counts) as [string, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const dominant = entries[0][0];

  return {
    ...counts,
    dominant,
    interpretation: MODALITY_INTERPRETATIONS[dominant],
  };
}
