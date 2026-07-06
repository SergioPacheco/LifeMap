// ============================================================
// INTERPRET.TS — Interpretation Engine
// Abordagem: Planeta na CASA primeiro (prático), depois signo como tempero
// Baseado em astrologia humanística: autoconhecimento e potencial
// ============================================================

import { getSignIndex } from '../engine/calculations';
import type { NatalChart } from '../engine/types';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../engine/chiron';

// ============================================================
// PLANET IN HOUSE — Interpretações narrativas e práticas
// Foco: o que o planeta PEDE na área de vida (casa)
// ============================================================

const SUN_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Seu brilho pessoal está na forma como você se apresenta ao mundo. Você veio para ser visto, para marcar presença. A casa 1 pede que você honre sua individualidade — quando você se permite ser quem é, sem máscaras, as coisas fluem. Seu desafio é não depender da aprovação alheia para brilhar.',
  /* Casa 2 */ 'Sua identidade está profundamente ligada àquilo que você constrói e valoriza. Você brilha quando desenvolve seus talentos e os transforma em algo concreto. Segurança material não é vaidade para você — é expressão do seu valor. O desafio é não se definir apenas pelo que possui.',
  /* Casa 3 */ 'Você nasceu para comunicar, ensinar, conectar ideias. Seu brilho está na leveza, na curiosidade, na capacidade de traduzir coisas complexas em algo acessível. Se você trabalha num lugar onde não pode expressar sua opinião ou criar, algo estará faltando. Quando você honra essa qualidade comunicativa, a abundância vem.',
  /* Casa 4 */ 'Sua identidade está enraizada na família, no lar, nas suas bases emocionais. Você brilha quando cria um espaço seguro — para si e para os outros. Pode ser a pessoa que sustenta emocionalmente uma família ou comunidade. O desafio é não se perder nas necessidades dos outros a ponto de esquecer de si.',
  /* Casa 5 */ 'Você nasceu para criar, se expressar, brilhar! A casa 5 é o palco natural do Sol. Criatividade, romance, filhos, diversão — tudo isso te energiza. Quando você se permite ser lúdico e autêntico, você irradia. O desafio é não buscar validação constante nem confundir ego com essência.',
  /* Casa 6 */ 'Sua identidade se expressa no serviço, na rotina, no aprimoramento constante. Você brilha quando é útil, quando resolve problemas, quando cuida dos detalhes que ninguém vê. Saúde e trabalho são áreas sagradas para você. O desafio é não se anular em nome da produtividade.',
  /* Casa 7 */ 'Seu brilho se revela nos relacionamentos. Você se descobre através do outro — parceiros, sócios, acordos. Isso não significa dependência: significa que o espelho do relacionamento te ajuda a enxergar quem você é. O desafio é não se perder no outro nem projetar sua identidade em parceiros.',
  /* Casa 8 */ 'Sua identidade passa por transformações profundas ao longo da vida. Você brilha em situações de crise, quando tudo parece desmoronar e você renasce. Temas como sexualidade, poder, recursos compartilhados são centrais. O desafio é não se apegar ao controle nem temer a vulnerabilidade.',
  /* Casa 9 */ 'Você nasceu para expandir horizontes — estudos profundos, viagens que mudam sua perspectiva, filosofias de vida. Seu brilho está em ser um eterno estudante e, eventualmente, um mestre que compartilha sabedoria. O desafio é não se perder em teorias sem aplicação prática.',
  /* Casa 10 */ 'Sua identidade está fortemente ligada à sua carreira e imagem pública. Você veio para construir algo no mundo, para ser reconhecido pelo que realiza com maestria. Não é vaidade — é propósito. O desafio é equilibrar vida pessoal com a pressão por resultados externos.',
  /* Casa 11 */ 'Seu brilho está em causas coletivas, amizades, projetos para o futuro. Você se energiza em grupos, quando trabalha por algo maior que você mesmo. Inovação e originalidade te definem. O desafio é não se distanciar emocionalmente das pessoas mais próximas.',
  /* Casa 12 */ 'Sua identidade tem uma dimensão espiritual profunda. Você brilha nos bastidores, na solidão criativa, na conexão com algo maior. Pode ser difícil se mostrar ao mundo porque seu brilho é sutil, interior. O desafio é não se sabotar nem fugir da vida prática.',
];

const MOON_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Suas emoções estão escritas no seu rosto — você é transparente, as pessoas sentem o que você sente. Precisa de liberdade para ser emocional sem julgamento. Seu corpo reage diretamente ao seu estado emocional.',
  /* Casa 2 */ 'Você se sente seguro quando tem estabilidade financeira. Não é ganância — é que dinheiro representa segurança emocional para você. Pode ter altos e baixos financeiros que refletem seus ciclos emocionais.',
  /* Casa 3 */ 'Você processa emoções conversando, escrevendo, movimentando a mente. Precisa de estímulo intelectual para se sentir bem. O ambiente dos irmãos e vizinhança marcou suas emoções na infância.',
  /* Casa 4 */ 'Esta é a posição mais natural da Lua. Família e lar são sagrados para você. Precisa de um espaço físico que sinta como "seu" para se recarregar. As emoções da sua mãe (ou figura materna) impactaram profundamente quem você é.',
  /* Casa 5 */ 'Você se nutre emocionalmente quando se diverte, cria algo ou está apaixonado. Precisa de expressão criativa como válvula emocional. Com filhos, a relação é intensa e profundamente emocional.',
  /* Casa 6 */ 'Sua saúde física é diretamente impactada pelas suas emoções. Quando algo emocional não vai bem, o corpo sinaliza. Precisa de uma rotina que inclua autocuidado para se sentir centrado.',
  /* Casa 7 */ 'Você se sente emocionalmente completo em relacionamentos. Precisa de parceria para se sentir seguro — e atrai parceiros que espelham seu lado emocional (inclusive as sombras). O desafio é não terceirizar seu bem-estar emocional.',
  /* Casa 8 */ 'Suas emoções são intensas, profundas, às vezes avassaladoras. Você sente tudo com muita intensidade e tem facilidade para perceber o que os outros escondem. Pode ter dificuldade de se abrir, mas quando confia alguém, é com alma.',
  /* Casa 9 */ 'Você se nutre emocionalmente quando está aprendendo, viajando ou explorando novas perspectivas. Precisa de espaço e liberdade para crescer. Pode ter dificuldade com rotina e com conexões emocionais "normais" — prefere profundidade filosófica.',
  /* Casa 10 */ 'Suas emoções estão ligadas à carreira e reconhecimento público. Pode sentir que precisa "ser alguém" para merecer amor. A relação com a mãe pode ter sido marcada por expectativas de desempenho.',
  /* Casa 11 */ 'Você se nutre em amizades e causas coletivas. Precisa de pertencimento a um grupo que compartilhe seus ideais. Pode ter dificuldade com intimidade um-a-um, preferindo relações mais amplas.',
  /* Casa 12 */ 'Suas emoções têm uma qualidade oceânica — profundas, às vezes confusas, com fronteiras difusas. Precisa de solidão para processar o que sente. Tem forte intuição e empatia, mas precisa aprender a se proteger emocionalmente.',
];

const MERCURY_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Sua mente é rápida e define a forma como o mundo te percebe. Você pensa em voz alta, processa em tempo real e as pessoas te identificam imediatamente como alguém inteligente e comunicativo. Seu temperamento nervoso e intuitivo te dá habilidade natural para o comércio de ideias. O desafio é desacelerar o suficiente para ouvir — sua mente avança tão rápido que pode atropelar as respostas que chegam devagar.',
  /* Casa 2 */ 'Sua inteligência é sua maior ferramenta de geração de riqueza. Você ganha dinheiro através da mente — escrita, jornalismo, comércio, administração, ensino ou qualquer forma de trabalho intelectual. Há um faro natural para negócios e para identificar onde está o valor. O desafio é não reduzir toda a inteligência à utilidade financeira — sua mente precisa de liberdade para explorar, não apenas para lucrar.',
  /* Casa 3 */ 'Posição natural de Mercúrio — sua mente está em casa aqui. Facilidade extraordinária para aprender, comunicar e se expressar. Você assimila informações rapidamente, transita entre assuntos com leveza e tem um espírito jovial que mantém o ambiente ao redor leve. Sucesso com escritos, ensino e qualquer forma de transmissão de conhecimento. O desafio é a profundidade: quando tudo vem fácil, pode faltar incentivo para mergulhar verdadeiramente fundo.',
  /* Casa 4 */ 'Sua mente está enraizada na família, nas memórias e na herança intelectual dos seus pais. Você pode ser a pessoa que guarda as histórias da família, que trabalha de casa, ou cuja profissão foi inspirada pelo ambiente doméstico. Há uma vivacidade intelectual que te acompanha até o fim da vida. Capacidade notável de se adaptar a mudanças — cada recomeço é uma oportunidade de reescrever sua narrativa.',
  /* Casa 5 */ 'Sua mente é criativa e lúdica — você expressa ideias de forma divertida e envolvente. Há talento natural para o ensino, especialmente com crianças ou jovens. Amor pelo jogo, por palavras cruzadas, enigmas e desafios mentais. Nos relacionamentos, racionaliza o amor — precisa entender intelectualmente antes de se entregar. Quando a mente se alinha com o coração, sua comunicação se torna irresistível.',
  /* Casa 6 */ 'Sua mente é uma máquina de resolver problemas — analítica, precisa e incansável. Grande capacidade de trabalho intelectual, especialmente em funções de secretariado, administração, saúde ou qualquer coisa que exija organização metódica. Você se destaca pela eficiência e pelo engenho. O desafio é a tensão nervosa: a mesma mente que resolve tudo pode se sobrecarregar se não encontrar válvulas de descanso.',
  /* Casa 7 */ 'Sua mente funciona melhor em diálogo — você precisa do outro para pensar, debater e processar ideias. Excelente para mediação, negociação e qualquer forma de parceria intelectual. Pode atrair cônjuges mercuriais (comunicativos, inquietos, versáteis). O sucesso literário ou profissional pode vir de colaborações. O desafio é não depender do espelho alheio para validar suas próprias ideias.',
  /* Casa 8 */ 'Sua mente é investigativa — você vai naturalmente além da superfície, atraído por mistérios, psicologia profunda, ocultismo e tudo que está oculto. Percebe o que não é dito, lê nas entrelinhas com facilidade perturbadora. Pode haver interesse por temas de morte, transformação, heranças ou sexualidade. O desafio é usar esse poder de penetração para curar, não para manipular.',
  /* Casa 9 */ 'Sua mente é filosófica e expansiva — orientada para o sentido da vida, não apenas para os fatos. Aptidão natural para línguas estrangeiras, estudos superiores, viagens que expandem a perspectiva. Há objetividade para aceitar críticas e ideias contrárias, desde que baseadas em seriedade intelectual. O desafio é não se perder em teorias abstratas sem aplicação — a sabedoria precisa ser vivida.',
  /* Casa 10 */ 'Comunicação é sua ferramenta de carreira — você se destaca profissionalmente pela inteligência e articulação. Posição por excelência do intermediário, do comunicador público, do intelectual que conquista posição. Múltiplas atividades profissionais são possíveis ao longo da vida. O desafio é manter foco: a versatilidade que te permite transitar entre campos pode dispersar a energia se não houver uma direção clara.',
  /* Casa 11 */ 'Sua mente é voltada para o futuro — projetos intelectuais, causas coletivas, difusão do pensamento. Você se comunica excepcionalmente bem em grupos e tem facilidade para fazer amizades baseadas em troca intelectual. Os amigos são variados e estimulantes. O desafio é não se perder na abstração dos ideais coletivos a ponto de negligenciar as conexões íntimas que também precisam de você.',
  /* Casa 12 */ 'Sua mente é contemplativa e intuitiva — insights chegam através de sonhos, meditação e momentos de solidão. Há aptidão natural para trabalhar com o inconsciente: psicologia, escrita introspectiva, pesquisa sobre o oculto. Pode haver dificuldade em verbalizar o que sente, porque o que você percebe é mais amplo do que as palavras alcançam. O desafio é confiar na sua percepção sutil sem se perder na indefinição.',
];

const VENUS_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Você irradia charme naturalmente — há uma presença agradável e harmoniosa que atrai as pessoas antes mesmo de você falar. Ternura, emotividade intensa e sensibilidade são sua marca. Ganhos e bem-estar podem vir através de atividades ligadas à arte, moda, perfumes e estética. Quando você entra num ambiente, algo suaviza. O desafio é não se apoiar exclusivamente na beleza ou no agrado como forma de existir no mundo.',
  /* Casa 2 */ 'Amor por conforto material e coisas belas — e isso não é vaidade, é inteligência sensorial. Você tem um olho natural para qualidade e valor duradouro. Facilidade de ganhos através da pessoa amada ou de atividades que envolvem estética e prazer. Pode construir uma vida em comum plena de graça e abundância. O desafio é não confundir amor com segurança financeira, nem usar bens como substituto de afeto.',
  /* Casa 3 */ 'Comunicação sedutora e agradável — suas palavras têm um charme que desarma. Harmonia nas relações com irmãos e vizinhos. A amizade é um sentimento do qual você não pode prescindir — precisa de conexões intelectuais que também sejam afetivas. Amor pelas artes, pela palavra bonita, pela conversa que alimenta a alma. O desafio é não confundir charme com profundidade.',
  /* Casa 4 */ 'Seu amor se expressa criando lares bonitos e acolhedores — espaços que nutrem quem entra. Harmonia profunda entre você e seus pais, ou pelo menos uma profunda necessidade disso. Na idade madura, o amor floresce com intensidade renovada. Comércio venusiano exercido em casa (arte, antiguidades, decoração, estética). O desafio é não se prender tanto ao conforto doméstico que perca aventura.',
  /* Casa 5 */ 'Posição poderosa de Vênus — amor romântico intenso, prazeroso e dramático. Grande capacidade criativa em artes, música, teatro. Fortuna nas relações mundanas e sociais. Os filhos dão satisfações profundas. Você ama com generosidade e espera ser adorado de volta. O desafio é não transformar o amor em performance — às vezes o afeto mais verdadeiro é silencioso.',
  /* Casa 6 */ 'Você expressa amor através do cuidado prático — aprende os hábitos do outro, prepara o que ele precisa antes de pedir, está presente nos detalhes invisíveis. O amor pode nascer no ambiente de trabalho, entre colegas. Aprecia rotinas agradáveis e ambientes esteticamente harmoniosos. O desafio é não reduzir o amor ao serviço — você também merece ser cuidado, não apenas cuidar.',
  /* Casa 7 */ 'Posição natural de Vênus — parceria é sua arte. Você atrai relacionamentos com facilidade e tem um dom natural para criar harmonia a dois. Casamento sem crises graves é possível quando há respeito mútuo e beleza na interação. Popularidade natural, especialmente quando expressa através de arte ou diplomacia. O desafio é não se anular para manter a paz — harmonia real não exige que você desapareça.',
  /* Casa 8 */ 'Amor intenso e transformador — seus relacionamentos são profundos, mexem com a alma e envolvem temas de poder, vulnerabilidade e sexualidade. A vida sentimental sofre influência da situação financeira e dos recursos compartilhados. Prodigalidade possível. O desafio é não usar o amor como instrumento de controle, nem confundir intensidade com qualidade de vínculo.',
  /* Casa 9 */ 'O amor e a aventura se entrelaçam — pode se apaixonar por estrangeiros, por culturas diferentes, por pessoas com filosofias de vida expansivas. Viagens de prazer. Ideal artístico elevado. Relacionamentos que ampliam sua visão de mundo. O desafio é não idealizar tanto o "distante" que o amor próximo e cotidiano pareça insuficiente.',
  /* Casa 10 */ 'Relacionamentos ligados à carreira — grande fortuna e reconhecimento para quem exerce profissão artística, carreira na moda, ou qualquer campo que valorize beleza e charme pessoal. As pessoas te veem publicamente como alguém atraente e agradável. O desafio é separar amor verdadeiro de amor por status — e permitir-se ser amado pelo que é, não pelo que conquistou.',
  /* Casa 11 */ 'O amor nasce da amizade — seus romances mais duradouros começam como conexão intelectual e social. Charme e capacidade de sedução em grupos. Facilidade para contrair amizades influentes que ajudam na afirmação profissional. Valoriza liberdade nos relacionamentos e conexão com pessoas de mente aberta. O desafio é não evitar intimidade verdadeira escondendo-se atrás da sociabilidade.',
  /* Casa 12 */ 'Amor secreto, espiritual ou platônico — há uma qualidade transcendente na forma como você ama que nem sempre encontra expressão no mundo concreto. Relações secretas são possíveis, assim como amores que se transformam profundamente com o tempo. Vênus aqui alivia desgostos pela arte e pela contemplação. O desafio é trazer esse amor para a superfície — o que é apenas interior permanece incompleto.',
];

const MARS_IN_HOUSE: string[] = [
  /* Casa 1 */ 'Combatividade e entusiasmo definem sua presença — você irradia energia, assertividade e uma disposição para a ação que as pessoas sentem imediatamente. Aptidão natural para atividades que exigem liderança, iniciativa ou competição. Você vai atrás do que quer sem hesitar, o que é uma força imensa quando canalizada com consciência. O desafio é que sua agressividade pode surgir em múltiplas formas sem que você perceba — aprender a modular a intensidade é seu trabalho de maturidade.',
  /* Casa 2 */ 'Sua energia e determinação estão canalizadas para construir recursos — você luta ativamente pelo que é seu, com disposição para trabalhar duro pelo enriquecimento e pela segurança material. Provimentos podem vir de áreas que exigem força, coragem ou competição (indústria, esporte, empreendedorismo). O desafio é a tendência ao excesso de gastos — a mesma energia que conquista pode dissipar se não houver estratégia financeira.',
  /* Casa 3 */ 'Comunicação direta, assertiva e às vezes cortante — seu espírito é combativo, crítico e não faz concessões na hora de defender uma ideia. Pode haver atrito com irmãos ou no ambiente imediato. Mente rápida e intolerante com a mediocridade intelectual. Perigo de acidentes em deslocamentos rápidos. O desafio é transformar a espada das palavras em ferramenta — a mesma linguagem que fere pode mobilizar e inspirar.',
  /* Casa 4 */ 'Sua energia está profundamente ligada ao lar e às raízes — pode ter vivido um ambiente doméstico intenso, com um pai autoritário ou educação excessivamente severa. Você trabalha duro pelo conforto da família e defende seu espaço com ferocidade. Energias vivaces que te acompanham até o fim da vida. O desafio é não reproduzir a intensidade que recebeu — criar um lar que seja refúgio, não campo de batalha.',
  /* Casa 5 */ 'Energia criativa, competitiva e apaixonada — você se destaca em esportes, artes ou qualquer forma de expressão que exija coragem e presença. Amor alcançado através da luta contra preconceitos ou conquistado com audácia. Amores marcados pela impulsividade e intensidade. O desafio é não confundir paixão com possessão — o fogo criativo é mais bonito quando ilumina sem queimar.',
  /* Casa 6 */ 'Trabalhador incansável — sua energia se canaliza para produtividade e resolução de problemas práticos. Trabalho pesado ou arriscado que exige coragem e disposição. Papel natural de líder operacional. Saúde robusta, mas com predisposição a febres, inflamações e estresse quando a energia fica represada. O desafio é equilibrar a intensidade produtiva com descanso — não você não é uma máquina, apesar de funcionar como uma.',
  /* Casa 7 */ 'Seus relacionamentos são arena de crescimento — você atrai parceiros assertivos, fortes e às vezes combativos. Violências emocionais nas relações e lutas de poder são possíveis. Casamento contraído precipitadamente, em idade jovem, com risco de separação se a energia não for canalizada em crescimento mútuo. O desafio é transformar a competitividade a dois em colaboração — o outro não é adversário, é espelho.',
  /* Casa 8 */ 'Posição de poder intenso — instinto de sobrevivência forte, capacidade de renascer das cinzas, sexualidade como força vital transformadora. Pode haver disputas por heranças ou envolvimento com situações de risco. Complicações cirúrgicas possíveis se houver aspectos tensos. O desafio é usar esse poder imenso para transformar conscientemente — não para destruir nem para se destruir.',
  /* Casa 9 */ 'Dedicação completa a uma causa — você defende suas crenças com paixão absoluta e não faz concessões quando se trata de verdade e justiça. Caráter que se entrega a aventuras mesmo diante de perigos. Pode haver viagens ousadas ou conflitos com sistemas de crença estabelecidos. O desafio é o fanatismo: a mesma paixão que te move pode cegar se não for temperada com humildade intelectual.',
  /* Casa 10 */ 'Ambição profissional poderosa — você usa determinação feroz para se afirmar na carreira e na vida pública. O nativo suscita hostilidade mas sabe lidar com ela — na verdade, prospera com desafio. Aptidão para liderança em qualquer campo que exija coragem e decisão. O desafio é não criar inimigos desnecessários na subida — o poder mais duradouro é o que constrói pontes, não o que queima.',
  /* Casa 11 */ 'Entusiasmo e liderança em grupos e causas coletivas — você é o amigo que mobiliza, que puxa a ação, que não aceita passividade. Amizade intensa e às vezes ditatorial: o grande amigo que, se não encontrar reciprocidade, pode se tornar adversário feroz. O desafio é permitir que outros também liderem — a causa coletiva não precisa de um general, precisa de um catalisador.',
  /* Casa 12 */ 'Energia sutil e introspectiva — você age nos bastidores, em segredo, ou de formas que nem sempre são visíveis para os outros. Pode haver raiva reprimida que precisa ser canalizada em práticas conscientes (arte, espiritualidade, ativismo silencioso). Hostilidades ocultas são possíveis. O desafio é não voltar essa energia contra si mesmo — Marte na 12ª precisa de canais de expressão, senão se torna autodestruição.',
];

// ============================================================
// PLANET IN SIGN — Complemento (o "tempero" na expressão)
// ============================================================

const SUN_SIGN_FLAVOR: string[] = [
  /* Áries */     'E faz isso com a coragem do pioneiro — age antes que os outros terminem de pensar, inicia o que ninguém ousou começar e inspira pelo exemplo direto. Sua energia se renova cada manhã como se fosse o primeiro dia. O desafio é a impaciência: aprender que nem tudo que vale a pena responde ao seu tempo.',
  /* Touro */     'E faz isso com a perseverança do construtor — termina o que começa, constrói com as mãos e com o tempo, e valoriza o que é real e tangível. Há uma inteligência sensorial que percebe qualidade onde outros veem apenas forma. O desafio é a resistência à mudança: o conforto pode se tornar prisão.',
  /* Gêmeos */    'E faz isso com a curiosidade do mensageiro — transita entre assuntos, pessoas e mundos com agilidade única, conectando pontos que ninguém mais vê. Há um dom comunicativo natural que traduz o complexo em acessível. O desafio é a profundidade: saber um pouco sobre tudo pode impedir mergulhar fundo em algo.',
  /* Câncer */    'E faz isso com a sensibilidade do guardião — percebe o estado emocional dos outros com precisão instintiva e cria ambientes onde as pessoas se sentem seguras para ser quem são. Há uma inteligência emocional profunda que funciona como bússola. O desafio é o apego ao passado: memórias podem ter mais presença que o momento.',
  /* Leão */      'E faz isso com a generosidade do soberano — irradia calor, inspira confiança e lembra aos outros que a vida pode ser celebrada. Há um magnetismo natural que ilumina qualquer ambiente em que entra. A criatividade é uma necessidade vital, não um hobby. O desafio é o orgulho: a necessidade de reconhecimento pode obscurecer a essência genuína.',
  /* Virgem */    'E faz isso com a precisão do artesão — vê o que está faltando, o que pode ser melhorado, o que está desalinhado, e transforma conceitos abstratos em sistemas funcionais. Há uma ética de trabalho que gera excelência genuína. O desafio é a autocrítica: o mesmo olho que vê defeitos nos outros volta-se para dentro com severidade.',
  /* Libra */     'E faz isso com a diplomacia do mediador — percebe o desequilíbrio em qualquer situação e busca instintivamente a harmonia, a justiça e a beleza. Há um charme social que faz cada pessoa sentir-se ouvida e valorizada. O desafio é a indecisão: ver todos os lados com clareza pode tornar impossível escolher um deles.',
  /* Escorpião */ 'E faz isso com a intensidade do alquimista — vai onde os outros não têm coragem de ir, vê o que está oculto e não se contenta com superfícies. Há uma profundidade psicológica que detecta motivações invisíveis e verdades não ditas. O desafio é a desconfiança: o medo de ser vulnerável pode se expressar como necessidade de controle.',
  /* Sagitário */ 'E faz isso com o entusiasmo do explorador — encontra ângulo de expansão em qualquer situação, busca verdade com honestidade direta e compartilha sabedoria com generosidade. Há um otimismo irredutível que inspira os outros a também acreditar. O desafio é o excesso: "mais é mais" pode levar a promessas maiores que a capacidade de cumprir.',
  /* Capricórnio */ 'E faz isso com a disciplina do arquiteto — constrói não apenas para o momento, mas para durar gerações. Há uma ambição com substância: não apenas quer subir, quer que o que construiu permaneça. A reputação é um ativo de décadas de consistência. O desafio é a rigidez: a dificuldade em relaxar ou permitir prazer sem culpa.',
  /* Aquário */   'E faz isso de forma genuinamente original — questiona o que todos aceitam, percebe possibilidades que a maioria não está pronta para ver e se importa com a humanidade como coletivo. Há um pensamento visionário que naturalmente se adianta ao tempo. O desafio é a distância emocional: amar a humanidade pode coexistir com dificuldade de intimidade individual.',
  /* Peixes */    'E faz isso com a compaixão do visionário — sente o que os outros sentem como se fosse seu, acessa imagens e intuições que a razão não alcança e percebe a conexão invisível entre todas as coisas. Há uma criatividade e espiritualidade naturais que transcendem o ordinário. O desafio é a dissolução de limites: absorver demais do ambiente pode gerar confusão sobre o que é seu e o que é do outro.',
];

const MERCURY_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Pensamento rápido, direto, sem rodeios. Toma decisões instantaneamente e se frustra com pessoas que "ficam em cima do muro". Excelente para lançar ideias novas e inspirar com entusiasmo — perde o fio quando o projeto exige paciência analítica. Comunicação por vezes brusca, mas sem segundas intenções.',
  /* Touro     */ 'Pensa de forma deliberada e sequencial — não é lento, é cuidadoso. Chega a conclusões sólidas que resistem ao tempo. Aprende melhor com exemplos concretos e aplicações práticas. Voz geralmente agradável, comunicação direta e com peso. Dificuldade em mudar de opinião uma vez que ela está formada.',
  /* Gêmeos    */ 'Mercúrio em seu domicílio — mente em alta velocidade, capaz de processar múltiplas informações simultaneamente. Linguagem vivaz, wit afiado, talento para argumentação. Pode falar pelos dois lados de uma questão com igual convicção. Excelente para jornalismo, ensino e escrita.',
  /* Câncer    */ 'Pensa com o coração tanto quanto com a mente. As palavras carregam emoção — e percebe a emoção por trás das palavras dos outros. Memória extraordinária para conversas e atmosferas. Pode demorar para responder, mas quando fala, o que diz fica. Comunicação por vezes indireta, mas profundamente honesta.',
  /* Leão      */ 'Pensa de forma criativa e grandiosa. Comunicação teatral, com estilo e presença que capturam a atenção. Excelente para apresentações, liderança e inspiração de grupos. Quando entusiasmado com uma ideia, a persuasão é irresistível. O desafio é ouvir perspectivas que contradizem a visão já formada.',
  /* Virgem    */ 'Mercúrio em exaltação — a mente mais precisa do zodíaco. Analisa, categoriza, encontra padrões que os outros não veem. Comunicação exata, com fatos e dados. Excelente para escrita técnica, pesquisa e ensino prático. Pode ser extremamente crítico na forma de se expressar, mesmo sem intenção de ferir.',
  /* Libra     */ 'Pensa em termos de relação — "de um lado... do outro lado". Comunicação diplomática, cuidadosa, que considera o impacto nas outras pessoas. Excelente mediador e negociador. Pode demorar a comunicar posições definitivas por medo de desagradar. Raciocina melhor em diálogo do que em isolamento.',
  /* Escorpião */ 'Pensa em camadas — sempre buscando o que está por baixo da superfície. Detecta incongruências, inconsistências e motivações ocultas com precisão perturbadora. Fala pouco, mas o que diz tem peso e profundidade. Excelente para pesquisa, psicologia e investigação. Pode ser mordaz quando provocado.',
  /* Sagitário */ 'Pensa em grandes sistemas, não em detalhes. Visão panorâmica, filosófica, orientada ao sentido e ao propósito. Comunicação entusiasmada e inspiradora que mobiliza. Pode ser impreciso nos detalhes ou falar antes de ter as informações completas. Excelente para ensino e discurso motivacional.',
  /* Capricórnio */ 'Pensa de forma estruturada, com metas e resultados em mente. Comunicação séria, concisa, com autoridade natural. Pesa as palavras antes de falar — não se interessa por conversa sem propósito. Excelente para planejamento, estratégia e administração. Humor seco e inteligente que poucos alcançam.',
  /* Aquário   */ 'Pensa em sistemas e padrões — vê conexões entre coisas aparentemente não relacionadas. Comunicação objetiva, às vezes brilhante, às vezes fria demais para quem espera calor humano. Excelente para inovação, ciência e pensamento estratégico. Pode apresentar ideias revolucionárias com uma calma desconcertante.',
  /* Peixes    */ 'Pensa em imagens, metáforas e sentimentos — não em conceitos lineares. Intuição como processo mental primário. Comunicação poética, impressionista, que captura verdades que a razão analítica não alcança. Pode ser difusa ou imprecisa, mas frequentemente está mais perto da essência do que a lógica permite.',
];

const VENUS_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Ama a conquista, a novidade, o frescor. Flerta sendo direta e audaciosa — vai atrás de quem deseja sem rodeios. Precisa que o relacionamento permaneça emocionante; estagna em rotinas muito confortáveis. Atraído por quem tem energia, independência e não tem medo de desafiar. O amor é uma aventura, não um porto seguro.',
  /* Touro     */ 'Vênus em domicílio — amor expresso pela sua forma mais sensual e material. Ama através do toque, da comida, da presença física constante. Precisa de estabilidade e previsibilidade no relacionamento. Possessivo, mas também incrivelmente fiel e consistente. Atraído por beleza natural, qualidade e conforto. Demora para se abrir, mas quando ama, é para valer.',
  /* Gêmeos    */ 'Ama através das palavras, das ideias, das conversas intermináveis que varam a noite. Precisa de estimulação intelectual no relacionamento — tédio é fatal. Flerta com wit e leveza. Atraído por pessoas inteligentes, versáteis, com histórias para contar. Pode parecer frio para quem espera intensidade emocional, mas conecta pela mente com profundidade surpreendente.',
  /* Câncer    */ 'Ama com profundidade emocional e cuidado — nutre e protege quem ama com toda a alma. Precisa sentir-se segura antes de se abrir completamente. Atraída por pessoas que transmitem estabilidade e proteção. O relacionamento ideal é um refúgio do mundo. Muito sensível a rejeição; guarda mágoas por muito tempo, mas também guarda amor.',
  /* Leão      */ 'Ama com generosidade e grandeza — gestos românticos, declarações, presentes elaborados, atenção total. Precisa ser admirada e celebrada no relacionamento. Atraída por pessoas confiantes, generosas e que a fazem sentir especial. Extremamente leal quando seu amor é reconhecido. O relacionamento precisa ser uma fonte de alegria e brilho mútuo.',
  /* Virgem    */ 'Ama através do serviço e da atenção aos detalhes — aprende seus hábitos, prepara o que você precisa antes de pedir, está presente nos pequenos gestos. Pode ter dificuldade em se expressar romanticamente de forma grandiosa. Atraída por pessoas competentes, inteligentes e éticas. Amor discreto, mas profundamente confiável e presente.',
  /* Libra     */ 'Vênus em domicílio — amor expresso em sua forma mais elegante e relacional. Precisa de parceria harmoniosa, com respeito mútuo e beleza na interação. Atraída por pessoas que valorizam a estética, a justiça e a cortesia. Conflitos abertos são muito desconfortáveis. O melhor do amor para Vênus em Libra é a criação de uma vida bonita a dois.',
  /* Escorpião */ 'Amor total ou nada — não existe intensidade moderada aqui. Precisa de profundidade, fusão e honestidade absoluta. Atraída pelo mistério, pela complexidade e pela sensação de que há sempre mais para descobrir. Ciúme pode ser intenso, assim como a devoção. Quando encontra alguém seguro o suficiente para a vulnerabilidade, a entrega é incomparável.',
  /* Sagitário */ 'Ama com liberdade e alegria — o parceiro é um companheiro de aventura, não uma âncora. Precisa de espaço, variedade e crescimento mútuo no relacionamento. Atraída por pessoas com visão de mundo rica, senso de humor e disposição para explorar. Comprometimento sim, mas com leveza e sem grades. O amor deve expandir, nunca contrair.',
  /* Capricórnio */ 'Amor que se comprova com ações ao longo do tempo, não com declarações dramáticas. Leva relacionamentos a sério — não se envolve com leveza nem por capricho. Atraída por pessoas maduras, ambiciosas e confiáveis. Pode parecer fria no início, mas a devoção construída devagar é inabalável e profundamente comprometida.',
  /* Aquário   */ 'Ama com liberdade e amizade como base — o melhor relacionamento é aquele onde ambos mantêm sua individualidade intacta. Atraída por pessoas originais, inteligentes e não convencionais. Afeto expresso de formas inesperadas, fora do script. A conexão intelectual é tão importante quanto a emocional — talvez mais.',
  /* Peixes    */ 'Vênus em exaltação — amor em sua forma mais idealizada e transcendente. Ama com devoção, compaixão e disposição para o sacrifício. Atraída pela arte, pela espiritualidade e pela sensibilidade. O perigo é o romantismo idealista que ignora a realidade do parceiro. Quando integrada, esta é a Vênus que vê beleza onde ninguém mais vê.',
];

const MARS_SIGN_FLAVOR: string[] = [
  /* Áries     */ 'Marte em dignidade aqui — sua posição de maior poder. Age por instinto, com velocidade e decisão. Energia altíssima para iniciar; nem sempre termina o que começa. Raiva flameja rápido e passa rápido — sem rancor. Atlético, competitivo, motivado por desafios. Prefere ação direta à estratégia elaborada.',
  /* Touro     */ 'Ritmo lento mas absolutamente inabalável — "devagar e sempre" como filosofia de ação. Difícil de provocar, mas quando a paciência acaba, a explosão é monumental e memorável. Orientado para resultados tangíveis; não desperdiça energia em batalhas que não valem a pena. Sensualidade forte na expressão da energia.',
  /* Gêmeos    */ 'Energia em rajadas — explosões de produtividade seguidas de dispersão. Age através das palavras: debate, argumentação e persuasão são suas armas mais eficazes. Fica energizado com variedade e novidade; paralisa na repetição. Bom em múltiplos projetos simultâneos, mas precisa aprender a concluir cada um deles.',
  /* Câncer    */ 'Ação motivada pela emoção e pela necessidade de proteção — "o melhor ataque é a defesa." Pode ser indireto na busca pelo que quer, raramente confrontando de frente. Energia variável conforme o humor e as fases emocionais. Quando ativado para proteger alguém que ama, pode surpreender com determinação inesperada.',
  /* Leão      */ 'Age com bravura e estilo — não apenas vence, quer vencer com classe e ser reconhecido pela vitória. Energia direcionada para projetos que deixam legado visível. Motivado por reconhecimento e impacto. Líder nato na ação que assume responsabilidades com orgulho. Pode se tornar dominador quando o ego entra em jogo.',
  /* Virgem    */ 'Energia direcionada com precisão cirúrgica — sem desperdício, sem movimentos desnecessários. Prefere trabalhar de forma sistemática e metódica, passo a passo. Motivado pela sensação de utilidade e eficiência. Excelente em execução de planos detalhados. Pode ser excessivamente crítico dos métodos dos outros.',
  /* Libra     */ 'Marte em detrimento — age melhor quando tem um parceiro ou quando age por uma causa de justiça. Usa diplomacia e persuasão como estratégia de ação em vez de força bruta. Conflito direto é extremamente desconfortável. Quando finalmente age, faz de forma calculada, equilibrada e irrefutável.',
  /* Escorpião */ 'Marte em domicílio tradicional — energia focada com precisão e profundidade estratégica. Age de forma deliberada, raramente impulsiva. Tem resistência extraordinária para objetivos de longo prazo que outros abandonariam. Motivado por transformação e poder verdadeiro. Adversários raramente percebem que estão sendo contornados.',
  /* Sagitário */ 'Age com entusiasmo e otimismo contagiante — motiva-se por ideais e pela visão de um futuro melhor. Energia abundante para novos projetos que expandem horizontes. Excelente para inspirar outros a agir juntos. Raiva raramente dura — se resolve com honestidade, humor e movimento para frente.',
  /* Capricórnio */ 'Marte em exaltação — a posição mais eficiente e estratégica para a ação. Age com planejamento, paciência e determinação que não cede. Não desperdiça energia em batalhas que não valem o esforço a longo prazo. Constrói o que quer com consistência disciplinada. Metas de décadas são sua especialidade.',
  /* Aquário   */ 'Age por ideais e causas coletivas — motivado pela inovação, reforma e ruptura do status quo. Prefere mudar sistemas inteiros do que batalhar individualmente. Pode ser imprevisível na forma de agir — sua estratégia raramente é óbvia para observadores externos. Energia mais eficiente em grupo do que sozinho.',
  /* Peixes    */ 'Age de forma indireta, fluida e adaptável — como água que contorna obstáculos. Motivado pela compaixão e pela visão espiritual. Pode ter dificuldade em sustentar energia em projetos puramente pragmáticos. Energia melhor usada em arte, cura, espiritualidade e serviço. Quando alinhado com uma causa maior, a persistência é surpreendente.',
];

const MOON_SIGN_FLAVOR: string[] = [
  'Emocionalmente, reage com impulso imediato — precisa de ação e movimento para processar o que sente. Não suporta passividade diante do desconforto; a energia emocional precisa de canais diretos. Aprende a se acalmar não pela quietude, mas pela iniciativa.',
  'Emocionalmente, busca estabilidade e conforto sensorial acima de tudo. Se acalma com toque, comida, natureza e previsibilidade. Lento para processar mudanças emocionais, mas quando se ancora, a estabilidade que oferece aos outros é incomparável.',
  'Emocionalmente, processa sentimentos falando, escrevendo ou buscando informação. A mente precisa nomear o que sente antes de poder acolher. Pode parecer emocionalmente "leve", mas é porque transita entre estados com agilidade — não porque não sente profundamente.',
  'Emocionalmente, está profundamente conectado à família, às memórias e ao senso de pertencimento. Precisa de segurança emocional como alimento básico. Inteligência emocional profunda — percebe o estado interior das pessoas com precisão instintiva. A casa (interna e externa) é sagrada.',
  'Emocionalmente, precisa de expressão dramática, reconhecimento afetivo e senso de especialidade. Se nutre quando se sente visto, celebrado e admirado por quem ama. Generosidade emocional enorme quando se sente seguro. O coração precisa de palco — não por ego, mas por natureza.',
  'Emocionalmente, analisa o que sente antes de se permitir sentir completamente. A mesma mente que resolve problemas pode tornar-se uma máquina de autoexame que não descansa. Se nutre quando se sente útil e quando a vida está organizada. Precisa de reasseguramento de que emoções desordenadas são seguras.',
  'Emocionalmente, busca harmonia e evita conflitos — às vezes se anulando para preservar a paz exterior. Se nutre em ambientes bonitos, em companhia agradável e em relações equilibradas. O desafio é permitir-se sentir raiva e desconforto sem culpa — harmonia real inclui honestidade.',
  'Emocionalmente, sente tudo com intensidade absoluta — sem meio-termo, sem escape. Percebe o que os outros escondem e tem dificuldade de se abrir sem garantia de segurança total. Quando confia alguém, é com toda a alma. A profundidade emocional é tanto dom quanto desafio.',
  'Emocionalmente, precisa de liberdade, perspectiva ampla e espaço para expandir. Se nutre com viagens, filosofia, humor e visão de futuro. Pode ter dificuldade com conexões emocionais "normais" — prefere profundidade filosófica a intimidade rotineira.',
  'Emocionalmente, é contido e precisa sentir que "merece" ser cuidado — pode ter aprendido cedo que chorar não é seguro. Responsabilidade emocional pesada que amadurece com o tempo. Com os anos, a frieza inicial se transforma em profunda estabilidade emocional e força interior.',
  'Emocionalmente, se distancia para observar antes de se envolver — precisa de espaço e não se permite ser engolido por sentimentos. Necessidade de liberdade dentro do afeto. Processa emoções de forma original e nem sempre compartilha o que sente nos termos esperados.',
  'Emocionalmente, absorve o ambiente como uma esponja — sente o que os outros sentem como se fosse seu. Sensibilidade oceânica que precisa de limites para não se dissolver. Intuição profunda e empatia natural. Precisa de solidão regular para se recompor e distinguir seus sentimentos dos alheios.',
];

// ============================================================
// ASCENDANT INTERPRETATION
// ============================================================

const ASCENDANT_TEXT: string[] = [
  /* Áries */ 'Seu ascendente em Áries faz com que as pessoas te percebam como alguém corajoso, direto e enérgico. Sua primeira reação diante do mundo é agir. Você projeta independência e iniciativa — mas isso pode assustar quem espera diplomacia.',
  /* Touro */ 'Seu ascendente em Touro projeta calma, estabilidade e sensualidade. As pessoas te veem como alguém confiável e com os pés no chão. Sua primeira reação é observar antes de agir — você não se apressa.',
  /* Gêmeos */ 'Seu ascendente em Gêmeos faz com que pareça comunicativo, curioso e adaptável. As pessoas te percebem como alguém inteligente e versátil. Sua primeira reação é questionar, dialogar, buscar informação.',
  /* Câncer */ 'Seu ascendente em Câncer projeta cuidado, sensibilidade e acolhimento. As pessoas sentem que podem confiar em você. Sua primeira reação é proteger — a si mesmo e aos outros.',
  /* Leão */ 'Seu ascendente em Leão projeta presença, carisma e autoconfiança. As pessoas te notam quando você entra num ambiente. Sua primeira reação é se expressar e marcar território.',
  /* Virgem */ 'Seu ascendente em Virgem projeta competência, discrição e atenção aos detalhes. As pessoas te veem como alguém confiável e útil. Sua primeira reação é analisar e organizar.',
  /* Libra */ 'Seu ascendente em Libra projeta charme, equilíbrio e elegância. As pessoas te percebem como alguém agradável e justo. Sua primeira reação é buscar harmonia e considerar o outro.',
  /* Escorpião */ 'Seu ascendente em Escorpião projeta intensidade, mistério e magnetismo. As pessoas sentem sua presença mesmo quando você está em silêncio. Sua primeira reação é observar profundamente antes de se revelar.',
  /* Sagitário */ 'Seu ascendente em Sagitário projeta otimismo, entusiasmo e liberdade. As pessoas te percebem como alguém aventureiro e bem-humorado. Sua primeira reação é expandir, explorar, buscar sentido.',
  /* Capricórnio */ 'Seu ascendente em Capricórnio projeta seriedade, competência e maturidade. As pessoas te veem como alguém responsável e ambicioso. Sua primeira reação é planejar e estruturar.',
  /* Aquário */ 'Seu ascendente em Aquário projeta originalidade, independência e pensamento futurista. As pessoas te percebem como alguém diferente e intelectual. Sua primeira reação é questionar a norma.',
  /* Peixes */ 'Seu ascendente em Peixes projeta sensibilidade, empatia e uma aura etérea. As pessoas sentem que você os compreende profundamente. Sua primeira reação é absorver o ambiente — o que pode ser tanto dom quanto desafio.',
];

// ============================================================
// NODES INTERPRETATION (Eixo Nódulo Sul → Nódulo Norte)
// ============================================================

const NORTH_NODE_HOUSE: string[] = [
  /* Casa 1 */ 'Nodo Norte na Casa 1: Você já domina o "nós" (parceria, diplomacia) e agora veio aprender a ser independente, a se colocar em primeiro lugar sem culpa. Sua missão é desenvolver identidade própria.',
  /* Casa 2 */ 'Nodo Norte na Casa 2: Você já domina transformações e recursos dos outros. Agora veio aprender a construir sua própria segurança, seus próprios valores. Autossuficiência é o caminho.',
  /* Casa 3 */ 'Nodo Norte na Casa 3: Você já tem a sabedoria dos estudos profundos (casa 9) e agora veio aprender a comunicar com leveza, a ensinar de forma acessível, a ouvir mais do que pregar.',
  /* Casa 4 */ 'Nodo Norte na Casa 4: Você já domina a vida pública e a carreira. Agora veio aprender a nutrir suas bases emocionais, cuidar da família e criar raízes verdadeiras.',
  /* Casa 5 */ 'Nodo Norte na Casa 5: Você já pertence a grupos e causas coletivas. Agora veio aprender a brilhar individualmente, a criar, a se divertir sem culpa. Expressão pessoal é o caminho.',
  /* Casa 6 */ 'Nodo Norte na Casa 6: Você já domina o mundo espiritual e a solitude. Agora veio aprender a servir no cotidiano, organizar a vida prática e cuidar do corpo.',
  /* Casa 7 */ 'Nodo Norte na Casa 7: Você já é independente e auto-suficiente. Agora veio aprender a abrir espaço para o outro, a negociar, a construir parcerias verdadeiras.',
  /* Casa 8 */ 'Nodo Norte na Casa 8: Você já domina o conforto material e a estabilidade. Agora veio aprender a se transformar, a se entregar, a lidar com poder e vulnerabilidade.',
  /* Casa 9 */ 'Nodo Norte na Casa 9: Você já domina a comunicação e o conhecimento superficial. Agora veio aprender a se aprofundar, expandir horizontes, criar sua própria filosofia de vida.',
  /* Casa 10 */ 'Nodo Norte na Casa 10: Você já domina o lar e as emoções. Agora veio aprender a construir algo no mundo, a assumir responsabilidade pública e deixar um legado.',
  /* Casa 11 */ 'Nodo Norte na Casa 11: Você já brilha individualmente. Agora veio aprender a trabalhar por causas maiores, a integrar grupos e pensar no coletivo.',
  /* Casa 12 */ 'Nodo Norte na Casa 12: Você já domina a organização e o serviço prático. Agora veio aprender a soltar o controle, confiar na intuição e conectar-se com algo transcendente.',
];

// ============================================================
// NORTH NODE IN SIGN — A Jornada Evolutiva por Signo
// ============================================================

const NORTH_NODE_IN_SIGN: string[] = [
  /* Áries */     'Nodo Norte em Áries: sua jornada evolutiva é desenvolver autoliderança, coragem e o direito de agir por conta própria. Vem de vidas (ou padrões) de dependência, diplomacia excessiva e busca de aprovação. A libertação vem quando você age sem esperar consenso — quando assume o risco de ser impopular em nome da autenticidade.',
  /* Touro */     'Nodo Norte em Touro: sua jornada é construir segurança própria, confiar no corpo e no mundo material. Vem de padrões de caos, intensidade emocional e crises como modo de vida. A libertação vem quando você se permite o prazer simples, a estabilidade sem drama e a confiança de que o chão não vai sumir.',
  /* Gêmeos */    'Nodo Norte em Gêmeos: sua jornada é cultivar curiosidade, mente aberta e conexão com o entorno imediato. Vem de padrões dogmáticos, certezas absolutas e tendência a pregar em vez de ouvir. A libertação vem quando você se permite não saber — quando a pergunta se torna mais valiosa que a resposta.',
  /* Câncer */    'Nodo Norte em Câncer: sua jornada é o enraizamento emocional — lar, cuidado, vulnerabilidade. Vem de padrões de controle, ambição rígida e negação das necessidades emocionais. A libertação vem quando você se permite precisar de outros, quando cuida sem calcular e quando o lar se torna refúgio, não obrigação.',
  /* Leão */      'Nodo Norte em Leão: sua jornada é expressar-se do coração, brilhar individualmente e criar com generosidade. Vem de padrões de anonimato coletivo, frieza intelectual e medo de se destacar. A libertação vem quando você para de se esconder atrás do grupo e assume o risco de ser visto como realmente é.',
  /* Virgem */    'Nodo Norte em Virgem: sua jornada é servir com discernimento, cuidar da saúde e aplicar a espiritualidade no cotidiano prático. Vem de padrões de dissolução, idealismo sem ação e fuga da realidade material. A libertação vem quando você descobre que o sagrado mora nos detalhes do dia-a-dia.',
  /* Libra */     'Nodo Norte em Libra: sua jornada é a cura através da parceria, do compromisso e do perdão. Vem de padrões de isolamento, individualismo excessivo e dificuldade em ceder. A libertação vem quando você aprende que a verdadeira força não é fazer tudo sozinho — é permitir-se ser complementado.',
  /* Escorpião */ 'Nodo Norte em Escorpião: sua jornada é transformar-se confrontando o que está oculto — poder, intimidade, vulnerabilidade. Vem de padrões de conforto, apego material e evitação de crises. A libertação vem quando você se permite morrer simbolicamente para renascer mais inteiro — quando aceita que segurança verdadeira não vem da estabilidade, mas da capacidade de se regenerar.',
  /* Sagitário */ 'Nodo Norte em Sagitário: sua jornada é expandir horizontes, construir fé e viver a verdade. Vem de padrões de ansiedade informacional, superficialidade e medo de se comprometer com uma visão. A libertação vem quando você para de coletar dados e começa a viver sabedoria — quando a experiência substitui a teoria.',
  /* Capricórnio */ 'Nodo Norte em Capricórnio: sua jornada é assumir vocação, construir estrutura e deixar legado. Vem de padrões de dependência emocional, vitimismo familiar e dificuldade em se responsabilizar pelo próprio destino. A libertação vem quando você assume o leme — quando para de culpar as circunstâncias e constrói com as próprias mãos.',
  /* Aquário */   'Nodo Norte em Aquário: sua jornada é servir ao coletivo, abraçar a inovação e pensar além do eu. Vem de padrões de ego inflado, necessidade de reconhecimento pessoal e dificuldade em compartilhar o palco. A libertação vem quando você descobre que seu brilho é mais poderoso quando ilumina causas maiores que você mesmo.',
  /* Peixes */    'Nodo Norte em Peixes: sua jornada é a rendição espiritual — soltar controle, confiar na intuição e dissolver as fronteiras rígidas do ego. Vem de padrões de hipercontrole, perfeccionismo e ansiedade sobre "fazer direito". A libertação vem quando você se permite fluir — quando aceita que nem tudo precisa ser analisado para ser verdadeiro.',
];

// ============================================================
// EXPORT
// ============================================================

export interface InterpretationSection {
  title: string;
  planet: string;
  symbol: string;
  text: string;
  sign: string;
  house: number;
  category?: 'identity' | 'emotion' | 'mind' | 'love' | 'action' | 'direction' | 'mask';
}

/**
 * Generate natal interpretation following the approach:
 * 1. Ascendant (first impression / mask)
 * 2. Sun in House (identity + purpose) + sign as flavor
 * 3. Moon in House (emotional needs) + sign as flavor
 * 4. Mercury, Venus, Mars in House
 * 5. North Node (life direction)
 */
export function generateNatalInterpretation(chart: NatalChart): InterpretationSection[] {
  const sections: InterpretationSection[] = [];

  const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

  // --- 1. ASCENDANT ---
  const ascSign = getSignIndex(chart.houses.ascendant);
  sections.push({
    title: `Ascendente em ${SIGN_NAMES[ascSign]}`,
    planet: 'ascendant',
    symbol: 'AC',
    text: ASCENDANT_TEXT[ascSign] || '',
    sign: SIGN_NAMES[ascSign],
    house: 1,
    category: 'mask',
  });

  // --- 2. SUN ---
  const sunPos = chart.positions.sun;
  if (sunPos) {
    const sunSign = getSignIndex(sunPos.longitude);
    const sunHouse = chart.planetHouses.sun || 1;
    const houseText = SUN_IN_HOUSE[sunHouse - 1] || '';
    const flavorText = SUN_SIGN_FLAVOR[sunSign] || '';

    sections.push({
      title: `☉ Sol na Casa ${sunHouse} em ${SIGN_NAMES[sunSign]}`,
      planet: 'sun',
      symbol: '☉',
      text: `${houseText} ${flavorText}`,
      sign: SIGN_NAMES[sunSign],
      house: sunHouse,
      category: 'identity',
    });
  }

  // --- 3. MOON ---
  const moonPos = chart.positions.moon;
  if (moonPos) {
    const moonSign = getSignIndex(moonPos.longitude);
    const moonHouse = chart.planetHouses.moon || 1;
    const houseText = MOON_IN_HOUSE[moonHouse - 1] || '';
    const flavorText = MOON_SIGN_FLAVOR[moonSign] || '';

    sections.push({
      title: `☽ Lua na Casa ${moonHouse} em ${SIGN_NAMES[moonSign]}`,
      planet: 'moon',
      symbol: '☽',
      text: `${houseText} ${flavorText}`,
      sign: SIGN_NAMES[moonSign],
      house: moonHouse,
      category: 'emotion',
    });
  }

  // --- 4. MERCURY ---
  const mercPos = chart.positions.mercury;
  if (mercPos) {
    const mercSign = getSignIndex(mercPos.longitude);
    const mercHouse = chart.planetHouses.mercury || 1;
    const flavorText = MERCURY_SIGN_FLAVOR[mercSign] || '';
    sections.push({
      title: `☿ Mercúrio na Casa ${mercHouse} em ${SIGN_NAMES[mercSign]}`,
      planet: 'mercury',
      symbol: '☿',
      text: `${MERCURY_IN_HOUSE[mercHouse - 1] || ''} ${flavorText}`,
      sign: SIGN_NAMES[mercSign],
      house: mercHouse,
      category: 'mind',
    });
  }

  // --- 5. VENUS ---
  const venusPos = chart.positions.venus;
  if (venusPos) {
    const venusSign = getSignIndex(venusPos.longitude);
    const venusHouse = chart.planetHouses.venus || 1;
    const venusFlavorText = VENUS_SIGN_FLAVOR[venusSign] || '';
    sections.push({
      title: `♀ Vênus na Casa ${venusHouse} em ${SIGN_NAMES[venusSign]}`,
      planet: 'venus',
      symbol: '♀',
      text: `${VENUS_IN_HOUSE[venusHouse - 1] || ''} ${venusFlavorText}`,
      sign: SIGN_NAMES[venusSign],
      house: venusHouse,
      category: 'love',
    });
  }

  // --- 6. MARS ---
  const marsPos = chart.positions.mars;
  if (marsPos) {
    const marsSign = getSignIndex(marsPos.longitude);
    const marsHouse = chart.planetHouses.mars || 1;
    const marsFlavorText = MARS_SIGN_FLAVOR[marsSign] || '';
    sections.push({
      title: `♂ Marte na Casa ${marsHouse} em ${SIGN_NAMES[marsSign]}`,
      planet: 'mars',
      symbol: '♂',
      text: `${MARS_IN_HOUSE[marsHouse - 1] || ''} ${marsFlavorText}`,
      sign: SIGN_NAMES[marsSign],
      house: marsHouse,
      category: 'action',
    });
  }

  // --- 7. NORTH NODE (if available) ---
  const nnPos = chart.positions.northNode;
  if (nnPos) {
    const nnSign = getSignIndex(nnPos.longitude);
    const nnHouse = chart.planetHouses.northNode || 1;
    const houseText = NORTH_NODE_HOUSE[nnHouse - 1] || '';
    const signText = NORTH_NODE_IN_SIGN[nnSign] || '';
    sections.push({
      title: `☊ Nodo Norte na Casa ${nnHouse} em ${SIGN_NAMES[nnSign]}`,
      planet: 'northNode',
      symbol: '☊',
      text: `${houseText} ${signText}`,
      sign: SIGN_NAMES[nnSign],
      house: nnHouse,
      category: 'direction',
    });
  }

  // --- 8. CHIRON (if available) ---
  const chironPos = chart.positions.chiron;
  if (chironPos) {
    const chironSign = getSignIndex(chironPos.longitude);
    const chironHouse = chart.planetHouses.chiron || 1;
    const houseText = CHIRON_IN_HOUSE[chironHouse - 1] || '';
    const signText = CHIRON_IN_SIGN[chironSign] || '';
    sections.push({
      title: `⚷ Quíron na Casa ${chironHouse} em ${SIGN_NAMES[chironSign]}`,
      planet: 'chiron',
      symbol: '⚷',
      text: `${houseText} ${signText}`,
      sign: SIGN_NAMES[chironSign],
      house: chironHouse,
      category: 'direction',
    });
  }

  return sections;
}
