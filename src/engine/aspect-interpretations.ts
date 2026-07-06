// ============================================================
// ASPECT-INTERPRETATIONS.TS — Interpretação de aspectos natais
// Formato: [planeta1][planeta2][tipo_aspecto] → texto
// ============================================================

import type { AspectType } from './types';

// ============================================================
// TIPOS DE ASPECTO — significados base
// ============================================================

export const ASPECT_NATURE: Record<AspectType, { nature: 'hard' | 'soft' | 'neutral'; keyword: string; description: string }> = {
  conjunction: { nature: 'neutral', keyword: 'fusão', description: 'As duas energias se fundem — intensificação total, para o bem ou para o desafio.' },
  sextile: { nature: 'soft', keyword: 'oportunidade', description: 'Fluidez que precisa de iniciativa — a porta está aberta, mas você precisa entrar.' },
  square: { nature: 'hard', keyword: 'tensão criativa', description: 'Atrito que exige ação — a fonte de maior crescimento, mas também de maior frustração.' },
  trine: { nature: 'soft', keyword: 'facilidade', description: 'Fluxo natural — talento inato que pode ser subestimado por vir fácil demais.' },
  opposition: { nature: 'hard', keyword: 'polaridade', description: 'Duas forças opostas que pedem integração — balancear sem negar nenhum lado.' },
};

// ============================================================
// INTERPRETAÇÕES POR PAR DE PLANETAS + ASPECTO
// Formato: key = "planet1-planet2" → { hard, soft, conjunction }
// ============================================================

interface AspectInterp {
  conjunction: string;
  soft: string;  // trine + sextile
  hard: string;  // square + opposition
}

export const PLANET_ASPECTS: Record<string, AspectInterp> = {
  // --- SOL ---
  'sun-moon': {
    conjunction: 'Identidade e emoções fundidas — singleness of purpose. O que você quer e o que precisa estão alinhados. Pode ter dificuldade em enxergar perspectivas diferentes da sua.',
    soft: 'Harmonia entre vontade e necessidades emocionais. Você se sente confortável consigo mesmo. Facilidade em saber o que quer e como se nutrir.',
    hard: 'Tensão entre identidade (Sol) e necessidades emocionais (Lua). O que você quer racionalmente pode conflitar com o que precisa emocionalmente. Pais podem ter sido modelos conflitantes.',
  },
  'sun-mercury': {
    conjunction: 'Mente e identidade fundidas — você pensa sobre si mesmo e se expressa com naturalidade. Comunicação é parte central de quem você é.',
    soft: 'Facilidade em articular quem você é e o que pensa. Comunicação fluida e congruente com sua identidade.',
    hard: 'Raramente ocorre (Mercúrio nunca está mais que 28° do Sol). Se presente, indica tensão entre pensamento e vontade.',
  },
  'sun-venus': {
    conjunction: 'Charme natural — sua identidade tem uma qualidade agradável, artística e relacional. Você atrai com facilidade. Amor e identidade se fundem.',
    soft: 'Facilidade em relacionamentos e expressão artística. Você agrada naturalmente e tem bom gosto estético. Talentos para diplomacia.',
    hard: 'Raramente ocorre (Vênus nunca está mais que 48° do Sol). Se presente, tensão entre amor-próprio e necessidade de aprovação.',
  },
  'sun-mars': {
    conjunction: 'Energia e vontade fundidas — ação direta, coragem, competitividade. Você faz acontecer, mas pode ser impaciente ou agressivo sem perceber.',
    soft: 'Energia física e vontade trabalham em harmonia. Você age com confiança e determinação saudável. Liderança natural.',
    hard: 'Tensão entre o que quer (Sol) e como age (Marte). Pode haver impulsividade, raiva reprimida ou conflitos com figuras de autoridade masculinas. A lição é canalizar essa energia em ação construtiva.',
  },
  'sun-jupiter': {
    conjunction: 'Otimismo e expansão fundidos à identidade. Confiança abundante, generosidade natural. Cuidado com excesso de promessas ou arrogância.',
    soft: 'Sorte natural, otimismo saudável, oportunidades que aparecem. Você cresce com facilidade quando se permite expandir.',
    hard: 'Excesso — pode prometer demais, gastar demais, acreditar demais em si sem base real. A lição é expansão com responsabilidade.',
  },
  'sun-saturn': {
    conjunction: 'Identidade marcada por disciplina, responsabilidade precoce e seriedade. Pode ter se sentido limitado na infância — como se tivesse que "crescer" antes do tempo. Saturno fundido ao Sol é a assinatura do construtor paciente: o que você constrói tem uma solidez que ninguém pode tirar. Com maturidade, a pessoa que carregava peso demais se torna autoridade natural.',
    soft: 'Disciplina e ambição apoiam sua identidade de forma orgânica. Você constrói com paciência e colhe resultados que duram décadas. A maturidade é aliada — cada ano que passa te fortalece. Há uma sabedoria prática na forma como você lida com o mundo que inspira confiança nos outros.',
    hard: 'Tensão entre quem você é e o que sente que "deveria ser". Autocrítica severa, sensação de nunca ser suficiente, medo de não corresponder. O pai pode ter sido rígido, ausente ou excessivamente exigente. Esta não é uma falha no design — é um convite a se libertar da necessidade de permissão para existir. A lição profunda: você não precisa provar seu valor para ter direito de brilhar.',
  },
  'sun-uranus': {
    conjunction: 'Identidade radicalmente original — você precisa ser diferente e se recusa a se enquadrar. Pode chocar ou inspirar.',
    soft: 'Originalidade e liberdade apoiam sua identidade. Você inova com naturalidade e atrai oportunidades inusitadas.',
    hard: 'Tensão entre pertencer e ser único. Rebeldia, dificuldade com autoridade, rupturas súbitas na vida. A lição é ser livre sem destruir.',
  },
  'sun-neptune': {
    conjunction: 'Identidade nebulosa — artista, visionário ou escapista. Pode ter dificuldade em se definir. Criatividade e espiritualidade como expressão do eu.',
    soft: 'Sensibilidade artística e intuição natural apoiam quem você é. Facilidade com música, imagem, espiritualidade.',
    hard: 'Identidade confusa — quem sou eu? Pode se perder em ilusões, vícios ou sacrifício. A lição é sonhar com os pés no chão.',
  },
  'sun-pluto': {
    conjunction: 'Identidade intensa e magnética — sua presença é percebida mesmo quando você está em silêncio. Ao longo da vida, você passa por transformações profundas de ego que matam versões anteriores de si mesmo para dar lugar a algo mais verdadeiro. Quando Plutão está fundido ao Sol, não há meio-termo: ou você vive com autenticidade radical, ou a vida força essa autenticidade através de crises.',
    soft: 'Capacidade extraordinária de se reinventar — você tem uma resiliência interna que permite morrer e renascer psicologicamente quando necessário. Poder pessoal usado com sabedoria: liderança que transforma sem dominar. Há uma profundidade magnética na forma como você se apresenta que atrai lealdade genuína.',
    hard: 'Lutas de poder — com autoridades, com o pai, consigo mesmo. Pode haver experiências de manipulação (sofrida ou exercida) que forçam confronto com a própria sombra. O que parece estar se desmontando já estava desgastado por dentro — Plutão simplesmente revela. A lição é empoderamento sem controle: o poder mais verdadeiro não precisa dominar ninguém.',
  },

  // --- LUA ---
  'moon-mercury': {
    conjunction: 'Mente e emoções fundidas — você pensa com o coração e racionaliza sentimentos. Boa memória emocional.',
    soft: 'Facilidade em expressar sentimentos e processar emoções pela conversa ou escrita. Inteligência emocional natural.',
    hard: 'Tensão entre razão e emoção. Pode racionalizar demais o que sente ou ser invadido por emoções quando tenta pensar claramente.',
  },
  'moon-venus': {
    conjunction: 'Afeto e emoções fundidos — pessoa amorosa, acolhedora, que cria beleza ao redor. Necessidade de harmonia emocional.',
    soft: 'Facilidade em atrair amor e criar ambientes agradáveis. Você se nutre em relacionamentos e beleza.',
    hard: 'Tensão entre necessidade emocional e forma de amar. Pode se acomodar demais por medo de conflito ou confundir amor com dependência.',
  },
  'moon-mars': {
    conjunction: 'Emoções e ação fundidas — reações intensas, instintivas, às vezes explosivas. Protetor feroz dos que ama.',
    soft: 'Coragem emocional — você age em nome do que sente e protege quem ama com determinação saudável.',
    hard: 'Raiva emocional — reações desproporcionais, impaciência com vulnerabilidade. Pode ter tido uma mãe combativa ou um ambiente doméstico tenso.',
  },
  'moon-jupiter': {
    conjunction: 'Generosidade emocional — otimismo, fé natural, capacidade de nutrir em grande escala. Exagero emocional.',
    soft: 'Felicidade emocional natural. Você encontra sentido e abundância no cuidado e na família.',
    hard: 'Exagero emocional — promete demais, espera demais, pode usar comida/compras para preencher vazio emocional.',
  },
  'moon-saturn': {
    conjunction: 'Emoções contidas — pode ter aprendido cedo que chorar não é seguro, que necessidades emocionais são um fardo para os outros. Responsabilidade emocional pesada desde jovem. Mas esta é também a assinatura da força interior genuína: com maturidade, a pessoa que continha demais se torna a rocha emocional que os outros buscam. A sabedoria emocional de quem já viu o pior e permaneceu de pé.',
    soft: 'Estabilidade emocional que inspira confiança. Você lida com sentimentos de forma madura e constrói relações emocionais sólidas que duram. Há uma presença tranquila na forma como sustenta os outros emocionalmente — não é frieza, é profundidade centrada.',
    hard: 'Frieza emocional aparente que esconde necessidades profundas de segurança e amor. A mãe pode ter sido ausente, rígida ou emocionalmente indisponível. Há um medo fundamental de ser vulnerável — como se mostrar necessidade fosse uma fraqueza imperdoável. Esta tensão não é sua falha: é onde a vida pede que você aprenda a ser gentil consigo mesmo primeiro, para depois receber gentileza de volta.',
  },
  'moon-uranus': {
    conjunction: 'Necessidade emocional de liberdade — inquietude interior, mudanças emocionais súbitas. Pode ter tido uma mãe não convencional.',
    soft: 'Intuição elétrica e capacidade de inovar emocionalmente. Você processa sentimentos de forma original.',
    hard: 'Instabilidade emocional — oscilações, dificuldade com intimidade constante, medo de ser engolido. Precisa de espaço dentro do afeto.',
  },
  'moon-neptune': {
    conjunction: 'Sensibilidade oceânica — empatia extrema, intuição psíquica, dificuldade com fronteiras emocionais. Artista nato.',
    soft: 'Intuição e compaixão naturais. Você se conecta com o sofrimento alheio e canaliza em arte ou cura.',
    hard: 'Confusão emocional — dificuldade em separar seus sentimentos dos alheios. Pode idealizar figuras maternas ou escapar pela fantasia.',
  },
  'moon-pluto': {
    conjunction: 'Emoções intensas e profundas — tudo que sente é absoluto, sem diluição, sem escapatória. Pode ter passado por crises emocionais transformadoras na infância que moldaram a forma como processa sentimentos para sempre. A mãe pode ter sido uma presença poderosa (controladora ou extremamente presente). Esta é a configuração de quem não tem escolha senão viver com autenticidade emocional total.',
    soft: 'Profundidade emocional como superpoder — você entende as camadas ocultas dos sentimentos humanos com precisão que poucos alcançam. Capacidade natural de regeneração: o que destruiria outros emocionalmente, você transmuta em sabedoria. Há algo de curador na forma como você sustenta espaço para a dor alheia.',
    hard: 'Intensidade emocional que pode se tornar manipulação, obsessão ou necessidade de controle sobre a vida emocional dos outros. A mãe pode ter sido controladora ou a dinâmica familiar incluía segredos poderosos. O que parece necessidade de controle é na verdade medo profundo de ser destruído pela própria vulnerabilidade. A cura vem ao soltar — ao confiar que as emoções podem ser sentidas sem que te destruam.',
  },

  // --- VENUS-MARS (amor-ação) ---
  'venus-mars': {
    conjunction: 'Desejo e afeto fundidos — atração magnética, sexualidade expressiva, paixão intensa. Você sabe o que quer no amor e vai atrás.',
    soft: 'Harmonia entre dar e receber no amor. Sexualidade saudável e integrada. Atração e afeto trabalham juntos.',
    hard: 'Tensão entre o que deseja e o que atrai — pode querer tipos que não são bons para você, ou ter conflito entre independência e parceria. A lição é integrar ternura e paixão.',
  },
  'venus-saturn': {
    conjunction: 'Amor sério e comprometido — pode demorar para se abrir porque o coração aprendeu que vulnerabilidade tem consequências. Medo de rejeição é profundo, mas igualmente profunda é a capacidade de amar com consistência quando a confiança se estabelece. O amor aqui não é flashy — é o tipo que constrói patrimônio emocional ao longo de décadas.',
    soft: 'Relações maduras e duradouras que melhoram com o tempo. Você leva amor a sério e constrói parcerias sólidas com paciência e responsabilidade. Há uma integridade na forma como você ama que atrai pessoas que também valorizam compromisso. O tempo é seu aliado no amor.',
    hard: 'Medo profundo de não ser amável — dificuldade em se abrir, relações com pessoas mais velhas ou emocionalmente inacessíveis que reforçam a sensação de ter que "ganhar" o amor. Esta configuração não indica que você será sozinho — indica que a vida pede que você dissolva a crença de que amor precisa ser merecido. A lição é radical: você é digno de amor sem precisar provar absolutamente nada.',
  },
  'venus-neptune': {
    conjunction: 'Amor idealizado — romântico, artístico, às vezes ilusório. Dificuldade em ver o outro como é. Amor como experiência espiritual.',
    soft: 'Romantismo saudável, sensibilidade artística refinada. Você ama com profundidade e beleza.',
    hard: 'Ilusão no amor — pode atrair parceiros que precisam de resgate ou se perder em fantasias românticas. A lição é amar sem projetar.',
  },
  'venus-pluto': {
    conjunction: 'Amor intenso e transformador — seus relacionamentos não são casuais; são experiências que mudam sua vida inteira. A intensidade que você sente no amor não é anormal; é a profundidade de sua própria psique finalmente pedindo atenção. Possessividade e magnetismo andam juntos porque amar, para você, é mergulhar totalmente. O desafio é permitir que o amor exista sem precisar controlá-lo.',
    soft: 'Capacidade de amar profundamente e se transformar através das relações — cada vínculo significativo te deixa mais inteiro, não menos. Atração magnética natural que funciona sem esforço. Há uma sabedoria na forma como você navega a intimidade que permite curar tanto a si quanto aos outros.',
    hard: 'Dinâmicas de poder no amor — ciúme, controle, medo de perda, atração por relações que parecem proibidas ou intensas demais. O que parece obsessão é na verdade a alma pedindo uma experiência de amor que não se esconda da verdade. Estruturas de relação construídas sobre medo colapsam naturalmente quando a consciência se expande. A cura vem ao amar sem possuir — ao confiar que profundidade não requer grades.',
  },

  // --- MARS-SATURN (ação-limite) ---
  'mars-saturn': {
    conjunction: 'Determinação de aço — quando decide algo, vai até o fim. Pode haver frustração com lentidão ou bloqueio. Disciplina marcial.',
    soft: 'Ação estratégica e paciente. Você combina energia com estrutura — execução disciplinada e resultados concretos.',
    hard: 'Raiva reprimida ou energia bloqueada. Pode sentir que tudo que faz encontra obstáculo. A lição é paciência estratégica — o timing de Saturno não é o de Marte.',
  },

  // --- JUPITER-SATURN (expansão-contração) ---
  'jupiter-saturn': {
    conjunction: 'Tensão produtiva entre expansão e contração. Grandes ambições que exigem trabalho real. Ciclo de 20 anos na sociedade.',
    soft: 'Equilíbrio entre otimismo e realismo. Você sonha grande E executa. Sucesso sustentável.',
    hard: 'Oscilação entre esperança e pessimismo, entre arriscar e se proteger. A lição é encontrar o meio-termo entre fé e disciplina.',
  },

  // --- MERCURY COM EXTERIORES ---
  'mercury-jupiter': {
    conjunction: 'Mente expansiva — você pensa grande, comunica com entusiasmo e tem facilidade para estudos superiores.',
    soft: 'Pensamento otimista e visão ampla. Facilidade com idiomas, filosofia e ensino.',
    hard: 'Pode prometer mais do que entrega mentalmente, dispersar em muitos interesses ou exagerar em argumentos.',
  },
  'mercury-saturn': {
    conjunction: 'Mente séria e estruturada — pensamento profundo mas pode ser pessimista ou lento para se expressar.',
    soft: 'Pensamento disciplinado e organizado. Comunicação precisa e responsável. Bom para escrita técnica.',
    hard: 'Dificuldade de expressão, medo de falar errado, bloqueio comunicativo. Com maturidade, vira comunicação autoridade.',
  },
  'mercury-uranus': {
    conjunction: 'Mente brilhante e elétrica — insights súbitos, pensamento original, pode ser genial ou caótico.',
    soft: 'Intuição intelectual forte. Facilidade com tecnologia, ciência e ideias revolucionárias.',
    hard: 'Mente inquieta e rebelde — dificuldade em seguir raciocínios lineares. Nervosismo mental. Pode parecer excêntrico.',
  },
  'mercury-neptune': {
    conjunction: 'Mente poética e intuitiva — grande imaginação, mas pode ter dificuldade com fatos concretos.',
    soft: 'Criatividade verbal, sensibilidade artística, comunicação inspiradora. Bom para música e poesia.',
    hard: 'Confusão mental, dificuldade de foco, pode mentir sem perceber ou acreditar em informações falsas. A lição é discernimento.',
  },
  'mercury-pluto': {
    conjunction: 'Mente investigativa e penetrante — você vai além da superfície. Palavras com poder de transformação.',
    soft: 'Capacidade de pesquisa profunda, psicologia, comunicação que transforma. Bom para investigação.',
    hard: 'Obsessão mental, pensamentos sombrios, comunicação manipuladora. A lição é usar o poder da palavra para curar, não controlar.',
  },

  // --- MARS COM EXTERIORES ---
  'mars-jupiter': {
    conjunction: 'Energia abundante e entusiástica — ação grandiosa, generosidade no esforço. Pode exagerar no impulso.',
    soft: 'Ação otimista e expansiva. Sucesso em empreendimentos, esporte e aventura.',
    hard: 'Impulsividade exagerada, excesso de confiança na ação. Pode se meter em situações maiores do que pode resolver.',
  },
  'mars-uranus': {
    conjunction: 'Ação explosiva e imprevisível — impulsos súbitos, necessidade de liberdade total, possível rebeldia.',
    soft: 'Energia inovadora e corajosa. Age de forma original e surpreende. Bom para empreendedorismo radical.',
    hard: 'Impulsividade perigosa, acidentes, rupturas súbitas. A lição é canalizar a energia rebelde em inovação construtiva.',
  },
  'mars-neptune': {
    conjunction: 'Ação inspirada ou confusa — pode ser o artista apaixonado ou o guerreiro sem direção.',
    soft: 'Energia direcionada por intuição e compaixão. Ação a serviço de ideais elevados.',
    hard: 'Energia dispersa, ação sem foco, pode usar escapismos como "combustível". A lição é agir com inspiração mas sem ilusão.',
  },
  'mars-pluto': {
    conjunction: 'Poder e determinação extremos — quando quer algo, move montanhas. Pode ser obsessivo ou destrutivo.',
    soft: 'Força de transformação — capacidade de regeneração, resistência extraordinária. Poder usado com sabedoria.',
    hard: 'Raiva destrutiva, compulsividade, dinâmicas de poder. Pode atrair situações de violência ou coerção. A cura é empoderamento consciente.',
  },

  // --- SATURN COM EXTERIORES ---
  'saturn-uranus': {
    conjunction: 'Tensão entre tradição e inovação — estrutura que precisa se adaptar ou rachar.',
    soft: 'Capacidade de inovar dentro de estruturas. Reforma ao invés de revolução. Mudança responsável.',
    hard: 'Conflito entre segurança e liberdade. Sensação de estar preso em estruturas que não suporta mais. Rupturas periódicas.',
  },
  'saturn-neptune': {
    conjunction: 'Sonhos que precisam de forma — materializar ideais, espiritualidade com disciplina.',
    soft: 'Capacidade de dar forma concreta a visões e inspirações. Artista disciplinado ou místico prático.',
    hard: 'Desilusão, medo do desconhecido, depressão existencial. A lição é ter fé sem ingenuidade e estrutura sem rigidez.',
  },
  'saturn-pluto': {
    conjunction: 'Poder e controle profundos — capacidade de resistir a qualquer coisa. Pode haver experiências extremas de restrição.',
    soft: 'Determinação inabalável. Capacidade de transformar através de disciplina e paciência. Resiliência profunda.',
    hard: 'Opressão, lutas de poder com autoridades, medo existencial. Pode vivenciar perda de poder para depois reconstruir com mais força.',
  },

  // --- JUPITER COM EXTERIORES (aspectos individuais importantes) ---
  'jupiter-uranus': {
    conjunction: 'Sorte e liberdade fundidas — você nasce com uma faísca de originalidade que abre portas inesperadas. Intuição forte sobre o futuro, otimismo com inovação. Oportunidades chegam de formas incomuns e repentinas, e você tem o instinto de aproveitá-las antes que outros percebam o potencial.',
    soft: 'Expansão e originalidade trabalham em harmonia — você cresce quando se permite inovar. Viagens, aprendizados inesperados e revelações súbitas que abrem horizontes. Há uma leveza na forma como você lida com mudanças que outros achariam desestruturantes.',
    hard: 'Tensão entre a busca por mais e a necessidade de liberdade total. Pode se tornar inquieto com qualquer estrutura que limite o crescimento, saltando de oportunidade em oportunidade sem consolidar. A lição é aproveitar a expansão sem fugir da profundidade que o tempo traz.',
  },
  'jupiter-neptune': {
    conjunction: 'Fé e visão espiritual amplificadas — you believe before you see. Idealismo generoso, espiritualidade expansiva, senso de missão maior. Ao mesmo tempo, é fácil se perder em visões sem ancoragem prática. A casa onde cai revela onde o sonho encontra a realidade — e onde a ilusão pode ser mais sedutora.',
    soft: 'Espiritualidade e otimismo se reforçam mutuamente. Facilidade com meditação, artes, compaixão e qualquer prática que expanda a consciência além do ego. Você inspira os outros com a qualidade da sua fé — não a fé dogmática, mas a fé que sente o invisível como real.',
    hard: 'Excesso de idealismo — pode apostar em causas, pessoas ou projetos com base em visão ao invés de evidência, e se sentir traído quando a realidade não corresponde ao sonho. A lição não é abandonar a fé, mas aprender a distinguir inspiração genuína de ilusão confortável.',
  },
  'jupiter-pluto': {
    conjunction: 'Poder e expansão fundidos — quando você quer algo, não há meio-termo. Capacidade extraordinária de mobilizar recursos, influenciar pessoas e crescer através de transformações que destroem o que era pequeno para dar lugar ao que é grande. Figuras de poder aparecem como espelhos do seu próprio potencial — ou como obstáculos que revelam onde você ainda precisa crescer.',
    soft: 'Crescimento através de transformação profunda — cada ciclo de morte e renascimento em sua vida te encontra maior, mais capaz e mais sábio. Facilidade em acumular influência ou recursos de forma sustentável. Há uma qualidade de líder que renasce das cinzas na sua trajetória que inspira lealdade genuína.',
    hard: 'Sede de poder que pode se tornar obsessão por controle — expansão que não aceita limites, ambição que passa por cima de outros ou atração por estruturas de poder que prometem mais do que entregam. A lição é usar a capacidade de transformar o mundo começando pelo que não pode mais ser sustentado internamente.',
  },

  // --- URANUS-NEPTUNE-PLUTO (aspectos geracionais) ---
  'uranus-neptune': {
    conjunction: 'Aspecto geracional que define os nascidos ~1990-1996: a geração que cresceu na fronteira entre o mundo analógico e o digital, entre a razão e a espiritualidade pós-religiosa. Urânio e Netuno fundidos trazem visões de futuro carregadas de sensibilidade — inovação que não perde a alma. Na casa onde cai, revela onde essa pessoa carrega a assinatura de uma época de transição: onde o tecnológico e o transcendente se encontram.',
    soft: 'Quando em trígono ou sextil com planetas pessoais, essa energia geracional se ativa individualmente: intuição elétrica aliada a compaixão, capacidade de usar tecnologia a serviço do humano. Estas pessoas têm um radar natural para o que o futuro pede — não por previsão racional, mas por uma sensibilidade que capta o zeitgeist antes que ele se articule em palavras.',
    hard: 'Quando a quadratura ou oposição com planetas pessoais ativa essa energia, a tensão se torna individual: onde a visão coletiva do que poderia ser encontra o que realmente é. Pode se manifestar como desilusão com o futuro prometido, ou como a pressão criativa de quem sente o abismo entre o ideal e o real — e não consegue ignorar nenhum dos dois lados.',
  },
  'uranus-pluto': {
    conjunction: 'Aspecto geracional dos nascidos ~1963-1968: a geração Plutão em Virgem/Urânio em Virgem, que chegou ao mundo no auge da revolução cultural e carregou na psique a marca de que transformações radicais são possíveis e necessárias. Não é inquietude — é a lembrança celular de que o status quo pode ser rasgado. Na casa onde cai, aponta o setor da vida onde essa pessoa carrega o impulso revolucionário como herança geracional.',
    soft: 'Quando essa conjunção geracional recebe aspectos suaves dos planetas pessoais, a energia se traduz em capacidade de usar crises como trampolins — não de forma ingênua, mas com a sabedoria de quem sabe que o que colapsa já estava oco por dentro. Há uma resiliência específica nessas pessoas: não a resiliência de quem nunca caiu, mas de quem aprendeu que cair faz parte do ritmo.',
    hard: 'A quadratura de Urânio com Plutão (2012-2015) foi o aspecto coletivo mais tenso do início do século XXI, e quem tem planetas pessoais ativados por ela carrega esse padrão individualmente: a tensão entre desejo de ruptura e forças que resistem à mudança. Pode se manifestar como conflitos de poder, rupturas involuntárias ou a sensação de viver em um mundo que precisa urgentemente mudar mas encontra resistência em cada esquina.',
  },
  'neptune-pluto': {
    conjunction: 'O aspecto mais lento do sistema solar — o ciclo completo dura ~492 anos, e a última conjunção ocorreu em ~1891-1892, em Gêmeos. Toda pessoa viva hoje carrega o sextil de Netuno com Plutão em seu mapa, pois esse aspecto dominou o século XX inteiro. É uma marca epocal: a geração que viveu a dissolução das certezas do século XIX e a emergência de uma nova consciência coletiva. Na posição por casa, revela onde esse impulso de transformação civilizacional encontra expressão individual.',
    soft: 'O sextil que dominou o século XX (e persiste) representa a corrente subterrânea da transformação espiritual coletiva fluindo em direção à evolução da consciência. Individualmente, quando ativa planetas pessoais, traz uma qualidade de profeta discreto — alguém que percebe para onde a história está indo antes que se torne visível. Compaixão com profundidade, espiritualidade que não teme a sombra.',
    hard: 'A quadratura e oposição de Netuno-Plutão pertencem a gerações distantes do presente — a última oposição foi em ~1897, a próxima será em ~2140. Quando presente em mapa histórico ou em trânsito ativando planetas pessoais, representa a tensão máxima entre o poder de dissolução e o poder de transformação: épocas onde o que era sagrado colapsa e o que emerge ainda não tem nome.',
  },

  // --- QUÍRON (A Ferida que Cura) ---
  'sun-chiron': {
    conjunction: 'A ferida está fundida à identidade — pode ter crescido sentindo que há algo fundamentalmente "errado" em quem você é. Mas é exatamente essa sensibilidade à dor identitária que te torna capaz de ajudar outros a se encontrarem. Quando para de tentar "consertar" a si mesmo e aceita a totalidade do que é, emerge uma autenticidade magnética.',
    soft: 'Facilidade em integrar suas feridas à identidade de forma saudável. Você transforma experiências de dor em sabedoria que inspira os outros. Há um dom natural para mentoria — as pessoas sentem que você entende o que é lutar para ser quem se é.',
    hard: 'Tensão entre identidade e ferida — pode sentir que precisa esconder suas vulnerabilidades para ser respeitado, ou que brilhar significa trair a dor que carrega. A lição é que sua luz não nega sua sombra; elas coexistem. Quem integra essa tensão se torna um farol para outros que também lutam para existir.',
  },
  'moon-chiron': {
    conjunction: 'A ferida está fundida às necessidades emocionais — pode ter aprendido que precisar é perigoso, que suas emoções são "demais" ou que o cuidado materno tinha preço. Mas essa mesma sensibilidade emocional amplificada é o que te permite perceber a dor alheia com precisão rara. Curandeiros emocionais natos.',
    soft: 'Suas emoções e suas feridas trabalham juntas de forma construtiva. Você usa a experiência de dor emocional para se conectar com empatia genuína. Há uma qualidade maternal na forma como sustenta espaço para a vulnerabilidade dos outros.',
    hard: 'Tensão entre necessidades emocionais e padrões de dor — pode oscilar entre buscar nutrição desesperadamente e se retirar completamente por medo de ser ferido novamente. A mãe pode ter sido fonte tanto de amor quanto de ferida. A cura vem ao aprender que precisar não é fraqueza, e que você pode se nutrir sem repetir os padrões que herdou.',
  },
  'mercury-chiron': {
    conjunction: 'A ferida está fundida à comunicação e ao intelecto — pode ter sido silenciado, ridicularizado por suas ideias ou ter sentido que sua forma de pensar era "errada". Mas essa mesma sensibilidade às palavras é o que te torna um comunicador extraordinário quando curado. A voz que foi silenciada se torna a voz que dá permissão aos outros para falarem.',
    soft: 'Facilidade em usar palavras para curar. Você articula o que os outros sentem mas não conseguem nomear. Dom natural para escrita terapêutica, ensino transformador ou qualquer forma de comunicação que conecta mente e coração.',
    hard: 'Tensão entre pensamento e ferida — dificuldade em ser ouvido, medo de falar errado, ou uso da inteligência como armadura para evitar vulnerabilidade. O desafio é confiar que sua voz tem valor mesmo quando treme — especialmente quando treme.',
  },
  'venus-chiron': {
    conjunction: 'A ferida está fundida ao amor e aos relacionamentos — pode ter internalizado que não é digno de amor, que intimidade é perigosa ou que dar é mais seguro que receber. Mas essa mesma sensibilidade relacional é o que te dá uma percepção rara sobre o que o amor verdadeiro exige. Quando para de tentar "merecer" o amor, ele chega sem esforço.',
    soft: 'Suas relações são fonte de cura — tanto para você quanto para os outros. Há uma beleza na forma como você ama que vem exatamente de ter conhecido a dor. Você atrai parceiros que precisam ser vistos, e ao vê-los, também se cura.',
    hard: 'Tensão entre amor e ferida — pode atrair parceiros que reativam suas dores mais antigas, ou se sabotar quando o amor está indo "bem demais". O padrão de repetição não é masoquismo; é a psique tentando curar através da re-exposição. A lição é que você pode escolher conscientemente um amor diferente.',
  },
  'mars-chiron': {
    conjunction: 'A ferida está fundida à ação, à assertividade e ao poder pessoal — pode ter aprendido que agir é perigoso, que sua raiva é destrutiva ou que seu direito de querer está comprometido. Mas essa mesma sensibilidade à violência (sofrida ou temida) é o que te dá uma percepção única sobre poder saudável. O guerreiro ferido que para de temer sua própria força se torna protetor.',
    soft: 'Sua ação no mundo é informada pela experiência de dor. Há uma qualidade de "guerreiro consciente" — você sabe como usar força sem destruir porque conhece o custo da destruição. Dom para artes marciais, ativismo ou qualquer campo que use poder a serviço da cura.',
    hard: 'Tensão entre ação e ferida — raiva reprimida, medo de ser agressivo, ou dificuldade em se defender quando necessário. Pode haver experiências onde sua força foi usada contra você ou onde agir trouxe consequências dolorosas. A lição é que sua raiva não é venenosa — é combustível sagrado quando canalizada com consciência.',
  },
};

// ============================================================
// FUNÇÃO: Buscar interpretação de aspecto
// ============================================================

export function getAspectInterpretation(planet1: string, planet2: string, aspectType: AspectType): string {
  // Normalizar ordem (busca bilateral)
  const key1 = `${planet1}-${planet2}`;
  const key2 = `${planet2}-${planet1}`;
  const entry = PLANET_ASPECTS[key1] || PLANET_ASPECTS[key2];

  if (!entry) return '';

  const nature = ASPECT_NATURE[aspectType];
  if (!nature) return '';

  if (aspectType === 'conjunction') return entry.conjunction;
  if (nature.nature === 'soft') return entry.soft;
  if (nature.nature === 'hard') return entry.hard;

  return entry.conjunction; // fallback
}
