// ============================================================
// PSYCHOLOGICAL-TEXTS.TS — i18n texts for generatePsychologicalPdf
// EN = complete base; PT = override; other locales fallback to EN
// ============================================================

export interface PsychologicalTexts {
  coverSubtitle: string;
  intro: string;
  conclusionText: (name: string) => string;
  quote: string;
}

const EN: PsychologicalTexts = {
  coverSubtitle: 'Deep exploration of the psyche through the natal chart',
  intro: 'Psychological astrology — developed by Liz Greene, Howard Sasportas and others — starts from a simple and radical principle: the natal chart does not describe external events, but internal structures. Planets are psychic functions; signs, qualities of expression; houses, arenas of experience. When Mars is in Scorpio, it is not that destiny is "intensity and conflict" — it is that the function of action and desire (Mars) expresses itself with the quality of depth, strategy and intensity of Scorpio.',
  conclusionText: (name) => `${name}, this report has traversed the main layers of your psychological chart: ego structure, emotional world, relationship patterns, shadow, wound, unconscious, inherited patterns and paths of integration.\n\nWhat the chart reveals is not a judgment — it is an invitation. An invitation to know yourself with more precision, to work with recurring patterns, to develop what is still unexplored and to walk toward the purpose the North Node indicates.\n\nPsychological astrology does not replace psychotherapy — it complements it with a symbolic language that often accesses layers that direct words cannot reach. Use this report as a companion in the process — not as final authority.\n\nYou are more than your chart. The chart is the starting point, not the destination.`,
  quote: '"Know thyself." — inscription at the Temple of Delphi',
};

const PT: Partial<PsychologicalTexts> = {
  coverSubtitle: 'Exploração profunda da psique através do mapa natal',
  intro: 'A astrologia psicológica — desenvolvida por Liz Greene, Howard Sasportas e outros — parte de um princípio simples e radical: o mapa natal não descreve eventos externos, mas estruturas internas. Os planetas são funções psíquicas; os signos, qualidades de expressão; as casas, arenas da experiência. Quando Marte está em Escorpião, não é que o destino seja "intensidade e conflito" — é que a função de ação e desejo (Marte) se expressa com a qualidade de profundidade, estratégia e intensidade de Escorpião.',
  conclusionText: (name) => `${name}, este relatório percorreu as camadas principais do seu mapa psicológico: a estrutura do ego, o mundo emocional, os padrões de relacionamento, a sombra, a ferida, o inconsciente, os padrões herdados e os caminhos de integração.\n\nO que o mapa revela não é um julgamento — é um convite. Convite para conhecer-se com mais precisão, para trabalhar com os padrões que se repetem, para desenvolver o que ainda está inexplorado e para caminhar em direção ao propósito que o Nodo Norte indica.\n\nA psicologia astrológica não substitui a psicoterapia — ela a complementa com uma linguagem simbólica que muitas vezes acessa camadas que as palavras diretas não alcançam. Use este relatório como companheiro no processo — não como autoridade final.\n\nVocê é mais do que seu mapa. O mapa é o ponto de partida, não o destino.`,
  quote: '"Conhece-te a ti mesmo." — inscrição do templo de Delfos',
};

// ============================================================
const TEXTS: Record<string, PsychologicalTexts> = { en: EN };
TEXTS['pt'] = { ...EN, ...PT } as PsychologicalTexts;

export function getPsychologicalTexts(locale: string): PsychologicalTexts {
  return TEXTS[locale] ?? TEXTS['en'];
}
