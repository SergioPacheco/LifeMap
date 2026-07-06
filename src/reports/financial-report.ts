// ============================================================
// FINANCIAL-REPORT.TS — Financial Map PDF Generator
// Covers: Casa 2, Casa 8, Venus, Jupiter, Saturn, House 2 Ruler
// ============================================================

import { jsPDF } from 'jspdf';
import type { NatalChart } from '../engine/types';
import { getSignIndex } from '../engine/calculations';
import { JUPITER_IN_HOUSE, SATURN_IN_HOUSE } from '../engine/outer-planets';
import { JUPITER_IN_SIGN, SATURN_IN_SIGN } from '../engine/outer-planets';
import { getAspectInterpretation } from '../engine/aspect-interpretations';
import { getInterpretations } from '../engine/interpretations/index';
import type { ReportOptions } from './report-generators';

// ============================================================
// SHARED CONSTANTS (mirrored from report-generators.ts)
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

// ============================================================
// HELPERS (copied pattern from report-generators.ts)
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

function checkPageBreak(doc: jsPDF, y: number): number {
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
  doc.text('Esta foi uma amostra gratuita!', w / 2, y, { align: 'center' });
  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(`O relatório completo "${reportName}" contém`, w / 2, y, { align: 'center' });
  doc.text('15-20 páginas com interpretação profunda e personalizada.', w / 2, y + 14, { align: 'center' });
  y += 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.gold);
  doc.text(`Versão completa: R$ ${price}`, w / 2, y, { align: 'center' });
  y += 25;
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('www.lifemap.pro/reports', w / 2, y, { align: 'center' });
  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Compre agora e baixe instantaneamente — 100% no navegador.', w / 2, y, { align: 'center' });

  addFooters(doc, options.profileName);
  return doc.output('blob') as unknown as Blob;
}

// ============================================================
// FINANCIAL INTERPRETATION DATA
// ============================================================

// House 2 sign descriptions — money-making style
const H2_SIGN_TEXTS: string[] = [
  'With Aries on the cusp of the 2nd house, you earn through initiative, courage and direct action. You are drawn to entrepreneurial ventures and first-mover opportunities. Your income often arrives in bursts rather than steady streams — the challenge is building reserves during the peaks. Self-worth is tied to independence; when you can act autonomously, your earning power expands naturally.',
  'Taurus on the 2nd house cusp is one of the strongest financial placements in the zodiac. You build wealth slowly and surely, with a natural gift for accumulation and long-term investment. Sensory pleasures — good food, beautiful spaces, quality craftsmanship — are genuine needs, not indulgences. Your money-making style rewards patience and consistency over speed.',
  'Gemini on the 2nd house cusp suggests income through communication, information and versatility. Multiple income streams feel natural and even necessary to you. Writing, teaching, sales, consulting or any field that monetises your ability to connect ideas and people aligns with this placement. The challenge is focus — diversification can scatter energy across too many projects.',
  'Cancer on the 2nd house cusp links finances to emotional security. You earn best when you feel safe, nurtured and aligned with your values. Real estate, hospitality, food, caregiving and family-oriented businesses often attract this placement. Financial decisions are emotionally informed — which can be a strength (deep intuition) or a weakness (fear-driven hoarding).',
  'Leo on the 2nd house cusp creates a money-making style centred on creativity, generosity and personal brand. You earn more when you are visible and celebrated. Industries where self-expression, entertainment or leadership matter offer fertile ground. You spend generously — sometimes too generously — because money feels like a vehicle for joy and impact, not just security.',
  'Virgo on the 2nd house cusp produces income through service, precision and mastery of skill. You are most financially comfortable when you earn through something genuinely useful and expertly delivered. Health, analysis, editing, data, craftsmanship and process improvement are natural domains. The challenge is underpricing your services — perfectionism can disguise itself as modesty.',
  'Libra on the 2nd house cusp connects earnings to partnerships, aesthetics and relational intelligence. You often earn more in collaboration than alone, and you have an instinct for fair exchange. Design, diplomacy, law, art, beauty and consulting align with this placement. The challenge is avoiding financial codependency — knowing your worth independent of what others reflect back.',
  'Scorpio on the 2nd house cusp is one of the most financially intense placements. You are drawn to other people\'s resources — investments, inheritance, joint ventures, debt restructuring. Your earning style is all-or-nothing; you can generate significant wealth or experience dramatic losses. Trust, power dynamics and the psychology of money are central themes throughout life.',
  'Sagittarius on the 2nd house cusp links income to expansion, philosophy and reaching beyond familiar horizons. You earn through teaching, publishing, travel, higher education, international business or anything that broadens perspective. Generosity can outpace income if not managed — the belief that "more will always come" needs to be balanced with practical planning.',
  'Capricorn on the 2nd house cusp is one of the most capable financial positions in astrology. You understand that wealth is built over decades, not days. Structure, discipline and long-term investment are your natural tools. The challenge is allowing yourself to enjoy what you build — frugality can tip into scarcity mindset even when resources are genuinely abundant.',
  'Aquarius on the 2nd house cusp creates income through innovation, technology and unconventional approaches. You may monetise ideas ahead of their time, sometimes struggling to find the right market before it exists. Cryptocurrency, tech startups, social enterprises and any frontier field can attract this placement. Financial freedom — not wealth for its own sake — is the real motivator.',
  'Pisces on the 2nd house cusp links finances to creativity, spirituality, compassion and intuition. You may earn through art, healing, music, film, therapy or any field that serves the soul. Money can feel mysterious or elusive — not because you lack talent, but because your relationship with material reality is more fluid than most. Clear financial structures and trusted advisors provide essential grounding.',
];

// House 8 sign descriptions — shared resources, depth
const H8_SIGN_TEXTS: string[] = [
  'Aries on the 8th house cusp brings directness and courage to the domain of shared resources. You approach investment risk, inheritances and joint finances with initiative. Conflicts over money can be fierce but short-lived. Transformation tends to happen quickly and dramatically in your life — crises ignite fast action rather than prolonged processing.',
  'Taurus on the 8th house cusp can create a complex relationship with other people\'s money and shared assets. You are drawn to stable, tangible investments — property, bonds, physical assets. Releasing control over joint finances can be deeply challenging. Inheritances, when they come, tend to arrive in material, lasting form. Psychological transformation comes slowly but proves permanent.',
  'Gemini on the 8th house cusp brings intellectual curiosity to the deepest financial and psychological territory. You research investments thoroughly and are drawn to information asymmetry as an asset. Multiple joint financial arrangements are possible across a lifetime. You process transformation by talking, writing and making sense of what happened — narrative is how you metabolise crisis.',
  'Cancer on the 8th house cusp intensifies emotional entanglement with shared resources and inheritance. Family money — in all its complexity — plays a significant role in your financial story. You may inherit not just assets but also emotional patterns around scarcity or abundance. Your investment instincts are guided by emotional intelligence and care for future generations.',
  'Leo on the 8th house cusp brings pride and creative energy to joint finances and deep transformation. Power struggles over shared resources can be intense — you do not yield control easily. Investment in brand, creative ventures and personal legacy aligns with this placement. Transformative experiences tend to come through moments where your ego is challenged to the core.',
  'Virgo on the 8th house cusp applies analytical precision to shared finances, investments and debt. You research before committing to any joint financial arrangement and expect the same diligence from partners. Healthcare investments, process improvement tools and data-driven assets attract this placement. Transformation comes through refining and perfecting, not through dramatic upheaval.',
  'Libra on the 8th house cusp creates a deep need for fairness and balance in all shared financial arrangements. Prenuptial agreements, legal partnerships and carefully negotiated contracts provide security. Investment decisions benefit from a trusted advisor — a second perspective reduces the paralysis that comes with weighing every option. Transformation arrives through relationship itself.',
  'Scorpio on the 8th house cusp is the sign\'s natural home — this is the most powerful and intense combination. You have profound instincts about investment, debt, power and regeneration. You can sense financial turning points before others do. The shadow side is obsession with control, secrecy around money, or using financial leverage manipulatively. Extraordinary wealth or transformation is possible when this energy is directed consciously.',
  'Sagittarius on the 8th house cusp expands shared financial territory across borders, philosophies and cultures. International investments, foreign inheritance, cross-cultural partnerships and philosophical frameworks for wealth creation all resonate. You may experience transformative loss that ultimately opens entirely new horizons — the fire burns away what was limiting to reveal something vaster.',
  'Capricorn on the 8th house cusp approaches shared resources with discipline, structure and long-term strategy. Joint financial plans tend to be carefully constructed and rigorously maintained. You may inherit responsibility alongside assets — the executor role, the family financial caretaker. Transformation through this placement is slow, structural and permanent: things rarely return to their previous form.',
  'Aquarius on the 8th house cusp brings innovation and detachment to the territory of shared wealth and deep psychology. You may benefit from group investment models, cooperative financing or technology-driven financial tools. Transformation arrives through sudden, unexpected rupture — situations that seem chaotic but ultimately liberate. Freedom from financial entanglement may be as valuable as accumulation.',
  'Pisces on the 8th house cusp makes the boundary between your finances and others\' genuinely permeable. Careful documentation of shared financial arrangements protects you from confusion or exploitation. Spiritual inheritances — wisdom traditions, healing gifts, creative legacies — may prove as significant as material ones. Transformation comes through surrender, not force; profound change happens when you stop trying to control the outcome.',
];

// Venus in house — what you attract, financial relevance
const VENUS_IN_HOUSE_FINANCIAL: string[] = [
  'Venus in the 1st house places attractiveness, charm and personal magnetism at the centre of your financial profile. You naturally draw resources through your presence and personality. Your personal brand IS the business. Beauty, wellness, fashion and any field where appearance and first impressions matter offer natural income pathways.',
  'Venus in the 2nd house is one of the strongest placements for financial attraction. You naturally draw money, beautiful objects and sensory pleasures. Your values are clear and your tastes refined — you spend on quality and expect quality in return. This placement supports income through Venusian fields: art, design, beauty, hospitality and luxury.',
  'Venus in the 3rd house draws resources through communication, networking and ideas. Your charm in conversation opens financial doors that talent alone might not. Writing, podcasting, social media, sales and teaching leverage this placement well. Sibling relationships or local community connections may carry financial significance.',
  'Venus in the 4th house attracts resources connected to home, family and emotional security. Real estate, interior design, hospitality, food and family businesses resonate. Inherited values — and sometimes inherited wealth — shape your relationship with money. Creating beautiful, safe environments is both a personal need and a potential income source.',
  'Venus in the 5th house draws income through creativity, entertainment, romance and play. You attract resources when you are expressing your authentic creative voice. Children\'s products, performing arts, gaming, luxury experiences and romantic markets can be financially fertile. Speculative investments may also attract — though the thrill of risk must be watched carefully.',
  'Venus in the 6th house attracts resources through service, skill and useful beauty. Your work has aesthetic quality — you care that what you produce is not only functional but well-made. Healthcare, nutrition, wellness, craft and quality-focused service industries suit this placement. Financial health and physical health are directly connected for you.',
  'Venus in the 7th house is in its natural home and draws significant resources through partnership. Business partnerships, client relationships and spousal finances often provide major income channels. Your negotiation skills are naturally elegant — you find win-win solutions with ease. Contracts, agreements and the beauty of fair exchange are themes throughout your financial life.',
  'Venus in the 8th house draws resources through depth, intimacy and other people\'s assets. Inheritance, joint investment, investment banking, psychology and transformative services may feature. You have instincts for finding value where others see only risk. This placement can attract significant wealth through shared ventures when trust is present.',
  'Venus in the 9th house draws income through expansion — foreign trade, publishing, higher education, philosophy and international connections. Your financial opportunities often arise when you go beyond familiar territory. Teaching abroad, travel writing, international partnerships or cross-cultural ventures can be highly rewarding.',
  'Venus in the 10th house is highly visible — you attract resources through professional reputation, public standing and career achievement. Your charm works well in public life. Fashion, the arts, diplomacy, public relations and any career with strong brand presence suit this placement. Your professional relationships often carry aesthetic or values-based qualities.',
  'Venus in the 11th house draws income through community, collaboration and forward-thinking networks. Group investments, social enterprises, technology platforms and community-based products align well. Your financial circle of trust is wide and eclectic. Dreams of future abundance often materialise through collective rather than individual effort.',
  'Venus in the 12th house attracts resources through behind-the-scenes work, spiritual service and solitary creativity. Music, visual art, therapy, healing and retreat spaces can be income sources. Financial matters benefit from solitude and reflection rather than public promotion. Inheritances or unexpected windfalls sometimes arrive quietly, without fanfare.',
];

// Jupiter in house — expansion, abundance
const JUPITER_IN_HOUSE_FINANCIAL: string[] = [
  'Jupiter in the 1st house brings natural optimism and a broad, generous presence that attracts opportunity. Your confidence itself is a financial asset. People invest in you before they fully understand your plan — because your enthusiasm is contagious and your vision expansive.',
  'Jupiter in the 2nd house is one of the most auspicious placements for financial growth. Abundance flows toward your personal resources with relative ease across the lifetime. The challenge is not accumulation but discernment — Jupiterian excess can lead to overspending or overextension. Your greatest financial risk is assuming the next opportunity will always come.',
  'Jupiter in the 3rd house expands income through ideas, communication and local networks. Publishing, teaching, speaking, podcasting, social media and sales channels can be surprisingly lucrative. Short trips and local connections carry hidden financial value. Your mind is genuinely a money-making instrument.',
  'Jupiter in the 4th house expands real estate, family resources and the emotional foundation of financial life. Property investment, family business and inherited opportunity may feature. Your home can become an income-generating asset. Financial abundance often increases in the second half of life when foundations are fully established.',
  'Jupiter in the 5th house expands income through creativity, entertainment, speculation and joy. Passion projects can become profitable — your creative output has breadth and natural audience appeal. Children, education, entertainment and luxury leisure markets can bring significant returns. Speculative investment may pay off — but requires discipline to not overreach.',
  'Jupiter in the 6th house expands income through service, skill refinement and health-related fields. Your daily work habits are a genuine source of abundance — consistency and improvement compound over time. Healthcare, wellness, detailed craftsmanship and process optimisation can be financially rewarding. Your body of work grows steadily and impressively.',
  'Jupiter in the 7th house expands resources through partnerships — both personal and professional. Business partnerships tend to bring more income than solo ventures. Your clients and collaborators may be unusually generous or well-resourced. Legal and contractual fields may also feature. Marriage or long-term partnership often improves financial position.',
  'Jupiter in the 8th house creates one of the strongest placements for attracting other people\'s money. Investment returns, inheritance, insurance, joint ventures and financial services can bring significant wealth. Your instincts for identifying undervalued assets are strong. The shadow is overleveraging — using other people\'s money requires matching responsibility.',
  'Jupiter in the 9th house expands income through international channels, higher learning and philosophical authority. Publishing, academia, foreign trade, legal expertise and travel businesses can all bring expansion. Your credibility increases with distance — often more recognised abroad than locally. Long-distance financial ventures pay off.',
  'Jupiter in the 10th house is excellent for career-based financial expansion. Professional recognition, promotions and public visibility increase income consistently over time. Leadership positions, executive roles and public-facing careers with prestige bring natural growth. Your professional reputation is a compounding financial asset.',
  'Jupiter in the 11th house expands income through social networks, group ventures and forward-looking innovation. Technology, social enterprise, membership communities and collaborative projects can bring unusual financial scale. Your network is genuinely valuable — the right connection at the right moment can change your financial trajectory entirely.',
  'Jupiter in the 12th house expands resources in hidden, spiritual or behind-the-scenes ways. Unexpected windfalls, institutional support, private patronage or spiritual entrepreneurship may feature. Your most lucrative work is often done quietly, away from public scrutiny. Trust in the unseen — and act on intuition.',
];

// Ruler of House 2 by sign index (who rules the sign on the H2 cusp)
function getHouse2Ruler(h2SignIdx: number): string {
  // Traditional rulerships
  const rulers: string[] = [
    'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
    'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
  ];
  return rulers[h2SignIdx] ?? 'venus';
}

// ============================================================
// MAIN GENERATOR
// ============================================================

export function generateFinancialPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const texts = getInterpretations(options.locale || 'pt');

  // Derived positions
  const h2SignIdx  = getSignIndex(chart.houses.cusps[1]);
  const h8SignIdx  = getSignIndex(chart.houses.cusps[7]);
  const venusSign  = getSignIndex(chart.positions.venus?.longitude  ?? 0);
  const jupSign    = getSignIndex(chart.positions.jupiter?.longitude ?? 0);
  const satSign    = getSignIndex(chart.positions.saturn?.longitude  ?? 0);
  const venusHouse = chart.planetHouses.venus   ?? 1;
  const jupHouse   = chart.planetHouses.jupiter ?? 9;
  const satHouse   = chart.planetHouses.saturn  ?? 1;

  const planetsInH2 = Object.entries(chart.planetHouses).filter(([, h]) => h === 2).map(([p]) => p);
  const planetsInH8 = Object.entries(chart.planetHouses).filter(([, h]) => h === 8).map(([p]) => p);

  const h2RulerKey  = getHouse2Ruler(h2SignIdx);
  const h2RulerName = PLANET_NAMES[h2RulerKey] ?? h2RulerKey;
  const h2RulerHouse = chart.planetHouses[h2RulerKey] ?? 1;

  // ── P1: Cover ──────────────────────────────────────────────
  renderCover(doc, 'Financial Map', 'Your wealth potential and relationship with money', options, '💰');

  // ── P2: Overview ───────────────────────────────────────────
  doc.addPage();
  let y = 30;
  y = addSectionTitle(doc, 'Overview — Your Relationship with Money', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `Money is one of the most emotionally charged areas of human life — and the natal chart reflects that complexity with precision. Your financial story is written across three primary axes: the 2nd house (what you personally earn, value and build), the 8th house (what comes through others — investments, inheritance, joint ventures and transformation), and the planets Venus, Jupiter and Saturn (what you attract, where abundance flows, and where discipline builds lasting wealth).`,
    margin, y, 170);
  y += 6;

  y = wrapText(doc,
    `The ruler of your 2nd house — ${h2RulerName}, currently placed in the ${h2RulerHouse}${ordinal(h2RulerHouse)} house — is your "money-making style" planet. Where this planet sits, and how it is aspected, reveals the primary channel through which financial energy enters your life. Understanding this planet is often more practically useful than any generic financial advice.`,
    margin, y, 170);
  y += 6;

  y = wrapText(doc,
    `This report maps all of these layers in sequence. It is not a prediction of how much money you will have — it is a map of your natural relationship with resources: where flow is easy, where discipline is required, and where hidden opportunities may be waiting for conscious activation.`,
    margin, y, 170);
  y += 8;

  y = addSubTitle(doc, 'Your Financial Signature at a Glance', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const glanceItems = [
    `2nd House: ${SIGN_SYMBOLS[h2SignIdx]} ${SIGN_NAMES[h2SignIdx]}${planetsInH2.length > 0 ? ' — Planets: ' + planetsInH2.map(p => PLANET_NAMES[p] ?? p).join(', ') : ''}`,
    `8th House: ${SIGN_SYMBOLS[h8SignIdx]} ${SIGN_NAMES[h8SignIdx]}${planetsInH8.length > 0 ? ' — Planets: ' + planetsInH8.map(p => PLANET_NAMES[p] ?? p).join(', ') : ''}`,
    `Venus: ${SIGN_SYMBOLS[venusSign]} ${SIGN_NAMES[venusSign]} in House ${venusHouse}`,
    `Jupiter: ${SIGN_SYMBOLS[jupSign]} ${SIGN_NAMES[jupSign]} in House ${jupHouse}`,
    `Saturn: ${SIGN_SYMBOLS[satSign]} ${SIGN_NAMES[satSign]} in House ${satHouse}`,
    `House 2 Ruler: ${h2RulerName} in House ${h2RulerHouse}`,
  ];
  for (const item of glanceItems) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `• ${item}`, margin, y, 168);
    y += 3;
  }

  // ── P3: House 2 ────────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc,
    `House 2 — ${SIGN_SYMBOLS[h2SignIdx]} ${SIGN_NAMES[h2SignIdx]}: Personal Resources & Self-Worth`,
    y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `The 2nd house is your personal treasury: not just money, but everything you own, everything you can produce from your own hands and mind, and — crucially — the sense of worth that underlies it all. The sign on the cusp reveals your instinctive money-making style; planets inside the house amplify and colour the story.`,
    margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `${SIGN_NAMES[h2SignIdx]} on the 2nd House Cusp — Your Earning Style`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, H2_SIGN_TEXTS[h2SignIdx], margin, y, 170);
  y += 6;

  if (planetsInH2.length > 0) {
    y = addSubTitle(doc, `Planets in Your 2nd House`, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const planetH2Descs: Record<string, string> = {
      sun:     'The Sun in the 2nd house makes financial success central to your sense of identity and purpose. You shine when your work is recognised and rewarded. Income tied to your personal creative output or leadership tends to be most fulfilling.',
      moon:    'The Moon in the 2nd house creates an emotional relationship with money — financial security and emotional security are deeply intertwined. Income may fluctuate with your moods and life cycles. Intuitive financial decisions often pay off when you learn to trust them.',
      mercury: 'Mercury in the 2nd house earns through communication, information and mental agility. Writing, consulting, teaching or any field that monetises ideas fits naturally. You think about money often and with detail — financial planning comes more naturally than to most.',
      venus:   'Venus in the 2nd house is one of the most fortunate money placements. You attract resources with relative ease, often through charm, aesthetic sense and interpersonal skill. Beauty, luxury and relationship-based businesses can be highly lucrative.',
      mars:    'Mars in the 2nd house drives ambitious earning through action and initiative. You can generate income quickly when motivated, but money can also leave quickly. Building financial reserves requires conscious effort against the impulse to spend or reinvest immediately.',
      jupiter: 'Jupiter in the 2nd house is the classic "luck in money" placement — resources tend to expand over time. Your optimism about finances is generally well-founded, though excess can erode gains. Generosity comes naturally; so does the need to ensure generosity is sustainable.',
      saturn:  'Saturn in the 2nd house creates a serious, disciplined relationship with money. Income may build slowly in early life but grows substantially over time. Fear of scarcity can be a recurring theme — the work is to distinguish prudent caution from self-limiting belief.',
      uranus:  'Uranus in the 2nd house creates an unpredictable financial profile: sudden windfalls and sudden losses are both possible. Income from unconventional sources, technology, or breakthrough ideas can be significant. Financial stability comes from building systems resilient to volatility.',
      neptune: 'Neptune in the 2nd house blurs the boundaries of financial reality. Idealism, generosity and creative talent can all bring income — but so can financial confusion or being taken advantage of. Clear budgets and trusted financial advisors provide grounding.',
      pluto:   'Pluto in the 2nd house creates powerful, sometimes obsessive, themes around money and self-worth. Extreme gain or loss can mark turning points in life. Financial transformation — sometimes through crisis — builds a more authentic relationship with resources.',
    };
    for (const p of planetsInH2) {
      y = checkPageBreak(doc, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.brand);
      doc.text(`${PLANET_NAMES[p] ?? p}`, margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, planetH2Descs[p] ?? `${PLANET_NAMES[p] ?? p} in the 2nd house intensifies your relationship with personal resources and self-worth.`, margin, y, 170);
      y += 4;
    }
  }

  y = checkPageBreak(doc, y);
  y += 2;
  y = addSubTitle(doc, `${h2RulerName} — Ruler of Your 2nd House (in House ${h2RulerHouse})`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc,
    `The planet that rules the sign on your 2nd house cusp is your "money planet" — the most direct indicator of how financial energy moves in your life. ${h2RulerName} is placed in your ${h2RulerHouse}${ordinal(h2RulerHouse)} house, which means the themes of that house are where your earning power is most naturally activated. Whenever ${h2RulerName} is aspected by transit or progression, financial movement tends to follow.`,
    margin, y, 170);

  // ── TRYOUT CUT — after cover + overview + H2 (3 pages) ────
  const tryout = tryoutCut(doc, options, 'Financial Map', '29.90');
  if (tryout) return tryout;

  // ── P4: House 8 ────────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc,
    `House 8 — ${SIGN_SYMBOLS[h8SignIdx]} ${SIGN_NAMES[h8SignIdx]}: Shared Resources & Transformation`,
    y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `The 8th house is the most psychologically complex financial domain in the chart. It rules everything that comes from or through others: inheritance, joint investments, loans, insurance, tax, your partner's income, and the finances that arrive as a result of deep trust or deep crisis. The 8th house asks you to release control over outcomes and enter into genuine financial interdependence — which is often where the greatest wealth, and the greatest lessons, live.`,
    margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `${SIGN_NAMES[h8SignIdx]} on the 8th House Cusp`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, H8_SIGN_TEXTS[h8SignIdx], margin, y, 170);
  y += 6;

  if (planetsInH8.length > 0) {
    y = checkPageBreak(doc, y);
    y = addSubTitle(doc, `Planets in Your 8th House`, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const planetH8Descs: Record<string, string> = {
      sun:     'The Sun in the 8th house places transformation and shared resources at the core of your identity. You are drawn to investigate what others overlook — hidden value, buried assets, psychological patterns behind financial decisions.',
      moon:    'The Moon in the 8th house makes emotional security deeply tied to what you hold in common with others. Joint finances carry strong emotional charge. Intuition about cycles of loss and renewal is finely tuned.',
      mercury: 'Mercury in the 8th house gives you a sharp investigative mind for research, tax strategy, inheritance law and the psychology of money. You think in depth about financial structures that others find intimidating.',
      venus:   'Venus in the 8th house can attract significant resources through joint ventures, inheritance or partnership. You have natural magnetism for other people\'s assets and a gift for making shared financial arrangements feel fair and beautiful.',
      mars:    'Mars in the 8th house drives action in shared financial territory — joint ventures, debt restructuring and estate matters. Conflicts over money can be intense. Your assertiveness in claiming what is yours can be a powerful asset when directed consciously.',
      jupiter: 'Jupiter in the 8th house is one of the most fortunate placements for inheritance, investment returns and shared financial expansion. Other people\'s money flows toward you with notable regularity. Estate planning and investment strategies deserve generous attention.',
      saturn:  'Saturn in the 8th house creates discipline and sometimes delay around inheritance and joint finances. You approach shared resources cautiously and build strong legal frameworks around partnerships. The financial rewards are long-term and solid when patience is maintained.',
      uranus:  'Uranus in the 8th house creates unexpected shifts in shared finances — sudden inheritances, abrupt changes in joint investments, or financial liberation through crisis. You benefit from maintaining financial independence even within partnerships.',
      neptune: 'Neptune in the 8th house creates idealism — and potential confusion — around shared finances. Clear legal agreements protect you in joint ventures. Spiritual or creative inheritances may prove as valuable as material ones.',
      pluto:   'Pluto in the 8th house is the sign\'s natural ruler in its natural home — this is one of the most powerful financial placements possible. Complete financial transformation across the lifetime is probable. Power, obsession and regeneration are central themes in your shared-resource story.',
    };
    for (const p of planetsInH8) {
      y = checkPageBreak(doc, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.brand);
      doc.text(`${PLANET_NAMES[p] ?? p}`, margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, planetH8Descs[p] ?? `${PLANET_NAMES[p] ?? p} in the 8th house intensifies your experience of shared resources and transformation.`, margin, y, 170);
      y += 4;
    }
  }

  // ── P5: Venus ──────────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc,
    `Venus in ${SIGN_NAMES[venusSign]} (House ${venusHouse}) — What You Attract`,
    y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `Venus is the planet of attraction — not just romantic attraction, but the magnetic principle that draws resources, beauty, pleasure and value toward you. In financial astrology, Venus describes the quality of what you attract effortlessly: the income streams that feel natural, the clients who find you, the opportunities that arrive without aggressive pursuit. Understanding your Venus is understanding what you were designed to receive.`,
    margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Venus in ${SIGN_NAMES[venusSign]} — Attraction Quality`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const venusSignDescs: string[] = [
    'Venus in Aries attracts through boldness, pioneering energy and the courage to go first. You draw resources when you act decisively and independently. Clients and opportunities are attracted to your drive and willingness to take initiative that others hesitate to take.',
    'Venus in Taurus is in her home sign — this is one of the strongest placements for attracting financial comfort and sensory abundance. You draw money, beauty and loyalty through patience, reliability and genuine quality. Your taste is your asset; your steadiness is your brand.',
    'Venus in Gemini attracts through wit, versatility and the ability to connect ideas with people. You draw income through communication — the right word at the right moment opens financial doors. Multiple attractive opportunities often arrive simultaneously, requiring clear prioritisation.',
    'Venus in Cancer attracts through emotional intelligence, care and the ability to make others feel genuinely safe. You draw resources through nurturing roles and by creating environments where people feel at home. Loyalty from clients and partners tends to be unusually strong.',
    'Venus in Leo attracts through charisma, creativity and the generosity of spirit that makes others want to be in your orbit. You draw resources when you allow yourself to be fully visible — the more authentically you shine, the more financially rewarding your output tends to be.',
    'Venus in Virgo attracts through precision, service and the quiet confidence of genuine mastery. You draw income through doing things exceptionally well and through solving problems others find too complex or tedious. Your value proposition is quality; your challenge is charging accordingly.',
    'Venus in Libra is in her second home — you attract through harmony, elegance and the ability to make everyone feel heard and valued. Partnership-based income and collaborative ventures carry particular magnetism. Your aesthetic sense and fairness in negotiation are real financial assets.',
    'Venus in Scorpio attracts through depth, intensity and the magnetism of genuine psychological power. You draw resources through transformation — helping others navigate change, access buried value, or face what they have been avoiding. Significant financial attraction arrives through trust-based intimacy.',
    'Venus in Sagittarius attracts through optimism, vision and the generosity of someone who believes in abundance. You draw income through expanding horizons — teaching, publishing, international connection, or simply the infectious confidence that makes others want to invest in your ideas.',
    'Venus in Capricorn attracts through competence, ambition and the quiet authority of someone who has earned their place. You draw resources through demonstrated achievement and long-term reliability. Your professional reputation is a compounding financial asset that grows more valuable with time.',
    'Venus in Aquarius attracts through originality, intellectual independence and the vision to see what is coming before others do. You draw income through innovation and community — being ahead of the curve is your financial edge. Unconventional approaches to earning often yield surprising results.',
    'Venus in Pisces attracts through compassion, creativity and a spiritual generosity that others find deeply moving. You draw resources through art, healing and the ability to express what others feel but cannot articulate. The creative and service-based economy is your natural financial home.',
  ];

  y = wrapText(doc, venusSignDescs[venusSign], margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Venus in House ${venusHouse} — Where Attraction Manifests`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, VENUS_IN_HOUSE_FINANCIAL[venusHouse - 1] ?? `Venus in the ${venusHouse}th house draws resources through the themes of that life area.`, margin, y, 170);

  // ── P6: Jupiter ────────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc,
    `Jupiter in ${SIGN_NAMES[jupSign]} (House ${jupHouse}) — Where Abundance Flows`,
    y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `Jupiter is the planet of expansion, generosity and the principle of "more." In financial astrology, Jupiter marks where abundance arrives most naturally — not through luck alone, but through the amplifying effect of genuine faith and action. Where Jupiter sits in your chart is where the universe tends to say yes. It is also where you are most prone to excess, which is why Jupiter\'s gifts require discernment as much as enthusiasm.`,
    margin, y, 170);
  y += 6;

  const jupSignDescs: string[] = [
    'Jupiter in Aries expands through courageous action and entrepreneurial initiative. Abundance grows fastest when you lead, start things and take the first risk. Your financial confidence is contagious and tends to attract the funding, partners and clients needed to sustain bold ventures.',
    'Jupiter in Taurus expands through patience, quality and steady accumulation. Financial abundance grows when you invest in tangible assets, develop expertise over time, and trust the slow but compounding power of consistency. The earth under your feet is as valuable as the sky above.',
    'Jupiter in Gemini expands through ideas, connections and the multiplication of communication channels. Abundance arrives through teaching, writing, networking and the ability to be in multiple conversations simultaneously. Your mind is genuinely your greatest wealth-generating instrument.',
    'Jupiter in Cancer expands through emotional intelligence, family connections and the creation of genuinely nurturing environments. Real estate, food, hospitality and caregiving can be financially abundant arenas. Abundance flows most freely when you feel emotionally secure at the foundation.',
    'Jupiter in Leo expands through self-expression, creative generosity and the courage to be fully visible. Abundance grows when you invest in your own brand, performance and creative output. Generosity — of spirit as much as money — tends to return multiplied.',
    'Jupiter in Virgo expands through service, skill mastery and attention to detail that creates genuine value. Abundance grows through the steady improvement of craft and the satisfaction of work done excellently. Health and wellness industries, analytical tools and craft-based enterprises can be particularly fertile.',
    'Jupiter in Libra expands through partnership, collaboration and the art of mutually beneficial negotiation. Business partnerships tend to outperform solo ventures. Financial abundance grows when you invest in relationships and create genuine win-win agreements. Justice and aesthetics can both be financially rewarding.',
    'Jupiter in Scorpio expands through deep research, transformative investment and access to hidden resources. Other people\'s money, inheritance and high-conviction investment strategies are where abundance most naturally grows. Your instinct for identifying what is undervalued — in assets and in people — is a rare and powerful financial gift.',
    'Jupiter in Sagittarius is in its home sign — one of the strongest placements for financial and philosophical expansion. Abundance grows through publishing, teaching, international ventures, higher education and any pursuit that genuinely broadens horizons. Your optimism, when grounded in action, is financially prophetic.',
    'Jupiter in Capricorn expands through disciplined ambition and the patient construction of lasting structures. Abundance grows slowly and solidly — the compound interest of consistent effort. Executive roles, long-term investment strategies and businesses built on genuine expertise are where Jupiter in Capricorn pays off most handsomely.',
    'Jupiter in Aquarius expands through innovation, community and the ability to see patterns before they become mainstream. Technology, social enterprise, network effects and collaborative investment models can generate unusual scale. Your financial abundance often arrives through doing something that does not yet have a category.',
    'Jupiter in Pisces expands through compassion, spiritual service and the creative imagination that can turn vision into reality. Abundance flows through art, healing, music, therapy and the service of transcendent human needs. Intuition is a genuine financial instrument — when you trust it, it tends to pay.',
  ];

  y = wrapText(doc, jupSignDescs[jupSign], margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Jupiter in House ${jupHouse} — Where Opportunity Multiplies`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const jupHouseText = JUPITER_IN_HOUSE[jupHouse - 1] ?? `Jupiter in House ${jupHouse} brings expansion and opportunity to the themes of that life area.`;
  y = wrapText(doc, jupHouseText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'Working with Your Jupiter Cycle', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc,
    `Jupiter completes a full cycle of the zodiac every 12 years. When it returns to its natal sign — around age 12, 24, 36, 48 and 60 — there is a natural window of financial expansion and opportunity. When Jupiter transits your 2nd house, personal income tends to grow. When it transits your 8th house, shared resources and investment returns often expand. Tracking the Jupiter cycle is one of the most practical tools of financial astrology.`,
    margin, y, 170);

  // ── P7: Saturn ─────────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc,
    `Saturn in ${SIGN_NAMES[satSign]} (House ${satHouse}) — Where Discipline Builds Wealth`,
    y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `If Jupiter shows where abundance flows easily, Saturn shows where wealth is built with effort and discipline — and where it lasts. Saturn's financial gifts are not given; they are earned. But what is earned through Saturn is genuinely yours: not dependent on market cycles, other people's generosity or fortunate circumstances. Saturn builds the financial foundation that holds when everything else shifts.`,
    margin, y, 170);
  y += 6;

  const satSignDescs: string[] = [
    'Saturn in Aries builds wealth through disciplined courage — learning to act decisively without impulsiveness. The challenge is developing patience without losing initiative. Financial structures built on genuine entrepreneurial skill, once established, prove durable.',
    'Saturn in Taurus builds wealth through the patient accumulation of tangible assets. This placement rewards frugality, long-term investment and the development of practical, marketable skills. Material security is built slowly but proves exceptionally solid.',
    'Saturn in Gemini builds wealth through the mastery of communication, information management and structured thinking. The challenge is committing to one area of expertise long enough to become genuinely authoritative. Income from writing, teaching or consulting rewards sustained focus.',
    'Saturn in Cancer builds wealth through disciplined emotional management and the careful stewardship of home and family resources. Real estate investment, conservative financial planning and family financial responsibility often feature prominently across the lifetime.',
    'Saturn in Leo builds wealth through disciplined creative expression and authentic leadership. The ego must serve the work, not the other way around. Income from performance, management and creative enterprise rewards those who develop genuine craft rather than seeking quick recognition.',
    'Saturn in Virgo builds wealth through meticulous service, health discipline and the mastery of technical skill. Precision, reliability and the willingness to do the detailed work others avoid are genuine financial assets. Long-term income from expertise-based services tends to grow steadily.',
    'Saturn in Libra is exalted — this placement rewards fair, structured, long-term partnerships and disciplined negotiation. The most durable financial structures involve carefully constructed agreements and patient collaborative investment. Justice and equity are genuine wealth-building principles here.',
    'Saturn in Scorpio builds wealth through disciplined management of shared resources, debt and investment. The capacity to face financial complexity without flinching — tax strategy, estate planning, debt restructuring — becomes a genuine financial superpower. Power used responsibly compounds over decades.',
    'Saturn in Sagittarius builds wealth through the disciplined pursuit of genuine expertise, philosophical authority and cross-cultural knowledge. The challenge is committing to depth over breadth. Income from long-term educational authority, publishing and international expertise rewards sustained commitment.',
    'Saturn in Capricorn is in its home sign — this is Saturn at its most powerful and productive. Wealth is built through exceptional discipline, structural ambition and the willingness to play a very long game. Executive capacity, institutional authority and legacy-focused investment reward those who stay the course.',
    'Saturn in Aquarius builds wealth through disciplined innovation and the structural organisation of community resources. Technology businesses, social enterprises and network-based income models reward the patience to build genuine infrastructure. Freedom and structure are not opposites here — they are partners.',
    'Saturn in Pisces builds wealth through disciplined creative practice, spiritual service and the management of compassionate resources. The challenge is maintaining practical financial structures alongside fluid creative and spiritual commitments. Consistent small actions — rather than sporadic large ones — build lasting income.',
  ];

  y = wrapText(doc, satSignDescs[satSign], margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Saturn in House ${satHouse} — Where Structure Pays Off`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const satHouseText = SATURN_IN_HOUSE[satHouse - 1] ?? `Saturn in House ${satHouse} demands structure and discipline in that life area, and rewards consistent effort.`;
  y = wrapText(doc, satHouseText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'The Saturn Return and Financial Maturity', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc,
    `Around ages 28-30 and again at 58-60, Saturn returns to its natal position — the Saturn Return. This is consistently one of the most significant financial reset points in life. The first return often involves a reckoning with financial immaturity: debt patterns, unclear income strategy, or inherited financial beliefs that no longer serve. The second return consolidates the financial legacy you have built. In both cases, what you have built with integrity survives; what you have built on avoidance does not.`,
    margin, y, 170);

  // ── P8: Financial Aspects ──────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, 'Financial Aspects — Venus, Jupiter & Saturn Connections', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `The aspects between Venus, Jupiter and Saturn in your natal chart describe how your three core financial principles interact: attraction (Venus), expansion (Jupiter) and discipline (Saturn). Harmonious connections between them suggest that earning, growing and sustaining wealth flow with relative coherence. Tense connections indicate areas requiring conscious integration — often where the greatest financial lessons and eventual mastery lie.`,
    margin, y, 170);
  y += 8;

  const financialPlanets = ['venus', 'jupiter', 'saturn'];
  const financialPairs: Array<[string, string]> = [
    ['venus', 'jupiter'],
    ['venus', 'saturn'],
    ['jupiter', 'saturn'],
  ];
  let foundAspect = false;

  for (const [p1, p2] of financialPairs) {
    const asp = chart.aspects.find(a =>
      (a.planet1 === p1 && a.planet2 === p2) ||
      (a.planet1 === p2 && a.planet2 === p1)
    );
    if (asp) {
      foundAspect = true;
      y = checkPageBreak(doc, y);
      const aspectSymbol: Record<string, string> = { conjunction: '☌', opposition: '☍', trine: '△', square: '□', sextile: '✶' };
      const sym = aspectSymbol[asp.type] ?? asp.type;
      const color: [number, number, number] = (asp.type === 'trine' || asp.type === 'sextile') ? COLORS.brand : (asp.type === 'square' || asp.type === 'opposition') ? COLORS.red : COLORS.gold;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...color);
      doc.text(`${PLANET_NAMES[p1]} ${sym} ${PLANET_NAMES[p2]}`, margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      const interp = getAspectInterpretation(p1, p2, asp.type) ?? getAspectInterpretation(p2, p1, asp.type);
      if (interp) {
        y = wrapText(doc, interp, margin, y, 170);
      } else {
        const genericDescs: Record<string, Record<string, string>> = {
          'venus-jupiter': {
            conjunction: 'Venus conjunct Jupiter is one of the most fortunate financial aspects in the chart. Attraction and expansion work together seamlessly — you naturally draw abundance and have the optimism to act on opportunities. The caution is excess: this aspect can lead to overspending or overconfidence.',
            trine: 'Venus trine Jupiter creates an easy flow between attraction and expansion. Financial opportunities arrive with relative ease and your values are aligned with growth. Generosity tends to return multiplied. Maintaining practical discipline ensures this natural gift compounds rather than evaporates.',
            sextile: 'Venus sextile Jupiter offers opportunity to align your attractive qualities with financial expansion. You have the ingredients for financial flow — the work is to consciously activate the connection through consistent action in areas where beauty meets opportunity.',
            square: 'Venus square Jupiter creates tension between what you desire (Venus) and what you believe is possible (Jupiter). Excess, overspending or value conflicts around money may require attention. The gift of this aspect is learning that true abundance requires both genuine desire and honest assessment.',
            opposition: 'Venus opposite Jupiter asks you to balance personal pleasure with the bigger picture of expansion. Others may bring financial abundance into your life, or you may project your own financial optimism onto partners. Integration means owning both the desire and the expansive vision.',
          },
          'venus-saturn': {
            conjunction: 'Venus conjunct Saturn brings discipline and structure to what you attract and value. Financial relationships and income streams tend to be serious, long-term and carefully built. You may attract older or more established financial partners. The challenge is allowing yourself to receive pleasure and abundance without excessive self-restriction.',
            trine: 'Venus trine Saturn creates a harmonious balance between attraction and discipline. You can build financially sustainable relationships and income streams with patient elegance. What you attract, you also tend to keep — your financial structures are both appealing and durable.',
            sextile: 'Venus sextile Saturn offers the opportunity to build genuinely sustainable income and financial relationships. Your sense of beauty and value benefits from practical grounding, and your disciplined approach can be made more attractive with conscious effort.',
            square: 'Venus square Saturn creates tension between your desire for pleasure and beauty (Venus) and your instinct for restriction and control (Saturn). Financial relationships may carry themes of scarcity or over-discipline. The integration is learning that you can build lasting structures without denying yourself joy.',
            opposition: 'Venus opposite Saturn asks you to balance receptivity with responsibility. Partners may bring either abundance or financial burden — discernment in financial partnerships is essential. When you own both your attractiveness and your disciplined seriousness, the opposition becomes productive.',
          },
          'jupiter-saturn': {
            conjunction: 'Jupiter conjunct Saturn is the "social planets conjunction" — a major generational marker that creates a powerful tension between expansion and discipline within you. At its best, this produces the rare combination of ambitious vision AND practical execution. Financial decisions benefit from this built-in check-and-balance.',
            trine: 'Jupiter trine Saturn creates harmonious cooperation between expansion and discipline. You can grow financially without losing stability — your optimism is tempered by realism and your structures are ambitious enough to compound. This aspect favours long-term investment and patient entrepreneurship.',
            sextile: 'Jupiter sextile Saturn offers the opportunity to align growth with structure. When you act on this combination consciously — planning expansions with realistic timelines, building structures flexible enough to grow — the financial results can be steadily impressive.',
            square: 'Jupiter square Saturn creates productive but demanding tension between your impulse to expand and your instinct to restrict. Boom-and-bust financial cycles are possible until the two principles learn to inform rather than override each other. Structured optimism is the financial superpower this aspect is trying to build.',
            opposition: 'Jupiter opposite Saturn asks you to balance faith with realism — often by externalising one principle while owning the other. You may attract partners who embody either unchecked optimism or excessive caution. Owning both extremes internally creates the financial balance that generates lasting wealth.',
          },
        };
        const key1 = `${p1}-${p2}`;
        const key2 = `${p2}-${p1}`;
        const descs = genericDescs[key1] ?? genericDescs[key2] ?? {};
        const desc = descs[asp.type] ?? `This ${asp.type} between ${PLANET_NAMES[p1]} and ${PLANET_NAMES[p2]} shapes how your financial principles of attraction, expansion and discipline interact.`;
        y = wrapText(doc, desc, margin, y, 170);
      }
      y += 6;
    }
  }

  if (!foundAspect) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc,
      `Venus, Jupiter and Saturn in your chart do not form close major aspects to each other. This means your financial principles of attraction, expansion and discipline operate with relative independence — each in its own domain without strong reinforcement or tension between them. The practical implication is that financial integration requires more conscious, deliberate coordination between these three energies rather than relying on natural internal flow.`,
      margin, y, 170);
  }

  // ── P9: Top 5 Financial Strengths ─────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, 'Top 5 Financial Strengths', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `The following strengths are derived from dignities, house placements and harmonious aspects in your chart. They represent the financial qualities you were born with — not as a guarantee of results, but as natural capabilities that reward conscious development and deployment.`,
    margin, y, 170);
  y += 8;

  // Score planets for dignities and house placements
  const strengthCandidates: Array<{ title: string; score: number; text: string }> = [];

  // Venus dignity check
  const venusDomicile = venusSign === 1 || venusSign === 6; // Taurus, Libra
  const venusExalt = venusSign === 11; // Pisces
  if (venusDomicile || venusExalt) {
    strengthCandidates.push({
      title: `Venus in ${SIGN_NAMES[venusSign]} — Heightened Attraction Power`,
      score: venusDomicile ? 90 : 80,
      text: `Venus in ${SIGN_NAMES[venusSign]} is in a position of dignity, meaning her attractive and value-creating powers operate at full strength. You have a natural magnetism for financial opportunity that others must work considerably harder to cultivate. Trust your instincts about what is genuinely beautiful and valuable — they are well-calibrated.`,
    });
  }

  // Jupiter dignity check
  const jupDomicile = jupSign === 8 || jupSign === 11; // Sagittarius, Pisces
  const jupExalt = jupSign === 3; // Cancer
  if (jupDomicile || jupExalt) {
    strengthCandidates.push({
      title: `Jupiter in ${SIGN_NAMES[jupSign]} — Elevated Abundance`,
      score: jupDomicile ? 92 : 82,
      text: `Jupiter in ${SIGN_NAMES[jupSign]} is in a position of strength, amplifying the natural principle of abundance and expansion. Financial opportunities tend to arrive with notable regularity and scale. Your optimism about resources is generally well-founded — when you act on it with appropriate planning, the results tend to exceed expectations.`,
    });
  }

  // Saturn dignity check
  const satDomicile = satSign === 9 || satSign === 10; // Capricorn, Aquarius
  const satExalt = satSign === 6; // Libra
  if (satDomicile || satExalt) {
    strengthCandidates.push({
      title: `Saturn in ${SIGN_NAMES[satSign]} — Exceptional Financial Discipline`,
      score: satDomicile ? 88 : 78,
      text: `Saturn in ${SIGN_NAMES[satSign]} is in a position of dignity, meaning your capacity for financial discipline, structure and long-term planning operates at its best. You have a natural ability to build wealth that endures — not through luck, but through the kind of patient, methodical effort that most people find difficult to sustain.`,
    });
  }

  // Venus in 2nd or 8th
  if (venusHouse === 2) {
    strengthCandidates.push({
      title: 'Venus in the 2nd House — Natural Wealth Magnetism',
      score: 85,
      text: 'Venus in your 2nd house places your attraction power directly in the house of personal resources. This is one of the most reliable placements for financial flow — you draw money, valuable objects and lucrative opportunities with relatively little resistance. Your financial instincts about beauty and value are particularly reliable.',
    });
  }
  if (venusHouse === 8) {
    strengthCandidates.push({
      title: 'Venus in the 8th House — Shared Resource Magnetism',
      score: 82,
      text: 'Venus in your 8th house creates exceptional magnetism for shared financial resources — inheritance, investment returns, joint ventures and business partnerships. Others are drawn to pool their resources with you. This placement supports significant wealth accumulation through collaborative rather than purely individual effort.',
    });
  }

  // Jupiter in 2nd or 8th
  if (jupHouse === 2) {
    strengthCandidates.push({
      title: 'Jupiter in the 2nd House — Expanding Personal Resources',
      score: 90,
      text: 'Jupiter in the 2nd house is a classic abundance placement. Your personal income and resource base tends to grow over time with relative ease. The compounding effect of Jupiter here means that financial momentum, once started, tends to sustain itself. Managing the growth — rather than generating it — is your primary financial challenge.',
    });
  }
  if (jupHouse === 8) {
    strengthCandidates.push({
      title: 'Jupiter in the 8th House — Investment Instinct',
      score: 88,
      text: 'Jupiter in the 8th house creates powerful instincts for identifying undervalued assets and generating returns through other people\'s money. Inheritance, investment, insurance and joint ventures often bring outsized gains. Your ability to find financial opportunity in situations others find too complex or risky is a genuine and rare strength.',
    });
  }

  // Harmonious Venus-Jupiter aspect
  const vjAsp = chart.aspects.find(a =>
    ((a.planet1 === 'venus' && a.planet2 === 'jupiter') || (a.planet1 === 'jupiter' && a.planet2 === 'venus')) &&
    (a.type === 'trine' || a.type === 'sextile' || a.type === 'conjunction')
  );
  if (vjAsp) {
    strengthCandidates.push({
      title: `Venus ${vjAsp.type === 'trine' ? '△' : vjAsp.type === 'sextile' ? '✶' : '☌'} Jupiter — Attraction Meets Expansion`,
      score: vjAsp.type === 'trine' ? 87 : 80,
      text: `The harmonious connection between your Venus and Jupiter creates a natural flow between attracting resources and expanding them. You can earn with charm and grow with confidence. This aspect supports financial momentum — when you act on genuine desire AND expansive vision simultaneously, the results tend to significantly outperform either quality alone.`,
    });
  }

  // Saturn harmonious with Venus or Jupiter
  const sjAsp = chart.aspects.find(a =>
    ((a.planet1 === 'saturn' && a.planet2 === 'jupiter') || (a.planet1 === 'jupiter' && a.planet2 === 'saturn')) &&
    (a.type === 'trine' || a.type === 'sextile')
  );
  if (sjAsp) {
    strengthCandidates.push({
      title: `Jupiter △/✶ Saturn — Growth with Structure`,
      score: 84,
      text: `The harmonious aspect between Jupiter and Saturn in your chart is one of the most practically valuable financial indicators available. You have both the vision to see expansive opportunities and the discipline to execute on them sustainably. This combination — rare in its coherent form — produces financial results that are both ambitious and lasting.`,
    });
  }

  // Default strengths if we have few
  if (strengthCandidates.length < 3) {
    strengthCandidates.push({
      title: `${SIGN_NAMES[h2SignIdx]} 2nd House — Clear Earning Identity`,
      score: 72,
      text: `The clarity of ${SIGN_NAMES[h2SignIdx]} energy on your 2nd house cusp gives you a recognisable and authentic money-making style. You know instinctively what kinds of work generate income for you — and when you honour that instinct rather than trying to earn in ways that don\'t fit your nature, results improve significantly.`,
    });
    strengthCandidates.push({
      title: `${SIGN_NAMES[h8SignIdx]} 8th House — Defined Transformation Path`,
      score: 70,
      text: `The ${SIGN_NAMES[h8SignIdx]} quality of your 8th house gives you a defined approach to shared resources and financial transformation. Rather than avoiding the complex territory of joint finances, investment and inherited patterns, you can engage it with the characteristic strengths of this sign.`,
    });
  }

  // Sort by score and take top 5
  const top5strengths = strengthCandidates.sort((a, b) => b.score - a.score).slice(0, 5);
  for (let i = 0; i < top5strengths.length; i++) {
    y = checkPageBreak(doc, y);
    const s = top5strengths[i];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.brand);
    doc.text(`${i + 1}. ${s.title}`, margin, y);
    y += 6;
    // Score bar
    const barW = 100;
    const filled = Math.round((s.score / 100) * barW);
    doc.setFillColor(...COLORS.line);
    doc.roundedRect(margin, y - 3, barW, 4, 1, 1, 'F');
    doc.setFillColor(...COLORS.brand);
    doc.roundedRect(margin, y - 3, filled, 4, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.brand);
    doc.text(`${s.score}%`, margin + barW + 4, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, s.text, margin, y, 170);
    y += 6;
  }

  // ── P10: Top 5 Financial Challenges ───────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, 'Top 5 Financial Challenges', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `Financial challenges in the natal chart are not obstacles — they are areas requiring conscious work. Each challenge below carries within it a corresponding growth edge. The charts of history\'s most successful wealth-builders are rarely tension-free; they are charts where the tensions were understood and worked with deliberately.`,
    margin, y, 170);
  y += 8;

  const challengeCandidates: Array<{ title: string; text: string }> = [];

  // Debilitated Venus
  const venusDetriment = venusSign === 7 || venusSign === 0; // Scorpio, Aries
  const venusFall = venusSign === 5; // Virgo
  if (venusDetriment || venusFall) {
    challengeCandidates.push({
      title: `Venus in ${SIGN_NAMES[venusSign]} — Attraction Requires Conscious Effort`,
      text: `Venus in ${SIGN_NAMES[venusSign]} operates outside her natural comfort zone, meaning the principle of effortless attraction needs more deliberate activation. Financial magnetism is still entirely available — but it requires you to understand how your specific Venus energy works and where it is genuinely attractive, rather than assuming it will operate automatically.`,
    });
  }

  // Debilitated Jupiter
  const jupDetriment = jupSign === 2 || jupSign === 5; // Gemini, Virgo
  const jupFall = jupSign === 9; // Capricorn
  if (jupDetriment || jupFall) {
    challengeCandidates.push({
      title: `Jupiter in ${SIGN_NAMES[jupSign]} — Expansion Requires Structure`,
      text: `Jupiter in ${SIGN_NAMES[jupSign]} must work harder to generate the effortless expansion associated with this planet. Financial growth is absolutely achievable, but it requires more planning, discipline and realistic expectation-setting than Jupiter's usual optimism suggests. The gift is that growth, when it comes, is well-earned and well-understood.`,
    });
  }

  // Debilitated Saturn
  const satDetriment = satSign === 3 || satSign === 0; // Cancer, Aries
  const satFall = satSign === 0; // Aries
  if (satDetriment || satFall) {
    challengeCandidates.push({
      title: `Saturn in ${SIGN_NAMES[satSign]} — Discipline Needs Development`,
      text: `Saturn in ${SIGN_NAMES[satSign]} creates areas where financial discipline and long-term structure do not come naturally. Building consistent savings habits, maintaining financial boundaries in relationships, or following through on long-term investment plans may require more conscious effort than for others. These are learnable skills — and mastering them here builds unusually strong financial character.`,
    });
  }

  // Tense Venus-Saturn
  const vsTense = chart.aspects.find(a =>
    ((a.planet1 === 'venus' && a.planet2 === 'saturn') || (a.planet1 === 'saturn' && a.planet2 === 'venus')) &&
    (a.type === 'square' || a.type === 'opposition')
  );
  if (vsTense) {
    challengeCandidates.push({
      title: `Venus ${vsTense.type === 'square' ? '□' : '☍'} Saturn — Scarcity vs. Desire`,
      text: `The tension between Venus and Saturn in your chart can create a persistent internal conflict between what you desire (Venus) and what you believe you deserve or can realistically have (Saturn). This may manifest as underpricing your work, difficulty receiving financial generosity, or oscillating between indulgence and excessive restriction. Recognising this pattern is the first step to integrating it into a more balanced financial approach.`,
    });
  }

  // Tense Venus-Jupiter
  const vjTense = chart.aspects.find(a =>
    ((a.planet1 === 'venus' && a.planet2 === 'jupiter') || (a.planet1 === 'jupiter' && a.planet2 === 'venus')) &&
    (a.type === 'square' || a.type === 'opposition')
  );
  if (vjTense) {
    challengeCandidates.push({
      title: `Venus ${vjTense.type === 'square' ? '□' : '☍'} Jupiter — Excess and Values Conflict`,
      text: `The tense aspect between Venus and Jupiter can create a tendency toward financial excess — spending more than is sustainable, overestimating income, or conflating desire with need. Alternatively, it may create conflict between what you value personally and what seems most financially expansive. Bringing conscious discernment to both pleasure and opportunity prevents the asset from becoming a liability.`,
    });
  }

  // Tense Jupiter-Saturn
  const jsTense = chart.aspects.find(a =>
    ((a.planet1 === 'jupiter' && a.planet2 === 'saturn') || (a.planet1 === 'saturn' && a.planet2 === 'jupiter')) &&
    (a.type === 'square' || a.type === 'opposition')
  );
  if (jsTense) {
    challengeCandidates.push({
      title: `Jupiter ${jsTense.type === 'square' ? '□' : '☍'} Saturn — Boom and Bust Pattern`,
      text: `The tension between Jupiter and Saturn can create a financial pattern of expansion followed by contraction — periods of confident growth alternating with periods of restriction or self-doubt. Building a financial approach that incorporates both ambitious planning (Jupiter) and realistic constraints (Saturn) breaks the cycle and creates more sustainable wealth accumulation over time.`,
    });
  }

  // Default challenges
  if (challengeCandidates.length < 3) {
    challengeCandidates.push({
      title: 'Integrating 2nd and 8th House Themes',
      text: `The axis between your 2nd house (${SIGN_NAMES[h2SignIdx]}) and 8th house (${SIGN_NAMES[h8SignIdx]}) represents a fundamental polarity in your financial life: what is yours alone versus what is shared or transformed through others. Developing fluency in both modes — earning independently AND building through shared resources — is the central financial integration challenge your chart presents.`,
    });
    challengeCandidates.push({
      title: 'Financial Self-Worth',
      text: `The 2nd house governs not just money but the sense of worth that underlies it. Patterns of undercharging, overgiving, or difficulty claiming financial recognition often trace back to 2nd house beliefs formed in early life. Separating your sense of personal value from your current financial position — understanding that worth is inherent, not earned — is foundational financial inner work.`,
    });
  }

  const top5challenges = challengeCandidates.slice(0, 5);
  for (let i = 0; i < top5challenges.length; i++) {
    y = checkPageBreak(doc, y);
    const c = top5challenges[i];
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.red);
    doc.text(`${i + 1}. ${c.title}`, margin, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, c.text, margin, y, 170);
    y += 6;
  }

  // ── P11: Practical Advice & Timing ────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, 'Practical Advice & Timing', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `Astrology\'s greatest practical value in financial planning is timing — knowing when to expand aggressively, when to consolidate, and when to hold still. The following recommendations are grounded in your specific chart configuration and the planetary cycles most relevant to financial movement.`,
    margin, y, 170);
  y += 8;

  const adviceItems = [
    {
      title: `Lead with ${h2RulerName} — Your Money Planet`,
      text: `Your 2nd house ruler is ${h2RulerName}, placed in your ${h2RulerHouse}${ordinal(h2RulerHouse)} house. Track the transits of ${h2RulerName} carefully — when it is well-aspected by Jupiter or Venus in the sky, these are your natural windows for financial initiative. When it is under Saturn or Pluto pressure, consolidate and avoid major financial commitments.`,
    },
    {
      title: `Use Jupiter Cycles for Expansion`,
      text: `Jupiter takes approximately 12 years to return to its natal position. When Jupiter transits your 2nd or 8th house, these are your strongest financial expansion windows — typically lasting 12-13 months. Plan major income initiatives, investment commitments and wealth-building launches to coincide with these periods when possible.`,
    },
    {
      title: `Respect Saturn Cycles for Foundation Work`,
      text: `When Saturn transits your 2nd or 8th house, the priority shifts from expansion to consolidation and structural repair. These periods — lasting about 2-3 years — are best used for debt reduction, financial planning, creating clearer legal structures around partnerships, and building reserves rather than taking speculative positions.`,
    },
    {
      title: `Venus Cycles for Income Negotiation`,
      text: `Venus returns to its natal sign roughly every 12 months. When Venus is in ${SIGN_NAMES[venusSign]}, you are operating with heightened attraction power aligned with your natal configuration. This is an ideal time for salary negotiations, launching income-generating projects, client acquisition and any financial move that benefits from your personal magnetism being at its most natural.`,
    },
    {
      title: `Align Spending with Values`,
      text: `With ${SIGN_NAMES[h2SignIdx]} on your 2nd house, your deepest financial satisfaction comes when spending aligns with the genuine values of this sign. Purchases that contradict those values drain energy even when affordable; spending aligned with them feels genuinely nourishing even when it stretches the budget. Periodic reviews of where money is going — and whether it reflects what you actually value — prevent long-term financial drift.`,
    },
    {
      title: 'Build Both Houses of Your Financial Life',
      text: `The 2nd-8th house axis asks you to develop both your independent earning capacity (2nd) and your ability to grow wealth through shared structures (8th). Many people over-develop one at the expense of the other — either being financially independent but isolated, or entirely reliant on partners and institutions. Balance between the two creates the most resilient financial foundation.`,
    },
  ];

  for (const item of adviceItems) {
    y = checkPageBreak(doc, y);
    y = addSubTitle(doc, item.title, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, item.text, margin, y, 170);
    y += 6;
  }

  // ── P12: Conclusion ────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, texts.LABELS.conclusion ?? 'Conclusion', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc,
    `${options.profileName}, your financial map reveals a complete and nuanced picture of how wealth moves in your life. The 2nd house in ${SIGN_NAMES[h2SignIdx]} defines your natural earning style; the 8th house in ${SIGN_NAMES[h8SignIdx]} shapes your relationship with shared resources and transformation; Venus in ${SIGN_NAMES[venusSign]} describes what you attract; Jupiter in ${SIGN_NAMES[jupSign]} marks where abundance flows most freely; and Saturn in ${SIGN_NAMES[satSign]} indicates where disciplined effort builds the most durable wealth.`,
    margin, y, 170);
  y += 6;

  y = wrapText(doc,
    `The most important insight this report offers is not a prediction — it is a description of your natural financial character. You will earn most effectively, build most sustainably, and experience the deepest financial satisfaction when you work with these planetary energies rather than against them. This means leaning into your Venus attraction style rather than copying someone else\'s, trusting your Jupiter instincts while respecting Saturn\'s boundaries, and understanding that your 2nd house ruler — ${h2RulerName} — is your primary financial navigation instrument.`,
    margin, y, 170);
  y += 6;

  y = wrapText(doc,
    `Money is not separate from the rest of life. The same chart that describes your emotional patterns, your creativity, your relationships and your purpose also describes your financial story — because they are all one story. When you align your financial life with your full chart rather than trying to optimise money in isolation, you discover that abundance is not just about numbers. It is about living fully within the specific, irreplaceable shape of who you are.`,
    margin, y, 170);
  y += 10;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('"Wealth consists not in having great possessions, but in having few wants." — Epictetus', margin, y);

  addFooters(doc, options.profileName);
  return doc.output('blob') as unknown as Blob;
}

// ============================================================
// HELPERS
// ============================================================

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
