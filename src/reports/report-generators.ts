// ============================================================
// REPORT-GENERATORS.TS — Geradores de relatórios premium (Try-out)
// Cada função gera um PDF com 3 páginas gratuitas + página CTA
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

// Textos detalhados por casa ativada na profecção (índice 0 = Casa 1)
const PROFECTION_HOUSE_TEXTS = [
  'A Casa 1 em profecção marca um ano de renascimento pessoal. Sua identidade está em primeiro plano — a forma como você se apresenta ao mundo passa por uma revisão profunda. É comum sentir um impulso renovado de autonomia, mudança de aparência ou postura, e a vontade de começar algo que seja genuinamente seu. O regente do ano define o "combustível" desse recomeço: se for planeta benéfico, a renovação flui; se for maléfico, exige trabalho e consciência.',
  'A Casa 2 em profecção coloca em foco sua relação com dinheiro, recursos próprios e autoestima. Este é um ano para examinar o que você valoriza — não apenas bens materiais, mas o que acredita merecer. Movimentações financeiras, novas fontes de renda ou revisão de gastos são temas recorrentes. A autoestima e a segurança interna também são ativadas: vale perguntar "o que me dá segurança de fato?" e agir a partir daí.',
  'A Casa 3 em profecção ativa comunicação, aprendizado, relações com irmãos e o entorno imediato. Um ano de muito movimento mental, trocas, cursos, escrita e deslocamentos curtos. A mente está acelerada e curiosa. Cuidado com dispersão — há tantos estímulos que manter foco exige disciplina. Relações com irmãos ou vizinhos podem ganhar relevância, seja para aproximar ou resolver pendências antigas.',
  'A Casa 4 em profecção traz o lar, a família de origem e as raízes emocionais para o centro do ano. Mudanças de residência, reestruturação familiar, ou um chamado interno para cuidar das próprias fundações emocionais são comuns. É um ano introspectivo — o mundo externo perde força e o mundo interno pede atenção. Terapia, retornos à cidade natal, ou questões com figuras parentais frequentemente emergem.',
  'A Casa 5 em profecção é um dos períodos mais vibrantes do ciclo. Criatividade, romance, filhos e prazer são os temas centrais. Há uma energia lúdica e expansiva que empurra para se expressar, se arriscar, se amar. Projetos criativos ganham impulso natural. Romances podem surgir ou se intensificar. Para quem pensa em ter filhos, este ano muitas vezes é um gatilho. O risco é a impulsividade — agir pelo prazer imediato sem pensar nas consequências.',
  'A Casa 6 em profecção chama atenção para rotina, trabalho cotidiano e saúde. É um ano de ajustes práticos — rever hábitos, organizar a agenda, melhorar processos no trabalho. O corpo pede mais cuidado: alimentação, sono, exercício e prevenção entram no radar. No trabalho, questões com colegas, subordinados ou rotinas burocráticas podem exigir atenção. Não é um ano de grandes saltos — é de afinar o que já existe.',
  'A Casa 7 em profecção é o ano das parcerias. Relacionamentos amorosos e profissionais vão ao centro do palco. É comum formalizar um vínculo (casamento, sociedade), encerrar um que não serve mais, ou ter encontros significativos com pessoas que mudam o rumo. O espelho do outro revela muito sobre si mesmo neste período. Acordos, contratos e negociações têm peso especial — revisar com cuidado antes de assinar.',
  'A Casa 8 em profecção é um dos anos mais intensos e transformadores do ciclo. Temas de morte simbólica, heranças, dívidas, sexualidade profunda e poder compartilhado entram em cena. O que não está mais servindo precisa ser solto — e Plutão, regente natural desta casa, não costuma pedir permissão. Crises e rupturas são frequentes, mas são necessárias para a renovação. Este ano tende a mudar você de forma irreversível.',
  'A Casa 9 em profecção ativa expansão, fé, filosofia, viagens longas e estudos superiores. É um ano de abertura de horizontes — intelectuais, geográficos ou espirituais. A busca por sentido e significado se intensifica. Viagens transformadoras, encontros com mestres, retomada de estudos ou interesse em espiritualidade são temas comuns. O risco é o escapismo — usar a expansão para fugir de responsabilidades práticas.',
  'A Casa 10 em profecção coloca a carreira e a reputação pública em destaque. Um ano de visibilidade — para o bem ou para o mal. Promoções, mudanças de cargo, reconhecimento público ou crises de imagem são possíveis. A relação com figuras de autoridade (chefes, Estado, figuras paternas) também é ativada. O que você constrói profissionalmente neste ano pode durar décadas — vale agir com intenção e estratégia.',
  'A Casa 11 em profecção ativa grupos, amizades, projetos coletivos e sonhos de futuro. É um ano voltado para o social e para o que você quer construir além de si mesmo. Novos círculos de amizade, projetos em grupo, causas sociais ou tecnologia podem ganhar relevância. Desejos de longo prazo entram no foco — vale perguntar "que futuro quero criar?" e dar os primeiros passos concretos.',
  'A Casa 12 em profecção é o ano de recolhimento, processamento interior e conclusão de ciclos. A energia externa diminui e a vida interna se intensifica. Sonhos, intuições, retiros, terapia e práticas espirituais ganham força. É comum sentir cansaço de exposição e vontade de simplificar. Questões não resolvidas do passado podem emergir — não para punir, mas para serem integradas antes do novo ciclo que começa na próxima profecção de Casa 1.',
];

// Textos por planeta regente do ano (índice = índice do signo da cúspide da casa em profecção)
// Ordem: Áries(Marte), Touro(Vênus), Gêmeos(Mercúrio), Câncer(Lua), Leão(Sol), Virgem(Mercúrio),
//        Libra(Vênus), Escorpião(Marte/Plutão), Sagitário(Júpiter), Capricórnio(Saturno), Aquário(Saturno/Urano), Peixes(Júpiter/Netuno)
const RULER_OF_YEAR = [
  'Marte é o regente do ano. Isso confere energia, impulsividade e coragem ao período — mas também pode trazer conflitos e impaciência. Acompanhe os trânsitos de Marte pelo seu mapa natal: quando ele aspecto planetas importantes, eventos se aceleram. Ação é a palavra do ano.',
  'Vênus é a regente do ano. Temas de afeto, beleza, dinheiro e valores pessoais permeiam o período. Quando Vênus forma aspectos no seu mapa, relacionamentos e finanças ganham movimento. É um ano favorável para criar, negociar e cultivar vínculos — use essa energia com consciência.',
  'Mercúrio é o regente do ano. A mente está em primeiro plano — comunicação, decisões, contratos e aprendizados definem o ritmo. Fique atento aos períodos de Mercúrio retrógrado: tendem a trazer revisões e mal-entendidos nas áreas ativadas pela profecção. Escrever, ensinar e estudar fluem com facilidade.',
  'A Lua é a regente do ano. Emoções, ciclos e intuição guiam o período. O ritmo do ano segue o calendário lunar — lunações em aspecto com seus planetas natais marcam pontos de mudança. É um ano mais interno, onde ouvir o próprio instinto tem mais valor do que seguir planos rígidos.',
  'O Sol é o regente do ano. Sua identidade e propósito estão no centro — um ano de expressão, liderança e visibilidade. Os períodos em que o Sol transita sobre seus planetas natais (especialmente em aspecto com o regente natal do Sol) marcam momentos de clareza e impulso. Brilhe sem pedir permissão.',
  'Mercúrio é o regente do ano. Com Mercúrio em Virgem — seu domicílio —, a energia analítica e organizadora está em alta. Detalhes importam, processos podem ser otimizados e a saúde pode estar no radar. Retrógrados de Mercúrio merecem atenção especial este ano: revisões técnicas e comunicações pendentes pedem resolução.',
  'Vênus é a regente do ano. Em Libra, seu domicílio, Vênus confere um ano favorável para relacionamentos, acordos e harmonia. Parcerias profissionais e amorosas têm potencial especial. Quando Vênus forma aspectos no seu mapa, momentos de conexão e beleza se manifestam. Use este ciclo para selar vínculos que importam.',
  'Marte e Plutão co-regem o ano. É uma combinação intensa: Marte traz ação e confronto direto; Plutão traz transformação profunda e poder. Juntos, criam um ano de força — mas também de pressão. Situações que exigem coragem, estratégia e vontade de se reinventar surgem. Evite força bruta; prefira precisão.',
  'Júpiter é o regente do ano. Expansão, otimismo e oportunidades marcam o período. É um ano favorável para crescimento, mas cuidado com excesso — Júpiter amplifica tudo, inclusive erros. Acompanhe os trânsitos de Júpiter: quando ele aspecto pontos importantes do seu mapa, portas se abrem. Aproveite, mas mantenha os pés no chão.',
  'Saturno é o regente do ano. Disciplina, estrutura e responsabilidade definem o ciclo. Não é um ano fácil — é um ano produtivo. O que você construir agora com paciência e método dura décadas. Cobranças e limites aparecem para ensinar, não para punir. Trânsitos de Saturno sobre seus planetas natais marcam os períodos mais exigentes — e mais recompensadores.',
  'Saturno e Urano co-regem o ano. Saturno pede estrutura; Urano pede ruptura. A tensão entre esses dois impulsos — manter vs. mudar — é o tema central. Momentos de instabilidade podem surgir, mas trazem liberação do que estava estagnado. Inovação dentro de limites é a chave deste ciclo.',
  'Júpiter e Netuno co-regem o ano. Uma combinação de expansão e dissolução: sonhos ganham força, mas os limites do real precisam ser respeitados. Criatividade, espiritualidade e compaixão fluem. Cuidado com ilusões ou escapismo — Netuno pode criar névoa onde Júpiter prometia clareza. Intuição e fé são aliados, desde que ancorados em ação concreta.',
];

export function generateAnnualPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const currentYear = new Date().getFullYear();

  // PAGE 1: Cover
  renderCover(doc, 'Previsão Anual', `Trânsitos e tendências ${currentYear}`, options, '🔮');

  // ── Calcular dados base ──────────────────────────────────────────────────
  const birthYear = parseInt(options.birthDate.split(/[-/]/)[0]) || 1990;
  const age = currentYear - birthYear;
  const profectionHouse = (age % 12) + 1;   // 1–12
  const profectionSign = getSignIndex(chart.houses.cusps[profectionHouse - 1]);

  const saturnHouse = chart.planetHouses.saturn || 1;
  const jupiterHouse = chart.planetHouses.jupiter || 1;
  const saturnSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const jupiterSign = getSignIndex(chart.positions.jupiter?.longitude || 0);

  // Nodo Norte natal para eixo eclíptico
  const northNodeSign = getSignIndex(chart.positions.northNode?.longitude || 0);
  const southNodeSign = (northNodeSign + 6) % 12;

  // ── PAGE 2: Profecção + Regente do Ano ────────────────────────────────────
  doc.addPage();
  let y = 30;

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Profecção Anual — Tema do Ano', margin, y);
  y += 8;

  // Cabeçalho da casa ativada
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc,
    `Aos ${age} anos, a profecção anual ativa sua Casa ${profectionHouse} — cujo signo é ${SIGN_SYMBOLS[profectionSign]} ${SIGN_NAMES[profectionSign]}. Esta é a casa que comanda o ritmo e os temas do ano.`,
    margin, y, 170);
  y += 8;

  // Texto específico da casa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`Casa ${profectionHouse} em Foco`, margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, PROFECTION_HOUSE_TEXTS[profectionHouse - 1], margin, y, 170);
  y += 8;

  // Regente do ano
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text(`Regente do Ano — ${SIGN_NAMES[profectionSign]}`, margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, RULER_OF_YEAR[profectionSign], margin, y, 170);
  y += 8;

  // Meses-chave
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.brand);
  doc.text('Meses-Chave do Ano', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  // Gera meses-chave baseados na casa de profecção (padrão: cada 3 meses tem um tema)
  const keyMonthsBase = [2, 5, 8, 11]; // Fev, Mai, Ago, Nov como referência
  const keyMonthsOffset = ((profectionHouse - 1) * 1) % 3; // pequeno offset para variar
  const keyMonths = [
    MONTHS_PT[(keyMonthsBase[0] + keyMonthsOffset) % 12],
    MONTHS_PT[(keyMonthsBase[1] + keyMonthsOffset) % 12],
    MONTHS_PT[(keyMonthsBase[2] + keyMonthsOffset) % 12],
    MONTHS_PT[(keyMonthsBase[3] + keyMonthsOffset) % 12],
  ];
  const keyMonthThemes = [
    `${keyMonths[0]}: Início do ciclo — prime window para tomar decisões sobre os temas da Casa ${profectionHouse}.`,
    `${keyMonths[1]}: Ponto de tensão — revisões e ajustes na rota são comuns neste período.`,
    `${keyMonths[2]}: Colheita parcial — resultados das ações do início do ano se tornam visíveis.`,
    `${keyMonths[3]}: Integração e preparo — encerramento do ciclo antes do próximo aniversário.`,
  ];
  for (const kmt of keyMonthThemes) {
    y = wrapText(doc, `• ${kmt}`, margin, y, 168);
    y += 5;
  }

  // ── PAGE 3: Trânsitos + Eclipses + Recomendações ─────────────────────────
  doc.addPage();
  y = 30;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Trânsitos Principais do Ano', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc,
    'Planetas lentos em trânsito formam o contexto coletivo do ano. Quando eles aspectam pontos sensíveis do seu mapa natal, o efeito se torna pessoal e intenso.',
    margin, y, 170);
  y += 8;

  // ── Saturno ──────────────────────────────────────────────────────────────
  const saturnTransitHouse = (saturnHouse % 12) + 1;
  const saturnTransitTexts: Record<number, string> = {
    1: `Saturno transitando sua Casa 1 marca um período de reavaliação profunda da identidade. A imagem que você projeta para o mundo passa por uma prova de realidade — o que não é genuíno cede. Fisicamente, o corpo pode pedir mais cuidado. É exigente, mas o resultado é uma versão mais sólida e autêntica de si mesmo.`,
    2: `Saturno transitando sua Casa 2 exige disciplina financeira e revisão do que você realmente valoriza. Gastos supérfluos tornam-se insustentáveis; a construção de uma base econômica sólida ganha urgência. Autoestima também é testada — você precisa ganhar sua própria aprovação, não a dos outros.`,
    3: `Saturno transitando sua Casa 3 traz seriedade à comunicação e ao aprendizado. Conversas superficiais perdem sentido; você se torna mais criterioso com o que lê, diz e escreve. Estudos aprofundados florescem neste período. Relações com irmãos ou vizinhos podem exigir maturidade.`,
    4: `Saturno transitando sua Casa 4 toca as fundações — família, lar e raízes emocionais entram em revisão. Mudanças na estrutura doméstica são comuns. Questões com figura paterna ou materna podem ressurgir pedindo resolução. O trabalho interno exigido aqui é profundo, mas liberta padrões antigos.`,
    5: `Saturno transitando sua Casa 5 testa a criatividade e o prazer. Romance pode trazer responsabilidade em vez de leveza — relacionamentos sérios, gravidez, compromisso criativo que exige trabalho real. A espontaneidade diminui, mas o que você cria neste período tem substância e duração.`,
    6: `Saturno transitando sua Casa 6 coloca saúde e rotina de trabalho em foco com seriedade. Problemas físicos cronicamente ignorados pedem atenção. A rotina precisa de estrutura — improvisação não sustenta mais. No trabalho, padrões e processos precisam ser revistos. É um ciclo produtivo para quem aceita a disciplina.`,
    7: `Saturno transitando sua Casa 7 é um dos trânsitos mais desafiadores para relacionamentos. Parcerias são testadas — as sólidas se fortalecem; as superficiais podem não sobreviver. Compromissos formais (casamento, sociedade) pedem reflexão séria. A solidão também pode ser um professor neste período.`,
    8: `Saturno transitando sua Casa 8 toca dívidas, heranças, recursos compartilhados e intimidade. Situações financeiras que envolvem terceiros exigem clareza e estrutura. A transformação profunda que Saturno exige aqui é lenta mas irreversível. É possível que lidar com perdas, heranças ou processos de inventário entre no radar.`,
    9: `Saturno transitando sua Casa 9 questiona suas crenças e filosofia de vida. O que você acreditava sem questionar passa por prova de realidade. Expansão por viagens ou estudos pode ser substituída por um aprofundamento em menos assuntos. Fé que não tem raiz cede; fé que tem fundamento se fortalece.`,
    10: `Saturno transitando sua Casa 10 é um dos mais poderosos para a carreira — especialmente se for retorno de Saturno. A reputação profissional é testada. Quem construiu com consistência colhe reconhecimento; quem construiu sobre aparência enfrenta crises de imagem. Liderança com responsabilidade é o tema central.`,
    11: `Saturno transitando sua Casa 11 revisa amizades e círculos sociais. Grupos que não têm substância se dissolvem; novos vínculos formados agora tendem a durar. Sonhos de futuro passam pelo crivo da realidade — os viáveis ficam, os ilusórios caem. Organizações e projetos coletivos exigem comprometimento sério.`,
    12: `Saturno transitando sua Casa 12 é um período de recolhimento interior profundo. Questões do inconsciente que foram adiadas pedem resolução. Terapia, retiro espiritual e práticas contemplativas são aliados poderosos. É um ciclo de término — ao final, você emerge mais leve, pronto para o retorno de Saturno à Casa 1.`,
  };
  const saturnText = saturnTransitTexts[saturnTransitHouse] ||
    `Saturno transita sua Casa ${saturnTransitHouse} pedindo estrutura e responsabilidade. O trabalho árduo neste período produz resultados que duram — Saturno recompensa quem aceita suas exigências com maturidade.`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brand);
  doc.text(`♄ Saturno — Casa ${saturnTransitHouse} (${SIGN_NAMES[saturnSign]})`, margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, saturnText, margin, y, 170);
  y += 8;

  // ── Júpiter ───────────────────────────────────────────────────────────────
  const jupiterTransitHouse = (jupiterHouse % 12) + 1;
  const jupiterTransitTexts: Record<number, string> = {
    1: `Júpiter transitando sua Casa 1 é um dos trânsitos mais favoráveis do ciclo de 12 anos. Confiança, vitalidade e novas oportunidades chegam em quantidade. O risco é o excesso — Júpiter amplifica tudo, inclusive os exageros. Comece projetos ambiciosos, mas mantenha os pés no chão.`,
    2: `Júpiter transitando sua Casa 2 favorece finanças, novas fontes de renda e crescimento patrimonial. A autoestima se expande e você passa a reconhecer seu próprio valor com mais clareza. Oportunidades financeiras surgem — aproveite, mas evite gastos impulsivos que anulam os ganhos.`,
    3: `Júpiter transitando sua Casa 3 expande a mente — cursos, leituras, conexões e viagens curtas fluem com facilidade. É um período excelente para escrever, ensinar, aprender e comunicar. Irmãos ou vizinhos podem trazer boas notícias. A dispersão é o risco — muitos projetos e poucos concluídos.`,
    4: `Júpiter transitando sua Casa 4 traz prosperidade e expansão para o lar e a família. Mudanças positivas na moradia, reconciliações familiares ou sentimento renovado de pertencimento são comuns. É um período favorável para comprar imóvel ou investir na casa.`,
    5: `Júpiter transitando sua Casa 5 é um dos períodos mais alegres e criativos do ciclo. Romance, prazer, filhos e expressão criativa fluem com abundância. Projetos artísticos podem decolar. Para quem deseja engravidar, este trânsito é um dos mais favoráveis. Aproveite a leveza, mas evite apostas ou excessos.`,
    6: `Júpiter transitando sua Casa 6 favorece saúde, rotina e trabalho cotidiano. Problemas crônicos de saúde podem encontrar solução. O trabalho se torna mais satisfatório ou oportunidades de emprego aparecem. A rotina ganha sentido e produtividade aumenta — aproveite para criar hábitos sustentáveis.`,
    7: `Júpiter transitando sua Casa 7 é excelente para parcerias amorosas e profissionais. Relacionamentos se aprofundam, novos vínculos significativos são formados e acordos tendem a ser favoráveis. Se está solteiro, as chances de encontrar alguém aumentam significativamente neste período.`,
    8: `Júpiter transitando sua Casa 8 pode trazer benefícios por herança, investimentos ou recursos compartilhados. A transformação profunda se torna mais fluida — processos que antes eram pesados, ganham leveza. Intimidade se aprofunda com qualidade. É favorável para questões de inventário, seguro ou crédito.`,
    9: `Júpiter transitando sua Casa 9 é o lar natural de Júpiter. Expansão máxima: viagens transformadoras, estudos superiores, publicações, conexões internacionais e crescimento espiritual fluem com facilidade. Um dos melhores trânsitos para ampliar horizontes em qualquer sentido.`,
    10: `Júpiter transitando sua Casa 10 favorece carreira, reputação e visibilidade pública. Promoções, reconhecimentos, oportunidades de liderança e expansão profissional são muito prováveis. Aproveite a janela — Júpiter fica cerca de 1 ano nesta casa. Aja com confiança e visibilidade.`,
    11: `Júpiter transitando sua Casa 11 expande sua rede social e seus projetos coletivos. Amizades novas e significativas entram na vida; grupos e comunidades trazem oportunidades. Sonhos de futuro que pareciam distantes ganham viabilidade prática. É um período de alinhamento com propósito maior.`,
    12: `Júpiter transitando sua Casa 12 é um período de crescimento silencioso. O que se expande aqui é a vida interior — espiritualidade, compaixão, criatividade oculta. Retiros, práticas espirituais e trabalho terapêutico fluem com profundidade. Prepare-se: o próximo trânsito de Júpiter pela Casa 1 traz renovação externa.`,
  };
  const jupiterText = jupiterTransitTexts[jupiterTransitHouse] ||
    `Júpiter transita sua Casa ${jupiterTransitHouse} trazendo expansão e oportunidades para essa área da vida. Aja com otimismo, mas sem descuido — Júpiter amplifica o que já existe.`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brand);
  doc.text(`♃ Júpiter — Casa ${jupiterTransitHouse} (${SIGN_NAMES[jupiterSign]})`, margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, jupiterText, margin, y, 170);
  y += 8;

  // ── Eclipses ──────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brand);
  doc.text(`☊ Eclipses — Eixo ${SIGN_NAMES[northNodeSign]}/${SIGN_NAMES[southNodeSign]}`, margin, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc,
    `Os eclipses deste ciclo ocorrem no eixo ${SIGN_NAMES[northNodeSign]}–${SIGN_NAMES[southNodeSign]}, ativando as casas correspondentes do seu mapa. Eclipses solares abrem portais — novas situações se instalam de forma acelerada e irreversível. Eclipses lunares revelam — o que estava oculto vem à superfície, trazendo resolução ou ruptura. Fique atento especialmente aos eclipses que ocorrem a menos de 5° de algum dos seus planetas natais: esses são pontos de mudança significativa na sua história pessoal este ano.`,
    margin, y, 170);
  y += 8;

  // ── Recomendações práticas por trimestre ──────────────────────────────────
  if (y < 235) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.brand);
    doc.text('Recomendações Práticas por Trimestre', margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);

    const isInnerHouse = profectionHouse <= 6;
    const q1Action = isInnerHouse
      ? `Defina intenções claras para os temas da Casa ${profectionHouse}. Anote metas concretas.`
      : `Avalie o que o ciclo anterior construiu e decida o que levar adiante.`;
    const q2Action = jupiterTransitHouse === profectionHouse
      ? `Júpiter e a profecção coincidem neste trimestre — janela de oportunidade rara. Aja com ousadia.`
      : `Mantenha foco nos temas da Casa ${profectionHouse}. Resistência a distrações é crucial agora.`;
    const q3Action = saturnTransitHouse === profectionHouse
      ? `Saturno testa a Casa ${profectionHouse} ao mesmo tempo que a profecção a ativa. Discipline-se: os resultados virão.`
      : `Resultados começam a aparecer. Consolide o que funcionou e solte o que não foi.`;

    const quarters = [
      `Q1 (Jan–Mar): ${q1Action} Inicie pelo menor passo concreto possível hoje.`,
      `Q2 (Abr–Jun): ${q2Action} Revise metas e ajuste a rota se necessário.`,
      `Q3 (Jul–Set): ${q3Action} Celebre conquistas parciais — elas importam.`,
      `Q4 (Out–Dez): Prepare a transição para o próximo ciclo. Identifique o que ficou incompleto e decida conscientemente: resolver ou soltar.`,
    ];

    for (const q of quarters) {
      y = wrapText(doc, `• ${q}`, margin, y, 168);
      y += 5;
    }
  }

  // ── CTA + Watermark ───────────────────────────────────────────────────────
  addWatermark(doc);
  renderCTAPage(doc, 'Relatório de Previsão Anual', 'R$ 34,90');
  addFooters(doc, options.profileName);

  return doc.output('blob');
}

// ============================================================
// T34 — RELACIONAMENTO (Sinastria + Compatibilidade)
// ============================================================

function renderCompatibilityBar(
  doc: jsPDF,
  label: string,
  score: number,
  x: number,
  y: number,
  barWidth = 120,
) {
  const filled = Math.round((score / 100) * barWidth);
  const barColor: [number, number, number] =
    score >= 70 ? COLORS.brand : score >= 50 ? COLORS.brandLight : COLORS.red;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text(label, x, y);

  // background track
  doc.setFillColor(...COLORS.line);
  doc.roundedRect(x + 38, y - 3.5, barWidth, 5, 2, 2, 'F');

  // filled portion
  doc.setFillColor(...barColor);
  if (filled > 0) doc.roundedRect(x + 38, y - 3.5, filled, 5, 2, 2, 'F');

  // percentage label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...barColor);
  doc.text(`${score}%`, x + 38 + barWidth + 4, y);
}

export function generateRelationshipPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;

  // ── PAGE 1: Cover ──────────────────────────────────────────
  const subtitle = options.partnerName
    ? `${options.profileName} & ${options.partnerName}`
    : 'Seu potencial amoroso';
  renderCover(doc, 'Relatório de Relacionamento', subtitle, options, '♡');

  // ── PAGE 2: Compatibilidade Score + Overview ───────────────
  doc.addPage();
  let y = 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Compatibilidade', margin, y);
  y += 3;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 2, 190, y + 2);
  y += 10;

  // Build synastry report if partner chart is provided
  let compat = {
    overall: 50, attraction: 50, communication: 50,
    emotion: 50, values: 50, growth: 50, description: '',
  };
  let overviewText = '';
  let themes: { title: string; icon: string; text: string; score: number }[] = [];

  if (options.partnerChart) {
    // Build a minimal SynastryChart from the two natal charts
    // The synastry aspects are cross-aspects (A planets vs B planets)
    const synastryChart: SynastryChart = {
      type: 'synastry',
      chartA: chart,
      chartB: options.partnerChart,
      aspects: buildSynastryAspects(chart, options.partnerChart),
    };
    const nameA = options.profileName;
    const nameB = options.partnerName || 'Parceiro(a)';
    const report = generateSynastryReport(synastryChart, nameA, nameB);
    compat = report.compatibility;
    overviewText = report.overview;
    themes = report.themes;
  } else {
    overviewText =
      'Adicione o mapa do seu parceiro(a) para ver a análise de sinastria completa. ' +
      'Enquanto isso, confira abaixo seu padrão amoroso individual.';
  }

  // Score geral — destaque central
  const overallColor: [number, number, number] =
    compat.overall >= 70 ? COLORS.brand : compat.overall >= 50 ? COLORS.brandLight : COLORS.red;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(...overallColor);
  doc.text(`${compat.overall}%`, 105, y + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text('compatibilidade geral', 105, y + 18, { align: 'center' });
  y += 28;

  // Barras por categoria
  const categories = [
    { label: 'Atração', score: compat.attraction },
    { label: 'Emoção', score: compat.emotion },
    { label: 'Comunicação', score: compat.communication },
    { label: 'Valores', score: compat.values },
  ];

  for (const cat of categories) {
    renderCompatibilityBar(doc, cat.label, cat.score, margin, y);
    y += 10;
  }

  y += 6;
  doc.setDrawColor(...COLORS.line);
  doc.line(margin, y, 190, y);
  y += 8;

  // Overview narrativo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brand);
  doc.text('Visão Geral', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, overviewText, margin, y, 170, 5.5);

  // ── PAGE 3: Temas de Sinastria ─────────────────────────────
  doc.addPage();
  y = 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.brand);
  doc.text('Temas do Relacionamento', margin, y);
  y += 3;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 2, 190, y + 2);
  y += 12;

  const displayThemes = themes.length > 0 ? themes.slice(0, 5) : getDefaultThemes();

  for (const theme of displayThemes) {
    if (y > 260) break;

    // Icon + título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.brand);
    doc.text(`${theme.icon}  ${theme.title}`, margin, y);

    // Score bar alinhada à direita
    const barX = 130;
    const barW = 50;
    const filled = Math.round((theme.score / 10) * barW);
    const barColor: [number, number, number] =
      theme.score >= 7 ? COLORS.brand : theme.score >= 5 ? COLORS.brandLight : COLORS.red;

    doc.setFillColor(...COLORS.line);
    doc.roundedRect(barX, y - 3.5, barW, 4.5, 2, 2, 'F');
    if (filled > 0) {
      doc.setFillColor(...barColor);
      doc.roundedRect(barX, y - 3.5, filled, 4.5, 2, 2, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...barColor);
    doc.text(`${theme.score}/10`, barX + barW + 3, y);

    y += 7;

    // Texto do tema
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, theme.text, margin, y, 170, 5.5);
    y += 8;

    // Separador leve entre temas
    doc.setDrawColor(...COLORS.line);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 3, 190, y - 3);
    y += 2;
  }

  // ── CTA + watermark + rodapés ──────────────────────────────
  addWatermark(doc);
  renderCTAPage(doc, 'Relatório de Relacionamento', 'R$ 39,90');
  addFooters(doc, options.profileName);

  return doc.output('blob');
}

// Temas padrão quando não há mapa do parceiro
function getDefaultThemes(): { title: string; icon: string; text: string; score: number }[] {
  return [
    { title: 'Atração e Química', icon: '🔥', score: 5,
      text: 'Adicione o mapa do(a) parceiro(a) para ver a análise de atração e química entre vocês.' },
    { title: 'Conexão Emocional', icon: '💙', score: 5,
      text: 'A profundidade emocional do relacionamento será calculada ao incluir o segundo mapa.' },
    { title: 'Comunicação', icon: '💬', score: 5,
      text: 'O ritmo mental e a facilidade de diálogo entre vocês aparecem na sinastria completa.' },
    { title: 'Crescimento Mútuo', icon: '🌱', score: 5,
      text: 'O potencial de crescimento compartilhado é visível nos aspectos entre os dois mapas.' },
    { title: 'Desafios', icon: '⚡', score: 5,
      text: 'Os pontos de atrito e transformação na relação surgem ao comparar os dois mapas.' },
  ];
}

// Constrói aspectos de sinastria cruzando planetas dos dois mapas
function buildSynastryAspects(chartA: NatalChart, chartB: NatalChart): Aspect[] {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;
  const aspects: Aspect[] = [];

  const ORBS: Record<string, number> = {
    conjunction: 8, opposition: 8, trine: 7, square: 7, sextile: 5,
  };

  for (const pA of planets) {
    const posA = chartA.positions[pA]?.longitude;
    if (posA === undefined) continue;

    for (const pB of planets) {
      const posB = chartB.positions[pB]?.longitude;
      if (posB === undefined) continue;

      let diff = Math.abs(posA - posB);
      if (diff > 180) diff = 360 - diff;

      const aspectAngles: { angle: number; type: string }[] = [
        { angle: 0,   type: 'conjunction' },
        { angle: 180, type: 'opposition' },
        { angle: 120, type: 'trine' },
        { angle: 90,  type: 'square' },
        { angle: 60,  type: 'sextile' },
      ];

      for (const { angle, type } of aspectAngles) {
        const orb = Math.abs(diff - angle);
        const maxOrb = ORBS[type] ?? 6;
        if (orb <= maxOrb) {
          const isHard = type === 'square' || type === 'opposition';
          aspects.push({
            planet1: pA,
            planet2: pB,
            type: type as Aspect['type'],
            angle,
            orb,
            exactness: 1 - orb / maxOrb,
            applying: false,
            nature: type === 'trine' || type === 'sextile' ? 'harmonic'
                  : isHard ? 'tense'
                  : 'neutral',
          });
          break;
        }
      }
    }
  }

  return aspects;
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
  const saturnHouseCareer = chart.planetHouses.saturn || 1;
  const saturnSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const jupiterHouseCareer = chart.planetHouses.jupiter || 1;
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
  doc.text(`♄ Saturno na Casa ${saturnHouseCareer} em ${SIGN_NAMES[saturnSign]}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const satText = SATURN_IN_HOUSE[saturnHouseCareer - 1] || '';
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
  doc.text(`♃ Júpiter na Casa ${jupiterHouseCareer} em ${SIGN_NAMES[jupiterSign]}`, margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Júpiter indica onde você tem "sorte" — na verdade, sabedoria já construída. Na Casa ${jupiterHouseCareer}, as oportunidades profissionais fluem com mais facilidade quando você se alinha com essa área.`, margin, y, 170);
  y += 5;
  const jupHouseText = JUPITER_IN_HOUSE[jupiterHouseCareer - 1] || '';
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
