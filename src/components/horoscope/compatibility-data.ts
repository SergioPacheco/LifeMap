// Zodiac signs: 0=Aries, 1=Taurus, 2=Gemini, 3=Cancer, 4=Leo, 5=Virgo,
//               6=Libra, 7=Scorpio, 8=Sagittarius, 9=Capricorn, 10=Aquarius, 11=Pisces

// Elements: Fire=Aries,Leo,Sag | Earth=Taurus,Virgo,Cap | Air=Gemini,Libra,Aqua | Water=Cancer,Scorpio,Pisces
const ELEMENT: Record<number, string> = {
  0: 'fire', 1: 'earth', 2: 'air', 3: 'water',
  4: 'fire', 5: 'earth', 6: 'air', 7: 'water',
  8: 'fire', 9: 'earth', 10: 'air', 11: 'water',
};

type CompatLevel = 'high' | 'good' | 'challenge' | 'neutral';

export interface CompatInfo {
  level: CompatLevel;
  text: string;
}

function elementPair(a: number, b: number): CompatLevel {
  const ea = ELEMENT[a];
  const eb = ELEMENT[b];
  if (ea === eb) return 'high';
  if ((ea === 'fire' && eb === 'air') || (ea === 'air' && eb === 'fire')) return 'good';
  if ((ea === 'earth' && eb === 'water') || (ea === 'water' && eb === 'earth')) return 'good';
  if ((ea === 'fire' && eb === 'water') || (ea === 'water' && eb === 'fire')) return 'challenge';
  if ((ea === 'earth' && eb === 'air') || (ea === 'air' && eb === 'earth')) return 'challenge';
  return 'neutral';
}

export const SIGNS = [
  { symbol: '♈', name: 'Áries' },
  { symbol: '♉', name: 'Touro' },
  { symbol: '♊', name: 'Gêmeos' },
  { symbol: '♋', name: 'Câncer' },
  { symbol: '♌', name: 'Leão' },
  { symbol: '♍', name: 'Virgem' },
  { symbol: '♎', name: 'Libra' },
  { symbol: '♏', name: 'Escorpião' },
  { symbol: '♐', name: 'Sagitário' },
  { symbol: '♑', name: 'Capricórnio' },
  { symbol: '♒', name: 'Aquário' },
  { symbol: '♓', name: 'Peixes' },
];

// 12x12 matrix of compatibility texts [from][to]
// Row = "Eu sou", Col = "Ele/Ela é"
const COMPAT_TEXTS: string[][] = [
  // 0 Aries
  [
    'Dois Arianos juntos formam uma chama dupla: apaixonados e competitivos, a vida nunca é monótona.',
    'Áries e Touro se atraem pelos opostos; ele dá estabilidade enquanto você dá faísca.',
    'Áries e Gêmeos vibram na mesma energia: aventura, conversas infinitas e muita risada.',
    'Áries acende, Câncer nutre — juntos encontram equilíbrio entre ação e cuidado.',
    'Áries e Leão são fogo puro: paixão intensa, admiração mútua e parceria grandiosa.',
    'Áries e Virgem se complementam: a impulsividade dele encontra o método dela.',
    'Áries e Libra são opostos magnéticos; a tensão se converte em atração irresistível.',
    'Áries e Escorpião: dois guerreiros que se fascinam e desafiam mutuamente.',
    'Áries e Sagitário são almas livres unidas pela chama da aventura e do otimismo.',
    'Áries e Capricórnio criam uma dupla ambiciosa, onde impulsividade e disciplina se equilibram.',
    'Áries e Aquário constroem uma parceria criativa cheia de ideias e independência.',
    'Áries e Peixes: ele sonha, você age — juntos transformam visões em realidade.',
  ],
  // 1 Taurus
  [
    'Touro e Áries: a paciência dele suaviza a impaciência de Áries, criando equilíbrio.',
    'Dois Touros juntos: sensualidade, conforto e lealdade inabalável. Um lar de paz.',
    'Touro e Gêmeos: a leveza dele anima a solidez de Touro, criando uma parceria estimulante.',
    'Touro e Câncer: dois signos que valorizam lar e família. Uma união profunda e nutritiva.',
    'Touro e Leão brilham juntos: ambos amam o prazer e a grandiosidade da vida.',
    'Touro e Virgem: dois signos de terra que constroem algo sólido e duradouro juntos.',
    'Touro e Libra: ambos regidos por Vênus, celebram a beleza, o amor e a harmonia.',
    'Touro e Escorpião: atração magnética entre opostos; profundidade emocional e sensualidade.',
    'Touro e Sagitário: diferentes no ritmo, mas se enriquecem mutuamente com novas perspectivas.',
    'Touro e Capricórnio: dois signos de terra que constroem juntos com paciência e ambição.',
    'Touro e Aquário: mundos distintos que, com respeito, criam algo único e surpreendente.',
    'Touro e Peixes: sensibilidade e sensualidade se fundem numa relação suave e romântica.',
  ],
  // 2 Gemini
  [
    'Gêmeos e Áries: os dois adoram movimento, novidade e conversas animadas.',
    'Gêmeos e Touro: ele ancora a inquietação de Gêmeos; você traz frescor ao cotidiano.',
    'Dois Gêmeos: estimulação mental infinita, humor e conexão intelectual raramente vista.',
    'Gêmeos e Câncer: mente e coração se encontram; ele sente o que você pensa.',
    'Gêmeos e Leão: energia vibrante, criatividade e paixão por estar no centro das atenções.',
    'Gêmeos e Virgem: dois mercurianos que se entendem com as palavras e a lógica.',
    'Gêmeos e Libra: dois signos de ar que fluem juntos em harmonia e diálogo constante.',
    'Gêmeos e Escorpião: a leveza dele desafia a intensidade de Escorpião, criando fascínio.',
    'Gêmeos e Sagitário: opostos que se atraem; a busca por verdade os une.',
    'Gêmeos e Capricórnio: visões diferentes do mundo que podem se tornar complementares.',
    'Gêmeos e Aquário: dois visionários do ar que nunca param de explorar e descobrir.',
    'Gêmeos e Peixes: imaginação e curiosidade se misturam numa relação etérea e criativa.',
  ],
  // 3 Cancer
  [
    'Câncer e Áries: ela age, você cuida — juntos criam um lar cheio de energia e amor.',
    'Câncer e Touro: dois amantes do lar que se nutrem com carinho e segurança.',
    'Câncer e Gêmeos: ele traz leveza, você traz profundidade; equilíbrio encantador.',
    'Dois Câncer: amor profundo, intuição compartilhada e forte vínculo emocional.',
    'Câncer e Leão: ele ilumina, você nutre — uma parceria calorosa e dedicada.',
    'Câncer e Virgem: cuidado e atenção aos detalhes criam uma relação estável e amorosa.',
    'Câncer e Libra: busca por harmonia em comum, embora com estilos diferentes de amor.',
    'Câncer e Escorpião: dois signos de água em fusão profunda e transformadora.',
    'Câncer e Sagitário: ele expande seus horizontes; você o ancora com ternura.',
    'Câncer e Capricórnio: opostos complementares que constroem juntos com afeto e disciplina.',
    'Câncer e Aquário: afeto versus liberdade — desafiador, mas enriquecedor com respeito.',
    'Câncer e Peixes: dois oceanos de emoção unidos numa relação quase telepática.',
  ],
  // 4 Leo
  [
    'Leão e Áries: paixão explosiva e admiração mútua entre dois espíritos corajosos.',
    'Leão e Touro: dois amantes do prazer que constroem uma vida luxuosa e estável.',
    'Leão e Gêmeos: criatividade e brilho social tornam essa dupla irresistível.',
    'Leão e Câncer: ele nutre sua coragem; você ilumina a vida dela com calor.',
    'Dois Leões: espetáculo, drama e amor grandioso — precisam dividir o palco.',
    'Leão e Virgem: ele brilha, ela organiza — juntos formam uma dupla eficaz.',
    'Leão e Libra: estética, charme e amor pela beleza os unem harmoniosamente.',
    'Leão e Escorpião: força e intensidade em colisão; fascinante e transformador.',
    'Leão e Sagitário: fogo e fogo — aventura, otimismo e paixão sem limites.',
    'Leão e Capricórnio: ambição em comum; um inspira, o outro estrutura.',
    'Leão e Aquário: opostos que se admiram; individualidade e coletividade em tensão criativa.',
    'Leão e Peixes: ele reina, ela encanta — uma parceria mística e apaixonada.',
  ],
  // 5 Virgo
  [
    'Virgem e Áries: ele age rápido, você refina — juntos são eficiência com resultados.',
    'Virgem e Touro: dois signos de terra em harmonia prática e sensual.',
    'Virgem e Gêmeos: mentes afiadas que se estimulam intelectualmente a todo momento.',
    'Virgem e Câncer: cuidado mútuo e atenção formam uma base sólida e amorosa.',
    'Virgem e Leão: ela organiza o brilho dele; ele inspira a praticidade dela.',
    'Dois Virgem: perfeccionismo compartilhado; precisam lembrar de relaxar e se divertir.',
    'Virgem e Libra: equilíbrio entre análise e harmonia; parceria refinada.',
    'Virgem e Escorpião: profundidade e análise se unem numa relação intensa e dedicada.',
    'Virgem e Sagitário: o detalhe encontra o panorama; perspectivas que se enriquecem.',
    'Virgem e Capricórnio: dois construtores de terra — disciplina e praticidade exemplares.',
    'Virgem e Aquário: lógica e inovação criam uma parceria intelectualmente estimulante.',
    'Virgem e Peixes: opostos complementares; o sonho dele ganha forma com ela.',
  ],
];

// Signs 6-11 rows (appended to COMPAT_TEXTS via push)
const COMPAT_TEXTS_REST: string[][] = [
  // 6 Libra
  [
    'Libra e Áries: opostos magnéticos que se equilibram com charme e determinação.',
    'Libra e Touro: Vênus os une em beleza, prazer e amor pela harmonia.',
    'Libra e Gêmeos: dois signos de ar em sintonia intelectual e social perfeita.',
    'Libra e Câncer: harmonia e cuidado se encontram com estilos distintos de amar.',
    'Libra e Leão: glamour, elegância e amor pelo belo criam uma dupla deslumbrante.',
    'Libra e Virgem: requinte e análise formam uma parceria equilibrada e refinada.',
    'Dois Libra: harmonia, beleza e diplomacia — precisam aprender a tomar decisões juntos.',
    'Libra e Escorpião: a leveza dela encontra a intensidade dele num contraste fascinante.',
    'Libra e Sagitário: aventura social e intelectual num relacionamento animado e livre.',
    'Libra e Capricórnio: ela traz charme, ele traz estrutura — parceria complementar.',
    'Libra e Aquário: dois signos de ar que idealizam um mundo melhor juntos.',
    'Libra e Peixes: romantismo e sensibilidade criam uma relação encantada e artística.',
  ],
  // 7 Scorpio
  [
    'Escorpião e Áries: dois guerreiros que se admiram e se desafiam apaixonadamente.',
    'Escorpião e Touro: atração magnética entre opostos; lealdade e sensualidade intensas.',
    'Escorpião e Gêmeos: profundidade versus leveza — curiosidade mútua e fascínio.',
    'Escorpião e Câncer: dois signos de água em fusão emocional profunda e transformadora.',
    'Escorpião e Leão: poder e intensidade; uma relação que exige respeito mútuo.',
    'Escorpião e Virgem: análise e profundidade se unem numa parceria dedicada.',
    'Escorpião e Libra: intensidade encontra harmonia; aprendem muito um com o outro.',
    'Dois Escorpião: intensidade ao extremo — transformação mútua ou batalha de vontades.',
    'Escorpião e Sagitário: profundidade e liberdade; precisam de espaço e respeito.',
    'Escorpião e Capricórnio: dois signos determinados que constroem com lealdade e ambição.',
    'Escorpião e Aquário: fixidez compartilhada; mundos distintos que se fascinam.',
    'Escorpião e Peixes: dois oceanos profundos numa relação mística e transformadora.',
  ],
  // 8 Sagittarius
  [
    'Sagitário e Áries: fogo e fogo — aventura, otimismo e paixão contagiante.',
    'Sagitário e Touro: ritmos diferentes; ele expande, ela estabiliza — equilíbrio possível.',
    'Sagitário e Gêmeos: opostos que se complementam na busca por conhecimento e liberdade.',
    'Sagitário e Câncer: ele abre horizontes; ela oferece o lar que ele precisa.',
    'Sagitário e Leão: dois signos de fogo em parceria grandiosa e entusiasta.',
    'Sagitário e Virgem: o detalhe encontra o panorama — perspectivas que crescem juntas.',
    'Sagitário e Libra: aventura social e intelectual com charme e elegância.',
    'Sagitário e Escorpião: liberdade e intensidade em tensão criativa e fascinante.',
    'Dois Sagitário: aventura infinita! Precisam criar raízes para não voar demais.',
    'Sagitário e Capricórnio: otimismo e pragmatismo se equilibram com bons resultados.',
    'Sagitário e Aquário: dois espíritos livres com visão de futuro e ideais elevados.',
    'Sagitário e Peixes: dois sonhadores que se inspiram e buscam um significado maior.',
  ],
  // 9 Capricorn
  [
    'Capricórnio e Áries: ambição em comum; impulsividade e disciplina se equilibram.',
    'Capricórnio e Touro: dois signos de terra construindo algo sólido e duradouro.',
    'Capricórnio e Gêmeos: realismo e criatividade numa parceria de mutuamente estimulante.',
    'Capricórnio e Câncer: opostos complementares; carreira e família em harmonia.',
    'Capricórnio e Leão: ambição e brilho; um estrutura enquanto o outro inspira.',
    'Capricórnio e Virgem: disciplina e praticidade criam uma parceria exemplar.',
    'Capricórnio e Libra: ela traz charme, ele traz estrutura — parceria equilibrada.',
    'Capricórnio e Escorpião: lealdade e determinação constroem uma relação poderosa.',
    'Capricórnio e Sagitário: realismo e otimismo se complementam na busca por crescimento.',
    'Dois Capricórnio: ambição e disciplina conjuntas — lembrem de relaxar e celebrar.',
    'Capricórnio e Aquário: tradição e inovação em tensão criativa e produtiva.',
    'Capricórnio e Peixes: ele ancora os sonhos dela; ela suaviza a rigidez dele.',
  ],
  // 10 Aquarius
  [
    'Aquário e Áries: inovação e ação formam uma dupla criativa e pioneira.',
    'Aquário e Touro: liberdade versus estabilidade; desafiador mas enriquecedor.',
    'Aquário e Gêmeos: dois visionários do ar em sintonia intelectual e social.',
    'Aquário e Câncer: liberdade e afeto em tensão; crescem aprendendo a ceder.',
    'Aquário e Leão: opostos que se admiram; individualidade versus coletividade.',
    'Aquário e Virgem: inovação e lógica criam uma parceria intelectualmente rica.',
    'Aquário e Libra: dois signos de ar que constroem um mundo mais justo e belo.',
    'Aquário e Escorpião: fixidez compartilhada; mundos distintos que se fascinam mutuamente.',
    'Aquário e Sagitário: dois espíritos livres e visionários em busca do futuro.',
    'Aquário e Capricórnio: inovação e tradição numa tensão criativa e produtiva.',
    'Dois Aquário: amizade profunda e ideais compartilhados — amor que parece de outro mundo.',
    'Aquário e Peixes: idealismo e sensibilidade criam uma relação etérea e humanista.',
  ],
  // 11 Pisces
  [
    'Peixes e Áries: ele transforma seus sonhos em ação — uma parceria que inspira.',
    'Peixes e Touro: sensualidade e romantismo criam uma relação suave e amorosa.',
    'Peixes e Gêmeos: imaginação e curiosidade se fundem numa relação criativa e etérea.',
    'Peixes e Câncer: dois oceanos de emoção em fusão quase telepática e profunda.',
    'Peixes e Leão: ele sonha, ela reina — mistura mística e apaixonada.',
    'Peixes e Virgem: opostos que se completam; o sonho ganha forma com a praticidade.',
    'Peixes e Libra: romantismo e beleza criam um relacionamento artístico e encantado.',
    'Peixes e Escorpião: profundidade mística numa das uniões mais intensas do zodíaco.',
    'Peixes e Sagitário: dois sonhadores em busca de significado e expansão espiritual.',
    'Peixes e Capricórnio: os sonhos dele ganham estrutura com ela; parceria nutritiva.',
    'Peixes e Aquário: idealismo compartilhado numa relação etérea e humanista.',
    'Dois Peixes: amor transcendente e fusão emocional; cuidado para não perder identidade.',
  ],
];

// Merge the two parts
COMPAT_TEXTS.push(...COMPAT_TEXTS_REST);

export function getCompatibility(from: number, to: number): CompatInfo {
  const text = COMPAT_TEXTS[from]?.[to] ?? 'Uma conexão única que merece ser explorada com abertura.';
  const level = from === to ? 'high' : elementPair(from, to);
  return { level, text };
}

export const LEVEL_COLORS: Record<CompatLevel, string> = {
  high: '#d4af37',
  good: '#7ec8a4',
  challenge: '#e07b54',
  neutral: '#8888aa',
};

export const LEVEL_LABELS: Record<CompatLevel, string> = {
  high: 'Alta Afinidade',
  good: 'Boa Compatibilidade',
  challenge: 'Desafiador & Instigante',
  neutral: 'Conexão Neutra',
};
