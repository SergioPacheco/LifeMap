// ============================================================
// RELATIONSHIP-TEXTS.TS — i18n texts for generateRelationshipPdf
// EN = complete base; PT = override; other locales fallback to EN
// ============================================================

export interface RelationshipTexts {
  overviewSubtitle: string;
  whatCoversTitle: string;
  whatCoversText: string;
  conclusionText: (nameA: string, nameB: string | null) => string;
  quote: string;
}

const EN: RelationshipTexts = {
  overviewSubtitle: 'Overview',
  whatCoversTitle: 'What This Report Covers',
  whatCoversText: 'This report analyzes 5 dimensions of the relationship: physical attraction and chemistry, emotional connection and security, communication style, value alignment and power dynamics, and potential for mutual growth. Each section combines both charts\' elements to reveal where the relationship has ease — and where challenges require conscious work.',
  conclusionText: (nameA, nameB) => `No natal chart predetermines the success or failure of a relationship. What astrology offers is a symbolic language to understand patterns — and patterns can be worked when seen with clarity.\n\nThis report revealed the central themes of the dynamic between ${nameA}${nameB ? ` and ${nameB}` : ''}: where there is natural ease, where challenges need attention, and how each person's individual patterns interact in the relationship.\n\nLove is not just feeling — it is a practice. Practice of presence, communication, growth and renewed choice. The best relationships are not those with fewer difficulties, but those that develop tools to traverse them together.\n\nUse this report as a starting point for honest conversations, not as a verdict. The chart points directions — you choose the path.`,
  quote: '"To love is to find in another\'s happiness one\'s own happiness." — Leibniz',
};

const PT: Partial<RelationshipTexts> = {
  overviewSubtitle: 'Visão Geral',
  whatCoversTitle: 'O Que Este Relatório Cobre',
  whatCoversText: 'Este relatório analisa 5 dimensões do relacionamento: atração e química física, conexão emocional e segurança, estilo de comunicação, alinhamento de valores e dinâmicas de poder, e potencial de crescimento mútuo. Cada seção combina os elementos dos dois mapas para revelar onde a relação tem mais facilidade — e onde os desafios pedem trabalho consciente.',
  conclusionText: (nameA, nameB) => `Nenhum mapa natal predetermina o sucesso ou fracasso de um relacionamento. O que a astrologia oferece é uma linguagem simbólica para entender padrões — e padrões podem ser trabalhados quando são vistos com clareza.\n\nEste relatório revelou os temas centrais da dinâmica entre ${nameA}${nameB ? ` e ${nameB}` : ''}: onde há facilidade natural, onde há desafios que pedem atenção, e como os padrões individuais de cada um interagem na relação.\n\nO amor não é apenas sentimento — é uma prática. Prática de presença, de comunicação, de crescimento e de escolha renovada. Os melhores relacionamentos não são os que têm menos dificuldades, mas os que desenvolvem ferramentas para atravessá-las juntos.\n\nUse este relatório como ponto de partida para conversas honestas, não como veredicto. O mapa aponta direções — vocês escolhem o caminho.`,
  quote: '"Amar é encontrar na felicidade de outrem a própria felicidade." — Leibniz',
};

// ============================================================
const TEXTS: Record<string, RelationshipTexts> = { en: EN };
TEXTS['pt'] = { ...EN, ...PT } as RelationshipTexts;

export function getRelationshipTexts(locale: string): RelationshipTexts {
  return TEXTS[locale] ?? TEXTS['en'];
}
