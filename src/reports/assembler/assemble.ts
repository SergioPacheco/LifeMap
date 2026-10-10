// ============================================================
// ASSEMBLE.TS — Deterministic rules assembly (4A)
//
// Facts → planned chapters → ReportDocument. Synthesis opens every
// chapter (≥2 indicators named specifically); curated entries follow;
// integration rules resolve known contradictions instead of printing
// both sides flatly; recommendations/reflections close. Global dedup
// guarantees no paragraph repeats; facts keep citations through
// cross-references when their text was already printed elsewhere.
// ============================================================

import type {
  AstroFact,
  ChapterDraft,
  NarrativeSection,
  ReportContext,
  ReportDocument,
  ReportPlan,
  ReportRequest,
} from '../core/types.js';
import type { AspectType } from '../../engine/types.js';
import type { Theme } from '../../engine/calendar/types.js';
import {
  aspectPairKey,
  aspectRegisterOf,
  getCatalog,
  getEntryText,
  type KnowledgeEntry,
} from '../knowledge/catalog.js';
import { selectEntries } from '../knowledge/select.js';
import { scoreFacts } from '../scoring/score.js';
import { getHouseForLongitude } from '../../engine/houses.js';
import {
  calculateDignities,
  calculateElementBalance,
  calculateModalityBalance,
  getChartRuler,
} from '../../engine/dignities.js';
import { NATAL_BLUEPRINT } from '../planning/blueprints/natal.js';
import {
  generateOverview,
  getHouseTheme,
  synthesizeBlocks,
  synthesizeCareer,
  synthesizeLove,
  synthesizeMission,
  synthesizeMoney,
  synthesizeTalents,
  type ThemeSynthesis,
} from '../../engine/synthesis.js';
import type { NatalChart } from '../../engine/types.js';

const PLANET_PT: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno',
  pluto: 'Plutão', chiron: 'Quíron', northNode: 'Nodo Norte', southNode: 'Nodo Sul',
  lilith: 'Lilith',
};

const TYPE_PT: Record<string, string> = {
  conjunction: 'conjunção', sextile: 'sextil', square: 'quadratura',
  trine: 'trígono', opposition: 'oposição',
};

const SIGN_PT = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];

function signStyle(sign: number): string {
  const styles: Record<string, string> = {
    'áries': 'direto e iniciador', 'touro': 'estável e sensorial', 'gêmeos': 'versátil e comunicativo',
    'câncer': 'protetor e intuitivo', 'leão': 'expressivo e generoso', 'virgem': 'preciso e útil',
    'libra': 'diplomático e estético', 'escorpião': 'intenso e investigativo', 'sagitário': 'expansivo e otimista',
    'capricórnio': 'disciplinado e estratégico', 'aquário': 'original e independente', 'peixes': 'sensível e imaginativo',
  };
  return styles[SIGN_PT[sign].toLowerCase()] ?? 'peculiar';
}

/**
 * Sign×house blend: the specific combination named and read as one
 * pattern. Unique per planet — the composed version of the 1.440-combo
 * math, grounded in the user's cited facts.
 */
function blendSignHouse(planet: string, sign: number, house: number): string {
  return (
    `${pointName(planet)} em ${SIGN_PT[sign]} na Casa ${house} forma uma combinação específica: ` +
    `o estilo ${signStyle(sign)} encontra os temas de ${getHouseTheme(house).split(',')[0]}. ` +
    `Leia os trechos acima como uma coisa só — nem o signo sem a casa, nem a casa sem o signo, ` +
    `descrevem sozinhos como ${pointName(planet)} realmente opera no seu mapa.`
  );
}

/**
 * Exactness note for tight contacts: why sub-degree orbs dominate a chart.
 */
function exactnessNote(fact: AstroFact): string | null {
  if (fact.kind !== 'aspect' || typeof fact.values.orbDeg !== 'number' || fact.values.orbDeg > 1.5) {
    return null;
  }
  return (
    `A menos de ${fact.values.orbDeg}° da exatidão, este é um dos contatos definidores do seu mapa — ` +
    `aspectos tão justos funcionam como tônica de fundo, audíveis mesmo quando outros temas falam mais alto.`
  );
}

const TRADITIONAL_RULERS = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];

const CHAPTER_TITLES: Record<string, string> = {
  overview: 'Panorama do mapa',
  identity: 'Identidade e expressão',
  emotions: 'Emoções e necessidades',
  mind: 'Mente e comunicação',
  love: 'Amor e vínculos',
  drive: 'Energia e ação',
  expansion: 'Expansão e sentido',
  structure: 'Estrutura e maturidade',
  transformation: 'Transformação profunda',
  integration: 'Integração e direção',
};

const CHAPTER_SYNTHESIZER: Record<string, 'overview' | 'talents' | 'love' | 'money' | 'career' | 'blocks' | 'mission' | null> = {
  overview: 'overview',
  identity: 'talents',
  emotions: null,
  mind: null,
  love: 'love',
  drive: null,
  expansion: 'money',
  structure: 'career',
  transformation: 'blocks',
  integration: 'mission',
};

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function normalizeParagraph(text: string): string {
  return text.toLowerCase().replace(/[\s\u00a0]+/g, ' ').replace(/[“”"']/g, '').trim();
}

function pointName(point: string): string {
  return PLANET_PT[point] ?? point;
}

function describeAspect(fact: AstroFact): string {
  const planet1 = String(fact.values.planet1 ?? '?');
  const planet2 = String(fact.values.planet2 ?? '?');
  const type = String(fact.values.type ?? '');
  const orb = typeof fact.values.orbDeg === 'number' ? ` (orbe ${fact.values.orbDeg}°)` : '';
  return `${pointName(planet1)} em ${TYPE_PT[type] ?? type} com ${pointName(planet2)}${orb}`;
}

/** Rebuild the minimal chart the synthesis functions read. Null without full cusps. */
export function chartFromFacts(facts: AstroFact[]): NatalChart | null {
  const positions: NatalChart['positions'] = {};
  for (const fact of facts) {
    if (fact.kind !== 'position') continue;
    const longitude = fact.values.longitudeDeg;
    if (typeof longitude !== 'number' || !Number.isFinite(longitude)) return null;
    positions[String(fact.values.point)] = {
      longitude,
      latitude: typeof fact.values.latitudeDeg === 'number' ? fact.values.latitudeDeg : undefined,
      isRetrograde: fact.values.retrograde === true,
    };
  }
  const cusps: number[] = [];
  for (let house = 1; house <= 12; house++) {
    const cusp = facts.find((fact) => fact.kind === 'house' && fact.values.house === house && typeof fact.values.cuspLongitudeDeg === 'number');
    if (!cusp || typeof cusp.values.cuspLongitudeDeg !== 'number') return null;
    cusps.push(cusp.values.cuspLongitudeDeg);
  }
  const asc = facts.find((fact) => fact.kind === 'angle' && fact.values.angle === 'asc');
  const mc = facts.find((fact) => fact.kind === 'angle' && fact.values.angle === 'mc');
  if (!asc || !mc) return null;
  const aspects = facts
    .filter((fact) => fact.kind === 'aspect')
    .map((fact) => {
      const type = String(fact.values.type) as AspectType;
      const angle = type === 'conjunction' ? 0 : type === 'sextile' ? 60 : type === 'square' ? 90 : type === 'trine' ? 120 : 180;
      const orb = typeof fact.values.orbDeg === 'number' ? fact.values.orbDeg : 0;
      return {
        planet1: String(fact.values.planet1),
        planet2: String(fact.values.planet2),
        type,
        angle,
        orb,
        exactness: Math.max(0, 1 - orb / 8),
        applying: fact.values.applying === true,
        nature: (type === 'square' || type === 'opposition' ? 'tense' : type === 'conjunction' ? 'neutral' : 'harmonic') as NatalChart['aspects'][number]['nature'],
      };
    });
  const planetHouses: Record<string, number> = {};
  for (const [planet, position] of Object.entries(positions)) {
    planetHouses[planet] = getHouseForLongitude(position.longitude, cusps);
  }
  return {
    type: 'natal',
    date: new Date(0),
    positions,
    houses: {
      cusps,
      ascendant: Number(asc.values.longitudeDeg),
      midheaven: Number(mc.values.longitudeDeg),
      system: 'placidus',
    },
    aspects,
    planetHouses,
    dignities: {},
    meta: { lat: 0, lng: 0, timezone: 0, houseSystem: 'placidus' },
  };
}

interface RuleHit {
  ruleId: string;
  factIds: string[];
  heading: string;
  paragraphs: string[];
}

function describeSlot(fact: AstroFact): string {
  return describeAspect(fact);
}

/** Known contradiction patterns, resolved by rule with named indicators. */
export function applyIntegrationRules(facts: AstroFact[]): RuleHit[] {
  const hits: RuleHit[] = [];
  const aspects = facts.filter((fact) => fact.kind === 'aspect');
  const has = (planetA: string, planetB: string, registers: Array<'conjunction' | 'soft' | 'hard'>): AstroFact | null => {
    for (const aspect of aspects) {
      const pair = aspectPairKey(String(aspect.values.planet1), String(aspect.values.planet2));
      if (!pair) continue;
      const register = aspectRegisterOf(String(aspect.values.type) as AspectType);
      const involves =
        (String(aspect.values.planet1) === planetA && String(aspect.values.planet2) === planetB) ||
        (String(aspect.values.planet1) === planetB && String(aspect.values.planet2) === planetA);
      if (involves && registers.includes(register)) return aspect;
    }
    return null;
  };
  const fill = (template: string, a: AstroFact, b: AstroFact): string =>
    template.replace('{A}', describeSlot(a)).replace('{B}', describeSlot(b));

  const catalog = getCatalog();
  const ruleText = (rule: string): { heading: string; texts: string[] } | null => {
    const entry = catalog.find((item) => item.kind === 'integration' && item.match.rule === rule);
    return entry ? { heading: entry.pt.title, texts: entry.pt.texts } : null;
  };

  const venusSaturn = has('venus', 'saturn', ['hard']);
  const venusJupiter = has('venus', 'jupiter', ['soft']);
  if (venusSaturn && venusJupiter) {
    const rule = ruleText('venus-saturn-hard+venus-jupiter-soft');
    if (rule) {
      hits.push({
        ruleId: 'venus-saturn-jupiter',
        factIds: [venusSaturn.id, venusJupiter.id],
        heading: rule.heading,
        paragraphs: rule.texts.map((text) => fill(text, venusSaturn, venusJupiter)),
      });
    }
  }

  const sunMoon = has('sun', 'moon', ['hard']);
  if (sunMoon) {
    const rule = ruleText('sun-moon-hard');
    if (rule) {
      hits.push({
        ruleId: 'sun-moon',
        factIds: [sunMoon.id],
        heading: rule.heading,
        paragraphs: rule.texts.map((text) => fill(text, sunMoon, sunMoon)),
      });
    }
  }

  const saturnHard = aspects.find(
    (aspect) =>
      (String(aspect.values.planet1) === 'saturn' || String(aspect.values.planet2) === 'saturn') &&
      aspectRegisterOf(String(aspect.values.type) as AspectType) === 'hard'
  );
  const jupiterSoft = aspects.find(
    (aspect) =>
      (String(aspect.values.planet1) === 'jupiter' || String(aspect.values.planet2) === 'jupiter') &&
      aspectRegisterOf(String(aspect.values.type) as AspectType) === 'soft'
  );
  if (saturnHard && jupiterSoft && saturnHard.id !== jupiterSoft.id) {
    const rule = ruleText('saturn-hard+jupiter-soft');
    if (rule && !hits.some((hit) => hit.ruleId === 'venus-saturn-jupiter')) {
      hits.push({
        ruleId: 'saturn-jupiter',
        factIds: [saturnHard.id, jupiterSoft.id],
        heading: rule.heading,
        paragraphs: rule.texts.map((text) => fill(text, saturnHard, jupiterSoft)),
      });
    }
  }

  const mercuryHard = aspects.find(
    (aspect) =>
      (String(aspect.values.planet1) === 'mercury' || String(aspect.values.planet2) === 'mercury') &&
      aspectRegisterOf(String(aspect.values.type) as AspectType) === 'hard'
  );
  const mercurySoft = aspects.find(
    (aspect) =>
      (String(aspect.values.planet1) === 'mercury' || String(aspect.values.planet2) === 'mercury') &&
      aspectRegisterOf(String(aspect.values.type) as AspectType) === 'soft'
  );
  if (mercuryHard && mercurySoft && mercuryHard.id !== mercurySoft.id) {
    const rule = ruleText('mercury-hard+mercury-soft');
    if (rule) {
      hits.push({
        ruleId: 'mercury-mixed',
        factIds: [mercuryHard.id, mercurySoft.id],
        heading: rule.heading,
        paragraphs: rule.texts.map((text) => fill(text, mercuryHard, mercurySoft)),
      });
    }
  }

  const marsVenus = has('mars', 'venus', ['hard']);
  if (marsVenus) {
    const rule = ruleText('mars-venus-hard');
    if (rule) {
      hits.push({
        ruleId: 'mars-venus',
        factIds: [marsVenus.id],
        heading: rule.heading,
        paragraphs: rule.texts.map((text) => fill(text, marsVenus, marsVenus)),
      });
    }
  }

  const moonSaturn = has('moon', 'saturn', ['hard']);
  if (moonSaturn) {
    const rule = ruleText('moon-saturn-hard');
    if (rule) {
      hits.push({
        ruleId: 'moon-saturn',
        factIds: [moonSaturn.id],
        heading: rule.heading,
        paragraphs: rule.texts.map((text) => fill(text, moonSaturn, moonSaturn)),
      });
    }
  }

  return hits;
}

function splitSentences(text: string, perParagraph: number): string[] {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += perParagraph) {
    paragraphs.push(sentences.slice(i, i + perParagraph).join(' '));
  }
  return paragraphs.filter(Boolean);
}

export function assembleReport(
  request: ReportRequest,
  context: ReportContext,
  plan: ReportPlan,
  generatedAt?: string
): ReportDocument {
  if (request.locale !== 'pt') {
    throw new Error('LOCALE_UNSUPPORTED: 4A natal narrates pt only; refusing silent fallback.');
  }
  const factById = new Map(context.facts.map((fact) => [fact.id, fact]));
  const chart = chartFromFacts(context.facts);
  const cusps = chart ? chart.houses.cusps : null;
  const dignityByPlanet = new Map<string, { label: string; description: string; sign: number }>();
  if (chart) {
    for (const entry of calculateDignities(chart)) {
      dignityByPlanet.set(entry.planet, entry);
    }
  }
  const locate = (planet: string): { sign: number | null; house: number | null } => {
    const position = context.facts.find(
      (fact) => fact.kind === 'position' && fact.values.point === planet
    );
    const placement = context.facts.find(
      (fact) => fact.kind === 'house' && fact.values.point === planet && typeof fact.values.house === 'number'
    );
    return {
      sign: position && typeof position.values.signIndex === 'number' ? position.values.signIndex : null,
      house: placement && typeof placement.values.house === 'number' ? (placement.values.house as number) : null,
    };
  };
  const usedParagraphs = new Set<string>();
  const usedPoolIds = new Set<string>();
  const usedThemes = new Set<string>();
  const usedRules = new Set<string>();
  const sectionOwners = new Map<string, string>();

  const claim = (paragraph: string): string | null => {
    const key = normalizeParagraph(paragraph);
    if (usedParagraphs.has(key)) return null;
    usedParagraphs.add(key);
    return paragraph;
  };

  const catalog = getCatalog();
  const poolByTheme = (kind: 'recommendation' | 'reflection', theme: Theme): KnowledgeEntry[] =>
    catalog.filter((entry) => entry.kind === kind && entry.themes.includes(theme) && !usedPoolIds.has(entry.id));

  const chapters: ChapterDraft[] = plan.chapters.map((planned) => {
    const title = CHAPTER_TITLES[planned.id] ?? planned.id;
    const chapterFacts = planned.factIds
      .map((id) => factById.get(id))
      .filter((fact): fact is AstroFact => fact !== undefined);
    const scored = scoreFacts(chapterFacts);
    const sections: NarrativeSection[] = [];
    let sectionIndex = 0;
    const sectionId = () => `${planned.id}-s${(sectionIndex += 1)}`;

    const topEvidence = scored.slice(0, 3).map(({ fact }) => fact.id);
    // Citations follow the text: a section cites the facts it names.
    // Priority facts keep one guaranteed citation in the overview opening.
    const citeFor = (text: string, fallback: string[]): string[] => {
      const matched: string[] = [];
      for (const fact of chapterFacts) {
        if (fact.kind === 'position' || fact.kind === 'angle') {
          const point = fact.values.point;
          if (typeof point !== 'string') continue;
          if (text.includes(pointName(point))) matched.push(fact.id);
          continue;
        }
        if (fact.kind === 'house') {
          const point = fact.values.point;
          const house = fact.values.house;
          if (typeof point === 'string' && text.includes(pointName(point))) {
            matched.push(fact.id);
            continue;
          }
          if (typeof house === 'number' && text.includes(`Casa ${house}`)) matched.push(fact.id);
          continue;
        }
        if (fact.kind === 'aspect') {
          const planet1 = pointName(String(fact.values.planet1 ?? ''));
          const planet2 = pointName(String(fact.values.planet2 ?? ''));
          if (text.includes(planet1) && text.includes(planet2)) matched.push(fact.id);
        }
      }
      const ids = [...matched];
      for (const id of fallback) {
        if (ids.length >= 6) break;
        if (!ids.includes(id)) ids.push(id);
      }
      return ids;
    };

    // 1. Opening synthesis: names the top indicators specifically.
    const top = scored.slice(0, 2).map(({ fact }) => fact);
    const opening: string[] = [composeOpening(title, top, locate)];
    const rules = applyIntegrationRules(chapterFacts).filter((hit) => {
      if (usedRules.has(hit.ruleId)) return false;
      usedRules.add(hit.ruleId);
      return true;
    });
    for (const hit of rules) {
      for (const paragraph of hit.paragraphs) {
        const claimed = claim(paragraph);
        if (claimed) opening.push(claimed);
      }
    }
    sections.push({
      id: sectionId(),
      heading: `${title}: síntese`,
      paragraphs: opening,
      evidenceIds: citeFor(opening.join(' '), [
        ...topEvidence,
        ...(planned.id === 'overview' ? plan.requiredFactIds : []),
      ]),
      eventIds: [],
      possibleExpressions: [],
      recommendations: [],
      reflectionQuestions: [],
    });

    // 2. Theme synthesis from the deterministic engine (houses known only).
    const synthesizer = CHAPTER_SYNTHESIZER[planned.id] ?? null;
    if (chart && synthesizer) {
      const synthesis = runSynthesizer(synthesizer, chart);
      if (synthesis && !usedThemes.has(synthesis.theme)) {
        usedThemes.add(synthesis.theme);
        for (const part of synthesis.sections) {
          const paragraphs = splitSentences(part.text, 2)
            .map(claim)
            .filter((p): p is string => p !== null);
          if (paragraphs.length > 0) {
            sections.push({
              id: sectionId(),
              heading: part.subtitle,
              paragraphs,
              evidenceIds: citeFor(paragraphs.join(' '), topEvidence),
              eventIds: [],
              possibleExpressions: [],
              recommendations: [],
              reflectionQuestions: [],
            });
          }
        }
      }
    }

    // 3. Detail sections from curated entries (heaviest first).
    const selected = selectEntries(context.facts).filter(({ factIds }) =>
      factIds.some((id) => planned.factIds.includes(id))
    );
    const detailSections: Array<{ section: NarrativeSection; weight: number }> = [];
    for (const { entry, factIds, weight } of selected) {
      const text = getEntryText(entry, 'pt');
      const paragraphs = text.texts.map(claim).filter((p): p is string => p !== null);
      // Composed depth: aspect expansions and rulership chains, specific
      // per fact — cited, unique, never padded.
      const composed: string[] = [];
      if (entry.kind === 'aspect') {
        const fact = factIds.map((id) => factById.get(id)).find((f) => f?.kind === 'aspect');
        if (fact) {
          const expansion = expandAspect(fact, locate);
          if (expansion) {
            const claimed = claim(expansion);
            if (claimed) composed.push(claimed);
          }
        }
      }
      if (entry.kind === 'planet-house' && entry.match.planet !== undefined && entry.match.house !== undefined) {
        const chained = ruleHouse(entry.match.planet, entry.match.house, cusps, locate);
        if (chained) {
          const claimed = claim(chained);
          if (claimed) composed.push(claimed);
        }
      }
      const allParagraphs = [...paragraphs, ...composed];
      // Dignity line inside planet sections (curated when computable).
      if (entry.kind === 'planet-house' && entry.match.planet !== undefined) {
        const dignity = dignityLine(entry.match.planet, factById, dignityByPlanet);
        if (dignity) {
          const claimed = claim(dignity);
          if (claimed) allParagraphs.push(claimed);
        }
        // Sign×house blend: the specific combination as one pattern.
        const loc = locate(entry.match.planet);
        if (entry.match.house !== undefined && loc.sign !== null) {
          const blended = claim(blendSignHouse(entry.match.planet, loc.sign, entry.match.house));
          if (blended) allParagraphs.push(blended);
        }
      }
      // Exactness note for tight aspect contacts.
      if (entry.kind === 'aspect') {
        const aspectFact = factIds.map((id) => factById.get(id)).find((f) => f?.kind === 'aspect');
        if (aspectFact) {
          const note = exactnessNote(aspectFact);
          if (note) {
            const claimed = claim(note);
            if (claimed) allParagraphs.push(claimed);
          }
        }
      }
      // Chart-ruler depth inside Ascendant sections.
      if (entry.kind === 'angle' && chart) {
        const ruler = getChartRuler(chart);
        if (ruler) {
          const line =
            `${ruler.interpretation} Na prática do seu mapa: ${ruler.planetName} está em ` +
            `${SIGN_PT[ruler.rulerSign]} na Casa ${ruler.rulerHouse} — é por ali que o seu Ascendente se realiza.`;
          const claimed = claim(line);
          if (claimed) allParagraphs.push(claimed);
        }
      }
      const expressions = composeExpressions(entry, factIds, factById, locate);
      if (allParagraphs.length === 0) {
        // Text already printed elsewhere: keep the citation via cross-reference.
        // The entry title is part of the reference so two entries citing the
        // same fact never collide into one silently dropped section.
        // Same-chapter duplicates collapse silently (one printing suffices).
        const owner = sectionOwners.get(entry.id);
        const fact = factIds.map((id) => factById.get(id)).find((f) => f !== undefined);
        if (owner && fact && owner !== title) {
          const reference =
            `Como desenvolvido em "${owner}", o ponto "${text.title}" (${describeFact(fact)}) ` +
            `retorna aqui sob outro ângulo, pedindo que você leia os dois trechos em conjunto.`;
          const claimed = claim(reference);
          if (claimed) {
            detailSections.push({
              weight,
              section: {
                id: sectionId(),
                heading: text.title,
                paragraphs: [claimed],
                evidenceIds: factIds,
                eventIds: [],
                possibleExpressions: expressions,
                recommendations: [],
                reflectionQuestions: [],
              },
            });
          }
        }
        continue;
      }
      sectionOwners.set(entry.id, title);
      detailSections.push({
        weight,
        section: {
          id: sectionId(),
          heading: text.title,
          paragraphs: allParagraphs,
          evidenceIds: factIds,
          eventIds: [],
          possibleExpressions: expressions,
          recommendations: [],
          reflectionQuestions: [],
        },
      });
    }
    detailSections.sort((a, b) => b.weight - a.weight);
    for (const { section } of detailSections) sections.push(section);

    // Thematic houses: the chapter's houses with cusps and rulers, so
    // house facts that select no entry still read as content with citation.
    const spec = NATAL_BLUEPRINT.find((item) => item.id === planned.id);
    if (spec && spec.houses.length > 0 && cusps) {
      const houseParagraphs: string[] = [];
      const houseEvidence: string[] = [];
      for (const house of spec.houses) {
        const cusp = context.facts.find(
          (fact) => fact.kind === 'house' && fact.values.house === house && typeof fact.values.cuspLongitudeDeg === 'number'
        );
        if (!cusp || typeof cusp.values.cuspLongitudeDeg !== 'number') continue;
        const sign = Math.floor((((cusp.values.cuspLongitudeDeg % 360) + 360) % 360) / 30);
        const ruler = TRADITIONAL_RULERS[sign];
        const rulerLoc = locate(ruler);
        const line =
          `Para ${title.toLowerCase()}, a Casa ${house} (${getHouseTheme(house).split(',')[0]}): ` +
          `cúspide em ${SIGN_PT[sign]}, regida por ${pointName(ruler)}` +
          `${rulerLoc.sign !== null ? ` em ${SIGN_PT[rulerLoc.sign]}` : ''}` +
          `${rulerLoc.house !== null ? ` na Casa ${rulerLoc.house}` : ''}. ` +
          `É neste setor que o tema do capítulo encontra seu palco mais frequente.`;
        const claimed = claim(line);
        if (claimed) {
          houseParagraphs.push(claimed);
          houseEvidence.push(cusp.id);
        }
      }
      if (houseParagraphs.length > 0) {
        sections.push({
          id: sectionId(),
          heading: `As casas de ${title.toLowerCase()}`,
          paragraphs: houseParagraphs,
          evidenceIds: houseEvidence,
          eventIds: [],
          possibleExpressions: [],
          recommendations: [],
          reflectionQuestions: [],
        });
      }
    }

    // 3b. Dignities (integration) and element/modality balance (overview).
    if (planned.id === 'integration' && cusps) {
      const houseParagraphs: string[] = [];
      const cuspEvidence: string[] = [];
      for (let house = 1; house <= 12; house++) {
        const cusp = context.facts.find(
          (fact) => fact.kind === 'house' && fact.values.house === house && typeof fact.values.cuspLongitudeDeg === 'number'
        );
        if (!cusp || typeof cusp.values.cuspLongitudeDeg !== 'number') continue;
        const sign = Math.floor((((cusp.values.cuspLongitudeDeg % 360) + 360) % 360) / 30);
        const ruler = TRADITIONAL_RULERS[sign];
        const rulerLoc = locate(ruler);
        const line =
          `Casa ${house} (${getHouseTheme(house).split(',')[0]}): cúspide em ${SIGN_PT[sign]}, ` +
          `regida por ${pointName(ruler)}${rulerLoc.sign !== null ? ` em ${SIGN_PT[rulerLoc.sign]}` : ''}` +
          `${rulerLoc.house !== null ? ` na Casa ${rulerLoc.house}` : ''}. ` +
          `Os assuntos desta casa amadurecem quando você fortalece ${pointName(ruler)}.`;
        const claimed = claim(line);
        if (claimed) {
          houseParagraphs.push(claimed);
          cuspEvidence.push(cusp.id);
        }
      }
      if (houseParagraphs.length > 0) {
        sections.push({
          id: sectionId(),
          heading: 'As doze casas',
          paragraphs: houseParagraphs,
          evidenceIds: cuspEvidence,
          eventIds: [],
          possibleExpressions: [],
          recommendations: [],
          reflectionQuestions: [],
        });
      }
    }
    if (planned.id === 'integration') {
      const dignityParagraphs: string[] = [];
      if (chart) {
        for (const entry of calculateDignities(chart)) {
          const line = `${pointName(entry.planet)} em ${SIGN_PT[entry.sign]}: ${entry.label} — ${entry.description}`;
          const claimed = claim(line);
          if (claimed) dignityParagraphs.push(claimed);
        }
      } else {
        for (const fact of chapterFacts.filter((fact) => fact.kind === 'dignity')) {
          const point = String(fact.values.point ?? '?');
          const position = context.facts.find((f) => f.kind === 'position' && f.values.point === point);
          const sign = position && typeof position.values.signIndex === 'number' ? ` em ${SIGN_PT[position.values.signIndex]}` : '';
          const line = `${pointName(point)}${sign}: ${String(fact.values.dignity ?? '')}.`;
          const claimed = claim(line);
          if (claimed) dignityParagraphs.push(claimed);
        }
      }
      if (dignityParagraphs.length > 0) {
        sections.push({
          id: sectionId(),
          heading: 'Dignidades essenciais',
          paragraphs: dignityParagraphs,
          evidenceIds: chapterFacts.filter((fact) => fact.kind === 'dignity').map((fact) => fact.id),
          eventIds: [],
          possibleExpressions: [],
          recommendations: [],
          reflectionQuestions: [],
        });
      }
    }
    if (planned.id === 'overview' && chart) {
      const elements = calculateElementBalance(chart);
      const modalities = calculateModalityBalance(chart);
      const balance = [
        `Distribuição de elementos — Fogo ${elements.fire}, Terra ${elements.earth}, Ar ${elements.air}, Água ${elements.water}. ${elements.interpretation}`,
        `Distribuição de modalidades — Cardinal ${modalities.cardinal}, Fixo ${modalities.fixed}, Mutável ${modalities.mutable}. ${modalities.interpretation}`,
      ]
        .map(claim)
        .filter((p): p is string => p !== null);
      if (balance.length > 0) {
        sections.push({
          id: sectionId(),
          heading: 'Temperamento de base',
          paragraphs: balance,
          evidenceIds: chapterFacts.filter((fact) => fact.kind === 'distribution').map((fact) => fact.id),
          eventIds: [],
          possibleExpressions: [],
          recommendations: [],
          reflectionQuestions: [],
        });
      }
    }

    // 4. Closing: practices + reflections from unused pools.
    const chapterThemes = topThemes(chapterFacts);
    const recs = chapterThemes.flatMap((theme) => poolByTheme('recommendation', theme)).slice(0, 4);
    const refs = chapterThemes.flatMap((theme) => poolByTheme('reflection', theme)).slice(0, 4);
    for (const pool of [...recs, ...refs]) usedPoolIds.add(pool.id);
    if (recs.length > 0) {
      sections.push({
        id: sectionId(),
        heading: `Práticas para ${title.toLowerCase()}`,
        paragraphs: [`Para levar ${title.toLowerCase()} para a vida prática:`],
        evidenceIds: topEvidence,
        eventIds: [],
        possibleExpressions: [],
        recommendations: recs.flatMap((pool) => pool.pt.texts),
        reflectionQuestions: [],
      });
    }
    if (refs.length > 0) {
      sections.push({
        id: sectionId(),
        heading: `Reflexões sobre ${title.toLowerCase()}`,
        paragraphs: [`Perguntas para ${title.toLowerCase()}:`],
        evidenceIds: topEvidence,
        eventIds: [],
        possibleExpressions: [],
        recommendations: [],
        reflectionQuestions: refs.flatMap((pool) => pool.pt.texts),
      });
    }

    // 5. Trim to the chapter band (lightest details first, skeleton kept).
    let words = sectionWords(sections);
    if (words > planned.maxWords) {
      const droppable = sections
        .map((section, index) => ({ section, index }))
        .filter(({ section }) => section.heading !== `${title}: síntese` && !section.heading.startsWith('Práticas') && !section.heading.startsWith('Reflexões'));
      droppable.sort((a, b) => sectionWeight(b.section) - sectionWeight(a.section));
      while (words > planned.maxWords && droppable.length > 1) {
        const victim = droppable.pop()!;
        sections.splice(sections.indexOf(victim.section), 1);
        words = sectionWords(sections);
      }
    }

    return { id: planned.id, title, sections };
  });

  const summary = chapters[0]?.sections[0]?.paragraphs.slice(0, 3) ?? [];
  return {
    schemaVersion: 1,
    id: `rules-${plan.reportType}-${context.factsHash}`,
    locale: request.locale,
    reportType: plan.reportType,
    title: 'Mapa natal — leitura por regras',
    summary,
    chapters,
    context,
    plan,
    metadata: {
      generatedAt: generatedAt ?? new Date().toISOString(),
      period: request.period ?? null,
      model: 'rules-4a-k1',
      promptVersion: 'n/a-rules',
      layoutVersion: 'layout-v1',
    },
  };
}

function sectionWords(sections: NarrativeSection[]): number {
  return sections.reduce(
    (total, section) =>
      total +
      section.paragraphs.reduce((n, p) => n + countWords(p), 0) +
      section.recommendations.reduce((n, p) => n + countWords(p), 0) +
      section.reflectionQuestions.reduce((n, p) => n + countWords(p), 0) +
      section.possibleExpressions.reduce((n, p) => n + countWords(p), 0),
    0
  );
}

function sectionWeight(section: NarrativeSection): number {
  return section.paragraphs.reduce((n, p) => n + countWords(p), 0);
}

function topThemes(facts: AstroFact[]): Theme[] {
  const counts = new Map<Theme, number>();
  for (const fact of facts) {
    for (const theme of themesOf(fact)) {
      counts.set(theme, (counts.get(theme) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([theme]) => theme).slice(0, 3);
}

const FACT_THEMES: Record<string, Theme[]> = {
  sun: ['career', 'creativity'], moon: ['family', 'health'], mercury: ['communication'],
  venus: ['love', 'finances'], mars: ['health', 'career'], jupiter: ['finances', 'travel'],
  saturn: ['career', 'health'], uranus: ['freedom'], neptune: ['spirituality'],
  pluto: ['transformation'], northNode: ['spirituality'], southNode: ['family'], lilith: ['sexuality'],
};

function themesOf(fact: AstroFact): Theme[] {
  const out: Theme[] = [];
  for (const key of ['point', 'planet1', 'planet2'] as const) {
    const value = fact.values[key];
    if (typeof value === 'string' && FACT_THEMES[value]) out.push(...FACT_THEMES[value]);
  }
  return [...new Set(out)];
}

function composeOpening(
  title: string,
  top: AstroFact[],
  locate: (planet: string) => { sign: number | null; house: number | null }
): string {
  if (top.length === 0) return `${title} reúne os indicadores do seu mapa nos parágrafos abaixo.`;
  const named = top.map((fact) => describePlaced(fact, locate)).join(' e ');
  const second =
    top.length > 1
      ? ` A leitura deste capítulo parte da combinação entre esses dois pontos: nenhum deles, sozinho, conta a história inteira, e é no atrito entre eles que aparecem as nuances mais pessoais do seu mapa.`
      : ` Ao longo deste capítulo, esse posicionamento é desdobrado em manifestações possíveis, pontos de atenção e aplicações práticas para a sua realidade.`;
  return (
    `Em ${title.toLowerCase()}, o que mais pesa no seu mapa é ${named}.${second} ` +
    `Os trechos a seguir detalham cada indicador com textos curatoriais, integram o que se combina ou se tensiona e fecham com práticas e perguntas.`
  );
}

function describePlaced(
  fact: AstroFact,
  locate: (planet: string) => { sign: number | null; house: number | null }
): string {
  if (fact.kind === 'aspect') {
    const planet1 = String(fact.values.planet1 ?? '?');
    const planet2 = String(fact.values.planet2 ?? '?');
    const a = locate(planet1);
    const b = locate(planet2);
    const placed = (planet: string, loc: { sign: number | null; house: number | null }) =>
      `${pointName(planet)}${loc.sign !== null ? ` em ${SIGN_PT[loc.sign]}` : ''}${loc.house !== null ? ` na Casa ${loc.house}` : ''}`;
    const type = String(fact.values.type ?? '');
    const orb = typeof fact.values.orbDeg === 'number' ? `, com orbe de ${fact.values.orbDeg}°` : '';
    return `${placed(planet1, a)} em ${TYPE_PT[type] ?? type} com ${placed(planet2, b)}${orb}`;
  }
  if (fact.kind === 'position') {
    const point = String(fact.values.point ?? '?');
    const loc = locate(point);
    const sign = typeof fact.values.signIndex === 'number' ? ` em ${SIGN_PT[fact.values.signIndex]}` : '';
    return `${pointName(point)}${sign}${loc.house !== null ? ` na Casa ${loc.house}` : ''}`;
  }
  return describeFact(fact);
}

/**
 * Composed aspect expansion: orb exactness, applying motion and the two
 * placements named specifically. Unique per pair — never a template repeat.
 */
function expandAspect(
  fact: AstroFact,
  locate: (planet: string) => { sign: number | null; house: number | null }
): string | null {
  if (fact.kind !== 'aspect') return null;
  const planet1 = String(fact.values.planet1 ?? '?');
  const planet2 = String(fact.values.planet2 ?? '?');
  const type = String(fact.values.type ?? '');
  const orb = typeof fact.values.orbDeg === 'number' ? fact.values.orbDeg : null;
  const a = locate(planet1);
  const b = locate(planet2);
  const tight = orb !== null && orb <= 2 ? ' Contato exato — dos mais influentes do seu mapa —, por isso este tema costuma aparecer cedo e com força na sua história.' : '';
  const applying =
    fact.values.applying === true
      ? ' Como o aspecto é aplicativo, essa energia tende a se intensificar nos próximos ciclos: vale tratá-la como processo em curso, não como traço fixo.'
      : fact.values.applying === false
        ? ' Como o aspecto é separativo, você provavelmente já conhece bem essa dinâmica — o trabalho agora é de integração consciente, não de descoberta.'
        : '';
  const placed = (planet: string, loc: { sign: number | null; house: number | null }) =>
    `${pointName(planet)}${loc.sign !== null ? ` em ${SIGN_PT[loc.sign]}` : ''}${loc.house !== null ? ` (Casa ${loc.house})` : ''}`;
  return (
    `Na prática, ${placed(planet1, a)} em ${TYPE_PT[type] ?? type} com ${placed(planet2, b)}` +
    `${orb !== null ? `, a ${orb}° da exatidão,` : ''} colore sobretudo ` +
    `os assuntos das casas envolvidas: observe em que áreas da vida esses dois planetas costumam se encontrar por aqui.` +
    `${tight}${applying}`
  );
}

/** Dignity line for a planet section: curated description when computable. */
function dignityLine(
  planet: string,
  factById: Map<string, AstroFact>,
  dignityByPlanet: Map<string, { label: string; description: string; sign: number }>
): string | null {
  const curated = dignityByPlanet.get(planet);
  if (curated) {
    return `${pointName(planet)} em ${SIGN_PT[curated.sign]} está em ${curated.label}: ${curated.description}`;
  }
  const fact = [...factById.values()].find((f) => f.kind === 'dignity' && f.values.point === planet);
  if (!fact) return null;
  const position = [...factById.values()].find((f) => f.kind === 'position' && f.values.point === planet);
  const sign = position && typeof position.values.signIndex === 'number' ? ` em ${SIGN_PT[position.values.signIndex]}` : '';
  return `${pointName(planet)}${sign} — ${String(fact.values.dignity ?? '')}.`;
}

/**
 * Possible expressions for a detail section, composed from the cited
 * facts (houses, signs, aspect dynamics). Specific per section — the
 * spec requires manifestations per section, and composition keeps them
 * unique without curated pools.
 */
function composeExpressions(
  entry: KnowledgeEntry,
  factIds: string[],
  factById: Map<string, AstroFact>,
  locate: (planet: string) => { sign: number | null; house: number | null }
): string[] {
  const out: string[] = [];
  if (entry.kind === 'planet-house' && entry.match.planet !== undefined && entry.match.house !== undefined) {
    const planet = entry.match.planet;
    const house = entry.match.house;
    const loc = locate(planet);
    out.push(
      `Na Casa ${house} (${getHouseTheme(house).split(',')[0]}), ${pointName(planet)} tende a aparecer nas pequenas decisões diárias desse setor — é ali que este posicionamento mais se revela.`
    );
    if (loc.sign !== null) {
      out.push(
        `Com ${pointName(planet)} em ${SIGN_PT[loc.sign]}, o estilo é ${signStyle(loc.sign)}: observe essa qualidade tingindo os assuntos da Casa ${house}.`
      );
    }
  }
  if (entry.kind === 'aspect') {
    const fact = factIds.map((id) => factById.get(id)).find((f) => f?.kind === 'aspect');
    if (fact) {
      const planet1 = String(fact.values.planet1 ?? '?');
      const planet2 = String(fact.values.planet2 ?? '?');
      const a = locate(planet1);
      const b = locate(planet2);
      const where = (planet: string, loc: { sign: number | null; house: number | null }) =>
        `${pointName(planet)}${loc.house !== null ? ` na Casa ${loc.house}` : ''}`;
      out.push(
        `Na vida prática, este contato costuma aparecer quando ${where(planet1, a)} encontra ${where(planet2, b)}: repare nesses cruzamentos antes de interpretá-los como traço fixo.`
      );
      const register =
        String(fact.values.type ?? '') === 'conjunction'
          ? 'de fusão'
          : ['sextile', 'trine'].includes(String(fact.values.type ?? ''))
            ? 'fluente'
            : 'tenso';
      out.push(
        `Como todo aspecto ${register}, ele tem duas saídas — expressão consciente ou repetição automática — e a diferença está na atenção que você dedica a ele.`
      );
    }
  }
  return out;
}

/**
 * Rulership chain for a house placement: who rules the house, where the
 * ruler sits. Specific per planet — the backbone of classical synthesis.
 */
function ruleHouse(
  planet: string,
  house: number,
  cusps: number[] | null,
  locate: (body: string) => { sign: number | null; house: number | null }
): string | null {
  if (!cusps || cusps.length !== 12) return null;
  const cuspSign = Math.floor(((cusps[house - 1] % 360) + 360) % 360 / 30);
  const ruler = TRADITIONAL_RULERS[cuspSign];
  const rulerLoc = locate(ruler);
  const rulerPlaced =
    `${pointName(ruler)}${rulerLoc.sign !== null ? ` em ${SIGN_PT[rulerLoc.sign]}` : ''}` +
    `${rulerLoc.house !== null ? ` na Casa ${rulerLoc.house}` : ''}`;
  return (
    `Pela regência tradicional, a Casa ${house} tem ${SIGN_PT[cuspSign]} na cúspide e é regida por ${rulerPlaced}. ` +
    `Assim, os assuntos de ${pointName(planet)} nesta casa passam pelas mãos de ${pointName(ruler)}: ` +
    `fortalecer ${rulerPlaced} fortalece indiretamente tudo o que ${pointName(planet)} promete aqui.`
  );
}

function describeFact(fact: AstroFact): string {
  if (fact.kind === 'aspect') return describeAspect(fact);
  if (fact.kind === 'position') {
    const point = String(fact.values.point ?? '?');
    const sign = typeof fact.values.signIndex === 'number' ? ` em ${SIGN_PT[fact.values.signIndex]}` : '';
    return `${pointName(point)}${sign}`;
  }
  if (fact.kind === 'angle') return `o ${pointName(String(fact.values.angle ?? ''))} em ${SIGN_PT[Number(fact.values.signIndex)] ?? ''}`;
  if (fact.kind === 'house') return `a Casa ${String(fact.values.house ?? '?')} ativada`;
  return fact.id;
}

function runSynthesizer(
  key: NonNullable<(typeof CHAPTER_SYNTHESIZER)[string]>,
  chart: NatalChart
): ThemeSynthesis | null {
  switch (key) {
    case 'overview':
      return { theme: 'overview', title: 'Panorama', icon: '', sections: [{ subtitle: 'Visão geral', text: generateOverview(chart), importance: 'high' }] };
    case 'talents':
      return synthesizeTalents(chart);
    case 'love':
      return synthesizeLove(chart);
    case 'money':
      return synthesizeMoney(chart);
    case 'career':
      return synthesizeCareer(chart);
    case 'blocks':
      return synthesizeBlocks(chart);
    case 'mission':
      return synthesizeMission(chart);
    default:
      return null;
  }
}
