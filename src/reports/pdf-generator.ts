// ============================================================
// PDF-GENERATOR.TS — Professional PDF Report Generator
// Uses jsPDF to create astrology reports client-side
// Style inspired by astro.com sample PDFs
// ============================================================

import { jsPDF } from 'jspdf';
import type { NatalChart } from '../engine/types';
import { getSignIndex, getDegreeInSign, formatDegMin } from '../engine/calculations';
import { generateFullReport, type FullReport, type ThemeSynthesis } from '../engine/synthesis';
import { renderWheel } from '../renderer/wheel';
import { getInterpretations } from '../engine/interpretations/index';
import { getAspectInterpretation, ASPECT_NATURE } from '../engine/aspect-interpretations';

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  brand: [107, 33, 168] as [number, number, number],      // Purple
  brandLight: [139, 92, 246] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  textLight: [100, 100, 100] as [number, number, number],
  fire: [204, 0, 0] as [number, number, number],
  earth: [0, 102, 0] as [number, number, number],
  air: [0, 0, 204] as [number, number, number],
  water: [204, 102, 0] as [number, number, number],
  line: [200, 200, 200] as [number, number, number],
  bg: [250, 250, 255] as [number, number, number],
};

const SIGN_NAMES_PT = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SIGN_NAMES_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const ELEMENT_COLORS_IDX = [COLORS.fire, COLORS.earth, COLORS.air, COLORS.water, COLORS.fire, COLORS.earth, COLORS.air, COLORS.water, COLORS.fire, COLORS.earth, COLORS.air, COLORS.water];

const PLANET_NAMES_PT: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte', chiron: 'Quíron', lilith: 'Lilith',
};
const PLANET_NAMES_EN: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  northNode: 'North Node', chiron: 'Chiron', lilith: 'Lilith',
};
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷', lilith: '⚸',
};

// ============================================================
// MAIN GENERATOR
// ============================================================

export interface PdfOptions {
  locale: string;
  isTryout: boolean;       // If true, only generate first 3 pages + watermark
  profileName: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
}

/**
 * Generate a Natal Chart PDF report
 * Returns the PDF as Blob for download
 */
export function generateNatalPdf(chart: NatalChart, options: PdfOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const isEN = options.locale === 'en';
  const texts = getInterpretations(options.locale);
  const planetNames = texts.PLANET_NAMES;
  const signNames = texts.SIGN_NAMES;

  // ======= PAGE 1: COVER =======
  renderCoverPage(doc, options, isEN);

  // ======= PAGE 2: NATAL WHEEL CHART =======
  doc.addPage();
  renderWheelPage(doc, chart, isEN);

  // ======= PAGE 3: POSITIONS TABLE =======
  doc.addPage();
  renderPositionsPage(doc, chart, planetNames, signNames, isEN);

  // ======= PAGE 3: HOUSES =======
  doc.addPage();
  renderHousesPage(doc, chart, signNames, isEN);

  // If try-out, add watermark and stop here
  if (options.isTryout) {
    addTryoutWatermark(doc);
    addTryoutEndPage(doc, isEN);
  } else {
    // Full version: interpretation pages using synthesis engine
    const report = generateFullReport(chart);

    // Page 4: Visão Geral Narrativa (overview do synthesis)
    doc.addPage();
    renderSynthesisOverviewPage(doc, report, isEN);

    // Page 5: Top 5 Potenciais + Top 5 Desafios
    doc.addPage();
    renderTopPotentialsAndChallenges(doc, chart, report, texts, isEN);

    // Page 6: Sol — interpretação na casa
    const sunPos = chart.positions.sun;
    if (sunPos) {
      const sunHouse = chart.planetHouses.sun || 1;
      const sunSign = getSignIndex(sunPos.longitude);
      doc.addPage();
      renderPlanetPage(doc, {
        symbol: '☉', nameEN: 'Sun', namePT: 'Sol',
        subtitleEN: 'Your solar essence — identity, purpose and vital energy',
        subtitlePT: 'Sua essência solar — identidade, propósito e energia vital',
        house: sunHouse, signIndex: sunSign,
        text: texts.SUN_IN_HOUSE[sunHouse - 1] || '',
        isRetrograde: sunPos.isRetrograde,
      }, signNames, isEN);
    }

    // Page 6: Lua — interpretação na casa
    const moonPos = chart.positions.moon;
    if (moonPos) {
      const moonHouse = chart.planetHouses.moon || 1;
      const moonSign = getSignIndex(moonPos.longitude);
      doc.addPage();
      renderPlanetPage(doc, {
        symbol: '☽', nameEN: 'Moon', namePT: 'Lua',
        subtitleEN: 'Your emotional world — needs, instincts and inner security',
        subtitlePT: 'Seu mundo emocional — necessidades, instintos e segurança interior',
        house: moonHouse, signIndex: moonSign,
        text: texts.MOON_IN_HOUSE[moonHouse - 1] || '',
        isRetrograde: moonPos.isRetrograde,
      }, signNames, isEN);
    }

    // Page 7: Mercúrio — interpretação na casa
    const mercPos = chart.positions.mercury;
    if (mercPos) {
      const mercHouse = chart.planetHouses.mercury || 1;
      const mercSign = getSignIndex(mercPos.longitude);
      doc.addPage();
      renderPlanetPage(doc, {
        symbol: '☿', nameEN: 'Mercury', namePT: 'Mercúrio',
        subtitleEN: 'Your mind and communication — how you think, learn and express',
        subtitlePT: 'Sua mente e comunicação — como você pensa, aprende e se expressa',
        house: mercHouse, signIndex: mercSign,
        text: texts.MERCURY_IN_HOUSE[mercHouse - 1] || '',
        isRetrograde: mercPos.isRetrograde,
      }, signNames, isEN);
    }

    // Page 8: Vênus — interpretação na casa
    const venusPos = chart.positions.venus;
    if (venusPos) {
      const venusHouse = chart.planetHouses.venus || 1;
      const venusSign = getSignIndex(venusPos.longitude);
      doc.addPage();
      renderPlanetPage(doc, {
        symbol: '♀', nameEN: 'Venus', namePT: 'Vênus',
        subtitleEN: 'Your love language — what you attract, value and desire in relationships',
        subtitlePT: 'Sua linguagem do amor — o que você atrai, valoriza e deseja nos relacionamentos',
        house: venusHouse, signIndex: venusSign,
        text: texts.VENUS_IN_HOUSE[venusHouse - 1] || '',
        isRetrograde: venusPos.isRetrograde,
      }, signNames, isEN);
    }

    // Page 9: Marte — interpretação na casa
    const marsPos = chart.positions.mars;
    if (marsPos) {
      const marsHouse = chart.planetHouses.mars || 1;
      const marsSign = getSignIndex(marsPos.longitude);
      doc.addPage();
      renderPlanetPage(doc, {
        symbol: '♂', nameEN: 'Mars', namePT: 'Marte',
        subtitleEN: 'Your drive and action — how you pursue goals, assert yourself and desire',
        subtitlePT: 'Seu impulso e ação — como você persegue objetivos, se impõe e deseja',
        house: marsHouse, signIndex: marsSign,
        text: texts.MARS_IN_HOUSE[marsHouse - 1] || '',
        isRetrograde: marsPos.isRetrograde,
      }, signNames, isEN);
    }

    // Page 10: Júpiter — interpretação na casa
    const jupPos = chart.positions.jupiter;
    if (jupPos) {
      const jupHouse = chart.planetHouses.jupiter || 1;
      const jupSign = getSignIndex(jupPos.longitude);
      doc.addPage();
      renderPlanetPage(doc, {
        symbol: '♃', nameEN: 'Jupiter', namePT: 'Júpiter',
        subtitleEN: 'Your path of expansion — where abundance, wisdom and growth flow naturally',
        subtitlePT: 'Seu caminho de expansão — onde abundância, sabedoria e crescimento fluem naturalmente',
        house: jupHouse, signIndex: jupSign,
        text: texts.JUPITER_IN_HOUSE[jupHouse - 1] || '',
        isRetrograde: jupPos.isRetrograde,
      }, signNames, isEN);
    }

    // Page 11: Saturno — interpretação na casa
    const satPos = chart.positions.saturn;
    if (satPos) {
      const satHouse = chart.planetHouses.saturn || 1;
      const satSign = getSignIndex(satPos.longitude);
      doc.addPage();
      renderPlanetPage(doc, {
        symbol: '♄', nameEN: 'Saturn', namePT: 'Saturno',
        subtitleEN: 'Your mastery zone — where discipline, structure and lasting achievement are forged',
        subtitlePT: 'Sua zona de maestria — onde disciplina, estrutura e conquista duradoura são forjadas',
        house: satHouse, signIndex: satSign,
        text: texts.SATURN_IN_HOUSE[satHouse - 1] || '',
        isRetrograde: satPos.isRetrograde,
      }, signNames, isEN);
    }

    // Page 12: Urano / Netuno / Plutão — combinados
    doc.addPage();
    renderOuterPlanetsDetailPage(doc, chart, signNames, isEN, texts);

    // Page 13: Quíron — ferida e dom
    const chironPos = chart.positions.chiron;
    if (chironPos) {
      const chironHouse = chart.planetHouses.chiron || 1;
      const chironSign = getSignIndex(chironPos.longitude);
      doc.addPage();
      renderChironPage(doc, chironHouse, chironSign, signNames, isEN, texts);
    }

    // Page 14: Nodo Norte — propósito de vida
    const nnPos = chart.positions.northNode;
    if (nnPos) {
      const nnHouse = chart.planetHouses.northNode || 1;
      const nnSign = getSignIndex(nnPos.longitude);
      doc.addPage();
      renderNorthNodePage(doc, nnHouse, nnSign, signNames, isEN, texts);
    }

    // Pages 15-16: Top 10 aspectos com interpretações
    doc.addPage();
    renderAspectsPage(doc, chart, isEN);

    // Page 17: Elementos e Modalidades
    doc.addPage();
    renderElementsModalitiesPage(doc, report, isEN);

    // Page 18: Dignidades Essenciais
    doc.addPage();
    renderDignitiesPage(doc, report, isEN);

    // Pages 19-24: Síntese por tema (6 temas)
    for (const theme of report.themes) {
      doc.addPage();
      renderThemePage(doc, theme, isEN);
    }

    // Page 25: Conclusão / Próximos Passos
    doc.addPage();
    renderConclusionPage(doc, options, isEN);
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    renderFooter(doc, i, pageCount, options.profileName);
  }

  return doc.output('blob');
}

// ============================================================
// PAGE RENDERERS
// ============================================================

function renderWheelPage(doc: jsPDF, chart: NatalChart, isEN: boolean) {
  const margin = 20;
  const signNames = isEN ? SIGN_NAMES_EN : SIGN_NAMES_PT;
  const planetNames = isEN ? PLANET_NAMES_EN : PLANET_NAMES_PT;
  let y = 25;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Your Natal Chart' : 'Seu Mapa Natal', 105, y, { align: 'center' });
  y += 10;

  // Generate the wheel SVG
  const svgString = renderWheel(chart);

  // jsPDF can embed SVG via svg2pdf.js or we can use addSvgAsImage
  // Fallback: embed as SVG data URI image
  try {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create a canvas to rasterize SVG for PDF embedding
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    canvas.width = 700;
    canvas.height = 700;

    // Synchronous approach using SVG data URI
    const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
    const dataUri = `data:image/svg+xml;base64,${svgBase64}`;

    // Add SVG as image (jsPDF supports SVG data URIs)
    const chartSize = 150; // mm
    const chartX = (210 - chartSize) / 2; // centered
    doc.addImage(dataUri, 'SVG', chartX, y, chartSize, chartSize);
    y += chartSize + 8;

    URL.revokeObjectURL(svgUrl);
  } catch (e) {
    // Fallback: just show a placeholder text if SVG rendering fails
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textLight);
    doc.text(isEN ? '(Chart wheel — view online for interactive version)' : '(Mapa astral — veja online a versão interativa)', 105, y + 60, { align: 'center' });
    y += 130;
  }

  // Caption
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);

  const ascSign = signNames[getSignIndex(chart.houses.ascendant)];
  const sunSign = signNames[getSignIndex(chart.positions.sun?.longitude || 0)];
  const moonSign = signNames[getSignIndex(chart.positions.moon?.longitude || 0)];

  const caption = isEN
    ? `Ascendant: ${ascSign} | Sun: ${sunSign} | Moon: ${moonSign} | System: Placidus`
    : `Ascendente: ${ascSign} | Sol: ${sunSign} | Lua: ${moonSign} | Sistema: Plácido`;
  doc.text(caption, 105, y, { align: 'center' });
}

function renderCoverPage(doc: jsPDF, options: PdfOptions, isEN: boolean) {
  const w = 210, h = 297;

  // Background gradient effect (subtle)
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, w, h, 'F');

  // Top decorative line
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(2);
  doc.line(20, 30, w - 20, 30);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(32);
  doc.setTextColor(...COLORS.brand);
  doc.text('LifeMap Pro', w / 2, 55, { align: 'center' });

  // Subtitle
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.text);
  doc.text(isEN ? 'Complete Natal Chart Report' : 'Relatório Natal Completo', w / 2, 70, { align: 'center' });

  // Star symbol
  doc.setFontSize(60);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('✦', w / 2, 120, { align: 'center' });

  // Profile info
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  doc.text(options.profileName, w / 2, 160, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`${options.birthDate}  ${options.birthTime}`, w / 2, 172, { align: 'center' });
  doc.text(options.birthCity, w / 2, 182, { align: 'center' });

  // ASC + Sun info
  const sunSign = 0; // placeholder — cover page doesn't use this
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textLight);

  const ascSi = getSignIndex(0); // Will be replaced with real data
  doc.text(`${isEN ? 'Calculated with Swiss Ephemeris' : 'Calculado com Swiss Ephemeris'}`, w / 2, 220, { align: 'center' });

  // Try-out badge
  if (true) { // options.isTryout
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.brandLight);
    doc.text(isEN ? 'FREE SAMPLE — 3 pages' : 'AMOSTRA GRATUITA — 3 páginas', w / 2, 240, { align: 'center' });
  }

  // Bottom line
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(1);
  doc.line(20, h - 30, w - 20, h - 30);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text('www.lifemap.pro', w / 2, h - 20, { align: 'center' });
}

function renderPositionsPage(doc: jsPDF, chart: NatalChart, planetNames: Record<string, string>, signNames: string[], isEN: boolean) {
  const margin = 20;
  let y = 30;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Planetary Positions' : 'Posições Planetárias', margin, y);
  y += 12;

  // Table header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textLight);
  doc.text(isEN ? 'Planet' : 'Planeta', margin, y);
  doc.text(isEN ? 'Sign' : 'Signo', margin + 45, y);
  doc.text(isEN ? 'Degree' : 'Grau', margin + 90, y);
  doc.text(isEN ? 'House' : 'Casa', margin + 125, y);
  doc.text('R', margin + 150, y);
  y += 3;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, 190, y);
  y += 6;

  // Planet rows
  const planetOrder = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'chiron'];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  for (const pid of planetOrder) {
    const pos = chart.positions[pid];
    if (!pos) continue;

    const si = getSignIndex(pos.longitude);
    const deg = getDegreeInSign(pos.longitude);
    const house = chart.planetHouses[pid] || '-';
    const isRetro = pos.isRetrograde;

    doc.setTextColor(...COLORS.text);
    doc.text(`${PLANET_SYMBOLS[pid] || ''} ${planetNames[pid] || pid}`, margin, y);

    doc.setTextColor(...ELEMENT_COLORS_IDX[si]);
    doc.text(`${SIGN_SYMBOLS[si]} ${signNames[si]}`, margin + 45, y);

    doc.setTextColor(...COLORS.text);
    doc.text(formatDegMin(deg), margin + 90, y);
    doc.text(String(house), margin + 125, y);

    if (isRetro) {
      doc.setTextColor(...COLORS.fire);
      doc.text('R', margin + 150, y);
    }

    y += 7;
  }

  // ASC and MC
  y += 5;
  doc.setDrawColor(...COLORS.line);
  doc.line(margin, y, 190, y);
  y += 7;

  const ascSi = getSignIndex(chart.houses.ascendant);
  const mcSi = getSignIndex(chart.houses.midheaven);

  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(isEN ? 'Ascendant' : 'Ascendente', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...ELEMENT_COLORS_IDX[ascSi]);
  doc.text(`${SIGN_SYMBOLS[ascSi]} ${signNames[ascSi]}  ${formatDegMin(getDegreeInSign(chart.houses.ascendant))}`, margin + 45, y);
  y += 7;

  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.text(isEN ? 'Midheaven (MC)' : 'Meio do Céu (MC)', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...ELEMENT_COLORS_IDX[mcSi]);
  doc.text(`${SIGN_SYMBOLS[mcSi]} ${signNames[mcSi]}  ${formatDegMin(getDegreeInSign(chart.houses.midheaven))}`, margin + 45, y);
}

function renderHousesPage(doc: jsPDF, chart: NatalChart, signNames: string[], isEN: boolean) {
  const margin = 20;
  let y = 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'House Cusps' : 'Cúspides das Casas', margin, y);
  y += 12;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.textLight);
  doc.text(isEN ? 'House' : 'Casa', margin, y);
  doc.text(isEN ? 'Sign' : 'Signo', margin + 30, y);
  doc.text(isEN ? 'Degree' : 'Grau', margin + 75, y);
  doc.text(isEN ? 'Area' : 'Área', margin + 110, y);
  y += 3;
  doc.setDrawColor(...COLORS.line);
  doc.line(margin, y, 190, y);
  y += 6;

  const houseAreas_PT = ['Identidade', 'Recursos', 'Comunicação', 'Lar', 'Criatividade', 'Rotina', 'Parcerias', 'Transformação', 'Expansão', 'Carreira', 'Coletivo', 'Transcendência'];
  const houseAreas_EN = ['Identity', 'Resources', 'Communication', 'Home', 'Creativity', 'Routine', 'Partnerships', 'Transformation', 'Expansion', 'Career', 'Collective', 'Transcendence'];
  const areas = isEN ? houseAreas_EN : houseAreas_PT;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  for (let i = 0; i < 12; i++) {
    const cusp = chart.houses.cusps[i];
    const si = getSignIndex(cusp);
    const deg = getDegreeInSign(cusp);

    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}`, margin + 5, y);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(...ELEMENT_COLORS_IDX[si]);
    doc.text(`${SIGN_SYMBOLS[si]} ${signNames[si]}`, margin + 30, y);

    doc.setTextColor(...COLORS.text);
    doc.text(formatDegMin(deg), margin + 75, y);
    doc.setTextColor(...COLORS.textLight);
    doc.text(areas[i], margin + 110, y);

    y += 7;
  }
}

function renderInterpretationPage(doc: jsPDF, chart: NatalChart, planetNames: Record<string, string>, signNames: string[], isEN: boolean, planetId: string) {
  const margin = 20;
  let y = 30;
  const pos = chart.positions[planetId];
  if (!pos) return;

  const si = getSignIndex(pos.longitude);
  const house = chart.planetHouses[planetId] || 1;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text(`${PLANET_SYMBOLS[planetId]} ${planetNames[planetId]}`, margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(...ELEMENT_COLORS_IDX[si]);
  doc.text(`${isEN ? 'in' : 'em'} ${SIGN_SYMBOLS[si]} ${signNames[si]} — ${isEN ? 'House' : 'Casa'} ${house}`, margin, y);
  y += 12;

  // Placeholder interpretation text (would come from content files in production)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const text = isEN
    ? `Your ${planetNames[planetId]} in ${signNames[si]} in House ${house} indicates a unique expression of this planetary energy in this area of life. This placement suggests specific patterns of behavior, motivation and growth opportunities that are explored in detail in the full report.`
    : `Seu ${planetNames[planetId]} em ${signNames[si]} na Casa ${house} indica uma expressão única desta energia planetária nesta área da vida. Este posicionamento sugere padrões específicos de comportamento, motivação e oportunidades de crescimento que são explorados em detalhe no relatório completo.`;

  const lines = doc.splitTextToSize(text, 170);
  doc.text(lines, margin, y);
}

// ============================================================
// WATERMARK & TRY-OUT
// ============================================================

function addTryoutWatermark(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(40);
    doc.setTextColor(200, 200, 200);
    doc.text('SAMPLE', 105, 200, { align: 'center', angle: 45 });
  }
}

function addTryoutEndPage(doc: jsPDF, isEN: boolean) {
  doc.addPage();
  const w = 210;
  let y = 80;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'This was a free sample!' : 'Esta foi uma amostra gratuita!', w / 2, y, { align: 'center' });
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  const msg = isEN
    ? 'The complete report contains 20-30 pages with detailed\ninterpretation of all planets, houses, aspects and forecasts.'
    : 'O relatório completo contém 20-30 páginas com interpretação\ndetalhada de todos os planetas, casas, aspectos e previsões.';
  doc.text(msg, w / 2, y, { align: 'center' });
  y += 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('www.lifemap.pro/reports', w / 2, y, { align: 'center' });
}

function renderFooter(doc: jsPDF, page: number, total: number, name: string) {
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`${name} — LifeMap Pro`, 20, 287);
  doc.text(`${page} / ${total}`, 190, 287, { align: 'right' });
}

// ============================================================
// DOWNLOAD HELPER
// ============================================================

/**
 * Trigger download of a PDF blob
 */
export function downloadPdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// SYNTHESIS PAGES (Full Report - Premium)
// ============================================================

// ============================================================
// TOP 5 POTENTIALS + TOP 5 CHALLENGES
// Scoring baseado em dignidades, aspectos harmônicos/tensos e planetas angulares
// ============================================================

function renderTopPotentialsAndChallenges(doc: jsPDF, chart: NatalChart, report: FullReport, texts: any, isEN: boolean) {
  const margin = 20;
  let y = 30;
  const signNames = texts.SIGN_NAMES;
  const planetNames = texts.PLANET_NAMES;

  // --- Extrair potenciais (aspectos harmônicos + dignidades + planetas angulares) ---
  const potentials: { text: string; score: number }[] = [];
  const challenges: { text: string; score: number }[] = [];

  // Aspectos harmônicos → potenciais | Aspectos tensos → desafios
  if (chart.aspects) {
    for (const asp of chart.aspects) {
      const p1 = planetNames[asp.planet1] || asp.planet1;
      const p2 = planetNames[asp.planet2] || asp.planet2;
      const score = asp.exactness * 100;

      if (asp.nature === 'harmonic') {
        const txt = isEN
          ? `${p1} ${asp.type} ${p2} — natural ease and talent in integrating these energies`
          : `${p1} ${asp.type === 'trine' ? 'trígono' : 'sextil'} ${p2} — facilidade natural e talento na integração dessas energias`;
        potentials.push({ text: txt, score });
      } else if (asp.nature === 'tense') {
        const txt = isEN
          ? `${p1} ${asp.type} ${p2} — tension that demands growth and conscious effort`
          : `${p1} ${asp.type === 'square' ? 'quadratura' : 'oposição'} ${p2} — tensão que exige crescimento e esforço consciente`;
        challenges.push({ text: txt, score });
      }
    }
  }

  // Planetas angulares → potenciais
  if (chart.angularPlanets) {
    for (const p of chart.angularPlanets) {
      const name = planetNames[p] || p;
      const txt = isEN
        ? `${name} angular — prominent energy that defines your public presence`
        : `${name} angular — energia proeminente que define sua presença pública`;
      potentials.push({ text: txt, score: 85 });
    }
  }

  // Dignidades → potenciais; Debilidades → desafios
  if (chart.dignities) {
    for (const [planet, dignity] of Object.entries(chart.dignities)) {
      const name = planetNames[planet] || planet;
      if (dignity === 'domicile' || dignity === 'exalted') {
        const txt = isEN
          ? `${name} dignified (${dignity}) — operates with natural strength and clarity`
          : `${name} dignificado (${dignity === 'domicile' ? 'domicílio' : 'exaltação'}) — opera com força e clareza natural`;
        potentials.push({ text: txt, score: 80 });
      } else if (dignity === 'detriment' || dignity === 'fall') {
        const txt = isEN
          ? `${name} debilitated (${dignity}) — requires extra work to express constructively`
          : `${name} debilitado (${dignity === 'detriment' ? 'detrimento' : 'queda'}) — requer trabalho extra para se expressar construtivamente`;
        challenges.push({ text: txt, score: 75 });
      }
    }
  }

  // Ordenar por score e pegar top 5
  potentials.sort((a, b) => b.score - a.score);
  challenges.sort((a, b) => b.score - a.score);
  const top5P = potentials.slice(0, 5);
  const top5C = challenges.slice(0, 5);

  // --- Renderizar ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? '✦ Your 5 Greatest Potentials' : '✦ Seus 5 Maiores Potenciais', margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  for (let i = 0; i < top5P.length; i++) {
    const item = top5P[i];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${i + 1}.`, margin, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(item.text, 160);
    doc.text(lines, margin + 8, y);
    y += lines.length * 5 + 6;
  }

  y += 10;

  // Desafios
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(180, 40, 40);
  doc.text(isEN ? '⚡ Your 5 Main Challenges' : '⚡ Seus 5 Principais Desafios', margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  for (let i = 0; i < top5C.length; i++) {
    const item = top5C[i];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`${i + 1}.`, margin, y);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(item.text, 160);
    doc.text(lines, margin + 8, y);
    y += lines.length * 5 + 6;
  }

  // Nota final
  y += 10;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  const note = isEN
    ? 'Potentials show where energy flows naturally. Challenges show where conscious work produces the deepest growth.'
    : 'Potenciais indicam onde a energia flui naturalmente. Desafios indicam onde o trabalho consciente produz o crescimento mais profundo.';
  const noteLines = doc.splitTextToSize(note, 170);
  doc.text(noteLines, margin, y);
}

function renderSynthesisOverviewPage(doc: jsPDF, report: FullReport, isEN: boolean) {
  const margin = 20;
  let y = 30;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Chart Overview' : 'Visão Geral do Mapa', margin, y);
  y += 12;

  // Overview narrative
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const overviewLines = doc.splitTextToSize(report.overview, 170);
  doc.text(overviewLines, margin, y);
  y += overviewLines.length * 5 + 10;

  // Chart Ruler
  if (report.chartRuler) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.brand);
    doc.text(isEN ? 'Chart Ruler' : 'Regente do Mapa', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const rulerLines = doc.splitTextToSize(report.chartRuler, 170);
    doc.text(rulerLines, margin, y);
    y += rulerLines.length * 5 + 10;
  }

  // Elements
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Element Balance' : 'Equilíbrio de Elementos', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const elemLines = doc.splitTextToSize(report.elementBalance, 170);
  doc.text(elemLines, margin, y);
  y += elemLines.length * 5 + 10;

  // Modalities
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Modality Balance' : 'Equilíbrio de Modalidades', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const modLines = doc.splitTextToSize(report.modalityBalance, 170);
  doc.text(modLines, margin, y);
  y += modLines.length * 5 + 10;

  // Dignities
  if (report.dignities.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.brand);
    doc.text(isEN ? 'Planetary Dignities' : 'Dignidades Planetárias', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.text);
    for (const d of report.dignities) {
      const clean = d.replace(/\*\*/g, '');
      const lines = doc.splitTextToSize(clean, 170);
      if (y + lines.length * 4 > 275) break; // page overflow protection
      doc.text(lines, margin, y);
      y += lines.length * 4 + 3;
    }
  }
}

function renderThemePage(doc: jsPDF, theme: ThemeSynthesis, isEN: boolean) {
  const margin = 20;
  let y = 30;

  // Theme title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.brand);
  doc.text(`${theme.icon} ${theme.title}`, margin, y);
  y += 14;

  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 190, y);
  y += 8;

  // Sections
  for (const section of theme.sections) {
    if (y > 260) {
      doc.addPage();
      y = 30;
    }

    // Importance indicator
    const importanceColor = section.importance === 'high' ? COLORS.brand :
      section.importance === 'medium' ? COLORS.textLight : [180, 180, 180] as [number, number, number];

    doc.setDrawColor(...importanceColor);
    doc.setLineWidth(2);
    doc.line(margin, y - 2, margin, y + 4);

    // Subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text(section.subtitle, margin + 5, y + 2);
    y += 8;

    // Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(section.text, 165);
    doc.text(lines, margin + 5, y);
    y += lines.length * 5 + 8;
  }
}

function renderOuterPlanetsPage(doc: jsPDF, outerTexts: string[], isEN: boolean) {
  const margin = 20;
  let y = 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Outer Planets' : 'Planetas Exteriores', margin, y);
  y += 12;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text(isEN
    ? 'Jupiter, Saturn, Uranus, Neptune and Pluto — social and generational influences.'
    : 'Júpiter, Saturno, Urano, Netuno e Plutão — influências sociais e geracionais.',
    margin, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  for (const text of outerTexts) {
    if (y > 260) {
      doc.addPage();
      y = 30;
    }

    const clean = text.replace(/\*\*/g, '');
    const colonIdx = clean.indexOf(':');
    if (colonIdx > 0) {
      // Bold the title part
      const title = clean.substring(0, colonIdx + 1);
      const body = clean.substring(colonIdx + 1).trim();

      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(body, 170);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 8;
    } else {
      const lines = doc.splitTextToSize(clean, 170);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 5;
    }
  }
}

// ============================================================
// INDIVIDUAL PLANET PAGE
// ============================================================

interface PlanetPageData {
  symbol: string;
  nameEN: string;
  namePT: string;
  subtitleEN: string;
  subtitlePT: string;
  house: number;
  signIndex: number;
  text: string;
  isRetrograde: boolean;
}

function renderPlanetPage(doc: jsPDF, data: PlanetPageData, signNames: string[], isEN: boolean) {
  const margin = 20;
  let y = 30;

  // Decorative top bar
  doc.setFillColor(...COLORS.brand);
  doc.rect(margin, y - 8, 170, 1.5, 'F');

  // Planet symbol (large)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.brandLight);
  doc.text(data.symbol, margin, y + 5);

  // Planet name
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? data.nameEN : data.namePT, margin + 15, y + 5);

  // Retrograde badge
  if (data.isRetrograde) {
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.fire);
    doc.text(isEN ? '℞ Retrograde' : '℞ Retrógrado', 165, y + 5, { align: 'right' });
  }
  y += 16;

  // Sign + House subtitle
  doc.setFontSize(13);
  doc.setTextColor(...ELEMENT_COLORS_IDX[data.signIndex]);
  doc.text(
    `${SIGN_SYMBOLS[data.signIndex]} ${signNames[data.signIndex]}  —  ${isEN ? 'House' : 'Casa'} ${data.house}`,
    margin, y
  );
  y += 8;

  // Page subtitle (description of what this page covers)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  const subtitle = isEN ? data.subtitleEN : data.subtitlePT;
  doc.text(subtitle, margin, y);
  y += 10;

  // Separator line
  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, 190, y);
  y += 10;

  // Main interpretation text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  if (data.text) {
    const lines = doc.splitTextToSize(data.text, 170);
    for (const line of lines) {
      if (y > 272) { doc.addPage(); y = 30; }
      doc.text(line, margin, y);
      y += 5.5;
    }
  } else {
    doc.setTextColor(...COLORS.textLight);
    const fallback = isEN
      ? `${data.nameEN} in House ${data.house} shapes the way you express this planetary energy in the area of life governed by this house. This placement indicates specific patterns of behavior, motivation and growth that define your unique approach to this area of life.`
      : `${data.namePT} na Casa ${data.house} molda a forma como você expressa esta energia planetária na área de vida governada por esta casa. Este posicionamento indica padrões específicos de comportamento, motivação e crescimento que definem sua abordagem única nesta área da vida.`;
    const lines = doc.splitTextToSize(fallback, 170);
    doc.text(lines, margin, y);
    y += lines.length * 5.5;
  }

  // Retrograde note at the bottom if applicable
  if (data.isRetrograde) {
    y += 8;
    if (y > 260) { doc.addPage(); y = 30; }
    doc.setFillColor(255, 245, 245);
    doc.rect(margin, y - 4, 170, 18, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.fire);
    doc.text(isEN ? '℞ Retrograde Note' : '℞ Nota sobre Retrogradação', margin + 3, y + 1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.text);
    const retroText = isEN
      ? `${data.nameEN} was retrograde at your birth. This internalizes the planet's energy — you may process its themes more deeply but express them outwardly only after reflection. With time and awareness, retrograde planets often become sources of great wisdom.`
      : `${data.namePT} estava retrógrado no seu nascimento. Isso internaliza a energia do planeta — você pode processar seus temas com mais profundidade, mas expressá-los externamente apenas após reflexão. Com o tempo e a consciência, planetas retrógrados frequentemente se tornam fontes de grande sabedoria.`;
    const retroLines = doc.splitTextToSize(retroText, 162);
    doc.text(retroLines, margin + 3, y + 7);
  }
}

// ============================================================
// OUTER PLANETS DETAIL PAGE (Uranus / Neptune / Pluto)
// ============================================================

function renderOuterPlanetsDetailPage(doc: jsPDF, chart: NatalChart, signNames: string[], isEN: boolean, texts: any) {
  const margin = 20;
  let y = 30;

  doc.setFillColor(...COLORS.brand);
  doc.rect(margin, y - 8, 170, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Outer Planets — Generational Influences' : 'Planetas Exteriores — Influências Geracionais', margin, y + 4);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  const intro = isEN
    ? 'Uranus, Neptune and Pluto move slowly and shape generational themes. Their house placements reveal where these collective forces act most personally in your life.'
    : 'Urano, Netuno e Plutão se movem lentamente e moldam temas geracionais. Seus posicionamentos por casa revelam onde essas forças coletivas atuam de forma mais pessoal na sua vida.';
  const introLines = doc.splitTextToSize(intro, 170);
  doc.text(introLines, margin, y);
  y += introLines.length * 4.5 + 8;

  const outerPlanets = [
    {
      id: 'uranus', symbol: '♅', nameEN: 'Uranus', namePT: 'Urano',
      array: texts.URANUS_IN_HOUSE,
      themeEN: 'Innovation, liberation and radical change',
      themePT: 'Inovação, libertação e mudança radical',
    },
    {
      id: 'neptune', symbol: '♆', nameEN: 'Neptune', namePT: 'Netuno',
      array: texts.NEPTUNE_IN_HOUSE,
      themeEN: 'Intuition, spirituality and dissolution of boundaries',
      themePT: 'Intuição, espiritualidade e dissolução de limites',
    },
    {
      id: 'pluto', symbol: '♇', nameEN: 'Pluto', namePT: 'Plutão',
      array: texts.PLUTO_IN_HOUSE,
      themeEN: 'Deep transformation, power and regeneration',
      themePT: 'Transformação profunda, poder e regeneração',
    },
  ];

  for (const planet of outerPlanets) {
    const pos = chart.positions[planet.id];
    if (!pos) continue;

    const house = chart.planetHouses[planet.id] || 1;
    const si = getSignIndex(pos.longitude);
    const text = planet.array[house - 1] || '';

    if (y > 240) { doc.addPage(); y = 30; }

    // Planet header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.brand);
    doc.text(`${planet.symbol}  ${isEN ? planet.nameEN : planet.namePT}`, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...ELEMENT_COLORS_IDX[si]);
    doc.text(
      `${SIGN_SYMBOLS[si]} ${signNames[si]}  —  ${isEN ? 'House' : 'Casa'} ${house}`,
      margin + 35, y
    );
    y += 6;

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textLight);
    doc.text(isEN ? planet.themeEN : planet.themePT, margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    if (text) {
      const lines = doc.splitTextToSize(text, 170);
      for (const line of lines) {
        if (y > 272) { doc.addPage(); y = 30; }
        doc.text(line, margin, y);
        y += 5;
      }
    }
    y += 8;

    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 4, 190, y - 4);
  }
}

// ============================================================
// CHIRON PAGE — A Ferida que Cura
// ============================================================

function renderChironPage(doc: jsPDF, house: number, signIndex: number, signNames: string[], isEN: boolean, texts: any) {
  const margin = 20;
  let y = 30;

  doc.setFillColor(...COLORS.brand);
  doc.rect(margin, y - 8, 170, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.brand);
  doc.text('⚷  ' + (isEN ? 'Chiron' : 'Quíron'), margin, y + 4);
  y += 13;

  doc.setFontSize(13);
  doc.setTextColor(...ELEMENT_COLORS_IDX[signIndex]);
  doc.text(`${SIGN_SYMBOLS[signIndex]} ${signNames[signIndex]}  —  ${isEN ? 'House' : 'Casa'} ${house}`, margin, y);
  y += 8;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    isEN
      ? 'The wound that becomes wisdom — where you are most sensitive and most gifted'
      : 'A ferida que se torna sabedoria — onde você é mais sensível e mais dotado',
    margin, y
  );
  y += 10;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, 190, y);
  y += 10;

  // House text
  const houseText = texts.CHIRON_IN_HOUSE[house - 1] || '';
  if (houseText) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.brand);
    doc.text(isEN ? `Chiron in House ${house}` : `Quíron na Casa ${house}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(houseText, 170);
    for (const line of lines) {
      if (y > 272) { doc.addPage(); y = 30; }
      doc.text(line, margin, y);
      y += 5.5;
    }
    y += 8;
  }

  // Sign text
  const signText = texts.CHIRON_IN_SIGN[signIndex] || '';
  if (signText) {
    if (y > 240) { doc.addPage(); y = 30; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.brand);
    doc.text(
      isEN ? `Chiron in ${signNames[signIndex]} — The Tone of the Wound` : `Quíron em ${signNames[signIndex]} — O Tom da Ferida`,
      margin, y
    );
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(signText, 170);
    for (const line of lines) {
      if (y > 272) { doc.addPage(); y = 30; }
      doc.text(line, margin, y);
      y += 5.5;
    }
  }
}

// ============================================================
// NORTH NODE PAGE — Propósito de Vida
// ============================================================

function renderNorthNodePage(doc: jsPDF, house: number, signIndex: number, signNames: string[], isEN: boolean, texts: any) {
  const margin = 20;
  let y = 30;

  doc.setFillColor(...COLORS.brand);
  doc.rect(margin, y - 8, 170, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.brand);
  doc.text('☊  ' + (isEN ? 'North Node' : 'Nodo Norte'), margin, y + 4);
  y += 13;

  doc.setFontSize(13);
  doc.setTextColor(...ELEMENT_COLORS_IDX[signIndex]);
  doc.text(`${SIGN_SYMBOLS[signIndex]} ${signNames[signIndex]}  —  ${isEN ? 'House' : 'Casa'} ${house}`, margin, y);
  y += 8;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    isEN
      ? 'Your soul\'s evolutionary direction — where growth calls you most powerfully'
      : 'A direção evolutiva da sua alma — onde o crescimento te chama com mais força',
    margin, y
  );
  y += 10;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, 190, y);
  y += 10;

  // House text
  const houseText = texts.NORTH_NODE_HOUSE[house - 1] || '';
  if (houseText) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.brand);
    doc.text(isEN ? `North Node in House ${house}` : `Nodo Norte na Casa ${house}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(houseText, 170);
    for (const line of lines) {
      if (y > 272) { doc.addPage(); y = 30; }
      doc.text(line, margin, y);
      y += 5.5;
    }
    y += 8;
  }

  // Sign text
  const signText = texts.NORTH_NODE_IN_SIGN[signIndex] || '';
  if (signText) {
    if (y > 240) { doc.addPage(); y = 30; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.brand);
    doc.text(
      isEN ? `North Node in ${signNames[signIndex]} — The Journey` : `Nodo Norte em ${signNames[signIndex]} — A Jornada`,
      margin, y
    );
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(signText, 170);
    for (const line of lines) {
      if (y > 272) { doc.addPage(); y = 30; }
      doc.text(line, margin, y);
      y += 5.5;
    }
  }
}

// ============================================================
// ASPECTS PAGE — Top 10 aspectos principais
// ============================================================

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍',
};
const ASPECT_NAMES_PT: Record<string, string> = {
  conjunction: 'Conjunção', sextile: 'Sextil', square: 'Quadratura', trine: 'Trígono', opposition: 'Oposição',
};
const ASPECT_NAMES_EN: Record<string, string> = {
  conjunction: 'Conjunction', sextile: 'Sextile', square: 'Square', trine: 'Trine', opposition: 'Opposition',
};

function renderAspectsPage(doc: jsPDF, chart: NatalChart, isEN: boolean) {
  const margin = 20;
  let y = 30;

  doc.setFillColor(...COLORS.brand);
  doc.rect(margin, y - 8, 170, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Main Aspects' : 'Aspectos Principais', margin, y + 4);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text(
    isEN
      ? 'The planetary aspects reveal the inner dialogues between different parts of your psyche.'
      : 'Os aspectos planetários revelam os diálogos internos entre diferentes partes da sua psique.',
    margin, y
  );
  y += 9;

  // Sort aspects by exactness desc, take top 10 with interpretations
  const rankedAspects = [...chart.aspects]
    .filter(a => {
      const key1 = `${a.planet1}-${a.planet2}`;
      const key2 = `${a.planet2}-${a.planet1}`;
      const text = getAspectInterpretation(a.planet1, a.planet2, a.type);
      return text.length > 0;
    })
    .sort((a, b) => b.exactness - a.exactness)
    .slice(0, 10);

  const aspectNames = isEN ? ASPECT_NAMES_EN : ASPECT_NAMES_PT;
  const planetNamesMap = isEN ? PLANET_NAMES_EN : PLANET_NAMES_PT;

  for (const aspect of rankedAspects) {
    if (y > 255) { doc.addPage(); y = 30; }

    const interp = getAspectInterpretation(aspect.planet1, aspect.planet2, aspect.type);
    if (!interp) continue;

    const p1Name = planetNamesMap[aspect.planet1] || aspect.planet1;
    const p2Name = planetNamesMap[aspect.planet2] || aspect.planet2;
    const p1Sym = PLANET_SYMBOLS[aspect.planet1] || '';
    const p2Sym = PLANET_SYMBOLS[aspect.planet2] || '';
    const aspSym = ASPECT_SYMBOLS[aspect.type] || '';
    const aspName = aspectNames[aspect.type] || aspect.type;
    const nature = ASPECT_NATURE[aspect.type];
    const orbStr = `${aspect.orb.toFixed(1)}°`;

    // Nature color
    const natColor = nature?.nature === 'soft' ? COLORS.earth :
      nature?.nature === 'hard' ? COLORS.fire : COLORS.brand;

    // Aspect header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.text);
    doc.text(`${p1Sym} ${p1Name}  ${aspSym}  ${p2Sym} ${p2Name}`, margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...natColor);
    doc.text(`${aspName}  (${orbStr})`, 150, y, { align: 'right' });
    y += 6;

    // Interpretation text
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.text);
    const lines = doc.splitTextToSize(interp, 170);
    for (const line of lines) {
      if (y > 272) { doc.addPage(); y = 30; }
      doc.text(line, margin, y);
      y += 4.8;
    }
    y += 5;

    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 2, 190, y - 2);
  }

  if (rankedAspects.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.textLight);
    doc.text(
      isEN ? 'No major aspects with interpretations found in this chart.' : 'Nenhum aspecto principal com interpretação encontrado neste mapa.',
      margin, y
    );
  }
}

// ============================================================
// ELEMENTS & MODALITIES PAGE
// ============================================================

function renderElementsModalitiesPage(doc: jsPDF, report: FullReport, isEN: boolean) {
  const margin = 20;
  let y = 30;

  doc.setFillColor(...COLORS.brand);
  doc.rect(margin, y - 8, 170, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Elements & Modalities' : 'Elementos & Modalidades', margin, y + 4);
  y += 18;

  // Elements section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Element Balance' : 'Equilíbrio de Elementos', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const elemLines = doc.splitTextToSize(report.elementBalance, 170);
  doc.text(elemLines, margin, y);
  y += elemLines.length * 5.5 + 12;

  // Visual element bars
  const elementData = [
    { label: isEN ? 'Fire (Aries, Leo, Sagittarius)' : 'Fogo (Áries, Leão, Sagitário)', color: COLORS.fire },
    { label: isEN ? 'Earth (Taurus, Virgo, Capricorn)' : 'Terra (Touro, Virgem, Capricórnio)', color: COLORS.earth },
    { label: isEN ? 'Air (Gemini, Libra, Aquarius)' : 'Ar (Gêmeos, Libra, Aquário)', color: COLORS.air },
    { label: isEN ? 'Water (Cancer, Scorpio, Pisces)' : 'Água (Câncer, Escorpião, Peixes)', color: COLORS.water },
  ];
  for (const el of elementData) {
    doc.setFillColor(...el.color);
    doc.rect(margin, y - 3, 4, 4, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textLight);
    doc.text(el.label, margin + 7, y);
    y += 6;
  }
  y += 8;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, 190, y);
  y += 10;

  // Modalities section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Modality Balance' : 'Equilíbrio de Modalidades', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const modLines = doc.splitTextToSize(report.modalityBalance, 170);
  doc.text(modLines, margin, y);
  y += modLines.length * 5.5 + 12;

  const modalityData = [
    { label: isEN ? 'Cardinal — initiating, action-oriented' : 'Cardinal — iniciador, orientado à ação', color: COLORS.brand },
    { label: isEN ? 'Fixed — sustaining, persistent' : 'Fixo — sustentador, persistente', color: COLORS.brandLight },
    { label: isEN ? 'Mutable — adaptable, transitional' : 'Mutável — adaptável, transitório', color: COLORS.textLight },
  ];
  for (const mod of modalityData) {
    doc.setFillColor(...mod.color);
    doc.rect(margin, y - 3, 4, 4, 'F');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textLight);
    doc.text(mod.label, margin + 7, y);
    y += 6;
  }
}

// ============================================================
// DIGNITIES PAGE
// ============================================================

function renderDignitiesPage(doc: jsPDF, report: FullReport, isEN: boolean) {
  const margin = 20;
  let y = 30;

  doc.setFillColor(...COLORS.brand);
  doc.rect(margin, y - 8, 170, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Essential Dignities' : 'Dignidades Essenciais', margin, y + 4);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  const intro = isEN
    ? 'Essential dignities measure a planet\'s strength relative to its sign placement. Planets in dignity (domicile or exaltation) express their energy more purely; planets in debility (detriment or fall) face greater challenges but also offer deeper lessons.'
    : 'As dignidades essenciais medem a força de um planeta em relação ao seu signo. Planetas em dignidade (domicílio ou exaltação) expressam sua energia com mais pureza; planetas em debilidade (detrimento ou queda) enfrentam maiores desafios mas também oferecem lições mais profundas.';
  const introLines = doc.splitTextToSize(intro, 170);
  doc.text(introLines, margin, y);
  y += introLines.length * 5 + 10;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.3);
  doc.line(margin, y, 190, y);
  y += 10;

  if (report.dignities.length === 0) {
    doc.setTextColor(...COLORS.textLight);
    doc.text(
      isEN ? 'No notable essential dignities in this chart.' : 'Nenhuma dignidade essencial notável neste mapa.',
      margin, y
    );
    return;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  for (const dignity of report.dignities) {
    if (y > 265) { doc.addPage(); y = 30; }
    const clean = dignity.replace(/\*\*/g, '');
    const lines = doc.splitTextToSize(clean, 170);
    doc.text(lines, margin, y);
    y += lines.length * 5.5 + 4;

    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.15);
    doc.line(margin, y, 190, y);
    y += 5;
  }
}

// ============================================================
// CONCLUSION PAGE — Próximos Passos
// ============================================================

function renderConclusionPage(doc: jsPDF, options: PdfOptions, isEN: boolean) {
  const w = 210;
  let y = 50;

  // Decorative star
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(40);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('✦', w / 2, y, { align: 'center' });
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.brand);
  doc.text(isEN ? 'Your Map Is Complete' : 'Seu Mapa Está Completo', w / 2, y, { align: 'center' });
  y += 14;

  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(0.8);
  doc.line(50, y, w - 50, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);

  const body = isEN
    ? [
        'This report is a map — not a destiny.',
        '',
        'Every placement you have read describes potential patterns,',
        'not fixed outcomes. You are always larger than any chart.',
        '',
        'Suggested next steps:',
        '  1. Sit with the pages that resonated most strongly.',
        '  2. Notice where you feel recognition — that is where growth lives.',
        '  3. Work with a professional astrologer to explore transits',
        '     and timing for the year ahead.',
        '  4. Return to this report at different life moments — the same',
        '     chart reveals different layers as you evolve.',
        '',
        'The stars incline, they do not compel.',
      ]
    : [
        'Este relatório é um mapa — não um destino.',
        '',
        'Cada posicionamento que você leu descreve padrões potenciais,',
        'não resultados fixos. Você é sempre maior do que qualquer mapa.',
        '',
        'Próximos passos sugeridos:',
        '  1. Permaneça com as páginas que mais ressoaram.',
        '  2. Note onde sentiu reconhecimento — é aí que mora o crescimento.',
        '  3. Trabalhe com um astrólogo profissional para explorar trânsitos',
        '     e timing para o próximo ano.',
        '  4. Retorne a este relatório em momentos diferentes da vida — o mesmo',
        '     mapa revela camadas diferentes à medida que você evolui.',
        '',
        'Os astros inclinam, não compelem.',
      ];

  for (const line of body) {
    doc.text(line, w / 2, y, { align: 'center' });
    y += line === '' ? 5 : 7;
  }

  y += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('www.lifemap.pro', w / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text(options.profileName, w / 2, y, { align: 'center' });
  y += 5;
  doc.text(`${options.birthDate}  ${options.birthTime}  —  ${options.birthCity}`, w / 2, y, { align: 'center' });

  // Bottom bar
  doc.setFillColor(...COLORS.brand);
  doc.rect(0, 282, 210, 15, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(isEN ? 'Generated with LifeMap Pro — Complete Natal Chart Report' : 'Gerado com LifeMap Pro — Relatório Natal Completo', w / 2, 291, { align: 'center' });
}
