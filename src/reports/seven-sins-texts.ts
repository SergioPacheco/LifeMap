// ============================================================
// SEVEN-SINS-TEXTS.TS — i18n texts for generateSevenSinsPdf
// EN = complete base; PT = override; other locales fallback to EN
// ============================================================

export interface SevenSinsTexts {
  coverSubtitle: string;
  introTitle: string;
  intro1: string;
  intro2: string;
  intro3: string;
  sinMapTitle: string;
  sinMapLabels: string[]; // 7 labels: PRIDE, GLUTTONY, LUST, WRATH, GREED, ENVY, SLOTH

  // Per-sin section texts
  prideTitle: (signName: string) => string;
  prideMeta: string;
  prideIntro: (signName: string) => string;
  prideOutro: string;
  prideIntegrationTitle: string;
  prideDomTitle: string;
  prideDom: (signName: string) => string;

  gluttonyTitle: (signName: string) => string;
  gluttonyMeta: string;
  gluttonyIntro: (signName: string) => string;
  gluttonyOutro: string;
  gluttonyIntegrationTitle: string;
  gluttonyDomTitle: string;
  gluttonyDom: (signName: string) => string;

  lustTitle: (signName: string) => string;
  lustMeta: string;
  lustIntro: (signName: string) => string;
  lustOutro: string;
  lustIntegrationTitle: string;
  lustDomTitle: string;
  lustDom: (signName: string) => string;

  wrathTitle: (signName: string) => string;
  wrathMeta: string;
  wrathIntro: (signName: string) => string;
  wrathOutro: string;
  wrathIntegrationTitle: string;
  wrathDomTitle: string;
  wrathDom: (signName: string) => string;

  greedTitle: (signName: string) => string;
  greedMeta: string;
  greedIntro: (signName: string) => string;
  greedOutro: string;
  greedDomTitle: string;
  greedDom: (signName: string) => string;

  envyTitle: (signName: string) => string;
  envyMeta: string;
  envyIntro: (signName: string) => string;
  envyOutro: string;
  envyDomTitle: string;
  envyDom: (signName: string) => string;

  slothTitle: (signName: string) => string;
  slothMeta: string;
  slothIntro: (signName: string) => string;
  slothOutro: string;
  slothDomTitle: string;
  slothDom: (signName: string) => string;

  // Integration summary section
  integrationTitle: string;
  integrationIntro: string;
  summaryActions: string[];

  // Conclusion
  conclusionTitle: string;
  conclusion1: (name: string) => string;
  conclusion2: string;
  conclusion3: string;
  conclusion4: string;
  quote: string;
}

// ============================================================
// ENGLISH (BASE)
// ============================================================

const EN: SevenSinsTexts = {
  coverSubtitle: 'Your shadow revealed with humor and truth',
  introTitle: 'The Playful Shadow of the Zodiac',
  intro1: 'The seven deadly sins were not invented to shame us. They were invented to name the universal human patterns that, without awareness, govern us instead of serving us. Astrology does the same — only with more color, symbolism and a pinch of cosmic humor.',
  intro2: 'Each planet carries a shadow — not as a flaw, but as the un-integrated version of a genuinely powerful quality. Un-integrated Mars is not energy — it is aggression without direction. Un-integrated Jupiter is not faith — it is laziness disguised as optimism. When we ignore the shadow, it acts through us without permission. When we face it with honesty and a smile, it transforms.',
  intro3: 'This report will not judge you. It will show you the mirror — and wait for you to laugh at what you see before deciding what to do with it. Because the shadow you can laugh at no longer has the same power over you.',
  sinMapTitle: 'The Map of Your 7 Sins',
  sinMapLabels: ['👑 PRIDE', '🍰 GLUTTONY', '🔥 LUST', '⚡ WRATH', '💰 GREED', '🐍 ENVY', '🛋️ SLOTH'],

  prideTitle: (s) => `👑 PRIDE — Sun in ${s}`,
  prideMeta: 'Planet: Sun  |  Sin: Pride  |  Hidden gift: Identity and purpose',
  prideIntro: (s) => `The Sun governs the ego — and the ego, when unwatched, becomes pride. Not the healthy pride of self-respect, but the pride that needs an audience, that cannot admit error, that measures its own worth by someone else's ruler. In ${s}, pride has a very specific flavor:`,
  prideOutro: 'The Sun is not the villain here. It is simply asking to exist for real, without needing comparison or external validation to justify its presence. Pride arises when the ego has not yet learned it is enough without needing to prove anything.',
  prideIntegrationTitle: '👑 PRIDE — Path of Integration',
  prideDomTitle: 'The Gift of Integrated Pride',
  prideDom: (s) => `Well-integrated pride transforms into dignity — the ability to value yourself without needing to diminish others. In ${s}, this means using ego intensity as a motor for genuine creation: not to surpass, but to express. The Sun that no longer needs to prove anything paradoxically radiates more. Inner security is magnetic in a way performance can never imitate.`,

  gluttonyTitle: (s) => `🍰 GLUTTONY — Moon in ${s}`,
  gluttonyMeta: 'Planet: Moon  |  Sin: Gluttony  |  Hidden gift: Nourishment and care',
  gluttonyIntro: (s) => `The Moon governs emotional needs — and when those needs are not consciously recognized, they become gluttonies: the compulsive consumption of anything that can fill the void. In ${s}, the hunger has a specific address:`,
  gluttonyOutro: 'The Moon is not greedy — it is hungry. There is a difference. The Moon\'s hunger is real and needs to be fed; the problem is when we cannot distinguish what truly satisfies from what merely occupies. Recognizing the real hunger beneath the compulsion is the beginning of the way out.',
  gluttonyIntegrationTitle: '🍰 GLUTTONY — Path of Integration',
  gluttonyDomTitle: 'The Gift of Integrated Gluttony',
  gluttonyDom: (s) => `Integrated gluttony transforms into genuine capacity for nourishment — both receiving and giving. In ${s}, this means developing the wisdom to know what truly feeds you and cultivating sustainable sources of it in life: relationships, practices, environments. The Moon that knows what it needs to feel safe can give from a place of abundance, not scarcity.`,

  lustTitle: (s) => `🔥 LUST — Venus in ${s}`,
  lustMeta: 'Planet: Venus  |  Sin: Lust  |  Hidden gift: Love and beauty',
  lustIntro: (s) => `Venus governs desire, love and what we consider beautiful. Lust emerges when desire loses awareness — when we want without considering the other, or when pleasure becomes escape rather than presence. In ${s}, desire has its particular texture:`,
  lustOutro: 'Venus is not a sinner — she is passionate. Pleasure is legitimate and necessary; the problem is when it loses the quality of presence. Lust is desire without real contact. The cure is not to repress wanting — it is to deepen it.',
  lustIntegrationTitle: '🔥 LUST — Path of Integration',
  lustDomTitle: 'The Gift of Integrated Lust',
  lustDom: (s) => `Integrated lust transforms into conscious Eros — desire with presence, pleasure with responsibility, beauty with depth. In ${s}, this means using the capacity to desire as a compass of values: what you genuinely love reveals who you are. And when love is conscious, it builds instead of consuming.`,

  wrathTitle: (s) => `⚡ WRATH — Mars in ${s}`,
  wrathMeta: 'Planet: Mars  |  Sin: Wrath  |  Hidden gift: Strength and courage',
  wrathIntro: (s) => `Mars governs strength, action and boundaries. Wrath emerges when this energy has no conscious direction — when strength becomes aggression, defense becomes attack, boundary becomes punishment. In ${s}, anger has a very recognizable form:`,
  wrathOutro: 'Mars is not a villain — it is the warrior that needs a just cause. Anger is a signal, not a flaw: it indicates a boundary was crossed, a value was violated, something needs to be defended or changed. The problem is when we trigger the warrior before understanding what it is really protecting.',
  wrathIntegrationTitle: '⚡ WRATH — Path of Integration',
  wrathDomTitle: 'The Gift of Integrated Wrath',
  wrathDom: (s) => `Integrated wrath transforms into assertiveness — the ability to say no, to establish boundaries and to act with strength without destroying what doesn't need to be destroyed. In ${s}, this means using Mars energy as fuel for projects and legitimate defenses, not as an automatic reaction to any frustration. The mature warrior chooses battles — and wins more because they fight for real reasons.`,

  greedTitle: (s) => `💰 GREED — Saturn in ${s}`,
  greedMeta: 'Planet: Saturn  |  Sin: Greed  |  Hidden gift: Discipline and structure',
  greedIntro: (s) => `Saturn governs limits, structure and what we retain. Saturnian greed is not necessarily about money — it is about any resource you fear losing: time, energy, power, recognition, affection. In ${s}, retention has an identifiable pattern:`,
  greedOutro: 'Saturn is not stingy — it is careful. The difference between care and greed is the underlying belief: "there is not enough" versus "there is enough if managed wisely." When scarcity fear governs Saturn, it retains even generosity. When maturity governs Saturn, it manages resources with precision and still has surplus to give.',
  greedDomTitle: 'The Gift of Integrated Greed',
  greedDom: (s) => `Integrated greed transforms into wise stewardship — the capacity to manage resources with precision while remaining generous. In ${s}, Saturn's discipline becomes a gift when the underlying belief shifts from fear of loss to confidence in sustainable management.`,

  envyTitle: (s) => `🐍 ENVY — Pluto in ${s}`,
  envyMeta: 'Planet: Pluto  |  Sin: Envy  |  Hidden gift: Transformation and personal power',
  envyIntro: (s) => `Pluto governs what is hidden — including envy, which we rarely admit aloud. Plutonian envy is not merely "wanting what another has" — it is resentment when the other seems to have access to something you believe is denied to you. In ${s}, this resentment has a specific quality:`,
  envyOutro: 'Pluto is not malicious — it is intense. The envy it carries has a function: it points to what you genuinely desire but do not yet believe is possible for yourself. That pointing, when used with honesty instead of denied, can be one of the most precise compasses of purpose that exists.',
  envyDomTitle: 'The Gift of Integrated Envy',
  envyDom: (s) => `Integrated envy transforms into clarity of purpose — using what you admire in others as a mirror for your own unexpressed potential. In ${s}, Pluto's intensity becomes fuel for transformation when envy is acknowledged and redirected toward personal growth.`,

  slothTitle: (s) => `🛋️ SLOTH — Jupiter in ${s}`,
  slothMeta: 'Planet: Jupiter  |  Sin: Sloth  |  Hidden gift: Faith and expansion',
  slothIntro: (s) => `Jupiter governs expansion, faith and optimism — and when not integrated, transforms into sloth: the confidence that things will resolve themselves without concrete action. In ${s}, laziness has a sophisticated disguise:`,
  slothOutro: 'Jupiter is not lazy — it is optimistic. The difference between faith and sloth is action: faith that moves its own hands is real expansion; faith that waits sitting down is postponement disguised as spirituality. Integrated Jupiter combines enthusiasm with execution, vision with concrete steps.',
  slothDomTitle: 'The Gift of Integrated Sloth',
  slothDom: (s) => `Integrated sloth transforms into purposeful faith — the ability to trust the process while actively participating in it. In ${s}, Jupiter's expansiveness becomes a genuine force for growth when optimism is paired with consistent, directed action.`,

  integrationTitle: 'Path of Integration — The 7 Reunited',
  integrationIntro: 'Now that you know your 7 astrological sins, good news: you don\'t need to "fix" them all at once. The shadow is not integrated by brute force — it is integrated by gradual awareness and humor. Choose one sin per month to observe. Without judgment, just curiosity: "when does this pattern appear? What is it asking? What would I need to believe to release it?"',
  summaryActions: [
    'Observe when you need to be right. Ask: "can I learn something here?"',
    'Identify the real hunger before filling the void with the next consumption.',
    'Bring presence to what you already have before chasing the next desire.',
    'Take a pause of 3 breaths before responding in conflict.',
    'Practice a small and specific generosity this week.',
    'When you feel envy, ask: "what exactly do I want for myself?"',
    'Take a 5-minute action toward the project that keeps being postponed.',
  ],

  conclusionTitle: 'Conclusion — The Well-Intentioned Devil\'s Advice',
  conclusion1: (name) => `${name}, you have reached the end of your astrological sin inventory. And if you are still reading, it is because you recognized at least one of them in yourself — probably more than one, and probably with that uncomfortable mix of shame and relief of finally having words for something you already knew.`,
  conclusion2: 'The good news: all these sins are merely energies that have not yet learned the way home. Pride wants to be dignity. Gluttony wants to be conscious nourishment. Lust wants to be love with presence. Wrath wants to be courageous assertiveness. Greed wants to be wise management. Envy wants to be clarity of purpose. Sloth wants to be faith with action.',
  conclusion3: 'None of us integrates everything at once. The process is circular, not linear — you will encounter these patterns again, at deeper layers, throughout life. And each time you recognize them with a bit more humor and a bit less judgment, you reclaim a piece of energy that was trapped in them.',
  conclusion4: 'Use this report as a periodic mirror — reread it when you feel a pattern getting heavy. The shadow you name does not disappear, but it loses the power to act behind your back.',
  quote: '"I know few errors as great as taking oneself too seriously." — Oscar Wilde',
};

// ============================================================
// PORTUGUESE (OVERRIDE)
// ============================================================

const PT: Partial<SevenSinsTexts> = {
  coverSubtitle: 'Sua sombra revelada com humor e verdade',
  introTitle: 'A Sombra Lúdica do Zodíaco',
  intro1: 'Os sete pecados capitais não foram inventados para nos envergonhar. Foram inventados para nomear os padrões humanos universais que, sem consciência, nos governam em vez de nos servir. A astrologia faz o mesmo — só que com mais cor, simbolismo e uma pitada de humor cósmico.',
  intro2: 'Cada planeta carrega uma sombra — não como defeito, mas como a versão não-integrada de uma qualidade genuinamente poderosa. Marte não-integrado não é energia — é agressividade sem direção. Júpiter não-integrado não é fé — é preguiça disfarçada de otimismo. Quando ignoramos a sombra, ela age através de nós sem permissão. Quando a encaramos com honestidade e um sorriso, ela se transforma.',
  intro3: 'Este relatório não vai te julgar. Vai te mostrar o espelho — e esperar que você ria do que vê antes de decidir o que fazer com isso. Porque a sombra que você pode rir já não tem o mesmo poder sobre você.',
  sinMapTitle: 'O Mapa dos Seus 7 Pecados',
  sinMapLabels: ['👑 ORGULHO', '🍰 GULA', '🔥 LUXÚRIA', '⚡ IRA', '💰 AVAREZA', '🐍 INVEJA', '🛋️ PREGUIÇA'],

  prideTitle: (s) => `👑 ORGULHO — Sol em ${s}`,
  prideMeta: 'Planeta: Sol  |  Pecado: Orgulho  |  Dom oculto: Identidade e propósito',
  prideIntro: (s) => `O Sol governa o ego — e o ego, quando não vigiado, vira orgulho. Não o orgulho saudável de se respeitar, mas o orgulho que precisa de plateia, que não admite erro, que mede o próprio valor pela régua do outro. Em ${s}, o orgulho tem um sabor muito específico:`,
  prideOutro: 'O Sol não é o vilão aqui. Ele só está pedindo para existir de verdade, sem precisar de comparação ou validação externa para justificar sua presença. O orgulho surge quando o ego ainda não aprendeu que é suficiente sem precisar provar nada.',
  prideIntegrationTitle: '👑 ORGULHO — Caminho de Integração',
  prideDomTitle: 'O Dom do Orgulho Integrado',
  prideDom: (s) => `O orgulho bem integrado se transforma em dignidade — a capacidade de se valorizar sem precisar diminuir o outro. Em ${s}, isso significa usar a intensidade do ego como motor de criação genuína: não para superar, mas para expressar. O Sol que não precisa mais provar nada paradoxalmente irradia mais. A segurança interna é magnética de um jeito que a performance nunca consegue imitar.`,

  gluttonyTitle: (s) => `🍰 GULA — Lua em ${s}`,
  gluttonyMeta: 'Planeta: Lua  |  Pecado: Gula  |  Dom oculto: Nutrição e cuidado',
  gluttonyIntro: (s) => `A Lua governa as necessidades emocionais — e quando essas necessidades não são reconhecidas conscientemente, tornam-se gulodices: o consumo compulsivo de tudo que pode preencher o vazio. Em ${s}, a fome tem um endereço específico:`,
  gluttonyOutro: 'A Lua não é gananciosa — é faminta. Há uma diferença. A fome da Lua é real e precisa ser alimentada; o problema é quando não conseguimos distinguir o que realmente sacia do que apenas ocupa. Reconhecer a fome real por baixo da compulsão é o começo da saída.',
  gluttonyIntegrationTitle: '🍰 GULA — Caminho de Integração',
  gluttonyDomTitle: 'O Dom da Gula Integrada',
  gluttonyDom: (s) => `A gula integrada se transforma em capacidade genuína de nutrição — tanto receber quanto dar. Em ${s}, isso significa desenvolver a sabedoria de saber o que realmente alimenta e cultivar fontes sustentáveis disso na vida: relações, práticas, ambientes. A Lua que sabe o que precisa para se sentir segura pode dar de um lugar de abundância, não de escassez.`,

  lustTitle: (s) => `🔥 LUXÚRIA — Vênus em ${s}`,
  lustMeta: 'Planeta: Vênus  |  Pecado: Luxúria  |  Dom oculto: Amor e beleza',
  lustIntro: (s) => `Vênus governa o desejo, o amor e o que consideramos belo. A luxúria emerge quando o desejo perde a consciência — quando queremos sem considerar o outro, ou quando o prazer se torna fuga em vez de presença. Em ${s}, o desejo tem sua textura particular:`,
  lustOutro: 'Vênus não é pecadora — é apaixonada. O prazer é legítimo e necessário; o problema é quando perde a qualidade de presença. A luxúria é o desejo sem contato real. A cura não é reprimir o querer — é aprofundá-lo.',
  lustIntegrationTitle: '🔥 LUXÚRIA — Caminho de Integração',
  lustDomTitle: 'O Dom da Luxúria Integrada',
  lustDom: (s) => `A luxúria integrada se transforma em Eros consciente — desejo com presença, prazer com responsabilidade, beleza com profundidade. Em ${s}, isso significa usar a capacidade de desejar como bússola de valores: o que você genuinamente ama revela quem você é. E quando o amor é consciente, ele constrói em vez de consumir.`,

  wrathTitle: (s) => `⚡ IRA — Marte em ${s}`,
  wrathMeta: 'Planeta: Marte  |  Pecado: Ira  |  Dom oculto: Força e coragem',
  wrathIntro: (s) => `Marte governa a força, a ação e os limites. A ira emerge quando essa energia não tem direção consciente — quando a força se torna agressividade, quando a defesa se torna ataque, quando o limite se torna punição. Em ${s}, a raiva tem uma forma muito reconhecível:`,
  wrathOutro: 'Marte não é vilão — é o guerreiro que precisa de uma causa justa. A raiva é um sinal, não um defeito: ela indica que um limite foi cruzado, que um valor foi violado, que algo precisa ser defendido ou mudado. O problema é quando disparamos o guerreiro antes de entender o que ele está realmente protegendo.',
  wrathIntegrationTitle: '⚡ IRA — Caminho de Integração',
  wrathDomTitle: 'O Dom da Ira Integrada',
  wrathDom: (s) => `A ira integrada se transforma em assertividade — a capacidade de dizer não, de estabelecer limites e de agir com força sem destruir o que não precisa ser destruído. Em ${s}, isso significa usar a energia marciana como combustível para projetos e defesas legítimas, não como reação automática a qualquer frustração. O guerreiro maduro escolhe suas batalhas — e vence mais porque luta por razões reais.`,

  greedTitle: (s) => `💰 AVAREZA — Saturno em ${s}`,
  greedMeta: 'Planeta: Saturno  |  Pecado: Avareza  |  Dom oculto: Disciplina e estrutura',
  greedIntro: (s) => `Saturno governa limites, estrutura e o que retemos. A avareza saturniana não é necessariamente com dinheiro — é com qualquer recurso que você teme perder: tempo, energia, poder, reconhecimento, afeto. Em ${s}, a retenção tem um padrão identificável:`,
  greedOutro: 'Saturno não é mesquinho — é cuidadoso. A diferença entre cuidado e avareza é a crença subjacente: "não há suficiente" versus "há suficiente se for gerenciado com sabedoria". Quando o medo de escassez governa Saturno, ele retém até a generosidade. Quando a maturidade governa Saturno, ele gerencia recursos com precisão e ainda sobra para dar.',
  greedDomTitle: 'Dom da Avareza Integrada',
  greedDom: (s) => `A avareza integrada se transforma em gestão sábia — a capacidade de gerenciar recursos com precisão permanecendo generoso. Em ${s}, a disciplina de Saturno se torna um dom quando a crença subjacente muda do medo da perda para a confiança na gestão sustentável.`,

  envyTitle: (s) => `🐍 INVEJA — Plutão em ${s}`,
  envyMeta: 'Planeta: Plutão  |  Pecado: Inveja  |  Dom oculto: Transformação e poder pessoal',
  envyIntro: (s) => `Plutão governa o que está oculto — incluindo a inveja, que raramente admitimos em voz alta. A inveja plutoniana não é apenas "querer o que o outro tem" — é o ressentimento quando o outro parece ter acesso a algo que você acredita ser negado a você. Em ${s}, esse ressentimento tem uma qualidade específica:`,
  envyOutro: 'Plutão não é malicioso — é intenso. A inveja que ele carrega tem uma função: ela aponta para o que você genuinamente deseja mas ainda não acredita ser possível para si mesmo. Esse apontamento, quando usado com honestidade em vez de negado, pode ser uma das bússolas mais precisas de propósito que existe.',
  envyDomTitle: 'Dom da Inveja Integrada',
  envyDom: (s) => `A inveja integrada se transforma em clareza de propósito — usar o que admira nos outros como espelho para seu próprio potencial não-expresso. Em ${s}, a intensidade de Plutão se torna combustível para transformação quando a inveja é reconhecida e redirecionada para crescimento pessoal.`,

  slothTitle: (s) => `🛋️ PREGUIÇA — Júpiter em ${s}`,
  slothMeta: 'Planeta: Júpiter  |  Pecado: Preguiça  |  Dom oculto: Fé e expansão',
  slothIntro: (s) => `Júpiter governa expansão, fé e otimismo — e quando não integrado, se transforma em preguiça: a confiança de que as coisas vão se resolver sem ação concreta. Em ${s}, a preguiça tem um disfarce sofisticado:`,
  slothOutro: 'Júpiter não é preguiçoso — é otimista. A diferença entre fé e preguiça é a ação: fé que move as próprias mãos é expansão real; fé que espera sentada é adiamento disfarçado de espiritualidade. Júpiter integrado combina entusiasmo com execução, visão com passo concreto.',
  slothDomTitle: 'Dom da Preguiça Integrada',
  slothDom: (s) => `A preguiça integrada se transforma em fé com propósito — a capacidade de confiar no processo enquanto participa ativamente dele. Em ${s}, a expansividade de Júpiter se torna uma força genuína para crescimento quando o otimismo é pareado com ação consistente e direcionada.`,

  integrationTitle: 'Caminho de Integração — Os 7 Reunidos',
  integrationIntro: 'Agora que conhece seus 7 pecados astrológicos, uma boa notícia: você não precisa "corrigir" todos ao mesmo tempo. A sombra não se integra por esforço bruto — se integra por consciência gradual e humor. Escolha um pecado por mês para observar. Sem julgamento, só curiosidade: "quando esse padrão aparece? O que ele está pedindo? O que eu precisaria acreditar para soltá-lo?"',
  summaryActions: [
    'Observe quando precisa ter razão. Pergunte: "posso aprender algo aqui?"',
    'Identifique a fome real antes de preencher o vazio com o próximo consumo.',
    'Traga presença ao que já tem antes de buscar o próximo desejo.',
    'Faça uma pausa de 3 respirações antes de responder em conflito.',
    'Pratique uma generosidade pequena e específica esta semana.',
    'Quando sentir inveja, pergunte: "o que exatamente quero para mim?"',
    'Tome uma ação de 5 minutos em direção ao projeto que fica sendo adiado.',
  ],

  conclusionTitle: 'Conclusão — O Conselho do Diabo Bem-Intencionado',
  conclusion1: (name) => `${name}, você chegou ao final do seu inventário de pecados astrológicos. E se ainda está lendo, é porque reconheceu pelo menos um de si mesmo — provavelmente mais que um, e provavelmente com aquela mistura incômoda de vergonha e alívio de finalmente ter palavras para algo que já sabia.`,
  conclusion2: 'A boa notícia: todos esses pecados são apenas energias que ainda não aprenderam o caminho de casa. O orgulho quer ser dignidade. A gula quer ser nutrição consciente. A luxúria quer ser amor com presença. A ira quer ser assertividade corajosa. A avareza quer ser gestão sábia. A inveja quer ser clareza de propósito. A preguiça quer ser fé com ação.',
  conclusion3: 'Nenhum de nós integra tudo de uma vez. O processo é circular, não linear — você vai encontrar esses padrões de novo, em camadas mais profundas, ao longo da vida. E cada vez que os reconhece com um pouco mais de humor e um pouco menos de julgamento, você recupera um pedaço de energia que estava preso neles.',
  conclusion4: 'Use este relatório como espelho periódico — releia quando sentir que algum padrão está pesado. A sombra que você nomeia não desaparece, mas perde o poder de agir às suas costas.',
  quote: '"Conheço poucos erros tão grandes quanto o de levar-se demasiadamente a sério." — Oscar Wilde',
};

// ============================================================
// BUILD + EXPORT
// ============================================================

const TEXTS: Record<string, SevenSinsTexts> = { en: EN };

TEXTS['pt'] = { ...EN, ...PT } as SevenSinsTexts;

/**
 * Get localized seven sins report texts.
 * Usage: const st = getSevenSinsTexts(options.locale);
 */
export function getSevenSinsTexts(locale: string): SevenSinsTexts {
  return TEXTS[locale] ?? TEXTS['en'];
}
