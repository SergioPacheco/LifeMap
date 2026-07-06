// ============================================================
// SATURN-RETURN-REPORT.TS — Saturn Return Report (12-15 pages)
// Targeted at ages 27-30 (1st return) and 57-60 (2nd return)
// ============================================================

import { jsPDF } from 'jspdf';
import type { NatalChart } from '../engine/types';
import { getSignIndex } from '../engine/calculations';
import { SATURN_IN_HOUSE, SATURN_IN_SIGN } from '../engine/outer-planets';
import { getAspectInterpretation } from '../engine/aspect-interpretations';
import { getInterpretations } from '../engine/interpretations/index';
import type { ReportOptions } from './report-generators';

// ============================================================
// SHARED CONSTANTS (mirrors report-generators.ts)
// ============================================================

const COLORS = {
  brand:      [107, 33, 168] as [number, number, number],
  brandLight: [139, 92, 246] as [number, number, number],
  text:       [30, 30, 30]   as [number, number, number],
  textLight:  [100, 100, 100] as [number, number, number],
  line:       [200, 200, 200] as [number, number, number],
  bg:         [250, 250, 255] as [number, number, number],
  gold:       [180, 140, 50]  as [number, number, number],
  red:        [180, 40, 40]   as [number, number, number],
};

const SIGN_NAMES_EN = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const PLANET_NAMES_EN: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  northNode: 'North Node', chiron: 'Chiron',
};

// ============================================================
// SATURN IN SIGN — English interpretive texts
// ============================================================

const SATURN_IN_SIGN_EN: string[] = [
  /* Aries */
  'Saturn in Aries demands that you learn the difference between bold action and impulsive reaction. Your karmic lesson is to develop genuine courage — the kind that persists after the initial rush of enthusiasm fades. You may have struggled with anger, impatience, or the fear of appearing weak. The gift Saturn offers here is true leadership: not the performance of strength, but the disciplined cultivation of it.',
  /* Taurus */
  'Saturn in Taurus teaches the architecture of security. Your karmic lesson involves building something real and lasting — materially, emotionally, or both — through patience rather than shortcuts. Early life may have carried financial or emotional instability that made you cling too tightly, or conversely, give up too easily. The gift: the capacity to build wealth and stability that endures generations.',
  /* Gemini */
  'Saturn in Gemini asks you to slow the mind long enough to go deep. Your karmic lesson is to develop genuine expertise rather than surface familiarity with many things. Communication challenges — difficulty expressing yourself clearly, being misunderstood, or intellectual self-doubt — are the friction points that, worked through, become authority. The gift: a precise, trustworthy mind that others rely on.',
  /* Cancer */
  'Saturn in Cancer is one of the most emotionally demanding placements. Your karmic lesson involves building inner security that does not depend on others for its foundation. Early experiences with family, home, or the maternal figure likely shaped a complex relationship with emotional needs — either suppressing them entirely or fearing they would never be met. The gift: extraordinary emotional resilience and the capacity to create true safety for others.',
  /* Leo */
  'Saturn in Leo asks you to earn recognition through genuine achievement rather than performance alone. Your karmic lesson involves developing an inner source of self-worth that does not collapse when no one is watching. Blocks around creativity, self-expression, or the fear of being truly seen may have been present in early life. The gift: a deep, unshakeable dignity that comes from having done the real work of becoming.',
  /* Virgo */
  'Saturn in Virgo asks you to develop mastery in the service of something meaningful. Your karmic lesson involves learning that excellence is a practice, not a destination — and that the pursuit of perfection, if untamed, becomes its own form of paralysis. Early experiences may have generated chronic self-criticism or an anxious relationship with incompleteness. The gift: the capacity for craftsmanship so precise it becomes art.',
  /* Libra */
  'Saturn in Libra is in its exaltation — structure applied to relationships and justice. Your karmic lesson is to build partnerships based on honesty and mutual respect rather than appeasement. You may have learned early that harmony required self-erasure, or that taking a side was dangerous. The gift: the ability to hold fairness under pressure — a rare quality that others gravitate toward.',
  /* Scorpio */
  'Saturn in Scorpio asks you to confront power honestly. Your karmic lesson involves learning to transform rather than control — to face the depths without being consumed by them. Early encounters with loss, betrayal, or the misuse of power may have left a mark that either hardened you or awakened your investigative instinct. The gift: the capacity for profound psychological transformation that few others can access.',
  /* Sagittarius */
  'Saturn in Sagittarius asks you to test your beliefs against reality. Your karmic lesson involves distinguishing genuine wisdom from comforting ideology — and developing the intellectual honesty to revise what you once held as unquestionable truth. Dogma, overconfidence, or fear of commitment may have been early patterns. The gift: a philosophy of life earned through lived experience rather than received from authority.',
  /* Capricorn */
  'Saturn in Capricorn is in its domicile — its strongest expression. Your karmic lesson involves distinguishing ambition that serves your genuine purpose from ambition that simply earns approval from a world that defines success too narrowly. Early life may have carried significant responsibility or the weight of family expectations. The gift: an extraordinary capacity for disciplined long-term achievement that builds real legacy.',
  /* Aquarius */
  'Saturn in Aquarius asks you to commit to a collective vision without losing yourself in the process. Your karmic lesson involves developing the discipline to translate original ideas into structures that others can inhabit. Detachment, intellectual pride, or fear of conventional belonging may have been early patterns. The gift: the capacity to build systems that outlast you — institutions, ideas, and networks that genuinely serve humanity.',
  /* Pisces */
  'Saturn in Pisces asks you to structure the boundless. Your karmic lesson involves bringing form to spiritual insight — not escaping into idealism, but incarnating it into daily practice. Early life may have carried confusion, dissolution, or the weight of others\' suffering absorbed without filter. The gift: a disciplined spiritual life that others find genuinely healing in its consistency and depth.',
];

// ============================================================
// SATURN DEMANDS BY SIGN — what Saturn asks you to do
// ============================================================

const SATURN_DEMANDS: string[] = [
  /* Aries */     'Act with deliberate courage. Finish what you start. Lead without needing followers to validate the direction. Learn that restraint is not weakness — it is precision.',
  /* Taurus */    'Build slowly and keep building. Resist the urge to abandon what requires long cultivation. Practice letting go of what has been outgrown, even when it feels safe. Earn your security through your own hands.',
  /* Gemini */    'Choose depth over breadth. Commit to one idea long enough to master it. Develop the discipline of listening as carefully as you speak. Let your words carry weight because they have been considered.',
  /* Cancer */    'Become your own safe harbor. Do the emotional work of tracing inherited patterns back to their source. Care for others without dissolving into them. Let your home — inner and outer — be something you deliberately build.',
  /* Leo */       'Create for the love of creating, not for the applause. Do the work even when no audience is watching. Develop a relationship with your own opinion of yourself that does not require external confirmation to remain stable.',
  /* Virgo */     'Accept that useful and imperfect is better than perfect and paralyzed. Develop routines that sustain excellence over time. Serve from a place of genuine skill, not fear of being found insufficient.',
  /* Libra */     'Make decisions. Hold positions that may displease. Build relationships on honesty rather than on the comfort of agreement. Develop the spine to say what needs to be said with grace but without evasion.',
  /* Scorpio */   'Face what is hidden. Let what must die, die. Release the need to control outcomes as a substitute for trusting the process of transformation. Use your access to depth to heal, not to dominate.',
  /* Sagittarius */'Test your beliefs in the fire of lived experience. Commit to something long enough to find out what it asks of you. Honor the gap between inspiring vision and the unglamorous daily work of realizing it.',
  /* Capricorn */ 'Define success on your own terms, not the world\'s. Let ambition serve purpose rather than fear. Give yourself credit for what you have built, instead of immediately measuring it against what remains undone.',
  /* Aquarius */  'Follow through on the systems you design. Show up for the collective without needing the collective to revolve around you. Build structures that function even when your enthusiasm has moved on.',
  /* Pisces */    'Anchor the spiritual in the practical. Develop discernment between compassion and self-erasure. Create a daily structure that protects your sensitivity rather than exposing it to dissolution.',
];

// ============================================================
// SATURN REWARDS BY SIGN — what Saturn gives after the work
// ============================================================

const SATURN_REWARDS: string[] = [
  /* Aries */     'Authentic authority that does not depend on position or title. The confidence of someone who has acted despite fear — and discovered that acting despite fear is what courage actually is.',
  /* Taurus */    'A stable, prosperous life built entirely by your own hands. Security so deeply internalized that no external disruption can fully shake it. The enduring satisfaction of knowing what things are truly worth.',
  /* Gemini */    'A mind so well-trained it becomes an instrument of genuine precision. The credibility of expertise — the rare experience of being the person who actually knows what they are talking about.',
  /* Cancer */    'An emotional center that holds — yours and often others\'. The deep satisfaction of having built a home that is not a cage but a foundation. The freedom that comes from no longer needing others to make you feel safe.',
  /* Leo */       'Recognition that arrives without having been chased. A sense of self so solid it expresses itself naturally, without needing to announce itself. Creative work that persists because it was built on genuine craft.',
  /* Virgo */     'Mastery. The particular satisfaction of having developed a skill so deeply that it becomes invisible — something you do with ease because you have done it with effort for long enough.',
  /* Libra */     'Relationships grounded in authentic equality rather than managed peace. The respect that comes from being someone who will say the difficult true thing rather than the comfortable false one.',
  /* Scorpio */   'Genuine psychological power — the kind that transforms rather than controls. The trust of those who recognize you have faced the dark and returned, not unchanged, but intact and somehow more complete.',
  /* Sagittarius */'A personal philosophy forged through experience — not borrowed from authorities, but tested against life and found to hold. The credibility of someone who has lived what they teach.',
  /* Capricorn */ 'A legacy. Structures, institutions, achievements, or simply a reputation built over decades that outlasts the moment. The profound satisfaction of having been someone whose work mattered.',
  /* Aquarius */  'Systems that genuinely serve humanity — built not in a burst of inspiration but through the slow, patient work of implementation. The knowledge that your unconventional mind has left something real in the world.',
  /* Pisces */    'A spiritual life of genuine depth and daily practice. The particular peace of someone who has not escaped the world\'s suffering but has learned to hold it with compassion — without being swallowed by it.',
];

// ============================================================
// SATURN RULES — houses ruled by Capricorn/Aquarius cusp
// ============================================================

function getSaturnRuledHouses(chart: NatalChart): number[] {
  const capHouses: number[] = [];
  const aquHouses: number[] = [];
  for (let i = 0; i < 12; i++) {
    const signIdx = getSignIndex(chart.houses.cusps[i]);
    if (signIdx === 9) capHouses.push(i + 1);   // Capricorn
    if (signIdx === 10) aquHouses.push(i + 1);  // Aquarius
  }
  return [...capHouses, ...aquHouses];
}

const SATURN_RULED_HOUSE_TEXTS: Record<number, string> = {
  1: 'Your 1st house is ruled by Saturn — the self, the body, and the way you present to the world are under Saturn\'s direct jurisdiction. The Saturn Return restructures your very identity: who you thought you were versus who you actually are becomes unavoidable. Expect significant shifts in how you carry yourself, what you project, and what you choose to claim about yourself.',
  2: 'Your 2nd house falls under Saturn\'s rulership — values, resources, and self-worth are in Saturn\'s domain. The Return activates questions about money, security, and what you believe you deserve. Financial restructuring is common, but the deeper work is internal: learning to build security from the inside out rather than seeking it entirely from external sources.',
  3: 'Your 3rd house carries Saturn\'s influence — communication, learning, and your immediate environment are activated. The Return may require you to become more precise in how you express yourself, to commit to a field of study with genuine depth, or to address unresolved dynamics with siblings or neighbors.',
  4: 'Your 4th house is under Saturn\'s rulership — the roots, the family, and the emotional foundation are in the Return\'s crosshairs. Home changes, family restructuring, and the excavation of inherited emotional patterns are central themes. This is some of the deepest work the Saturn Return can ask for — and some of the most liberating.',
  5: 'Saturn rules your 5th house — creativity, self-expression, and romance are being restructured. The Return asks whether your creative life is genuine or performed, whether your romantic history reflects authentic desire or unexamined patterns. Children, creative projects, and the courage to be seen are key themes.',
  6: 'Your 6th house falls under Saturn — work, health, and daily routine are the domains being reorganized. The Return demands sustainable habits: routines that actually support the life you are building, health practices taken seriously, and a clearer sense of how your daily work connects to your larger purpose.',
  7: 'Saturn rules your 7th house — committed partnerships are directly activated by the Return. Relationships that are not built on solid foundations tend to reveal their cracks here. Equally, this period often brings serious commitments that carry genuine long-term weight. The question Saturn asks: is this partnership real?',
  8: 'Your 8th house carries Saturn\'s governance — shared resources, transformation, and intimacy are under pressure. The Return may surface questions of debt, inheritance, or deep psychological restructuring. This is a period that asks you to let go of what you have been holding onto for security while actually holding you back.',
  9: 'Saturn rules your 9th house — beliefs, education, and your guiding philosophy of life are being stress-tested. The Return asks whether your worldview can hold up to your actual lived experience, or whether it is time to rebuild your understanding of meaning from a more honest foundation.',
  10: 'Your 10th house is governed by Saturn — career, reputation, and public role are at the center of the Return\'s work. This is the most classically "Saturnian" activation: the full weight of professional ambition, public identity, and the question of legacy all come due at once. The Return often marks a decisive turn in career direction.',
  11: 'Saturn rules your 11th house — friendships, community, and future vision are being restructured. The Return asks which relationships genuinely support the person you are becoming, and which ones are held together only by the past. Collective goals and your sense of what you are working toward in the long term also come under serious review.',
  12: 'Your 12th house is under Saturn\'s rulership — the hidden, the spiritual, and the unconscious are being asked to come into structure. The Return surfaces what has been ignored, suppressed, or avoided. This can be confronting, but it is ultimately the work of integrating the shadow: what you bring to consciousness here loses its power to operate silently against you.',
};

// ============================================================
// HELPERS (local mirrors of report-generators helpers)
// ============================================================

function renderCover(doc: jsPDF, title: string, subtitle: string, options: ReportOptions, icon: string) {
  const w = 210, h = 297;
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, w, h, 'F');
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(2);
  doc.line(20, 30, w - 20, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.brand);
  doc.text('LifeMap Pro', w / 2, 55, { align: 'center' });
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.text);
  doc.text(title, w / 2, 72, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textLight);
  doc.text(subtitle, w / 2, 84, { align: 'center' });
  doc.setFontSize(50);
  doc.setTextColor(...COLORS.brandLight);
  doc.text(icon, w / 2, 130, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  doc.text(options.profileName, w / 2, 170, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`${options.birthDate}  ${options.birthTime}`, w / 2, 182, { align: 'center' });
  doc.text(options.birthCity, w / 2, 192, { align: 'center' });
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(1);
  doc.line(20, h - 30, w - 20, h - 30);
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text('www.lifemap.pro', w / 2, h - 20, { align: 'center' });
}

function addFooters(doc: jsPDF, name: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    doc.text(`${name} — LifeMap Pro`, 20, 287);
    doc.text(`${i} / ${pageCount}`, 190, 287, { align: 'right' });
  }
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSectionTitle(doc: jsPDF, title: string, y: number, margin: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.brand);
  doc.text(title, margin, y);
  y += 4;
  doc.setDrawColor(...COLORS.brandLight);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 190, y);
  return y + 6;
}

function addSubTitle(doc: jsPDF, title: string, y: number, margin: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brand);
  doc.text(title, margin, y);
  return y + 6;
}

function checkPage(doc: jsPDF, y: number): number {
  if (y > 255) { doc.addPage(); return 30; }
  return y;
}

function tryoutCut(doc: jsPDF, options: ReportOptions, reportName: string, price: string): Blob | null {
  if (!options.isTryout) return null;
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(50);
    doc.setTextColor(200, 200, 200);
    doc.text('SAMPLE', 105, 200, { align: 'center', angle: 45 });
  }
  doc.addPage();
  const w = 210;
  let y = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.brand);
  doc.text('This was a free sample!', w / 2, y, { align: 'center' });
  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(`The complete "${reportName}" report contains`, w / 2, y, { align: 'center' });
  doc.text('12-15 pages of deep, personalized interpretation.', w / 2, y + 14, { align: 'center' });
  y += 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.gold);
  doc.text(`Full version: R$ ${price}`, w / 2, y, { align: 'center' });
  y += 25;
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('www.lifemap.pro/reports', w / 2, y, { align: 'center' });
  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Buy now and download instantly — 100% in your browser.', w / 2, y, { align: 'center' });
  addFooters(doc, options.profileName);
  return doc.output('blob') as unknown as Blob;
}

// ============================================================
// SATURN RETURN CALCULATION
// ============================================================

interface SaturnReturnInfo {
  returnNumber: 1 | 2 | 'between';
  age: number;
  approximateYear: number;
  description: string;
}

function calculateSaturnReturn(birthDateStr: string): SaturnReturnInfo {
  // Parse birth year from various formats (YYYY-MM-DD or DD/MM/YYYY)
  const parts = birthDateStr.split(/[-/]/);
  let birthYear: number;
  if (parts[0].length === 4) {
    birthYear = parseInt(parts[0]);
  } else {
    birthYear = parseInt(parts[2]);
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  // Saturn's orbital period is ~29.5 years
  const firstReturnStart = 27;
  const firstReturnEnd = 30;
  const secondReturnStart = 56;
  const secondReturnEnd = 60;

  if (age >= firstReturnStart - 2 && age <= firstReturnEnd + 2) {
    return {
      returnNumber: 1,
      age,
      approximateYear: birthYear + 29,
      description: 'first Saturn Return',
    };
  } else if (age >= secondReturnStart - 2 && age <= secondReturnEnd + 2) {
    return {
      returnNumber: 2,
      age,
      approximateYear: birthYear + 59,
      description: 'second Saturn Return',
    };
  } else {
    // Between returns — still relevant as context
    const nextReturn = age < firstReturnStart ? 1 : 2;
    return {
      returnNumber: 'between',
      age,
      approximateYear: nextReturn === 1 ? birthYear + 29 : birthYear + 59,
      description: nextReturn === 1 ? 'approaching your first Saturn Return' : 'approaching your second Saturn Return',
    };
  }
}

// ============================================================
// MAIN EXPORT — generateSaturnReturnPdf
// ============================================================

export function generateSaturnReturnPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const texts = getInterpretations(options.locale || 'en');

  // Derive key chart data
  const satSign      = getSignIndex(chart.positions.saturn?.longitude || 0);
  const satHouse     = chart.planetHouses.saturn || 1;
  const sunSign      = getSignIndex(chart.positions.sun?.longitude || 0);
  const ascSign      = getSignIndex(chart.houses.cusps[0]);
  const mcSign       = getSignIndex(chart.houses.midheaven);
  const saturnReturn = calculateSaturnReturn(options.birthDate);
  const saturnRuled  = getSaturnRuledHouses(chart);
  const signNames    = texts.SIGN_NAMES?.length === 12 ? texts.SIGN_NAMES : SIGN_NAMES_EN;

  // Aspects involving Saturn
  const saturnAspects = chart.aspects.filter(
    a => a.planet1 === 'saturn' || a.planet2 === 'saturn',
  );
  const saturnHardAspects = saturnAspects.filter(
    a => a.type === 'square' || a.type === 'opposition',
  );
  const saturnSoftAspects = saturnAspects.filter(
    a => a.type === 'trine' || a.type === 'sextile',
  );
  const saturnConjunctions = saturnAspects.filter(
    a => a.type === 'conjunction',
  );

  // ── P1: COVER ─────────────────────────────────────────────
  renderCover(
    doc,
    'Saturn Return Report',
    saturnReturn.returnNumber !== 'between'
      ? `Your ${saturnReturn.returnNumber === 1 ? 'First' : 'Second'} Saturn Return`
      : 'The Saturn Return — Your Defining Passage',
    options,
    '♄',
  );

  // ── P2: OVERVIEW ──────────────────────────────────────────
  doc.addPage();
  let y = 30;
  y = addSectionTitle(doc, 'What Is a Saturn Return — and Why It Matters', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Every 29.5 years, Saturn completes one full orbit of the Sun and returns to the exact degree it occupied at the moment of your birth. This is the Saturn Return — a period lasting roughly two to three years during which Saturn acts as a cosmic auditor, reviewing everything you have built, become, or avoided.`, margin, y, 170);
  y += 5;
  y = wrapText(doc, `The first Saturn Return arrives between ages 27 and 30. It marks the end of the extended adolescence that modern life has created and the beginning of genuine adult authorship. The second arrives between ages 57 and 60, asking a different but equally profound question: have you built a life that belongs to you — or have you spent decades fulfilling a script written by others?`, margin, y, 170);
  y += 5;
  y = wrapText(doc, `Saturn does not destroy what is real. It reveals what was never real to begin with. Relationships, careers, beliefs, identities — anything that has been built on borrowed expectations, external pressure, or the avoidance of a deeper truth will crack under Saturn's review. This is not punishment. It is accuracy.`, margin, y, 170);
  y += 5;
  y = wrapText(doc, `What survives the Saturn Return is stronger for having been tested. What falls away — though it often feels like loss — is usually the heaviest thing you were carrying. The people who move through Saturn Returns consciously, rather than reactively, tend to emerge with a clarity of direction, an authenticity of identity, and a sense of purpose that was simply not available to them before.`, margin, y, 170);
  y += 8;

  y = addSubTitle(doc, `Your Saturn Return — Where You Stand Now`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  let returnContext = '';
  if (saturnReturn.returnNumber === 1) {
    returnContext = `At ${saturnReturn.age}, you are in or near your first Saturn Return (peak: around age 29). This is the great transition into adult authorship — the moment Saturn asks whether the life you are living is actually yours. Everything you built in your twenties is now being assessed: is it genuine, is it sustainable, does it belong to who you truly are? The structures that hold up deserve to be kept. Those that collapse are clearing the way for something more honest.`;
  } else if (saturnReturn.returnNumber === 2) {
    returnContext = `At ${saturnReturn.age}, you are in or near your second Saturn Return (peak: around age 59). Where the first return asked "who am I?", this one asks "what have I actually built, and does it matter to me?" The second return is less about identity formation and more about legacy — a reckoning with the gap between the life that was possible and the life that was lived, along with a genuine opportunity to close that gap before the final third of life begins.`;
  } else {
    const nextYear = saturnReturn.approximateYear;
    returnContext = `At ${saturnReturn.age}, you are not currently in the heart of a Saturn Return, but you are ${saturnReturn.description} (expected around ${nextYear}). Understanding your natal Saturn now — its placement, its lessons, and what it has been asking of you — allows you to meet that period with preparation rather than surprise. Saturn rewards those who have done the groundwork.`;
  }
  y = wrapText(doc, returnContext, margin, y, 170);

  // ── P3: NATAL SATURN — HOUSE + SIGN ───────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `♄ Your Natal Saturn — ${SIGN_SYMBOLS[satSign]} ${signNames[satSign]}, House ${satHouse}`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Your natal Saturn is the blueprint of the lesson you came here to master. It is not a limitation imposed on you — it is the precise location of your most significant growth. The sign describes the quality of the lesson; the house describes the arena of life where it plays out most intensely.`, margin, y, 170);
  y += 7;

  y = addSubTitle(doc, `Saturn in ${signNames[satSign]} — The Karmic Structure`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const satSignTextEN = SATURN_IN_SIGN_EN[satSign] || `Saturn in ${signNames[satSign]}: your karmic structure carries the quality of this sign.`;
  y = wrapText(doc, satSignTextEN, margin, y, 170);
  y += 7;

  y = addSubTitle(doc, `Saturn in House ${satHouse} — The Arena`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  // Use locale-aware texts if available, otherwise fall back to the imported English array
  const satHouseTexts = texts.SATURN_IN_HOUSE?.length === 12 ? texts.SATURN_IN_HOUSE : SATURN_IN_HOUSE;
  const satHouseText  = satHouseTexts[satHouse - 1] || `Saturn in House ${satHouse} brings structure and responsibility to this area of life.`;
  y = wrapText(doc, satHouseText, margin, y, 170);
  y += 7;

  y = addSubTitle(doc, 'The Lesson You Came to Master', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Saturn in House ${satHouse} in ${signNames[satSign]} means that the central work of your life involves bringing ${signNames[satSign]}'s energy — with all its discipline, honesty, and long-game thinking — to bear on the matters of House ${satHouse}. This is not a curse. It is a calling. The people who have done the most meaningful work in exactly the area defined by this placement are the ones who stopped resisting it and began taking it seriously.`, margin, y, 170);

  // ── TRYOUT CUT after page 3 (cover + overview + natal Saturn) ──
  const tryout = tryoutCut(doc, options, 'Saturn Return Report', '29.90');
  if (tryout) return tryout;

  // ── P4: SATURN'S HOUSE — AREA OF RESTRUCTURING ────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `House ${satHouse} — The Area Being Restructured`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `During the Saturn Return, the house where Saturn lives in your natal chart becomes the primary theater of transformation. This is not where things are merely "challenging" — this is where the deepest reorganization of your life is taking place. The work here is not optional; it is the work Saturn has been preparing you for since birth.`, margin, y, 170);
  y += 7;

  y = addSubTitle(doc, `What House ${satHouse} Governs`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const houseGovernsTexts: Record<number, string> = {
    1:  'The self — identity, body, appearance, and the way you arrive in the world.',
    2:  'Resources — money, possessions, talents, and what you believe you are worth.',
    3:  'Communication — how you think, speak, learn, and connect with your immediate environment.',
    4:  'Roots — home, family of origin, emotional foundations, and the private self.',
    5:  'Expression — creativity, romance, children, and the courage to be seen.',
    6:  'Service — daily work, health, habits, and the routines that either sustain or undermine you.',
    7:  'Partnership — committed relationships, contracts, and the mirror of the other.',
    8:  'Transformation — shared resources, intimacy, loss, and psychological depth.',
    9:  'Meaning — philosophy, higher education, travel, and the beliefs you live by.',
    10: 'Career — vocation, public reputation, and the legacy you are building.',
    11: 'Community — friendships, collective causes, and the future you are working toward.',
    12: 'Depth — the unconscious, the hidden, and the integration of what has been avoided.',
  };
  y = wrapText(doc, houseGovernsTexts[satHouse] || `House ${satHouse} covers the essential themes of this sector of life.`, margin, y, 170);
  y += 7;

  y = addSubTitle(doc, `What the Saturn Return Is Asking of House ${satHouse}`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const houseReturnAsks: Record<number, string> = {
    1:  'The Return is asking you to take full responsibility for who you are — not who you were raised to be, not who others need you to be, but who you actually are when no one is managing you. This is the moment to stop apologizing for your presence and start inhabiting it with full authority.',
    2:  'The Return is asking you to build genuine financial and psychological security — and to examine the beliefs about worth that have been running your relationship with resources without your conscious direction. What do you actually value? What do you actually deserve? These are not rhetorical questions.',
    3:  'The Return is asking you to develop the precision and depth that distinguish real expertise from the appearance of knowledge. It may also surface unresolved dynamics with siblings or close environment that have shaped your voice in ways you have not yet examined.',
    4:  'The Return is asking you to become your own emotional foundation — to stop waiting for a family, a relationship, or a home to provide the sense of security that ultimately only you can build for yourself. This is often among the most emotionally demanding asks Saturn makes.',
    5:  'The Return is asking whether your creative life and romantic life are genuinely yours, or whether they have been shaped by what you thought was expected or permissible. The invitation is to claim your own voice, your own desire, your own joy — without audition.',
    6:  'The Return is asking you to build a daily life that actually sustains the person you are becoming. Unsustainable habits, overwork that looks like virtue, and health matters that have been deferred are all being brought to account. How you show up every day matters as much as what you are reaching for.',
    7:  'The Return is asking you to move from relationship patterns inherited or reactive into genuine partnership — chosen, structured, and honest. Relationships that are not built on authentic foundation tend to come to a reckoning here. Those that are real tend to deepen significantly.',
    8:  'The Return is asking you to release what you have been holding onto as security but that is actually holding you back — whether financial, psychological, or relational. Genuine transformation requires letting something die. Saturn in House 8 makes this unavoidable.',
    9:  'The Return is asking you to distinguish between the beliefs you were given and the ones you have actually tested and found to hold. It may involve a reckoning with education, with religion or spirituality, or with the gap between your philosophy of life and how you actually live.',
    10: 'The Return is asking you to take serious, decisive ownership of your professional direction. What are you building? Is it yours? Does it matter to you? The career restructuring that happens during this period, though often disruptive, tends to be the most meaningful redirection you will experience.',
    11: 'The Return is asking you to be honest about your relationships with groups and the future you are working toward. Friendships and communities that are based on who you used to be may naturally thin. New ones — built around who you actually are — become possible.',
    12: 'The Return is asking you to face what you have been avoiding — the interior material that has been running your life quietly without your authorization. This is shadow work in the most literal sense, and Saturn here will not allow it to be indefinitely deferred.',
  };
  y = wrapText(doc, houseReturnAsks[satHouse] || `Saturn in House ${satHouse} is asking you to take full responsibility for the themes of this area.`, margin, y, 170);

  // ── P5: SATURN ASPECTS ────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, '♄ Saturn Aspects — How the Lesson Connects', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `The aspects Saturn forms with other planets in your natal chart show how your Saturnian lesson intersects with other core energies in your psyche. Conjunctions intensify and merge; trines and sextiles create flow and support; squares and oppositions create productive friction — the kind that generates real growth when engaged consciously rather than avoided.`, margin, y, 170);
  y += 7;

  if (saturnConjunctions.length > 0) {
    y = addSubTitle(doc, 'Saturn Conjunctions — Merged Energies', y, margin);
    for (const asp of saturnConjunctions.slice(0, 3)) {
      y = checkPage(doc, y);
      const other = asp.planet1 === 'saturn' ? asp.planet2 : asp.planet1;
      const otherName = PLANET_NAMES_EN[other] || other;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.brand);
      doc.text(`Saturn ☌ ${otherName}`, margin, y);
      y += 5;
      const interp = getAspectInterpretation('saturn', other, 'conjunction')
        || getAspectInterpretation(other, 'saturn', 'conjunction')
        || `Saturn conjunct ${otherName}: these two energies are fused in your chart, creating a particularly concentrated expression of their combined themes.`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, interp, margin, y, 170);
      y += 5;
    }
    y += 3;
  }

  if (saturnHardAspects.length > 0) {
    y = checkPage(doc, y);
    y = addSubTitle(doc, 'Saturn Squares & Oppositions — Productive Friction', y, margin);
    for (const asp of saturnHardAspects.slice(0, 3)) {
      y = checkPage(doc, y);
      const other = asp.planet1 === 'saturn' ? asp.planet2 : asp.planet1;
      const otherName = PLANET_NAMES_EN[other] || other;
      const symbol = asp.type === 'square' ? '□' : '☍';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.red);
      doc.text(`Saturn ${symbol} ${otherName}`, margin, y);
      y += 5;
      const interp = getAspectInterpretation('saturn', other, asp.type)
        || getAspectInterpretation(other, 'saturn', asp.type)
        || `Saturn ${asp.type} ${otherName}: a tension that, engaged honestly, becomes one of the most productive dynamics in your chart.`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, interp, margin, y, 170);
      y += 5;
    }
    y += 3;
  }

  if (saturnSoftAspects.length > 0) {
    y = checkPage(doc, y);
    y = addSubTitle(doc, 'Saturn Trines & Sextiles — Structural Gifts', y, margin);
    for (const asp of saturnSoftAspects.slice(0, 2)) {
      y = checkPage(doc, y);
      const other = asp.planet1 === 'saturn' ? asp.planet2 : asp.planet1;
      const otherName = PLANET_NAMES_EN[other] || other;
      const symbol = asp.type === 'trine' ? '△' : '✶';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.brand);
      doc.text(`Saturn ${symbol} ${otherName}`, margin, y);
      y += 5;
      const interp = getAspectInterpretation('saturn', other, asp.type)
        || getAspectInterpretation(other, 'saturn', asp.type)
        || `Saturn ${asp.type} ${otherName}: a structural support in your chart — discipline and ${otherName}'s energy work together with natural ease.`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, interp, margin, y, 170);
      y += 5;
    }
  }

  if (saturnAspects.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Saturn forms no major aspects within standard orbs in your natal chart. This is unusual and significant: it suggests Saturn operates as a relatively isolated, self-contained energy — perhaps more difficult to access consciously, but also less entangled with other planetary dynamics. During the Saturn Return, this isolation tends to become more apparent as the themes of House ${satHouse} press forward without the context of other planetary energies to soften or complicate them.`, margin, y, 170);
  }

  // ── P6: WHAT SATURN DEMANDS ───────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `What Saturn Demands of You — ${signNames[satSign]}`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Saturn's demands are not arbitrary. They are precisely calibrated to the sign it occupies — the specific quality of discipline, maturity, and honest effort that your particular configuration of Saturn requires. These are not suggestions. They are, in a very real sense, the terms of the deal that Saturn offers: do this work, and the rewards are commensurate. Avoid it, and the same themes will return in each cycle with increasing urgency.`, margin, y, 170);
  y += 7;

  y = addSubTitle(doc, `Saturn in ${signNames[satSign]} Asks You To:`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, SATURN_DEMANDS[satSign] || `Engage with the full discipline of ${signNames[satSign]}'s energy — honestly, patiently, and over the long term.`, margin, y, 170);
  y += 8;

  y = addSubTitle(doc, 'In Practical Terms — What This Looks Like', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const practicalDemands: Record<number, string> = {
    0:  'Pick the direction that requires genuine courage — not the calculated safe move. Then sustain it past the point where the excitement of novelty fades. Saturn in Aries will not respect the half-started project.',
    1:  'Do the financial review you have been deferring. Create the structure you have been saying you will create "when things settle." Saturn in Taurus knows things never just settle — you build the stability or you do not.',
    2:  'Choose one area of genuine expertise and develop it seriously. Stop spreading your intelligence across too many surfaces. Saturn in Gemini is asking for depth, not range.',
    3:  'Address the emotional inheritance honestly — in therapy, in journaling, in deliberate conversation. The family patterns that run your emotional life will not become visible on their own.',
    4:  'Make the creative or romantic declaration you have been postponing. Show the work you have been making privately. Claim the desire you have been qualifying. Saturn in Leo is asking for authenticity, not performance.',
    5:  'Build the health and work routines that you know you need but keep negotiating out of. Saturn in Virgo will not accept indefinite negotiation.',
    6:  'Have the direct conversation in the relationship that you have been managing around. State your actual position. Saturn in Libra is asking for honesty, not diplomatic avoidance.',
    7:  'Face the thing you have been avoiding — in therapy, in journal, in honest conversation with yourself. Saturn in Scorpio will not let it stay buried indefinitely.',
    8:  'Commit to the educational or philosophical direction that actually calls you, rather than the one that is most socially legible. Saturn in Sagittarius is asking for your genuine search, not an approved one.',
    9:  'Make the career decision that is actually yours. Not the one that inherits the script of family expectation or institutional approval. Saturn in Capricorn can build anything — but it needs to be building toward something that genuinely matters to you.',
    10: 'Build the system, the organization, the network, the body of work — not in your head, but in the world. Saturn in Aquarius is asking for implementation, not vision.',
    11: 'Create the daily structure that makes your creative or spiritual life sustainable — not as inspiration permits, but as commitment requires. Saturn in Pisces is asking for practice, not transcendence.',
  };
  y = wrapText(doc, practicalDemands[satSign] || `Saturn in ${signNames[satSign]} in House ${satHouse} requires specific, concrete engagement with these themes.`, margin, y, 170);

  // ── P7: WHAT SATURN REWARDS ───────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `What Saturn Rewards — After the Work Is Done`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Saturn has a reputation as the "Great Malefic" — the planet of loss, hardship, and limitation. This reputation is earned, but it is incomplete. Saturn is equally the planet of reward. The rewards are not accidental or arbitrary: they are precisely proportional to the quality of work that was done. Saturn does not give gifts — it gives returns on genuine investment.`, margin, y, 170);
  y += 7;

  y = addSubTitle(doc, `Saturn in ${signNames[satSign]} — What Becomes Available`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, SATURN_REWARDS[satSign] || `After the work of ${signNames[satSign]} is genuinely engaged, Saturn returns authority, credibility, and the particular satisfaction that only comes from having earned something real.`, margin, y, 170);
  y += 8;

  y = addSubTitle(doc, 'The Specific Gifts of Your Configuration', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const specificGifts: Record<number, string> = {
    1:  'As Saturn in Aries matures, the impulsive energy that once created chaos becomes focused, directed force. You become someone who can begin what others cannot start and finish what others abandon. The authority that was impossible to fake in your youth becomes real, because it is earned.',
    2:  'As Saturn in Taurus matures, the anxiety about scarcity becomes mastery of resource. You become someone who knows the real value of things — who builds wealth, security, and beauty not through luck but through the patient application of genuine judgment. The financial and psychological ground you build here is among the most stable that any Saturn placement can generate.',
    3:  'As Saturn in Gemini matures, the restless, scattered mind becomes a precision instrument. You develop an intellectual authority — the credibility of genuine depth — that is rare in a culture that rewards breadth. The writing, teaching, or communication work you do from this foundation carries weight because it has been earned word by word.',
    4:  'As Saturn in Cancer matures, the emotional walls built for protection become boundaries built from self-knowledge. You become capable of extraordinary emotional resilience — someone who can hold space for others because you have done the work of creating that space for yourself first. The home you build — inner and outer — becomes a genuine foundation.',
    5:  'As Saturn in Leo matures, the need for external validation transforms into authentic self-regard. The creative work you produce from this foundation tends to be among the most enduring you will make — because it is grounded in genuine craft rather than the need for applause. The recognition, when it arrives, reflects something real.',
    6:  'As Saturn in Virgo matures, the perfectionism that paralyzed becomes the standard of excellence that inspires. You develop a mastery of craft — in whatever domain you have chosen to apply it — that others can only approximate. The routines you have built become the structural foundation of a life that actually functions.',
    7:  'As Saturn in Libra matures, the diplomatic evasion transforms into genuine fairness — the courage to say the true thing even when it disrupts the peace. Partnerships built or rebuilt from this foundation tend to be among the most equitable and durable. You become someone others trust to tell them the truth.',
    8:  'As Saturn in Scorpio matures, the fear of losing control transforms into genuine psychological power — the ability to transform situations that would destroy others. You become someone who has faced the dark and returned from it, and this depth of experience creates a credibility and presence that is almost impossible to fake.',
    9:  'As Saturn in Sagittarius matures, the borrowed ideology becomes personal philosophy — tested, revised, and genuinely inhabited. You become someone who teaches from lived experience rather than received doctrine. The credibility this generates is among the most durable that any placement can produce: you know what you know because you have lived it.',
    10: 'As Saturn in Capricorn matures, the relentless striving for achievement transforms into purposeful legacy. The structures, institutions, or bodies of work that you build from this foundation tend to outlast you. You become someone whose work matters — not because the world said so, but because you built it to last.',
    11: 'As Saturn in Aquarius matures, the original ideas that once remained in the realm of vision begin to take form in the world as real structures that serve real people. You become someone who builds what others only imagine. The systems and networks you create from this foundation carry your particular intelligence into the world in a form that can outlast your direct involvement.',
    12: 'As Saturn in Pisces matures, the spiritual life that was once a refuge from reality becomes a practice that makes you more capable of engaging with reality. The daily disciplines of contemplation, creativity, or service that you build here generate a depth of peace and wisdom that others can feel in your presence — not because you project it, but because it has become structural.',
  };
  y = wrapText(doc, specificGifts[satSign] || `Saturn in ${signNames[satSign]} in House ${satHouse} rewards genuine, sustained engagement with these themes with authority, depth, and lasting accomplishment.`, margin, y, 170);

  // ── P8: HOUSES SATURN RULES ───────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, 'The Houses Saturn Rules — Areas Activated', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Beyond its natal position, Saturn governs the houses in your chart whose cusps fall in Capricorn or Aquarius. These areas receive Saturn's structuring influence as a matter of governance — they are the domains of life that Saturn oversees, whether or not it occupies them directly. During the Saturn Return, these houses come alive as secondary theaters of restructuring.`, margin, y, 170);
  y += 7;

  if (saturnRuled.length > 0) {
    for (const houseNum of saturnRuled) {
      y = checkPage(doc, y);
      y = addSubTitle(doc, `House ${houseNum} — Under Saturn's Governance`, y, margin);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      const ruleText = SATURN_RULED_HOUSE_TEXTS[houseNum]
        || `House ${houseNum} falls under Saturn's rulership in your chart. During the Return, the themes of this house are activated alongside your natal Saturn placement.`;
      y = wrapText(doc, ruleText, margin, y, 170);
      y += 6;
    }
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `In your chart, no house cusps fall in Capricorn or Aquarius, which means Saturn's governance is concentrated in its natal house rather than distributed across multiple domains. This tends to focus the Saturn Return's energy intensely in the themes of House ${satHouse}, making the work there all the more concentrated and unavoidable.`, margin, y, 170);
  }
  y += 5;
  y = checkPage(doc, y);
  y = addSubTitle(doc, 'How These Areas Work Together', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const houseList = saturnRuled.length > 0
    ? `Houses ${saturnRuled.join(' and ')} — alongside House ${satHouse} where Saturn lives — form`
    : `House ${satHouse}`;
  y = wrapText(doc, `${houseList} the primary field of Saturn's work in your chart. Pay attention to how events in these areas seem to cluster and interrelate during the Return period. They are not isolated — Saturn is working across all of them simultaneously, creating a reorganization of your life that is more integrated than it first appears.`, margin, y, 170);

  // ── P9: PRACTICAL GUIDANCE ────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, 'Practical Guidance for Navigating the Return', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `The Saturn Return is not something that happens to you — it is something you either navigate consciously or experience reactively. The difference between those two modes is significant. Both paths involve difficulty; only one of them produces the clarity and direction that define the other side of a well-navigated return.`, margin, y, 170);
  y += 7;

  const guidanceSections = [
    {
      title: 'Audit Before Saturn Does',
      text: `Saturn will audit your life during the Return whether you cooperate or not. The difference is whether you do it on your terms or on its. Spend time — seriously and honestly — examining what you have built so far: relationships, career direction, financial structure, daily habits, beliefs you have been living by. Ask, for each: is this genuinely mine? Is this built on something real? Does this serve who I am actually becoming? The answers will be uncomfortable and instructive.`,
    },
    {
      title: 'Lean Into the Restructuring',
      text: `When the Saturn Return creates disruption — and it will — the instinct is to restore what existed before as quickly as possible. Resist this instinct. The disruption is not arbitrary; it is diagnostic. What falls apart during a Saturn Return was not stable — it only appeared stable. The energy that has been freed by its dissolution is available for building something more honest in its place. Give yourself the time to feel the loss before rushing to fill the space.`,
    },
    {
      title: `Specifically for Saturn in House ${satHouse}`,
      text: houseReturnAsks[satHouse] || `The specific work of House ${satHouse} is where the most direct and urgent action is required. This is not an area to defer, minimize, or manage from a distance. Saturn in House ${satHouse} is asking for your full presence and genuine engagement.`,
    },
    {
      title: 'Work With Time, Not Against It',
      text: `Saturn rules time. One of its most reliable lessons is that genuine things take the time they take — and that trying to compress or circumvent that timeline produces either collapse or a structure that will not hold. The Saturn Return is not a sprint. It spans two to three years for good reason. Sustainable change requires that long. Work with the pace Saturn sets.`,
    },
    {
      title: 'Get Support',
      text: `The Saturn Return is one of the periods in life where working with a therapist, a coach, a mentor, or at minimum a trusted friend who can reflect honestly is most valuable. Saturn asks for self-knowledge, and self-knowledge has limits when pursued entirely alone. The people who navigate returns most effectively tend to be those who find a container — therapeutic, communal, or mentored — in which to do the work.`,
    },
  ];

  for (const section of guidanceSections) {
    y = checkPage(doc, y);
    y = addSubTitle(doc, section.title, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, section.text, margin, y, 170);
    y += 6;
  }

  // ── P10: TIMELINE AND PHASES ──────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, 'Timeline and Phases of the Saturn Return', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `The Saturn Return does not arrive as a single event. It unfolds in phases over approximately two to three years, with Saturn typically stationing retrograde and direct multiple times over the natal degree. Understanding the rhythm of this transit helps you work with it intentionally rather than react to each phase in isolation.`, margin, y, 170);
  y += 7;

  const phases = [
    {
      name: 'Phase 1 — First Contact (Saturn approaches natal degree)',
      text: `Saturn begins to conjunct its natal position. Themes of House ${satHouse} and the lessons of ${signNames[satSign]} start pressing forward in your life with unusual insistence. This phase often generates a sense of urgency, incompleteness, or pressure — as if time has stopped being abstract and become genuinely finite. Events in this phase are rarely random: they are precisely targeted at whatever in your life has needed attention longest.`,
    },
    {
      name: 'Phase 2 — The Station (Saturn stationary at natal degree)',
      text: `When Saturn stations — appears to stop moving and then turn retrograde — directly on or near your natal Saturn, the intensity peaks. This is the moment of maximum pressure and maximum clarity. The questions that have been forming in Phase 1 are now impossible to avoid. This is also the phase where the most significant decisions tend to be made — or are forced by circumstance.`,
    },
    {
      name: 'Phase 3 — Retrograde Review (Saturn retrograde back over natal degree)',
      text: `As Saturn moves retrograde over the natal degree, the themes it activated in Phases 1 and 2 enter a period of review and integration. What was initiated needs to be reconsidered; what was decided needs to be tested. This phase can feel like regression, but it is usually refinement. The work done here tends to be less visible and more internal — essential preparation for what comes next.`,
    },
    {
      name: 'Phase 4 — Direct Resolution (Saturn direct over natal degree for the final time)',
      text: `Saturn stations direct and makes its final pass over the natal degree. This is the completion phase — the period in which the decisions made during the return are implemented, the structures begun during the return take their final form, and the lessons of the period become accessible as something genuinely learned rather than merely endured. Life after this phase feels qualitatively different: more deliberate, more grounded, more clearly yours.`,
    },
    {
      name: 'After the Return — Integration',
      text: `The two to three years following the Return proper are a period of living into what was built or rebuilt. The energy is less pressured and more constructive. Saturn moves into the next sign and the next house, carrying its lessons forward but no longer auditing the specific degree where it was born. The clarity earned during the Return begins to compound: decisions made from a more honest foundation tend to generate more aligned outcomes over time.`,
    },
  ];

  for (const phase of phases) {
    y = checkPage(doc, y);
    y = addSubTitle(doc, phase.name, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, phase.text, margin, y, 170);
    y += 6;
  }

  // ── P11: FIRST vs SECOND RETURN — CONTEXTUAL PAGE ─────────
  doc.addPage();
  y = 30;

  if (saturnReturn.returnNumber === 1 || saturnReturn.returnNumber === 'between') {
    y = addSectionTitle(doc, 'The First Saturn Return — Ages 27–30', y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);

    y = wrapText(doc, `The first Saturn Return is the end of adolescence — not the conventional adolescence of the teen years, but the extended one that modern life has created, in which people in their twenties are still largely experimenting, borrowing identities, and deferring the moment of genuine adult commitment.`, margin, y, 170);
    y += 5;
    y = wrapText(doc, `At the first return, Saturn asks a deceptively simple question: is the life you are living actually yours? Not the career you inherited from family expectation, not the relationship you stayed in because leaving required facing the unknown, not the city you live in because it was where you happened to land — but your actual life, chosen by the person you have become.`, margin, y, 170);
    y += 5;
    y = wrapText(doc, `The disruptions common at the first return — career pivots, relationship endings or deepenings, relocations, identity crises — are Saturn doing exactly what it is designed to do: revealing what was built on borrowed ground so that you can build on your own. The people who emerge from the first return with the most clarity are generally those who were willing to let something fall that needed to fall.`, margin, y, 170);
    y += 7;
    y = addSubTitle(doc, `What to Expect Specifically for Saturn in ${signNames[satSign]}, House ${satHouse}`, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Your first return focuses the themes of ${signNames[satSign]} and House ${satHouse} with unusual intensity. The work that was avoided or deferred in these areas will surface now — not as punishment, but as the precise timing of a lesson that was always meant to arrive at this moment. The more honestly and directly you engage with it, the more decisively the return resolves.`, margin, y, 170);
    y += 7;
    y = addSubTitle(doc, 'The Second Saturn Return — Ages 57–60', y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `If the first return asked "who am I?", the second asks "what have I actually built, and is it genuinely mine?" At the second return, the stakes feel different — there is a deeper awareness of time, a more honest reckoning with the gap between the life that was possible and the life that was lived. But the second return is not predominantly a period of regret. It is a period of honest accounting and genuine redirection — the last major structural renovation before the final third of life begins.`, margin, y, 170);
  } else {
    // Second return context
    y = addSectionTitle(doc, 'The Second Saturn Return — Ages 57–60', y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);

    y = wrapText(doc, `The second Saturn Return arrives with a different quality than the first. Where the first return was primarily about building an authentic adult identity — establishing who you actually are and what you are genuinely building — the second is a reckoning with what that building has produced.`, margin, y, 170);
    y += 5;
    y = wrapText(doc, `At the second return, Saturn asks a more layered question: have I built a life that belongs to me? Not just a career or a family or a residence, but a life — one that reflects genuine values, genuine choices, and genuine contributions rather than the accumulated weight of obligation and inertia.`, margin, y, 170);
    y += 5;
    y = wrapText(doc, `The second return often surfaces what was not addressed at the first. Patterns that were manageable in the thirties and forties tend to become less manageable by the late fifties — not because they have gotten worse, but because Saturn has less patience for indefinite deferral.`, margin, y, 170);
    y += 7;
    y = addSubTitle(doc, `What the Second Return Offers`, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `The second return is also genuinely an offer: to redesign whatever needs redesigning before the final third of life begins. The people who navigate the second return most effectively tend to be those who approach it as a creative brief rather than a judgment — a genuinely open invitation to close the gap between the life that was possible and the life that was lived. This is still achievable. Saturn would not ask if it were not.`, margin, y, 170);
    y += 7;
    y = addSubTitle(doc, `For Saturn in ${signNames[satSign]}, House ${satHouse}`, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Your second return revisits the themes of ${signNames[satSign]} and House ${satHouse} with the additional context of everything that has been built — and not built — in the thirty years since the first return. What was initiated then and sustained with integrity will be recognized and deepened. What was deferred will be called due. The precision of Saturn's accounting at the second return is remarkable.`, margin, y, 170);
  }

  // ── P12: CONCLUSION ───────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, 'Conclusion — After the Return: Who You Become', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `${options.profileName}, this report has traced the specific contours of your Saturn Return: the natal placement in ${signNames[satSign]} in House ${satHouse} that defines the lesson, the aspects that show how it connects to other energies in your chart, the demands and rewards of the work, and the timeline and phases through which the return unfolds.`, margin, y, 170);
  y += 5;

  y = wrapText(doc, `The Saturn Return does not make you a different person. It makes you more fully the person you already are — with the borrowed elements stripped away and the genuine elements more legible. What emerges from a well-navigated return is not a new identity but a clarified one: the same person, with less confusion about who that person actually is and what they are actually here to build.`, margin, y, 170);
  y += 5;

  y = wrapText(doc, `Saturn in ${signNames[satSign]} in House ${satHouse} has been your companion since birth — the planet that sets the terms of your most important lesson. The Return is the moment when those terms become non-negotiable. Everything that has been theoretically understood now needs to be structurally inhabited. The work is real. The rewards are real. And the person who emerges on the other side of genuine Saturn work is someone who can say — with the particular authority that only comes from having done the thing that was difficult — that they built something that belongs to them.`, margin, y, 170);
  y += 8;

  // Summary of key facts
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.4);
  doc.line(margin, y, 190, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.brand);
  doc.text('Your Saturn Return at a Glance', margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const glanceItems = [
    `Natal Saturn: ${SIGN_SYMBOLS[satSign]} ${signNames[satSign]}, House ${satHouse}`,
    `Saturn Return: ${saturnReturn.returnNumber !== 'between' ? (saturnReturn.returnNumber === 1 ? '1st' : '2nd') + ` (peak ~age ${saturnReturn.returnNumber === 1 ? 29 : 59})` : 'Upcoming'}`,
    `Karmic Lesson: ${SATURN_IN_SIGN_EN[satSign]?.split('.')[0] || signNames[satSign]}`,
    `Primary Demand: ${SATURN_DEMANDS[satSign]?.split('.')[0] || 'Engage with Saturn\'s discipline honestly'}`,
    `Core Reward: ${SATURN_REWARDS[satSign]?.split('.')[0] || 'Authority and earned credibility'}`,
    saturnRuled.length > 0 ? `Saturn Also Rules: House${saturnRuled.length > 1 ? 's' : ''} ${saturnRuled.join(', ')}` : `Saturn's governance is concentrated in House ${satHouse}`,
    `Saturn Aspects in Chart: ${saturnAspects.length} (${saturnHardAspects.length} challenging, ${saturnSoftAspects.length} supportive)`,
  ];
  for (const item of glanceItems) {
    y = wrapText(doc, `• ${item}`, margin, y, 170);
    y += 4;
  }

  y += 6;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('"We are not given a good life or a bad life. We are given a life — and it is up to us to make it good or bad." — Warden', margin, y);

  addFooters(doc, options.profileName);
  return doc.output('blob') as unknown as Blob;
}
