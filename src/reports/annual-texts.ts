// ============================================================
// ANNUAL-TEXTS.TS — i18n texts for generateAnnualPdf
// EN = complete base; PT = override; other locales fallback to EN
// ============================================================

export interface AnnualTexts {
  profectionIntro: (age: number, profHouse: number, signSymbol: string, signName: string) => string;
  profectionHouse: string[];
  rulerOfYear: string[];
  workingThisYear: (profHouse: number) => string;
  eclipseTitle: (nnSign: string, snSign: string) => string;
  eclipseText: (nnSign: string, snSign: string, profHouse: number) => string;
  saturnTitle: (signName: string) => string;
  saturnIntro: (signName: string) => string;
  saturnWork: string;
  jupiterTitle: (signName: string) => string;
  jupiterIntro: (signName: string) => string;
  jupiterWork: string;
  criticalPeriodsTitle: string;
  criticalPeriods: Array<{ period: string; type: string; text: (signName: string) => string }>;
  quarterTitle: string;
  quarters: Array<{ q: string; recs: ((profHouse: number, satHouse: number, jupHouse: number) => string)[] }>;
  conclusion: (name: string, profHouse: number, profSign: string, rulerFirst: string, jupSign: string, satSign: string, nnSign: string, snSign: string) => string;
  quote: string;
  monthPhrases: string[];
  practicalTipsTitle: string;
  tipProfHouse: (profHouse: number) => string;
  tipReviewGoals: string;
  tipVenusActive: string;
  tipMercuryActive: string;
  tipJupiterActive: (jupHouse: number) => string;
  tipJupiterBackground: (jupSign: string) => string;
  saturnHouseSubtitle: (houseNum: number) => string;
  saturnSignSubtitle: (signName: string) => string;
  jupiterHouseSubtitle: (houseNum: number) => string;
  jupiterSignSubtitle: (signName: string) => string;
  profHouseSubtitle: (profHouse: number, signName: string) => string;
  rulerSubtitle: (signName: string) => string;
  workingSubtitle: string;
}

// ============================================================
// ENGLISH (BASE)
// ============================================================

const EN: AnnualTexts = {
  profectionIntro: (age, profHouse, signSymbol, signName) =>
    `At age ${age}, the annual profection activates your ${profHouse}th House — whose sign is ${signSymbol} ${signName}. This house commands the rhythm and dominant themes of the year. Every 12 months the wheel advances one house: from age 0 to 11 it traverses the full cycle and restarts. By identifying the activated house, you locate the "stage" where your story unfolds this period.`,

  profectionHouse: [
    'House 1 in profection marks a year of personal rebirth. Your identity takes center stage — the way you present yourself to the world undergoes a profound revision. A renewed impulse for autonomy, change of appearance or posture, and the desire to start something genuinely yours is common. The ruler of the year defines the "fuel" for this restart: if benefic, renewal flows with ease; if malefic, it demands conscious work and self-knowledge. This is a year of protagonism — put yourself first without guilt.',
    'House 2 in profection focuses on your relationship with money, personal resources and self-worth. This is a year to examine what you truly value — not just material goods, but what you believe you deserve. Financial movements, new income sources or spending reviews are recurring themes. Self-esteem and internal security are also activated: ask "what actually gives me security?" and act from there.',
    'House 3 in profection activates communication, learning, siblings and your immediate environment. A year of much mental movement, exchanges, courses, writing and short trips. The mind is accelerated and curious. Beware of dispersion — there are so many stimuli that maintaining focus requires discipline. Relationships with siblings or neighbors may gain relevance.',
    'House 4 in profection brings the home, family of origin and emotional roots to the center of the year. Changes of residence, family restructuring, or an internal call to care for your own emotional foundations are common. It is an introspective year — the external world loses strength and the internal world demands attention.',
    'House 5 in profection is one of the most vibrant periods of the cycle. Creativity, romance, children and pleasure are the central themes. There is a playful and expansive energy that pushes you to express, to risk, to love yourself. Creative projects gain natural momentum. Romances can arise or intensify.',
    'House 6 in profection calls attention to routine, daily work and health. A year of practical adjustments — reviewing habits, organizing your schedule, improving processes at work. The body asks for more care: nutrition, sleep, exercise and prevention enter the radar.',
    'House 7 in profection is the year of partnerships. Love and professional relationships take center stage. It is common to formalize a bond (marriage, partnership), end one that no longer serves, or have significant encounters with people who change your course.',
    'House 8 in profection is one of the most intense and transformative years of the cycle. Themes of symbolic death, inheritance, debts, deep sexuality and shared power enter the scene. What is no longer serving needs to be released — and Pluto, natural ruler of this house, does not usually ask permission.',
    'House 9 in profection activates expansion, faith, philosophy, long travels and higher studies. A year of opening horizons — intellectual, geographical or spiritual. The search for meaning and significance intensifies.',
    'House 10 in profection puts career and public reputation in the spotlight. A year of visibility — for better or worse. Promotions, role changes, public recognition or image crises are possible. What you build professionally this year can last decades — act with intention and strategy.',
    'House 11 in profection activates groups, friendships, collective projects and dreams of the future. A year turned toward the social and toward what you want to build beyond yourself. New circles, group projects, social causes or technology may gain relevance.',
    'House 12 in profection is the year of retreat, inner processing and conclusion of cycles. External energy diminishes and inner life intensifies. Dreams, intuitions, retreats, therapy and spiritual practices gain strength. Unresolved issues from the past may emerge — not to punish, but to be integrated before the new cycle.',
  ],

  rulerOfYear: [
    'Mars is the ruler of the year. This brings energy, impulsiveness and courage to the period — but can also bring conflicts and impatience. Follow Mars transits through your natal chart: when it aspects important planets, events accelerate. Direct and decisive action is the keyword.',
    'Venus is the ruler of the year. Themes of affection, beauty, money and personal values permeate the period. When Venus forms aspects in your chart, relationships and finances gain movement. A favorable year for creating, negotiating and cultivating bonds.',
    'Mercury is the ruler of the year. The mind takes center stage — communication, decisions, contracts and learning define the rhythm. Pay attention to Mercury retrograde periods: they tend to bring revisions in the areas activated by profection.',
    'The Moon is the ruler of the year. Emotions, cycles and intuition guide the period. The year\'s rhythm follows the lunar calendar — lunations aspecting your natal planets mark turning points. A more internal year where listening to instinct has more value than following rigid plans.',
    'The Sun is the ruler of the year. Your identity and purpose are at the center — a year of expression, leadership and visibility. Periods when the Sun transits over your natal planets mark moments of clarity and impulse. Shine without asking permission.',
    'Mercury is the ruler of the year. With Mercury in Virgo — its domicile — analytical and organizing energy is high. Details matter, processes can be optimized. Mercury retrogrades deserve special attention this year.',
    'Venus is the ruler of the year. In Libra, its domicile, Venus brings a year favorable for relationships, agreements and harmony. Professional and love partnerships have special potential. Use this cycle to seal bonds that matter.',
    'Mars and Pluto co-rule the year. It is an intense combination: Mars brings action and direct confrontation; Pluto brings deep transformation and power. Together they create a year of strength — but also pressure. Precision overcomes brute force.',
    'Jupiter is the ruler of the year. Expansion, optimism and opportunities mark the period. A favorable year for growth, but beware of excess — Jupiter amplifies everything, including mistakes. Enjoy, but keep your feet on the ground.',
    'Saturn is the ruler of the year. Discipline, structure and responsibility define the cycle. What you build now with patience and method will last decades. Demands and limits appear to teach, not to punish.',
    'Saturn and Uranus co-rule the year. The tension between keeping vs. changing is the central theme. Moments of instability may arise, but they bring liberation from stagnation. Innovation within limits is the key.',
    'Jupiter and Neptune co-rule the year. Dreams gain strength, but the limits of reality need to be respected. Creativity, spirituality and compassion flow. Intuition and faith are allies, as long as anchored in concrete action.',
  ],

  workingThisYear: (profHouse) =>
    `With House ${profHouse} activated, your attention should focus on the themes of that life sphere. Schedule monthly reviews to check where you are investing energy and whether you are aligned with the year\'s theme. The annual chart does not determine destiny — it reveals the terrain. You choose how to traverse it. Use lunations (New Moon and Full Moon) as monthly markers: plant on New Moons and harvest/review on Full Moons. Record notable events in a journal to map the complete pattern by year\'s end.`,

  eclipseTitle: (nnSign, snSign) => `Eclipses of the Year — ${nnSign}/${snSign} Axis`,

  eclipseText: (nnSign, snSign, profHouse) =>
    `The eclipses of the year occur on the ${nnSign}–${snSign} axis, activating the corresponding houses in your natal chart. Solar eclipses (New Moon) open portals of accelerated and irreversible new beginnings. Lunar eclipses (Full Moon) reveal and conclude — what was hidden comes to the surface. Pay special attention to eclipses that fall within 5° of any of your natal planets or angles: these are the most significant turning points.\n\nThe North Node in ${nnSign} points to where collective evolution (and your individual one) is calling. The South Node in ${snSign} represents what has already been integrated — resources to use, but not to settle into.\n\nEclipses in your House ${profHouse} or the opposite house carry special weight this year, reinforcing the profection theme. When eclipse and profection coincide in the same area, the year has a "destiny acceleration" — events that would normally take 2-3 years compress into weeks.`,

  saturnTitle: (signName) => `♄ Saturn in ${signName} — The Year's Lesson`,
  saturnIntro: (signName) =>
    `Saturn is the planet of time, structure and responsibility. Wherever it is in the sky, it demands maturity and rewards those who accept working with patience. In ${signName}, the Saturnian theme takes the specific coloring of that sign — and when it aspects your natal chart, the effect becomes personal and intense.`,
  saturnWork: `Saturn does not punish — it structures. The most difficult periods with Saturn are generally the most productive in retrospect. Identify where you have been avoiding responsibility and face that point with method. Create systems: small, consistent daily habits produce more results than large sporadic efforts. When Saturn transits a sensitive point in your chart, ask: "what needs to be genuinely built here?". Answer with concrete action, not theory.`,

  jupiterTitle: (signName) => `♃ Jupiter in ${signName} — The Year's Expansion`,
  jupiterIntro: (signName) =>
    `Jupiter is the planet of expansion, faith and opportunities. Wherever it is in the sky, it opens doors and amplifies what it touches. In ${signName}, expansion takes the quality of that sign. Jupiter stays about 1 year in each sign — seize the window while it is open.`,
  jupiterWork: `Jupiter favors those who act with confidence and dare to grow. Identify where you have been contracting unnecessarily and take a step beyond what seems safe. The risk with Jupiter is excess — amplifying without criteria can generate expenses, commitments or promises that later weigh. Use Jupiterian expansion with intention: growth that serves your purpose, not growth for growth's sake.`,

  criticalPeriodsTitle: 'Critical Periods and Windows of Opportunity',
  criticalPeriods: [
    { period: 'January–February', type: 'opportunity', text: (jupSign) => `Start of the year with renewal energy. Jupiter in ${jupSign} favors expansion in the areas you prioritize now. Define intentions precisely — what you plant in this period has the strength to grow throughout the year.` },
    { period: 'March–April', type: 'attention', text: () => `Mars transits can bring acceleration or conflict. This is a period of action — but action needs to be directed, not impulsive. Conflicts that arise are invitations to clarify boundaries and direction.` },
    { period: 'May–June', type: 'opportunity', text: () => `Partial harvest period of early-year seeds. Venus favors relationships and negotiations. Ideal for revisiting agreements, formalizing partnerships and advancing creative projects.` },
    { period: 'July–August', type: 'reflection', text: () => `Review and introspection period. Retrograde planets may slow the pace — use that slowness to evaluate the first half. What worked? What needs adjustment? Don't force new beginnings now; consolidate what is underway.` },
    { period: 'September–October', type: 'opportunity', text: () => `Second major window of the year. Saturn and Jupiter begin preparing for important transits. Actions taken now have direct impact on the next cycle.` },
    { period: 'November–December', type: 'conclusion', text: () => `Cycle closure. What was not completed needs resolution — not next year. Saturn concludes demands and allows release of what was worked with responsibility. Plan the next year with clarity.` },
  ],

  quarterTitle: 'Practical Recommendations by Quarter',
  quarters: [
    { q: 'Q1 — January, February, March', recs: [
      (profHouse) => `Define 3 intentions aligned with House ${profHouse} and record them in a journal.`,
      () => 'Start the routine of following New Moon (planting) and Full Moon (harvest).',
      (_ph, _sh, jupHouse) => `Identify where Jupiter (House ${jupHouse}) can bring opportunity and act.`,
      () => 'Create a basic financial system if you don\'t have one yet — this quarter sets the year\'s rhythm.',
    ]},
    { q: 'Q2 — April, May, June', recs: [
      () => 'Review Q1 intentions: what advanced? What needs more energy?',
      () => 'Work on relationship issues (House 7) if there is accumulated tension.',
      () => 'Invest in education: Jupiter favors learning with consistent return.',
      () => 'Do a physical and energetic cleaning of your workspace or home.',
    ]},
    { q: 'Q3 — July, August, September', recs: [
      () => 'Evaluate the semester without excessive self-criticism — progressing is enough.',
      (_ph, satHouse) => `If Saturn is active in your House ${satHouse}, this quarter demands extra discipline.`,
      () => 'Resume paused projects with renewed September energy.',
      () => 'Prepare a goals map for the last 3 months of the year.',
    ]},
    { q: 'Q4 — October, November, December', recs: [
      () => 'Close what remained incomplete — don\'t drag emotional or practical debts into next year.',
      () => 'Celebrate the year\'s achievements: what you built deserves recognition.',
      (profHouse) => `Prepare for the next profection: House ${(profHouse % 12) + 1} will be activated on your next birthday.`,
      () => 'Rest in December — recharging is as strategic as acting.',
    ]},
  ],

  conclusion: (name, profHouse, profSign, rulerFirst, jupSign, satSign, nnSign, snSign) =>
    `${name}, this is a year of ${profSign}-themed growth and transformation. The map does not define what will happen — it reveals the terrain you will traverse and the forces that will be active. You are the protagonist of this story.\n\nThe profection of House ${profHouse} in ${profSign} asks you to direct conscious energy toward that area's themes. The ruler of the year — ${rulerFirst} — defines the tone and the main resource available.\n\nJupiter in ${jupSign} offers expansion where you commit to growing. Saturn in ${satSign} demands structure and rewards methodical builders. Eclipses bring acceleration in the ${nnSign}–${snSign} axis areas.\n\nUse this report as a compass — not as a fixed destination. Revisiting it monthly, noting how real events relate to the forecasts, is one of the most powerful self-knowledge practices astrology offers. The map is yours — and so is the journey.`,

  quote: '"The stars incline, they do not compel." — maxim of humanistic astrology',

  monthPhrases: [
    'Action defines destiny.', 'Value creates value.', 'An open mind attracts connections.', 'Roots sustain flight.',
    'Creativity is courage.', 'Discipline is freedom.', 'Partnership reveals purpose.', 'Transformation is necessary.',
    'Horizons expand for those who walk.', 'Visibility requires integrity.', 'The collective strengthens the individual.', 'Silence is wisdom.',
  ],

  practicalTipsTitle: 'Practical Tips',
  tipProfHouse: (profHouse) => `Focus on House ${profHouse} themes — they define the month's context.`,
  tipReviewGoals: 'Review goals and record progress in your astral journal.',
  tipVenusActive: 'Attention to Venus aspects: relationships and finances in movement.',
  tipMercuryActive: 'Mercury active: communications and decisions flow faster.',
  tipJupiterActive: (jupHouse) => `Jupiter activates your House ${jupHouse} — window of opportunity this month.`,
  tipJupiterBackground: (jupSign) => `Jupiter in ${jupSign} sustains expansion in the background.`,
  saturnHouseSubtitle: (houseNum) => `Saturn in your natal House ${houseNum}`,
  saturnSignSubtitle: (signName) => `Saturn in ${signName} — Expression of the Challenge`,
  jupiterHouseSubtitle: (houseNum) => `Jupiter in your natal House ${houseNum}`,
  jupiterSignSubtitle: (signName) => `Jupiter in ${signName} — Tone of Expansion`,
  profHouseSubtitle: (profHouse, signName) => `House ${profHouse} in Focus — ${signName}`,
  rulerSubtitle: (signName) => `Ruler of the Year — ${signName}`,
  workingSubtitle: 'How to Work This Year',
};

// ============================================================
// PORTUGUESE (OVERRIDE)
// ============================================================

const PT: Partial<AnnualTexts> = {
  profectionIntro: (age, profHouse, signSymbol, signName) =>
    `Aos ${age} anos, a profecção anual ativa sua Casa ${profHouse} — cujo signo é ${signSymbol} ${signName}. Esta é a casa que comanda o ritmo e os temas dominantes do ano. Cada 12 meses, a roda avança uma casa: dos 0 aos 11 anos percorre o ciclo completo e reinicia. Ao identificar a casa ativada, você localiza o "palco" onde a sua história se desenrola neste período.`,

  profectionHouse: [
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
  ],

  rulerOfYear: [
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
  ],

  workingThisYear: (profHouse) =>
    `Com a Casa ${profHouse} ativada, sua atenção deve se concentrar nos temas dessa esfera da vida. Agende revisões mensais para verificar onde está investindo energia e se está alinhado ao tema do ano. O mapa anual não determina o destino — ele revela o terreno. Você escolhe como percorrê-lo. Use as lunações (Lua Nova e Lua Cheia) como balizas mensais: plante nas novas e colha/revise nas cheias. Registre em diário os eventos marcantes para, ao final do ano, mapear o padrão completo.`,

  eclipseTitle: (nnSign, snSign) => `Eclipses do Ano — Eixo ${nnSign}/${snSign}`,

  eclipseText: (nnSign, snSign, profHouse) =>
    `Os eclipses de 2026 ocorrem no eixo ${nnSign}–${snSign}, ativando as casas correspondentes do seu mapa natal. Eclipses solares (Lua Nova) abrem portais de novos começos acelerados e irreversíveis. Eclipses lunares (Lua Cheia) revelam e concluem — o que estava oculto vem à superfície. Fique especialmente atento a eclipses que caem a menos de 5° de algum dos seus planetas ou ângulos natais: esses são os pontos de virada mais significativos da sua história pessoal neste ano.\n\nO Nodo Norte em ${nnSign} aponta para onde a evolução coletiva (e a sua individual) está chamando. O Nodo Sul em ${snSign} representa o que já foi integrado — recursos a usar, mas não nos quais se acomodar. Trabalhar ativamente com o eixo nodal é uma das práticas mais transformadoras da astrologia de trânsitos.\n\nEclipses em sua Casa ${profHouse} ou na casa oposta têm peso especial este ano, pois reforçam o tema da profecção. Quando eclipse e profecção coincidem na mesma área, o ano tem uma "aceleração de destino" — eventos que normalmente tomariam 2-3 anos se comprimem em semanas. Prepare-se para mudanças rápidas e confie no processo, mesmo quando parecer desordenado.`,

  saturnTitle: (signName) => `♄ Saturno em ${signName} — A Lição do Ano`,
  saturnIntro: (signName) =>
    `Saturno é o planeta do tempo, da estrutura e da responsabilidade. Onde quer que esteja no céu, ele cobra maturidade e recompensa quem aceita trabalhar com paciência. Em ${signName}, o tema saturniano ganha a coloração específica desse signo — e quando aspecta seu mapa natal, o efeito se torna pessoal e intenso.`,
  saturnWork: `Saturno não pune — estrutura. Os períodos mais difíceis com Saturno são geralmente os mais produtivos em retrospecto. Identifique onde você tem evitado responsabilidade e enfrente esse ponto com método. Crie sistemas: hábitos diários pequenos e consistentes produzem mais resultado do que grandes esforços esporádicos. Quando Saturno transita um ponto sensível do seu mapa, é hora de perguntar: "o que precisa ser construído aqui, de verdade?". Responda com ação concreta, não com teoria.`,

  jupiterTitle: (signName) => `♃ Júpiter em ${signName} — A Expansão do Ano`,
  jupiterIntro: (signName) =>
    `Júpiter é o planeta da expansão, da fé e das oportunidades. Onde quer que esteja no céu, ele abre portas e amplifica o que toca. Em ${signName}, a expansão ganha a qualidade desse signo. Júpiter fica cerca de 1 ano em cada signo — aproveite a janela enquanto ela está aberta.`,
  jupiterWork: `Júpiter favorece quem age com confiança e se arrisca a crescer. Identifique onde você tem se contraído desnecessariamente e dê um passo além do que parece seguro. O risco com Júpiter é o excesso — ampliar sem critério pode gerar gastos, compromissos ou promessas que depois pesam. Use a expansão jupiteriana com intenção: crescimento que serve ao seu propósito, não crescimento por crescimento. Quando Júpiter aspecta seus planetas natais, essas são as semanas douradas do ano — marque no calendário e aja nessas janelas.`,

  quote: '"O astro inclina, não obriga." — máxima da astrologia humanista',

  monthPhrases: [
    'Ação define destino.', 'Valor gera valor.', 'A mente aberta atrai conexões.', 'Raízes sustentam voo.',
    'Criatividade é coragem.', 'Disciplina é liberdade.', 'Parceria revela propósito.', 'Transformação é necessária.',
    'Horizontes se expandem para quem caminha.', 'Visibilidade requer integridade.', 'Coletivo fortalece o individual.', 'Silêncio é sabedoria.',
  ],

  practicalTipsTitle: 'Dicas Práticas',
  tipProfHouse: (profHouse) => `Foque nos temas da Casa ${profHouse} — eles definem o contexto do mês.`,
  tipReviewGoals: 'Revise metas e registre progresso no diário astral.',
  tipVenusActive: 'Atenção a aspectos de Vênus: relacionamentos e finanças em movimento.',
  tipMercuryActive: 'Mercúrio ativo: comunicações e decisões fluem mais rápido.',
  tipJupiterActive: (jupHouse) => `Júpiter ativa sua Casa ${jupHouse} — janela de oportunidade este mês.`,
  tipJupiterBackground: (jupSign) => `Júpiter em ${jupSign} sustenta expansão em segundo plano.`,
  saturnHouseSubtitle: (houseNum) => `Saturno em sua Casa ${houseNum} natal`,
  saturnSignSubtitle: (signName) => `Saturno em ${signName} — Expressão do Desafio`,
  jupiterHouseSubtitle: (houseNum) => `Júpiter em sua Casa ${houseNum} natal`,
  jupiterSignSubtitle: (signName) => `Júpiter em ${signName} — Tom da Expansão`,
  profHouseSubtitle: (profHouse, signName) => `Casa ${profHouse} em Foco — ${signName}`,
  rulerSubtitle: (signName) => `Regente do Ano — ${signName}`,
  workingSubtitle: 'Como Trabalhar Este Ano',
};

// ============================================================
// BUILD + EXPORT
// ============================================================

const TEXTS: Record<string, AnnualTexts> = { en: EN };

function buildAnnualLocale(overrides: Partial<AnnualTexts>): AnnualTexts {
  return { ...EN, ...overrides };
}

TEXTS['pt'] = buildAnnualLocale(PT);
// Other locales fallback to EN by default via getAnnualTexts()

/**
 * Get localized annual report texts.
 * Usage: const at = getAnnualTexts(options.locale);
 */
export function getAnnualTexts(locale: string): AnnualTexts {
  return TEXTS[locale] ?? TEXTS['en'];
}
