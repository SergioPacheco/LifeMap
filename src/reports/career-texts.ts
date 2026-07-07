// ============================================================
// CAREER-TEXTS.TS — i18n texts for generateCareerPdf
// EN = complete base; PT = override; other locales fallback to EN
// ============================================================

export interface CareerTexts {
  coverSubtitle: string;
  mcOverviewIntro: string;
  h10Title: (signName: string) => string;
  h10Intro: (signName: string) => string;
  h10NoPlanets: (signName: string) => string;
  h6Title: (signName: string) => string;
  h6Intro: string;
  h6SubTitle: (signName: string) => string;
  h6HealthTitle: string;
  h6HealthText: string;
  h2Title: (signName: string) => string;
  h2Intro: string;
  h2SubTitle: (signName: string) => string;
  saturnTitle: (house: number, signName: string) => string;
  saturnIntro: string;
  saturnReturnTitle: string;
  saturnReturnText: string;
  jupiterTitle: (house: number, signName: string) => string;
  jupiterIntro: string;
  jupiterCycleTitle: string;
  jupiterCycleText: string;
  sunTitle: (signName: string, house: number) => string;
  sunIntro: string;
  sunHouseText: (house: number) => string;
  marsTitle: (signName: string, house: number) => string;
  marsIntro: string;
  mercuryTitle: (signName: string, house: number) => string;
  mercuryIntro: string;
  talentsIntro: string;
  talentsNoAspects: string;
  challengesIntro: string;
  timingTitle: string;
  timingIntro: string;
  saturnPhasesTitle: string;
  jupiterPhasesTitle: string;
  jupiterPhasesText: string;
  suggestionsTitle: string;
  suggestionsIntro: string;
  suggestionsOutro: string;
  conclusionText: (name: string, mcSign: string, satHouse: number, jupHouse: number, sunSign: string, marsSign: string, mercSign: string) => string;
  quote: string;
}

const EN: CareerTexts = {
  coverSubtitle: 'Professional purpose revealed by the chart',
  mcOverviewIntro: 'The Midheaven (MC) is the highest point of the chart — it represents your public vocation, the mark you leave on the world and the type of recognition you seek. It is not just "which profession to follow" — it is "what is the tone of your presence in the professional world". The MC sign defines the quality of that presence; the planets that aspect it define the resources and challenges.',
  h10Title: (s) => `House 10 in ${s} — Vocation and Recognition`,
  h10Intro: (s) => `House 10 is where you seek recognition and build reputation. With the cusp in ${s}, your public presence style and the type of recognition you receive — and seek — carry the quality of this sign. Planets in House 10 intensify and qualify that presence.`,
  h10NoPlanets: (s) => `Without planets in House 10, the cusp ruler (the planet that governs ${s}) primarily defines the career tone. Follow transits to the ruler to identify moments of greatest professional movement.`,
  h6Title: (s) => `House 6 in ${s} — Routine and Work Environment`,
  h6Intro: 'While House 10 speaks of the career peak — recognition and purpose —, House 6 speaks of the day-to-day: how you work, what type of environment sustains you, the relationship with colleagues and subordinates, and the connection between work and health.',
  h6SubTitle: (s) => `House 6 in ${s} — Your Ideal Environment`,
  h6HealthTitle: 'Health and Work — A Direct Relationship',
  h6HealthText: 'House 6 governs both work routine and physical health. There is a direct relationship between these two domains: when work is aligned with your values and natural rhythm, health tends to be more robust. When there is chronic misalignment, the body is usually the first to warn.',
  h2Title: (s) => `House 2 in ${s} — Money and Resources`,
  h2Intro: 'House 2 governs your relationship with money, personal resources and what you consider valuable. It not only indicates earning potential — it reveals your financial mindset: how you earn, save, spend and what beliefs about money you carry since childhood.',
  h2SubTitle: (s) => `House 2 in ${s} — Your Financial Pattern`,
  saturnTitle: (h, s) => `♄ Saturn in House ${h} in ${s} — Discipline and Solid Career`,
  saturnIntro: 'Saturn is the planet of solid career — what demands time, discipline and method, but produces lasting results. Natal Saturn\'s position reveals where you have the most work to do professionally, and simultaneously where you can build the most robust part of your trajectory.',
  saturnReturnTitle: 'Saturn and the Saturn Return',
  saturnReturnText: 'Around ages 28-30 and again at 58-60, Saturn returns to its natal point — the "Saturn Return." This is one of the most important transits for career: it consolidates what was built with integrity and reveals what was built on sand.',
  jupiterTitle: (h, s) => `♃ Jupiter in House ${h} in ${s} — Expansion and Opportunities`,
  jupiterIntro: 'Natal Jupiter indicates where "luck" — actually, accumulated wisdom and openness to growth — flows most easily. In career, Jupiter marks sectors where opportunities appear more naturally and where growth has less resistance.',
  jupiterCycleTitle: 'Jupiter Cycle in Career',
  jupiterCycleText: 'Jupiter orbits the Sun in approximately 12 years. Each time it returns to the natal sign, there is a particular period of expansion and opportunity. When Jupiter transits House 10, career expands visibly. When it transits House 2, resources grow.',
  sunTitle: (s, h) => `☉ Sun in ${s} in House ${h} — Where You Shine`,
  sunIntro: 'The Sun in the career chart indicates where and how you shine professionally — the type of role that brings the most vitality, the environment where your energy flows naturally.',
  sunHouseText: (h) => `Sun in House ${h} indicates that vital and creative energy manifests most strongly in that house's themes. In career, this means projects and roles related to House ${h} tend to be more energizing.`,
  marsTitle: (s, h) => `♂ Mars in ${s} in House ${h} — How You Lead and Compete`,
  marsIntro: 'Mars determines how you compete, how you act under pressure, what type of challenge motivates you and how you handle professional conflicts.',
  mercuryTitle: (s, h) => `☿ Mercury in ${s} in House ${h} — Intellectual Skills`,
  mercuryIntro: 'Professional Mercury is the planet of mental and communicative skills — how you learn, communicate, what information you process easily and where your intellectual edge lies.',
  talentsIntro: 'Trines and sextiles in the natal chart indicate natural flow — skills that come without apparent effort. These points are frequently underestimated precisely because they are easy. Identifying and deliberately developing your natural talents can be the path of least resistance to professional success.',
  talentsNoAspects: 'Your natural talents are primarily in the conjunctions and qualities of your dominant planets. A deeper analysis of planets in their domiciles or exaltations reveals where your energy flows most easily.',
  challengesIntro: 'Tense aspects do not indicate professional failure — they indicate areas needing more conscious work. Often, the chart\'s greatest challenges are also the greatest learning points.',
  timingTitle: 'Change Timing — Saturn and Jupiter Cycles',
  timingIntro: 'Career astrology is powerful not only for understanding aptitudes, but for identifying the right moments for change. Saturn (~29 year cycle) and Jupiter (~12 year cycle) are the great professional time markers.',
  saturnPhasesTitle: 'Saturn Cycle Phases in Career',
  jupiterPhasesTitle: 'Jupiter Cycle Phases in Career',
  jupiterPhasesText: 'Jupiter takes ~12 years to complete its cycle. When it transits your House 10, there is visible career expansion. When it transits House 2, financial growth. When it transits House 6, daily work opportunities. Each Jupiter transit lasts about 1 year — these are the golden windows for bold action.',
  suggestionsTitle: 'Suggested Professions by Sign and House',
  suggestionsIntro: 'The suggestions below are based on your MC, Sun, Saturn and Jupiter combination. They are directions, not prescriptions — the chart indicates affinities and potentials, but the final choice is always yours.',
  suggestionsOutro: 'These suggestions are starting points for reflection. Combine them with what you naturally love doing, what the market needs, and what generates sufficient income. The intersection of these three spheres is the most fertile ground for a sustainable and meaningful career.',
  conclusionText: (name, mcSign, satHouse, jupHouse, sunSign, marsSign, mercSign) =>
    `${name}, your career map reveals a unique combination of vocation, talent and timing. The MC in ${mcSign} defines the general direction; Saturn in House ${satHouse} indicates where hard work produces lasting results; Jupiter in House ${jupHouse} reveals where opportunities flow most naturally.\n\nThe Sun in ${sunSign} defines where you genuinely shine. Mars in ${marsSign} determines how you act and compete. Mercury in ${mercSign} defines your intellectual edge.\n\nThe ideal career is not the most glamorous or lucrative — it is the one that activates your natural talents, honors your values and evolves with you. Use this report as a compass, not a fixed destination.`,
  quote: '"Choose a job you love and you will never have to work a day in your life." — Confucius',
};

const PT: Partial<CareerTexts> = {
  coverSubtitle: 'Propósito profissional revelado pelo mapa',
  mcOverviewIntro: 'O Meio do Céu (MC) é o ponto mais alto do mapa — representa sua vocação pública, a marca que você deixa no mundo e o tipo de reconhecimento que busca. Não é apenas "que profissão seguir" — é "qual o tom da sua presença no mundo profissional". O signo do MC define a qualidade dessa presença; os planetas que o aspectam definem os recursos e desafios.',
  h10Title: (s) => `Casa 10 em ${s} — Vocação e Reconhecimento`,
  h10Intro: (s) => `A Casa 10 é onde você busca reconhecimento e onde constrói reputação. Com a cúspide em ${s}, o estilo de sua presença pública e o tipo de reconhecimento que você recebe — e busca — carregam a qualidade deste signo. Planetas na Casa 10 intensificam e qualificam essa presença.`,
  h10NoPlanets: (s) => `Sem planetas na Casa 10, o regente da cúspide (o planeta que governa ${s}) define principalmente o tom da carreira. Acompanhe os trânsitos pelo regente para identificar os momentos de maior movimento profissional.`,
  h6Title: (s) => `Casa 6 em ${s} — Rotina e Ambiente de Trabalho`,
  h6Intro: 'Enquanto a Casa 10 fala do pico da carreira — o reconhecimento e o propósito —, a Casa 6 fala do dia a dia: como você trabalha, que tipo de ambiente te sustenta, a relação com colegas e subordinados, e a conexão entre trabalho e saúde. Você pode ter o propósito mais elevado no MC, mas se a rotina diária não for sustentável, o desempenho sofre.',
  h6SubTitle: (s) => `Casa 6 em ${s} — Seu Ambiente Ideal`,
  h6HealthTitle: 'Saúde e Trabalho — Uma Relação Direta',
  h6HealthText: 'A Casa 6 governa tanto a rotina de trabalho quanto a saúde física. Há uma relação direta entre esses dois domínios: quando o trabalho está alinhado com seus valores e ritmo naturais, a saúde tende a ser mais robusta. Quando há desalinhamento crônico — trabalho que drena, ambiente tóxico, tarefas que contradizem seus valores —, o corpo costuma ser o primeiro a avisar. Prestar atenção aos sinais físicos como feedback profissional é uma das práticas mais valiosas para quem tem consciência astrológica.',
  h2Title: (s) => `Casa 2 em ${s} — Dinheiro e Recursos`,
  h2Intro: 'A Casa 2 governa sua relação com dinheiro, recursos próprios e o que você considera valioso. Ela não apenas indica potencial de ganho — revela seu mindset financeiro: como você ganha, como guarda, como gasta e que crenças sobre dinheiro você carrega desde a infância.',
  h2SubTitle: (s) => `Casa 2 em ${s} — Seu Padrão Financeiro`,
  saturnTitle: (h, s) => `♄ Saturno na Casa ${h} em ${s} — Disciplina e Carreira Sólida`,
  saturnIntro: 'Saturno é o planeta da carreira sólida — o que exige tempo, disciplina e método, mas produz resultados duradouros. A posição natal de Saturno revela onde você tem mais trabalho a fazer profissionalmente, e ao mesmo tempo onde pode construir a parte mais robusta da sua trajetória. Saturno recompensa quem não desiste.',
  saturnReturnTitle: 'Saturno e o Retorno de Saturno',
  saturnReturnText: 'Ao redor dos 28-30 anos e novamente aos 58-60, Saturno retorna ao ponto natal — o chamado "Retorno de Saturno". Este é um dos trânsitos mais importantes para a carreira: ele consolida o que foi construído com integridade e revela o que foi construído sobre areia. O primeiro Retorno marca a transição para a maturidade adulta real; o segundo, a consolidação do legado. Se você está próximo desses períodos, este é um momento de avaliação profissional profunda.',
  jupiterTitle: (h, s) => `♃ Júpiter na Casa ${h} em ${s} — Expansão e Oportunidades`,
  jupiterIntro: 'Júpiter natal indica onde a "sorte" — na verdade, sabedoria acumulada e abertura para crescer — flui mais facilmente. Na carreira, Júpiter marca os setores onde oportunidades aparecem de forma mais natural e onde o crescimento tem menos resistência. Aproveitar o Júpiter natal é questão de reconhecer que você já tem vantagem nessa área e agir com confiança a partir daí.',
  jupiterCycleTitle: 'Ciclo de Júpiter na Carreira',
  jupiterCycleText: 'Júpiter orbita o Sol em aproximadamente 12 anos. Cada vez que ele retorna ao signo natal — por volta de cada 12 anos —, há um período de expansão e oportunidade particular. Quando Júpiter transita a Casa 10, a carreira se expande visivelmente. Quando transita a Casa 2, os recursos crescem. Acompanhar os ciclos jupiterianos é uma das ferramentas mais práticas da astrologia de carreira.',
  sunTitle: (s, h) => `☉ Sol em ${s} na Casa ${h} — Onde Você Brilha`,
  sunIntro: 'O Sol no mapa de carreira indica onde e como você brilha profissionalmente — o tipo de papel que traz mais vitalidade, o ambiente onde sua energia flui com naturalidade. Trabalhar alinhado com o Sol não significa fazer apenas o que é fácil — significa fazer o que é genuinamente seu.',
  sunHouseText: (h) => `Sol na Casa ${h} indica que a energia vital e criativa se manifesta com mais força nos temas dessa casa. Na carreira, isso significa que projetos e papéis relacionados à Casa ${h} tendem a ser mais energizantes — você não apenas produz mais, mas produz com satisfação genuína.`,
  marsTitle: (s, h) => `♂ Marte em ${s} na Casa ${h} — Como Você Lidera e Compete`,
  marsIntro: 'Marte determina como você compete, como age sob pressão, que tipo de desafio te motiva e como lida com conflitos profissionais. No trabalho, Marte é a energia que move projetos, que enfrenta obstáculos e que define seu estilo de liderança — ou de resistência à autoridade.',
  mercuryTitle: (s, h) => `☿ Mercúrio em ${s} na Casa ${h} — Habilidades Intelectuais`,
  mercuryIntro: 'Mercúrio profissional é o planeta das habilidades mentais e comunicativas — como você aprende, como se comunica, que tipo de informação processa com facilidade e onde está seu diferencial intelectual. Em muitas carreiras, é a posição de Mercúrio que define o nicho de especialização.',
  talentsIntro: 'Trígonos e sextis no mapa natal indicam fluxo natural — habilidades que vêm sem esforço aparente. Esses pontos são frequentemente subestimados justamente por serem fáceis: como não exigem luta para existir, raramente recebem o mesmo investimento de desenvolvimento que os pontos difíceis. Identificar e deliberadamente desenvolver seus talentos naturais pode ser o caminho de menor resistência para o sucesso profissional.',
  talentsNoAspects: 'Seus talentos naturais estão principalmente nas conjunções e nas qualidades dos planetas dominantes do seu mapa. Uma análise mais profunda dos planetas em seus domicílios ou exaltações revela onde sua energia flui com maior facilidade.',
  challengesIntro: 'Aspectos tensos no mapa não indicam fracasso profissional — indicam as áreas que precisam de mais trabalho consciente. Muitas vezes, os maiores desafios do mapa são também os maiores pontos de aprendizado. Profissionais que trabalham conscientemente suas tensões astrológicas frequentemente desenvolvem habilidades excepcionais precisamente nas áreas onde mais lutaram.',
  timingTitle: 'Timing de Mudanças — Ciclos de Saturno e Júpiter',
  timingIntro: 'A astrologia de carreira é poderosa não apenas para entender aptidões, mas para identificar os momentos certos de mudança. Saturno (ciclo de ~29 anos) e Júpiter (ciclo de ~12 anos) são os grandes marcadores de tempo profissional. Entender onde você está em cada ciclo ajuda a diferenciar "hora de construir" de "hora de expandir" de "hora de consolidar".',
  saturnPhasesTitle: 'Fases do Ciclo de Saturno na Carreira',
  jupiterPhasesTitle: 'Fases do Ciclo de Júpiter na Carreira',
  suggestionsTitle: 'Profissões Sugeridas por Signo e Casa',
  suggestionsIntro: 'As sugestões abaixo são baseadas na combinação do seu MC, Sol, Saturno e Júpiter. São direções, não prescrições — o mapa indica afinidades e potenciais, mas a escolha final é sempre sua, considerando também formação, mercado e valores pessoais.',
  suggestionsOutro: 'Essas sugestões são pontos de partida para reflexão. Combine-as com o que você naturalmente ama fazer, o que o mercado precisa, e o que gera renda suficiente. A interseção dessas três esferas é o terreno mais fértil para uma carreira sustentável e significativa.',
  conclusionText: (name, mcSign, satHouse, jupHouse, sunSign, marsSign, mercSign) =>
    `${name}, seu mapa de carreira revela uma combinação única de vocação, talento e timing. O MC em ${mcSign} define a direção geral; Saturno na Casa ${satHouse} indica onde o trabalho duro produz resultados duradouros; Júpiter na Casa ${jupHouse} revela onde as oportunidades fluem com mais naturalidade.\n\nO Sol em ${sunSign} define onde você brilha genuinamente — não apenas onde você é competente, mas onde há satisfação real. Marte em ${marsSign} determina como você age e compete. Mercúrio em ${mercSign} define seu diferencial intelectual.\n\nA carreira ideal não é a mais glamorosa ou a mais lucrativa — é aquela que ativa seus talentos naturais, honra seus valores e evolui junto com você. Use este relatório como bússola, não como destino fixo. O mapa sugere caminhos; você escolhe qual percorrer — e como.`,
  quote: '"Escolha um trabalho que você ame e não terá de trabalhar um dia sequer." — Confúcio',
};

// ============================================================
const TEXTS: Record<string, CareerTexts> = { en: EN };
TEXTS['pt'] = { ...EN, ...PT } as CareerTexts;

export function getCareerTexts(locale: string): CareerTexts {
  return TEXTS[locale] ?? TEXTS['en'];
}
