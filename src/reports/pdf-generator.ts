// ============================================================
// PDF-GENERATOR.TS — Professional PDF Report Generator
// Uses jsPDF to create astrology reports client-side
// Style inspired by astro.com sample PDFs
// ============================================================

import { jsPDF } from 'jspdf';
import type { NatalChart } from '../engine/types';
import { getSignIndex, getDegreeInSign, formatDegMin } from '../engine/calculations';
import { generateFullReport, type FullReport, type ThemeSynthesis } from '../engine/synthesis';

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
  const planetNames = isEN ? PLANET_NAMES_EN : PLANET_NAMES_PT;
  const signNames = isEN ? SIGN_NAMES_EN : SIGN_NAMES_PT;

  // ======= PAGE 1: COVER =======
  renderCoverPage(doc, options, isEN);

  // ======= PAGE 2: POSITIONS TABLE =======
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

    // Page 4: Overview + Chart Ruler + Elements
    doc.addPage();
    renderSynthesisOverviewPage(doc, report, isEN);

    // Pages 5+: Theme synthesis pages
    for (const theme of report.themes) {
      doc.addPage();
      renderThemePage(doc, theme, isEN);
    }

    // Outer planets page
    doc.addPage();
    renderOuterPlanetsPage(doc, report.outerPlanets, isEN);
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
  const sunSign = getSignIndex(chart => 0); // placeholder
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
