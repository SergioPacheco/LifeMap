// ============================================================
// SYNTHESIS.TS — Camada Premium: Síntese por Temas de Vida
// 
// MODELO DE CAMADAS:
// 1. Básica: planeta + signo
// 2. Intermediária: planeta + signo + casa
// 3. Profunda: planeta + signo + casa + aspectos
// 4. Premium: síntese por tema (amor, dinheiro, carreira, missão, bloqueios, talentos)
// 5. Narrativa: texto bonito, humano, sem parecer lista automática
//
// Este módulo implementa a camada 4 e 5.
// ============================================================

import { getSignIndex } from './calculations';
import { getAspectInterpretation, ASPECT_NATURE } from './aspect-interpretations';
import { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, URANUS_IN_HOUSE, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE } from './outer-planets';
import { getChartRuler, calculateElementBalance, calculateModalityBalance, calculateDignities, getPlanetDignity } from './dignities';
import type { NatalChart, Aspect } from './types';

// ============================================================
// TYPES
// ============================================================

export interface ThemeSynthesis {
  theme: string;
  title: string;
  icon: string;
  sections: ThemeSection[];
}

export interface ThemeSection {
  subtitle: string;
  text: string;
  importance: 'high' | 'medium' | 'low';
}

export interface FullReport {
  overview: string;
  chartRuler: string;
  elementBalance: string;
  modalityBalance: string;
  themes: ThemeSynthesis[];
  dignities: string[];
  outerPlanets: string[];
}

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte', southNode: 'Nodo Sul',
};

// ============================================================
// MAIN: Gera relatório completo em camadas
// ============================================================

export function generateFullReport(chart: NatalChart): FullReport {
  // --- Visão geral (overview narrativo) ---
  const overview = generateOverview(chart);

  // --- Regente do Ascendente ---
  const ruler = getChartRuler(chart);
  const chartRulerText = ruler?.interpretation || '';

  // --- Elementos e Modalidades ---
  const elements = calculateElementBalance(chart);
  const modalities = calculateModalityBalance(chart);

  // --- Dignidades ---
  const dignityList = calculateDignities(chart);
  const dignityTexts = dignityList.map(d =>
    `${PLANET_NAMES[d.planet] || d.planet} em ${SIGN_NAMES[d.sign]}: **${d.label}** — ${d.description}`
  );

  // --- Planetas exteriores ---
  const outerTexts = generateOuterPlanets(chart);

  // --- Síntese por temas ---
  const themes = [
    synthesizeLove(chart),
    synthesizeCareer(chart),
    synthesizeMoney(chart),
    synthesizeMission(chart),
    synthesizeBlocks(chart),
    synthesizeTalents(chart),
  ];

  return {
    overview,
    chartRuler: chartRulerText,
    elementBalance: elements.interpretation,
    modalityBalance: modalities.interpretation,
    themes,
    dignities: dignityTexts,
    outerPlanets: outerTexts,
  };
}

// ============================================================
// OVERVIEW NARRATIVO (Camada 5 - texto humano)
// ============================================================

function generateOverview(chart: NatalChart): string {
  const sunSign = getSignIndex(chart.positions.sun?.longitude || 0);
  const moonSign = getSignIndex(chart.positions.moon?.longitude || 0);
  const ascSign = getSignIndex(chart.houses.ascendant);
  const sunHouse = chart.planetHouses.sun || 1;
  const moonHouse = chart.planetHouses.moon || 1;

  return `Você é um Sol em ${SIGN_NAMES[sunSign]} na casa ${sunHouse}, com Lua em ${SIGN_NAMES[moonSign]} na casa ${moonHouse} e Ascendente em ${SIGN_NAMES[ascSign]}. ` +
    `Isso significa que sua essência busca ${getSunEssence(sunSign)}, ` +
    `mas emocionalmente você precisa de ${getMoonNeed(moonSign)}, ` +
    `e o mundo te percebe como alguém ${getAscPerception(ascSign)}. ` +
    `A interação entre essas três forças é a base de quem você é — o tripé fundamental do seu mapa.`;
}

function getSunEssence(sign: number): string {
  const essences = [
    'ação, pioneirismo e autonomia', 'estabilidade, prazer sensorial e segurança',
    'comunicação, curiosidade e conexão mental', 'pertencimento, cuidado e proteção emocional',
    'expressão criativa, reconhecimento e brilho próprio', 'perfeição, utilidade e serviço',
    'harmonia, parceria e equilíbrio', 'profundidade, transformação e verdade',
    'sentido, aventura e expansão', 'conquista, legado e estrutura',
    'originalidade, liberdade e inovação', 'transcendência, compaixão e dissolução de limites',
  ];
  return essences[sign] || '';
}

function getMoonNeed(sign: number): string {
  const needs = [
    'ação e independência para se acalmar', 'conforto sensorial e estabilidade',
    'conversa e estímulo mental', 'segurança emocional e família',
    'ser visto e reconhecido afetivamente', 'ordem e sensação de utilidade',
    'harmonia e companhia', 'intensidade e profundidade emocional',
    'liberdade e perspectiva ampla', 'estrutura e sensação de conquista',
    'espaço e originalidade', 'fusão e conexão espiritual',
  ];
  return needs[sign] || '';
}

function getAscPerception(sign: number): string {
  const perceptions = [
    'corajoso, direto e energético', 'calmo, confiável e sensual',
    'comunicativo, curioso e versátil', 'acolhedor, sensível e protetor',
    'carismático, expressivo e confiante', 'competente, discreto e analítico',
    'charmoso, elegante e equilibrado', 'intenso, misterioso e magnético',
    'otimista, aventureiro e livre', 'sério, responsável e ambicioso',
    'original, independente e intelectual', 'empático, sensível e etéreo',
  ];
  return perceptions[sign] || '';
}

// ============================================================
// SÍNTESE POR TEMAS (Camada 4 - Premium)
// ============================================================

function synthesizeLove(chart: NatalChart): ThemeSynthesis {
  const sections: ThemeSection[] = [];

  // Vênus (como ama)
  const venusPos = chart.positions.venus;
  if (venusPos) {
    const vSign = getSignIndex(venusPos.longitude);
    const vHouse = chart.planetHouses.venus || 1;
    sections.push({
      subtitle: `Vênus em ${SIGN_NAMES[vSign]} na Casa ${vHouse}`,
      text: `Sua forma de amar é marcada por ${SIGN_NAMES[vSign]} — você expressa afeto na área da casa ${vHouse} (${getHouseTheme(vHouse)}).`,
      importance: 'high',
    });
  }

  // Casa 7 (parcerias)
  const h7Ruler = getHouseRuler(chart, 7);
  if (h7Ruler) {
    sections.push({
      subtitle: `Regente da Casa 7 (${PLANET_NAMES[h7Ruler.planet]})`,
      text: `O tema de parcerias no seu mapa é regido por ${PLANET_NAMES[h7Ruler.planet]}, que está na casa ${h7Ruler.house}. Isso significa que seus relacionamentos são influenciados pelos assuntos da casa ${h7Ruler.house}.`,
      importance: 'medium',
    });
  }

  // Aspectos de Vênus
  const venusAspects = getAspectsOf(chart, 'venus');
  for (const asp of venusAspects.slice(0, 3)) {
    const interp = getAspectInterpretation('venus', asp.otherPlanet, asp.type);
    if (interp) {
      sections.push({
        subtitle: `Vênus ${ASPECT_NATURE[asp.type]?.keyword || ''} ${PLANET_NAMES[asp.otherPlanet] || asp.otherPlanet}`,
        text: interp,
        importance: ASPECT_NATURE[asp.type]?.nature === 'hard' ? 'high' : 'medium',
      });
    }
  }

  // Marte (desejo)
  const marsPos = chart.positions.mars;
  if (marsPos) {
    const mSign = getSignIndex(marsPos.longitude);
    sections.push({
      subtitle: `Marte em ${SIGN_NAMES[mSign]} — Desejo`,
      text: `Marte mostra o que te atrai instintivamente e como você busca o que deseja no amor. Em ${SIGN_NAMES[mSign]}, seu desejo se manifesta de forma ${getMarsFlavor(mSign)}.`,
      importance: 'medium',
    });
  }

  return { theme: 'love', title: 'Amor e Relacionamentos', icon: '♡', sections };
}

function synthesizeCareer(chart: NatalChart): ThemeSynthesis {
  const sections: ThemeSection[] = [];

  // MC / Casa 10
  const mcSign = getSignIndex(chart.houses.midheaven);
  sections.push({
    subtitle: `Meio do Céu em ${SIGN_NAMES[mcSign]}`,
    text: `Seu Meio do Céu (MC) em ${SIGN_NAMES[mcSign]} indica a direção profissional natural: sua imagem pública e carreira tendem a se expressar através das qualidades de ${SIGN_NAMES[mcSign]}.`,
    importance: 'high',
  });

  // Regente da Casa 10
  const h10Ruler = getHouseRuler(chart, 10);
  if (h10Ruler) {
    sections.push({
      subtitle: `Regente da Casa 10 (${PLANET_NAMES[h10Ruler.planet]}) na Casa ${h10Ruler.house}`,
      text: `A realização profissional está conectada aos assuntos da casa ${h10Ruler.house}. É lá que a carreira encontra sua fonte de energia e motivação.`,
      importance: 'high',
    });
  }

  // Saturno (missão profissional)
  const satPos = chart.positions.saturn;
  if (satPos) {
    const sHouse = chart.planetHouses.saturn || 1;
    sections.push({
      subtitle: `Saturno na Casa ${sHouse}`,
      text: SATURN_IN_HOUSE[sHouse - 1] || '',
      importance: 'medium',
    });
  }

  // Casa 6 (trabalho diário)
  const h6Ruler = getHouseRuler(chart, 6);
  if (h6Ruler) {
    sections.push({
      subtitle: `Rotina de Trabalho (Casa 6 regida por ${PLANET_NAMES[h6Ruler.planet]})`,
      text: `Seu dia a dia profissional funciona melhor quando alinhado com a energia de ${PLANET_NAMES[h6Ruler.planet]} na casa ${h6Ruler.house}.`,
      importance: 'low',
    });
  }

  return { theme: 'career', title: 'Carreira e Propósito', icon: '♄', sections };
}

function synthesizeMoney(chart: NatalChart): ThemeSynthesis {
  const sections: ThemeSection[] = [];

  // Casa 2 (dinheiro próprio)
  const h2Ruler = getHouseRuler(chart, 2);
  if (h2Ruler) {
    sections.push({
      subtitle: `Casa 2 regida por ${PLANET_NAMES[h2Ruler.planet]}`,
      text: `Sua forma de ganhar dinheiro e construir patrimônio está ligada a ${PLANET_NAMES[h2Ruler.planet]} na casa ${h2Ruler.house}. Os assuntos dessa casa são fontes potenciais de renda.`,
      importance: 'high',
    });
  }

  // Júpiter (abundância)
  const jupPos = chart.positions.jupiter;
  if (jupPos) {
    const jHouse = chart.planetHouses.jupiter || 1;
    sections.push({
      subtitle: `Júpiter na Casa ${jHouse} — Abundância`,
      text: JUPITER_IN_HOUSE[jHouse - 1] || '',
      importance: 'medium',
    });
  }

  // Casa 8 (recursos compartilhados)
  const h8Ruler = getHouseRuler(chart, 8);
  if (h8Ruler) {
    sections.push({
      subtitle: `Casa 8 — Recursos Compartilhados`,
      text: `Heranças, investimentos conjuntos e transformações financeiras são regidos por ${PLANET_NAMES[h8Ruler.planet]} na casa ${h8Ruler.house}.`,
      importance: 'low',
    });
  }

  return { theme: 'money', title: 'Dinheiro e Recursos', icon: '💰', sections };
}

function synthesizeMission(chart: NatalChart): ThemeSynthesis {
  const sections: ThemeSection[] = [];

  // Nodo Norte
  const nnPos = chart.positions.northNode;
  if (nnPos) {
    const nnHouse = chart.planetHouses.northNode || 1;
    const nnSign = getSignIndex(nnPos.longitude);
    sections.push({
      subtitle: `Nodo Norte na Casa ${nnHouse} em ${SIGN_NAMES[nnSign]}`,
      text: `Sua direção evolutiva aponta para os temas da casa ${nnHouse}. É para lá que sua alma quer crescer nesta vida, mesmo que pareça desconfortável no início.`,
      importance: 'high',
    });
  }

  // Sol (propósito consciente)
  const sunPos = chart.positions.sun;
  if (sunPos) {
    const sunHouse = chart.planetHouses.sun || 1;
    sections.push({
      subtitle: `Sol na Casa ${sunHouse} — Propósito Consciente`,
      text: `Seu Sol pede que você brilhe na casa ${sunHouse} (${getHouseTheme(sunHouse)}). Quando honra esse chamado, atrai abundância e alinhamento.`,
      importance: 'high',
    });
  }

  // Saturno (missão de longo prazo)
  const satPos = chart.positions.saturn;
  if (satPos) {
    const satHouse = chart.planetHouses.saturn || 1;
    sections.push({
      subtitle: `Saturno na Casa ${satHouse} — Construção de Legado`,
      text: `Saturno indica onde você veio construir maestria ao longo da vida. Na casa ${satHouse}, a disciplina aplicada aos temas dessa área gera resultados sólidos e duradouros.`,
      importance: 'medium',
    });
  }

  return { theme: 'mission', title: 'Missão e Evolução', icon: '☊', sections };
}

function synthesizeBlocks(chart: NatalChart): ThemeSynthesis {
  const sections: ThemeSection[] = [];

  // Aspectos difíceis (quadraturas e oposições)
  const hardAspects = chart.aspects.filter(a =>
    (a.type === 'square' || a.type === 'opposition') && a.exactness > 0.5
  );

  for (const asp of hardAspects.slice(0, 5)) {
    const interp = getAspectInterpretation(asp.planet1, asp.planet2, asp.type);
    if (interp) {
      sections.push({
        subtitle: `${PLANET_NAMES[asp.planet1] || asp.planet1} ${asp.type === 'square' ? '□' : '☍'} ${PLANET_NAMES[asp.planet2] || asp.planet2}`,
        text: interp,
        importance: 'high',
      });
    }
  }

  // Saturno (limitações)
  const satPos = chart.positions.saturn;
  if (satPos) {
    const satHouse = chart.planetHouses.saturn || 1;
    sections.push({
      subtitle: `Saturno na Casa ${satHouse} — Onde sente limitação`,
      text: `Saturno indica onde a vida parece mais difícil ou lenta. Na casa ${satHouse}, pode haver sensação de inadequação ou restrição — mas é justamente ali que você constrói sua maior força com o tempo.`,
      importance: 'medium',
    });
  }

  // Plutão (sombras)
  const plutoPos = chart.positions.pluto;
  if (plutoPos) {
    const plutoHouse = chart.planetHouses.pluto || 1;
    sections.push({
      subtitle: `Plutão na Casa ${plutoHouse} — Transformação necessária`,
      text: PLUTO_IN_HOUSE[plutoHouse - 1] || '',
      importance: 'medium',
    });
  }

  return { theme: 'blocks', title: 'Desafios e Bloqueios', icon: '⚡', sections };
}

function synthesizeTalents(chart: NatalChart): ThemeSynthesis {
  const sections: ThemeSection[] = [];

  // Trígonos (facilidades)
  const trines = chart.aspects.filter(a => a.type === 'trine' && a.exactness > 0.5);
  for (const asp of trines.slice(0, 4)) {
    const interp = getAspectInterpretation(asp.planet1, asp.planet2, asp.type);
    if (interp) {
      sections.push({
        subtitle: `${PLANET_NAMES[asp.planet1] || asp.planet1} △ ${PLANET_NAMES[asp.planet2] || asp.planet2}`,
        text: interp,
        importance: 'medium',
      });
    }
  }

  // Júpiter (bagagem positiva)
  const jupPos = chart.positions.jupiter;
  if (jupPos) {
    const jupHouse = chart.planetHouses.jupiter || 1;
    sections.push({
      subtitle: `Júpiter na Casa ${jupHouse} — Talento Natural`,
      text: `Júpiter indica onde você tem "sorte" — na verdade, sabedoria já construída. Na casa ${jupHouse}, as coisas fluem com mais facilidade naturalmente.`,
      importance: 'high',
    });
  }

  // Dignidades fortes
  const dignities = calculateDignities(chart);
  const strong = dignities.filter(d => d.dignity === 'domicile' || d.dignity === 'exaltation');
  for (const d of strong) {
    sections.push({
      subtitle: `${PLANET_NAMES[d.planet]} em ${d.label}`,
      text: `${PLANET_NAMES[d.planet]} em ${SIGN_NAMES[d.sign]} está ${d.dignity === 'domicile' ? 'em casa' : 'exaltado'} — expressa suas qualidades com força e naturalidade. Este é um dos seus maiores recursos internos.`,
      importance: 'high',
    });
  }

  return { theme: 'talents', title: 'Talentos e Facilidades', icon: '✦', sections };
}

// ============================================================
// HELPERS
// ============================================================

function getHouseTheme(house: number): string {
  const themes = [
    'identidade e corpo', 'dinheiro e valores', 'comunicação e aprendizado',
    'lar e família', 'criatividade e prazer', 'trabalho e saúde',
    'relacionamentos e parcerias', 'transformação e intimidade', 'filosofia e viagens',
    'carreira e imagem pública', 'amizades e projetos futuros', 'espiritualidade e inconsciente',
  ];
  return themes[house - 1] || '';
}

function getHouseRuler(chart: NatalChart, houseNum: number): { planet: string; house: number } | null {
  const cuspLongitude = chart.houses.cusps[houseNum - 1];
  if (cuspLongitude === undefined) return null;

  const cuspSign = getSignIndex(cuspLongitude);
  const SIGN_RULERS: Record<number, string> = {
    0: 'mars', 1: 'venus', 2: 'mercury', 3: 'moon', 4: 'sun', 5: 'mercury',
    6: 'venus', 7: 'pluto', 8: 'jupiter', 9: 'saturn', 10: 'uranus', 11: 'neptune',
  };

  const ruler = SIGN_RULERS[cuspSign];
  if (!ruler || !chart.positions[ruler]) return null;

  const rulerHouse = chart.planetHouses[ruler] || 1;
  return { planet: ruler, house: rulerHouse };
}

function getAspectsOf(chart: NatalChart, planet: string): { otherPlanet: string; type: any }[] {
  return chart.aspects
    .filter(a => a.planet1 === planet || a.planet2 === planet)
    .map(a => ({
      otherPlanet: a.planet1 === planet ? a.planet2 : a.planet1,
      type: a.type,
    }));
}

function getMarsFlavor(sign: number): string {
  const flavors = [
    'direta e impulsiva — vai atrás sem rodeios',
    'persistente e sensual — conquista devagar mas com intensidade',
    'versátil e mental — seduz pela inteligência e conversa',
    'protetora e emocional — deseja segurança antes de tudo',
    'expressiva e generosa — quer ser admirado e admirar',
    'seletiva e analítica — precisa de conexão mental primeiro',
    'equilibrada e relacional — busca parceria antes de ação',
    'magnética e intensa — tudo ou nada, sem meio-termo',
    'aventureira e livre — desejo de expansão e novidade',
    'disciplinada e ambiciosa — conquista a longo prazo',
    'não convencional e intelectual — atração pelo diferente',
    'sutil e transcendente — desejo de fusão espiritual',
  ];
  return flavors[sign] || '';
}

function generateOuterPlanets(chart: NatalChart): string[] {
  const texts: string[] = [];
  const outerMap: Record<string, string[]> = {
    jupiter: JUPITER_IN_HOUSE,
    saturn: SATURN_IN_HOUSE,
    uranus: URANUS_IN_HOUSE,
    neptune: NEPTUNE_IN_HOUSE,
    pluto: PLUTO_IN_HOUSE,
  };

  for (const [planet, houses] of Object.entries(outerMap)) {
    const pos = chart.positions[planet];
    if (!pos) continue;
    const house = chart.planetHouses[planet] || 1;
    const sign = getSignIndex(pos.longitude);
    const text = houses[house - 1];
    if (text) {
      texts.push(`**${PLANET_NAMES[planet]} na Casa ${house} em ${SIGN_NAMES[sign]}**: ${text}`);
    }
  }

  return texts;
}
