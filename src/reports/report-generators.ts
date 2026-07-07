// ============================================================
// REPORT-GENERATORS.TS — Geradores de relatórios premium (Completos)
// Cada função gera um PDF com 15-25 páginas de conteúdo completo
// ============================================================

import { jsPDF } from 'jspdf';
import type { NatalChart, SynastryChart, Aspect } from '../engine/types';
import { getSignIndex, getDegreeInSign, formatDegMin } from '../engine/calculations';
import { generateFullReport } from '../engine/synthesis';
import { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, PLUTO_IN_HOUSE } from '../engine/outer-planets';
import { JUPITER_IN_SIGN, SATURN_IN_SIGN } from '../engine/outer-planets';
import { getAspectInterpretation } from '../engine/aspect-interpretations';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../engine/chiron';
import { downloadPdf } from './pdf-generator';
import { generateSynastryReport } from '../engine/synastry-interpretation';
import { getInterpretations } from '../engine/interpretations/index';
import { getReportLabels, SIGN_SYMBOLS } from './report-labels';
import { getAnnualTexts } from './annual-texts';
import { getSevenSinsTexts } from './seven-sins-texts';
import { getCareerTexts } from './career-texts';
import { getPsychologicalTexts } from './psychological-texts';

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

// Fallback constants (PT) — used by helper functions that don't receive locale.
// Within each generator function, these are shadowed by localized versions from getReportLabels().
const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];
// SIGN_SYMBOLS imported from report-labels.ts
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
  isTryout?: boolean;
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
  doc.text('Gostou do seu relatório?', w / 2, y, { align: 'center' });
  y += 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(`Compartilhe o ${reportName} com quem você ama.`, w / 2, y, { align: 'center' });
  doc.text('Outros relatórios disponíveis em nosso site.', w / 2, y + 14, { align: 'center' });
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

function addWatermark(_doc: jsPDF) {
  // Relatórios completos não têm marca d'água
}

/**
 * Tryout cut — adds watermark + CTA page after the first 3 pages (cover + 2 content)
 * Returns the truncated PDF blob, or null if not a tryout.
 */
function tryoutCut(doc: jsPDF, options: ReportOptions, reportName: string, price: string): Blob | null {
  if (!options.isTryout) return null;

  // Add SAMPLE watermark to all existing pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(50);
    doc.setTextColor(200, 200, 200);
    doc.text('SAMPLE', 105, 200, { align: 'center', angle: 45 });
  }

  // CTA final page
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
  doc.text('15-25 páginas com interpretação profunda e personalizada.', w / 2, y + 14, { align: 'center' });
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

// ============================================================
// ANNUAL DATA
// ============================================================

const PROFECTION_HOUSE_TEXTS = [
  'A Casa 1 em profecção marca um ano de renascimento pessoal. Sua identidade está em primeiro plano — a forma como você se apresenta ao mundo passa por uma revisão profunda. É comum sentir um impulso renovado de autonomia, mudança de aparência ou postura, e a vontade de começar algo que seja genuinamente seu. O regente do ano define o "combustível" desse recomeço: se for planeta benéfico, a renovação flui com leveza; se for maléfico, exige trabalho consciente e autoconhecimento. Este é um ano de protagonismo — coloque-se em primeiro lugar sem culpa.',
  'A Casa 2 em profecção coloca em foco sua relação com dinheiro, recursos próprios e autoestima. Este é um ano para examinar o que você valoriza de verdade — não apenas bens materiais, mas o que acredita merecer. Movimentações financeiras, novas fontes de renda ou revisão de gastos são temas recorrentes. A autoestima e a segurança interna também são ativadas: vale perguntar "o que me dá segurança de fato?" e agir a partir daí. Invista naquilo que te faz sentir fundado e capaz.',
  'A Casa 3 em profecção ativa comunicação, aprendizado, relações com irmãos e o entorno imediato. Um ano de muito movimento mental, trocas, cursos, escrita e deslocamentos curtos. A mente está acelerada e curiosa. Cuidado com dispersão — há tantos estímulos que manter foco exige disciplina. Relações com irmãos ou vizinhos podem ganhar relevância, seja para aproximar vínculos ou resolver pendências antigas.',
  'A Casa 4 em profecção traz o lar, a família de origem e as raízes emocionais para o centro do ano. Mudanças de residência, reestruturação familiar, ou um chamado interno para cuidar das próprias fundações emocionais são comuns. É um ano introspectivo — o mundo externo perde força e o mundo interno pede atenção. Terapia, retornos à cidade natal, ou questões com figuras parentais frequentemente emergem. Cuide de casa — tanto a física quanto a emocional.',
  'A Casa 5 em profecção é um dos períodos mais vibrantes do ciclo. Criatividade, romance, filhos e prazer são os temas centrais. Há uma energia lúdica e expansiva que empurra para se expressar, se arriscar, se amar. Projetos criativos ganham impulso natural. Romances podem surgir ou se intensificar. Para quem pensa em ter filhos, este ano muitas vezes é um gatilho. O risco é a impulsividade — agir pelo prazer imediato sem pensar nas consequências.',
  'A Casa 6 em profecção chama atenção para rotina, trabalho cotidiano e saúde. É um ano de ajustes práticos — rever hábitos, organizar a agenda, melhorar processos no trabalho. O corpo pede mais cuidado: alimentação, sono, exercício e prevenção entram no radar. No trabalho, questões com colegas, subordinados ou rotinas burocráticas podem exigir atenção. Não é um ano de grandes saltos — é de afinar o que já existe com disciplina e precisão.',
  'A Casa 7 em profecção é o ano das parcerias. Relacionamentos amorosos e profissionais vão ao centro do palco. É comum formalizar um vínculo (casamento, sociedade), encerrar um que não serve mais, ou ter encontros significativos com pessoas que mudam o rumo. O espelho do outro revela muito sobre si mesmo neste período. Acordos, contratos e negociações têm peso especial — revisar com cuidado antes de assinar.',
  'A Casa 8 em profecção é um dos anos mais intensos e transformadores do ciclo. Temas de morte simbólica, heranças, dívidas, sexualidade profunda e poder compartilhado entram em cena. O que não está mais servindo precisa ser solto — e Plutão, regente natural desta casa, não costuma pedir permissão. Crises e rupturas são frequentes, mas são necessárias para a renovação. Este ano tende a mudar você de forma irreversível.',
  'A Casa 9 em profecção ativa expansão, fé, filosofia, viagens longas e estudos superiores. É um ano de abertura de horizontes — intelectuais, geográficos ou espirituais. A busca por sentido e significado se intensifica. Viagens transformadoras, encontros com mestres, retomada de estudos ou interesse em espiritualidade são temas comuns. O risco é o escapismo — usar a expansão para fugir de responsabilidades práticas.',
  'A Casa 10 em profecção coloca a carreira e a reputação pública em destaque. Um ano de visibilidade — para o bem ou para o mal. Promoções, mudanças de cargo, reconhecimento público ou crises de imagem são possíveis. A relação com figuras de autoridade (chefes, Estado, figuras paternas) também é ativada. O que você constrói profissionalmente neste ano pode durar décadas — aja com intenção e estratégia.',
  'A Casa 11 em profecção ativa grupos, amizades, projetos coletivos e sonhos de futuro. É um ano voltado para o social e para o que você quer construir além de si mesmo. Novos círculos de amizade, projetos em grupo, causas sociais ou tecnologia podem ganhar relevância. Desejos de longo prazo entram no foco — vale perguntar "que futuro quero criar?" e dar os primeiros passos concretos.',
  'A Casa 12 em profecção é o ano de recolhimento, processamento interior e conclusão de ciclos. A energia externa diminui e a vida interna se intensifica. Sonhos, intuições, retiros, terapia e práticas espirituais ganham força. É comum sentir cansaço de exposição e vontade de simplificar. Questões não resolvidas do passado podem emergir — não para punir, mas para serem integradas antes do novo ciclo que começa na próxima profecção de Casa 1.',
];

const RULER_OF_YEAR = [
  'Marte é o regente do ano. Isso confere energia, impulsividade e coragem ao período — mas também pode trazer conflitos e impaciência. Acompanhe os trânsitos de Marte pelo seu mapa natal: quando ele aspecta planetas importantes, eventos se aceleram. Ação direta e decisiva é a palavra do ano.',
  'Vênus é a regente do ano. Temas de afeto, beleza, dinheiro e valores pessoais permeiam o período. Quando Vênus forma aspectos no seu mapa, relacionamentos e finanças ganham movimento. É um ano favorável para criar, negociar e cultivar vínculos.',
  'Mercúrio é o regente do ano. A mente está em primeiro plano — comunicação, decisões, contratos e aprendizados definem o ritmo. Fique atento aos períodos de Mercúrio retrógrado: tendem a trazer revisões nas áreas ativadas pela profecção.',
  'A Lua é a regente do ano. Emoções, ciclos e intuição guiam o período. O ritmo do ano segue o calendário lunar — lunações em aspecto com seus planetas natais marcam pontos de mudança. É um ano mais interno, onde ouvir o próprio instinto tem mais valor que seguir planos rígidos.',
  'O Sol é o regente do ano. Sua identidade e propósito estão no centro — um ano de expressão, liderança e visibilidade. Os períodos em que o Sol transita sobre seus planetas natais marcam momentos de clareza e impulso. Brilhe sem pedir permissão.',
  'Mercúrio é o regente do ano. Com Mercúrio em Virgem — seu domicílio —, a energia analítica e organizadora está em alta. Detalhes importam, processos podem ser otimizados. Retrógrados de Mercúrio merecem atenção especial este ano.',
  'Vênus é a regente do ano. Em Libra, seu domicílio, Vênus confere um ano favorável para relacionamentos, acordos e harmonia. Parcerias profissionais e amorosas têm potencial especial. Use este ciclo para selar vínculos que importam.',
  'Marte e Plutão co-regem o ano. É uma combinação intensa: Marte traz ação e confronto direto; Plutão traz transformação profunda e poder. Juntos, criam um ano de força — mas também de pressão. Precisão supera força bruta.',
  'Júpiter é o regente do ano. Expansão, otimismo e oportunidades marcam o período. É um ano favorável para crescimento, mas cuidado com excesso — Júpiter amplifica tudo, inclusive erros. Aproveite, mas mantenha os pés no chão.',
  'Saturno é o regente do ano. Disciplina, estrutura e responsabilidade definem o ciclo. O que você construir agora com paciência e método dura décadas. Cobranças e limites aparecem para ensinar, não para punir.',
  'Saturno e Urano co-regem o ano. A tensão entre manter vs. mudar é o tema central. Momentos de instabilidade podem surgir, mas trazem liberação do que estava estagnado. Inovação dentro de limites é a chave.',
  'Júpiter e Netuno co-regem o ano. Sonhos ganham força, mas os limites do real precisam ser respeitados. Criatividade, espiritualidade e compaixão fluem. Intuição e fé são aliados, desde que ancorados em ação concreta.',
];

// Textos mensais: [mês][casa] — variados por casa de profecção
function getMonthText(monthIdx: number, profHouse: number, satHouse: number, jupHouse: number): string {
  const month = MONTHS_PT[monthIdx];
  const season = monthIdx <= 2 ? 'verão' : monthIdx <= 5 ? 'outono' : monthIdx <= 8 ? 'inverno' : 'primavera';
  const transitHint = monthIdx % 3 === 0
    ? `Marte ativa sua Casa ${((profHouse + monthIdx) % 12) + 1} neste mês`
    : monthIdx % 3 === 1
    ? `Vênus percorre sua Casa ${((profHouse + monthIdx + 1) % 12) + 1} neste mês`
    : `Mercúrio reforça sua Casa ${((profHouse + monthIdx + 2) % 12) + 1} neste mês`;

  const themes: Record<number, string[]> = {
    1: [
      `${month} abre o ano com foco total em você. A energia do ${season} favorece novos começos e a afirmação da identidade. ${transitHint}, acelerando decisões pessoais. É o momento de definir quem você quer ser este ano e agir com esse propósito. Evite dispersão — o foco em si mesmo é o maior ativo de janeiro. Lua Nova no final do mês traz oportunidade de plantar intenções físicas e de identidade. Lua Cheia no meio revela onde você ainda se esconde de si mesmo. Cuide do corpo: sono, alimentação e movimento definem o tom do ano inteiro. Compromissos assumidos agora têm peso especial — honre-os.`,
      `${month} pressiona sua Casa 2 — finanças e autoestima entram no radar. ${transitHint}. Reveja receitas e despesas com realismo: o que está sangrando seu orçamento? A Lua Nova deste mês favorece declarações de intenção financeira. Lua Cheia ilumina o que você realmente valoriza versus o que apenas acumula por hábito. Pequenos ajustes de rotina financeira agora geram impacto composto ao longo do ano. A autoestima também é tema — note onde você se desvaloriza e corrija o padrão.`,
      `${month} ativa sua Casa 3 — mente, comunicação e vizinhança. ${transitHint}. Conversas importantes podem acontecer. Cursos curtos, podcasts e leituras abrem perspectivas novas. Lua Nova propícia para iniciar estudos ou projetos de escrita. Lua Cheia pode trazer notícias de irmãos ou revelações em diálogos próximos. Cuidado com excesso de informação — filtre o que realmente alimenta. Deslocamentos curtos podem trazer surpresas positivas.`,
      `${month} ativa sua Casa 4 — lar e raízes. ${transitHint}. A vida familiar ganha peso emocional. Questões da casa física ou da família de origem pedem atenção. Lua Nova favorece mudanças no lar ou rituais de enraizamento. Lua Cheia revela dinâmicas familiares que precisam de cuidado. É um mês mais introspectivo — permita-se sentir sem precisar agir imediatamente. Memórias antigas podem emergir trazendo insight valioso sobre padrões atuais.`,
      `${month} ilumina sua Casa 5 — criatividade e prazer. ${transitHint}. Projetos criativos ganham impulso. Romance está no ar — seja um encontro novo ou renovação de afeto já existente. Lua Nova ideal para lançar projeto artístico ou declarar amor. Lua Cheia pode trazer clímax em relacionamento ou revelação criativa. Cuide para não impulsionar gastos em prol do prazer — equilíbrio é chave. Brinque mais: o lúdico é necessário, não supérfluo.`,
      `${month} foca sua Casa 6 — rotina e saúde. ${transitHint}. Reveja hábitos com honestidade: o que está sabotando seu bem-estar? Lua Nova ideal para começar nova rotina de exercícios ou alimentação. Lua Cheia revela onde a rotina profissional está sobrecarregando. Relações no ambiente de trabalho podem exigir ajustes. Este é um mês produtivo para organização — limpe o que acumulou, seja em casa ou na agenda.`,
      `${month} ativa sua Casa 7 — parcerias. ${transitHint}. Relacionamentos importantes ganham movimento. Conversas sérias sobre vínculos afetivos ou profissionais podem acontecer. Lua Nova favorece novas alianças ou renovação de compromisso. Lua Cheia ilumina o que está desequilibrado em alguma parceria importante. Contratos merecem revisão cuidadosa. O outro é espelho: o que te incomoda no parceiro revela algo sobre você mesmo.`,
      `${month} ativa sua Casa 8 — transformação e recursos compartilhados. ${transitHint}. Temas de dívida, herança ou intimidade profunda podem emergir. Lua Nova propícia para encerrar ciclos, perdoar dívidas emocionais ou financeiras. Lua Cheia revela o que foi reprimido e agora pede expressão. Não evite conversas difíceis — este é o mês de olhar direto para o que assusta. Transformação real começa aqui.`,
      `${month} expande sua Casa 9 — filosofia e horizontes. ${transitHint}. Viagens, estudos ou buscas espirituais ganham força. Lua Nova ideal para planejar viagem transformadora ou iniciar curso de longa duração. Lua Cheia pode trazer revelação filosófica ou crise de crenças. Questione o que acredita sem questionar há anos. A abertura mental deste mês pode redirecionar sua trajetória de forma duradoura.`,
      `${month} ativa sua Casa 10 — carreira e reputação. ${transitHint}. Visibilidade profissional aumenta — para o bem e para o mal. Lua Nova favorece lançamentos profissionais e declarações de propósito de carreira. Lua Cheia pode trazer reconhecimento ou exposição inesperada. Decisões sobre carreira tomadas agora tendem a ter consequências de longo prazo. Aja com intenção e estratégia — evite exposição impulsiva.`,
      `${month} ilumina sua Casa 11 — grupos e sonhos. ${transitHint}. Amizades antigas ou novas ganham relevância. Projetos coletivos têm janela favorável. Lua Nova ideal para articular sonhos de futuro em planos concretos. Lua Cheia revela onde grupos ou amizades não estão correspondendo às expectativas. É hora de alinhar seu círculo social com quem você está se tornando, não com quem você foi.`,
      `${month} aprofunda sua Casa 12 — recolhimento e processamento. ${transitHint}. A vida interior pede espaço. Sonhos intensos, insights ou cansaço sem causa aparente são sinais de que o inconsciente está trabalhando. Lua Nova favorece rituais de encerramento e intenções espirituais. Lua Cheia revela o que foi varrido para baixo do tapete emocional. Descanse de verdade — este mês é sobre recarregar, não produzir.`,
    ],
  };

  return themes[1]?.[profHouse - 1] ?? `${month} ativa tendências relacionadas à sua Casa ${profHouse}. ${transitHint}. A Lua Nova do mês favorece novas intenções alinhadas com o tema anual. A Lua Cheia revela onde há desequilíbrio a ser corrigido. Mantenha o foco nos temas da profecção e observe como os eventos externos refletem o trabalho interno que você está realizando neste ciclo.`;
}

// ============================================================
// T33 — ANÁLISE ANUAL (20 páginas)
// ============================================================

export function generateAnnualPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const currentYear = new Date().getFullYear();
  const texts = getInterpretations(options.locale || 'pt');
  const labels = getReportLabels(options.locale || 'pt');
  const SIGN_NAMES = labels.signs;
  const PLANET_NAMES = labels.planets;
  const MONTHS_PT = labels.months;
  const at = getAnnualTexts(options.locale || 'pt');

  // P1: Capa
  renderCover(doc, `${texts.LABELS.annualTitle} ${currentYear}`, `${texts.LABELS.annualSubtitle} ${currentYear}`, options, '🔮');

  // Dados base
  const birthYear = parseInt(options.birthDate.split(/[-/]/)[0]) || 1990;
  const age = currentYear - birthYear;
  const profHouse = (age % 12) + 1;
  const profSign = getSignIndex(chart.houses.cusps[profHouse - 1]);
  const satHouse = chart.planetHouses.saturn || 1;
  const jupHouse = chart.planetHouses.jupiter || 1;
  const satSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const jupSign = getSignIndex(chart.positions.jupiter?.longitude || 0);
  const nnSign = getSignIndex(chart.positions.northNode?.longitude || 0);
  const snSign = (nnSign + 6) % 12;
  const sunSign = getSignIndex(chart.positions.sun?.longitude || 0);
  const moonSign = getSignIndex(chart.positions.moon?.longitude || 0);
  const mcSign = getSignIndex(chart.houses.midheaven);

  // P2: Profecção Anual
  doc.addPage();
  let y = 30;
  y = addSectionTitle(doc, texts.LABELS.profection, y, margin);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, at.profectionIntro(age, profHouse, SIGN_SYMBOLS[profSign], SIGN_NAMES[profSign]), margin, y, 170);
  y += 8;

  y = addSubTitle(doc, at.profHouseSubtitle(profHouse, SIGN_NAMES[profSign]), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, at.profectionHouse[profHouse - 1], margin, y, 170);
  y += 8;

  y = addSubTitle(doc, at.rulerSubtitle(SIGN_NAMES[profSign]), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, at.rulerOfYear[profSign], margin, y, 170);
  y += 8;

  y = addSubTitle(doc, at.workingSubtitle, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const workingTip = at.workingThisYear(profHouse);
  y = wrapText(doc, workingTip, margin, y, 170);

  // TRYOUT CUT — return after cover + profecção overview (3 pages)
  const tryoutBlob1 = tryoutCut(doc, options, 'Previsão Anual', '34.90');
  if (tryoutBlob1) return tryoutBlob1;

  // P3–P14: 12 meses (1 pág por mês)
  for (let m = 0; m < 12; m++) {
    doc.addPage();
    y = 30;
    const monthName = texts.MONTHS[m];
    y = addSectionTitle(doc, `${monthName} ${currentYear}`, y, margin);

    // Lua Nova e Cheia estimadas (datas aproximadas simbólicas)
    const luaNovaDay = 3 + (m * 2) % 15;
    const luaCheiaDay = 17 + (m * 1) % 10;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textLight);
    doc.text(`🌑 Lua Nova: ${luaNovaDay}/${m + 1}   🌕 Lua Cheia: ${luaCheiaDay}/${m + 1}`, margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const monthText = getMonthText(m, profHouse, satHouse, jupHouse);
    y = wrapText(doc, monthText, margin, y, 170);
    y += 8;

    // Dicas práticas do mês
    y = addSubTitle(doc, at.practicalTipsTitle, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const tips = [
      at.tipProfHouse(profHouse),
      m % 3 === 0 ? at.tipReviewGoals : m % 3 === 1 ? at.tipVenusActive : at.tipMercuryActive,
      jupHouse === (m % 12) + 1 ? at.tipJupiterActive(jupHouse) : at.tipJupiterBackground(SIGN_NAMES[jupSign]),
    ];
    for (const tip of tips) {
      y = wrapText(doc, `• ${tip}`, margin, y, 168);
      y += 4;
    }

    y += 6;
    // Frase do mês
    const phrases = at.monthPhrases;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.brandLight);
    doc.text(`"${phrases[m]}"`, margin, y, { align: 'left' });
  }

  // P15: Eclipses do ano
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, at.eclipseTitle(SIGN_NAMES[nnSign], SIGN_NAMES[snSign]), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const eclipseText = at.eclipseText(SIGN_NAMES[nnSign], SIGN_NAMES[snSign], profHouse);
  y = wrapText(doc, eclipseText, margin, y, 170);

  // P16: Saturno no ano
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, at.saturnTitle(SIGN_NAMES[satSign]), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const saturnIntro = at.saturnIntro(SIGN_NAMES[satSign]);
  y = wrapText(doc, saturnIntro, margin, y, 170);
  y += 6;

  const satHouseText = SATURN_IN_HOUSE[satHouse - 1] || `Saturno na Casa ${satHouse} pede estrutura e responsabilidade nessa área.`;
  y = addSubTitle(doc, at.saturnHouseSubtitle(satHouse), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, satHouseText, margin, y, 170);
  y += 6;

  const satSignText = SATURN_IN_SIGN[satSign] || `Saturno em ${SIGN_NAMES[satSign]} exige disciplina nessa expressão.`;
  y = addSubTitle(doc, at.saturnSignSubtitle(SIGN_NAMES[satSign]), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, satSignText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'Como Trabalhar com Saturno Este Ano', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, at.saturnWork, margin, y, 170);

  // P17: Júpiter no ano
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, at.jupiterTitle(SIGN_NAMES[jupSign]), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const jupIntro = at.jupiterIntro(SIGN_NAMES[jupSign]);
  y = wrapText(doc, jupIntro, margin, y, 170);
  y += 6;

  const jupHouseText = JUPITER_IN_HOUSE[jupHouse - 1] || `Júpiter na Casa ${jupHouse} traz oportunidades nessa área.`;
  y = addSubTitle(doc, at.jupiterHouseSubtitle(jupHouse), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, jupHouseText, margin, y, 170);
  y += 6;

  const jupSignText = JUPITER_IN_SIGN[jupSign] || `Júpiter em ${SIGN_NAMES[jupSign]} expande essa qualidade.`;
  y = addSubTitle(doc, at.jupiterSignSubtitle(SIGN_NAMES[jupSign]), y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, jupSignText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'Como Aproveitar Júpiter Este Ano', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, at.jupiterWork, margin, y, 170);

  // P18: Períodos críticos e oportunidades
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, at.criticalPeriodsTitle, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const criticalPeriods = at.criticalPeriods.map(cp => ({
    period: cp.period,
    type: cp.type,
    text: cp.text(SIGN_NAMES[jupSign]),
  }));

  for (const cp of criticalPeriods) {
    const typeColor: [number, number, number] = cp.type === 'oportunidade' ? COLORS.brand : cp.type === 'atenção' ? COLORS.red : COLORS.gold;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...typeColor);
    doc.text(`${cp.period} [${cp.type.toUpperCase()}]`, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, cp.text, margin, y, 170);
    y += 6;
    y = checkPage(doc, y);
  }

  // P19: Recomendações por trimestre
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, at.quarterTitle, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const quarters = at.quarters.map(qt => ({
    q: qt.q,
    recs: qt.recs.map(fn => fn(profHouse, satHouse, jupHouse)),
  }));

  for (const qt of quarters) {
    y = addSubTitle(doc, qt.q, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    for (const rec of qt.recs) {
      y = wrapText(doc, `• ${rec}`, margin, y, 168);
      y += 4;
    }
    y += 4;
    y = checkPage(doc, y);
  }

  // P20: Conclusão
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, texts.LABELS.conclusionAnnual, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const conclusion = at.conclusion(options.profileName, profHouse, SIGN_NAMES[profSign], at.rulerOfYear[profSign].split('.')[0], SIGN_NAMES[jupSign], SIGN_NAMES[satSign], SIGN_NAMES[nnSign], SIGN_NAMES[snSign]);
  y = wrapText(doc, conclusion, margin, y, 170);
  y += 10;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brandLight);
  doc.text(at.quote, margin, y, { align: 'left' });

  addFooters(doc, options.profileName);
  return doc.output('blob');
}

// ============================================================
// SYNASTRY HELPERS
// ============================================================

function renderCompatibilityBar(doc: jsPDF, label: string, score: number, x: number, y: number, barWidth = 120) {
  const filled = Math.round((score / 100) * barWidth);
  const barColor: [number, number, number] = score >= 70 ? COLORS.brand : score >= 50 ? COLORS.brandLight : COLORS.red;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text(label, x, y);
  doc.setFillColor(...COLORS.line);
  doc.roundedRect(x + 38, y - 3.5, barWidth, 5, 2, 2, 'F');
  if (filled > 0) { doc.setFillColor(...barColor); doc.roundedRect(x + 38, y - 3.5, filled, 5, 2, 2, 'F'); }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...barColor);
  doc.text(`${score}%`, x + 38 + barWidth + 4, y);
}

function buildSynastryAspects(chartA: NatalChart, chartB: NatalChart): Aspect[] {
  const planets = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'] as const;
  const aspects: Aspect[] = [];
  const ORBS: Record<string, number> = { conjunction: 8, opposition: 8, trine: 7, square: 7, sextile: 5 };
  for (const pA of planets) {
    const posA = chartA.positions[pA]?.longitude;
    if (posA === undefined) continue;
    for (const pB of planets) {
      const posB = chartB.positions[pB]?.longitude;
      if (posB === undefined) continue;
      let diff = Math.abs(posA - posB);
      if (diff > 180) diff = 360 - diff;
      for (const { angle, type } of [{ angle: 0, type: 'conjunction' }, { angle: 180, type: 'opposition' }, { angle: 120, type: 'trine' }, { angle: 90, type: 'square' }, { angle: 60, type: 'sextile' }]) {
        const orb = Math.abs(diff - angle);
        if (orb <= (ORBS[type] ?? 6)) {
          aspects.push({ planet1: pA, planet2: pB, type: type as Aspect['type'], angle, orb, exactness: 1 - orb / (ORBS[type] ?? 6), applying: false, nature: type === 'trine' || type === 'sextile' ? 'harmonic' : type === 'square' || type === 'opposition' ? 'tense' : 'neutral' });
          break;
        }
      }
    }
  }
  return aspects;
}

function getDefaultThemes(): { title: string; icon: string; text: string; score: number }[] {
  return [
    { title: 'Atração e Química', icon: '🔥', score: 5, text: 'Adicione o mapa do(a) parceiro(a) para ver a análise de atração e química entre vocês.' },
    { title: 'Conexão Emocional', icon: '💙', score: 5, text: 'A profundidade emocional do relacionamento será calculada ao incluir o segundo mapa.' },
    { title: 'Comunicação', icon: '💬', score: 5, text: 'O ritmo mental e a facilidade de diálogo entre vocês aparecem na sinastria completa.' },
    { title: 'Crescimento Mútuo', icon: '🌱', score: 5, text: 'O potencial de crescimento compartilhado é visível nos aspectos entre os dois mapas.' },
    { title: 'Desafios', icon: '⚡', score: 5, text: 'Os pontos de atrito e transformação na relação surgem ao comparar os dois mapas.' },
  ];
}

// ============================================================
// T34 — RELACIONAMENTO (20 páginas)
// ============================================================

export function generateRelationshipPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const texts = getInterpretations(options.locale || 'pt');
  const labels = getReportLabels(options.locale || 'pt');
  const SIGN_NAMES = labels.signs;
  const PLANET_NAMES = labels.planets;
  const nameA = options.profileName;
  const nameB = options.partnerName || (options.locale === 'en' ? 'Partner' : 'Parceiro(a)');

  // P1: Capa
  renderCover(doc, texts.LABELS.relationshipTitle, `${nameA} & ${nameB}`, options, '♡');

  // Dados dos mapas
  const sunSignA = getSignIndex(chart.positions.sun?.longitude || 0);
  const moonSignA = getSignIndex(chart.positions.moon?.longitude || 0);
  const venusSignA = getSignIndex(chart.positions.venus?.longitude || 0);
  const marsSignA = getSignIndex(chart.positions.mars?.longitude || 0);
  const saturnSignA = getSignIndex(chart.positions.saturn?.longitude || 0);
  const plutoSignA = getSignIndex(chart.positions.pluto?.longitude || 0);
  const ascSignA = getSignIndex(chart.houses.cusps[0]);
  const h7SignA = getSignIndex(chart.houses.cusps[6]);
  const mercurySignA = getSignIndex(chart.positions.mercury?.longitude || 0);

  let compat = { overall: 72, attraction: 68, communication: 70, emotion: 74, values: 66, growth: 78, description: '' };
  let overviewText = '';
  let themes: { title: string; icon: string; text: string; score: number }[] = [];

  if (options.partnerChart) {
    const pc = options.partnerChart;
    const synChart: SynastryChart = { type: 'synastry', chartA: chart, chartB: pc, aspects: buildSynastryAspects(chart, pc) };
    const report = generateSynastryReport(synChart, nameA, nameB);
    compat = report.compatibility;
    overviewText = report.overview;
    themes = report.themes;
  } else {
    overviewText = `Este relatório analisa o padrão amoroso de ${nameA} com base em seu próprio mapa natal — Vênus, Marte, Casa 7 e Lua. Para ver a sinastria completa com ${nameB}, adicione o mapa de nascimento do(a) parceiro(a). O padrão individual já revela muito sobre como você ama, o que atrai e os desafios que tende a criar nos relacionamentos.`;
  }

  // P2: Visão Geral + Score
  doc.addPage();
  let y = 28;
  y = addSectionTitle(doc, texts.LABELS.compatibility, y, margin);

  const overallColor: [number, number, number] = compat.overall >= 70 ? COLORS.brand : compat.overall >= 50 ? COLORS.brandLight : COLORS.red;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(...overallColor);
  doc.text(`${compat.overall}%`, 105, y + 12, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text(texts.LABELS.compatibility.toLowerCase(), 105, y + 20, { align: 'center' });
  y += 30;

  for (const cat of [{ label: texts.LABELS.attractionChemistry, score: compat.attraction }, { label: texts.LABELS.emotionalConnection, score: compat.emotion }, { label: texts.LABELS.communication, score: compat.communication }, { label: texts.LABELS.compatibility, score: compat.values }, { label: texts.LABELS.growthPotential, score: compat.growth }]) {
    renderCompatibilityBar(doc, cat.label, cat.score, margin, y);
    y += 10;
  }
  y += 4;
  doc.setDrawColor(...COLORS.line); doc.setLineWidth(0.4); doc.line(margin, y, 190, y); y += 8;

  y = addSubTitle(doc, 'Visão Geral', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, overviewText, margin, y, 170);
  y += 8;

  y = addSubTitle(doc, 'O Que Este Relatório Cobre', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Este relatório analisa 5 dimensões do relacionamento: atração e química física, conexão emocional e segurança, estilo de comunicação, alinhamento de valores e dinâmicas de poder, e potencial de crescimento mútuo. Cada seção combina os elementos dos dois mapas para revelar onde a relação tem mais facilidade — e onde os desafios pedem trabalho consciente.`, margin, y, 170);

  // TRYOUT CUT — return after cover + overview (3 pages)
  const tryoutBlob2 = tryoutCut(doc, options, 'Relatório de Relacionamento', '39.90');
  if (tryoutBlob2) return tryoutBlob2;

  // P3: Sol ↔ Sol / Sol ↔ Lua
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'Cruzamentos Solares — Identidade e Vitalidade', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `O Sol representa a identidade central — quem somos quando estamos sendo mais nós mesmos. ${nameA} tem Sol em ${SIGN_NAMES[sunSignA]}, o que significa que sua energia vital se expressa de forma ${SIGN_NAMES[sunSignA] === 'Leão' ? 'radiante e criativa' : SIGN_NAMES[sunSignA] === 'Escorpião' ? 'intensa e transformadora' : 'autêntica e específica à natureza desse signo'}.`, margin, y, 170);
  y += 6;

  if (options.partnerChart) {
    const sunSignB = getSignIndex(options.partnerChart.positions.sun?.longitude || 0);
    y = addSubTitle(doc, `Sol em ${SIGN_NAMES[sunSignA]} × Sol em ${SIGN_NAMES[sunSignB]}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    const solarDiff = Math.abs(sunSignA - sunSignB);
    const solarHarmony = solarDiff === 0 ? 'conjunção — identidades muito semelhantes, o que cria compreensão imediata mas pode gerar falta de complementaridade' : solarDiff === 4 || solarDiff === 8 ? 'trígono — fluxo natural de energia, as identidades se complementam com facilidade' : solarDiff === 3 || solarDiff === 9 ? 'quadratura — tensão criativa que estimula crescimento, mas exige esforço de compreensão mútua' : solarDiff === 6 ? 'oposição — polaridades que se atraem e se chocam; a integração das diferenças é o trabalho da relação' : 'aspecto de sextil — oportunidade de conexão que requer cultivo consciente';
    y = wrapText(doc, `A relação Solar entre vocês é de ${solarHarmony}. Isso define a base da interação cotidiana — como cada um percebe o outro em sua essência mais fundamental.`, margin, y, 170);
    y += 6;

    const moonSignB = getSignIndex(options.partnerChart.positions.moon?.longitude || 0);
    y = addSubTitle(doc, `Sol em ${SIGN_NAMES[sunSignA]} × Lua em ${SIGN_NAMES[moonSignB]}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `O Sol de ${nameA} em ${SIGN_NAMES[sunSignA]} ilumina a Lua de ${nameB} em ${SIGN_NAMES[moonSignB]}. Quando o Sol de alguém "vê" a Lua do outro, há um sentimento de reconhecimento profundo — como se um soubesse exatamente o que o outro precisa emocionalmente. Este é um dos aspectos mais importantes para a compatibilidade de longo prazo: indica se as necessidades emocionais de um são nutridas pelo propósito vital do outro.`, margin, y, 170);
  } else {
    y = addSubTitle(doc, `Sol em ${SIGN_NAMES[sunSignA]} — Seu Padrão de Identidade nos Relacionamentos`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Com Sol em ${SIGN_NAMES[sunSignA]}, você busca um parceiro que reconheça e valorize sua identidade essencial. Precisa de relacionamentos onde pode ser genuinamente você mesmo — sem se comprimir ou se inflar para agradar. O tipo de parceiro que faz seu Sol brilhar é aquele que admira o que você é sem precisar mudá-lo. Fique atento a relacionamentos onde você sente necessidade constante de se justificar ou se diminuir.`, margin, y, 170);
  }

  // P4: Lua ↔ Lua / Lua ↔ Vênus
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'Conexão Emocional — Lua e Vênus', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A Lua governa as necessidades emocionais, os padrões de apego e o que nos faz sentir seguros em um relacionamento. Vênus governa o amor, os valores e o tipo de afeto que damos e recebemos. A harmonia entre as Luas e entre Lua e Vênus dos parceiros é fundamental para a profundidade emocional da relação.`, margin, y, 170);
  y += 6;

  if (options.partnerChart) {
    const moonSignB = getSignIndex(options.partnerChart.positions.moon?.longitude || 0);
    const venusSignB = getSignIndex(options.partnerChart.positions.venus?.longitude || 0);
    y = addSubTitle(doc, `Lua em ${SIGN_NAMES[moonSignA]} × Lua em ${SIGN_NAMES[moonSignB]}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `${nameA} tem Lua em ${SIGN_NAMES[moonSignA]}, o que significa que precisa de ${SIGN_NAMES[moonSignA] === 'Câncer' ? 'cuidado, segurança e vínculos profundos' : SIGN_NAMES[moonSignA] === 'Leão' ? 'reconhecimento, afeto demonstrado e expressão emocional' : 'sua forma específica de nutrição emocional'}. ${nameB} tem Lua em ${SIGN_NAMES[moonSignB]}. A interação entre essas duas necessidades emocionais define como o casal lida com vulnerabilidade, cuidado mútuo e a linguagem afetiva do dia a dia.`, margin, y, 170);
    y += 6;
    y = addSubTitle(doc, `Lua em ${SIGN_NAMES[moonSignA]} × Vênus em ${SIGN_NAMES[venusSignB]}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `A Lua de ${nameA} recebe o amor de Vênus de ${nameB} em ${SIGN_NAMES[venusSignB]}. Quando Vênus de alguém encontra a Lua do outro, há um sentimento de ser amado da maneira certa — o afeto chega de um jeito que ressoa no coração. Este cruzamento é um dos mais doces da sinastria e indica capacidade de nutrição emocional genuína entre os parceiros.`, margin, y, 170);
  } else {
    y = addSubTitle(doc, `Lua em ${SIGN_NAMES[moonSignA]} — Suas Necessidades Emocionais`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Sua Lua em ${SIGN_NAMES[moonSignA]} define o que você precisa emocionalmente para se sentir seguro em um relacionamento. Quando essas necessidades são atendidas, você é capaz de dar muito afeto; quando são ignoradas, você pode se fechar ou reagir de formas que o parceiro não compreende. Comunicar essas necessidades claramente — em vez de esperar que o outro as adivinhe — é o trabalho central da sua vida emocional nos relacionamentos.`, margin, y, 170);
    y += 6;
    y = addSubTitle(doc, `Vênus em ${SIGN_NAMES[venusSignA]} — Como Você Ama`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Vênus em ${SIGN_NAMES[venusSignA]} define seu estilo de amor: o que você valoriza em um parceiro, como expressa afeto e o que te faz sentir amado de volta. Você tende a amar de forma ${SIGN_NAMES[venusSignA] === 'Áries' ? 'direta e apaixonada' : SIGN_NAMES[venusSignA] === 'Touro' ? 'sensual e leal' : SIGN_NAMES[venusSignA] === 'Gêmeos' ? 'intelectual e variada' : SIGN_NAMES[venusSignA] === 'Câncer' ? 'protetora e devota' : SIGN_NAMES[venusSignA] === 'Leão' ? 'dramática e generosa' : 'autêntica ao seu signo'}. Parceiros que expressam amor de forma diferente podem parecer frios ou distantes, mas frequentemente estão amando à sua própria maneira.`, margin, y, 170);
  }

  // P5: Vênus ↔ Marte
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'Atração e Desejo — Vênus e Marte', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Vênus e Marte são os polos complementares do desejo. Vênus representa o que atrai, o que quer ser cortejado, a receptividade. Marte representa a iniciativa, o desejo ativo, a força que se move em direção ao objeto amado. A interação entre Vênus de um e Marte do outro é o termômetro da atração física e da dinâmica de conquista no casal.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Vênus em ${SIGN_NAMES[venusSignA]} × Marte em ${SIGN_NAMES[marsSignA]}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Em seu próprio mapa, Vênus em ${SIGN_NAMES[venusSignA]} define o que você acha belo e desejável, enquanto Marte em ${SIGN_NAMES[marsSignA]} define como você age quando quer alguém. A tensão ou harmonia entre esses dois planetas em você mesmo revela se sua expressão do desejo flui com naturalidade ou se há conflito interno entre o que você quer e como você age para consegui-lo.`, margin, y, 170);
  y += 6;

  if (options.partnerChart) {
    const venusSignB = getSignIndex(options.partnerChart.positions.venus?.longitude || 0);
    const marsSignB = getSignIndex(options.partnerChart.positions.mars?.longitude || 0);
    y = addSubTitle(doc, `Vênus de ${nameA} (${SIGN_NAMES[venusSignA]}) × Marte de ${nameB} (${SIGN_NAMES[marsSignB]})`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Quando o Marte de ${nameB} em ${SIGN_NAMES[marsSignB]} encontra a Vênus de ${nameA} em ${SIGN_NAMES[venusSignA]}, a dinâmica de atração se torna visível. Marte persegue; Vênus convida. Se os signos são compatíveis elementalmente (mesmo elemento ou elementos complementares), a atração física tende a ser forte e sustentável. Se são signos de elementos tensos, a atração pode ser intensa mas exigir mais esforço para se manter ao longo do tempo.`, margin, y, 170);
    y += 6;
    y = addSubTitle(doc, `Marte de ${nameA} (${SIGN_NAMES[marsSignA]}) × Vênus de ${nameB} (${SIGN_NAMES[venusSignB]})`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `O Marte de ${nameA} em ${SIGN_NAMES[marsSignA]} move-se em direção à Vênus de ${nameB} em ${SIGN_NAMES[venusSignB]}. Esta é a corrente de desejo ativo de ${nameA} para ${nameB}. Quando ambos os cruzamentos Vênus/Marte são presentes e harmônicos, a atração é bidirecional e a química física tende a ser um dos pilares sólidos do relacionamento.`, margin, y, 170);
  } else {
    y = addSubTitle(doc, `Marte em ${SIGN_NAMES[marsSignA]} — Como Você Conquista`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Marte em ${SIGN_NAMES[marsSignA]} define sua abordagem na conquista e no desejo. Você tende a ser ${SIGN_NAMES[marsSignA] === 'Áries' ? 'direto e sem rodeios — age primeiro, pensa depois' : SIGN_NAMES[marsSignA] === 'Touro' ? 'paciente e sensual — conquista pelo prazer e pela constância' : SIGN_NAMES[marsSignA] === 'Escorpião' ? 'intenso e estratégico — sente muito antes de mostrar' : 'autêntico ao estilo do seu signo'} na conquista. Reconhecer seu estilo de Marte ajuda a entender por que certos potenciais parceiros respondem bem a você e outros não.`, margin, y, 170);
  }

  // P6: Mercúrio ↔ Mercúrio
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'Comunicação — Mercúrio e a Mente', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Mercúrio governa como pensamos, falamos e processamos informação. A compatibilidade mental entre parceiros é frequentemente subestimada — mas é o que sustenta a relação quando a paixão inicial se estabiliza. Casais que se entendem mentalmente, que se divertem conversando e que conseguem resolver conflitos com palavras, têm uma base sólida para o longo prazo.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Mercúrio em ${SIGN_NAMES[mercurySignA]} — Seu Estilo Mental`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const mercStyles: Record<number, string> = { 0: 'rápido, direto e impaciente com rodeios', 1: 'metódico, prático e precisa de tempo para processar', 2: 'ágil, curioso e capaz de manter várias conversas simultaneamente', 3: 'intuitivo e emocional — pensa com o coração', 4: 'dramático e criativo — conta histórias e precisa de audiência', 5: 'analítico e preciso — prefere fatos a opiniões', 6: 'diplomático — pesa todos os lados antes de concluir', 7: 'investigativo e intenso — vai às raízes de qualquer assunto', 8: 'expansivo e filosófico — pensa em grandes temas', 9: 'pragmático e estratégico — avalia o que é útil', 10: 'original e não-linear — conecta ideias inesperadas', 11: 'imaginativo e não-linear — absorve mais do que processa verbalmente' };
  y = wrapText(doc, `Com Mercúrio em ${SIGN_NAMES[mercurySignA]}, seu estilo mental é ${mercStyles[mercurySignA] || 'singular e específico ao seu signo'}. Em conversas, você ${mercurySignA <= 1 || mercurySignA === 9 ? 'prefere objetividade e vai direto ao ponto' : mercurySignA === 2 || mercurySignA === 10 ? 'navega por vários assuntos e aprecia a troca rápida' : 'tem seu próprio ritmo e precisa de espaço para se expressar completamente'}.`, margin, y, 170);
  y += 6;

  if (options.partnerChart) {
    const mercSignB = getSignIndex(options.partnerChart.positions.mercury?.longitude || 0);
    y = addSubTitle(doc, `Mercúrio em ${SIGN_NAMES[mercurySignA]} × Mercúrio em ${SIGN_NAMES[mercSignB]}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `${nameB} processa a realidade com Mercúrio em ${SIGN_NAMES[mercSignB]}. A interação entre esses dois estilos mentais define o ritmo das conversas, a facilidade de resolver conflitos e a qualidade do diálogo cotidiano. Quando os Mercúrios são de elementos compatíveis, a comunicação flui naturalmente. Quando são tensos, um parceiro pode parecer "não entender" o outro — mas frequentemente é só uma diferença de estilo, não de intenção.`, margin, y, 170);
    y += 6;
    y = wrapText(doc, `Diferenças de Mercúrio podem ser resolvidas com acordos explícitos: "preciso de tempo antes de responder" ou "prefiro conversar por escrito em temas difíceis". O que parece incompatibilidade muitas vezes é apenas falta de tradução entre dois estilos igualmente válidos.`, margin, y, 170);
  }

  // P7: Saturno cruzado
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.commitmentLimits, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Saturno nos relacionamentos representa comprometimento, limites e a realidade do longo prazo. Quando Saturno de um parceiro aspecta planetas pessoais do outro, a relação ganha peso e seriedade — mas também pode criar sensação de cobrança ou restrição. Saturno não é inimigo do amor; é o cimento que mantém a estrutura de pé quando a paixão inicial se estabiliza.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Saturno em ${SIGN_NAMES[saturnSignA]} — Seu Padrão de Comprometimento`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const saturnLoveText = `Com Saturno em ${SIGN_NAMES[saturnSignA]}, você leva comprometimento a sério — talvez seriamente demais. A área da vida onde Saturno está em seu mapa tende a ser onde você é mais exigente consigo mesmo e com o parceiro. Medos de abandono, rejeição ou não ser suficiente frequentemente têm raiz saturniana. O trabalho com Saturno nos relacionamentos é separar a exigência saudável (que constrói) da exigência rígida (que sufoca).`;
  y = wrapText(doc, saturnLoveText, margin, y, 170);
  y += 6;

  if (options.partnerChart) {
    const satSignB = getSignIndex(options.partnerChart.positions.saturn?.longitude || 0);
    y = addSubTitle(doc, `Saturno de ${nameA} (${SIGN_NAMES[saturnSignA]}) × Saturno de ${nameB} (${SIGN_NAMES[satSignB]})`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Quando os Saturnos de dois parceiros fazem aspectos entre si, surgem temas de maturidade, responsabilidade e a estrutura que o casal constrói juntos. Se harmônicos, os dois Saturnos se apoiam na construção de algo durável. Se tensos, pode haver choque de limites — um parceiro pode sentir que o outro é controlador, ou que as exigências são incompatíveis. Identificar esse padrão é o primeiro passo para trabalhar com ele conscientemente.`, margin, y, 170);
  }
  y += 6;
  y = addSubTitle(doc, 'Casa 7 — O Que Você Busca no Parceiro', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Sua Casa 7 em ${SIGN_NAMES[h7SignA]} define o arquétipo do parceiro que você atrai e busca. Esse signo na cúspide da Casa 7 é frequentemente a qualidade que você mesmo tem dificuldade de integrar — e por isso projeta no outro. Quando você desenvolve consciente essa qualidade em si mesmo, o tipo de parceiro que atrai também muda: de alguém que carrega isso por você para alguém que complementa o que você já integrou.`, margin, y, 170);

  // P8: Plutão cruzado
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.shadow, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Plutão nos relacionamentos governa poder, obsessão, transformação profunda e o que fica oculto entre dois parceiros. Quando Plutão de um aspecta planetas pessoais do outro, a relação tem profundidade psicológica — mas também pode trazer dinâmicas de controle, ciúme ou manipulação inconsciente. Plutão não é uma força negativa: é a força que transforma. Mas ela exige consciência para não destruir o que deveria apenas renovar.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Plutão em ${SIGN_NAMES[plutoSignA]} — Sua Geração e o Poder Pessoal`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Plutão define tanto temas geracionais quanto padrões pessoais de poder. Em relacionamentos, ele revela onde você tem medo de perder controle — e por isso pode controlar o outro. Também revela onde você tem mais poder pessoal do que reconhece. O trabalho plutoniano nos relacionamentos é desenvolver poder interior (não sobre o outro) e criar espaço para que o parceiro também seja poderoso.`, margin, y, 170);
  y += 6;

  if (options.partnerChart) {
    const plutoSignB = getSignIndex(options.partnerChart.positions.pluto?.longitude || 0);
    y = addSubTitle(doc, `Plutão de ${nameA} (${SIGN_NAMES[plutoSignA]}) × Plutão de ${nameB} (${SIGN_NAMES[plutoSignB]})`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `As dinâmicas plutonianas entre os dois mapas revelam onde a relação tem potencial de transformação profunda — para ambos. Relacionamentos com forte Plutão mudam as pessoas: você entra de um jeito e sai diferente. Isso pode ser aterrorizante ou libertador, dependendo de quanto cada parceiro está disposto a se examinar com honestidade.`, margin, y, 170);
  }
  y += 6;
  y = wrapText(doc, `Sinais de Plutão saudável na relação: transformação mútua, profundidade sem sufocamento, poder compartilhado sem controle. Sinais de Plutão não-integrado: ciúme, manipulação, segredos, dinâmicas de dependência. A diferença está no nível de consciência que cada parceiro traz para a dinâmica.`, margin, y, 170);

  // P9-P13: 5 Temas de sinastria
  const displayThemes = themes.length >= 5 ? themes.slice(0, 5) : getDefaultThemes();
  const themeExtra = [
    `Este tema é o coração magnético da relação — o que faz dois estranhos se reconhecerem como relevantes um para o outro. Cultivar consciência sobre a dinâmica de atração evita que ela seja consumida pela rotina ou pela idealização excessiva.`,
    `A segurança emocional é o chão do relacionamento. Sem ela, qualquer conflito parece uma ameaça à relação inteira. Construí-la intencionalmente — com gestos repetidos de cuidado e presença — é o trabalho cotidiano mais importante do casal.`,
    `Casais que se comunicam bem conseguem resolver quase qualquer problema. A comunicação não é apenas falar — é criar um espaço onde o outro se sinta seguro para ser honesto. Rituais de conversa (check-ins semanais, por exemplo) fortalecem esse músculo.`,
    `Relacionamentos que não crescem estagnaram. O parceiro ideal não é aquele que te mantém confortável, mas aquele que te inspira a expandir — e vice-versa. Desafiar o outro com gentileza é um ato de amor.`,
    `Todo relacionamento tem desafios — os que sobrevivem são os que desenvolvem uma linguagem para lidar com eles sem se destruir no processo. Identificar os padrões de conflito recorrentes é o primeiro passo para transformá-los.`,
  ];

  for (let i = 0; i < 5; i++) {
    doc.addPage(); y = 30;
    const theme = displayThemes[i];
    y = addSectionTitle(doc, `${theme.icon} ${theme.title}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, theme.text, margin, y, 170);
    y += 8;
    y = wrapText(doc, themeExtra[i], margin, y, 170);
    y += 8;
    renderCompatibilityBar(doc, 'Intensidade deste tema', Math.round(theme.score * 10), margin, y, 130);
    y += 14;
    y = addSubTitle(doc, 'Como trabalhar este tema', y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    const workTips = [
      `Nutra a atração com novidade e presença. Rotina não precisa matar a química — mas precisa de injeções conscientes de espontaneidade. Reserve tempo para estar junto sem agenda.`,
      `Pratique "check-ins emocionais" regulares: pergunte ao parceiro o que ele precisa emocionalmente nesta semana, sem julgar a resposta. Segurança emocional se constrói com pequenos gestos repetidos, não com grandes declarações esporádicas.`,
      `Defina um "acordo de comunicação": como vocês falam quando estão com raiva? Quem inicia conversas difíceis? Qual o tempo de processamento que cada um precisa? Acordos explícitos poupam muitos conflitos implícitos.`,
      `Identifique um sonho que cada um tem e que ainda não compartilhou completamente com o outro. Compartilhe. Pergunte como podem se apoiar mutuamente nisso. Crescimento conjunto começa com vulnerabilidade.`,
      `Mapeie os 3 conflitos que se repetem na relação. Para cada um, pergunte: "o que estou precisando que não estou pedindo diretamente?" O conflito geralmente é o pedido que não foi feito de forma clara.`,
    ];
    y = wrapText(doc, workTips[i], margin, y, 170);
  }

// ============================================================

  // P14: Mapa Composto
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'O Casal como Entidade — Mapa Composto', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `O mapa composto é calculado pela média das posições dos planetas dos dois parceiros. Ele não pertence a nenhum dos dois individualmente — pertence à relação em si. É o "mapa do casal", revelando a identidade da relação, seu propósito e os desafios que o casal como unidade enfrenta.`, margin, y, 170);
  y += 6;
  y = wrapText(doc, `O Sol composto mostra o propósito central da relação — por que vocês dois estão juntos em um nível mais profundo que a atração ou conveniência. A Lua composta mostra as necessidades emocionais do casal como entidade. O Ascendente composto revela como a relação se apresenta ao mundo externo.`, margin, y, 170);
  y += 6;
  if (options.partnerChart) {
    const compSunLon = ((chart.positions.sun?.longitude || 0) + (options.partnerChart.positions.sun?.longitude || 0)) / 2;
    const compSunSign = getSignIndex(compSunLon);
    y = addSubTitle(doc, `Sol Composto em ${SIGN_NAMES[compSunSign]} — Propósito do Casal`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `O Sol composto em ${SIGN_NAMES[compSunSign]} sugere que esta relação existe para ${SIGN_NAMES[compSunSign] === 'Áries' ? 'impulsionar ação, coragem e novos começos para ambos' : SIGN_NAMES[compSunSign] === 'Touro' ? 'construir segurança, estabilidade e prazer compartilhado' : SIGN_NAMES[compSunSign] === 'Gêmeos' ? 'estimular aprendizado, comunicação e curiosidade mútua' : SIGN_NAMES[compSunSign] === 'Câncer' ? 'criar lar, cuidado e raízes emocionais profundas' : SIGN_NAMES[compSunSign] === 'Leão' ? 'expressar criatividade, alegria e orgulho mútuo' : SIGN_NAMES[compSunSign] === 'Virgem' ? 'aprimorar, servir e crescer com método e dedicação' : SIGN_NAMES[compSunSign] === 'Libra' ? 'cultivar harmonia, beleza e equidade no vínculo' : SIGN_NAMES[compSunSign] === 'Escorpião' ? 'transformar, aprofundar e renovar ambos através da intimidade' : SIGN_NAMES[compSunSign] === 'Sagitário' ? 'expandir horizontes, fé e sentido de vida juntos' : SIGN_NAMES[compSunSign] === 'Capricórnio' ? 'construir legado, estrutura e conquistas duradouras' : SIGN_NAMES[compSunSign] === 'Aquário' ? 'inovar, libertar e contribuir para algo além dos dois' : 'dissolver fronteiras, cultivar compaixão e espiritualidade compartilhada'}.`, margin, y, 170);
  } else {
    y = wrapText(doc, `Com o mapa do parceiro, calculamos o Sol, Lua e Ascendente compostos para revelar o propósito, as necessidades emocionais e a "personalidade" da relação como entidade independente. Adicione o segundo mapa para ver esta análise completa.`, margin, y, 170);
  }

  // P15: Pontos de tensão
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'Pontos de Tensão — Como Trabalhar', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Todo relacionamento tem pontos de atrito. Não existe sinastria perfeita — existe sinastria consciente. Os pontos de tensão entre dois mapas não predizem fracasso; predizem os temas que o casal precisará trabalhar intencionalmente. Ignorar esses pontos não os dissolve — os fortalece. Encará-los com coragem e curiosidade, em vez de crítica, transforma atrito em crescimento.`, margin, y, 170);
  y += 8;

  const tensionAreas = [
    { title: 'Necessidades vs. Expectativas', text: `A maior fonte de conflito nos relacionamentos não é a incompatibilidade — é a expectativa não declarada. Quando esperamos que o parceiro saiba o que precisamos sem dizer, estamos configurando decepção. O trabalho aqui é desenvolver a habilidade de pedir diretamente: "esta semana, preciso que você..."` },
    { title: 'Ritmos Diferentes', text: `Cada pessoa tem um ritmo natural de processamento emocional, de decisão e de movimento. Quando os ritmos são diferentes, um parceiro pode parecer "frio" ou "apressado". A solução não é igualar os ritmos, mas criar acordos que honrem ambos: "dá para me dar 30 minutos antes de continuar esta conversa?"` },
    { title: 'Crescimento Assíncrono', text: `Às vezes um parceiro cresce mais rápido que o outro em determinada área. Isso pode criar sensação de distância ou superioridade. O trabalho é manter curiosidade pelo processo de crescimento do outro — não exigir que ele seja onde você está, mas não fingir que está onde ele está.` },
    { title: 'Sombras Projetadas', text: `Frequentemente irritamos no outro o que ainda não integramos em nós mesmos. Se uma qualidade do parceiro te irrita profundamente, vale perguntar: "onde essa qualidade aparece em mim que ainda não reconheço?" A projeção não é fraqueza — é universal. A consciência sobre ela é a diferença.` },
  ];
  for (const ta of tensionAreas) {
    y = addSubTitle(doc, ta.title, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, ta.text, margin, y, 170);
    y += 6;
    y = checkPage(doc, y);
  }

  // P16: Pontos de harmonia
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'Pontos de Harmonia — Como Cultivar', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Os pontos harmônicos de uma sinastria são o capital do relacionamento — recursos já disponíveis que não precisam ser construídos, apenas reconhecidos e usados. Muitos casais focam tanto nos desafios que esquecem de celebrar e nutrir o que funciona bem. Os pontos de harmonia são os pilares: quando você os fortalece intencionalmente, eles sustentam os períodos difíceis.`, margin, y, 170);
  y += 8;

  const harmonyAreas = [
    { title: 'Reconhecimento Mútuo', text: `Quando um parceiro reconhece genuinamente o valor do outro — não só o que ele faz, mas quem ele é —, cria-se o laço mais sólido. Pratique verbalizar o que admira no parceiro regularmente, especialmente em momentos neutros (não só em crises ou aniversários).` },
    { title: 'Linguagem de Amor Compartilhada', text: `Identifique a linguagem de amor primária de cada um (palavras de afirmação, tempo de qualidade, toque físico, atos de serviço, presentes) e invista nela intencionalmente. Amar da própria maneira nem sempre chega ao outro — amar na linguagem do outro é o ato de amor mais preciso.` },
    { title: 'Sonhos Compartilhados', text: `Casais que constroem sonhos juntos — planos futuros, projetos compartilhados, viagens imaginadas — mantêm a relação voltada para frente. O futuro compartilhado dá sentido à persistência nos momentos difíceis do presente.` },
    { title: 'Humor e Leveza', text: `A capacidade de rir juntos é um dos indicadores mais confiáveis de durabilidade em um relacionamento. Cultivar momentos de leveza — jogos, humor interno, rituais bobos — é tão importante quanto as grandes conversas sérias.` },
  ];
  for (const ha of harmonyAreas) {
    y = addSubTitle(doc, ha.title, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, ha.text, margin, y, 170);
    y += 6;
  }

  // P17: Recomendações
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `Recomendações para ${nameA} & ${nameB}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const recs = [
    `Pratique o "elogio específico": em vez de "você é incrível", tente "o que você fez ontem me mostrou exatamente por que confio em você". Especificidade amplifica impacto.`,
    `Crie um ritual semanal de 20 minutos sem celular, só para conversas que não sejam logística. Relacionamentos morrem mais por ausência de presença do que por conflito.`,
    `Quando houver conflito, adote a regra das 24h para temas que precisam de decisão: ninguém decide sob calor emocional. Dê tempo para cada um processar antes de retomar.`,
    `Identifiquem juntos 3 valores que são fundamentais para os dois e 1 valor importante para cada um individualmente. A intersecção é o terreno comum; os valores individuais são o espaço de autonomia.`,
    `Uma vez por ano, façam um "balanço do relacionamento": o que foi bem? O que foi difícil? O que queremos que o próximo ano traga? Esse ritual de revisão fortalece o senso de parceria consciente.`,
  ];
  for (const rec of recs) {
    y = wrapText(doc, `• ${rec}`, margin, y, 168);
    y += 6;
  }

  // P18: Conclusão
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.conclusion, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const relConclusion = `Nenhum mapa natal predetermina o sucesso ou fracasso de um relacionamento. O que a astrologia oferece é uma linguagem simbólica para entender padrões — e padrões podem ser trabalhados quando são vistos com clareza.\n\nEste relatório revelou os temas centrais da dinâmica entre ${nameA}${options.partnerChart ? ` e ${nameB}` : ''}: onde há facilidade natural, onde há desafios que pedem atenção, e como os padrões individuais de cada um interagem na relação.\n\nO amor não é apenas sentimento — é uma prática. Prática de presença, de comunicação, de crescimento e de escolha renovada. Os melhores relacionamentos não são os que têm menos dificuldades, mas os que desenvolvem ferramentas para atravessá-las juntos.\n\nUse este relatório como ponto de partida para conversas honestas, não como veredicto. O mapa aponta direções — vocês escolhem o caminho.`;
  y = wrapText(doc, relConclusion, margin, y, 170);
  y += 10;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(11); doc.setTextColor(...COLORS.brandLight);
  doc.text('"Amar é encontrar na felicidade de outrem a própria felicidade." — Leibniz', margin, y);

  addFooters(doc, options.profileName);
  return doc.output('blob');
}

// ============================================================
// T35 — PSICOLÓGICO PROFUNDO (22 páginas)
// ============================================================

export function generatePsychologicalPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const texts = getInterpretations(options.locale || 'pt');
  const labels = getReportLabels(options.locale || 'pt');
  const SIGN_NAMES = labels.signs;
  const PLANET_NAMES = labels.planets;
  const pst = getPsychologicalTexts(options.locale || 'pt');

  const sunSign = getSignIndex(chart.positions.sun?.longitude || 0);
  const moonSign = getSignIndex(chart.positions.moon?.longitude || 0);
  const mercSign = getSignIndex(chart.positions.mercury?.longitude || 0);
  const venusSign = getSignIndex(chart.positions.venus?.longitude || 0);
  const marsSign = getSignIndex(chart.positions.mars?.longitude || 0);
  const plutoSign = getSignIndex(chart.positions.pluto?.longitude || 0);
  const neptuneSign = getSignIndex(chart.positions.neptune?.longitude || 0);
  const saturnSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const chironSign = getSignIndex(chart.positions.chiron?.longitude || 0);
  const nnSign = getSignIndex(chart.positions.northNode?.longitude || 0);
  const ascSign = getSignIndex(chart.houses.cusps[0]);
  const plutoHouse = chart.planetHouses.pluto || 8;
  const chironHouse = chart.planetHouses.chiron || 1;
  const neptuneHouse = chart.planetHouses.neptune || 12;
  const saturnHouse = chart.planetHouses.saturn || 1;
  const moonHouse = chart.planetHouses.moon || 4;
  const nnHouse = chart.planetHouses.northNode || 1;
  const h4Sign = getSignIndex(chart.houses.cusps[3]);
  const h8Sign = getSignIndex(chart.houses.cusps[7]);
  const h12Sign = getSignIndex(chart.houses.cusps[11]);

  // P1: Capa
  renderCover(doc, texts.LABELS.psychTitle, 'Psique, sombra e integração', options, '⚇');

  // P2: Introdução
  doc.addPage(); let y = 30;
  y = addSectionTitle(doc, texts.LABELS.psychTitle, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, pst.intro, margin, y, 170);
  y += 6;
  y = wrapText(doc, `Este relatório não classifica você. Ele oferece uma linguagem para os padrões que você já sente, mas talvez não tenha conseguido nomear. Reconhecer um padrão não o dissolve automaticamente — mas é o primeiro passo necessário para trabalhar com ele conscientemente, em vez de ser governado por ele sem perceber.`, margin, y, 170);
  y += 6;
  y = wrapText(doc, `Ao longo das páginas seguintes, analisaremos a estrutura do ego (Sol e Ascendente), o mundo emocional (Lua), os processos mentais (Mercúrio), os padrões de amor e valor (Vênus), a força vital e agressividade (Marte), a sombra (Plutão), a ferida central (Quíron), o inconsciente (Casa 12 e Netuno), os padrões familiares herdados (Lua, Casa 4 e Saturno), e o caminho de integração que o mapa sugere.`, margin, y, 170);

  // TRYOUT CUT — return after cover + intro (3 pages)
  const tryoutBlob3 = tryoutCut(doc, options, texts.LABELS.psychTitle, '39.90');
  if (tryoutBlob3) return tryoutBlob3;

  // P3: Ego — Sol + Asc
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.egoStructure, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `O Sol representa o ego consciente — a identidade que construímos ao longo da vida, o centro gravitacional em torno do qual tudo se organiza. O Ascendente é a máscara adaptativa — como chegamos ao mundo, a primeira impressão que passamos e o filtro pelo qual percebemos a realidade. Juntos, eles formam a "persona": o Sol é quem você é quando está sendo mais você mesmo; o Ascendente é como você se apresenta antes de as pessoas te conhecerem de verdade.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Sol em ${SIGN_NAMES[sunSign]} — O Núcleo da Identidade`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const solTexts = ['Sua energia essencial é iniciadora e pioneira. Você precisa ser primeiro — não por arrogância, mas porque a espera sufoca sua vitalidade. O ego solar ariando funciona melhor quando tem liberdade de ação imediata e um objetivo claro. Sem desafio, murcha. Desafio maior que a capacidade, explode. O equilíbrio está em projetos que exijam coragem real, não temeridade.', 'Seu núcleo identitário busca segurança, prazer e permanência. Você constrói o ego através do que possui — não apenas materialmente, mas experiencialmente: gosto refinado, relações sólidas, habilidades que levaram anos para desenvolver. A ameaça existencial maior para o Sol em Touro é a mudança abrupta. O desafio é desenvolver a capacidade de soltar sem perder o senso de valor próprio.', 'Sua identidade é fluida e múltipla — você é genuinamente várias pessoas em uma. O ego gêmeos se desenvolve através da troca de informações e da variedade de papéis. O risco é a superficialidade crônica: tocar em tudo sem aprofundar nada. O desafio solar de Gêmeos é escolher — e suportar a ansiedade de não explorar o outro caminho.', 'Seu ego se forma em relação — família, pertencimento, raízes emocionais. Você sabe quem é quando sente que pertence a algum lugar ou alguém. O risco é dissolver o ego no papel de cuidador: ser tão "mãe/pai" que esquece quem é fora dessa função. O desafio solar canceriano é desenvolver identidade que não dependa de ser necessário.', 'Seu Sol pede expressão, reconhecimento e um palco — não por vaidade, mas porque a criação é sua linguagem existencial. Você existe plenamente quando está criando algo, liderando algo ou sendo visto em sua singularidade. O risco é o ego frágil que colapsa sem aplausos. O desafio é desenvolver autoestima que não dependa de validação externa.', 'Seu ego se organiza em torno da competência, da utilidade e do discernimento. Você sabe quem é quando está fazendo algo bem feito e servindo a um propósito. O risco é o perfeccionismo que paralisa: "não é bom o suficiente" aplicado a si mesmo. O desafio solar virgo é aceitar que ser humano inclui ser imperfeito — e que isso não diminui o valor.', 'Seu Sol busca equilíbrio, harmonia e relação. Você existe plenamente quando está em parceria — não como codependência, mas como genuína orientação para o outro. O risco é perder o ego nas relações: concordar tanto para manter paz que perde contato com o que realmente quer. O desafio é desenvolver identidade que não precise de validação pelo espelho do outro.', 'Sua identidade é forjada na intensidade. Você não existe superficialmente — tudo que você toca precisa de profundidade para ter sentido. O ego escorpiano se forma através de transformações repetidas: você morre e renasce psiquicamente várias vezes ao longo da vida. O risco é a suspeita crônica — proteger tanto o ego que ninguém consegue entrar de verdade.', 'Seu Sol busca sentido, expansão e verdade filosófica. Você existe plenamente quando tem uma visão de mundo que o inspira e quando está se movendo em direção a horizontes mais amplos. O risco é a arrogância doutrinária: ter encontrado "A Verdade" e perder a curiosidade. O desafio é manter abertura à revisão mesmo depois de construir um sistema de crenças sólido.', 'Seu ego se forma através de conquistas, responsabilidade e legado. Você sabe quem é pelo que construiu — e pelo reconhecimento de quem entende o custo de construir. O risco é o ego de trabalho: ser tão identificado com o que faz que sem realizações você se sente inexistente. O desafio é desenvolver identidade que inclua descanso e prazer sem culpa.', 'Seu Sol é rebelde por natureza — não por provocação, mas porque a autenticidade exige recusar o que não ressoa. Você existe plenamente quando está sendo original, quando contribui para algo coletivo e quando mantém liberdade pessoal. O risco é a rebeldia vazia: discordar só para não concordar. O desafio é escolher quando se conformar estrategicamente e quando a ruptura é genuinamente necessária.', 'Seu ego é poroso e fluido — você absorve emoções e atmosferas do ambiente com facilidade. O risco é a dissolução: perder o senso de quem você é nas emoções dos outros ou em ideais abstratos. O desafio solar pisciano é desenvolver fronteiras psíquicas saudáveis sem perder a sensibilidade que é um de seus maiores dons.'];
  y = wrapText(doc, solTexts[sunSign] || `Sol em ${SIGN_NAMES[sunSign]}: sua identidade se organiza em torno das qualidades essenciais deste signo.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Ascendente em ${SIGN_NAMES[ascSign]} — A Máscara e o Ponto de Entrada`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Seu Ascendente em ${SIGN_NAMES[ascSign]} é a forma como você chega ao mundo — a primeira impressão que passa e, mais importante, o filtro perceptivo pelo qual organiza a experiência. O Ascendente não é falso — é o mecanismo de adaptação que você desenvolveu para navegar a realidade. Com tempo e consciência, a diferença entre o Sol (quem você é de verdade) e o Ascendente (como você chega) diminui. Até lá, observar essa diferença é uma das práticas mais ricas de autoconhecimento.`, margin, y, 170);

  // P4: Lua — Mundo Emocional
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.emotionalWorld, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A Lua é um dos pontos mais importantes do mapa para compreensão psicológica. Ela governa as necessidades emocionais, os padrões de apego, a relação com a figura materna e o que nos faz sentir seguros. Diferente do Sol (consciente e aspiracional), a Lua opera automaticamente — reagimos a partir dela antes de pensar. Por isso, trabalhar a Lua é trabalhar o nível mais inconsciente e mais impactante do comportamento.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Lua em ${SIGN_NAMES[moonSign]} na Casa ${moonHouse}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const luaTexts = ['Suas necessidades emocionais são de ação, novidade e autonomia. Você se sente seguro quando tem liberdade de movimento e iniciativa. A dependência o sufoca; a independência o acalma. Emocionalmente, você reage de forma rápida e direta — e muitas vezes se arrepende depois. O trabalho da Lua em Áries é desenvolver a capacidade de sentir sem agir imediatamente — criar um espaço entre o impulso emocional e a resposta.', 'Você precisa de segurança, estabilidade e conforto sensorial para se sentir bem emocionalmente. Mudanças abruptas o desestabilizam profundamente — não por fraqueza, mas porque sua Lua processa em ritmo próprio, mais lento e mais profundo. O trabalho é aprender a diferenciar estabilidade necessária de resistência ao crescimento.', 'Sua necessidade emocional é de estimulação mental e comunicação. Você se sente seguro quando pode falar, trocar ideias e entender o que está sentindo através das palavras. Emoções não verbalizadas tendem a se tornar ansiedade. O trabalho é aprender a sentir antes de analisar — a emoção não precisa fazer sentido para ser válida.', 'Lua em Câncer está em domicílio — suas necessidades emocionais são profundas e centrais à sua vida. Você precisa de pertencimento, cuidado e vínculos seguros para funcionar bem. O risco é o apego excessivo: ao lar, às pessoas, ao passado. O trabalho é aprender a nutrir sem se perder no outro.', 'Você precisa de reconhecimento, admiração e expressão dramática para se sentir emocionalmente satisfeito. Não é vaidade — é uma necessidade real de ser visto em sua singularidade. Quando essa necessidade não é atendida, você ou performa mais intensamente ou colapsa. O trabalho é construir autoestima que não dependa de aplausos externos.', 'Suas necessidades emocionais são de ordem, competência e utilidade. Você se sente seguro quando há rotina, quando está fazendo algo bem feito e quando o ambiente ao redor está organizado. O caos externo te desestabiliza internamente. O trabalho é aprender que nem tudo precisa ser correto para ser bom o suficiente.', 'Você precisa de harmonia, equidade e relacionamentos balanceados para se sentir emocionalmente bem. Conflitos não resolvidos te perturbam profundamente — e você pode evitá-los ao custo de negar suas próprias necessidades. O trabalho é aprender que expressar desacordo não destrói o relacionamento — muitas vezes o fortalece.', 'Suas necessidades emocionais são intensas e profundas. Você precisa de intimidade real — não superficialidade. A pequena conversa te drena; o mergulho emocional te alimenta. O risco é o controle: proteger tanto o espaço emocional que ninguém consegue entrar. O trabalho é aprender a ser vulnerável com segurança.', 'Você precisa de liberdade, espaço e sentido filosófico para se sentir emocionalmente bem. Restrições e obrigações te sufocam. Emocionalmente, você tende a racionalizar o que sente — transformar sentimentos em conceitos. O trabalho é aprender a habitar as emoções sem precisar imediatamente transformá-las em insight.', 'Suas necessidades emocionais são de realização, estrutura e reconhecimento pelo que construiu. Vulnerabilidade emocional pode parecer fraqueza — e você aprendeu a controlar e gerenciar seus sentimentos desde cedo. O trabalho é aprender que sentir não compromete a competência — que mostrar emoção é força, não fraqueza.', 'Você precisa de liberdade intelectual e pertencimento a um grupo ou causa. Emoções muito intensas podem ser desconcertantes — você prefere analisá-las de longe. O risco é a desconexão emocional: intelectualizar tudo e nunca sentir de verdade. O trabalho é descer do plano mental para o plano sentimental com regularidade.', 'Suas necessidades emocionais são fluidas e difusas — você absorve emoções do ambiente como uma esponja. A empatia é seu dom e seu fardo. Sem fronteiras psíquicas, você pode se sentir responsável pelas emoções dos outros. O trabalho é aprender a distinguir "é meu" de "é do ambiente" — e praticar limites saudáveis com compaixão.'];
  y = wrapText(doc, luaTexts[moonSign] || `Lua em ${SIGN_NAMES[moonSign]}: suas necessidades emocionais seguem a natureza deste signo.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, texts.LABELS.childhoodTemplate, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A posição da Lua no mapa reflete não apenas suas necessidades emocionais atuais, mas o template formado na infância com a figura cuidadora primária. Não se trata de culpar a criação — trata-se de reconhecer padrões automáticos que foram adaptativos então e que podem ser revistos agora. A Lua na Casa ${moonHouse} indica que as primeiras experiências de segurança e cuidado estavam ligadas aos temas dessa casa. Esse padrão se repete automaticamente em relacionamentos adultos até ser reconhecido e trabalhado conscientemente.`, margin, y, 170);

  // P5: Mercúrio
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.mentalProcesses, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Mercúrio governa não apenas a comunicação, mas a estrutura do pensamento — como você organiza a realidade internamente, que tipo de informação prioriza, como processa o que é novo. Em psicologia junguiana, Mercúrio corresponde à função de pensamento ou intuição, dependendo de sua posição. Entender seu Mercúrio é entender como sua mente naturalmente funciona — e aceitar que outras mentes funcionam de forma diferente, não errada.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Mercúrio em ${SIGN_NAMES[mercSign]} — Seu Estilo Cognitivo`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const mercTexts = ['Mente rápida, direta e impaciente com ambiguidade. Você pensa em ação — as ideias precisam ter aplicação imediata ou perdem o interesse. O risco é a conclusão prematura: decidir antes de ter informação suficiente. O ganho é a capacidade de agir sem paralisia por análise.', 'Mente prática, metódica e sensorial. Você processa informações conectando-as com o que já conhece e com o que pode tocar, ver ou usar. Novas ideias abstratas precisam de tempo para serem absorvidas. O risco é o dogmatismo — resistir ao novo porque o familiar é confortável. O ganho é profundidade e confiabilidade intelectual.', 'Mente ágil, associativa e curiosa por natureza. Você faz conexões entre coisas aparentemente não relacionadas com facilidade, mas pode ter dificuldade em aprofundar qualquer uma. O risco é a dispersão intelectual crônica. O ganho é a versatilidade e a capacidade de se comunicar com quase qualquer pessoa.', 'Sua mente é intuitiva e emocional — você pensa com o corpo e o coração. Informações filtradas pela emoção têm mais peso que dados frios. O risco é a subjetividade excessiva: não conseguir separar "é o que sinto" de "é o que é". O ganho é a inteligência emocional e a memória associativa poderosa.', 'Sua mente é criativa, dramática e orientada para narrativa. Você pensa em histórias — não em dados, mas em personagens e arcos. O risco é a exageração: amplificar para tornar a história mais interessante. O ganho é o poder comunicativo e a capacidade de inspirar os outros.', 'Mente analítica, precisa e orientada para detalhe. Você processa a realidade desmontando-a em partes menores e examinando cada uma. O risco é a análise paralítica e a crítica excessiva aplicada a si mesmo. O ganho é a capacidade de identificar problemas e soluções que outros não veem.', 'Mente diplomática que pesa múltiplos pontos de vista antes de concluir. Você raramente pensa em absolutos — vê sempre os dois lados. O risco é a indecisão crônica. O ganho é a capacidade de mediar e encontrar sínteses que integram perspectivas opostas.', 'Mente investigativa e penetrante. Você não aceita respostas de superfície — quer chegar à raiz. O risco é a suspeita excessiva: ver intenção oculta onde não há. O ganho é a profundidade de análise e a capacidade de trabalhar com temas que outros evitam.', 'Mente filosófica e expansiva. Você pensa em grandes padrões, não em detalhes. O risco é o generalismo: perder a precisão na busca pelo quadro maior. O ganho é a capacidade de visão sistêmica e inspiração de longo prazo.', 'Mente estratégica e orientada para resultado. Você avalia informações pelo que produzem — o que não tem aplicação prática tende a ser descartado. O risco é o pragmatismo excessivo que fecha a criatividade. O ganho é a capacidade de executar planos complexos com disciplina.', 'Mente original e não-linear. Você faz conexões inesperadas e frequentemente pensa de formas que os outros não compreendem imediatamente. O risco é a comunicação deficiente — o que é óbvio para você pode ser confuso para o outro. O ganho é a inovação genuína e a capacidade de ver o que ainda não existe.', 'Mente imaginativa e receptiva. Você absorve impressões mais que analisa dados. O risco é a confusão entre fantasia e realidade, especialmente em estados emocionais intensos. O ganho é a criatividade e a intuição que frequentemente superam a análise racional.'];
  y = wrapText(doc, mercTexts[mercSign] || `Mercúrio em ${SIGN_NAMES[mercSign]}: sua mente processa o mundo através das qualidades deste signo.`, margin, y, 170);

  // P6: Vênus
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.lovePatterns, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Vênus governa o que amamos, o que valorizamos, o que consideramos belo e o que desejamos receber em troca de afeto. Psicologicamente, Vênus corresponde ao princípio do relacionamento — a capacidade de se ver no outro, de criar conexão, de encontrar valor no mundo. Uma Vênus não integrada pode se manifestar como dependência afetiva ou como dificuldade de receber amor. Uma Vênus saudável é capaz de dar e receber afeto com equilíbrio.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Vênus em ${SIGN_NAMES[venusSign]} — O Que Você Ama e Como Ama`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const venusTexts = ['Você ama com paixão instantânea e generosa. O problema é que a intensidade inicial raramente se mantém — e o que parecia amor eterno pode esfriar quando a novidade passa. O desafio é aprender a diferenciar infatuação de amor sustentável.', 'Você ama com lealdade, sensualidade e paciência. Uma vez que decide, mantenha — às vezes além do razoável. O desafio é aprender a soltar o que não serve mais, mesmo que seja confortável.', 'Você ama com a mente — conexão intelectual é essencial para o afeto se manter. O desafio é aprender a amar sem precisar entender tudo, e a tolerar a incerteza emocional.', 'Você ama de forma profunda, protetora e devota. O risco é o sufocamento: cuidar tanto que o outro se sente controlado. O desafio é amar com espaço.', 'Você ama de forma generosa, dramática e expressiva. O desafio é não confundir o romance do amor com o amor real — e aprender a amar sem público.', 'Você ama com dedicação e atenção aos detalhes. O desafio é não usar o serviço como substituto da vulnerabilidade emocional.', 'Você ama com equidade e beleza. O desafio é tomar decisões afetivas sem ficar em permanente pesagem de prós e contras.', 'Você ama com intensidade total — ou não ama. O desafio é aprender que a vulnerabilidade na intimidade não é perda de poder.', 'Você ama com entusiasmo e liberdade. O desafio é honrar comprometimentos sem sentir que eles roubam sua expansão.', 'Você ama com fidelidade e ambição compartilhada. O desafio é mostrar emoção — não apenas resultados.', 'Você ama com originalidade e espaço. O desafio é permitir intimidade real sem fugir quando ela se torna intensa.', 'Você ama com compaixão total — e pode se perder no outro. O desafio é manter identidade enquanto se entrega.'];
  y = wrapText(doc, venusTexts[venusSign] || `Vênus em ${SIGN_NAMES[venusSign]}: seu amor se expressa com as qualidades deste signo.`, margin, y, 170);

  // P7: Marte
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.vitalForce, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Marte é a força que nos move — não apenas a raiva (como popularmente se associa), mas toda a energia direcional: desejo, iniciativa, competição, defesa dos próprios limites. Uma Marte saudável sabe o que quer e age para conseguir. Uma Marte reprimida se manifesta como passividade, ressentimento acumulado e dificuldade de defender-se. Uma Marte não-contida se manifesta como agressividade, impulsividade e conflito crônico.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Marte em ${SIGN_NAMES[marsSign]} — Sua Energia de Ação`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const marsTexts = ['Sua energia é explosiva e imediata. Você age antes de pensar e se arrepende depois — mas sua velocidade de iniciação é um dom real. O desafio é desenvolver o "segundo pensamento" sem perder a espontaneidade.', 'Sua energia é lenta, constante e irresistível. Você não começa rápido, mas quando começa, dificilmente para. O desafio é a teimosia: saber quando mudar de curso é tão importante quanto a persistência.', 'Sua energia é mental e verbal — você luta com palavras mais do que com atos. Ação dispersa em muitas direções pode ser o resultado. O desafio é canalizar a energia para profundidade em vez de largura.', 'Sua energia é defensiva e protetora. Você atua mais para proteger do que para conquistar. O desafio é aprender a agir ofensivamente quando necessário, sem esperar ameaça para se mover.', 'Sua energia é criativa e teatral. Você age com drama e necessita de audiência para a energia fluir. O desafio é agir mesmo quando ninguém está olhando.', 'Sua energia é precisa e metódica. Você age de forma eficiente, mas pode se paralisar na busca pela forma perfeita de agir. O desafio é começar mesmo imperfeito.', 'Sua energia é diplomática — você age após pesar as consequências. O desafio é tomar decisões sem precisar de consenso universal.', 'Sua energia é estratégica e intensa. Você age com intenção e força — quando decide mover, move de verdade. O desafio é não usar essa força para controlar ou punir.', 'Sua energia é expansiva e entusiasta. Você age com fé e otimismo — às vezes em excesso. O desafio é sustentar a energia além do entusiasmo inicial.', 'Sua energia é calculada e persistente. Você age apenas quando tem certeza — o que pode resultar em procrastinação disfarçada de prudência. O desafio é agir com risco calculado, não apenas com certeza total.', 'Sua energia é inovadora e irregular. Você age em surtos — períodos de intensa atividade seguidos de paralisia. O desafio é criar ritmo sustentável em vez de depender de explosões.', 'Sua energia é difusa e sensível ao ambiente. Você age melhor quando inspirado e tem dificuldade em ambientes de pressão excessiva. O desafio é desenvolver ação independente de condições ideais.'];
  y = wrapText(doc, marsTexts[marsSign] || `Marte em ${SIGN_NAMES[marsSign]}: sua força vital se expressa através das qualidades deste signo.`, margin, y, 170);

  // P8: Plutão — Sombra
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.shadow, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Jung definiu a Sombra como tudo aquilo que não reconhecemos em nós mesmos — não necessariamente o "mau", mas o não-integrado. Plutão, no mapa natal, indica onde está a matéria mais densa dessa sombra: o que foi reprimido, o que assusta, o que tem mais poder precisamente porque não é reconhecido. Quando Plutão está ativo por trânsito ou progressão, a sombra se torna visível — geralmente através de crises ou pessoas que "espelham" o que você ainda não viu em si mesmo.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Plutão na Casa ${plutoHouse} em ${SIGN_NAMES[plutoSign]}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const plutoText = PLUTO_IN_HOUSE[plutoHouse - 1] || `Plutão na Casa ${plutoHouse} indica transformação profunda nessa área.`;
  y = wrapText(doc, plutoText, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Casa 8 em ${SIGN_NAMES[h8Sign]} — O Cofre do Inconsciente`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Sua Casa 8 em ${SIGN_NAMES[h8Sign]} define a qualidade do que está guardado nessa câmara profunda da psique. Os temas da Casa 8 — intimidade profunda, recursos compartilhados, poder, morte e renascimento psíquico — são vividos com a tonalidade de ${SIGN_NAMES[h8Sign]}. O trabalho com a Casa 8 é um trabalho de vida: gradual, profundo e sempre revelador de novas camadas.`, margin, y, 170);
  y += 6;
  const hardAspects = chart.aspects.filter(a => (a.type === 'square' || a.type === 'opposition') && (a.planet1 === 'pluto' || a.planet2 === 'pluto'));
  if (hardAspects.length > 0) {
    y = addSubTitle(doc, texts.LABELS.plutoAspects, y, margin);
    for (const asp of hardAspects.slice(0, 3)) {
      y = checkPage(doc, y);
      const other = asp.planet1 === 'pluto' ? asp.planet2 : asp.planet1;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...COLORS.red);
      doc.text(`${PLANET_NAMES[other] || other} ${asp.type === 'square' ? '□' : '☍'} Plutão`, margin, y); y += 5;
      const interp = getAspectInterpretation('pluto', other, asp.type) || getAspectInterpretation(other, 'pluto', asp.type) || `Este aspecto cria pressão transformadora entre ${PLANET_NAMES[other] || other} e Plutão.`;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
      y = wrapText(doc, interp, margin, y, 170); y += 5;
    }
  }

  // P9: Quíron
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.wound, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Quíron é o asteróide do "curandeiro ferido" — o ponto do mapa que indica uma ferida primária que não cura completamente, mas que, ao ser trabalhada, se transforma no maior dom. O mito de Quíron é preciso: ele era um centauro sábio e curador que não podia curar a si mesmo. A ferida de Quíron não é fraqueza — é o ponto de mais profundidade e autenticidade.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Quíron na Casa ${chironHouse} em ${SIGN_NAMES[chironSign]}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const chText = CHIRON_IN_HOUSE[chironHouse - 1] || `Quíron na Casa ${chironHouse}: a ferida se manifesta nessa área da vida.`;
  y = wrapText(doc, chText, margin, y, 170); y += 5;
  const chSignText = CHIRON_IN_SIGN[chironSign] || `Quíron em ${SIGN_NAMES[chironSign]}: a ferida tem a qualidade deste signo.`;
  y = wrapText(doc, chSignText, margin, y, 170); y += 6;
  y = addSubTitle(doc, texts.LABELS.fromWoundToGift, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A ferida de Quíron na Casa ${chironHouse} em ${SIGN_NAMES[chironSign]} não é para ser "curada" e deixada para trás — é para ser integrada e transformada em sabedoria. As pessoas que mais sofrem com a área de Quíron são frequentemente as que mais podem ajudar outros nessa mesma área, precisamente porque conhecem a dor por dentro. O caminho não é evitar a ferida — é aprender a permanecer presente nela com compaixão por si mesmo, o que transforma a vulnerabilidade em força genuína.`, margin, y, 170);

  // P10: Inconsciente — Casa 12 + Netuno
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.unconscious, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A Casa 12 e Netuno regem o que está além da consciência ordinária: sonhos, o inconsciente coletivo, padrões que operam abaixo do limiar da percepção, e a dissolução do ego em algo maior. É também a casa do isolamento, dos medos profundos e das fugas — tanto saudáveis (arte, meditação, sono) quanto não saudáveis (vícios, evasão). O trabalho com a Casa 12 e Netuno é um trabalho de toda uma vida.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Casa 12 em ${SIGN_NAMES[h12Sign]} — O Repositório do Inconsciente`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Com a Casa 12 em ${SIGN_NAMES[h12Sign]}, os temas inconscientes e os padrões de fuga carregam a tonalidade deste signo. O que fica guardado aqui não é acessível pela análise racional — precisa ser alcançado por vias não-lineares: sonhos, arte, meditação, terapia profunda ou experiências que dissolvem temporariamente o controle do ego. Planetas na Casa 12 operam como poderes ocultos — podem ser fontes enormes de profundidade ou de autossabotagem, dependendo do nível de consciência que você traz para eles.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Netuno na Casa ${neptuneHouse} em ${SIGN_NAMES[neptuneSign]}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Netuno dissolve — fronteiras, certezas, egos. Na Casa ${neptuneHouse}, ele cria uma área da vida onde a realidade é especialmente fluida, onde a ilusão e a visão se mistura. Em ${SIGN_NAMES[neptuneSign]}, ele expressa uma qualidade coletiva de dissolução que molda toda a sua geração. O desafio de Netuno é manter contato com o solo — desenvolver senso de realidade robusto sem perder a sensibilidade e a abertura para o transcendente.`, margin, y, 170);
  y += 6;
  const planetsIn12 = Object.entries(chart.planetHouses).filter(([_, h]) => h === 12).map(([p]) => p);
  if (planetsIn12.length > 0) {
    y = addSubTitle(doc, `Planetas na Casa 12: ${planetsIn12.map(p => PLANET_NAMES[p] || p).join(', ')}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Você tem planetas na Casa 12 — isso intensifica a experiência do inconsciente em sua vida. Esses planetas operam de forma menos visível, mas não menos poderosa. Trazê-los à consciência através de práticas reflexivas é um dos trabalhos mais transformadores disponíveis para você.`, margin, y, 170);
  }

  // P11: Padrões Familiares
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.familyPatterns, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Não escolhemos a família em que nascemos, mas herdamos seus padrões — emocionais, relacionais e de sobrevivência. A Lua, a Casa 4 e Saturno no mapa natal indicam esses padrões herdados: o que foi passado sem palavras, o que foi modelado pelos cuidadores, o que você aprendeu que era necessário para ser amado ou seguro. Esses padrões não são sentença — são o ponto de partida para a diferenciação consciente.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Casa 4 em ${SIGN_NAMES[h4Sign]} — O Lar Interior`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Sua Casa 4 em ${SIGN_NAMES[h4Sign]} define a qualidade do lar interior — o ambiente emocional que você carrega dentro de si, independente de onde está fisicamente. Esta casa também revela a herança emocional familiar: o que foi passado pela linhagem e o que você pode escolher transformar conscientemente.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Saturno na Casa ${saturnHouse} — A Lei do Pai`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Saturno na Casa ${saturnHouse} revela onde a mensagem saturniana foi mais forte na infância — "aqui você precisa trabalhar mais", "aqui você nunca é suficiente", "aqui você precisa ganhar o direito de existir". Essa mensagem raramente foi dada com malícia — foi transmitida pelos próprios medos e limitações dos cuidadores. O trabalho adulto com esse Saturno é internalizar a autoridade (não precisar de aprovação externa) e transformar a crítica interna em standard saudável.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, texts.LABELS.differentiation, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A diferenciação saudável não é rejeitar a família de origem — é escolher conscientemente quais padrões herdados servem ao quem você está se tornando, e quais precisam ser revistos. Esse processo geralmente envolve alguma dose de luto: o luto pelo que não foi, pelo que foi diferente do que precisava ser, e pelo que você gostaria que tivesse sido diferente. Ao mesmo tempo, é um processo de gratidão pelo que foi suficientemente bom — porque é a partir desse suficiente que você cresceu.`, margin, y, 170);

  // P12: Mecanismos de Defesa
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.defenseMechanisms, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Mecanismos de defesa não são fraquezas — são estratégias de sobrevivência psíquica desenvolvidas em resposta a experiências que precisavam ser gerenciadas. O problema é quando continuam operando automaticamente em situações onde não são mais necessários. Reconhecê-los é o primeiro passo para escolher quando usá-los conscientemente e quando soltar a guarda.`, margin, y, 170);
  y += 6;
  const saturnSignText = SATURN_IN_SIGN[saturnSign] || '';
  if (saturnSignText) {
    y = addSubTitle(doc, `Saturno em ${SIGN_NAMES[saturnSign]} — Estrutura Defensiva`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, saturnSignText, margin, y, 170); y += 6;
  }
  const tenseAspects = chart.aspects.filter(a => a.type === 'square' || a.type === 'opposition').slice(0, 3);
  if (tenseAspects.length > 0) {
    y = addSubTitle(doc, texts.LABELS.mainTensions, y, margin);
    for (const asp of tenseAspects) {
      y = checkPage(doc, y);
      const interp = getAspectInterpretation(asp.planet1, asp.planet2, asp.type) || '';
      if (interp) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...COLORS.brand);
        doc.text(`${PLANET_NAMES[asp.planet1] || asp.planet1} ${asp.type === 'square' ? '□' : '☍'} ${PLANET_NAMES[asp.planet2] || asp.planet2}`, margin, y); y += 5;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
        y = wrapText(doc, interp, margin, y, 170); y += 5;
      }
    }
  }

  // P13: Nodo Norte — Propósito
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.integrationPath, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `O Nodo Norte (Cabeça do Dragão) indica a direção evolutiva da alma — onde há crescimento genuíno, mesmo que desconfortável. O Nodo Sul indica os padrões já desenvolvidos, o terreno familiar que oferece conforto mas pode tornar-se zona de estagnação. A jornada nodal é sempre em direção ao desconhecido do Nodo Norte, utilizando (não abandonando) os recursos do Nodo Sul.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Nodo Norte em ${SIGN_NAMES[nnSign]} na Casa ${nnHouse}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const snSign = (nnSign + 6) % 12;
  const snHouse = nnHouse <= 6 ? nnHouse + 6 : nnHouse - 6;
  y = wrapText(doc, `Com Nodo Norte em ${SIGN_NAMES[nnSign]} na Casa ${nnHouse}, seu crescimento evolutivo se dá ao desenvolver as qualidades de ${SIGN_NAMES[nnSign]} e ao se engajar com os temas da Casa ${nnHouse}. Isso frequentemente envolve desconforto — você está indo para onde ainda não está completamente à vontade. O Nodo Sul em ${SIGN_NAMES[snSign]} na Casa ${snHouse} representa o que já domina e onde tende a se refugiar quando o Nodo Norte parece difícil demais.`, margin, y, 170);
  y += 6;
  y = wrapText(doc, `O trabalho nodal não é sobre perfeição — é sobre direção. Cada pequeno movimento em direção ao Nodo Norte, cada escolha que desenvolve suas qualidades e temas, conta. A vida não exige que você chegue ao destino — exige que você se mova na direção certa.`, margin, y, 170);

  // P14: Padrões Repetitivos
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.repetitivePatterns, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Quadraturas e oposições no mapa natal não são problemas a resolver — são tensões criativas a integrar. Uma quadratura é uma tensão interna: duas funções psíquicas que querem coisas diferentes. Uma oposição é uma polaridade: duas forças que precisam ser equilibradas em vez de suprimidas. Os padrões que se repetem em sua vida muitas vezes têm raiz nessas tensões — não porque você seja "difícil", mas porque ainda não encontrou a síntese que integra os dois polos.`, margin, y, 170);
  y += 6;
  const allHardAspects = chart.aspects.filter(a => a.type === 'square' || a.type === 'opposition').slice(0, 4);
  for (const asp of allHardAspects) {
    y = checkPage(doc, y);
    const interp = getAspectInterpretation(asp.planet1, asp.planet2, asp.type) || '';
    if (interp) {
      y = addSubTitle(doc, `${PLANET_NAMES[asp.planet1] || asp.planet1} ${asp.type === 'square' ? '□ Quadratura' : '☍ Oposição'} ${PLANET_NAMES[asp.planet2] || asp.planet2}`, y, margin);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
      y = wrapText(doc, interp, margin, y, 170); y += 6;
    }
  }
  if (allHardAspects.length === 0) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Seu mapa tem poucos aspectos tensos principais — isso não significa ausência de desafio, mas que as tensões tendem a ser mais sutis e menos visíveis. Os padrões repetitivos mais importantes para você estão provavelmente nos conjunções e nos planetas dominantes.`, margin, y, 170);
  }

  // P15: Potenciais Inexplorados
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.unexploredPotentials, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Trígonos e sextis representam fluxo e facilidade — qualidades e habilidades que vêm naturalmente. Paradoxalmente, esses pontos frequentemente ficam subutilizados: como não exigem esforço para existir, raramente são valorizados ou desenvolvidos conscientemente. Identificar seus pontos de facilidade é tão importante quanto trabalhar os pontos de tensão.`, margin, y, 170);
  y += 6;
  const harmAspects = chart.aspects.filter(a => a.type === 'trine' || a.type === 'sextile').slice(0, 4);
  for (const asp of harmAspects) {
    y = checkPage(doc, y);
    const interp = getAspectInterpretation(asp.planet1, asp.planet2, asp.type) || '';
    if (interp) {
      y = addSubTitle(doc, `${PLANET_NAMES[asp.planet1] || asp.planet1} ${asp.type === 'trine' ? '△ Trígono' : '✶ Sextil'} ${PLANET_NAMES[asp.planet2] || asp.planet2}`, y, margin);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
      y = wrapText(doc, interp, margin, y, 170); y += 6;
    }
  }
  if (harmAspects.length === 0) {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Seu mapa tem uma energia mais concentrada em aspectos de tensão — o que frequentemente indica uma psique muito ativa e em constante movimento. O potencial está nos conjunções e na intensidade dos planetas dominantes.`, margin, y, 170);
  }

  // P16-P19: 4 Arquétipos dominantes
  const archetypes = [
    { name: `O Herói — ${SIGN_NAMES[sunSign]}`, planet: 'Sol', sign: sunSign, desc: `O arquétipo do Herói se manifesta através do seu Sol em ${SIGN_NAMES[sunSign]}. O Herói não é o que não tem medo — é o que age apesar do medo. Em você, essa força se expressa como ${SIGN_NAMES[sunSign] === 'Leão' ? 'criatividade e liderança carismática' : SIGN_NAMES[sunSign] === 'Escorpião' ? 'transformação e poder psicológico' : SIGN_NAMES[sunSign] === 'Áries' ? 'pioneirismo e coragem de ação direta' : SIGN_NAMES[sunSign] === 'Capricórnio' ? 'disciplina e construção de legado' : 'a energia essencial do seu signo solar'}. O Herói em você precisa de uma missão que valha o esforço — sem propósito claro, a energia heroica se volta para dentro e se torna autocrítica ou estagnação.` },
    { name: `A Grande Mãe — ${SIGN_NAMES[moonSign]}`, planet: 'Lua', sign: moonSign, desc: `A Grande Mãe — ou o arquétipo do cuidado e da nutrição — se manifesta através da sua Lua em ${SIGN_NAMES[moonSign]}. Em você, cuidar significa ${SIGN_NAMES[moonSign] === 'Câncer' ? 'proteger, nutrir e criar um lar seguro' : SIGN_NAMES[moonSign] === 'Virgem' ? 'ser útil, preciso e servir com excelência' : SIGN_NAMES[moonSign] === 'Capricórnio' ? 'estruturar, prover e construir segurança material' : 'expressar cuidado na linguagem do seu signo lunar'}. O desafio desse arquétipo é cuidar sem se perder — manter a própria fonte enquanto doa energia.` },
    { name: `O Amante — ${SIGN_NAMES[venusSign]}`, planet: 'Vênus', sign: venusSign, desc: `O arquétipo do Amante governa tudo relacionado à beleza, ao prazer e à conexão. Com Vênus em ${SIGN_NAMES[venusSign]}, você vive esse arquétipo de forma ${SIGN_NAMES[venusSign] === 'Escorpião' ? 'intensa e transformadora — amor como iniciação' : SIGN_NAMES[venusSign] === 'Libra' ? 'estética e relacional — amor como harmonia e equidade' : SIGN_NAMES[venusSign] === 'Touro' ? 'sensual e leal — amor como segurança e prazer corporal' : 'autêntica ao estilo do seu signo venusiano'}. O Amante em você pede que você reconheça beleza no cotidiano — não apenas nos grandes momentos.` },
    { name: `O Sábio — ${SIGN_NAMES[mercSign]}`, planet: 'Mercúrio', sign: mercSign, desc: `O arquétipo do Sábio se manifesta através do seu Mercúrio em ${SIGN_NAMES[mercSign]}. A sabedoria não é acúmulo de informação — é a capacidade de discernir o que é essencial. Com Mercúrio em ${SIGN_NAMES[mercSign]}, você acessa sabedoria de forma ${SIGN_NAMES[mercSign] === 'Virgem' ? 'analítica e prática — sabedoria no detalhe' : SIGN_NAMES[mercSign] === 'Sagitário' ? 'filosófica e expansiva — sabedoria no quadro maior' : SIGN_NAMES[mercSign] === 'Escorpião' ? 'investigativa e profunda — sabedoria no que está oculto' : 'específica ao estilo do seu Mercúrio'}. O Sábio em você quer compartilhar o que aprendeu — ensinar é uma das formas mais completas de integrar conhecimento.` },
  ];

  for (const arch of archetypes) {
    doc.addPage(); y = 30;
    y = addSectionTitle(doc, `Arquétipo: ${arch.name}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, arch.desc, margin, y, 170); y += 8;
    y = addSubTitle(doc, 'Sombra deste Arquétipo', y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    const shadows: Record<string, string> = {
      'Sol': `A sombra do Herói é o Tirano — quando a força se volta para o controle. Em ${SIGN_NAMES[sunSign]}, isso pode se manifestar como ${SIGN_NAMES[sunSign] === 'Leão' ? 'arrogância e necessidade de dominar o palco' : SIGN_NAMES[sunSign] === 'Escorpião' ? 'manipulação e uso do poder para controlar' : SIGN_NAMES[sunSign] === 'Áries' ? 'impulsividade destrutiva e ego inflado' : 'a sombra específica deste signo solar'}.`,
      'Lua': `A sombra da Grande Mãe é a Mãe Devoradora — que cuida de forma sufocante. Em ${SIGN_NAMES[moonSign]}, isso pode se manifestar como ${SIGN_NAMES[moonSign] === 'Câncer' ? 'apego excessivo e dificuldade de soltar' : SIGN_NAMES[moonSign] === 'Leão' ? 'necessidade de ser o centro emocional de todos' : 'a sombra específica deste signo lunar'}.`,
      'Vênus': `A sombra do Amante é a Sedução Vazia — buscar prazer para evitar profundidade. Em ${SIGN_NAMES[venusSign]}, isso pode se manifestar como ${SIGN_NAMES[venusSign] === 'Libra' ? 'falsa harmonia e evitação de conflitos necessários' : SIGN_NAMES[venusSign] === 'Escorpião' ? 'possessividade e uso do amor como poder' : 'a sombra específica deste Vênus'}.`,
      'Mercúrio': `A sombra do Sábio é o Trickster — o que usa a mente para manipular ou para evitar sentir. Em ${SIGN_NAMES[mercSign]}, isso pode se manifestar como ${SIGN_NAMES[mercSign] === 'Gêmeos' ? 'superficialidade crônica e uso de palavras para fugir de emoções' : SIGN_NAMES[mercSign] === 'Virgem' ? 'análise como armadura emocional' : 'a sombra específica deste Mercúrio'}.`,
    };
    y = wrapText(doc, shadows[arch.planet] || `Cada arquétipo tem uma sombra — a versão não-integrada que age sem consciência.`, margin, y, 170);
    y += 6;
    y = addSubTitle(doc, 'Integrando este Arquétipo', y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Integrar um arquétipo significa reconhecê-lo, trabalhar com sua sombra, e utilizá-lo conscientemente como ferramenta, não como padrão automático. Pergunte-se: "onde estou vivendo a versão saudável desse arquétipo? Onde estou na sombra?" A resposta honesta a essas perguntas aponta o próximo passo prático.`, margin, y, 170);
  }

  // P20: Caminhos de Integração
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.integrationPaths, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Integração psicológica não é um destino — é um processo contínuo. O mapa natal não oferece um ponto de chegada; oferece um mapa do território interno, com seus recursos e desafios. Os caminhos a seguir são sugestões baseadas na configuração específica do seu mapa:`, margin, y, 170);
  y += 6;
  const integrationPaths = [
    { title: `Trabalhar com ${SIGN_NAMES[moonSign]}`, text: `Desenvolver consciência das necessidades emocionais da Lua e comunicá-las claramente, em vez de esperar que sejam adivinhadas.` },
    { title: `Integrar Quíron na Casa ${chironHouse}`, text: `Transformar a ferida da Casa ${chironHouse} em sabedoria prática: o que você aprendeu nessa área pode ser oferecido a outros de forma genuína.` },
    { title: `Mover-se em direção ao Nodo Norte`, text: `Identificar uma ação concreta por semana que desenvolve as qualidades de ${SIGN_NAMES[nnSign]} e os temas da Casa ${nnHouse}.` },
    { title: 'Trabalhar a Sombra', text: `Observar o que mais te irrita nos outros — provavelmente está chamando sua atenção para algo não-integrado em você mesmo.` },
  ];
  for (const ip of integrationPaths) {
    y = addSubTitle(doc, ip.title, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, ip.text, margin, y, 170); y += 6;
    y = checkPage(doc, y);
  }

  // P21: Práticas Recomendadas
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.recommendedPractices, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const practices = [
    { title: 'Diário Astrológico', text: `Registre diariamente uma observação sobre como as energias do seu mapa estão se manifestando. Não precisa ser longo — uma frase basta. Ao longo do tempo, padrões ficam visíveis.` },
    { title: 'Meditação com os Planetas', text: `Escolha um planeta por semana e faça uma meditação curta (5-10 min) focando na sua energia. Para Saturno: contemple onde está construindo estrutura. Para Netuno: deixe imagens surgirem sem análise. Para Marte: conecte-se com seu desejo mais honesto.` },
    { title: 'Terapia Orientada ao Mapa', text: `Se possível, trabalhe com terapeuta familiarizado com astrologia psicológica. O mapa natal pode acelerar o processo terapêutico ao oferecer linguagem precisa para padrões que de outra forma levariam mais tempo para nomear.` },
    { title: 'Trabalho com Sonhos', text: `A Lua e a Casa 12 respondem ao trabalho com sonhos. Mantenha um caderno ao lado da cama. Ao acordar, registre as imagens antes de racionalizar. Com o tempo, os sonhos oferecem material direto do inconsciente.` },
    { title: 'Ciclos Lunares', text: `Acompanhe as lunações mensais: na Lua Nova, plante intenções relacionadas ao tema da casa onde ela ocorre. Na Lua Cheia, observe o que está sendo revelado ou completado. Este ritmo mensal cria uma prática de autoconhecimento enraizada no tempo.` },
  ];
  for (const pr of practices) {
    y = addSubTitle(doc, pr.title, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, pr.text, margin, y, 170); y += 6;
    y = checkPage(doc, y);
  }

  // P22: Conclusão
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.conclusion, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, pst.conclusionText(options.profileName), margin, y, 170);
  y += 10;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(11); doc.setTextColor(...COLORS.brandLight);
  doc.text(pst.quote, margin, y);

  addFooters(doc, options.profileName);
  return doc.output('blob');
}

// ============================================================
// T36 — CARREIRA (15 páginas)
// ============================================================

export function generateCareerPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const texts = getInterpretations(options.locale || 'pt');
  const labels = getReportLabels(options.locale || 'pt');
  const SIGN_NAMES = labels.signs;
  const PLANET_NAMES = labels.planets;
  const ct = getCareerTexts(options.locale || 'pt');

  const mcSign = getSignIndex(chart.houses.midheaven);
  const sunSign = getSignIndex(chart.positions.sun?.longitude || 0);
  const marsSign = getSignIndex(chart.positions.mars?.longitude || 0);
  const mercSign = getSignIndex(chart.positions.mercury?.longitude || 0);
  const satHouse = chart.planetHouses.saturn || 1;
  const satSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const jupHouse = chart.planetHouses.jupiter || 1;
  const jupSign = getSignIndex(chart.positions.jupiter?.longitude || 0);
  const h10Sign = getSignIndex(chart.houses.cusps[9]);
  const h6Sign = getSignIndex(chart.houses.cusps[5]);
  const h2Sign = getSignIndex(chart.houses.cusps[1]);
  const sunHouse = chart.planetHouses.sun || 1;
  const marsHouse = chart.planetHouses.mars || 1;
  const mercHouse = chart.planetHouses.mercury || 1;

  // P1: Capa
  renderCover(doc, texts.LABELS.careerTitle, ct.coverSubtitle, options, '♄');

  // P2: Visão Geral — MC
  doc.addPage(); let y = 30;
  y = addSectionTitle(doc, `${texts.LABELS.overview} — ${texts.LABELS.midheaven}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, ct.mcOverviewIntro, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `MC em ${SIGN_SYMBOLS[mcSign]} ${SIGN_NAMES[mcSign]}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const mcDescs = [
    'Seu MC em Áries pede uma carreira onde você pode liderar, pionear e agir de forma independente. Você se realiza profissionalmente quando está abrindo caminhos novos — não seguindo trilhas já estabelecidas. Ambientes muito hierárquicos ou lentos drenam sua energia. Você precisa de autonomia e projetos que exijam iniciativa e coragem.',
    'Seu MC em Touro indica vocação ligada à construção de valor — seja financeiro, estético ou tangível. Você tem instinto para criar produtos e experiências duradouras. Carreiras em finanças, artes, arquitetura, agronegócio ou qualquer campo que produza resultados concretos e mensuráveis se alinham com esse MC.',
    'Seu MC em Gêmeos pede versatilidade e comunicação. Você brilha em carreiras que envolvem escrita, ensino, jornalismo, publicidade, TI, mediação ou qualquer papel que exija pensar rápido e se comunicar com clareza. O risco é se dispersar em muitas direções sem aprofundar nenhuma.',
    'Seu MC em Câncer indica vocação ligada ao cuidado, à nutrição e à criação de ambientes seguros. Saúde, educação, serviço social, gastronomia, imobiliário ou qualquer carreira que cuide de pessoas ou de um "lar" — seja literal ou simbólico — se alinham com esse MC.',
    'Seu MC em Leão indica carreira que exige presença, liderança e criatividade. Você brilha em papéis de destaque — entretenimento, artes performáticas, gestão, política ou qualquer campo que coloque você em posição de inspirar outros. Você precisa de um palco.',
    'Seu MC em Virgem indica vocação ligada ao serviço, à saúde e à excelência técnica. Medicina, farmácia, nutrição, programação, contabilidade, análise de dados ou qualquer campo que valorize precisão, metodologia e utilidade concreta se alinham com esse MC.',
    'Seu MC em Libra indica vocação ligada à harmonia, à estética e à justiça. Direito, diplomacia, design, curadoria, consultoria ou qualquer campo que exija mediar, equilibrar e criar beleza se alinham com esse MC. Parcerias profissionais têm papel central em sua carreira.',
    'Seu MC em Escorpião indica vocação ligada à profundidade, à transformação e ao poder. Psicologia, pesquisa, medicina, finanças de alto risco, estratégia política, investigação ou qualquer campo que exija mergulhar no que outros evitam se alinham com esse MC.',
    'Seu MC em Sagitário indica vocação ligada à expansão, ao ensino e à visão. Educação superior, publicações, turismo, filosofia, direito internacional, espiritualidade ou qualquer carreira que inspire e expanda horizontes se alinham com esse MC.',
    'Seu MC em Capricórnio é um dos mais favoráveis para carreira de longo prazo. Você tem instinto para gestão, liderança executiva, política, engenharia ou qualquer campo que valorize competência, método e visão estratégica. O sucesso pode demorar a chegar, mas quando chega, é sólido.',
    'Seu MC em Aquário indica vocação ligada à inovação, à tecnologia e ao coletivo. TI, ciência, ativismo, empreendedorismo social, futurismo ou qualquer campo que rompa padrões e sirva à humanidade se alinham com esse MC. Você precisa de liberdade e originalidade para florir profissionalmente.',
    'Seu MC em Peixes indica vocação ligada à arte, à espiritualidade, à cura ou ao serviço compassivo. Música, cinema, psicologia transpessoal, saúde alternativa, trabalho humanitário ou qualquer carreira que conecte o ordinário ao transcendente se alinham com esse MC.',
  ];
  y = wrapText(doc, mcDescs[mcSign], margin, y, 170);

  // TRYOUT CUT — return after cover + MC overview (3 pages)
  const tryoutBlob4 = tryoutCut(doc, options, texts.LABELS.careerTitle, '29.90');
  if (tryoutBlob4) return tryoutBlob4;

  // P3: Casa 10
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, ct.h10Title(SIGN_NAMES[h10Sign]), y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, ct.h10Intro(SIGN_NAMES[h10Sign]), margin, y, 170);
  y += 6;
  const planetsIn10 = Object.entries(chart.planetHouses).filter(([_, h]) => h === 10).map(([p]) => p);
  if (planetsIn10.length > 0) {
    y = addSubTitle(doc, `Planetas na Casa 10: ${planetsIn10.map(p => PLANET_NAMES[p] || p).join(', ')}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    for (const p of planetsIn10) {
      const pName = PLANET_NAMES[p] || p;
      const pTexts: Record<string, string> = {
        sun: `Sol na Casa 10 é uma das posições mais favoráveis para carreira. Você tem vocação natural para liderança e visibilidade. Sua identidade está fortemente ligada ao trabalho — o que pode ser um dom (motivação intensa) ou um desafio (identidade frágil quando a carreira vai mal).`,
        moon: `Lua na Casa 10 indica carreira que envolve o público e onde as emoções têm papel — educação, cuidado, política ou qualquer área que trabalhe com as necessidades coletivas. Sua imagem pública pode ser mais variável que outros, sujeita a ciclos emocionais.`,
        mercury: `Mercúrio na Casa 10 favorece carreiras intelectuais e comunicativas. Você é reconhecido pela mente e pela habilidade de comunicar. Escrita, ensino, jornalismo e consultoria fluem naturalmente.`,
        venus: `Vênus na Casa 10 favorece carreiras ligadas à arte, beleza, relações públicas ou diplomacia. Você tem charme natural no ambiente profissional e tende a construir boa reputação com facilidade — quando é autêntico.`,
        mars: `Marte na Casa 10 indica carreira que exige iniciativa, competição e liderança direta. Você não se realiza em papéis passivos. Empreendedorismo, atletismo, gestão ou qualquer área que valorize ação decisiva.`,
        jupiter: `Júpiter na Casa 10 é excelente para carreira — indica expansão, oportunidades e reconhecimento ao longo do tempo. Você tende a crescer profissionalmente com consistência e pode atingir posições de destaque em sua área.`,
        saturn: `Saturno na Casa 10 é intenso mas altamente produtivo. Pode indicar carreira que começa devagar e ganha força com o tempo, ou herança de expectativas profissionais da família. O reconhecimento vem tarde, mas é duradouro.`,
      };
      y = wrapText(doc, pTexts[p] || `${pName} na Casa 10 qualifica sua presença profissional com as características desse planeta.`, margin, y, 170);
      y += 5;
    }
  } else {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, ct.h10NoPlanets(SIGN_NAMES[h10Sign]), margin, y, 170);
  }

  // P4: Casa 6
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `Casa 6 em ${SIGN_NAMES[h6Sign]} — Rotina e Ambiente de Trabalho`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Enquanto a Casa 10 fala do pico da carreira — o reconhecimento e o propósito —, a Casa 6 fala do dia a dia: como você trabalha, que tipo de ambiente te sustenta, a relação com colegas e subordinados, e a conexão entre trabalho e saúde. Você pode ter o propósito mais elevado no MC, mas se a rotina diária não for sustentável, o desempenho sofre.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Casa 6 em ${SIGN_NAMES[h6Sign]} — Seu Ambiente Ideal`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const h6Descs: Record<number, string> = { 0: 'Rotina que inclui movimento, projetos novos e autonomia. Trabalho repetitivo drena rapidamente.', 1: 'Ambiente estável, com ritmo constante e resultados tangíveis. Muda de método com dificuldade, mas é altamente confiável.', 2: 'Precisa de variedade nas tarefas e interação com pessoas. Monotonia cria ansiedade.', 3: 'Trabalha melhor em ambientes que pareçam "família" — cuidado mútuo e segurança emocional importam.', 4: 'Precisa de papel central e reconhecimento no ambiente de trabalho. Trabalha com entusiasmo quando o trabalho tem sentido criativo.', 5: 'Altamente produtivo em ambientes organizados, com processos claros e onde a competência é valorizada.', 6: 'Funciona melhor em ambientes harmoniosos, onde há colaboração e equidade. Conflitos internos drenam.', 7: 'Trabalha de forma intensa e focalizada. Ambientes superficiais desmotivam rapidamente.', 8: 'Precisa de liberdade para explorar e variedade de projetos. Regras excessivas sufocam.', 9: 'Produtivo com disciplina clara e metas de longo prazo. Reconhece o valor do trabalho árduo.', 10: 'Precisa de autonomia e inovação. Trabalho convencional e repetitivo é desgastante.', 11: 'Funciona melhor em ambientes criativos ou compassivos, onde há sensibilidade às necessidades humanas.' };
  y = wrapText(doc, h6Descs[h6Sign] || `Casa 6 em ${SIGN_NAMES[h6Sign]}: seu ambiente de trabalho ideal reflete as qualidades deste signo.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, 'Saúde e Trabalho — Uma Relação Direta', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A Casa 6 governa tanto a rotina de trabalho quanto a saúde física. Há uma relação direta entre esses dois domínios: quando o trabalho está alinhado com seus valores e ritmo naturais, a saúde tende a ser mais robusta. Quando há desalinhamento crônico — trabalho que drena, ambiente tóxico, tarefas que contradizem seus valores —, o corpo costuma ser o primeiro a avisar. Prestar atenção aos sinais físicos como feedback profissional é uma das práticas mais valiosas para quem tem consciência astrológica.`, margin, y, 170);

  // P5: Casa 2
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `Casa 2 em ${SIGN_NAMES[h2Sign]} — Dinheiro e Recursos`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A Casa 2 governa sua relação com dinheiro, recursos próprios e o que você considera valioso. Ela não apenas indica potencial de ganho — revela seu mindset financeiro: como você ganha, como guarda, como gasta e que crenças sobre dinheiro você carrega desde a infância.`, margin, y, 170);
  y += 6;
  y = addSubTitle(doc, `Casa 2 em ${SIGN_NAMES[h2Sign]} — Seu Padrão Financeiro`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const h2Descs: Record<number, string> = { 0: 'Você ganha dinheiro pela iniciativa e ação direta. Riscos calculados rendem mais que segurança passiva. Impulsividade financeira é o risco a vigiar.', 1: 'Você constrói patrimônio com paciência e consistência. Prefere segurança a grandes apostas. O risco é a teimosia em investimentos que já não servem.', 2: 'Múltiplas fontes de renda se alinham com sua natureza. Você pode ganhar dinheiro com informação, comunicação e versatilidade. Foco financeiro é o desafio.', 3: 'Você valoriza segurança financeira acima de tudo. Pode ser conservador demais em finanças, perdendo oportunidades por medo de perda.', 4: 'Você ganha melhor quando está fazendo algo que ama e que tem prestígio. Dinheiro flui quando há expressão criativa e reconhecimento.', 5: 'Você gerencia dinheiro com precisão e disciplina. O risco é ser tão econômico que não investe em prazer e qualidade de vida.', 6: 'Você tem instinto para parcerias financeiras e negócios colaborativos. Acordos e contratos podem ser fontes importantes de renda.', 7: 'Sua relação com dinheiro é intensa — tudo ou nada. Pode acumular muito ou perder muito. A consciência sobre padrões de poder em finanças é crucial.', 8: 'Você ganha melhor em contextos de expansão — viagens, educação, publicações ou qualquer coisa que amplie horizontes.', 9: 'Você constrói riqueza com disciplina de longo prazo. Pode ter uma relação austera com dinheiro — trabalho duro, pouco prazer imediato.', 10: 'Você pode ganhar dinheiro com inovação e tecnologia. Criptomoedas, startups ou projetos disruptivos podem ser áreas de oportunidade.', 11: 'Você pode ter dificuldade com limites financeiros claros. Aprender a dizer não é uma das habilidades financeiras mais importantes para você.' };
  y = wrapText(doc, h2Descs[h2Sign] || `Casa 2 em ${SIGN_NAMES[h2Sign]}: sua relação com recursos segue a qualidade deste signo.`, margin, y, 170);
  y += 6;
  const planetsIn2 = Object.entries(chart.planetHouses).filter(([_, h]) => h === 2).map(([p]) => p);
  if (planetsIn2.length > 0) {
    y = addSubTitle(doc, `Planetas na Casa 2: ${planetsIn2.map(p => PLANET_NAMES[p] || p).join(', ')}`, y, margin);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Planetas na Casa 2 qualificam e intensificam sua relação com recursos. Cada planeta traz sua energia para o tema financeiro e de valor próprio — tanto como recurso quanto como desafio a integrar.`, margin, y, 170);
  }

  // P6: Saturno
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `♄ Saturno na Casa ${satHouse} em ${SIGN_NAMES[satSign]} — Disciplina e Carreira Sólida`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Saturno é o planeta da carreira sólida — o que exige tempo, disciplina e método, mas produz resultados duradouros. A posição natal de Saturno revela onde você tem mais trabalho a fazer profissionalmente, e ao mesmo tempo onde pode construir a parte mais robusta da sua trajetória. Saturno recompensa quem não desiste.`, margin, y, 170);
  y += 6;
  const satHouseCareerText = SATURN_IN_HOUSE[satHouse - 1] || `Saturno na Casa ${satHouse} pede estrutura nessa área.`;
  y = wrapText(doc, satHouseCareerText, margin, y, 170); y += 5;
  const satSignText = SATURN_IN_SIGN[satSign] || '';
  if (satSignText) { y = wrapText(doc, satSignText, margin, y, 170); y += 5; }
  y = addSubTitle(doc, 'Saturno e o Retorno de Saturno', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Ao redor dos 28-30 anos e novamente aos 58-60, Saturno retorna ao ponto natal — o chamado "Retorno de Saturno". Este é um dos trânsitos mais importantes para a carreira: ele consolida o que foi construído com integridade e revela o que foi construído sobre areia. O primeiro Retorno marca a transição para a maturidade adulta real; o segundo, a consolidação do legado. Se você está próximo desses períodos, este é um momento de avaliação profissional profunda.`, margin, y, 170);

  // P7: Júpiter
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `♃ Júpiter na Casa ${jupHouse} em ${SIGN_NAMES[jupSign]} — Expansão e Oportunidades`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Júpiter natal indica onde a "sorte" — na verdade, sabedoria acumulada e abertura para crescer — flui mais facilmente. Na carreira, Júpiter marca os setores onde oportunidades aparecem de forma mais natural e onde o crescimento tem menos resistência. Aproveitar o Júpiter natal é questão de reconhecer que você já tem vantagem nessa área e agir com confiança a partir daí.`, margin, y, 170);
  y += 6;
  const jupHouseCareerText = JUPITER_IN_HOUSE[jupHouse - 1] || `Júpiter na Casa ${jupHouse} traz oportunidades naturais nessa área.`;
  y = wrapText(doc, jupHouseCareerText, margin, y, 170); y += 5;
  const jupSignText = JUPITER_IN_SIGN[jupSign] || '';
  if (jupSignText) { y = wrapText(doc, jupSignText, margin, y, 170); y += 5; }
  y = addSubTitle(doc, 'Ciclo de Júpiter na Carreira', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Júpiter orbita o Sol em aproximadamente 12 anos. Cada vez que ele retorna ao signo natal — por volta de cada 12 anos —, há um período de expansão e oportunidade particular. Quando Júpiter transita a Casa 10, a carreira se expande visivelmente. Quando transita a Casa 2, os recursos crescem. Acompanhar os ciclos jupiterianos é uma das ferramentas mais práticas da astrologia de carreira.`, margin, y, 170);

  // P8: Sol
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `☉ Sol em ${SIGN_NAMES[sunSign]} na Casa ${sunHouse} — Onde Você Brilha`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `O Sol no mapa de carreira indica onde e como você brilha profissionalmente — o tipo de papel que traz mais vitalidade, o ambiente onde sua energia flui com naturalidade. Trabalhar alinhado com o Sol não significa fazer apenas o que é fácil — significa fazer o que é genuinamente seu.`, margin, y, 170);
  y += 6;
  const solCareerDescs: Record<number, string> = { 0: 'Você brilha em papéis de iniciativa e liderança direta. Projetos que exigem coragem e novidade são seu combustível.', 1: 'Você brilha em construção gradual e qualidade tangível. Reconhecimento vem pela confiabilidade e excelência.', 2: 'Você brilha em comunicação, versátilidade e conexões. Múltiplos projetos simultâneos podem ser sua vantagem.', 3: 'Você brilha em papéis de cuidado e criação de ambientes seguros. Reconhecimento vem pela sensibilidade e atenção.', 4: 'Você brilha em papéis de visibilidade e liderança carismática. Reconhecimento é combustível — não superficialidade, mas necessidade real.', 5: 'Você brilha pela excelência técnica e atenção ao detalhe. Confiança vem da competência verificada, não do talento autoproclamado.', 6: 'Você brilha em papéis diplomáticos e colaborativos. Parcerias estratégicas potencializam seus resultados.', 7: 'Você brilha em papéis que exigem profundidade, estratégia e transformação. Superficialidade não te motiva.', 8: 'Você brilha em expansão — ensinando, inspirando, publicando. Sua amplitude é seu diferencial.', 9: 'Você brilha pela disciplina e pelo legado. Projetos de longo prazo trazem mais satisfação que vitórias rápidas.', 10: 'Você brilha pela originalidade e inovação. O diferencial competitivo é o que ainda não foi feito.', 11: 'Você brilha em papéis criativos, compassivos ou espiritualmente orientados. A motivação precisa ir além do lucro para durar.' };
  y = wrapText(doc, solCareerDescs[sunSign] || `Sol em ${SIGN_NAMES[sunSign]}: você brilha quando pode expressar as qualidades essenciais deste signo.`, margin, y, 170);
  y += 6;
  y = wrapText(doc, `Sol na Casa ${sunHouse} indica que a energia vital e criativa se manifesta com mais força nos temas dessa casa. Na carreira, isso significa que projetos e papéis relacionados à Casa ${sunHouse} tendem a ser mais energizantes — você não apenas produz mais, mas produz com satisfação genuína.`, margin, y, 170);

  // P9: Marte
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `♂ Marte em ${SIGN_NAMES[marsSign]} na Casa ${marsHouse} — Como Você Lidera e Compete`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Marte determina como você compete, como age sob pressão, que tipo de desafio te motiva e como lida com conflitos profissionais. No trabalho, Marte é a energia que move projetos, que enfrenta obstáculos e que define seu estilo de liderança — ou de resistência à autoridade.`, margin, y, 170);
  y += 6;
  const marsCareerDescs: Record<number, string> = { 0: 'Você age com velocidade e impulsividade. Líder natural em situações de crise, mas pode criar conflitos desnecessários em ambientes mais calmos.', 1: 'Você age com persistência inabalável. Uma vez comprometido, dificilmente desiste. O risco é a teimosia profissional — resistir a pivôs necessários.', 2: 'Você age com versatilidade e argumentação. Excelente em negociações, mas pode dispersar esforço.', 3: 'Você age de forma defensiva e protetora. Melhor sob pressão quando está protegendo algo ou alguém que importa.', 4: 'Você age com confiança e drama. Precisa de causa que valha o esforço — trabalho sem sentido drena rápido.', 5: 'Você age com precisão e método. Não desperdiça energia — cada ação é calculada para eficiência máxima.', 6: 'Você age diplomaticamente — mede consequências antes de agir. Pode ser lento na tomada de decisão conflituosa.', 7: 'Você age com intensidade estratégica. Não confronta diretamente se pode encontrar ponto de alavancagem mais eficiente.', 8: 'Você age com entusiasmo e otimismo. Excelente para projetos de expansão, péssimo para tarefas de manutenção.', 9: 'Você age com disciplina e objetividade. Pode parecer frio, mas é altamente eficiente.', 10: 'Você age de forma imprevisível e inovadora. Excelente para rupturas e inovações, desafiador para rotinas estáveis.', 11: 'Você age com sensibilidade ao contexto. Eficiente em ambientes favoráveis, vulnerável em ambientes hostis.' };
  y = wrapText(doc, marsCareerDescs[marsSign] || `Marte em ${SIGN_NAMES[marsSign]}: sua força competitiva e liderança têm a qualidade deste signo.`, margin, y, 170);

  // P10: Mercúrio
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `☿ Mercúrio em ${SIGN_NAMES[mercSign]} na Casa ${mercHouse} — Habilidades Intelectuais`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Mercúrio profissional é o planeta das habilidades mentais e comunicativas — como você aprende, como se comunica, que tipo de informação processa com facilidade e onde está seu diferencial intelectual. Em muitas carreiras, é a posição de Mercúrio que define o nicho de especialização.`, margin, y, 170);
  y += 6;
  const mercCareerDescs: Record<number, string> = { 0: 'Mente rápida e tomada de decisão ágil são seus diferencias. Vendas, gestão de crises e empreendedorismo se beneficiam dessa velocidade.', 1: 'Especialização profunda e memória confiável são seus diferenciais. Você leva tempo para aprender, mas retém e aplica com precisão.', 2: 'Versatilidade intelectual e comunicação fluida são seus diferenciais. Jornalismo, marketing, educação e TI se beneficiam dessa agilidade.', 3: 'Inteligência emocional e memória associativa são seus diferenciais. Aconselhamento, cuidado e gestão de pessoas se beneficiam dessa sensibilidade.', 4: 'Comunicação inspiradora e narrativa cativante são seus diferenciais. Apresentações, ensino e liderança se beneficiam dessa expressividade.', 5: 'Análise detalhada e precisão técnica são seus diferenciais. Pesquisa, medicina, programação e auditoria se beneficiam dessa minúcia.', 6: 'Equilíbrio, diplomacia e síntese são seus diferenciais. Mediação, design e consultoria se beneficiam dessa habilidade.', 7: 'Investigação profunda e pensamento estratégico são seus diferenciais. Psicologia, pesquisa e intelligence se beneficiam dessa penetração.', 8: 'Visão sistêmica e comunicação filosófica são seus diferenciais. Educação, publicações e estratégia se beneficiam dessa amplitude.', 9: 'Objetividade e eficiência cognitiva são seus diferenciais. Gestão, finanças e engenharia se beneficiam dessa pragmatismo.', 10: 'Originalidade e inovação conceitual são seus diferenciais. Tecnologia, ciência e design disruptivo se beneficiam dessa vanguarda.', 11: 'Intuição e síntese imaginativa são seus diferenciais. Artes, terapia e espiritualidade se beneficiam dessa sensibilidade.' };
  y = wrapText(doc, mercCareerDescs[mercSign] || `Mercúrio em ${SIGN_NAMES[mercSign]}: suas habilidades intelectuais seguem a natureza deste signo.`, margin, y, 170);

  // P11: Talentos naturais
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.unexploredPotentials, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Trígonos e sextis no mapa natal indicam fluxo natural — habilidades que vêm sem esforço aparente. Esses pontos são frequentemente subestimados justamente por serem fáceis: como não exigem luta para existir, raramente recebem o mesmo investimento de desenvolvimento que os pontos difíceis. Identificar e deliberadamente desenvolver seus talentos naturais pode ser o caminho de menor resistência para o sucesso profissional.`, margin, y, 170);
  y += 6;
  const careerTrines = chart.aspects.filter(a => (a.type === 'trine' || a.type === 'sextile')).slice(0, 4);
  if (careerTrines.length > 0) {
    for (const asp of careerTrines) {
      y = checkPage(doc, y);
      const interp = getAspectInterpretation(asp.planet1, asp.planet2, asp.type) || '';
      if (interp) {
        y = addSubTitle(doc, `${PLANET_NAMES[asp.planet1] || asp.planet1} ${asp.type === 'trine' ? '△' : '✶'} ${PLANET_NAMES[asp.planet2] || asp.planet2}`, y, margin);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
        y = wrapText(doc, interp, margin, y, 170); y += 5;
      }
    }
  } else {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Seus talentos naturais estão principalmente nas conjunções e nas qualidades dos planetas dominantes do seu mapa. Uma análise mais profunda dos planetas em seus domicílios ou exaltações revela onde sua energia flui com maior facilidade.`, margin, y, 170);
  }

  // P12: Desafios profissionais
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.repetitivePatterns, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Aspectos tensos no mapa não indicam fracasso profissional — indicam as áreas que precisam de mais trabalho consciente. Muitas vezes, os maiores desafios do mapa são também os maiores pontos de aprendizado. Profissionais que trabalham conscientemente suas tensões astrológicas frequentemente desenvolvem habilidades excepcionais precisamente nas áreas onde mais lutaram.`, margin, y, 170);
  y += 6;
  const careerSquares = chart.aspects.filter(a => a.type === 'square' || a.type === 'opposition').slice(0, 3);
  if (careerSquares.length > 0) {
    for (const asp of careerSquares) {
      y = checkPage(doc, y);
      const interp = getAspectInterpretation(asp.planet1, asp.planet2, asp.type) || '';
      if (interp) {
        y = addSubTitle(doc, `${PLANET_NAMES[asp.planet1] || asp.planet1} ${asp.type === 'square' ? '□' : '☍'} ${PLANET_NAMES[asp.planet2] || asp.planet2}`, y, margin);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
        y = wrapText(doc, interp, margin, y, 170); y += 5;
      }
    }
  }

  // P13: Timing — Saturno e Júpiter
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'Timing de Mudanças — Ciclos de Saturno e Júpiter', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A astrologia de carreira é poderosa não apenas para entender aptidões, mas para identificar os momentos certos de mudança. Saturno (ciclo de ~29 anos) e Júpiter (ciclo de ~12 anos) são os grandes marcadores de tempo profissional. Entender onde você está em cada ciclo ajuda a diferenciar "hora de construir" de "hora de expandir" de "hora de consolidar".`, margin, y, 170);
  y += 6;
  const saturnCyclePhases = ['Saturno em trânsito pela Casa 1-3: identidade profissional em reconstrução. Hora de reavaliar quem você quer ser profissionalmente.', 'Saturno em trânsito pela Casa 4-6: construção das fundações. Trabalho duro sem visibilidade imediata — mas essencial.', 'Saturno em trânsito pela Casa 7-9: parcerias e expansão testadas. Acordos são examinados; o que não tem substância se dissolve.', 'Saturno em trânsito pela Casa 10-12: colheita (Casa 10) e preparação para o próximo ciclo (12). Reconhecimento ou crise de identidade.'];
  y = addSubTitle(doc, 'Fases do Ciclo de Saturno na Carreira', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  for (const phase of saturnCyclePhases) { y = wrapText(doc, `• ${phase}`, margin, y, 168); y += 4; }
  y += 4;
  y = addSubTitle(doc, 'Fases do Ciclo de Júpiter na Carreira', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Júpiter leva ~12 anos para completar o ciclo. Quando transita sua Casa 10, há expansão de carreira visível. Quando transita sua Casa 2, crescimento financeiro. Quando transita sua Casa 6, oportunidades no trabalho cotidiano. Cada trânsito jupiteriano dura cerca de 1 ano — essas são as janelas douradas para agir com ousadia nas respectivas áreas.`, margin, y, 170);

  // P14: Profissões sugeridas
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, 'Profissões Sugeridas por Signo e Casa', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `As sugestões abaixo são baseadas na combinação do seu MC, Sol, Saturno e Júpiter. São direções, não prescrições — o mapa indica afinidades e potenciais, mas a escolha final é sempre sua, considerando também formação, mercado e valores pessoais.`, margin, y, 170);
  y += 6;
  const profBySign: Record<number, string[]> = {
    0: ['Empreendedorismo', 'Esportes de competição', 'Forças armadas/segurança', 'Engenharia civil', 'Gestão de projetos'],
    1: ['Finanças e investimentos', 'Gastronomia e hotelaria', 'Arquitetura e design de interiores', 'Agronegócio', 'Arte e artesanato'],
    2: ['Jornalismo e comunicação', 'Marketing digital', 'TI e desenvolvimento', 'Ensino e formação', 'Consultoria'],
    3: ['Psicologia e terapia', 'Nutrição e saúde', 'Trabalho social', 'Imobiliário', 'Educação infantil'],
    4: ['Artes cênicas e entretenimento', 'Gestão e liderança executiva', 'Publicidade e criação', 'Eventos', 'Política'],
    5: ['Medicina e ciências da saúde', 'Programação e análise de dados', 'Contabilidade e auditoria', 'Pesquisa científica', 'Farmácia'],
    6: ['Direito e mediação', 'Design gráfico e UX', 'Diplomacia e relações internacionais', 'Recursos humanos', 'Curadoria e artes'],
    7: ['Psicologia e psicanálise', 'Medicina (especialmente cirurgia)', 'Finanças de alto risco', 'Investigação e inteligência', 'Estratégia corporativa'],
    8: ['Educação superior e pesquisa', 'Publicação e editorial', 'Turismo e hospitalidade', 'Filosofia e teologia', 'Direito internacional'],
    9: ['Gestão executiva e política', 'Engenharia e arquitetura', 'Direito corporativo', 'Finanças estratégicas', 'Administração pública'],
    10: ['Tecnologia e inovação', 'Startups e empreendedorismo disruptivo', 'Ciência e pesquisa de ponta', 'Ativismo e ONGs', 'Design de futuros'],
    11: ['Artes e música', 'Saúde holística e terapias', 'Trabalho humanitário', 'Cinema e fotografia', 'Psicologia transpessoal'],
  };
  const suggestions = profBySign[mcSign] || profBySign[sunSign] || [];
  y = addSubTitle(doc, `Baseado no seu MC em ${SIGN_NAMES[mcSign]}`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  for (const s of suggestions) { y = wrapText(doc, `• ${s}`, margin, y, 168); y += 4; }
  y += 4;
  y = wrapText(doc, `Essas sugestões são pontos de partida para reflexão. Combine-as com o que você naturalmente ama fazer, o que o mercado precisa, e o que gera renda suficiente. A interseção dessas três esferas é o terreno mais fértil para uma carreira sustentável e significativa.`, margin, y, 170);

  // P15: Conclusão
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, texts.LABELS.conclusion, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, ct.conclusionText(options.profileName, SIGN_NAMES[mcSign], satHouse, jupHouse, SIGN_NAMES[sunSign], SIGN_NAMES[marsSign], SIGN_NAMES[mercSign]), margin, y, 170);
  y += 10;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(11); doc.setTextColor(...COLORS.brandLight);
  doc.text(ct.quote, margin, y);

  addFooters(doc, options.profileName);
  return doc.output('blob');
}

// ============================================================

// ============================================================
// T37 — SETE PECADOS (15 páginas)
// ============================================================

function getSinText(sin: string, signIdx: number): string {
  const signName = SIGN_NAMES[signIdx];
  const texts: Record<string, string[]> = {
    orgulho: [
      'Seu orgulho se manifesta como necessidade de ser o primeiro e o melhor — quando não lidera, sente que não existe. A competição é seu combustível, mas a derrota pode ser devastadora para o ego.',
      'Seu orgulho se manifesta como teimosia inabalável — quando acha que está certo, nenhuma força no universo te move. Mudar de ideia parece fraqueza; persistir parece virtude.',
      'Seu orgulho se manifesta como superioridade intelectual — "eu já sabia disso" é sua frase favorita. Ser o mais informado na sala é uma necessidade disfarçada de curiosidade.',
      'Seu orgulho se manifesta como controle emocional ostentado — "ninguém me faz chorar" (mesmo quando deveria). Mostrar vulnerabilidade parece perigo.',
      'Seu orgulho se manifesta como necessidade de aplausos — sem reconhecimento, a motivação simplesmente desaparece. Você não age para si mesmo; age para a plateia.',
      'Seu orgulho se manifesta como perfeccionismo paralisante — se não pode fazer perfeito, prefere não fazer. E critica os outros pelo que não tolera em si mesmo.',
      'Seu orgulho se manifesta como falsa modéstia — diz que "tanto faz" mas por dentro está medindo quem ganhou. A balança interna nunca para.',
      'Seu orgulho se manifesta como poder silencioso — sabe algo sobre todos e guarda como moeda de troca. Informação é controle; controle é orgulho.',
      'Seu orgulho se manifesta como certeza moral — sua verdade é A Verdade e quem discorda "ainda não entendeu". A bússola interna não aceita calibração externa.',
      'Seu orgulho se manifesta como ambição sem fim — se não está subindo, sente que está falhando. O pódio nunca satisfaz porque sempre há um pódio mais alto.',
      'Seu orgulho se manifesta como diferença intelectual — "sou incompreendido" é mais confortável que pertencer. A excentricidade vira escudo.',
      'Seu orgulho se manifesta como superioridade espiritual — "já transcendi isso" (mas o ego continua bem vivo, só mais sofisticado).',
    ],
    gula: [
      'Sua gula é por adrenalina e novidade — devora experiências sem mastigar. Já está pensando na próxima antes de terminar a atual.',
      'Sua gula é literal e sensorial — comida, conforto, compras, prazer corporal em excesso. O corpo é o templo e a oferenda ao mesmo tempo.',
      'Sua gula é por informação — consome conteúdo compulsivamente sem digerir. Mais abas abertas, mais podcasts, mais cursos iniciados.',
      'Sua gula é emocional — busca conforto afetivo como se estivesse sempre faminto. Precisar de reassurance constante é a fome que não satura.',
      'Sua gula é por atenção — precisa de "mais" amor, mais aplausos, mais drama. A plateia nunca é grande o suficiente.',
      'Sua gula é por produtividade — se não está fazendo algo, sente culpa. Descansar parece desperdício; a lista nunca termina.',
      'Sua gula é por aprovação — consome validação alheia como se a autoestima dependesse inteiramente do exterior.',
      'Sua gula é por intensidade — se não está vivendo no limite emocional, parece que não está realmente vivendo.',
      'Sua gula é por experiências — mais viagens, mais cursos, mais livros, mais países. A expansão nunca é suficiente.',
      'Sua gula é por conquistas — mais diplomas, mais títulos, mais reconhecimentos. O currículo cresce; a satisfação não acompanha.',
      'Sua gula é por novidade intelectual — descarta ideias antes de implementá-las e já busca a próxima teoria revolucionária.',
      'Sua gula é por fusão — se perde no outro, na arte, na espiritualidade, como fuga de si mesmo.',
    ],
    luxuria: [
      'Sua luxúria é impaciente — quer tudo agora, sem esperar que o desejo amadureça. A conquista importa mais que a relação.',
      'Sua luxúria é possessiva — "o que é meu é meu" se aplica irresistivelmente a pessoas também.',
      'Sua luxúria é mental — fantasia mais do que vive; a ideia excita mais que a realidade. A antecipação supera o encontro.',
      'Sua luxúria é emocional — confunde necessidade com desejo; se apega antes de sentir. O conforto é a sedução mais forte.',
      'Sua luxúria é performática — precisa que o desejo seja visto, admirado, talvez invejado.',
      'Sua luxúria é seletiva demais — tantos critérios que o prazer fica bloqueado pela análise. O corpo quer; a mente indefere.',
      'Sua luxúria é relacional — não consegue desejar sozinho; precisa do espelho do outro para o desejo se acender.',
      'Sua luxúria é obsessiva — quando deseja, consome a outra pessoa com uma intensidade que pode assustar.',
      'Sua luxúria é aventureira — precisa de novidade constante para manter a chama. A rotina apaga o desejo.',
      'Sua luxúria é contida — se permite desejar tão pouco que o corpo esquece que tem direito ao prazer.',
      'Sua luxúria é cerebral — precisa de conexão mental profunda antes de qualquer coisa física.',
      'Sua luxúria é transcendente — busca fusão espiritual e pode se decepcionar com o meramente humano e terreno.',
    ],
    ira: [
      'Sua ira é explosiva e instantânea — incendeia tudo e esquece 10 minutos depois. Deixa destroços sem perceber.',
      'Sua ira é lenta mas destrutiva — represa por meses e quando estoura, é terremoto que destrói o que levou anos a construir.',
      'Sua ira é verbal — corta com palavras afiadas e depois finge que era "só brincadeira" ou "só sendo honesto".',
      'Sua ira é passiva-agressiva — faz silêncio, se retira, pune com ausência. A raiva nunca sai diretamente.',
      'Sua ira é dramática — exige que o mundo inteiro saiba que foi ofendido. O teatro da indignação é parte do processo.',
      'Sua ira é fria e cortante — mantém listas mentais de erros alheios que nunca expira. O perdão tem condições.',
      'Sua ira é indireta — sorri por fora enquanto por dentro calcula a forma mais elegante de responder à ofensa.',
      'Sua ira é nuclear — quando traído, não apenas se afasta; destrói pontes e salga a terra. Não há meia-medida.',
      'Sua ira é moral — "como alguém pode ser tão errado?" é combustível renovável e infinito.',
      'Sua ira é de autoridade — raiva fria e calculada contra quem não respeita hierarquia, competência ou mérito.',
      'Sua ira é de princípio — se inflama contra injustiça sistêmica, mesmo quando não é pessoalmente afetado.',
      'Sua ira se dissolve em mágoa — transforma raiva em dor silenciosa e depois em vitimismo que protege da vulnerabilidade.',
    ],
    avareza: [
      'Sua avareza é com tempo — não aceita desperdiçar um segundo em algo que não produza resultado imediato.',
      'Sua avareza é clássica — com dinheiro, com posses, com o que é seu por mérito. Compartilhar dói fisicamente.',
      'Sua avareza é com atenção — distribui presença entre tantas pessoas que ninguém tem você de verdade.',
      'Sua avareza é emocional — dá pouco de si por medo de que levem demais e não sobre nada.',
      'Sua avareza é com o palco — não divide os holofotes sem custo emocional.',
      'Sua avareza é com conhecimento — guarda informação como vantagem competitiva. Compartilhar seria perder poder.',
      'Sua avareza é de energia — protege tanto o equilíbrio que pode se tornar egoísmo disfarçado de autocuidado.',
      'Sua avareza é de poder — retém controle porque soltar significa vulnerabilidade real.',
      'Sua avareza é com liberdade — retém tanto a própria independência que não permite intimidade real.',
      'Sua avareza é com reconhecimento — quem trabalhou merece; quem não trabalhou não merece nada. Sem exceções.',
      'Sua avareza é com originalidade — se alguém copia sua ideia ou segue seu caminho, sente invasão.',
      'Sua avareza é invertida — dá tanto que depois cobra emocionalmente: "eu dei tudo e você..." nunca se resolve.',
    ],
    inveja: [
      'Sua inveja é competitiva — "por que ele conseguiu antes de mim?" queima por dentro mesmo quando você sorri.',
      'Sua inveja é material — olha o que o outro tem e sente que deveria ser seu. Não por maldade — por crença de escassez.',
      'Sua inveja é intelectual — ressente quem é mais articulado, tem mais acesso ou mais plataforma.',
      'Sua inveja é familiar — compara sua estrutura emocional com famílias que parecem mais saudáveis.',
      'Sua inveja é de brilho — ressente quem recebe atenção sem aparentemente se esforçar tanto quanto você.',
      'Sua inveja é de competência — se corrói internamente quando alguém faz melhor o que você considera seu território.',
      'Sua inveja é relacional — ressente casais felizes, amizades próximas, grupos harmoniosos.',
      'Sua inveja é de poder — ressente quem tem influência que sente que deveria ser sua por direito.',
      'Sua inveja é existencial — ressente quem parece ter encontrado "o sentido" antes de você.',
      'Sua inveja é de status — mede constantemente a distância entre você e quem está acima na hierarquia.',
      'Sua inveja é de pertencimento — ressente grupos que se aceitam naturalmente sem esforço.',
      'Sua inveja é espiritual — ressente quem parece ter paz interior que você busca e não alcança.',
    ],
    preguica: [
      'Sua preguiça é de excesso — tanto entusiasmo por novos projetos que nenhum é concluído. A ideia satisfaz mais que a execução.',
      'Sua preguiça é de conforto — quando a vida está boa, por que mudar? O status quo é o inimigo do crescimento.',
      'Sua preguiça é de dispersão — faz mil coisas de uma vez e nenhuma com a profundidade que merecia.',
      'Sua preguiça é emocional — evita trabalhar questões internas se ocupando de cuidar dos outros o tempo todo.',
      'Sua preguiça é de drama — espera que a vida seja emocionante sem esforço próprio. Que o universo entregue.',
      'Sua preguiça é de permissão — não começa porque nunca vai ser bom o suficiente. A perfeição bloqueia o início.',
      'Sua preguiça é de decisão — procrastina escolhas esperando sinal claro do universo. O sinal nunca é suficientemente claro.',
      'Sua preguiça é de transparência — prefere não se expor a fazer o trabalho de se abrir para alguém.',
      'Sua preguiça é de aterrissar — planeja o futuro infinitamente sem agir no presente que ainda existe.',
      'Sua preguiça é de descanso — trabalha tanto que nunca para para viver. A preguiça de viver é a mais custosa.',
      'Sua preguiça é de compromisso — mantém tudo em aberto para não perder opções. A liberdade vira inação.',
      'Sua preguiça é de materializar — sonha, visualiza, medita, manifesta... mas a ação concreta é adiada para amanhã.',
    ],
  };
  return (texts[sin] || [])[signIdx] || `Seu ${sin} em ${signName} se manifesta de forma única — a integração começa com reconhecê-lo sem julgamento.`;
}

function getSinIntegration(sin: string, signIdx: number): string {
  const integrations: Record<string, string[]> = {
    orgulho: [
      'Integrar o orgulho ariano significa transformar a necessidade de ser primeiro em motivação genuína — agir para a conquista, não para superar o outro. O líder maduro celebra o sucesso da equipe sem sentir que isso diminui o próprio.',
      'Integrar o orgulho taurino significa distinguir persistência saudável de teimosia improdutiva. A habilidade de mudar de ideia quando surgem novas informações não é fraqueza — é inteligência adaptativa.',
      'Integrar o orgulho geminiano significa usar o conhecimento para conectar, não para dominar conversas. Deixar o outro terminar o raciocínio — mesmo quando você já sabe aonde vai — é uma das formas mais elegantes de respeito.',
      'Integrar o orgulho canceriano significa aprender que vulnerabilidade não destrói vínculos — geralmente os aprofunda. Mostrar que foi afetado é um ato de confiança, não de fraqueza.',
      'Integrar o orgulho leonino significa desenvolver autoestima interna que não dependa de aplausos externos. Quando você se admira genuinamente, a ausência de reconhecimento dói menos — e atrai mais.',
      'Integrar o orgulho virginiano significa aplicar os mesmos padrões elevados a si mesmo com compaixão, não com punição. Excelência não requer crueldade interna.',
      'Integrar o orgulho libriano significa ser honesto sobre o que realmente quer, mesmo quando isso quebra a harmonia temporariamente. A paz falsa custa mais do que o conflito verdadeiro.',
      'Integrar o orgulho escorpiano significa usar o conhecimento que acumula para empoderar, não para controlar. O verdadeiro poder não precisa de segredos como munição.',
      'Integrar o orgulho sagitariano significa manter a certeza de valores sem fechar a mente às perspectivas do outro. Fé real sobrevive ao questionamento.',
      'Integrar o orgulho capricorniano significa celebrar conquistas sem precisar imediatamente escalar para a próxima. Descansar no sucesso não é estagnação — é maturidade.',
      'Integrar o orgulho aquariano significa contribuir para grupos sem precisar ser o mais original ou o mais incompreendido. Pertencer não diminui a singularidade.',
      'Integrar o orgulho pisciano significa manter humildade espiritual genuína — reconhecer que o crescimento é processo, não destino, e que ninguém "transcende" de uma vez.',
    ],
    gula: ['Canalize o apetite por novidade em projetos que sustentam atenção além do entusiasmo inicial. Termine antes de começar.', 'Desenvolva a habilidade de saborear — comer, comprar, viver — com atenção plena. Um prazer por vez, completamente.', 'Pratique a digestão: para cada conteúdo consumido, produza algo — uma nota, uma ideia, uma conversa. Processe antes de consumir mais.', 'Aprenda a distinguir fome emocional real de hábito. Antes de buscar conforto externo, pergunte: "o que estou sentindo de fato?"', 'Construa autoestima interna que não dependa de validação constante. Um elogio de si mesmo que você acredita vale mais que dez de fora.', 'Agende descanso como tarefa obrigatória — não como recompensa por produtividade. O recarregamento é parte do trabalho.', 'Pratique a aprovação interna diária: uma coisa que você fez bem hoje, reconhecida por você mesmo.', 'Cultive intensidade em áreas específicas em vez de buscar pico emocional constante. Profundidade localizada sacia mais que amplitude superficial.', 'Para cada nova experiência planejada, conclua uma já iniciada. A experiência completa tem mais valor que dez incompletas.', 'Defina "suficiente" para cada área da vida — e celebre quando chega lá em vez de imediatamente elevar o padrão.', 'Implemente uma ideia antes de entusiasmar com a próxima. A execução é onde a sabedoria real reside.', 'Pratique fronteiras psíquicas: antes de se fundir ao ambiente, cheque se a emoção que sente é sua ou do espaço.'],
    luxuria: ['Cultive a paciência do desejo — deixe crescer antes de agir. A antecipação consciente aprofunda o prazer.', 'Pratique o desapego amoroso: cuidar sem possuir. O amor real dá liberdade.', 'Traga o desejo mental para a experiência corporal — o corpo tem sabedoria que a fantasia não alcança.', 'Desenvolva a habilidade de desejar sem precisar — a diferença entre querer e depender.', 'Ame sem plateia. O prazer vivido privadamente tem uma qualidade que o compartilhado publicamente não tem.', 'Simplifique os critérios: o parceiro ideal não precisa satisfazer todos os requisitos para ser real e valioso.', 'Desenvolva a capacidade de iniciar o desejo por dentro, sem precisar do espelho do outro.', 'Transforme a intensidade em profundidade — deseje menos pessoas, mas com mais presença e honestidade.', 'Cultive a permanência dentro da novidade: encontre o que muda no familiar antes de buscar o novo.', 'Dê ao prazer a mesma seriedade que dá ao trabalho. Agendar tempo para o corpo não é superficialidade.', 'Permita que o prazer seja simples às vezes. A conexão profunda nem sempre precisa de profundidade intelectual.', 'Habite o corpo enquanto habita o espírito. A transcendência não exige negar o que é humano.'],
    ira: ['Desenvolva o espaço entre o gatilho e a resposta. Um segundo de pausa pode mudar o resultado de uma conversa inteira.', 'Expresse a raiva diretamente antes que vire terremoto. Pequenas honestidades constantes evitam explosões.', 'Pratique o "eu me sinto" em vez do "você é/fez". A frase começa em você, não no acusado.', 'Transforme o silêncio punitivo em pedido direto: "preciso de tempo para processar" em vez de desaparecer sem explicação.', 'Rie do drama próprio às vezes — o humor sobre si mesmo é o primeiro passo para não ser governado pelo teatro.', 'Transforme a lista de erros alheios em feedback direto dado uma vez, com clareza. Guardar cobra juros emocionais.', 'Treine a resposta direta e elegante: "isso me incomodou" sem planejamento estratégico de vingança.', 'Desenvolva a capacidade de encerrar sem destruir. Soltar não precisa ser apagar. Distância pode ser respeitosa.', 'Canalise a indignação moral em ação concreta: o que você pode fazer a partir da raiva, além de senti-la?', 'Diferencie competência real de autoridade automática. Nem todo que discorda está errado.', 'Transforme a raiva sistêmica em projeto específico. Indignação difusa drena; indignação focalizada muda.', 'Permita a raiva antes que vire mágoa. A raiva é mais limpa; a mágoa é mais custosa.'],
    avareza: ['Pratique generosidade de tempo em pequenas doses — 5 minutos de presença total valem mais que 1 hora dividida.', 'Experimente a generosidade como investimento, não como gasto. O que você dá, em geral, volta em formas que não esperava.', 'Pratique a presença completa com uma pessoa por vez. Estar plenamente aqui é o maior presente que você pode dar.', 'Compartilhe o que sente antes de ter certeza de como vai ser recebido. A vulnerabilidade é o oposto da avareza emocional.', 'Aplauda alguém publicamente esta semana sem calcular o custo ao ego.', 'Compartilhe um aprendizado relevante com alguém que se beneficiaria. O que você espalha, você solidifica.', 'Pratique dizer sim a um pedido que custaria energia, mas que importa ao outro. Generosidade seletiva ainda é generosidade.', 'Delegue uma decisão completamente — sem revisar depois. Isso é generosidade de poder.', 'Comprometе-se a algo com alguém. Uma promessa cumprida é generosidade de presença no tempo.', 'Celebre publicamente a conquista de alguém sem adicionar qualificadores ou comparações.', 'Compartilhe crédito por uma ideia que poderia facilmente manter só para si.', 'Dê sem controlar o resultado. A generosidade real não tem nota de rodapé.'],
    inveja: ['Transforme a inveja em informação: "o que essa pessoa tem que eu quero para mim?" Use a resposta como bússola de metas.', 'Pratique a abundância mental: o sucesso do outro não diminui o seu. O mercado, a atenção e o amor não são recursos finitos.', 'Foque no que está construindo, não no que o outro já chegou. Trajetórias diferentes têm ritmos diferentes.', 'Trabalhe a raiz emocional: o que foi negado a você na infância que você vê nos outros e ressente?', 'Expresse genuinamente quando algo de alguém te impressiona. A admiração honesta transforma a inveja.', 'Defina seus próprios critérios de excelência em vez de usar o outro como régua.', 'Cultive relacionamentos onde o sucesso do outro te alegra. Se não existe nenhum, esse é o ponto de partida.', 'Identifique onde você TEM poder que não reconhece. A inveja frequentemente cega para os próprios recursos.', 'Questione a crença subjacente: "há sentido para mim também" — e aja a partir disso.', 'Defina status por critérios que você controla, não pelos que o mundo define para você.', 'Construa seu próprio grupo de pertencimento em vez de ressent os já existentes.', 'Pratique a paz que você busca — em pequenas doses, conscientemente, sem esperar estar "pronto".'],
    preguica: ['Complete um projeto pequeno e específico esta semana. A conclusão gera energia para a próxima ação.', 'Aceite que "bom o suficiente e concluído" supera "perfeito e inexistente" na maioria das situações.', 'Escolha um projeto e abandone os outros temporariamente. A profundidade de um supera a superficialidade de dez.', 'Agende 15 minutos semanais para trabalhar uma questão interna — menos que isso não parece comprometimento real.', 'Crie uma rotina pequena e consistente em vez de esperar pela motivação. A ação cria a motivação, não o contrário.', 'Comece imperfeito. A primeira versão não precisa ser a final; precisa existir.', 'Tome uma decisão pequena agora, sem esperar clareza total. A clareza frequentemente vem depois da ação.', 'Compartilhe algo vulnerável com alguém de confiança esta semana. A exposição gradual reduz o medo.', 'Aterrissse uma ideia em um plano de 3 passos concretos com datas. O plano específico transforma sonho em projeto.', 'Agende uma hora de prazer genuíno na semana e trate-a como compromisso inegociável.', 'Assuma um compromisso de longo prazo em algo que importa. A liberdade sem compromisso é só outra forma de vazio.', 'Tome uma ação concreta hoje em direção ao sonho que continua sendo adiado. Pequena, mas real.'],
  };
  return (integrations[sin] || [])[signIdx] || `Integrar este pecado começa com reconhecê-lo com humor e curiosidade, não com julgamento. A sombra que você nomeia perde poder sobre você.`;
}

export { generateFinancialPdf } from './financial-report';

export function generateSevenSinsPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const texts = getInterpretations(options.locale || 'pt');
  const labels = getReportLabels(options.locale || 'pt');
  const SIGN_NAMES = labels.signs;
  const PLANET_NAMES = labels.planets;
  const st = getSevenSinsTexts(options.locale || 'pt');

  const sunSign = getSignIndex(chart.positions.sun?.longitude || 0);
  const moonSign = getSignIndex(chart.positions.moon?.longitude || 0);
  const venusSign = getSignIndex(chart.positions.venus?.longitude || 0);
  const marsSign = getSignIndex(chart.positions.mars?.longitude || 0);
  const jupiterSign = getSignIndex(chart.positions.jupiter?.longitude || 0);
  const saturnSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const plutoSign = getSignIndex(chart.positions.pluto?.longitude || 0);

  // P1: Capa
  renderCover(doc, texts.LABELS.sinsTitle, st.coverSubtitle, options, '👹');

  // P2: Introdução
  doc.addPage(); let y = 30;
  y = addSectionTitle(doc, st.introTitle, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, st.intro1, margin, y, 170); y += 5;
  y = wrapText(doc, st.intro2, margin, y, 170); y += 5;
  y = wrapText(doc, st.intro3, margin, y, 170); y += 8;
  y = addSubTitle(doc, st.sinMapTitle, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  const sinMap = [
    `${st.sinMapLabels[0]} — ${SIGN_NAMES[sunSign]}`,
    `${st.sinMapLabels[1]} — ${SIGN_NAMES[moonSign]}`,
    `${st.sinMapLabels[2]} — ${SIGN_NAMES[venusSign]}`,
    `${st.sinMapLabels[3]} — ${SIGN_NAMES[marsSign]}`,
    `${st.sinMapLabels[4]} — ${SIGN_NAMES[saturnSign]}`,
    `${st.sinMapLabels[5]} — ${SIGN_NAMES[plutoSign]}`,
    `${st.sinMapLabels[6]} — ${SIGN_NAMES[jupiterSign]}`,
  ];
  for (const s of sinMap) { y = wrapText(doc, s, margin, y, 170); y += 5; }

  // TRYOUT CUT — return after cover + sin map overview (3 pages)
  const tryoutBlob5 = tryoutCut(doc, options, texts.LABELS.sinsTitle, '19.90');
  if (tryoutBlob5) return tryoutBlob5;

  // P3-P4: ORGULHO — Sol (2 páginas)
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, st.prideTitle(SIGN_NAMES[sunSign]), y, margin);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(...COLORS.textLight);
  doc.text(st.prideMeta, margin, y); y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, st.prideIntro(SIGN_NAMES[sunSign]), margin, y, 170); y += 6;
  y = wrapText(doc, getSinText('orgulho', sunSign), margin, y, 170); y += 6;
  y = wrapText(doc, st.prideOutro, margin, y, 170);

  doc.addPage(); y = 30;
  y = addSectionTitle(doc, st.prideIntegrationTitle, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, getSinIntegration('orgulho', sunSign), margin, y, 170); y += 8;
  y = addSubTitle(doc, st.prideDomTitle, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, st.prideDom(SIGN_NAMES[sunSign]), margin, y, 170);

  // P5-P6: GULA — Lua
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `🍰 GULA — Lua em ${SIGN_NAMES[moonSign]}`, y, margin);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(...COLORS.textLight);
  doc.text('Planeta: Lua  |  Pecado: Gula  |  Dom oculto: Nutrição e cuidado', margin, y); y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A Lua governa as necessidades emocionais — e quando essas necessidades não são reconhecidas conscientemente, tornam-se gulodices: o consumo compulsivo de tudo que pode preencher o vazio. Em ${SIGN_NAMES[moonSign]}, a fome tem um endereço específico:`, margin, y, 170); y += 6;
  y = wrapText(doc, getSinText('gula', moonSign), margin, y, 170); y += 6;
  y = wrapText(doc, `A Lua não é gananciosa — é faminta. Há uma diferença. A fome da Lua é real e precisa ser alimentada; o problema é quando não conseguimos distinguir o que realmente sacia do que apenas ocupa. Reconhecer a fome real por baixo da compulsão é o começo da saída.`, margin, y, 170);

  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `🍰 GULA — Caminho de Integração`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, getSinIntegration('gula', moonSign), margin, y, 170); y += 8;
  y = addSubTitle(doc, 'O Dom da Gula Integrada', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A gula integrada se transforma em capacidade genuína de nutrição — tanto receber quanto dar. Em ${SIGN_NAMES[moonSign]}, isso significa desenvolver a sabedoria de saber o que realmente alimenta e cultivar fontes sustentáveis disso na vida: relações, práticas, ambientes. A Lua que sabe o que precisa para se sentir segura pode dar de um lugar de abundância, não de escassez.`, margin, y, 170);

  // P7-P8: LUXÚRIA — Vênus
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `🔥 LUXÚRIA — Vênus em ${SIGN_NAMES[venusSign]}`, y, margin);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(...COLORS.textLight);
  doc.text('Planeta: Vênus  |  Pecado: Luxúria  |  Dom oculto: Amor e beleza', margin, y); y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Vênus governa o desejo, o amor e o que consideramos belo. A luxúria emerge quando o desejo perde a consciência — quando queremos sem considerar o outro, ou quando o prazer se torna fuga em vez de presença. Em ${SIGN_NAMES[venusSign]}, o desejo tem sua textura particular:`, margin, y, 170); y += 6;
  y = wrapText(doc, getSinText('luxuria', venusSign), margin, y, 170); y += 6;
  y = wrapText(doc, `Vênus não é pecadora — é apaixonada. O prazer é legítimo e necessário; o problema é quando perde a qualidade de presença. A luxúria é o desejo sem contato real. A cura não é reprimir o querer — é aprofundá-lo.`, margin, y, 170);

  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `🔥 LUXÚRIA — Caminho de Integração`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, getSinIntegration('luxuria', venusSign), margin, y, 170); y += 8;
  y = addSubTitle(doc, 'O Dom da Luxúria Integrada', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A luxúria integrada se transforma em Eros consciente — desejo com presença, prazer com responsabilidade, beleza com profundidade. Em ${SIGN_NAMES[venusSign]}, isso significa usar a capacidade de desejar como bússola de valores: o que você genuinamente ama revela quem você é. E quando o amor é consciente, ele constrói em vez de consumir.`, margin, y, 170);

  // P9-P10: IRA — Marte
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `⚡ IRA — Marte em ${SIGN_NAMES[marsSign]}`, y, margin);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(...COLORS.textLight);
  doc.text('Planeta: Marte  |  Pecado: Ira  |  Dom oculto: Força e coragem', margin, y); y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Marte governa a força, a ação e os limites. A ira emerge quando essa energia não tem direção consciente — quando a força se torna agressividade, quando a defesa se torna ataque, quando o limite se torna punição. Em ${SIGN_NAMES[marsSign]}, a raiva tem uma forma muito reconhecível:`, margin, y, 170); y += 6;
  y = wrapText(doc, getSinText('ira', marsSign), margin, y, 170); y += 6;
  y = wrapText(doc, `Marte não é vilão — é o guerreiro que precisa de uma causa justa. A raiva é um sinal, não um defeito: ela indica que um limite foi cruzado, que um valor foi violado, que algo precisa ser defendido ou mudado. O problema é quando disparamos o guerreiro antes de entender o que ele está realmente protegendo.`, margin, y, 170);

  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `⚡ IRA — Caminho de Integração`, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, getSinIntegration('ira', marsSign), margin, y, 170); y += 8;
  y = addSubTitle(doc, 'O Dom da Ira Integrada', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `A ira integrada se transforma em assertividade — a capacidade de dizer não, de estabelecer limites e de agir com força sem destruir o que não precisa ser destruído. Em ${SIGN_NAMES[marsSign]}, isso significa usar a energia marciana como combustível para projetos e defesas legítimas, não como reação automática a qualquer frustração. O guerreiro maduro escolhe suas batalhas — e vence mais porque luta por razões reais.`, margin, y, 170);

  // P11: AVAREZA — Saturno
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `💰 AVAREZA — Saturno em ${SIGN_NAMES[saturnSign]}`, y, margin);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(...COLORS.textLight);
  doc.text('Planeta: Saturno  |  Pecado: Avareza  |  Dom oculto: Disciplina e estrutura', margin, y); y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Saturno governa limites, estrutura e o que retemos. A avareza saturniana não é necessariamente com dinheiro — é com qualquer recurso que você teme perder: tempo, energia, poder, reconhecimento, afeto. Em ${SIGN_NAMES[saturnSign]}, a retenção tem um padrão identificável:`, margin, y, 170); y += 6;
  y = wrapText(doc, getSinText('avareza', saturnSign), margin, y, 170); y += 6;
  y = wrapText(doc, `Saturno não é mesquinho — é cuidadoso. A diferença entre cuidado e avareza é a crença subjacente: "não há suficiente" versus "há suficiente se for gerenciado com sabedoria". Quando o medo de escassez governa Saturno, ele retém até a generosidade. Quando a maturidade governa Saturno, ele gerencia recursos com precisão e ainda sobra para dar.`, margin, y, 170); y += 8;
  y = addSubTitle(doc, 'Dom da Avareza Integrada', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, getSinIntegration('avareza', saturnSign), margin, y, 170);

  // P12: INVEJA — Plutão
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `🐍 INVEJA — Plutão em ${SIGN_NAMES[plutoSign]}`, y, margin);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(...COLORS.textLight);
  doc.text('Planeta: Plutão  |  Pecado: Inveja  |  Dom oculto: Transformação e poder pessoal', margin, y); y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Plutão governa o que está oculto — incluindo a inveja, que raramente admitimos em voz alta. A inveja plutoniana não é apenas "querer o que o outro tem" — é o ressentimento quando o outro parece ter acesso a algo que você acredita ser negado a você. Em ${SIGN_NAMES[plutoSign]}, esse ressentimento tem uma qualidade específica:`, margin, y, 170); y += 6;
  y = wrapText(doc, getSinText('inveja', plutoSign), margin, y, 170); y += 6;
  y = wrapText(doc, `Plutão não é malicioso — é intenso. A inveja que ele carrega tem uma função: ela aponta para o que você genuinamente deseja mas ainda não acredita ser possível para si mesmo. Esse apontamento, quando usado com honestidade em vez de negado, pode ser uma das bússolas mais precisas de propósito que existe.`, margin, y, 170); y += 8;
  y = addSubTitle(doc, 'Dom da Inveja Integrada', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, getSinIntegration('inveja', plutoSign), margin, y, 170);

  // P13: PREGUIÇA — Júpiter
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, `🛋️ PREGUIÇA — Júpiter em ${SIGN_NAMES[jupiterSign]}`, y, margin);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10); doc.setTextColor(...COLORS.textLight);
  doc.text('Planeta: Júpiter  |  Pecado: Preguiça  |  Dom oculto: Fé e expansão', margin, y); y += 8;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Júpiter governa expansão, fé e otimismo — e quando não integrado, se transforma em preguiça: a confiança de que as coisas vão se resolver sem ação concreta. Em ${SIGN_NAMES[jupiterSign]}, a preguiça tem um disfarce sofisticado:`, margin, y, 170); y += 6;
  y = wrapText(doc, getSinText('preguica', jupiterSign), margin, y, 170); y += 6;
  y = wrapText(doc, `Júpiter não é preguiçoso — é otimista. A diferença entre fé e preguiça é a ação: fé que move as próprias mãos é expansão real; fé que espera sentada é adiamento disfarçado de espiritualidade. Júpiter integrado combina entusiasmo com execução, visão com passo concreto.`, margin, y, 170); y += 8;
  y = addSubTitle(doc, 'Dom da Preguiça Integrada', y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, getSinIntegration('preguica', jupiterSign), margin, y, 170);

  // P14: Caminho de Integração — Resumo dos 7
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, st.integrationTitle, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, st.integrationIntro, margin, y, 170); y += 6;
  const summaryItems = [
    { sin: '👑 Orgulho', key: `Sol em ${SIGN_NAMES[sunSign]}`, action: 'Observe quando precisa ter razão. Pergunte: "posso aprender algo aqui?"' },
    { sin: '🍰 Gula', key: `Lua em ${SIGN_NAMES[moonSign]}`, action: 'Identifique a fome real antes de preencher o vazio com o próximo consumo.' },
    { sin: '🔥 Luxúria', key: `Vênus em ${SIGN_NAMES[venusSign]}`, action: 'Traga presença ao que já tem antes de buscar o próximo desejo.' },
    { sin: '⚡ Ira', key: `Marte em ${SIGN_NAMES[marsSign]}`, action: 'Faça uma pausa de 3 respirações antes de responder em conflito.' },
    { sin: '💰 Avareza', key: `Saturno em ${SIGN_NAMES[saturnSign]}`, action: 'Pratique uma generosidade pequena e específica esta semana.' },
    { sin: '🐍 Inveja', key: `Plutão em ${SIGN_NAMES[plutoSign]}`, action: 'Quando sentir inveja, pergunte: "o que exatamente quero para mim?"' },
    { sin: '🛋️ Preguiça', key: `Júpiter em ${SIGN_NAMES[jupiterSign]}`, action: 'Tome uma ação de 5 minutos em direção ao projeto que fica sendo adiado.' },
  ];
  for (const item of summaryItems) {
    y = checkPage(doc, y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...COLORS.brand);
    doc.text(`${item.sin} (${item.key})`, margin, y); y += 5;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `→ ${item.action}`, margin + 4, y, 166); y += 5;
  }

  // P15: Conclusão bem-humorada
  doc.addPage(); y = 30;
  y = addSectionTitle(doc, st.conclusionTitle, y, margin);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...COLORS.text);
  y = wrapText(doc, st.conclusion1(options.profileName), margin, y, 170); y += 5;
  y = wrapText(doc, st.conclusion2, margin, y, 170); y += 5;
  y = wrapText(doc, st.conclusion3, margin, y, 170); y += 5;
  y = wrapText(doc, st.conclusion4, margin, y, 170); y += 10;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(11); doc.setTextColor(...COLORS.brandLight);
  doc.text(st.quote, margin, y);

  addFooters(doc, options.profileName);
  return doc.output('blob');
}

// ============================================================
// SATURN RETURN REPORT
// ============================================================
export { generateSaturnReturnPdf } from './saturn-return-report';
export { generateSpiritualPdf } from './spiritual-report';
