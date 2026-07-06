// ============================================================
// SYNASTRY-INTERPRETATION.TS — Relatório de Relacionamento
// Análise de sinastria + compatibilidade por tema
// ============================================================

import { getSignIndex } from './calculations';
import { getAspectInterpretation, ASPECT_NATURE } from './aspect-interpretations';
import type { NatalChart, SynastryChart, Aspect } from './types';

// ============================================================
// TYPES
// ============================================================

export interface SynastryReport {
  overview: string;
  compatibility: CompatibilityScore;
  themes: SynastryTheme[];
  keyAspects: SynastryAspectInterp[];
}

export interface CompatibilityScore {
  overall: number;       // 0-100
  attraction: number;
  communication: number;
  emotion: number;
  values: number;
  growth: number;
  challenges: number;
  description: string;
}

export interface SynastryTheme {
  title: string;
  icon: string;
  text: string;
  score: number; // 0-10
}

export interface SynastryAspectInterp {
  planet1: string;
  planet2: string;
  type: string;
  person1: string;
  person2: string;
  text: string;
  nature: 'harmonious' | 'challenging' | 'intense';
}

const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte',
};

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

// ============================================================
// SYNASTRY ASPECTS — Interpretações para cruzamento A↔B
// ============================================================

const SYNASTRY_ASPECTS: Record<string, { harmonious: string; challenging: string; intense: string }> = {
  'sun-sun': {
    harmonious: 'As identidades de vocês se apoiam mutuamente — há reconhecimento e admiração natural. Cada um se sente "visto" pelo outro.',
    challenging: 'As identidades competem — pode haver disputa por espaço, atenção ou direção. O desafio é respeitar a individualidade um do outro sem tentar dominar.',
    intense: 'Fusão de identidades — vocês se identificam profundamente, mas correm o risco de perder a individualidade na relação.',
  },
  'sun-moon': {
    harmonious: 'Uma das melhores combinações: o Sol de um nutre a Lua do outro. Há uma sensação de "lar" na relação — um ilumina, o outro acolhe.',
    challenging: 'O que um precisa emocionalmente (Lua) pode conflitar com o que o outro é na essência (Sol). A sensação é de "eu te amo mas não me sinto cuidado".',
    intense: 'Conexão profunda entre identidade e emoção — a relação é magneticamente íntima. Podem completar-se de forma quase kármica.',
  },
  'sun-venus': {
    harmonious: 'Atração natural e admiração mútua. O pessoa do Sol se sente apreciada pela Vênus do outro. Relação leve, prazerosa e estética.',
    challenging: 'O que um acha bonito ou valioso pode incomodar o outro. Diferenças estéticas ou de valores que geram desconforto sutil.',
    intense: 'Magnetismo e charme — a pessoa de Vênus idealiza o Sol. Pode ser avassalador no início mas precisa de substância para durar.',
  },
  'sun-mars': {
    harmonious: 'Energia e motivação mútua — vocês se ativam um ao outro. Boa para ação conjunta, esportes ou projetos.',
    challenging: 'Competição e irritação — o que um quer pode enfurecer o outro. Discussões frequentes, mas também paixão intensa.',
    intense: 'Atração sexual e energética explosiva. A química é forte mas pode se tornar destrutiva se não houver respeito.',
  },
  'sun-saturn': {
    harmonious: 'Respeito e estabilidade — Saturno oferece estrutura ao Sol. Relação com senso de compromisso e maturidade.',
    challenging: 'Saturno pode limitar, criticar ou sufocar o Sol. Sensação de não ser suficientemente bom para o outro. Relação com peso e responsabilidade.',
    intense: 'Relacionamento kármico — há uma sensação de obrigação mútua. Pode durar muito tempo mas exige trabalho emocional constante.',
  },
  'moon-moon': {
    harmonious: 'Conexão emocional profunda — vocês se entendem sem palavras. Conforto, segurança e cuidado mútuo. "Estar junto é como estar em casa."',
    challenging: 'Necessidades emocionais diferentes — o que nutre um irrita o outro. Pode haver incompatibilidade no ritmo emocional.',
    intense: 'Empatia total — vocês sentem as emoções um do outro como se fossem suas. Íntimo demais, às vezes sufocante.',
  },
  'moon-venus': {
    harmonious: 'Doçura e afeto natural. Cuidam-se com carinho e criam um ambiente emocional agradável. Uma das melhores conexões para convivência.',
    challenging: 'Diferença entre o que um precisa emocionalmente e o que o outro oferece como afeto. Amor não traduzido na linguagem certa.',
    intense: 'Ternura profunda que pode se tornar dependência emocional. A relação nutre mas também pode sufocar.',
  },
  'moon-mars': {
    harmonious: 'Marte protege e energiza a Lua — há paixão com cuidado. A Lua suaviza Marte. Dinâmica complementar e excitante.',
    challenging: 'Marte pode machucar a Lua sem intenção — impaciência vs. sensibilidade. Discussões que ferem emocionalmente.',
    intense: 'Atração magnética e emocional — paixão avassaladora que pode oscilar entre êxtase e conflito.',
  },
  'venus-venus': {
    harmonious: 'Gostos similares, valores alinhados, prazer compartilhado. Vocês curtem as mesmas coisas e se sentem em harmonia.',
    challenging: 'Valores estéticos ou financeiros diferentes. O que um valoriza pode parecer superficial ou errado para o outro.',
    intense: 'Espelhamento de valores — vocês se reconhecem no gosto um do outro. Pode ser narcísico ou genuinamente complementar.',
  },
  'venus-mars': {
    harmonious: 'A CLÁSSICA atração: Vênus atrai, Marte deseja. Química sexual e romântica natural. O desejo e o afeto se encontram.',
    challenging: 'Atração com atrito — quer mas não sabe como chegar. O timing sexual pode não sincronizar. Frustração que gera tensão.',
    intense: 'Magnetismo sexual avassalador. A relação pode ser consumida pela paixão física. Precisa de mais camadas para sobreviver.',
  },
  'venus-saturn': {
    harmonious: 'Amor maduro e comprometido. Saturno dá estabilidade à Vênus. Relação que cresce com o tempo e ganha profundidade.',
    challenging: 'Saturno limita ou julga a expressão de amor de Vênus. Sensação de amor condicional — "te amo SE você for..." Frieza.',
    intense: 'Relação kármica com dever e peso. Pode haver grande diferença de idade ou sensação de "devo algo a essa pessoa".',
  },
  'venus-neptune': {
    harmonious: 'Romance de cinema — idealização, arte, espiritualidade compartilhada. Vocês se inspiram mutuamente.',
    challenging: 'Ilusão no amor — um vê no outro o que quer ver, não o que é. Pode haver engano, sacrifício ou decepção quando a realidade aparece.',
    intense: 'Amor transcendente que pode ser tanto a maior experiência espiritual quanto a maior decepção amorosa.',
  },
  'venus-pluto': {
    harmonious: 'Amor profundo e transformador. A relação transforma ambos em versões mais autênticas de si mesmos.',
    challenging: 'Possessividade, ciúme, dinâmicas de poder no amor. Um pode obsessivamente desejar controlar o outro.',
    intense: 'A relação mais intensa possível — amor que transforma, destrói e reconstrói. Impossível sair ileso.',
  },
  'mars-mars': {
    harmonious: 'Energia compatível — vocês agem no mesmo ritmo. Bom para trabalhar juntos, praticar esportes ou construir algo.',
    challenging: 'Competição direta — ambos querem liderar, ambos querem ter razão. Pode haver confronto físico ou verbal.',
    intense: 'Atração combativa — a paixão nasce do atrito. Relação explosiva que precisa de canalização.',
  },
  'mars-saturn': {
    harmonious: 'Disciplina e energia combinadas — juntos vocês realizam coisas concretas e duradouras.',
    challenging: 'Saturno freia Marte — um quer agir, o outro bloqueia. Frustração, raiva contida, sensação de castração.',
    intense: 'Relação de teste — exige maturidade extrema. Pode ser profundamente produtiva ou profundamente frustrante.',
  },
  'jupiter-jupiter': {
    harmonious: 'Otimismo compartilhado e fé mútua. Vocês expandem juntos — viagens, estudos, aventuras. Generosidade recíproca.',
    challenging: 'Excesso mútuo — podem se perder em promessas grandes demais. Falta de limites ou realismo conjunto.',
    intense: 'Crescimento exponencial juntos — mas sem raízes, pode ser só vento.',
  },
};

// ============================================================
// MAIN: Gera relatório de sinastria
// ============================================================

export function generateSynastryReport(synastry: SynastryChart, nameA: string, nameB: string): SynastryReport {
  const { chartA, chartB, aspects } = synastry;

  // Calculate compatibility scores
  const compatibility = calculateCompatibility(aspects);

  // Overview
  const overview = generateSynastryOverview(chartA, chartB, nameA, nameB, compatibility);

  // Themes
  const themes = [
    analyzeSynastryAttraction(aspects, nameA, nameB),
    analyzeSynastryEmotion(aspects, chartA, chartB, nameA, nameB),
    analyzeSynastryCommunication(aspects, nameA, nameB),
    analyzeSynastryGrowth(aspects, nameA, nameB),
    analyzeSynastryChallenges(aspects, nameA, nameB),
  ];

  // Key aspects with interpretation
  const keyAspects = interpretKeyAspects(aspects, nameA, nameB);

  return { overview, compatibility, themes, keyAspects };
}

// ============================================================
// COMPATIBILITY SCORE
// ============================================================

function calculateCompatibility(aspects: Aspect[]): CompatibilityScore {
  let harmonious = 0;
  let challenging = 0;
  let intense = 0;

  for (const asp of aspects) {
    const weight = getAspectWeight(asp);
    if (asp.type === 'trine' || asp.type === 'sextile') harmonious += weight;
    else if (asp.type === 'square' || asp.type === 'opposition') challenging += weight;
    else intense += weight; // conjunction
  }

  const total = harmonious + challenging + intense;
  if (total === 0) return { overall: 50, attraction: 50, communication: 50, emotion: 50, values: 50, growth: 50, challenges: 50, description: '' };

  const harmRatio = harmonious / total;
  const overall = Math.round(40 + harmRatio * 40 + (intense / total) * 20);

  // Sub-scores by planet pairs involved
  const attraction = scoreCategory(aspects, ['venus-mars', 'sun-venus', 'mars-mars', 'moon-mars']);
  const communication = scoreCategory(aspects, ['mercury-mercury', 'sun-mercury', 'moon-mercury']);
  const emotion = scoreCategory(aspects, ['moon-moon', 'moon-venus', 'sun-moon', 'moon-neptune']);
  const values = scoreCategory(aspects, ['venus-venus', 'venus-jupiter', 'sun-jupiter']);
  const growth = scoreCategory(aspects, ['sun-jupiter', 'jupiter-jupiter', 'sun-uranus']);
  const challenges_score = 100 - scoreCategory(aspects, ['sun-saturn', 'moon-saturn', 'venus-saturn', 'mars-saturn']);

  const description = overall >= 75
    ? 'Forte compatibilidade natural — a relação flui com facilidade na maioria das áreas.'
    : overall >= 55
    ? 'Compatibilidade moderada com áreas de crescimento — a relação exige trabalho mas tem base sólida.'
    : 'Relação desafiadora que pode ser extremamente transformadora se ambos estiverem dispostos a crescer.';

  return {
    overall: Math.min(95, Math.max(20, overall)),
    attraction: Math.min(95, Math.max(20, attraction)),
    communication: Math.min(95, Math.max(20, communication)),
    emotion: Math.min(95, Math.max(20, emotion)),
    values: Math.min(95, Math.max(20, values)),
    growth: Math.min(95, Math.max(20, growth)),
    challenges: Math.min(95, Math.max(20, challenges_score)),
    description,
  };
}

function getAspectWeight(asp: Aspect): number {
  const planetWeights: Record<string, number> = {
    sun: 3, moon: 3, venus: 2.5, mars: 2, mercury: 1.5,
    jupiter: 1.5, saturn: 2, uranus: 1, neptune: 1, pluto: 1.5,
  };
  const w1 = planetWeights[asp.planet1] || 1;
  const w2 = planetWeights[asp.planet2] || 1;
  return (w1 + w2) / 2 * asp.exactness;
}

function scoreCategory(aspects: Aspect[], pairs: string[]): number {
  let score = 50;
  for (const asp of aspects) {
    const key = `${asp.planet1}-${asp.planet2}`;
    const keyRev = `${asp.planet2}-${asp.planet1}`;
    if (pairs.includes(key) || pairs.includes(keyRev)) {
      if (asp.type === 'trine' || asp.type === 'sextile') score += 10 * asp.exactness;
      else if (asp.type === 'conjunction') score += 5 * asp.exactness;
      else score -= 8 * asp.exactness;
    }
  }
  return Math.round(Math.min(95, Math.max(15, score)));
}

// ============================================================
// OVERVIEW NARRATIVO
// ============================================================

function generateSynastryOverview(chartA: NatalChart, chartB: NatalChart, nameA: string, nameB: string, compat: CompatibilityScore): string {
  const sunA = SIGN_NAMES[getSignIndex(chartA.positions.sun?.longitude || 0)];
  const sunB = SIGN_NAMES[getSignIndex(chartB.positions.sun?.longitude || 0)];
  const moonA = SIGN_NAMES[getSignIndex(chartA.positions.moon?.longitude || 0)];
  const moonB = SIGN_NAMES[getSignIndex(chartB.positions.moon?.longitude || 0)];
  const venusA = SIGN_NAMES[getSignIndex(chartA.positions.venus?.longitude || 0)];
  const venusB = SIGN_NAMES[getSignIndex(chartB.positions.venus?.longitude || 0)];

  return `${nameA} é Sol em ${sunA} com Lua em ${moonA} e Vênus em ${venusA}. ` +
    `${nameB} é Sol em ${sunB} com Lua em ${moonB} e Vênus em ${venusB}. ` +
    `A dinâmica entre vocês mostra ${compat.description} ` +
    `A compatibilidade geral é de ${compat.overall}%, com destaque para ` +
    `${compat.attraction > 70 ? 'atração física forte' : compat.emotion > 70 ? 'conexão emocional profunda' : 'potencial de crescimento mútuo'}.`;
}

// ============================================================
// TEMAS DE SINASTRIA
// ============================================================

function analyzeSynastryAttraction(aspects: Aspect[], nameA: string, nameB: string): SynastryTheme {
  const attractionAspects = aspects.filter(a =>
    isInPair(a, ['venus-mars', 'sun-venus', 'mars-mars', 'moon-mars', 'venus-pluto'])
  );

  const hasStrong = attractionAspects.some(a => a.type === 'conjunction' || a.type === 'opposition');
  const score = Math.min(10, 3 + attractionAspects.length * 1.5 + (hasStrong ? 2 : 0));

  let text = '';
  if (score >= 8) text = `Atração magnética e intensa entre ${nameA} e ${nameB}. A química é palpável — vocês se sentem puxados um ao outro de forma quase involuntária.`;
  else if (score >= 5) text = `Atração presente e saudável. Vocês se atraem de forma natural sem ser avassalador — há interesse e desejo que cresce com a intimidade.`;
  else text = `A atração física não é o ponto forte desta conexão. A relação se sustenta mais por outros pilares — intelectual, emocional ou espiritual.`;

  return { title: 'Atração e Química', icon: '🔥', text, score: Math.round(score) };
}

function analyzeSynastryEmotion(aspects: Aspect[], chartA: NatalChart, chartB: NatalChart, nameA: string, nameB: string): SynastryTheme {
  const emotionAspects = aspects.filter(a =>
    isInPair(a, ['moon-moon', 'moon-venus', 'sun-moon', 'moon-neptune', 'moon-jupiter'])
  );

  const score = Math.min(10, 3 + emotionAspects.length * 1.5);

  let text = '';
  if (score >= 8) text = `Conexão emocional profunda — vocês se sentem "em casa" juntos. ${nameA} e ${nameB} se compreendem emocionalmente de forma intuitiva.`;
  else if (score >= 5) text = `Conexão emocional presente, com momentos de sintonia e outros de desencontro. A comunicação sobre sentimentos é o caminho para aprofundar.`;
  else text = `A conexão emocional exige trabalho. Os ritmos emocionais são diferentes — o que nutre um pode não nutrir o outro. Paciência e diálogo são essenciais.`;

  return { title: 'Conexão Emocional', icon: '💙', text, score: Math.round(score) };
}

function analyzeSynastryCommunication(aspects: Aspect[], nameA: string, nameB: string): SynastryTheme {
  const commAspects = aspects.filter(a =>
    isInPair(a, ['mercury-mercury', 'sun-mercury', 'moon-mercury', 'mercury-jupiter', 'mercury-venus'])
  );

  const score = Math.min(10, 3 + commAspects.length * 1.5);

  let text = '';
  if (score >= 8) text = `Comunicação fluida e estimulante — vocês se entendem com facilidade, adoram conversar e têm ritmo mental compatível.`;
  else if (score >= 5) text = `Comunicação funcional com espaço para melhoria. Vocês conseguem se entender mas nem sempre na primeira tentativa.`;
  else text = `Comunicação como ponto de atenção — podem haver mal-entendidos frequentes. Exercitar escuta ativa e não assumir é fundamental.`;

  return { title: 'Comunicação', icon: '💬', text, score: Math.round(score) };
}

function analyzeSynastryGrowth(aspects: Aspect[], nameA: string, nameB: string): SynastryTheme {
  const growthAspects = aspects.filter(a =>
    isInPair(a, ['sun-jupiter', 'jupiter-jupiter', 'sun-uranus', 'moon-jupiter', 'venus-jupiter', 'sun-northNode'])
  );

  const score = Math.min(10, 3 + growthAspects.length * 1.5);

  let text = '';
  if (score >= 8) text = `Relação de expansão mútua — vocês crescem juntos, se inspiram e empurram um ao outro para cima. A relação é maior que a soma das partes.`;
  else if (score >= 5) text = `Há espaço para crescimento na relação, especialmente quando ambos estão dispostos a sair da zona de conforto juntos.`;
  else text = `O crescimento na relação vem mais dos desafios do que da facilidade. As dificuldades, se bem trabalhadas, são o motor de evolução.`;

  return { title: 'Crescimento Mútuo', icon: '🌱', text, score: Math.round(score) };
}

function analyzeSynastryChallenges(aspects: Aspect[], nameA: string, nameB: string): SynastryTheme {
  const hardAspects = aspects.filter(a =>
    (a.type === 'square' || a.type === 'opposition') &&
    isInPair(a, ['sun-saturn', 'moon-saturn', 'venus-saturn', 'mars-saturn', 'sun-pluto', 'moon-pluto', 'venus-pluto'])
  );

  const score = Math.min(10, hardAspects.length * 2);

  let text = '';
  if (score >= 7) text = `Relação com desafios significativos — dinâmicas de poder, controle ou limitação. Exige maturidade de ambos. Quando trabalhada, gera transformação profunda.`;
  else if (score >= 4) text = `Desafios moderados que servem como motor de crescimento. Há atrito em algumas áreas, mas nada que boa comunicação não resolva.`;
  else text = `Poucos desafios estruturais — a relação flui com facilidade. O risco é acomodação ou falta de estímulo para crescer.`;

  return { title: 'Desafios', icon: '⚡', text, score: Math.round(score) };
}

// ============================================================
// ASPECTOS-CHAVE INTERPRETADOS
// ============================================================

function interpretKeyAspects(aspects: Aspect[], nameA: string, nameB: string): SynastryAspectInterp[] {
  const results: SynastryAspectInterp[] = [];

  // Sort by weight (most important first)
  const sorted = [...aspects].sort((a, b) => getAspectWeight(b) - getAspectWeight(a));

  for (const asp of sorted.slice(0, 10)) {
    const key = `${asp.planet1}-${asp.planet2}`;
    const keyRev = `${asp.planet2}-${asp.planet1}`;
    const entry = SYNASTRY_ASPECTS[key] || SYNASTRY_ASPECTS[keyRev];

    let text = '';
    let nature: 'harmonious' | 'challenging' | 'intense' = 'harmonious';

    if (entry) {
      if (asp.type === 'conjunction') { text = entry.intense; nature = 'intense'; }
      else if (asp.type === 'trine' || asp.type === 'sextile') { text = entry.harmonious; nature = 'harmonious'; }
      else { text = entry.challenging; nature = 'challenging'; }
    } else {
      // Fallback to generic aspect interpretation
      text = getAspectInterpretation(asp.planet1, asp.planet2, asp.type);
      nature = (asp.type === 'square' || asp.type === 'opposition') ? 'challenging' : 'harmonious';
    }

    if (text) {
      results.push({
        planet1: asp.planet1,
        planet2: asp.planet2,
        type: asp.type,
        person1: nameA,
        person2: nameB,
        text,
        nature,
      });
    }
  }

  return results;
}

// ============================================================
// HELPERS
// ============================================================

function isInPair(asp: Aspect, pairs: string[]): boolean {
  const key = `${asp.planet1}-${asp.planet2}`;
  const keyRev = `${asp.planet2}-${asp.planet1}`;
  return pairs.includes(key) || pairs.includes(keyRev);
}
