// ============================================================
// DAILY-HOROSCOPE.TS — Daily Horoscope Generator
// Analyzes transits of the day vs natal chart and produces
// personalized interpretive text for each active transit
// ============================================================

import { calculatePositions, getSignIndex, getDegreeInSign, angularDifference, norm } from './calculations';
import type { NatalChart, Positions, AspectType } from './types';

// ============================================================
// TYPES
// ============================================================

export interface DailyTransit {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: AspectType;
  orb: number;
  transitSign: number;
  transitHouse: number;
  interpretation: string;
  intensity: 'high' | 'medium' | 'low';
  category: 'general' | 'love' | 'career' | 'health' | 'spiritual';
}

export interface DailyHoroscope {
  date: Date;
  transits: DailyTransit[];
  summary: string;
  love: string;
  career: string;
  health: string;
  moonSign: number;
  moonPhaseAngle: number;
}

// ============================================================
// MAIN FUNCTION
// ============================================================

/**
 * Generate personalized daily horoscope based on transits vs natal chart
 */
export function generateDailyHoroscope(natal: NatalChart, date: Date): DailyHoroscope {
  const transitPositions = calculatePositions(date);
  const transits = findActiveTransits(transitPositions, natal);

  // Sort by intensity
  transits.sort((a, b) => INTENSITY_ORDER[a.intensity] - INTENSITY_ORDER[b.intensity]);

  // Generate summaries by category
  const generalTransits = transits.filter(t => t.category === 'general' || t.category === 'career');
  const loveTransits = transits.filter(t => t.category === 'love');
  const careerTransits = transits.filter(t => t.category === 'career');

  const summary = generateSummary(transits, transitPositions);
  const love = generateLoveSummary(loveTransits, transitPositions, natal);
  const career = generateCareerSummary(careerTransits, transitPositions, natal);
  const health = generateHealthSummary(transits, transitPositions);

  const moonSign = getSignIndex(transitPositions.moon?.longitude || 0);
  const moonPhaseAngle = angularDifference(
    transitPositions.sun?.longitude || 0,
    transitPositions.moon?.longitude || 0
  );

  return { date, transits, summary, love, career, health, moonSign, moonPhaseAngle };
}

// ============================================================
// TRANSIT DETECTION
// ============================================================

const ASPECT_DEFS: { type: AspectType; angle: number; orb: number }[] = [
  { type: 'conjunction', angle: 0, orb: 6 },
  { type: 'sextile', angle: 60, orb: 4 },
  { type: 'square', angle: 90, orb: 5 },
  { type: 'trine', angle: 120, orb: 5 },
  { type: 'opposition', angle: 180, orb: 6 },
];

const TRANSIT_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const NATAL_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

const INTENSITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function findActiveTransits(transitPos: Positions, natal: NatalChart): DailyTransit[] {
  const transits: DailyTransit[] = [];

  for (const tp of TRANSIT_PLANETS) {
    const transitLon = transitPos[tp]?.longitude;
    if (transitLon === undefined) continue;

    for (const np of NATAL_PLANETS) {
      if (tp === np && ['sun', 'moon'].includes(tp)) continue; // Skip same luminaries
      const natalLon = natal.positions[np]?.longitude;
      if (natalLon === undefined) continue;

      const diff = angularDifference(transitLon, natalLon);

      for (const asp of ASPECT_DEFS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          const transitSign = getSignIndex(transitLon);
          const transitHouse = getTransitHouse(transitLon, natal.houses.cusps);
          const intensity = getIntensity(tp, np, asp.type, orb);
          const category = getCategory(tp, np);
          const interpretation = getInterpretation(tp, np, asp.type, transitHouse);

          transits.push({
            transitPlanet: tp,
            natalPlanet: np,
            aspectType: asp.type,
            orb: +orb.toFixed(1),
            transitSign,
            transitHouse,
            interpretation,
            intensity,
            category,
          });
          break;
        }
      }
    }
  }

  return transits;
}

// ============================================================
// INTERPRETATION TEXTS
// ============================================================

const TRANSIT_TEXTS: Record<string, Record<string, Record<string, string>>> = {
  sun: {
    sun: {
      conjunction: 'Seu aniversário solar traz renovação de energia vital e propósito. Momento de iniciar novos ciclos.',
      square: 'Tensão entre quem você é e o que as circunstâncias exigem. Necessidade de ajuste e autoafirmação.',
      trine: 'Fluxo harmonioso de vitalidade. Bom dia para iniciativas e expressão autêntica.',
      opposition: 'Confronto com o outro pode revelar necessidades não atendidas. Busque equilíbrio.',
      sextile: 'Oportunidades sutis de crescimento pessoal. Aproveite para fazer conexões.',
    },
    moon: {
      conjunction: 'Emoções intensificadas. Consciência mais aguda das necessidades emocionais.',
      square: 'Conflito entre vontade e emoções. Irritabilidade possível mas passageira.',
      trine: 'Harmonia entre mente e coração. Intuição acurada.',
      opposition: 'O mundo externo provoca reações emocionais. Cuide-se.',
      sextile: 'Expressão emocional fluida. Bom para conversas íntimas.',
    },
    venus: {
      conjunction: 'Dia favorável para amor, beleza e prazer. Magnetismo pessoal elevado.',
      square: 'Desejo conflitante com realidade afetiva. Cuidado com excessos.',
      trine: 'Harmonia nos relacionamentos. Charme natural em alta.',
      opposition: 'O outro pode fascinar ou frustrar. Avalie o que realmente valoriza.',
      sextile: 'Oportunidades sociais e afetivas discretas. Aproveite.',
    },
    mars: {
      conjunction: 'Energia vital em alta. Coragem para iniciar, mas cuidado com impulsividade.',
      square: 'Tensão e frustração acumulada pede ação consciente. Evite confrontos.',
      trine: 'Ação assertiva e produtiva. Excelente para empreender e exercitar.',
      opposition: 'Conflitos com outros podem surgir. Canalize energia com sabedoria.',
      sextile: 'Motivação para agir. Energia disponível para projetos práticos.',
    },
  },
  moon: {
    venus: {
      conjunction: 'Necessidade de carinho e aconchego. Dia bom para afeto e beleza.',
      square: 'Insatisfação emocional passageira. Cuidado com compras impulsivas.',
      trine: 'Prazer e conforto emocional. Momento para relaxar e curtir.',
      opposition: 'Oscilação entre desejo de companhia e necessidade de espaço.',
      sextile: 'Pequenos prazeres trazem alegria. Compartilhe com quem ama.',
    },
    mars: {
      conjunction: 'Emoções intensas e reativas. Energia disponível para ação apaixonada.',
      square: 'Irritabilidade e impaciência emocional. Respire antes de reagir.',
      trine: 'Coragem emocional. Bom para expressar sentimentos com assertividade.',
      opposition: 'Confrontos emocionais podem surgir. Não leve para o pessoal.',
      sextile: 'Motivação para cuidar de si e do lar.',
    },
    saturn: {
      conjunction: 'Momento de sobriedade emocional. Responsabilidades pesam mas estruturam.',
      square: 'Sensação de solidão ou restrição. Passageiro — seja paciente consigo.',
      trine: 'Maturidade emocional em evidência. Decisões sólidas.',
      opposition: 'Conflito entre necessidades e deveres. Encontre o equilíbrio.',
      sextile: 'Disciplina emocional útil. Bom para organizar a vida pessoal.',
    },
  },
  venus: {
    venus: {
      conjunction: 'Retorno de Vênus — renovação dos valores e do amor. Magnetismo em alta.',
      trine: 'Harmonia afetiva e financeira. Dia de sorte no amor.',
      square: 'Reavaliação do que valoriza. Insatisfação pode motivar mudança.',
      opposition: 'O que atrai pode desafiar. Consciência sobre padrões afetivos.',
      sextile: 'Oportunidades românticas e sociais. Esteja aberto.',
    },
    mars: {
      conjunction: 'Paixão e desejo intensificados. Atração magnética.',
      trine: 'Equilíbrio entre desejo e afeto. Excelente para romance.',
      square: 'Tensão sexual ou relacional. A atração gera desconforto.',
      opposition: 'O outro provoca desejo e frustração. Consciência sobre projeções.',
      sextile: 'Flerte e sedução naturais. Iniciativa afetiva recompensada.',
    },
  },
  mars: {
    saturn: {
      conjunction: 'Esforço encontra resistência. Disciplina sobre impulso é necessária.',
      square: 'Frustração intensa. Bloqueios exigem paciência e estratégia, não força.',
      trine: 'Energia disciplinada e produtiva. Conquistas sólidas possíveis.',
      opposition: 'Autoridades ou limites provocam raiva. Escolha suas batalhas.',
      sextile: 'Determinação focada. Bom para trabalho que exige persistência.',
    },
    jupiter: {
      conjunction: 'Expansão de energia e iniciativa. Excelente para empreender grande.',
      trine: 'Confiança e sorte em ações. Aposte em suas ideias.',
      square: 'Excesso de confiança pode gerar erros. Dose o entusiasmo.',
      opposition: 'Conflito entre agir e esperar. Não force o timing.',
      sextile: 'Oportunidades para ação positiva. Timing favorável.',
    },
  },
  jupiter: {
    sun: {
      conjunction: 'Período de grande expansão pessoal. Otimismo e oportunidades abundam.',
      trine: 'Crescimento harmonioso. Sorte e generosidade em todas as áreas.',
      square: 'Excesso ou exagero possível. Cuidado com promessas grandes demais.',
      opposition: 'O mundo oferece mais do que pode absorver. Escolha com sabedoria.',
      sextile: 'Oportunidades de crescimento se apresentam. Agarre-as.',
    },
  },
  saturn: {
    sun: {
      conjunction: 'Período de responsabilidade máxima. Maturidade e construção de legado.',
      square: 'Pressão e limitação. Lições difíceis mas necessárias.',
      trine: 'Disciplina recompensada. Conquistas sólidas e duradouras.',
      opposition: 'Confronto com autoridade ou limites. Avalie sua estrutura de vida.',
      sextile: 'Responsabilidade assume forma produtiva. Construa passo a passo.',
    },
  },
};

function getInterpretation(transit: string, natal: string, aspect: AspectType, house: number): string {
  const text = TRANSIT_TEXTS[transit]?.[natal]?.[aspect];
  if (text) return text;

  // Generic fallback
  const PLANET_NAMES: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
    jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  };
  const ASP_NAMES: Record<string, string> = {
    conjunction: 'conjunção', sextile: 'sextil', square: 'quadratura', trine: 'trígono', opposition: 'oposição',
  };
  return `${PLANET_NAMES[transit] || transit} em ${ASP_NAMES[aspect]} com seu ${PLANET_NAMES[natal] || natal} natal na Casa ${house}.`;
}

// ============================================================
// HELPERS
// ============================================================

function getIntensity(transit: string, natal: string, aspect: AspectType, orb: number): 'high' | 'medium' | 'low' {
  // Outer planets to personal = high; personal to personal = medium; moon = low
  const outerPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const personalPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars'];

  if (outerPlanets.includes(transit) && personalPlanets.includes(natal)) return 'high';
  if (transit === 'moon') return 'low';
  if (orb < 1) return 'high';
  if (orb < 3) return 'medium';
  return 'low';
}

function getCategory(transit: string, natal: string): DailyTransit['category'] {
  if (['venus'].includes(transit) || ['venus'].includes(natal)) return 'love';
  if (['saturn', 'jupiter'].includes(transit) && ['sun', 'saturn', 'jupiter'].includes(natal)) return 'career';
  if (['mars'].includes(transit) && ['mars'].includes(natal)) return 'health';
  return 'general';
}

function getTransitHouse(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    const start = cusps[i];
    const end = cusps[next];
    if (start < end) {
      if (longitude >= start && longitude < end) return i + 1;
    } else {
      if (longitude >= start || longitude < end) return i + 1;
    }
  }
  return 1;
}

// ============================================================
// SUMMARY GENERATORS
// ============================================================

function generateSummary(transits: DailyTransit[], positions: Positions): string {
  if (transits.length === 0) return 'Dia tranquilo sem trânsitos significativos. Aproveite para descansar e refletir.';

  const high = transits.filter(t => t.intensity === 'high');
  const medium = transits.filter(t => t.intensity === 'medium');

  if (high.length > 2) return 'Dia intenso com múltiplos trânsitos poderosos. Mantenha consciência e flexibilidade.';
  if (high.length > 0) return high[0].interpretation;
  if (medium.length > 0) return medium[0].interpretation;
  return transits[0].interpretation;
}

function generateLoveSummary(transits: DailyTransit[], positions: Positions, natal: NatalChart): string {
  if (transits.length === 0) {
    const moonSign = getSignIndex(positions.moon?.longitude || 0);
    const MOON_LOVE = ['Impulso romântico e paixão rápida.', 'Sensualidade e desejo de conforto a dois.', 'Flerte intelectual e conversas sedutoras.', 'Necessidade de afeto e segurança no amor.', 'Romance dramático e expressão generosa.', 'Amor demonstrado em atos práticos.', 'Busca de harmonia e companhia.', 'Desejo intenso e possessivo.', 'Atração por novidade e aventura.', 'Amor maduro e compromisso.', 'Liberdade no amor e conexões inusitadas.', 'Romantismo e idealização.'];
    return MOON_LOVE[moonSign];
  }
  return transits.map(t => t.interpretation).join(' ');
}

function generateCareerSummary(transits: DailyTransit[], positions: Positions, natal: NatalChart): string {
  if (transits.length === 0) return 'Dia normal no trabalho. Mantenha o foco nas tarefas cotidianas.';
  return transits.map(t => t.interpretation).join(' ');
}

function generateHealthSummary(transits: DailyTransit[], positions: Positions): string {
  const marsTransits = transits.filter(t => t.transitPlanet === 'mars' || t.natalPlanet === 'mars');
  if (marsTransits.some(t => t.aspectType === 'square' || t.aspectType === 'opposition')) {
    return 'Energia alta mas tendência a excesso. Exercite-se mas evite esforço exagerado.';
  }
  if (marsTransits.some(t => t.aspectType === 'trine' || t.aspectType === 'sextile')) {
    return 'Vitalidade em alta. Excelente para atividades físicas e desporto.';
  }
  return 'Energia estável. Mantenha hábitos saudáveis e respeite seu ritmo.';
}
