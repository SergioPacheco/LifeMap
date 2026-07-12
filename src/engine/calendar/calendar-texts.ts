// ============================================================
// CALENDAR-TEXTS.TS — Interpretações para trânsitos no calendário
// Textos curtos (2-3 frases) + dica prática
// Baseado em: Robert Hand "Planets in Transit", Café Astrology, Liz Greene
// ============================================================

// Estrutura: TRANSIT_TEXTS[transitPlanet][natalPlanet][aspectType]
// Retorna { summary, advice }

interface TransitText {
  summary: string;
  advice: string;
}

type AspectTexts = Record<string, TransitText>;
type NatalPlanetTexts = Record<string, AspectTexts>;
type TransitPlanetTexts = Record<string, NatalPlanetTexts>;

export const CALENDAR_TRANSIT_TEXTS: TransitPlanetTexts = {
  // ============================================================
  // SOL em trânsito
  // ============================================================
  sun: {
    sun: {
      conjunction: { summary: 'Aniversário solar — renovação da vitalidade e senso de propósito. Momento de definir intenções para o novo ciclo.', advice: 'Defina metas para o próximo ano solar.' },
      trine: { summary: 'Autoconfiança fluida. Você se expressa com autenticidade e facilidade.', advice: 'Ótimo para apresentações e iniciativas pessoais.' },
      square: { summary: 'Tensão entre quem você é e o que as circunstâncias exigem. Necessidade de ajuste.', advice: 'Não force — busque caminhos criativos.' },
      opposition: { summary: 'O outro funciona como espelho. Confronto revela necessidades não atendidas.', advice: 'Integre o que projeta nos outros.' },
      sextile: { summary: 'Oportunidades sutis de crescimento pessoal. Vitalidade equilibrada.', advice: 'Aceite convites e propostas inesperadas.' },
    },
    moon: {
      conjunction: { summary: 'Consciência das emoções elevada. Conexão mente-coração.', advice: 'Honre seus sentimentos nas decisões de hoje.' },
      trine: { summary: 'Harmonia entre razão e emoção. Intuição confiável.', advice: 'Confie nos sinais internos.' },
      square: { summary: 'Conflito entre vontade e emoções. Irritabilidade passageira.', advice: 'Não tome decisões no calor do momento.' },
      opposition: { summary: 'Tensão entre vida pública e vida emocional/familiar.', advice: 'Equilibre necessidades pessoais e sociais.' },
      sextile: { summary: 'Expressão emocional fluida. Bom para conversas íntimas.', advice: 'Aproveite para nutrir relacionamentos.' },
    },
    mercury: {
      conjunction: { summary: 'Mente clara e alinhada com propósito. Comunicação carismática.', advice: 'Excelente para comunicações importantes.' },
      trine: { summary: 'Pensamento brilhante. Ideias articuladas com facilidade.', advice: 'Escreva, negocie, ensine.' },
      square: { summary: 'Dificuldade em ser compreendido. Mal-entendidos possíveis.', advice: 'Releia antes de enviar. Busque clareza.' },
      opposition: { summary: 'Sua visão é desafiada. O outro tem perspectiva válida.', advice: 'Escute antes de responder.' },
      sextile: { summary: 'Pensamento ágil e receptivo. Boa concentração.', advice: 'Bom para estudar e planejar.' },
    },
    venus: {
      conjunction: { summary: 'Magnetismo pessoal elevado. Dia favorável para amor e prazer.', advice: 'Cuide da aparência e permita-se prazer.' },
      trine: { summary: 'Charme natural em alta. Relações harmoniosas.', advice: 'Socialize, paquere, crie.' },
      square: { summary: 'Insatisfação afetiva. Desejo maior que a realidade oferece.', advice: 'Cuidado com excessos compensatórios.' },
      opposition: { summary: 'O outro fascina ou frustra. Espelho afetivo.', advice: 'Avalie o que realmente valoriza.' },
      sextile: { summary: 'Oportunidades sociais discretas. Gentilezas inesperadas.', advice: 'Esteja aberto às pequenas belezas.' },
    },
    mars: {
      conjunction: { summary: 'Energia vital em alta. Coragem e iniciativa.', advice: 'Aja com foco — evite impulsividade.' },
      trine: { summary: 'Ação fluida e produtiva. Assertividade natural.', advice: 'Excelente para exercício e empreender.' },
      square: { summary: 'Frustração busca liberação. Acidentes por pressa possíveis.', advice: 'Canalize em exercício físico intenso.' },
      opposition: { summary: 'Conflitos com outros. Alguém desafia sua posição.', advice: 'Assertividade sem agressividade.' },
      sextile: { summary: 'Motivação disponível. Energia para projetos práticos.', advice: 'Bom dia para produtividade.' },
    },
    jupiter: {
      conjunction: { summary: 'Expansão, otimismo e oportunidades. Um dos melhores trânsitos solares.', advice: 'Pense grande — mas com pés no chão.' },
      trine: { summary: 'Sorte e fluidez. Coisas se encaixam naturalmente.', advice: 'Aproveite para expandir projetos.' },
      square: { summary: 'Excesso de otimismo pode levar a promessas impossíveis.', advice: 'Não exagere em compromissos.' },
      opposition: { summary: 'Outros oferecem oportunidades — mas avalie os termos.', advice: 'Não aceite tudo sem pensar.' },
      sextile: { summary: 'Pequenas oportunidades de crescimento se apresentam.', advice: 'Diga sim a convites educacionais.' },
    },
    saturn: {
      conjunction: { summary: 'Momento de responsabilidade e estruturação. Seriedade necessária.', advice: 'Assuma compromissos com maturidade.' },
      trine: { summary: 'Disciplina produtiva. Esforço traz resultados concretos.', advice: 'Dia excelente para organização e planejamento.' },
      square: { summary: 'Obstáculos e limitações exigem paciência. Pressão externa.', advice: 'Não force — trabalhe com o que tem.' },
      opposition: { summary: 'Autoridades ou estruturas resistem. Teste de maturidade.', advice: 'Perseverança vence rigidez.' },
      sextile: { summary: 'Estabilidade e progresso gradual.', advice: 'Consolide o que já construiu.' },
    },
    uranus: {
      conjunction: { summary: 'Mudança repentina de direção. Despertar de consciência.', advice: 'Permita-se surpreender. Solte o controle.' },
      trine: { summary: 'Intuições originais. Liberdade criativa.', advice: 'Experimente abordagens não-convencionais.' },
      square: { summary: 'Inquietação intensa. Vontade de romper com tudo.', advice: 'Mude o que precisa — mas não destrua pontes.' },
      opposition: { summary: 'Outros provocam rupturas ou revelações inesperadas.', advice: 'Aceite o inesperado como crescimento.' },
      sextile: { summary: 'Abertura para o novo sem drama.', advice: 'Inovação suave está disponível.' },
    },
    neptune: {
      conjunction: { summary: 'Sensibilidade elevada. Fronteiras entre real e ideal se dissolvem.', advice: 'Cuidado com ilusões — mas permita a inspiração.' },
      trine: { summary: 'Criatividade e espiritualidade fluem. Compaixão natural.', advice: 'Medite, crie, conecte-se com o transcendente.' },
      square: { summary: 'Confusão, desilusão ou escapismo. Realidade nebulosa.', advice: 'Evite decisões — espere a névoa passar.' },
      opposition: { summary: 'Outros podem enganar ou fascinar. Discernimento necessário.', advice: 'Verifique fatos antes de confiar.' },
      sextile: { summary: 'Intuição suave. Inspiração artística acessível.', advice: 'Bom para atividades contemplativas.' },
    },
    pluto: {
      conjunction: { summary: 'Transformação profunda da identidade. Morte e renascimento simbólicos.', advice: 'Entregue-se ao processo — resistir intensifica.' },
      trine: { summary: 'Poder pessoal acessível. Capacidade de regeneração.', advice: 'Use sua influência para transformar positivamente.' },
      square: { summary: 'Luta de poder. Forças destrutivas que pedem transformação.', advice: 'Identifique o que precisa morrer para o novo nascer.' },
      opposition: { summary: 'Confronto com poder do outro. Manipulação ou dominação.', advice: 'Não entre em jogos de poder — escolha sua batalha.' },
      sextile: { summary: 'Oportunidade de transformação suave.', advice: 'Elimine o que não serve mais.' },
    },
    // Ângulos
    asc: {
      conjunction: { summary: 'Sol no Ascendente — visibilidade máxima. Você brilha.', advice: 'Mostre-se ao mundo. Presença magnética.' },
      trine: { summary: 'Expressão pessoal harmoniosa. Os outros o recebem bem.', advice: 'Bom para networking e primeiras impressões.' },
      square: { summary: 'Tensão entre imagem e essência.', advice: 'Seja autêntico mesmo sob pressão.' },
      opposition: { summary: 'Sol no Descendente — foco nos relacionamentos.', advice: 'O outro precisa de atenção hoje.' },
      sextile: { summary: 'Pequenas oportunidades de se mostrar.', advice: 'Aceite convites sociais.' },
    },
    mc: {
      conjunction: { summary: 'Sol no MC — reconhecimento profissional. Ápice de visibilidade.', advice: 'Momento ideal para exposição e liderança.' },
      trine: { summary: 'Carreira flui bem. Reconhecimento natural.', advice: 'Avance em objetivos profissionais.' },
      square: { summary: 'Tensão entre carreira e vida pessoal/familiar.', advice: 'Priorize sem culpa.' },
      opposition: { summary: 'Foco no lar e raízes. Descanso necessário.', advice: 'Cuidar da base fortalece o topo.' },
      sextile: { summary: 'Progressos discretos na carreira.', advice: 'Mantenha a consistência.' },
    },
  },

  // ============================================================
  // VÊNUS em trânsito (resumido — padrão para planetas pessoais)
  // ============================================================
  venus: {
    sun: {
      conjunction: { summary: 'Charme e beleza irradiam. Dia especial para amor.', advice: 'Permita-se prazer e beleza.' },
      trine: { summary: 'Autoestima elevada. Relacionamentos fluem.', advice: 'Socialize e aprecie a vida.' },
      square: { summary: 'Vaidade ou insatisfação estética. Desejos não atendidos.', advice: 'Não compare — aprecie o que tem.' },
      opposition: { summary: 'O outro traz prazer ou desejo intenso.', advice: 'Avalie com clareza, não apenas com desejo.' },
      sextile: { summary: 'Gentileza e harmonia disponíveis.', advice: 'Aproveite para embelezar o ambiente.' },
    },
    venus: {
      conjunction: { summary: 'Retorno de Vênus — renovação dos valores afetivos e estéticos.', advice: 'Reconecte-se com o que ama.' },
      trine: { summary: 'Amor próprio e relações em harmonia.', advice: 'Presenteie-se ou presenteie alguém.' },
      square: { summary: 'Desejo versus realidade nos relacionamentos.', advice: 'Ajuste expectativas com maturidade.' },
      opposition: { summary: 'Atração magnética — mas avalie compatibilidade real.', advice: 'Não confunda paixão com amor.' },
      sextile: { summary: 'Momentos de doçura e prazer discreto.', advice: 'Pequenos gestos de carinho fazem diferença.' },
    },
    mars: {
      conjunction: { summary: 'Paixão e desejo intensos. Magnetismo sexual.', advice: 'Aproveite a energia erótica com consciência.' },
      trine: { summary: 'Equilíbrio entre desejo e afeto. Ação com graça.', advice: 'Bom para conquistas e projetos artísticos.' },
      square: { summary: 'Tensão entre querer e poder. Ciúmes possíveis.', advice: 'Não pressione situações afetivas.' },
      opposition: { summary: 'Atração-repulsão. O outro provoca desejo e frustração.', advice: 'Observe o padrão antes de reagir.' },
      sextile: { summary: 'Iniciativa afetiva suave. Coragem romântica.', advice: 'Dê o primeiro passo.' },
    },
    jupiter: {
      conjunction: { summary: 'Abundância afetiva e financeira. Generosidade.', advice: 'Celebre e compartilhe.' },
      trine: { summary: 'Expansão do prazer e dos valores. Sorte em amor e dinheiro.', advice: 'Invista em beleza e experiências.' },
      square: { summary: 'Excesso: gastos impulsivos ou amor idealizado.', advice: 'Moderação financeira — não gaste por emoção.' },
      opposition: { summary: 'Outros oferecem demais — avalie o custo.', advice: 'Generosidade tem limites saudáveis.' },
      sextile: { summary: 'Oportunidades discretas de prazer e crescimento.', advice: 'Aceite convites sociais.' },
    },
    saturn: {
      conjunction: { summary: 'Amor maduro. Compromisso e responsabilidade afetiva.', advice: 'Decisões amorosas duradouras são favorecidas.' },
      trine: { summary: 'Estabilidade nos relacionamentos. Lealdade.', advice: 'Consolide vínculos importantes.' },
      square: { summary: 'Frieza ou distanciamento emocional. Solidão temporária.', advice: 'A solitude hoje pode ser restauradora.' },
      opposition: { summary: 'Exigências do outro pesam. Limites necessários.', advice: 'Estabeleça fronteiras com amor.' },
      sextile: { summary: 'Maturidade afetiva tranquila.', advice: 'Momento para conversas sérias e construtivas.' },
    },
  },

  // ============================================================
  // MARTE em trânsito
  // ============================================================
  mars: {
    sun: {
      conjunction: { summary: 'Energia explosiva. Coragem, mas risco de conflito.', advice: 'Direcione a energia — esporte, projeto, ação.' },
      trine: { summary: 'Ação decisiva e produtiva. Confiança no agir.', advice: 'Inicie o que vem adiando.' },
      square: { summary: 'Raiva, frustração ou acidentes. Energia bloqueada.', advice: 'Exercício intenso é necessário hoje.' },
      opposition: { summary: 'Conflito direto com alguém. Competição.', advice: 'Escolha suas batalhas com sabedoria.' },
      sextile: { summary: 'Motivação prática disponível.', advice: 'Avance em tarefas que exigem esforço.' },
    },
    moon: {
      conjunction: { summary: 'Emoções inflamadas. Reações rápidas e intensas.', advice: 'Respire antes de reagir.' },
      trine: { summary: 'Coragem emocional. Defesa saudável dos sentimentos.', advice: 'Expresse o que sente com assertividade.' },
      square: { summary: 'Irritabilidade doméstica. Tensão com familiares.', advice: 'Não desconte no lar — saia para se movimentar.' },
      opposition: { summary: 'Outros provocam reações emocionais fortes.', advice: 'Não entre em provocações.' },
      sextile: { summary: 'Energia emocional produtiva.', advice: 'Limpe, organize, mova-se.' },
    },
    saturn: {
      conjunction: { summary: 'Esforço disciplinado — ou frustração com limitações.', advice: 'Trabalhe com persistência, não com força.' },
      trine: { summary: 'Ação estruturada. Resultados concretos do esforço.', advice: 'Excelente para projetos de longo prazo.' },
      square: { summary: 'Bloqueio e frustração intensa. Vontade vs. realidade.', advice: 'Paciência é essencial — não quebre nada.' },
      opposition: { summary: 'Autoridade resiste. Luta contra o sistema.', advice: 'Estratégia vence força bruta.' },
      sextile: { summary: 'Disciplina e ação se complementam.', advice: 'Avance um passo de cada vez.' },
    },
  },

  // ============================================================
  // JÚPITER em trânsito (lentos — mais impactantes)
  // ============================================================
  jupiter: {
    sun: {
      conjunction: { summary: 'Expansão máxima da vitalidade. Oportunidades abundantes. Um dos melhores trânsitos.', advice: 'Pense grande e aja. O universo apoia.' },
      trine: { summary: 'Otimismo natural. Portas se abrem sem esforço.', advice: 'Aproveite o fluxo para crescer.' },
      square: { summary: 'Excesso de confiança pode gerar overcommitment.', advice: 'Não prometa mais do que pode entregar.' },
      opposition: { summary: 'Oportunidades vêm dos outros — mas meça custos.', advice: 'Negocie termos favoráveis.' },
      sextile: { summary: 'Crescimento gradual. Pequenas expansões.', advice: 'Diga sim a cursos e viagens.' },
    },
    moon: {
      conjunction: { summary: 'Generosidade emocional. Conforto e nutrição abundantes.', advice: 'Nutra-se e nutra os outros.' },
      trine: { summary: 'Bem-estar emocional. Otimismo doméstico.', advice: 'Lar é refúgio — invista nele.' },
      square: { summary: 'Exagero emocional ou comer/gastar demais por carência.', advice: 'Satisfação vem de dentro, não de fora.' },
      opposition: { summary: 'Generosidade excessiva com outros esgota recursos.', advice: 'Cuide de si antes de dar.' },
      sextile: { summary: 'Intuição otimista confiável.', advice: 'Confie no que sente sobre pessoas.' },
    },
    mc: {
      conjunction: { summary: 'Apogeu profissional. Reconhecimento e promoção possíveis. Trânsito raro e poderoso.', advice: 'Posicione-se para oportunidades de carreira.' },
      trine: { summary: 'Carreira em expansão natural.', advice: 'Aceite mais responsabilidade — você está pronto.' },
      square: { summary: 'Ambição exagerada ou conflito com autoridades.', advice: 'Cresça com ética e paciência.' },
      opposition: { summary: 'Expansão no lar/família pode conflitar com carreira.', advice: 'Equilíbrio entre público e privado.' },
      sextile: { summary: 'Progressos discretos na reputação.', advice: 'Networking é produtivo agora.' },
    },
  },

  // ============================================================
  // SATURNO em trânsito (lentos — estruturantes)
  // ============================================================
  saturn: {
    sun: {
      conjunction: { summary: 'Teste de realidade sobre quem você é. Responsabilidade pesa mas amadurece.', advice: 'Aceite a realidade — construa sobre ela.' },
      trine: { summary: 'Maturidade traz recompensas. Respeito conquistado.', advice: 'Colha os frutos da disciplina.' },
      square: { summary: 'Pressão intensa. Obstáculos testam a determinação.', advice: 'Persista — este teste passa e você sai mais forte.' },
      opposition: { summary: 'Outros impõem limites. Relacionamentos testados.', advice: 'Compromisso real exige ajuste mútuo.' },
      sextile: { summary: 'Progresso sólido e realista.', advice: 'Construa passo a passo.' },
    },
    moon: {
      conjunction: { summary: 'Peso emocional. Solidão ou responsabilidade familiar.', advice: 'Permita-se sentir — maturidade emocional vem agora.' },
      trine: { summary: 'Estabilidade emocional conquistada. Serenidade.', advice: 'Estruture sua vida emocional.' },
      square: { summary: 'Depressão leve, frieza ou isolamento. Carências antigas.', advice: 'Busque apoio — vulnerabilidade é força.' },
      opposition: { summary: 'Tensão entre dever e necessidades emocionais.', advice: 'Não se anule por obrigação.' },
      sextile: { summary: 'Rotina emocional estável.', advice: 'Bom para hábitos de autocuidado.' },
    },
    mc: {
      conjunction: { summary: 'Ápice de responsabilidade profissional. Cargo, promoção ou prova de competência. Momento definidor.', advice: 'Assuma o cargo — você está pronto.' },
      trine: { summary: 'Reconhecimento pelo trabalho feito. Meritocracia.', advice: 'Continue fazendo o certo — está sendo visto.' },
      square: { summary: 'Crise profissional. Questione se está no caminho certo.', advice: 'Reavalie sem desistir precipitadamente.' },
      opposition: { summary: 'Fundações precisam de atenção. Carreira espera; raízes chamam.', advice: 'Fortaleça a base antes de subir mais.' },
      sextile: { summary: 'Progressos sólidos e discretos na carreira.', advice: 'Consistência vence pressa.' },
    },
  },
};

// ============================================================
// HELPER: Get text for a transit event
// ============================================================

export function getTransitText(
  transitPlanet: string,
  natalPlanet: string,
  aspect: string
): TransitText | null {
  const planetTexts = CALENDAR_TRANSIT_TEXTS[transitPlanet];
  if (!planetTexts) return null;

  const natalTexts = planetTexts[natalPlanet];
  if (!natalTexts) return null;

  return natalTexts[aspect] || null;
}

// ============================================================
// FALLBACK: Generic text when specific combo doesn't exist
// ============================================================

const GENERIC_ASPECT_TEXTS: Record<string, (transit: string, natal: string) => TransitText> = {
  conjunction: (t, n) => ({
    summary: `${t} ativa intensamente a energia de ${n} natal. Fusão e intensificação.`,
    advice: 'Esteja consciente da intensidade do momento.',
  }),
  trine: (t, n) => ({
    summary: `${t} flui em harmonia com ${n} natal. Facilidade e oportunidade.`,
    advice: 'Aproveite o fluxo positivo.',
  }),
  square: (t, n) => ({
    summary: `${t} tensiona ${n} natal. Desafio que pede ajuste e ação.`,
    advice: 'Use a tensão como motivação, não como paralisia.',
  }),
  opposition: (t, n) => ({
    summary: `${t} confronta ${n} natal. Espelho e equilíbrio necessário.`,
    advice: 'Integre os opostos — não escolha um lado.',
  }),
  sextile: (t, n) => ({
    summary: `${t} oferece oportunidade sutil a ${n} natal.`,
    advice: 'Esteja atento a possibilidades discretas.',
  }),
};

export function getTransitTextWithFallback(
  transitPlanet: string,
  natalPlanet: string,
  aspect: string
): TransitText {
  const specific = getTransitText(transitPlanet, natalPlanet, aspect);
  if (specific) return specific;

  const PLANET_NAMES: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
    jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
    chiron: 'Quíron', northNode: 'Nodo Norte', asc: 'Ascendente', mc: 'Meio do Céu',
    dc: 'Descendente', ic: 'Fundo do Céu',
  };

  const tName = PLANET_NAMES[transitPlanet] || transitPlanet;
  const nName = PLANET_NAMES[natalPlanet] || natalPlanet;

  const generator = GENERIC_ASPECT_TEXTS[aspect];
  if (generator) return generator(tName, nName);

  return {
    summary: `${tName} aspecto ${nName} natal.`,
    advice: 'Observe como essa energia se manifesta.',
  };
}
