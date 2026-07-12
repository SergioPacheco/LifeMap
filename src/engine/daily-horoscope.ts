// ============================================================
// DAILY-HOROSCOPE.TS — Daily Horoscope Generator
// Analyzes transits of the day vs natal chart and produces
// personalized interpretive text for each active transit
// ============================================================

import { calculatePositions, getSignIndex, getDegreeInSign, angularDifference, norm } from './calculations';
import type { NatalChart, Positions, AspectType } from './types';

// ============================================================
// TYPES
// ============================================================

export interface DailyTransit {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: AspectType;
  orb: number;
  transitSign: number;
  transitHouse: number;
  interpretation: string;
  intensity: 'high' | 'medium' | 'low';
  category: 'general' | 'love' | 'career' | 'health' | 'spiritual';
}

export interface DailyHoroscope {
  date: Date;
  transits: DailyTransit[];
  summary: string;
  love: string;
  career: string;
  health: string;
  moonSign: number;
  moonPhaseAngle: number;
}

// ============================================================
// MAIN FUNCTION
// ============================================================

/**
 * Generate personalized daily horoscope based on transits vs natal chart
 */
export function generateDailyHoroscope(natal: NatalChart, date: Date): DailyHoroscope {
  const transitPositions = calculatePositions(date);
  const transits = findActiveTransits(transitPositions, natal);

  // Sort by intensity
  transits.sort((a, b) => INTENSITY_ORDER[a.intensity] - INTENSITY_ORDER[b.intensity]);

  // Generate summaries by category
  const generalTransits = transits.filter(t => t.category === 'general' || t.category === 'career');
  const loveTransits = transits.filter(t => t.category === 'love');
  const careerTransits = transits.filter(t => t.category === 'career');

  const summary = generateSummary(transits, transitPositions);
  const love = generateLoveSummary(loveTransits, transitPositions, natal);
  const career = generateCareerSummary(careerTransits, transitPositions, natal);
  const health = generateHealthSummary(transits, transitPositions);

  const moonSign = getSignIndex(transitPositions.moon?.longitude || 0);
  const moonPhaseAngle = angularDifference(
    transitPositions.sun?.longitude || 0,
    transitPositions.moon?.longitude || 0
  );

  return { date, transits, summary, love, career, health, moonSign, moonPhaseAngle };
}

// ============================================================
// TRANSIT DETECTION
// ============================================================

const ASPECT_DEFS: { type: AspectType; angle: number; orb: number }[] = [
  { type: 'conjunction', angle: 0, orb: 6 },
  { type: 'sextile', angle: 60, orb: 4 },
  { type: 'square', angle: 90, orb: 5 },
  { type: 'trine', angle: 120, orb: 5 },
  { type: 'opposition', angle: 180, orb: 6 },
];

const TRANSIT_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const NATAL_PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

const INTENSITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function findActiveTransits(transitPos: Positions, natal: NatalChart): DailyTransit[] {
  const transits: DailyTransit[] = [];

  for (const tp of TRANSIT_PLANETS) {
    const transitLon = transitPos[tp]?.longitude;
    if (transitLon === undefined) continue;

    for (const np of NATAL_PLANETS) {
      if (tp === np && ['sun', 'moon'].includes(tp)) continue; // Skip same luminaries
      const natalLon = natal.positions[np]?.longitude;
      if (natalLon === undefined) continue;

      const diff = angularDifference(transitLon, natalLon);

      for (const asp of ASPECT_DEFS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          const transitSign = getSignIndex(transitLon);
          const transitHouse = getTransitHouse(transitLon, natal.houses.cusps);
          const intensity = getIntensity(tp, np, asp.type, orb);
          const category = getCategory(tp, np);
          const interpretation = getInterpretation(tp, np, asp.type, transitHouse);

          transits.push({
            transitPlanet: tp,
            natalPlanet: np,
            aspectType: asp.type,
            orb: +orb.toFixed(1),
            transitSign,
            transitHouse,
            interpretation,
            intensity,
            category,
          });
          break;
        }
      }
    }
  }

  return transits;
}

// ============================================================
// INTERPRETATION TEXTS
// ============================================================

const TRANSIT_TEXTS: Record<string, Record<string, Record<string, string>>> = {
  sun: {
    sun: {
      conjunction: 'Seu aniversário solar — o Sol retorna à posição exata do nascimento, renovando completamente sua energia vital e seu senso de propósito. Este é o momento de definir intenções para o próximo ano solar. Reflita sobre quem você está se tornando e que sementes deseja plantar. A vitalidade está em pico.',
      square: 'Tensão entre quem você é e o que as circunstâncias exigem. Pode haver conflitos com figuras de autoridade ou com suas próprias ambições. A necessidade de autoafirmação é intensa, mas o caminho não é a força — é o ajuste criativo. Pergunte-se: o que preciso mudar para ser mais autêntico?',
      trine: 'Fluxo harmonioso de vitalidade e autoconfiança. Você se expressa com facilidade e autenticidade. Bom dia para iniciativas pessoais, apresentações públicas e qualquer atividade que exija presença e carisma. Os outros respondem positivamente à sua energia.',
      opposition: 'Confronto com o outro revela necessidades não atendidas. Alguém — parceiro, sócio ou adversário — funciona como espelho, mostrando aspectos de si mesmo que talvez prefira não ver. Este trânsito não é sobre vencer o outro, mas sobre integrar partes de si que foram projetadas fora.',
      sextile: 'Oportunidades sutis de crescimento pessoal se apresentam através de conexões e colaborações. Esteja aberto a convites e propostas — mesmo as que parecem pequenas podem abrir caminhos significativos. Sua vitalidade flui melhor quando compartilhada.',
    },
    moon: {
      conjunction: 'Consciência luminosa das suas emoções — o que normalmente fica nos bastidores vem à superfície com clareza. Bom momento para entender seus padrões emocionais e necessidades profundas. A mãe ou figuras femininas podem ter destaque. Decisões que honram tanto a razão quanto o sentimento são favorecidas.',
      square: 'Conflito entre vontade e emoção. Você quer uma coisa mas sente outra. Irritabilidade e inquietação são possíveis, especialmente em relação a questões domésticas ou familiares. Não force decisões — permita que a tensão se resolva naturalmente ao longo do dia.',
      trine: 'Harmonia profunda entre mente e coração. Sua intuição é confiável e suas decisões equilibram razão e sentimento naturalmente. Bom dia para conversas íntimas, para nutrir relacionamentos e para atividades criativas que envolvam expressão emocional.',
      opposition: 'O mundo externo provoca reações emocionais intensas. Pode haver tensão entre vida profissional e vida pessoal/familiar. Alguém próximo pode parecer exigente ou carente. Encontre o equilíbrio sem se anular — suas necessidades também são válidas.',
      sextile: 'Expressão emocional fluida e social. Bom para conversas íntimas, encontros informais e para comunicar sentimentos de forma natural. Sua sensibilidade é percebida como charme, não como vulnerabilidade.',
    },
    mercury: {
      conjunction: 'Mente iluminada — seu pensamento está claro, criativo e alinhado com seu propósito pessoal. Excelente para comunicações importantes, apresentações, escritas e qualquer atividade intelectual que exija originalidade. Você encontra as palavras exatas para expressar quem é. Cuidado apenas com excesso de subjetividade nas análises.',
      square: 'Dificuldade em comunicar suas ideias ou em ser compreendido pelos outros. Pode haver mal-entendidos, especialmente em situações que envolvem ego ou reconhecimento. Evite decisões importantes baseadas apenas na sua perspectiva — busque outras opiniões antes de concluir.',
      trine: 'Comunicação brilhante e carismática. Você fala com autoridade e charme ao mesmo tempo. Excelente para negociações, ensino, vendas e qualquer atividade que exija persuasão inteligente. Ideias criativas fluem com facilidade.',
      opposition: 'Sua visão pode ser desafiada por alguém que pensa diferente. Em vez de defender a posição com força, considere que o outro oferece uma perspectiva complementar. A comunicação melhora quando você escuta antes de responder.',
      sextile: 'Pensamento claro e capacidade de articular ideias com facilidade. Bom para escrever, estudar, planejar e fazer contatos profissionais. Sua mente está ágil e receptiva a novas informações.',
    },
    venus: {
      conjunction: 'Dia favorável para amor, beleza e prazer. Seu magnetismo pessoal está elevado — você atrai atenção e admiração com facilidade. Excelente para encontros românticos, eventos sociais, compras e qualquer atividade que envolva estética e prazer sensorial. Aproveite para se cuidar e embelezar o ambiente.',
      square: 'Desejo conflitante com realidade afetiva. Você pode querer mais do que a situação oferece — mais amor, mais prazer, mais reconhecimento estético. A insatisfação pode ser produtiva se usada como motivação para mudança, mas cuidado com excessos compensatórios.',
      trine: 'Harmonia excepcional nos relacionamentos e na autoestima. Você se sente bonito, amado e valorizado. Charme natural em alta — bom para socializar, paquerar e fortalecer vínculos. As artes e a criatividade fluem sem esforço.',
      opposition: 'O outro pode fascinar ou frustrar — atração e repulsão coexistem. Avalie o que realmente valoriza em pessoas e situações. Este trânsito traz consciência sobre padrões afetivos que talvez operem automaticamente.',
      sextile: 'Oportunidades sociais e afetivas discretas mas agradáveis. Um sorriso, um elogio inesperado ou um encontro casual pode alegrar o dia. Esteja aberto às pequenas belezas e gentilezas ao redor.',
    },
    mars: {
      conjunction: 'Energia vital em alta — você se sente corajoso, dinâmico e pronto para agir. Excelente para atividade física, projetos que exigem iniciativa e situações competitivas. O risco é a impulsividade e a agressividade desnecessária. Use essa força abundante com consciência e direção.',
      square: 'Tensão e frustração acumuladas buscam liberação. Você pode sentir raiva, impaciência ou vontade de confrontar. Acidentes por pressa são possíveis. Canalize a energia em exercício físico intenso ou trabalho prático — evite discussões e decisões tomadas no calor do momento.',
      trine: 'Ação fluida, assertiva e produtiva. Excelente dia para empreender, competir, exercitar-se e liderar. Sua energia é percebida como confiança, não como agressividade. Tudo que iniciar hoje tem boas chances de sucesso.',
      opposition: 'Conflitos com outros podem surgir — especialmente com homens ou figuras competitivas. Alguém pode desafiar sua posição ou provocar sua reação. A melhor resposta é assertividade sem agressividade. Canalize a energia com sabedoria.',
      sextile: 'Motivação e energia para agir de forma prática. Bom dia para resolver pendências, tomar iniciativas e exercitar-se. A coragem está presente sem o excesso da impulsividade.',
    },
    jupiter: {
      conjunction: 'Expansão da consciência e da autoconfiança. Você se sente otimista e capaz de crescer em múltiplas direções. Excelente para começar empreendimentos, viagens e estudos. A generosidade atrai reciprocidade. Cuidado apenas com promessas exageradas.',
      square: 'Excesso de confiança pode gerar decisões precipitadas. Você quer mais do que a situação permite e pode superestimar suas capacidades. Dose o otimismo com realismo — nem toda oportunidade é genuína.',
      trine: 'Período de sorte e expansão natural. As coisas fluem a seu favor quase sem esforço extra. Bom para assinatura de contratos, viagens, publicações e qualquer atividade que exija visão ampla e confiança.',
      opposition: 'Outros parecem ter mais do que você — mais sorte, mais liberdade, mais possibilidades. A comparação pode gerar insatisfação. Em vez de invejar, pergunte-se: o que posso fazer para expandir minhas próprias possibilidades?',
      sextile: 'Oportunidades discretas de crescimento pessoal e profissional. Um convite, um contato ou uma ideia podem abrir caminhos. Esteja receptivo ao novo sem abandonar o que já funciona.',
    },
    saturn: {
      conjunction: 'Período de seriedade e autoavaliação. Você sente o peso das responsabilidades e pode parecer que as conquistas exigem mais esforço. Este não é momento de expansão, mas de consolidação. O que construir agora terá fundamentos sólidos. Aceite o ritmo mais lento.',
      square: 'Pressão e limitações testam sua resiliência. Figuras de autoridade ou circunstâncias externas parecem bloquear seus objetivos. A frustração é natural, mas a lição é perseverança — o que sobrevive a Saturno se torna inabalável.',
      trine: 'Disciplina e estrutura trabalham a seu favor. Conquistas sólidas e reconhecimento merecido são possíveis. Bom momento para compromissos de longo prazo, planejamento e para demonstrar maturidade profissional.',
      opposition: 'Confronto com limitações externas ou com a passagem do tempo. Algo na vida precisa ser reestruturado. Avalie honestamente: o que construiu ainda serve ao seu propósito?',
      sextile: 'Oportunidades que recompensam trabalho consistente. Mentores, estruturas e sistemas podem facilitar seu progresso. Aproveite para organizar, planejar e dar passos firmes.',
    },
    uranus: {
      conjunction: 'Momento de ruptura ou despertar súbito. Algo inesperado sacode sua identidade — pode ser uma revelação, um encontro ou uma circunstância que muda tudo. Este trânsito pede autenticidade radical. O que não é genuinamente seu será removido para dar lugar ao novo.',
      square: 'Inquietação e necessidade de liberdade em destaque. Você pode sentir que a vida está restritiva demais e querer mudanças drásticas. Cuidado com decisões impulsivas que desmontem o que ainda funciona. A mudança é necessária, mas pode ser implementada com inteligência.',
      trine: 'Originalidade e autenticidade fluem naturalmente. Você se sente livre para ser quem realmente é, sem pedir permissão. Bom momento para inovações, mudanças criativas e para expressar sua individualidade de formas surpreendentes.',
      opposition: 'Outros provocam ou desafiam sua estabilidade. Alguém pode agir de forma imprevisível, forçando você a se adaptar. Este trânsito testa sua capacidade de manter o centro enquanto o mundo ao redor muda.',
      sextile: 'Oportunidades de renovação sutil. Pequenas mudanças na rotina ou na forma de se expressar podem ter efeitos revitalizantes. Esteja aberto ao inesperado — nem tudo que surpreende é ameaçador.',
    },
    neptune: {
      conjunction: 'Período de dissolução das certezas habituais. Você pode sentir-se confuso sobre quem é ou o que quer. Isto não é fraqueza — é o início de uma expansão espiritual que transcende o ego. Evite decisões definitivas enquanto a névoa não se dissipar. Meditação e arte são caminhos férteis.',
      square: 'Confusão, ilusão ou desilusão podem dominar. A realidade não corresponde ao ideal e a frustração gera fuga — álcool, fantasia, procrastinação. Este trânsito pede discernimento: o que é sonho legítimo e o que é autoengano? Não assine contratos nem faça promessas enquanto não enxergar com clareza.',
      trine: 'Intuição, compaixão e sensibilidade espiritual em alta. Você percebe sutilezas que outros ignoram. Bom período para atividades artísticas, meditação, voluntariado e para conexões que transcendem o superficial.',
      opposition: 'Outros podem parecer enganosos ou idealizados. Cuidado com projeções — nem tudo é como parece. Verifique informações antes de confiar cegamente. A desilusão pode ser dolorosa mas também liberadora.',
      sextile: 'Inspiração criativa e sensibilidade espiritual disponíveis de forma suave. Bom para música, poesia, meditação e para perceber o sagrado no cotidiano.',
    },
    pluto: {
      conjunction: 'Transformação profunda da identidade. Você pode sentir que está morrendo simbolicamente para renascer. Temas de poder, controle e autenticidade radical vêm à superfície. Este trânsito é raro e poderoso — não resista à mudança. O que deve morrer, deixe morrer. O que nascerá será mais verdadeiro.',
      square: 'Lutas de poder intensas — com outros ou consigo mesmo. Você sente necessidade de controlar situações que estão além do controle. Obsessão, ciúmes e manipulação são riscos. A lição é aprender a soltar o que não pode segurar sem se perder no processo.',
      trine: 'Poder pessoal profundo e transformador. Você pode influenciar situações com intensidade magnética. Bom momento para mudanças profundas que exigem coragem — terapia, reinvenção profissional, confronto com medos antigos.',
      opposition: 'Confronto com poder externo — alguém tenta controlar ou manipular. A resposta não é submissão nem contra-ataque, mas consciência. Quando você reconhece a dinâmica, ela perde poder sobre você.',
      sextile: 'Oportunidades de transformação sutil mas significativa. Insights sobre padrões inconscientes podem surgir através de leituras, terapia ou encontros significativos. Pequenas mortes simbólicas preparam grandes renascimentos.',
    },
  },
  moon: {
    sun: {
      conjunction: 'Emoções e vontade se fundem — você sente com clareza o que quer e o que precisa. Bom momento para decisões que honram tanto a razão quanto o coração. Sua presença emocional é notada pelos outros. A mãe ou figuras femininas podem ter destaque no dia.',
      square: 'Conflito entre o que sente e o que quer. Irritabilidade passageira, especialmente em questões de reconhecimento ou validação. Não tome decisões importantes nas próximas horas — a tensão se dissolve rapidamente.',
      trine: 'Harmonia entre necessidades emocionais e expressão pessoal. Você se sente centrado, presente e autêntico. Bom para interações sociais, expressão criativa e para nutrir relações com pessoas queridas.',
      opposition: 'Tensão entre vida interior e demandas externas. Pode sentir que o mundo pede demais enquanto você precisa de recolhimento. Não se force — honre a necessidade de pausa quando possível.',
      sextile: 'Sensibilidade e charme emocional facilitam conexões. Bom momento para conversas íntimas, networking informal e para demonstrar cuidado com pessoas importantes.',
    },
    mercury: {
      conjunction: 'Seu raciocínio lógico e racional será fortemente influenciado pelo seu estado de espírito, o qual tanto pode ser positivo quanto negativo, dependendo de outros fatores. Por essa razão, este não é o melhor momento para tomar decisões, mas é um bom período para coletar informações que o ajudarão a decidir posteriormente. O momento é favorável às conversações sobre seus sentimentos e como se sente a respeito de alguma coisa importante. Você poderá expressar suas emoções mais facilmente do que em outras ocasiões. A comunicação com as mulheres será bastante proveitosa nesse dia. Seu humor poderá variar rapidamente sem que possa especificar as mudanças que ocorreram.',
      square: 'Tensão entre o que pensa e o que sente. A mente quer racionalizar emoções que resistem à lógica. Mal-entendidos são possíveis — você pode dizer coisas que não refletem o que realmente sente. Adie conversas delicadas para quando a Lua mudar de aspecto.',
      trine: 'Pensamento intuitivo e comunicação emocionalmente inteligente. Você consegue articular sentimentos complexos com clareza e sensibilidade. Bom dia para escrever diários, ter conversas profundas e para atividades que combinem lógica e emoção.',
      opposition: 'Desconexão entre cabeça e coração. Você racionaliza demais o que deveria simplesmente sentir, ou se emociona quando deveria pensar com frieza. Não force a resolução — permita que pensamento e sentimento encontrem equilíbrio naturalmente.',
      sextile: 'Mente receptiva a nuances emocionais. Bom momento para estudos que exigem empatia, para ler entrelinhas e para comunicações que combinam informação com sensibilidade.',
    },
    venus: {
      conjunction: 'Necessidade profunda de carinho, aconchego e beleza. Você quer ser amado e mimar-se. Excelente dia para encontros românticos, autocuidado, compras prazerosas e para criar ambientes bonitos. A gentileza vem naturalmente e é recíproca.',
      square: 'Insatisfação emocional passageira — pode sentir carência afetiva ou inquietação sem causa clara. Cuidado com compras impulsivas motivadas por desejo de conforto. O desconforto é breve — não faça mudanças permanentes baseadas em emoções transitórias.',
      trine: 'Prazer e conforto emocional abundantes. Você se sente amado, bonito e em paz. Momento perfeito para relaxar, curtir a companhia de quem ama, preparar uma boa refeição ou desfrutar de arte e música. A vida é boa — permita-se sentir isso.',
      opposition: 'Oscilação entre desejo de companhia e necessidade de espaço. Pode sentir-se carente e ao mesmo tempo irritado com a proximidade dos outros. Reconheça a ambivalência sem se julgar — ela é transitória.',
      sextile: 'Pequenos prazeres trazem alegria desproporcional. Um café bem feito, uma música bonita, um gesto de carinho — aprecie os detalhes que fazem a vida doce. Compartilhe com quem ama.',
    },
    mars: {
      conjunction: 'Emoções intensas e reativas — a energia emocional está alta e pode se manifestar como paixão ou como irritabilidade. Você reage rapidamente a estímulos e pode se arrepender depois. Bom dia para atividade física que envolva expressão emocional (dança, artes marciais). Evite discussões domésticas.',
      square: 'Irritabilidade e impaciência emocional. Pequenas frustrações domésticas ou familiares podem gerar explosões desproporcionais. Respire antes de reagir. Este trânsito é breve — não destrua nada que levou tempo para construir por causa de um momento de raiva.',
      trine: 'Coragem emocional — capacidade de agir sobre sentimentos com assertividade saudável. Bom para expressar necessidades, defender pessoas queridas e para atividades físicas que melhoram o humor. Energia emocional bem canalizada.',
      opposition: 'Confrontos emocionais com pessoas próximas. Alguém pode provocar sua reação — intencionalmente ou não. A tentação é reagir com agressividade, mas a melhor resposta é assertividade consciente. Não leve para o pessoal.',
      sextile: 'Motivação para cuidar de si, do lar e das pessoas queridas. Energia disponível para tarefas domésticas, exercícios leves e para resolver pequenas pendências emocionais que vinha adiando.',
    },
    jupiter: {
      conjunction: 'Generosidade emocional e otimismo contagiante. Você se sente emocionalmente abundante — capaz de acolher, perdoar e celebrar. Bom dia para reconciliações, festas familiares e para expressar afeto sem contenção. A intuição está aguçada para oportunidades.',
      square: 'Inquietação emocional — desejo de mais do que a situação permite. Pode haver exagero nas reações ou tendência a dramatizar sentimentos. A insatisfação é passageira e pode motivar mudanças positivas se canalizada com sabedoria.',
      trine: 'Bem-estar emocional profundo e fé no futuro. Você se sente seguro e otimista. Excelente para decisões intuitivas, para nutrir relacionamentos e para atividades prazerosas em família. A sorte está com quem confia na intuição.',
      opposition: 'Tensão entre segurança emocional e necessidade de crescer. Parte de você quer o conforto do conhecido, outra anseia pelo novo. Não force a escolha — encontre formas de expandir sem abandonar o que nutre.',
      sextile: 'Intuição favorável a pequenas decisões. Conversas com mulheres ou figuras nurturantes podem trazer insights valiosos. Bom momento para planejar viagens familiares ou celebrações.',
    },
    saturn: {
      conjunction: 'Sobriedade emocional — você sente o peso das responsabilidades e pode experimentar tristeza ou solidão temporária. Não é depressão, é realismo emocional. Use esse momento para organizar a vida interior, estabelecer limites saudáveis e cuidar de obrigações domésticas com maturidade.',
      square: 'Sensação de restrição emocional ou solidão. Pode parecer que ninguém entende o que sente ou que o mundo é frio demais. Este sentimento é passageiro — dura poucas horas. Não tome decisões sobre relacionamentos enquanto estiver sob essa influência. Seja gentil consigo.',
      trine: 'Maturidade emocional sólida. Você lida com sentimentos difíceis sem ser dominado por eles. Bom dia para conversas sérias sobre família, para estabelecer limites com carinho e para decisões domésticas que exigem responsabilidade.',
      opposition: 'Conflito entre necessidades emocionais e deveres. Pode sentir que obrigações impedem de cuidar de si ou de quem ama. A culpa é contraproducente — encontre o equilíbrio possível, não o perfeito.',
      sextile: 'Capacidade de estruturar emoções de forma construtiva. Bom para organizar a casa, resolver pendências familiares ou para ter conversas maduras sobre sentimentos. Estabilidade emocional inspira confiança.',
    },
    uranus: {
      conjunction: 'Humor instável e necessidade súbita de liberdade emocional. Você pode sentir impulsos inesperados — vontade de mudar tudo, romper rotinas ou expressar-se de forma surpreendente. Este trânsito é breve — não tome decisões permanentes baseadas em sentimentos voláteis. A excitação passa.',
      square: 'Inquietação emocional intensa. Rotinas domésticas parecem sufocantes e você quer escapar. Discussões súbitas em casa são possíveis. Reconheça a necessidade de espaço sem destruir o que funciona. Uma caminhada ou mudança de ambiente ajuda.',
      trine: 'Intuição brilhante e abertura emocional ao novo. Você se sente receptivo a experiências incomuns e a pessoas diferentes. Bom momento para quebrar padrões emocionais sem drama — a mudança vem naturalmente.',
      opposition: 'Alguém próximo pode agir de forma imprevisível, desestabilizando sua segurança emocional. Não reaja com controle — permita espaço. Mudanças inesperadas na rotina doméstica são possíveis.',
      sextile: 'Pequenas surpresas emocionais agradáveis. Uma mensagem inesperada, um insight sobre seus sentimentos ou uma quebra suave na rotina traz frescor ao dia.',
    },
    neptune: {
      conjunction: 'Sensibilidade extrema e permeabilidade emocional. Você absorve o humor dos outros como esponja. Sonhos vívidos e intuição aguçada, mas também confusão sobre o que é seu e o que é dos outros. Evite álcool e situações emocionalmente caóticas. Meditação e música são refúgios ideais.',
      square: 'Confusão emocional — você pode sentir tristeza ou nostalgia sem causa aparente, ou idealizar pessoas e situações além da realidade. Cuidado com autoengano e com promessas afetivas baseadas em fantasia. O sentimento é real, mas a interpretação pode estar distorcida.',
      trine: 'Compaixão profunda e conexão espiritual com os outros. Sua empatia está em pico — você percebe o que outros sentem antes de eles mesmos. Bom para atividades artísticas, meditação e para cuidar de quem precisa sem se perder no processo.',
      opposition: 'Desilusão emocional possível — alguém pode não ser o que parecia. Não confunda compaixão com permissividade. É possível ser empático e ainda assim ter limites claros.',
      sextile: 'Inspiração emocional sutil. Sonhos podem trazer mensagens importantes. Sensibilidade artística e espiritual em alta de forma suave e integrável.',
    },
    pluto: {
      conjunction: 'Emoções profundas e intensas vêm à superfície — ciúmes, medos antigos, paixões que pensava superadas. Este trânsito breve mas poderoso pode trazer insights transformadores sobre padrões emocionais inconscientes. Não reprima — observe com curiosidade. O que emerge quer ser curado.',
      square: 'Tensão emocional intensa. Sentimentos de poder, controle ou manipulação podem emergir — seus ou de outros. Cuidado com jogos emocionais e com a tentação de controlar situações através de culpa ou chantagem emocional. A consciência é o antídoto.',
      trine: 'Profundidade emocional e capacidade de transformação. Você pode acessar camadas emocionais que normalmente ficam escondidas — sem medo. Bom momento para terapia, conversas profundas e para processar emoções antigas que precisam ser liberadas.',
      opposition: 'Confronto emocional com dinâmicas de poder. Alguém pode tentar manipular seus sentimentos ou você pode perceber padrões onde antes era cego. A consciência dói, mas liberta.',
      sextile: 'Insights emocionais sutis sobre padrões inconscientes. Bom para terapia, leituras psicológicas e para conversas que vão além da superfície. Pequenas revelações podem ter grande impacto.',
    },
  },
  venus: {
    sun: {
      conjunction: 'Charme e magnetismo pessoal em alta. Você se sente atraente e atraído pela beleza ao seu redor. Excelente para encontros sociais, cuidados com a aparência e para receber elogios. O amor-próprio está fortalecido.',
      square: 'Desejo de prazer e reconhecimento pode conflitar com a realidade. Você quer ser admirado mas sente que não recebe o que merece. Evite gastos para compensar insatisfação.',
      trine: 'Harmonia entre autoestima e expressão afetiva. Você atrai reciprocidade natural — o que dá, recebe de volta. Bom para romance, arte e socialização.',
      opposition: 'O outro fascina ou provoca. Avalie se a admiração que sente é baseada em realidade ou projeção. Tensão criativa nos relacionamentos.',
      sextile: 'Oportunidades sociais agradáveis. Convites, elogios ou encontros inesperados adoçam o dia.',
    },
    moon: {
      conjunction: 'Ternura e sensibilidade nos vínculos. Necessidade de conforto emocional e de espaços bonitos. Bom para cuidar de si e de quem ama com delicadeza.',
      square: 'Carência afetiva temporária pode gerar insatisfação. Cuidado com idealizações emocionais e compras por impulso emocional.',
      trine: 'Bem-estar emocional e prazer simples. Momento para relaxar, curtir o lar, cozinhar algo especial ou simplesmente estar com quem ama.',
      opposition: 'Oscilação entre necessidade de afeto e desejo de independência. A ambivalência é passageira.',
      sextile: 'Gentileza espontânea e receptividade ao carinho. Pequenos gestos de afeto ressoam profundamente.',
    },
    mercury: {
      conjunction: 'Comunicação agradável e diplomática. Excelente para negociações, declarações de afeto e conversas que exigem tato. Você encontra as palavras certas para agradar sem ser falso.',
      square: 'Dificuldade em equilibrar honestidade e diplomacia. Pode dizer o que o outro quer ouvir em vez do que é verdade, ou ser rude quando queria ser apenas direto.',
      trine: 'Eloqüência e charme na comunicação. Palavras bonitas fluem naturalmente. Bom para escrever cartas de amor, negociar e para qualquer atividade que combine estética e intelecto.',
      opposition: 'Divergência entre valores e ideias. O que pensa pode não combinar com o que sente no coração. Busque síntese em vez de escolha.',
      sextile: 'Comunicação afetiva suave. Bom para convites, agradecimentos e para expressar apreço de forma natural.',
    },
    venus: {
      conjunction: 'Retorno de Vênus — renovação completa dos valores afetivos e estéticos. Reavalie o que realmente importa no amor e nas finanças. Magnetismo pessoal no pico. Bom para mudanças de visual e para definir intenções nos relacionamentos.',
      trine: 'Harmonia excepcional em amor e finanças. Tudo relacionado a beleza, prazer e vínculos flui com graça. Dia de sorte para compras, encontros e celebrações.',
      square: 'Reavaliação do que valoriza. A insatisfação pode ser produtiva se usada para motivar mudanças reais — não apenas indulgência compensatória.',
      opposition: 'Reflexão profunda sobre padrões afetivos. O que atrai pode não ser o que nutre. Consciência é o primeiro passo para escolhas melhores.',
      sextile: 'Oportunidades afetivas e financeiras discretas. Esteja atento aos sinais — uma porta se abre suavemente.',
    },
    mars: {
      conjunction: 'Paixão e desejo intensificados. A atração física está em alta e você pode se sentir irresistivelmente atraído por alguém. Excelente para iniciativa romântica e para expressar desejo de forma direta. Energia criativa disponível para artes que exigem vigor.',
      square: 'Tensão sexual ou relacional — o que deseja pode conflitar com o que valoriza. Ciúmes, possessividade ou atração por situações "proibidas" são possíveis. Não force situações. A tensão pode ser criativa se não for destrutiva.',
      trine: 'Equilíbrio perfeito entre paixão e ternura. Romance apaixonado e ao mesmo tempo carinhoso. Excelente para intimidade, expressão artística com energia vital e para demonstrar amor de forma ativa e generosa.',
      opposition: 'Atração magnética mas com frustração — o que quer pode estar fora de alcance ou vir com complicações. Jogos de poder nos relacionamentos. Consciência sobre o que realmente deseja vs. o que apenas excita.',
      sextile: 'Flerte natural e iniciativa afetiva bem recebida. Bom dia para dar o primeiro passo, demonstrar interesse e para atividades criativas com energia positiva.',
    },
    saturn: {
      conjunction: 'Seriedade nos relacionamentos e nas finanças. Avalia vínculos com realismo — o que funciona se fortalece, o que era ilusão se dissolve. Não é momento para leveza superficial, mas para compromissos genuínos.',
      square: 'Insatisfação afetiva ou financeira. Sente que não recebe amor ou dinheiro suficiente. Antes de culpar as circunstâncias, examine se suas expectativas são realistas e se está investindo nos lugares certos.',
      trine: 'Estabilidade e maturidade nos vínculos. Amor paciente e duradouro é favorecido. Bom para investimentos conservadores, compromissos formais e para demonstrar lealdade.',
      opposition: 'O amor é testado pela realidade. Um relacionamento pode parecer restritivo ou insuficiente. A pergunta não é "isso me excita?" mas "isso me sustenta?". O que sobrevive a Saturno é ouro.',
      sextile: 'Oportunidade para construir vínculos baseados em respeito mútuo e valores sólidos. Finanças se beneficiam de organização. Relacionamentos maduros prosperam.',
    },
    jupiter: {
      conjunction: 'Abundância afetiva e social. O amor parece generoso, os encontros prazerosos e as finanças favoráveis. Excelente para festas, presentes e para expandir o círculo social. O risco é o excesso — gastos desnecessários ou indulgência exagerada.',
      square: 'Desejo de luxo e prazer pode exceder as possibilidades reais. Gastos extravagantes ou promessas românticas exageradas são riscos. A insatisfação pode motivar crescimento se canalizada com sabedoria.',
      trine: 'Sorte no amor e nos negócios. Generosidade recíproca e prazer abundante. Dia perfeito para celebrações, compras importantes e para investir em beleza e qualidade de vida.',
      opposition: 'O que deseja parece distante ou excessivamente caro — emocional ou financeiramente. Não force — às vezes a melhor estratégia é esperar o momento certo.',
      sextile: 'Oportunidades sociais e financeiras agradáveis. Um encontro casual ou um convite pode abrir portas para prazeres e conexões valiosas.',
    },
    uranus: {
      conjunction: 'Atração súbita por pessoas ou situações incomuns. O amor pode chegar de forma inesperada ou um relacionamento existente pede renovação. Não resista ao novo — mas também não descarte o antigo por pura excitação.',
      square: 'Inquietação nos relacionamentos. Desejo de liberdade e novidade pode criar tensão com parceiros ou com seus próprios valores. Mudanças afetivas repentinas são possíveis — mas nem toda vontade de mudar é genuína necessidade.',
      trine: 'Frescor e originalidade nos vínculos. Encontros com pessoas interessantes, experiências estéticas inusitadas e abertura para formas não convencionais de amor. A criatividade se beneficia do inesperado.',
      opposition: 'Alguém imprevisível provoca seus valores ou sua estabilidade afetiva. A atração pelo diferente pode desestabilizar — consciência é essencial.',
      sextile: 'Pequenas surpresas agradáveis no amor ou nas finanças. Abertura para o novo sem drama — evolução suave nos vínculos.',
    },
    neptune: {
      conjunction: 'Romantismo extremo e idealização nos relacionamentos. Você pode se apaixonar pela possibilidade em vez da pessoa real. Arte, música e beleza espiritual estão em pico. Cuidado com decisões financeiras — a percepção está distorcida pela fantasia.',
      square: 'Desilusão afetiva possível — alguém pode não ser o que parecia ou suas expectativas podem ter sido irrealistas. Evite empréstimos, investimentos arriscados e promessas afetivas nevoadas. A clareza virá em poucos dias.',
      trine: 'Conexão espiritual nos relacionamentos. Amor transcendente, compaixão genuína e apreciação da beleza em todas as suas formas. Bom para música, cinema, dança e para experiências estéticas elevadas.',
      opposition: 'Projeção de ideais no outro — cuidado com encantamento que esconde realidade. Nem todo charme é sincero. Verifique fatos antes de se envolver emocional ou financeiramente.',
      sextile: 'Sensibilidade estética refinada. Inspiração para arte, decoração e para perceber beleza onde outros não veem. Romance sutil e poético.',
    },
    pluto: {
      conjunction: 'Amor intenso e transformador. Atração magnética e obsessiva é possível. Os vínculos que se formam agora têm poder de mudar sua vida — para melhor ou pior. Consciência sobre dinâmicas de poder no amor é essencial. O desejo é profundo.',
      square: 'Ciúmes, possessividade e jogos de poder nos relacionamentos. A intensidade afetiva pode ser sufocante — para você ou para o outro. A lição é amar sem controlar. Se sentir que precisa manipular para manter, algo está errado na base.',
      trine: 'Profundidade e autenticidade nos vínculos. Você pode se conectar com pessoas em nível de alma — sem jogos, sem máscaras. Transformação positiva através do amor e da intimidade genuína.',
      opposition: 'Confronto com dinâmicas de poder nos relacionamentos. Alguém pode tentar controlar através de sedução ou rejeição. A melhor resposta é consciência e escolha deliberada — não reação.',
      sextile: 'Insights sobre padrões afetivos profundos. Pequenas revelações sobre o que realmente deseja no amor podem guiar escolhas melhores. Intimidade segura é possível.',
    },
  },
  mercury: {
    sun: {
      conjunction: 'Mente alinhada com propósito pessoal. Excelente para comunicar quem você é, para apresentações, entrevistas e para articular objetivos com clareza. Pensamento criativo em alta.',
      square: 'Tensão entre o que pensa e o que quer expressar. Pode haver mal-entendidos em situações que envolvem ego. Revise antes de enviar mensagens importantes.',
      trine: 'Comunicação fluida e carismática. Você articula ideias com brilho e originalidade. Bom para ensino, vendas e qualquer atividade que combine intelecto com presença pessoal.',
      opposition: 'Divergências com outros sobre ideias ou planos. Nem toda discordância é ataque — pode ser complemento. Ouça antes de rebater.',
      sextile: 'Pensamento claro e expressão fácil. Bom para contatos profissionais, emails importantes e para articular projetos pessoais.',
    },
    moon: {
      conjunction: 'Pensamento colorido pela emoção. Boa percepção das necessidades dos outros e capacidade de comunicar sentimentos. Pode ser difícil separar fatos de sentimentos — melhor para coletar informações do que para decidir.',
      square: 'Mente agitada por emoções. Dificuldade em pensar com clareza porque os sentimentos interferem. Adie análises importantes. Escreva o que sente para processar.',
      trine: 'Inteligência emocional em alta. Você percebe nuances que outros ignoram e consegue falar sobre sentimentos com naturalidade. Bom para terapia, aconselhamento e para conversas profundas.',
      opposition: 'Conflito entre racionalidade e sentimento. A cabeça diz uma coisa, o coração outra. Não force a resolução — permita que ambos tenham voz.',
      sextile: 'Sensibilidade intelectual agradável. Bom para leitura de entrelinhas, para perceber o humor dos outros e para comunicação empática.',
    },
    venus: {
      conjunction: 'Comunicação encantadora e diplomática. Você encontra as palavras exatas para agradar, seduzir e negociar com charme. Excelente para declarações de amor, propostas comerciais e para qualquer situação que exija tato e elegância verbal.',
      square: 'Dificuldade em equilibrar sinceridade com gentileza. Pode elogiar demais por insegurança ou ser rude quando queria ser apenas honesto. Busque o meio-termo entre adulação e crueza.',
      trine: 'Eloqüência afetiva — palavras bonitas fluem sem esforço. Bom para escrever poesia, cartas de amor, discursos e para qualquer comunicação que exija beleza e persuasão.',
      opposition: 'O que diz pode não refletir o que sente. Ou vice-versa — o que sente pode ser difícil de expressar adequadamente. Busque autenticidade na comunicação.',
      sextile: 'Comunicação agradável e receptiva. Bom para convites, agradecimentos e para expressar apreço de forma elegante.',
    },
    mars: {
      conjunction: 'Pensamento rápido e assertivo. Mente combativa e argumentativa — excelente para debates e negociações duras. O risco é a agressividade verbal. Pense antes de enviar aquele email inflamado.',
      square: 'Conflitos verbais quase inevitáveis. Língua afiada e pouca paciência. Discussões podem escalar. Adie conversas delicadas se possível.',
      trine: 'Mente ágil e comunicação direta sem ser agressiva. Excelente para tomada de decisões rápidas, apresentações que exigem firmeza e para resolver problemas práticos com eficiência.',
      opposition: 'Alguém pode desafiar suas ideias de forma provocativa. Não morda a isca — responda com inteligência, não com raiva.',
      sextile: 'Pensamento prático e comunicação eficiente. Bom para resolver problemas, tomar decisões rápidas e para interações que exigem objetividade.',
    },
    jupiter: {
      conjunction: 'Pensamento expansivo e otimista. Visão de conjunto ampliada — excelente para planejamento estratégico, estudos filosóficos e para comunicar visões inspiradoras. Cuidado com generalização excessiva e promessas impossíveis.',
      square: 'Otimismo intelectual exagerado. Pode prometer demais ou ignorar detalhes cruciais em nome do "quadro geral". Verifique fatos antes de afirmar certezas. Contratos merecem revisão cuidadosa.',
      trine: 'Mente aberta e capacidade de síntese. Bom para estudos, publicações, apresentações e para comunicar ideias complexas de forma acessível. Aprendizado rápido e prazeroso.',
      opposition: 'Divergências filosóficas ou culturais com outros. Nem toda verdade é universal — respeite perspectivas diferentes sem abandonar a sua.',
      sextile: 'Oportunidades intelectuais — cursos, livros, contatos que expandem a mente. Esteja receptivo a novas perspectivas.',
    },
    saturn: {
      conjunction: 'Pensamento sério, estruturado e realista. Excelente para planejamento detalhado, contratos e análises que exigem rigor. O risco é o pessimismo ou a rigidez mental. Nem tudo precisa ser perfeito para funcionar.',
      square: 'Bloqueios mentais e dificuldade de comunicação. Pode sentir que não consegue pensar com clareza ou que os outros não compreendem suas ideias. Momento de revisão, não de conclusão.',
      trine: 'Disciplina intelectual produtiva. Concentração, método e persistência mental em alta. Bom para estudos que exigem profundidade, para escrita técnica e para decisões de longo prazo.',
      opposition: 'Críticas externas ao seu pensamento. Alguém questiona suas ideias ou sua competência. Use como feedback construtivo em vez de defesa.',
      sextile: 'Pensamento pragmático e eficiente. Bom para organização, planejamento e para comunicações que exigem precisão e credibilidade.',
    },
    uranus: {
      conjunction: 'Insights súbitos e ideias originais. Sua mente está receptiva a informações não-convencionais. Excelente para inovação, resolução criativa de problemas e para pensar fora da caixa. O risco é a dispersão — muitas ideias, pouca execução.',
      square: 'Agitação mental e dificuldade de concentração. Pensamentos erráticos saltam de um assunto a outro. Mudanças súbitas de opinião são possíveis. Não tome decisões definitivas sob essa influência nervosa.',
      trine: 'Genialidade prática — ideias originais que são também viáveis. Bom para tecnologia, programação, brainstorming e para encontrar soluções inovadoras para problemas antigos.',
      opposition: 'Ideias provocativas ou informações inesperadas desestabilizam certezas. Alguém pode dizer algo que muda completamente sua perspectiva.',
      sextile: 'Abertura mental para o novo sem perder o fio. Bom para aprender coisas diferentes, experimentar abordagens inéditas e para conexões intelectuais estimulantes.',
    },
    neptune: {
      conjunction: 'Pensamento intuitivo mas nebuloso. A mente capta sutilezas invisíveis mas pode confundir imaginação com realidade. Excelente para poesia, meditação e arte. Péssimo para contratos, números e decisões lógicas. Verifique tudo duas vezes.',
      square: 'Confusão mental e dificuldade de concentração. Informações contraditórias geram incerteza. Cuidado com fake news, golpes e com acreditar no que parece bom demais para ser verdade. Adie decisões importantes.',
      trine: 'Inspiração criativa e pensamento intuitivo confiável. A imaginação trabalha a favor — bom para escrita criativa, musicS, visualizações e para perceber o que não é dito explicitamente.',
      opposition: 'Alguém pode enganar — intencionalmente ou não. Não tome informações pelo valor de face. Verifique, confirme e só então confie.',
      sextile: 'Sensibilidade intelectual sutil. Bom para perceber entrelinhas, para comunicação artística e para captar o clima emocional de um ambiente.',
    },
    pluto: {
      conjunction: 'Pensamento penetrante e investigativo. Você percebe o que está escondido — motivações ocultas, verdades não-ditas, padrões sob a superfície. Excelente para pesquisa, investigação e terapia. Pode ser obsessivo — não perca a perspectiva.',
      square: 'Pensamentos obsessivos ou paranóicos. A mente pode fixar-se em temas sombrios, suspeitas ou medos. Cuidado com comunicações manipuladoras — suas ou de outros. Nem tudo é conspiraação. Busque perspectiva.',
      trine: 'Profundidade intelectual e capacidade de pesquisa aguçada. Bom para estudos psicológicos, investigação e para conversas que vão ao cerne da questão. Palavras têm poder transformador.',
      opposition: 'Alguém pode tentar manipular através de informação — retendo, distorcendo ou usando palavras como armas. Consciência é sua defesa. Não entre em jogos de poder intelectual.',
      sextile: 'Insights penetrantes sobre situações complexas. Bom para terapia, pesquisa e para conversas que revelam verdades necessárias de forma construtiva.',
    },
  },
  mars: {
    sun: {
      conjunction: 'Energia vital em alta — você se sente corajoso, assertivo e pronto para agir. Este é um dos melhores trânsitos para iniciar projetos, confrontar desafios e defender suas posições. A vitalidade física é intensa. O risco é a impulsividade e a agressividade desnecessária. Canalize essa força em ação produtiva e exercício físico.',
      square: 'Tensão e frustração acumuladas pedem liberação. Você pode sentir raiva sem motivo aparente ou entrar em conflito com pessoas que representam autoridade ou limitação. Acidentes por pressa são possíveis. Este não é o dia para confrontos — exercite-se intensamente, trabalhe com as mãos ou faça algo competitivo para descarregar a energia.',
      trine: 'Ação fluida e bem-sucedida. Sua energia está alinhada com seus objetivos — o que fizer hoje tende a dar certo. Excelente para esportes, empreendimentos, liderança e qualquer atividade que exija iniciativa e coragem. Você transmite confiança e dinamismo.',
      opposition: 'Conflitos com outros são prováveis, especialmente com homens ou figuras competitivas. Alguém pode desafiar sua autoridade ou provocar sua reação. A melhor resposta não é o confronto direto, mas a assertividade consciente — diga o que precisa dizer, mas sem perder o controle. Evite discussões no trânsito e atividades perigosas.',
      sextile: 'Motivação e energia disponíveis para ação produtiva. Bom dia para resolver pendências práticas, exercitar-se, iniciar pequenos projetos e tomar iniciativas que vinha adiando. A coragem está presente sem o excesso da impulsividade.',
    },
    moon: {
      conjunction: 'Emoções intensas e reativas — você está mais sensível a provocações e pode reagir de forma desproporcional. Há energia para cuidar da casa e da família, mas também risco de discussões domésticas. Não tome decisões emocionais importantes sob esse trânsito. Exercício físico ajuda a descarregar a tensão.',
      square: 'Irritabilidade e impaciência emocional em destaque. Pequenos incômodos podem gerar reações explosivas. Você está mais sensível do que gostaria de admitir. Evite discussões com familiares ou pessoas próximas — o arrependimento virá rápido. Respire profundamente antes de responder.',
      trine: 'Coragem emocional e capacidade de agir sobre seus sentimentos. Bom momento para expressar o que sente de forma assertiva mas amorosa. Energia para cuidar da casa, cozinhar com entusiasmo ou proteger quem ama. Atividade física melhora o humor.',
      opposition: 'Confrontos emocionais podem surgir — alguém toca em feridas que você preferia manter escondidas. Não leve provocações para o pessoal. Este trânsito pede que encontre o equilíbrio entre defender suas necessidades e respeitar as dos outros.',
      sextile: 'Motivação para cuidar de si e do ambiente doméstico. Energia emocional bem canalizada em atividades práticas. Bom para organizar, limpar, resolver pendências do lar ou expressar afeto através de ações concretas.',
    },
    mercury: {
      conjunction: 'Pensamento rápido, incisivo e combativo. Você está mentalmente afiado e disposto a defender suas ideias com vigor. Excelente para debates, negociações duras e trabalho intelectual que exige velocidade. O risco é a agressividade verbal — pense antes de falar, especialmente em emails e mensagens que ficarão registrados.',
      square: 'Conflitos de comunicação são quase inevitáveis. Você está com a língua afiada e pouca paciência para opiniões divergentes. Discussões podem escalar rapidamente. Este não é o dia para conversas delicadas ou negociações — adie se possível. Se não puder, conte até dez antes de responder.',
      trine: 'Mente ágil e comunicação assertiva. Excelente para discussões produtivas, tomada de decisões rápidas e trabalho que exige raciocínio veloz. Você consegue ser direto sem ser agressivo. Bom para vendas, apresentações e qualquer atividade que combine intelecto com iniciativa.',
      opposition: 'Divergências intelectuais podem virar confronto. Alguém pode criticar suas ideias ou desafiar sua lógica. A tentação é responder com agressividade, mas a melhor estratégia é ouvir antes de contra-atacar. Nem toda batalha merece sua energia mental.',
      sextile: 'Pensamento ágil e prático. Bom para resolver problemas que exigem rapidez, para comunicações diretas e para tomar pequenas decisões sem procrastinar. Energia mental disponível para estudos intensivos.',
    },
    venus: {
      conjunction: 'Paixão e desejo intensificados. A atração física está em alta e você pode se sentir irresistivelmente atraído por alguém — ou atrair atenção inesperada. Bom momento para iniciativa romântica e para expressar desejo. O risco é confundir atração com amor ou agir impulsivamente em situações que exigem cautela.',
      square: 'Tensão entre desejo e afeto. O que você quer fisicamente pode conflitar com o que valoriza emocionalmente. Ciúmes, possessividade ou atração por pessoas "inadequadas" são possíveis. Não force situações afetivas — a tensão eventual pode ser produtiva se for canalizada criativamente.',
      trine: 'Equilíbrio perfeito entre desejo e afeto. O romance flui com paixão e ternura simultaneamente. Excelente para encontros íntimos, expressão artística com energia vital e para demonstrar amor de forma ativa. A atração é magnética e recíproca.',
      opposition: 'O outro desperta desejo e frustração em igual medida. Pode haver competição nos relacionamentos ou tensão entre o que quer e o que o parceiro deseja. Ciúmes e jogos de poder são riscos. Busque honestidade — o que realmente quer desta relação?',
      sextile: 'Iniciativa afetiva bem recebida. Bom dia para dar o primeiro passo no amor, para presentear de forma criativa ou para demonstrar atração de maneira natural e bem-humorada. Flerte e sedução fluem sem esforço.',
    },
    mars: {
      conjunction: 'Retorno de Marte — renovação completa da energia vital e do impulso para agir. Este é um reinício do seu ciclo de assertividade. Excelente para definir novos objetivos de condicionamento físico, iniciar projetos ambiciosos ou mudar radicalmente de atitude em relação a desafios. A energia é imensa — canalize-a com propósito.',
      square: 'Frustração consigo mesmo e com suas próprias limitações. Você pode sentir que não está agindo suficiente ou que sua energia está bloqueada. Cuidado com acidentes por impaciência. Este trânsito pede que reavalie sua forma de agir — talvez a estratégia precise mudar, não apenas a intensidade.',
      trine: 'Energia fluida e bem direcionada. Tudo que exige ação física ou iniciativa pessoal é favorecido. Esportes, exercícios intensos e atividades competitivas trazem satisfação. Você está no controle da sua força — use-a bem.',
      opposition: 'Projeção de agressividade — outros podem parecer hostis ou competitivos quando, na verdade, refletem sua própria energia combativa. Conflitos com homens são prováveis. A melhor abordagem é reconhecer sua parte na dinâmica e buscar assertividade sem dominação.',
      sextile: 'Energia prática e produtiva disponível. Bom momento para resolver problemas que exigem ação direta, para exercícios moderados e para dar pequenos passos em direção a objetivos maiores.',
    },
    saturn: {
      conjunction: 'Esforço encontra resistência significativa. Pode parecer que tudo que tenta fazer encontra um obstáculo ou demora mais do que esperava. Frustração é natural, mas não ceda à impaciência — a força bruta não resolve o que exige estratégia. Use este período para desenvolver disciplina na ação, canalizando energia em trabalho metódico em vez de explosões improdutivas.',
      square: 'Frustração intensa entre o que quer fazer e o que pode fazer. Bloqueios, atrasos e limitações testam sua paciência. Há risco de explosões de raiva ou de ações precipitadas motivadas pela frustração acumulada. Evite confrontos com autoridades. A melhor estratégia é canalizar a energia em exercício físico intenso ou trabalho manual.',
      trine: 'Energia disciplinada e extremamente produtiva. Você consegue trabalhar com foco e persistência sem se esgotar. Excelente para projetos que exigem esforço sustentado, treinos físicos estruturados ou qualquer atividade que combine força com método. Resultados concretos são prováveis.',
      opposition: 'Conflito com autoridades ou com limitações externas que bloqueiam sua ação. Você pode sentir raiva de situações que parecem injustas ou restritivas. Cuidado com reações agressivas — elas podem ter consequências duradouras. Escolha suas batalhas com sabedoria e prefira a resistência estratégica à confrontação direta.',
      sextile: 'Determinação focada e produtiva. Bom dia para trabalhos que exigem esforço físico disciplinado, para resolver problemas práticos com persistência ou para assumir responsabilidades que outros evitam. Sua capacidade de trabalho impressiona.',
    },
  },
  jupiter: {
    sun: {
      conjunction: 'Período de grande expansão pessoal e otimismo. Você se sente maior do que o habitual — mais confiante, mais generoso, mais capaz. Oportunidades surgem em várias áreas da vida simultaneamente. O risco é querer abraçar tudo ao mesmo tempo ou prometer mais do que pode cumprir. Use essa energia para iniciar projetos significativos, mas mantenha um pé no chão.',
      trine: 'Crescimento harmonioso e natural. A vida flui com mais facilidade — as coisas dão certo quase sem esforço extra. Boa sorte em negócios, viagens e estudos. Sua generosidade atrai reciprocidade. Aproveite este período para expandir horizontes, seja através de viagens, cursos ou novas filosofias de vida.',
      square: 'Excesso e exagero são os riscos principais. Você pode sentir que merece mais do que tem e agir impulsivamente para conseguir. Gastos excessivos, promessas grandiosas ou otimismo infundado podem criar problemas futuros. A lição é expandir com sabedoria — nem toda oportunidade é adequada para você neste momento.',
      opposition: 'O mundo oferece mais do que você pode absorver. Outras pessoas podem parecer ter mais sorte ou mais liberdade. Há tensão entre o que deseja ser e o que os outros esperam. Cuidado com exageros para impressionar ou com decisões baseadas em comparação. Escolha suas expansões com discernimento.',
      sextile: 'Oportunidades concretas de crescimento se apresentam — mas exigem que você dê o primeiro passo. Favorável para candidaturas, propostas, viagens curtas e ampliação de contatos profissionais. A sorte está do seu lado, mas de forma sutil — esteja atento aos convites e possibilidades que surgem.',
    },
    moon: {
      conjunction: 'Generosidade emocional e otimismo contagiante. Você se sente emocionalmente expansivo — capaz de perdoar, acolher e nutrir com facilidade. Bom momento para reconciliações familiares e para expressar carinho de forma espontânea. Cuidado apenas com a tendência a exagerar sentimentos ou a prometer mais afeto do que pode sustentar no longo prazo.',
      trine: 'Bem-estar emocional profundo. Você se sente seguro, protegido e otimista em relação ao futuro. Relacionamentos familiares fluem com harmonia. Excelente dia para cozinhar para outros, receber em casa ou simplesmente desfrutar do conforto doméstico. A intuição está aguçada e confiável.',
      square: 'Inquietação emocional — você quer mais do que a situação permite. Pode haver exagero nas reações emocionais ou tendência a comer/gastar demais para compensar insatisfação. O descontentamento passageiro pode ser um sinal de que algo na vida doméstica precisa de ajuste, mas evite mudanças drásticas hoje.',
      opposition: 'Tensão entre conforto pessoal e crescimento. Parte de você quer ficar na zona segura, outra quer expandir. Relacionamentos podem ser testados pela diferença entre o que cada um precisa emocionalmente. Busque o meio-termo entre segurança e aventura.',
      sextile: 'Momento favorável para nutrir relacionamentos e expandir seu círculo de confiança. Conversas com mulheres ou figuras maternas podem trazer insights valiosos. Boa intuição para pequenas decisões domésticas e financeiras.',
    },
    mercury: {
      conjunction: 'Pensamento expansivo e otimista. Sua mente está aberta a novas ideias, filosofias e possibilidades. Excelente para estudos, planejamento de viagens, negociações e qualquer atividade intelectual que exija visão de conjunto. Cuidado apenas com a tendência a generalizar demais ou a ignorar detalhes importantes em nome do "quadro geral".',
      trine: 'Clareza mental e capacidade de comunicar ideias complexas com facilidade. Bom dia para apresentações, aulas, escritas criativas e conversas que exigem persuasão. Você encontra as palavras certas naturalmente. Estudos e aprendizados fluem sem esforço.',
      square: 'Excesso de otimismo no pensamento pode levar a julgamentos precipitados. Você pode subestimar dificuldades ou exagerar possibilidades. Cuidado com promessas verbais que não poderá cumprir. Verifique os fatos antes de afirmar certezas.',
      opposition: 'Divergências intelectuais com outros são prováveis. Você pode sentir que sua visão de mundo é desafiada ou que precisa defender suas ideias. Evite arrogância intelectual — o outro pode ter um ponto válido que complementa o seu.',
      sextile: 'Oportunidades de aprendizado e comunicação se apresentam. Bom momento para iniciar cursos, fazer contatos profissionais por escrito ou planejar viagens. Sua capacidade de síntese e de ver conexões entre ideias está em alta.',
    },
    venus: {
      conjunction: 'Período de abundância afetiva e financeira. O amor parece mais generoso, os prazeres mais acessíveis e o dinheiro flui com mais facilidade. Excelente para encontros românticos, festas, compras de qualidade e investimentos em arte ou beleza. O risco é o excesso — gastos desnecessários ou indulgência exagerada.',
      trine: 'Harmonia excepcional nos relacionamentos e nas finanças. Dia de sorte no amor e nos negócios. Você irradia charme e generosidade que atraem reciprocidade. Bom para celebrações, presentes significativos e demonstrações de afeto. Aproveite sem culpa.',
      square: 'Desejo de prazer e luxo pode entrar em conflito com a realidade financeira. Você quer mais do que pode ter agora — mais amor, mais beleza, mais conforto. A insatisfação pode motivar mudanças positivas, mas cuidado com compras impulsivas ou com a idealização de pessoas e situações.',
      opposition: 'O que deseja afetivamente pode parecer inalcançável ou vir com um preço alto. Há tensão entre prazer imediato e consequências futuras. Relacionamentos podem ser testados pela diferença de valores ou expectativas. Busque o equilíbrio entre indulgência e responsabilidade.',
      sextile: 'Oportunidades sociais e afetivas discretas mas valiosas. Um convite inesperado, um presente sutil ou uma conversa agradável podem abrir portas. Bom dia para networking, encontros informais e para demonstrar apreço por quem valoriza.',
    },
    mars: {
      conjunction: 'Energia expansiva e confiança para agir em grande escala. Você se sente capaz de conquistar qualquer objetivo — e provavelmente tem razão, se direcionar essa força adequadamente. Excelente para iniciar projetos ambiciosos, competições e empreendimentos que exigem coragem. O risco é a imprudência por excesso de confiança.',
      trine: 'Ação bem-sucedida e entusiasmo natural. Tudo que empreender hoje tende a fluir com facilidade. Esportes, exercícios e atividades ao ar livre são especialmente favorecidos. Sua energia positiva é contagiante e atrai colaboradores. Timing perfeito para iniciativas.',
      square: 'Excesso de confiança pode levar a ações imprudentes. Você se sente invencível, mas o mundo tem suas próprias regras. Cuidado com riscos desnecessários, confrontos por ego ou projetos megalomaníacos. Dose o entusiasmo com realismo.',
      opposition: 'Conflito entre agir e esperar o momento certo. Outros podem parecer obstáculos ao seu entusiasmo. Há tensão entre sua vontade de expandir e forças externas que pedem cautela. Não force passagens — o timing certo faz toda a diferença.',
      sextile: 'Oportunidades para ação positiva e produtiva. Energia disponível para projetos que combinam ambição com viabilidade. Bom dia para exercícios, competições amigáveis e para dar passos concretos em direção a objetivos maiores.',
    },
  },
  saturn: {
    sun: {
      conjunction: 'Este é um período de seriedade e responsabilidade máxima. Você sente o peso das obrigações e pode parecer que a vida exige mais do que o habitual. As autoridades ou figuras paternas ganham destaque. Não é momento de expansão, mas de consolidação — o que você construir agora terá bases sólidas. Aceite o ritmo mais lento e use-o para amadurecer estruturas importantes da sua vida.',
      square: 'Você sente pressão vinda de várias direções — do trabalho, de responsabilidades ou de figuras de autoridade. Há uma sensação de que seus esforços não são reconhecidos ou de que os obstáculos são maiores que o normal. Este não é o momento de forçar resultados, mas de reavaliar se a direção que tomou ainda faz sentido. A paciência é sua maior aliada agora.',
      trine: 'Sua disciplina e maturidade estão sendo recompensadas. Este é um período em que o trabalho consistente produz resultados tangíveis. Você se sente centrado, capaz de assumir responsabilidades sem se sentir sobrecarregado. Bom momento para decisões de longo prazo, planejamento financeiro e compromissos sérios que exigem estabilidade.',
      opposition: 'Confrontos com autoridades, chefes ou com as próprias limitações são prováveis. Você pode sentir que o mundo externo impõe restrições injustas à sua liberdade. Este trânsito pede que avalie honestamente: as estruturas da sua vida ainda servem ao seu propósito? O que precisa ser reestruturado? Evite decisões impulsivas — reflita antes de agir.',
      sextile: 'Oportunidades práticas se apresentam para quem está disposto a trabalhar com método. Você encontra formas produtivas de canalizar responsabilidades, transformando obrigações em conquistas graduais. Bom momento para organizar finanças, buscar mentoria ou dar passos concretos em projetos de longo prazo.',
    },
    moon: {
      conjunction: 'Suas emoções estão mais contidas e sóbrias hoje. Pode haver uma sensação de solidão ou de peso emocional, como se as responsabilidades da vida suprimissem sua espontaneidade. Relacionamentos com mulheres ou figuras maternas podem exigir mais maturidade. Não reprima o que sente — apenas reconheça que nem todo sentimento precisa de ação imediata.',
      square: 'Tensão entre suas necessidades emocionais e as exigências da realidade. Você pode sentir-se emocionalmente insatisfeito, como se o dever estivesse em conflito com o que seu coração deseja. Evite tomar decisões emocionais importantes hoje — a percepção está temporariamente distorcida pela pressão. Cuide-se com gentileza.',
      trine: 'Maturidade emocional em evidência. Você consegue lidar com sentimentos difíceis sem ser dominado por eles. Este é um bom dia para conversas sérias sobre relacionamentos, para estabelecer limites saudáveis ou para cuidar de assuntos domésticos que exigem organização e responsabilidade.',
      opposition: 'Conflito entre o que você sente e o que a situação exige. Pode haver tensão com a família ou com pessoas próximas sobre questões de responsabilidade e cuidado. A sensação de não ser compreendido é passageira — evite se isolar. Busque equilíbrio entre suas necessidades e as dos outros.',
      sextile: 'Capacidade de estruturar sua vida emocional de forma construtiva. Bom momento para organizar a casa, resolver pendências familiares ou ter conversas maduras sobre sentimentos. Sua estabilidade emocional inspira confiança nos outros.',
    },
    mercury: {
      conjunction: 'Seu pensamento está mais sério, estruturado e cauteloso hoje. Você tende a ver as coisas pelo lado mais realista — o que pode ser útil para planejamento, mas pode também gerar pessimismo se não for equilibrado. Não é o melhor dia para brainstorming criativo, mas é excelente para análises detalhadas, contratos e decisões que exigem rigor lógico. Comunicações com autoridades são favorecidas se você for claro e objetivo.',
      square: 'Dificuldades de comunicação são prováveis — você pode sentir que não consegue expressar suas ideias de forma adequada ou que os outros não compreendem seu ponto de vista. Pensamentos negativos ou autocríticos podem dominar. Evite assinar documentos importantes ou tomar decisões definitivas. Use o dia para revisar e refletir, não para concluir.',
      trine: 'Pensamento claro, metódico e produtivo. Excelente dia para trabalho intelectual que exige concentração, para estudos aprofundados ou para planejar estratégias de longo prazo. Suas palavras carregam autoridade e credibilidade. Bom para apresentações, negociações e comunicações formais.',
      opposition: 'Você pode sentir que suas ideias são bloqueadas ou criticadas por outros. Há tensão entre o que pensa e o que o ambiente permite expressar. Cuidado com comunicações rígidas ou excessivamente pessimistas. Este trânsito pede flexibilidade mental — nem tudo precisa ser perfeito para ser válido.',
      sextile: 'Oportunidade para organizar pensamentos e comunicar ideias de forma estruturada. Bom para estudos que exigem disciplina, para escrever relatórios ou para conversas com mentores e superiores. Seu raciocínio está pragmático e eficiente.',
    },
    venus: {
      conjunction: 'Período de seriedade nos relacionamentos. Você avalia seus vínculos com mais realismo — o que pode trazer desencanto temporário mas também clareza sobre o que realmente funciona. Questões financeiras pedem atenção e contenção. Não é o melhor dia para gastos supérfluos ou para iniciar romances, mas é excelente para solidificar compromissos que já provaram seu valor.',
      square: 'Insatisfação afetiva ou financeira em destaque. Você pode sentir que não recebe o amor ou o reconhecimento que merece, ou que o dinheiro não é suficiente para suas necessidades. Evite compras impulsivas motivadas por carência emocional. Este trânsito pede que reavalie o que realmente valoriza — e se está investindo energia nos lugares certos.',
      trine: 'Estabilidade nos relacionamentos e nas finanças. Você atrai respeito e confiança nas relações — é um bom dia para compromissos sérios, investimentos conservadores ou para demonstrar lealdade a quem importa. O amor maduro e paciente é favorecido.',
      opposition: 'Tensão entre desejo de prazer e exigências da realidade. Um relacionamento pode parecer restritivo ou insuficiente. Antes de culpar o outro, examine se suas expectativas são realistas. Este trânsito não destrói o amor — ele testa sua solidez. O que sobrevive a Saturno se torna mais forte.',
      sextile: 'Oportunidade para construir vínculos baseados em respeito mútuo e valores compartilhados. Bom dia para planejar finanças a dois, fazer investimentos conservadores ou demonstrar comprometimento em relações que importam. A beleza da estabilidade se revela.',
    },
    mars: {
      conjunction: 'Sua energia encontra resistência significativa. Pode parecer que tudo que tenta fazer encontra um obstáculo ou demora mais do que esperava. Frustração é natural, mas não ceda à impaciência — a força bruta não resolve o que exige estratégia. Use este período para desenvolver disciplina na ação, canalizando energia em trabalho metódico em vez de explosões improdutivas.',
      square: 'Frustração intensa entre o que quer fazer e o que pode fazer. Bloqueios, atrasos e limitações testam sua paciência. Há risco de explosões de raiva ou de ações precipitadas motivadas pela frustração acumulada. Evite confrontos com autoridades. A melhor estratégia é canalizar a energia em exercício físico intenso ou trabalho manual.',
      trine: 'Energia disciplinada e extremamente produtiva. Você consegue trabalhar com foco e persistência sem se esgotar. Excelente para projetos que exigem esforço sustentado, treinos físicos estruturados ou qualquer atividade que combine força com método. Resultados concretos são prováveis.',
      opposition: 'Conflito com autoridades ou com limitações externas que bloqueiam sua ação. Você pode sentir raiva de situações que parecem injustas ou restritivas. Cuidado com reações agressivas — elas podem ter consequências duradouras. Escolha suas batalhas com sabedoria e prefira a resistência estratégica à confrontação direta.',
      sextile: 'Determinação focada e produtiva. Bom dia para trabalhos que exigem esforço físico disciplinado, para resolver problemas práticos com persistência ou para assumir responsabilidades que outros evitam. Sua capacidade de trabalho impressiona.',
    },
  },
};

function getInterpretation(transit: string, natal: string, aspect: AspectType, house: number): string {
  const text = TRANSIT_TEXTS[transit]?.[natal]?.[aspect];
  if (text) return text;

  // Generic fallback
  const PLANET_NAMES: Record<string, string> = {
    sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
    jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  };
  const ASP_NAMES: Record<string, string> = {
    conjunction: 'conjunção', sextile: 'sextil', square: 'quadratura', trine: 'trígono', opposition: 'oposição',
  };
  return `${PLANET_NAMES[transit] || transit} em ${ASP_NAMES[aspect]} com seu ${PLANET_NAMES[natal] || natal} natal na Casa ${house}.`;
}

// ============================================================
// HELPERS
// ============================================================

function getIntensity(transit: string, natal: string, aspect: AspectType, orb: number): 'high' | 'medium' | 'low' {
  // Outer planets to personal = high; personal to personal = medium; moon = low
  const outerPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const personalPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars'];

  if (outerPlanets.includes(transit) && personalPlanets.includes(natal)) return 'high';
  if (transit === 'moon') return 'low';
  if (orb < 1) return 'high';
  if (orb < 3) return 'medium';
  return 'low';
}

function getCategory(transit: string, natal: string): DailyTransit['category'] {
  if (['venus'].includes(transit) || ['venus'].includes(natal)) return 'love';
  if (['saturn', 'jupiter'].includes(transit) && ['sun', 'saturn', 'jupiter'].includes(natal)) return 'career';
  if (['mars'].includes(transit) && ['mars'].includes(natal)) return 'health';
  return 'general';
}

function getTransitHouse(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    const start = cusps[i];
    const end = cusps[next];
    if (start < end) {
      if (longitude >= start && longitude < end) return i + 1;
    } else {
      if (longitude >= start || longitude < end) return i + 1;
    }
  }
  return 1;
}

// ============================================================
// SUMMARY GENERATORS
// ============================================================

function generateSummary(transits: DailyTransit[], positions: Positions): string {
  if (transits.length === 0) return 'Dia tranquilo sem trânsitos significativos. Aproveite para descansar e refletir.';

  const high = transits.filter(t => t.intensity === 'high');
  const medium = transits.filter(t => t.intensity === 'medium');

  // Pick the strongest transit with a rich text (not fallback)
  const best = high.find(t => t.interpretation.length > 80) || medium.find(t => t.interpretation.length > 80) || high[0] || medium[0] || transits[0];

  if (high.length > 3) {
    return `Dia intenso com ${high.length} trânsitos poderosos ativos simultaneamente. ${best.interpretation}`;
  }

  return best.interpretation;
}

function generateLoveSummary(transits: DailyTransit[], positions: Positions, natal: NatalChart): string {
  if (transits.length === 0) {
    const moonSign = getSignIndex(positions.moon?.longitude || 0);
    const MOON_LOVE = ['Impulso romântico e paixão rápida.', 'Sensualidade e desejo de conforto a dois.', 'Flerte intelectual e conversas sedutoras.', 'Necessidade de afeto e segurança no amor.', 'Romance dramático e expressão generosa.', 'Amor demonstrado em atos práticos.', 'Busca de harmonia e companhia.', 'Desejo intenso e possessivo.', 'Atração por novidade e aventura.', 'Amor maduro e compromisso.', 'Liberdade no amor e conexões inusitadas.', 'Romantismo e idealização.'];
    return MOON_LOVE[moonSign];
  }
  return transits.map(t => t.interpretation).join(' ');
}

function generateCareerSummary(transits: DailyTransit[], positions: Positions, natal: NatalChart): string {
  if (transits.length === 0) return 'Dia normal no trabalho. Mantenha o foco nas tarefas cotidianas.';
  return transits.map(t => t.interpretation).join(' ');
}

function generateHealthSummary(transits: DailyTransit[], positions: Positions): string {
  const marsTransits = transits.filter(t => t.transitPlanet === 'mars' || t.natalPlanet === 'mars');
  if (marsTransits.some(t => t.aspectType === 'square' || t.aspectType === 'opposition')) {
    return 'Energia alta mas tendência a excesso. Exercite-se mas evite esforço exagerado.';
  }
  if (marsTransits.some(t => t.aspectType === 'trine' || t.aspectType === 'sextile')) {
    return 'Vitalidade em alta. Excelente para atividades físicas e desporto.';
  }
  return 'Energia estável. Mantenha hábitos saudáveis e respeite seu ritmo.';
}
