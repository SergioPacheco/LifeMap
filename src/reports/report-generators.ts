// ============================================================
// REPORT-GENERATORS.TS — Geradores de relatórios premium (Try-out)
// Cada função gera um PDF com 3 páginas gratuitas + página CTA
// ============================================================

import { jsPDF } from 'jspdf';
import type { NatalChart } from '../engine/types';
import { getSignIndex, getDegreeInSign, formatDegMin } from '../engine/calculations';
import { generateFullReport } from '../engine/synthesis';
import { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, PLUTO_IN_HOUSE } from '../engine/outer-planets';
import { JUPITER_IN_SIGN, SATURN_IN_SIGN } from '../engine/outer-planets';
import { getAspectInterpretation } from '../engine/aspect-interpretations';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../engine/chiron';
import { downloadPdf } from './pdf-generator';

// ============================================================
// SHARED CONSTANTS
// ============================================================

const COLORS = {
  brand: [107, 33, 168] as [number, number, number],
  brandLight: [139, 92, 246] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  textLight: [100, 100, 100] as [number, number, number],
  line: [200, 200, 200] as [number, number, number],
  bg: [250, 250, 255] as [number, number, number],
  gold: [180, 140, 50] as [number, number, number],
  red: [180, 40, 40] as [number, number, number],
};

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const PLANET_NAMES: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  northNode: 'Nodo Norte', chiron: 'Quíron',
};

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

export interface ReportOptions {
  locale: string;
  profileName: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  partnerName?: string;
  partnerChart?: NatalChart;
}

// ============================================================
// HELPERS
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

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('AMOSTRA GRATUITA — 3 páginas', w / 2, 230, { align: 'center' });

  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(1);
  doc.line(20, h - 30, w - 20, h - 30);
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text('www.lifemap.pro', w / 2, h - 20, { align: 'center' });
}

function renderCTAPage(doc: jsPDF, reportName: string, price: string) {
  doc.addPage();
  const w = 210;
  let y = 80;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...COLORS.brand);
  doc.text('Esta foi uma amostra gratuita!', w / 2, y, { align: 'center' });
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(`O ${reportName} completo contém 15-25 páginas`, w / 2, y, { align: 'center' });
  doc.text('com análise detalhada, previsões e recomendações.', w / 2, y + 14, { align: 'center' });
  y += 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.gold);
  doc.text(`${price}`, w / 2, y, { align: 'center' });
  y += 20;

  doc.setFontSize(13);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('www.lifemap.pro/reports', w / 2, y, { align: 'center' });
}

function addWatermark(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(35);
    doc.setTextColor(220, 220, 230);
    doc.text('SAMPLE', 105, 200, { align: 'center', angle: 45 });
  }
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

// ============================================================
// T33 — ANÁLISE ANUAL (Trânsitos + Profecção)
// ============================================================

export function generateAnnualPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;

  // PAGE 1: Cover
  renderCover(doc, 'Previsão Anual', `Trânsitos e tendências ${new Date().getFullYear()}`, options, '🔮');

  // PAGE 2: Profecção Anual
  doc.addPage();
  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Profecção Anual — Tema do Ano', margin, y);
  y += 10;

  // Calculate profection house (age mod 12 + 1)
  const birthYear = parseInt(options.birthDate.split(/[-/]/)[0]) || 1990;
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  const profectionHouse = (age % 12) + 1;
  const profectionSign = getSignIndex(chart.houses.cusps[profectionHouse - 1]);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Aos ${age} anos, a profecção anual ativa sua Casa ${profectionHouse} (${SIGN_SYMBOLS[profectionSign]} ${SIGN_NAMES[profectionSign]}). Isso significa que os temas desta casa serão centrais durante todo o ano.`, margin, y, 170);
  y += 8;

  const houseThemes = [
    'identidade, imagem pessoal e novos começos',
    'dinheiro, valores e autoestima',
    'comunicação, aprendizado e vizinhança',
    'lar, família e raízes emocionais',
    'criatividade, romance e prazer',
    'trabalho, saúde e rotina diária',
    'relacionamentos, contratos e parcerias',
    'transformação, intimidade e recursos compartilhados',
    'expansão, viagens e estudos superiores',
    'carreira, vocação e reputação pública',
    'amizades, grupos e projetos futuros',
    'espiritualidade, retiro e processamento interior',
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`Casa ${profectionHouse} — ${houseThemes[profectionHouse - 1]}`, margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Este ano é regido por ${SIGN_NAMES[profectionSign]}, o que coloca ênfase em ${houseThemes[profectionHouse - 1]}. O regente do ano ativará temas específicos conforme seus trânsitos — qualquer aspecto que forme com seu mapa natal terá peso dobrado durante este período.`, margin, y, 170);
  y += 10;

  // Resumo dos 12 meses (simplificado)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text('Tendências por Trimestre', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const quarters = [
    `Q1 (Jan-Mar): Fase de plantio — ${profectionHouse <= 6 ? 'construção interna e ajustes' : 'expansão e colheita dos ciclos anteriores'}. Trânsitos de Saturno pedem disciplina neste período.`,
    `Q2 (Abr-Jun): Fase de crescimento — atividade intensificada na Casa ${profectionHouse}. Eclipses podem trazer revelações inesperadas. Momento de ação.`,
    `Q3 (Jul-Set): Fase de colheita — resultados do que foi plantado no Q1 começam a aparecer. Júpiter traz oportunidades de expansão na área ativada.`,
    `Q4 (Out-Dez): Fase de integração — reflexão sobre o ciclo do ano. Preparação para o próximo ciclo de profecção que se inicia no aniversário.`,
  ];

  for (const q of quarters) {
    y = wrapText(doc, q, margin, y, 170);
    y += 6;
  }

  // PAGE 3: Trânsitos Principais
  doc.addPage();
  y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Trânsitos Principais do Ano', margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, 'Os trânsitos mais significativos são aqueles de planetas lentos (Júpiter, Saturno, Urano, Netuno, Plutão) que formam aspectos exatos com seus planetas natais. Eles marcam períodos de transformação, crescimento ou desafio.', margin, y, 170);
  y += 8;

  // Sample transits based on Saturn and Jupiter positions
  const saturnHouse = chart.planetHouses.saturn || 1;
  const jupiterHouse = chart.planetHouses.jupiter || 1;

  const transits = [
    { planet: 'Saturno', aspect: 'Trânsito pela Casa ' + ((saturnHouse % 12) + 1), text: 'Saturno está pedindo estrutura e responsabilidade na área que ele transita. Este trânsito dura cerca de 2.5 anos e marca um período onde o trabalho árduo é recompensado com resultados duradouros. Nada é fácil, mas tudo que você constrói agora permanece.' },
    { planet: 'Júpiter', aspect: 'Trânsito pela Casa ' + ((jupiterHouse + 2) % 12 + 1), text: 'Júpiter traz expansão, otimismo e oportunidades para esta área da vida. Aproveite este trânsito para sonhar maior — as portas se abrem, mas você precisa cruzá-las com ação.' },
    { planet: 'Eclipses', aspect: 'Eixo nodal ativo', text: 'Os eclipses deste ano ativam temas de destino e transformação irreversível. Fique atento às lunações que tocam seus planetas natais — elas aceleram processos que já estavam em gestação.' },
  ];

  for (const t of transits) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.brand);
    doc.text(`${t.planet} — ${t.aspect}`, margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, t.text, margin, y, 170);
    y += 8;
  }

  // CTA + Watermark
  addWatermark(doc);
  renderCTAPage(doc, 'Relatório de Previsão Anual', 'R$ 34,90');
  addFooters(doc, options.profileName);

  return doc.output('blob');
}

// ============================================================
// T34 — RELACIONAMENTO (Sinastria + Compatibilidade)
// ============================================================

export function generateRelationshipPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;

  // PAGE 1: Cover
  const subtitle = options.partnerName ? `${options.profileName} & ${options.partnerName}` : 'Seu potencial amoroso';
  renderCover(doc, 'Relatório de Relacionamento', subtitle, options, '♡');

  // PAGE 2: Padrão Amoroso
  doc.addPage();
  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Seu Padrão Amoroso', margin, y);
  y += 10;

  const venusSign = getSignIndex(chart.positions.venus?.longitude || 0);
  const marsSign = getSignIndex(chart.positions.mars?.longitude || 0);
  const venusHouse = chart.planetHouses.venus || 1;
  const marsHouse = chart.planetHouses.mars || 1;
  const moonSign = getSignIndex(chart.positions.moon?.longitude || 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A sinastria não diz se um relacionamento "vai funcionar". Diz o que ele veio ensinar a ambos. O que você encontra no outro não é acidental — as energias que se ativam nessa conexão já existiam em você.`, margin, y, 170);
  y += 10;

  // Venus section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`♀ Vênus em ${SIGN_NAMES[venusSign]} — Casa ${venusHouse}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Vênus revela o que faz você se sentir amado e valorizado. Em ${SIGN_NAMES[venusSign]}, sua forma de amar tem as qualidades desse signo como linguagem afetiva primária. Na Casa ${venusHouse}, é nessa área de vida que o amor se manifesta com mais naturalidade.`, margin, y, 170);
  y += 8;

  // Mars section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`♂ Marte em ${SIGN_NAMES[marsSign]} — Casa ${marsHouse}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Marte mostra o que te atrai instintivamente — o desejo que surge antes de qualquer pensamento racional. Em ${SIGN_NAMES[marsSign]}, a energia sexual e a forma de perseguir o que deseja seguem a tônica deste signo.`, margin, y, 170);
  y += 8;

  // Moon section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`☽ Lua em ${SIGN_NAMES[moonSign]} — Necessidades emocionais`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A Lua revela o que você precisa emocionalmente num relacionamento para se sentir seguro. Em ${SIGN_NAMES[moonSign]}, suas necessidades de nutrição emocional seguem essa linguagem. Um parceiro que compreenda e respeite essas necessidades cria o alicerce de um vínculo duradouro.`, margin, y, 170);

  // PAGE 3: Descendente + Casa 7
  doc.addPage();
  y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('O Parceiro que Você Atrai', margin, y);
  y += 10;

  const descSign = getSignIndex((chart.houses.ascendant + 180) % 360);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Seu Descendente (cúspide da Casa 7) em ${SIGN_NAMES[descSign]} indica a qualidade de energia que você busca — ou projeta — nos parceiros. Não é necessariamente o signo solar do parceiro, mas sim as qualidades que te complementam.`, margin, y, 170);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`Descendente em ${SIGN_SYMBOLS[descSign]} ${SIGN_NAMES[descSign]}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const descTexts = [
    'Você atrai parceiros corajosos, diretos e independentes. Busca alguém que te desafie a sair da zona de conforto e agir com mais autonomia.',
    'Você atrai parceiros estáveis, sensuais e confiáveis. Busca alguém que traga grounding e consistência para sua vida.',
    'Você atrai parceiros comunicativos, curiosos e mentalmente estimulantes. Busca diálogo e leveza na relação.',
    'Você atrai parceiros acolhedores, emocionais e protetores. Busca segurança emocional e senso de família.',
    'Você atrai parceiros carismáticos, generosos e expressivos. Busca alguém que te faça sentir especial e celebrado.',
    'Você atrai parceiros competentes, práticos e detalhistas. Busca alguém que organize e cuide com atenção.',
    'Você atrai parceiros harmoniosos, diplomáticos e justos. Busca equilíbrio e parceria verdadeira.',
    'Você atrai parceiros intensos, profundos e transformadores. Busca verdade absoluta e intimidade sem superficialidade.',
    'Você atrai parceiros aventureiros, otimistas e livres. Busca expansão e crescimento compartilhado.',
    'Você atrai parceiros maduros, ambiciosos e responsáveis. Busca solidez e comprometimento de longo prazo.',
    'Você atrai parceiros originais, independentes e visionários. Busca liberdade e estimulação intelectual.',
    'Você atrai parceiros sensíveis, intuitivos e compassivos. Busca conexão espiritual e empatia profunda.',
  ];

  y = wrapText(doc, descTexts[descSign], margin, y, 170);
  y += 10;

  // Aspectos Venus-Mars
  const venusAspects = chart.aspects.filter(a => a.planet1 === 'venus' || a.planet2 === 'venus').slice(0, 3);
  if (venusAspects.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.brand);
    doc.text('Aspectos de Vênus — Dinâmicas de Amor', margin, y);
    y += 8;

    for (const asp of venusAspects) {
      const other = asp.planet1 === 'venus' ? asp.planet2 : asp.planet1;
      const interp = getAspectInterpretation('venus', other, asp.type);
      if (interp && y < 255) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text(`♀ Vênus ${asp.type === 'conjunction' ? '☌' : asp.type === 'trine' ? '△' : asp.type === 'square' ? '□' : '☍'} ${PLANET_NAMES[other] || other}`, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        y = wrapText(doc, interp, margin, y, 170);
        y += 6;
      }
    }
  }

  // CTA
  addWatermark(doc);
  renderCTAPage(doc, 'Relatório de Relacionamento', 'R$ 34,90');
  addFooters(doc, options.profileName);

  return doc.output('blob');
}

// ============================================================
// T35 — PSICOLÓGICO PROFUNDO (Sombra, Plutão, Quíron, Casa 12)
// ============================================================

export function generatePsychologicalPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;

  // PAGE 1: Cover
  renderCover(doc, 'Análise Psicológica Profunda', 'Sombra, ferida e transformação', options, '🔮');

  // PAGE 2: Plutão e a Sombra
  doc.addPage();
  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('♇ Plutão — Onde Está Sua Sombra', margin, y);
  y += 10;

  const plutoHouse = chart.planetHouses.pluto || 1;
  const plutoSign = getSignIndex(chart.positions.pluto?.longitude || 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, 'Quando Plutão está ativo, ele não destrói — ele revela. O que parece estar se desmontando já estava desgastado por dentro. Plutão simplesmente traz à tona o que precisava ser visto. A intensidade que você sente não é anormal; é a profundidade de sua própria psique pedindo atenção.', margin, y, 170);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`Plutão na Casa ${plutoHouse} em ${SIGN_NAMES[plutoSign]}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const plutoText = PLUTO_IN_HOUSE[plutoHouse - 1] || '';
  y = wrapText(doc, plutoText, margin, y, 170);
  y += 8;

  // Hard aspects
  const hardAspects = chart.aspects.filter(a => (a.type === 'square' || a.type === 'opposition') && (a.planet1 === 'pluto' || a.planet2 === 'pluto'));
  if (hardAspects.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.red);
    doc.text('Tensões de Plutão — Pontos de Transformação Forçada', margin, y);
    y += 7;

    for (const asp of hardAspects.slice(0, 2)) {
      const other = asp.planet1 === 'pluto' ? asp.planet2 : asp.planet1;
      const interp = getAspectInterpretation('pluto', other, asp.type) || getAspectInterpretation(other, 'pluto', asp.type);
      if (interp && y < 260) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COLORS.text);
        doc.text(`${PLANET_NAMES[other] || other} ${asp.type === 'square' ? '□' : '☍'} Plutão`, margin, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        y = wrapText(doc, interp, margin, y, 170);
        y += 6;
      }
    }
  }

  // PAGE 3: Quíron — A Ferida que Cura
  doc.addPage();
  y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('⚷ Quíron — A Ferida que Cura', margin, y);
  y += 10;

  const chironHouse = chart.planetHouses.chiron || 1;
  const chironSign = getSignIndex(chart.positions.chiron?.longitude || 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, 'Quíron não marca um ponto fraco — marca onde você foi iniciado. Curandeiros não são os que estão sem dor; são os que aprenderam a permanecer presentes dentro dela. A área onde Quíron está é precisamente onde você tem algo genuíno a oferecer ao mundo.', margin, y, 170);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`Quíron na Casa ${chironHouse} em ${SIGN_NAMES[chironSign]}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const chironHouseText = CHIRON_IN_HOUSE[chironHouse - 1] || '';
  y = wrapText(doc, chironHouseText, margin, y, 170);
  y += 5;
  const chironSignText = CHIRON_IN_SIGN[chironSign] || '';
  y = wrapText(doc, chironSignText, margin, y, 170);
  y += 8;

  // Casa 12 section
  const planetsIn12 = Object.entries(chart.planetHouses).filter(([_, h]) => h === 12).map(([p]) => p);
  if (planetsIn12.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.brand);
    doc.text('Casa 12 — Padrões Ocultos do Inconsciente', margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const planetList = planetsIn12.map(p => PLANET_NAMES[p] || p).join(', ');
    y = wrapText(doc, `Você tem ${planetList} na Casa 12. A 12ª casa não é uma sentença — é o repositório da sua profundidade. O que está aqui não é fraqueza; é o que você ainda não aprendeu a nomear. Padrões vistos já não controlam da mesma forma.`, margin, y, 170);
  }

  // CTA
  addWatermark(doc);
  renderCTAPage(doc, 'Relatório Psicológico Profundo', 'R$ 39,90');
  addFooters(doc, options.profileName);

  return doc.output('blob');
}

// ============================================================
// T36 — CARREIRA (MC, Casa 10, Saturno, Casa 6, Júpiter)
// ============================================================

export function generateCareerPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;

  // PAGE 1: Cover
  renderCover(doc, 'Carreira e Vocação', 'Propósito profissional revelado pelo mapa', options, '♄');

  // PAGE 2: MC + Casa 10
  doc.addPage();
  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Meio do Céu — Sua Marca no Mundo', margin, y);
  y += 10;

  const mcSign = getSignIndex(chart.houses.midheaven);
  const saturnHouse = chart.planetHouses.saturn || 1;
  const saturnSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const jupiterHouse = chart.planetHouses.jupiter || 1;
  const jupiterSign = getSignIndex(chart.positions.jupiter?.longitude || 0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, 'Seu propósito de carreira não está apenas na 10ª casa. Está na interseção do que você foi feito para fazer (Sol), do que genuinamente valoriza (Vênus), e do que o mundo precisa que você ofereça (Casa 10). O MC indica a direção profissional natural.', margin, y, 170);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`MC em ${SIGN_SYMBOLS[mcSign]} ${SIGN_NAMES[mcSign]}`, margin, y);
  y += 7;

  const mcDescriptions = [
    'Carreira que exige liderança, pioneirismo e iniciativa. Você se destaca quando pode agir independentemente e abrir caminhos novos.',
    'Carreira construída com paciência, senso estético e valores sólidos. Sucesso em campos que envolvem beleza, finanças ou recursos tangíveis.',
    'Carreira que envolve comunicação, ensino, escrita ou conexões diversas. Versatilidade é sua vantagem — pode ter múltiplas atuações simultâneas.',
    'Carreira que envolve cuidado, nutrição ou criação de ambientes seguros. Sucesso quando combina sensibilidade emocional com habilidade prática.',
    'Carreira que exige presença, criatividade e liderança carismática. Você brilha quando está no centro — entretenimento, educação ou artes.',
    'Carreira construída com precisão, serviço e excelência técnica. Sucesso em campos que valorizam análise, saúde ou organização.',
    'Carreira que envolve diplomacia, estética, justiça ou parcerias. Sucesso quando pode harmonizar e mediar — direito, arte, consultoria.',
    'Carreira que envolve transformação, investigação ou poder. Sucesso em campos profundos — psicologia, finanças, pesquisa, terapia.',
    'Carreira que envolve ensino, viagens, filosofia ou expansão. Sucesso quando pode inspirar e ampliar horizontes — educação superior, publicações.',
    'Carreira construída com disciplina, estratégia e visão de longo prazo. Liderança executiva, política ou qualquer campo que exija maturidade.',
    'Carreira que envolve inovação, tecnologia ou causas sociais. Sucesso quando pode romper padrões — empreendedorismo disruptivo, ciência.',
    'Carreira que envolve arte, espiritualidade, cura ou compaixão. Sucesso quando serve a algo maior — música, terapia, cinema, serviço social.',
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, mcDescriptions[mcSign], margin, y, 170);
  y += 10;

  // Saturno
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`♄ Saturno na Casa ${saturnHouse} em ${SIGN_NAMES[saturnSign]}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const satText = SATURN_IN_HOUSE[saturnHouse - 1] || '';
  y = wrapText(doc, satText, margin, y, 170);
  y += 5;
  const satSignText = SATURN_IN_SIGN[saturnSign] || '';
  y = wrapText(doc, satSignText, margin, y, 170);

  // PAGE 3: Júpiter + Casa 6
  doc.addPage();
  y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Abundância e Trabalho Diário', margin, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`♃ Júpiter na Casa ${jupiterHouse} em ${SIGN_NAMES[jupiterSign]}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Júpiter indica onde você tem "sorte" — na verdade, sabedoria já construída. Na Casa ${jupiterHouse}, as oportunidades profissionais fluem com mais facilidade quando você se alinha com essa área.`, margin, y, 170);
  y += 5;
  const jupHouseText = JUPITER_IN_HOUSE[jupiterHouse - 1] || '';
  y = wrapText(doc, jupHouseText, margin, y, 170);
  y += 5;
  const jupSignText = JUPITER_IN_SIGN[jupiterSign] || '';
  y = wrapText(doc, jupSignText, margin, y, 170);
  y += 10;

  // Casa 6
  const h6Sign = getSignIndex(chart.houses.cusps[5]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`Casa 6 em ${SIGN_NAMES[h6Sign]} — Rotina de Trabalho`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Sua rotina profissional funciona melhor quando segue a tônica de ${SIGN_NAMES[h6Sign]}. Isso define o ambiente, o ritmo e o tipo de tarefa diária em que você é mais produtivo e saudável.`, margin, y, 170);

  // CTA
  addWatermark(doc);
  renderCTAPage(doc, 'Relatório de Carreira e Vocação', 'R$ 29,90');
  addFooters(doc, options.profileName);

  return doc.output('blob');
}

// ============================================================
// T37 — SETE PECADOS (Sombra lúdica por planeta)
// ============================================================

export function generateSevenSinsPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;

  // PAGE 1: Cover
  renderCover(doc, 'Os Sete Pecados do Seu Mapa', 'Sua sombra revelada com humor e verdade', options, '😈');

  // PAGE 2: Introdução + 3 pecados
  doc.addPage();
  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('A Sombra Lúdica do Zodíaco', margin, y);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, 'Cada planeta carrega uma sombra — não como defeito, mas como a versão não integrada de uma qualidade poderosa. Quando ignoramos a sombra, ela age através de nós sem nossa permissão. Quando a encaramos com humor e honestidade, ela se transforma em força consciente. Eis seus sete pecados astrológicos:', margin, y, 170);
  y += 10;

  const sunSign = getSignIndex(chart.positions.sun?.longitude || 0);
  const moonSign = getSignIndex(chart.positions.moon?.longitude || 0);
  const venusSign = getSignIndex(chart.positions.venus?.longitude || 0);
  const marsSign = getSignIndex(chart.positions.mars?.longitude || 0);
  const jupiterSign = getSignIndex(chart.positions.jupiter?.longitude || 0);
  const saturnSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const plutoSign = getSignIndex(chart.positions.pluto?.longitude || 0);

  // Mapeamento pecado → planeta
  const sins = [
    { sin: 'ORGULHO', planet: 'Sol', sign: SIGN_NAMES[sunSign], emoji: '👑',
      text: getSinText('orgulho', sunSign) },
    { sin: 'GULA', planet: 'Lua', sign: SIGN_NAMES[moonSign], emoji: '🍰',
      text: getSinText('gula', moonSign) },
    { sin: 'LUXÚRIA', planet: 'Vênus', sign: SIGN_NAMES[venusSign], emoji: '🔥',
      text: getSinText('luxuria', venusSign) },
    { sin: 'IRA', planet: 'Marte', sign: SIGN_NAMES[marsSign], emoji: '⚡',
      text: getSinText('ira', marsSign) },
    { sin: 'AVAREZA', planet: 'Saturno', sign: SIGN_NAMES[saturnSign], emoji: '💰',
      text: getSinText('avareza', saturnSign) },
    { sin: 'INVEJA', planet: 'Plutão', sign: SIGN_NAMES[plutoSign], emoji: '🐍',
      text: getSinText('inveja', plutoSign) },
    { sin: 'PREGUIÇA', planet: 'Júpiter', sign: SIGN_NAMES[jupiterSign], emoji: '🛋',
      text: getSinText('preguica', jupiterSign) },
  ];

  // First 3 sins on page 2
  for (let i = 0; i < 3; i++) {
    const s = sins[i];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.brand);
    doc.text(`${s.emoji} ${s.sin} — ${s.planet} em ${s.sign}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, s.text, margin, y, 170);
    y += 8;
  }

  // PAGE 3: Remaining 4 sins
  doc.addPage();
  y = 30;

  for (let i = 3; i < 7; i++) {
    const s = sins[i];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.brand);
    doc.text(`${s.emoji} ${s.sin} — ${s.planet} em ${s.sign}`, margin, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, s.text, margin, y, 170);
    y += 8;
  }

  // CTA
  addWatermark(doc);
  renderCTAPage(doc, 'Relatório dos Sete Pecados', 'R$ 19,90');
  addFooters(doc, options.profileName);

  return doc.output('blob');
}

function getSinText(sin: string, signIdx: number): string {
  const signName = SIGN_NAMES[signIdx];
  const texts: Record<string, string[]> = {
    orgulho: [
      'Seu orgulho se manifesta como necessidade de ser o primeiro e o melhor — quando não lidera, sente que não existe.',
      'Seu orgulho se manifesta como teimosia inabalável — quando acha que está certo, nenhuma força no universo te move.',
      'Seu orgulho se manifesta como superioridade intelectual — "eu já sabia disso" é sua frase favorita.',
      'Seu orgulho se manifesta como controle emocional — "ninguém me faz chorar" (mesmo quando deveria).',
      'Seu orgulho se manifesta como necessidade de aplausos — sem reconhecimento, a motivação simplesmente desaparece.',
      'Seu orgulho se manifesta como perfeccionismo — se não pode fazer perfeito, prefere não fazer.',
      'Seu orgulho se manifesta como falsa modéstia — diz que "tanto faz" mas por dentro está medindo quem ganhou.',
      'Seu orgulho se manifesta como poder silencioso — sabe algo sobre todos e guarda como moeda de troca.',
      'Seu orgulho se manifesta como certeza moral — sua verdade é A Verdade e quem discorda "ainda não entendeu".',
      'Seu orgulho se manifesta como ambição sem fim — se não está subindo, sente que está falhando.',
      'Seu orgulho se manifesta como diferença intelectual — "sou incompreendido" é mais confortável que pertencer.',
      'Seu orgulho se manifesta como superioridade espiritual — "já transcendi isso" (mas o ego continua ali).',
    ],
    gula: [
      'Sua gula é por adrenalina e novidade — devora experiências sem mastigar.',
      'Sua gula é literal — comida, conforto, compras, prazer sensorial em excesso.',
      'Sua gula é por informação — consome conteúdo compulsivamente sem digerir.',
      'Sua gula é emocional — busca conforto afetivo como se estivesse sempre faminto.',
      'Sua gula é por atenção — precisa de "mais" amor, mais aplausos, mais drama.',
      'Sua gula é por produtividade — se não está fazendo algo, sente culpa.',
      'Sua gula é por harmonia — consome aprovação alheia como se a vida dependesse disso.',
      'Sua gula é por intensidade — se não está vivendo no limite, parece que não está vivendo.',
      'Sua gula é por experiências — mais viagens, mais cursos, mais livros, nunca o suficiente.',
      'Sua gula é por status — mais conquistas, mais diplomas, mais reconhecimento.',
      'Sua gula é por novidade intelectual — descarta ideias antes de implementá-las.',
      'Sua gula é por fusão — se perde no outro, na arte, na espiritualidade, fugindo de si.',
    ],
    luxuria: [
      'Sua luxúria é impaciente — quer tudo agora, sem esperar que o desejo amadureça.',
      'Sua luxúria é possessiva — "o que é meu é meu" se aplica a pessoas.',
      'Sua luxúria é mental — fantasia mais do que vive; a ideia excita mais que a realidade.',
      'Sua luxúria é emocional — confunde necessidade com desejo; se apega antes de sentir.',
      'Sua luxúria é performática — precisa que o desejo seja visto, admirado, invejado.',
      'Sua luxúria é seletiva demais — tantos critérios que o prazer fica bloqueado pela análise.',
      'Sua luxúria é relacional — não consegue desejar sozinho; precisa do espelho do outro.',
      'Sua luxúria é obsessiva — quando deseja, consome a pessoa com intensidade que assusta.',
      'Sua luxúria é aventureira — precisa de novidade constante para manter a chama.',
      'Sua luxúria é contida — se permite desejar tão pouco que o corpo esquece o que é prazer.',
      'Sua luxúria é cerebral — precisa de conexão mental antes do corpo se acender.',
      'Sua luxúria é transcendente — busca fusão espiritual e pode se decepcionar com o terreno.',
    ],
    ira: [
      'Sua ira é explosiva e instantânea — incendeia tudo e esquece 10 minutos depois.',
      'Sua ira é lenta mas destrutiva — represa por meses e quando estoura, é terremoto.',
      'Sua ira é verbal — corta com palavras afiadas e depois finge que era "só brincadeira".',
      'Sua ira é passiva-agressiva — faz silêncio, se retira, pune com ausência.',
      'Sua ira é dramática — exige que o mundo inteiro saiba que foi ofendido.',
      'Sua ira é fria e cortante — listas mentais de erros alheios que nunca expira.',
      'Sua ira é indireta — sorri por fora enquanto por dentro calcula a vingança justa.',
      'Sua ira é nuclear — quando traído, não apenas se afasta; destrói pontes e salga a terra.',
      'Sua ira é moral — "como alguém pode ser tão errado?" é combustível infinito.',
      'Sua ira é de autoridade — raiva fria contra quem não respeita hierarquia e competência.',
      'Sua ira é de princípio — se inflama contra injustiça sistêmica, mesmo quando não é pessoal.',
      'Sua ira se dissolve em mágoa — transforma raiva em dor e depois em vitimismo.',
    ],
    avareza: [
      'Sua avareza é com tempo — não aceita desperdiçar um segundo em algo que não vale a pena.',
      'Sua avareza é clássica — com dinheiro, com posses, com o que é seu por direito.',
      'Sua avareza é com atenção — distribui presença entre tantas pessoas que ninguém tem você de verdade.',
      'Sua avareza é emocional — dá pouco de si por medo de que levem demais.',
      'Sua avareza é com o palco — não divide os holofotes com facilidade.',
      'Sua avareza é com conhecimento — guarda informação como vantagem competitiva.',
      'Sua avareza é de energia — protege tanto seu equilíbrio que pode se tornar egoísmo disfarçado de autocuidado.',
      'Sua avareza é de poder — retém controle porque soltar significa vulnerabilidade.',
      'Sua avareza é com liberdade — retém tanto a própria independência que não permite intimidade real.',
      'Sua avareza é com reconhecimento — merece tudo porque trabalhou, e quem não trabalhou não merece nada.',
      'Sua avareza é com originalidade — se alguém copia sua ideia, é crime imperdoável.',
      'Sua avareza é invertida — dá tanto que depois cobra emocionalmente: "eu dei tudo e você...".',
    ],
    inveja: [
      'Sua inveja é competitiva — "por que ele conseguiu antes de mim?" queima por dentro.',
      'Sua inveja é material — olha o que o outro tem e sente que deveria ser seu.',
      'Sua inveja é intelectual — ressente quem é mais articulado ou tem mais acesso a informação.',
      'Sua inveja é familiar — compara sua vida emocional com a de famílias "perfeitas".',
      'Sua inveja é de brilho — ressente quem recebe atenção sem aparentemente se esforçar.',
      'Sua inveja é de competência — se corrói quando alguém faz melhor que você.',
      'Sua inveja é relacional — ressente casais felizes quando está sozinho.',
      'Sua inveja é de poder — ressente quem tem influência que deveria ser sua.',
      'Sua inveja é existencial — ressente quem parece ter encontrado "o sentido" antes de você.',
      'Sua inveja é de status — mede seu valor pela distância entre você e quem está acima.',
      'Sua inveja é de pertencimento — ressente grupos que parecem se aceitar naturalmente.',
      'Sua inveja é espiritual — ressente quem parece ter paz interior que você não alcança.',
    ],
    preguica: [
      'Sua preguiça é de excesso — tanto entusiasmo por novos projetos que nenhum é concluído.',
      'Sua preguiça é de conforto — quando a vida está boa, por que mudar?',
      'Sua preguiça é de dispersão — faz mil coisas de uma vez e nenhuma com profundidade.',
      'Sua preguiça é emocional — evita trabalhar questões internas escondendo-se no cuidar dos outros.',
      'Sua preguiça é de drama — espera que a vida seja emocionante sem esforço próprio.',
      'Sua preguiça é de perfeccionismo — não começa porque nunca será bom o suficiente.',
      'Sua preguiça é de decisão — procrastina escolhas esperando que o universo decida por você.',
      'Sua preguiça é de transparência — prefere não se expor a fazer o trabalho de se abrir.',
      'Sua preguiça é de aterrissar — planeja o futuro infinitamente sem agir no presente.',
      'Sua preguiça é de descanso — trabalha tanto que nunca para para viver.',
      'Sua preguiça é de compromisso — mantém tudo em aberto para não perder opções.',
      'Sua preguiça é de materializar — sonha, visualiza, medita... mas não age.',
    ],
  };

  return (texts[sin] || [])[signIdx] || `Seu ${sin} em ${signName} se manifesta de forma única — o relatório completo detalha os mecanismos e o caminho de integração.`;
}
