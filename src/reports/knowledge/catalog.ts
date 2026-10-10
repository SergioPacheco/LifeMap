// ============================================================
// CATALOG.TS — Curated, versioned knowledge base (4A)
//
// Consolidates the existing interpretation repository (single source of
// truth stays in src/engine/*) under stable IDs, plus curated pools the
// assembler needs: recommendations, reflections and integration rules.
// PT is the only narrated locale in 4A; any other locale fails LOUDLY
// (LOCALE_UNSUPPORTED) instead of mixing languages silently.
// ============================================================

import type { Locale } from '../../i18n/index.js';
import type { Theme } from '../../engine/calendar/types.js';
import { PLANET_ASPECTS } from '../../engine/aspect-interpretations.js';
import type { AspectType } from '../../engine/types.js';
import {
  JUPITER_IN_HOUSE,
  JUPITER_IN_SIGN,
  NEPTUNE_IN_HOUSE,
  PLUTO_IN_HOUSE,
  SATURN_IN_HOUSE,
  SATURN_IN_SIGN,
  URANUS_IN_HOUSE,
} from '../../engine/outer-planets.js';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../../engine/chiron.js';
import {
  MARS_SIGN_FLAVOR,
  MERCURY_SIGN_FLAVOR,
  MOON_SIGN_FLAVOR,
  SUN_SIGN_FLAVOR,
  VENUS_SIGN_FLAVOR,
  ASCENDANT_TEXT,
} from '../../engine/interpret.js';
import {
  MARS_IN_HOUSE,
  NORTH_NODE_HOUSE,
  NORTH_NODE_IN_SIGN,
  VENUS_IN_HOUSE,
} from '../../engine/interpretations/classic-houses.js';
import { getInterpretations } from '../../engine/interpretations/index.js';

export const KNOWLEDGE_VERSION = 'k1';

export const CATALOG_SOURCES = [
  'src/engine/aspect-interpretations.ts (46 pairs × conjunction/soft/hard)',
  'src/engine/interpretations/pt.ts + pt-mercury.ts (Sun/Moon/Mercury houses)',
  'src/engine/interpretations/classic-houses.ts (Venus/Mars/Nodes)',
  'src/engine/outer-planets.ts (Jupiter–Pluto houses, Jupiter/Saturn signs)',
  'src/engine/chiron.ts (sweph-grade paths only)',
  'src/engine/interpret.ts (sign flavors)',
  'curated pools in this file (recommendations, reflections, integrations)',
] as const;

export type KnowledgeKind =
  | 'planet-house'
  | 'planet-sign'
  | 'aspect'
  | 'angle'
  | 'theme-synthesis'
  | 'recommendation'
  | 'reflection'
  | 'integration';

export interface KnowledgeText {
  title: string;
  texts: string[];
}

export interface KnowledgeEntry {
  id: string;
  kind: KnowledgeKind;
  version: string;
  themes: Theme[];
  match: {
    planet?: string;
    sign?: number;
    house?: number;
    pair?: string;
    register?: 'conjunction' | 'soft' | 'hard';
    theme?: Theme;
    rule?: string;
  };
  pt: KnowledgeText;
}

export type AspectRegister = 'conjunction' | 'soft' | 'hard';

export function aspectRegisterOf(type: AspectType): AspectRegister {
  if (type === 'conjunction') return 'conjunction';
  return type === 'sextile' || type === 'trine' ? 'soft' : 'hard';
}

/** Both key orders resolve: the file is not strictly alphabetical. */
export function aspectPairKey(planetA: string, planetB: string): string | null {
  const direct = `${planetA}-${planetB}`;
  const swapped = `${planetB}-${planetA}`;
  if (direct in PLANET_ASPECTS) return direct;
  if (swapped in PLANET_ASPECTS) return swapped;
  return null;
}

const PLANET_THEMES: Record<string, Theme[]> = {
  sun: ['career', 'creativity'],
  moon: ['family', 'health'],
  mercury: ['communication'],
  venus: ['love', 'finances', 'creativity'],
  mars: ['health', 'sexuality', 'career'],
  jupiter: ['finances', 'travel', 'spirituality'],
  saturn: ['career', 'health'],
  uranus: ['freedom', 'communication'],
  neptune: ['spirituality', 'creativity'],
  pluto: ['transformation', 'sexuality'],
  chiron: ['health', 'spirituality'],
  northNode: ['spirituality', 'career'],
  southNode: ['family', 'spirituality'],
  lilith: ['sexuality', 'transformation'],
};

const PLANET_PT: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno',
  pluto: 'Plutão', chiron: 'Quíron', northNode: 'Nodo Norte', southNode: 'Nodo Sul',
  lilith: 'Lilith',
};

const HOUSES: Record<string, string[]> = (() => {
  const pt = getInterpretations('pt');
  return {
    sun: pt.SUN_IN_HOUSE,
    moon: pt.MOON_IN_HOUSE,
    mercury: pt.MERCURY_IN_HOUSE,
    venus: VENUS_IN_HOUSE,
    mars: MARS_IN_HOUSE,
    jupiter: JUPITER_IN_HOUSE,
    saturn: SATURN_IN_HOUSE,
    uranus: URANUS_IN_HOUSE,
    neptune: NEPTUNE_IN_HOUSE,
    pluto: PLUTO_IN_HOUSE,
    chiron: CHIRON_IN_HOUSE,
    northNode: NORTH_NODE_HOUSE,
  };
})();

const SIGNS: Record<string, string[]> = {
  sun: SUN_SIGN_FLAVOR,
  moon: MOON_SIGN_FLAVOR,
  mercury: MERCURY_SIGN_FLAVOR,
  venus: VENUS_SIGN_FLAVOR,
  mars: MARS_SIGN_FLAVOR,
  jupiter: JUPITER_IN_SIGN,
  saturn: SATURN_IN_SIGN,
  northNode: NORTH_NODE_IN_SIGN,
  chiron: CHIRON_IN_SIGN,
};

function buildCatalog(): KnowledgeEntry[] {
  const entries: KnowledgeEntry[] = [];

  for (const [planet, houses] of Object.entries(HOUSES)) {
    houses.forEach((text, index) => {
      entries.push({
        id: `ph-${planet}-${index + 1}`,
        kind: 'planet-house',
        version: KNOWLEDGE_VERSION,
        themes: PLANET_THEMES[planet] ?? [],
        match: { planet, house: index + 1 },
        pt: { title: `${PLANET_PT[planet] ?? planet} na Casa ${index + 1}`, texts: [text] },
      });
    });
  }

  for (const [planet, signs] of Object.entries(SIGNS)) {
    signs.forEach((text, index) => {
      entries.push({
        id: `ps-${planet}-${index}`,
        kind: 'planet-sign',
        version: KNOWLEDGE_VERSION,
        themes: PLANET_THEMES[planet] ?? [],
        match: { planet, sign: index },
        pt: { title: `${PLANET_PT[planet] ?? planet} em ${SIGN_PT[index]}`, texts: [text] },
      });
    });
  }

  for (const [pair, registers] of Object.entries(PLANET_ASPECTS)) {
    (Object.keys(registers) as AspectRegister[]).forEach((register) => {
      entries.push({
        id: `asp-${pair}-${register}`,
        kind: 'aspect',
        version: KNOWLEDGE_VERSION,
        themes: [],
        match: { pair, register },
        pt: { title: `${pair} (${register})`, texts: [registers[register]] },
      });
    });
  }

  ASCENDANT_TEXT.forEach((text, index) => {
    entries.push({
      id: `ang-asc-${index}`,
      kind: 'angle',
      version: KNOWLEDGE_VERSION,
      themes: ['health', 'love'],
      match: { planet: 'asc', sign: index },
      pt: { title: `Ascendente em ${SIGN_PT[index]}`, texts: [text] },
    });
  });

  for (const pool of [...THEME_FRAMING, ...RECOMMENDATIONS, ...REFLECTIONS, ...INTEGRATIONS]) {
    entries.push({ ...pool, version: KNOWLEDGE_VERSION });
  }

  return entries;
}

const SIGN_PT = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];

let cached: KnowledgeEntry[] | null = null;

export function getCatalog(): KnowledgeEntry[] {
  if (!cached) cached = buildCatalog();
  return cached;
}

export function getEntryText(entry: KnowledgeEntry, locale: Locale): KnowledgeText {
  if (locale !== 'pt') {
    throw new Error(
      `LOCALE_UNSUPPORTED: knowledge entry ${entry.id} is narrated in pt only in ${KNOWLEDGE_VERSION}; refusing silent fallback.`
    );
  }
  return entry.pt;
}

// ============================================================
// CURATED POOLS — recommendations, reflections, integrations
// Each item is used at most once per document (assembler tracks).
// ============================================================

type PoolEntry = Omit<KnowledgeEntry, 'version'>;

const rec = (theme: Theme, n: number, title: string, texts: string[]): PoolEntry => ({
  id: `rec-${theme}-${n}`,
  kind: 'recommendation',
  themes: [theme],
  match: { theme },
  pt: { title, texts },
});

const ref = (theme: Theme, n: number, title: string, texts: string[]): PoolEntry => ({
  id: `ref-${theme}-${n}`,
  kind: 'reflection',
  themes: [theme],
  match: { theme },
  pt: { title, texts },
});

const RECOMMENDATIONS: PoolEntry[] = [
  rec('love', 1, 'Prática afetiva', ['Escolha uma relação importante e nomeie, em voz alta, uma necessidade sua que você costuma adiar. Pedidos claros previnem ressentimentos silenciosos.']),
  rec('love', 2, 'Revisão de padrões', ['Liste seus últimos três vínculos marcantes e procure o ponto em comum que se repete. O que se repete é o convite de crescimento do seu mapa.']),
  rec('love', 3, 'Presença cotidiana', ['Reserve um momento semanal sem telas para estar com quem você ama. Vínculos se nutrem de atenção regular, não de gestos grandiosos esporádicos.']),
  rec('career', 1, 'Foco trimestral', ['Defina uma única meta profissional para os próximos 90 dias e elimine um compromisso que compete com ela. Avanço visível nasce de renúncia escolhida.']),
  rec('career', 2, 'Inventário de forças', ['Peça a duas pessoas de confiança que nomeiem sua maior força de trabalho. Use essas respostas para posicionar seu próximo passo, não seu currículo.']),
  rec('career', 3, 'Autoridade gradual', ['Assuma uma responsabilidade um pouco maior do que a confortável e documente o aprendizado. Reputação se constrói em ciclos de entrega, não em saltos.']),
  rec('finances', 1, 'Mapa do dinheiro', ['Registre cada gasto por 30 dias sem julgamento. Clareza precede controle; a maioria dos vazamentos financeiros é invisível até ser medida.']),
  rec('finances', 2, 'Reserva primeiro', ['Automatize uma transferência para reserva no dia em que o dinheiro entra. Pagar-se primeiro transforma disciplina em arquitetura.']),
  rec('finances', 3, 'Valor e preço', ['Antes de uma compra relevante, pergunte o que ela expressa sobre seus valores. Compras alinhadas a valores raramente geram arrependimento.']),
  rec('health', 1, 'Ritmo corporal', ['Observe por uma semana seus picos de energia e anote os horários. Organize as tarefas exigentes nos seus picos, não contra eles.']),
  rec('health', 2, 'Descanso ativo', ['Agende pausas reais como compromissos inegociáveis. Recuperação não é prêmio por exaustão; é parte do treino.']),
  rec('health', 3, 'Sinal do corpo', ['Escolha um sintoma recorrente e investigue o contexto emocional das crises. O corpo costuma relatar primeiro o que a mente adia.']),
  rec('spirituality', 1, 'Silêncio diário', ['Pratique dez minutos de silêncio pela manhã antes de qualquer tela. A intuição precisa de um canal sem ruído para ser ouvida.']),
  rec('spirituality', 2, 'Rito de passagem', ['Marque transições importantes com um gesto simbólico deliberado. Rituais convertem mudança em significado.']),
  rec('spirituality', 3, 'Estudo continuado', ['Escolha uma tradição ou texto e estude um trecho por semana com caderno. Profundidade espiritual é cumulativa, não instantânea.']),
  rec('family', 1, 'Conversa de origem', ['Pergunte a um familiar mais velho sobre um episódio marcante da juventude dele. Histórias de origem reorganizam o lugar que você ocupa.']),
  rec('family', 2, 'Limite saudável', ['Defina um limite claro numa relação familiar tensa e comunique-o uma vez, com calma. Limites mantidos com consistência viram respeito.']),
  rec('family', 3, 'Cuidado com o lar', ['Dedique um dia para ordenar um cômodo que afeta seu humor. O espaço físico externo regula o estado interno.']),
  rec('creativity', 1, 'Hora criativa', ['Bloqueie uma hora semanal para criar sem objetivo comercial. A criatividade precisa de um território livre de cobrança para florescer.']),
  rec('creativity', 2, 'Caderno de ideias', ['Anote toda ideia antes de julgá-la, por 30 dias. Julgamento precoce é o assassino mais comum da originalidade.']),
  rec('creativity', 3, 'Obra pequena', ['Conclua algo pequeno e publique ou mostre a alguém. Ciclos curtos de conclusão treinam o músculo de terminar.']),
  rec('communication', 1, 'Escuta ativa', ['Na próxima conversa difícil, repita com suas palavras o que ouviu antes de responder. Ser compreendido começa por compreender.']),
  rec('communication', 2, 'Escrita clara', ['Escreva diariamente três parágrafos sobre qualquer tema. Clareza de pensamento é consequência de clareza de escrita.']),
  rec('communication', 3, 'Pausa antes', ['Antes de mensagens reativas, aguarde uma hora. A maioria dos conflitos digitais nasce de velocidade, não de conteúdo.']),
  rec('transformation', 1, 'Inventário de sombra', ['Nomeie um padrão seu que você critica nos outros. A projeção é o mapa mais honesto dos cantos não visitados.']),
  rec('transformation', 2, 'Desapego programado', ['Escolha algo a encerrar neste mês — hábito, objeto, vínculo morno. Transformação exige espaço vazio para o novo.']),
  rec('transformation', 3, 'Crise como dado', ['Na próxima dificuldade, pergunte o que ela está tentando aposentar em você. Crises bem lidas viram currículo de maturidade.']),
  rec('freedom', 1, 'Auditoria de amarras', ['Liste compromissos que você manteria por medo, não por escolha. Liberdade começa pelo inventário honesto das prisões voluntárias.']),
  rec('freedom', 2, 'Experimento novo', ['Faça algo pequeno fora da rotina toda semana. A liberdade é um músculo que atrofia sem uso deliberado.']),
  rec('freedom', 3, 'Não estratégico', ['Pratique dizer não a um bom convite por mês para proteger um sim maior. Liberdade é, na prática, uma agenda defendida.']),
  rec('travel', 1, 'Viagem de estudo', ['Planeje uma viagem com um tema de aprendizado explícito. Deslocamento com propósito rende mais que turismo por inércia.']),
  rec('travel', 2, 'Exploração local', ['Visite mensalmente um lugar desconhecido na sua própria cidade. O olhar de viajante treina-se perto antes de longe.']),
  rec('travel', 3, 'Diário de bordo', ['Registre impressões de cada deslocamento relevante. Viajar sem registrar é assistir sem reter.']),
  rec('sexuality', 1, 'Diálogo de desejo', ['Converse com a parceria sobre um desejo nunca verbalizado. Intimidade aprofunda-se na coragem de nomear.']),
  rec('sexuality', 2, 'Energia criativa', ['Canalize conscientemente energia vital para um projeto criativo por um ciclo. Desejo e criação nascem da mesma fonte.']),
  rec('sexuality', 3, 'Presença corporal', ['Pratique atenção plena ao corpo diariamente por dez minutos. Presença corporal é a base de qualquer intimidade real.']),
  rec('love', 4, 'Reparo rápido', ['Quando ferir alguém importante, repare em até 24 horas com um gesto concreto. Reparos rápidos impedem que mágoas pequenas virem muros.']),
  rec('career', 4, 'Mentor e aprendiz', ['Seja mentor de alguém iniciante e aprendiz de alguém avançado ao mesmo tempo. Ensinar organiza o que você sabe; aprender mantém o crescimento.']),
  rec('finances', 4, 'Receita paralela', ['Dedique duas horas semanais a construir uma fonte de receita independente do emprego principal. Autonomia financeira se constrói em fatias de tempo.']),
  rec('health', 4, 'Exame em dia', ['Agende os exames preventivos do ano de uma vez e trate como compromisso inegociável. Prevenção é a forma mais barata de tratamento.']),
  rec('spirituality', 4, 'Natureza regular', ['Passe tempo na natureza semanalmente sem agenda nem fones. O contato regular com o vivo recalibra o que a cidade entorta.']),
  rec('family', 4, 'Ritual familiar', ['Crie um ritual simples e repetível com quem você ama — uma refeição, um passeio, uma data. Pertencimento se constrói de repetição com sentido.']),
  rec('creativity', 4, 'Referência nova', ['Estude mensalmente um criador fora da sua área. Referências cruzadas são a matéria-prima da originalidade.']),
  rec('communication', 4, 'Feedback pedido', ['Peça feedback específico sobre sua comunicação a alguém de confiança. Pontos cegos de comunicação só aparecem no espelho alheio.']),
  rec('transformation', 4, 'Terapia ou processo', ['Mantenha um processo de autoconhecimento com acompanhamento — terapia, análise, mentoria. Transformação profunda pede testemunha qualificada.']),
  rec('freedom', 4, 'Viagem solo', ['Viaje sozinho ao menos uma vez. Decidir tudo por conta própria revela o quanto da sua rotina é escolha e quanto é inércia.']),
  rec('travel', 4, 'Idioma novo', ['Aprenda o básico do idioma de um lugar que deseja visitar. Cada palavra nova é uma janela que se abre antes da viagem.']),
  rec('sexuality', 4, 'Vulnerabilidade gradual', ['Compartilhe algo íntimo em doses pequenas e observe a resposta antes de aprofundar. Confiança se constrói em camadas, não em saltos.']),
];

const REFLECTIONS: PoolEntry[] = [
  ref('love', 1, 'Pergunta afetiva', ['O que você tolera em nome do amor que não toleraria em nome da amizade?']),
  ref('love', 2, 'Pergunta de vínculo', ['Quem você seria nos seus relacionamentos se não precisasse ser amado de volta?']),
  ref('love', 3, 'Pergunta de entrega', ['Onde o medo de perder fala mais alto que o desejo de estar junto?']),
  ref('career', 1, 'Pergunta de vocação', ['Que trabalho você faria mesmo se ninguém aplaudisse?']),
  ref('career', 2, 'Pergunta de legado', ['O que você quer que digam do seu trabalho daqui a dez anos?']),
  ref('career', 3, 'Pergunta de coragem', ['Qual passo profissional você adia por medo de parecer iniciante?']),
  ref('finances', 1, 'Pergunta de valor', ['O que seu extrato dos últimos meses diz sobre o que você realmente valoriza?']),
  ref('finances', 2, 'Pergunta de segurança', ['Quanta segurança é suficiente antes de você se permitir arriscar?']),
  ref('finances', 3, 'Pergunta de merecimento', ['Onde você se sabota financeiramente por achar que não merece mais?']),
  ref('health', 1, 'Pergunta corporal', ['O que seu corpo tenta dizer quando você o ignora por uma semana?']),
  ref('health', 2, 'Pergunta de ritmo', ['Sua rotina atual sustenta a pessoa que você quer ser aos sessenta?']),
  ref('health', 3, 'Pergunta de cuidado', ['Quem cuida de você quando você só cuida dos outros?']),
  ref('spirituality', 1, 'Pergunta de sentido', ['O que permanece verdadeiro para você nos dias em que nada faz sentido?']),
  ref('spirituality', 2, 'Pergunta de fé', ['Em que você confia quando não há evidências?']),
  ref('spirituality', 3, 'Pergunta de presença', ['Quanto do seu dia é vivido, e quanto é apenas atravessado?']),
  ref('family', 1, 'Pergunta de origem', ['Que padrão familiar você jurou não repetir — e onde ele já apareceu?']),
  ref('family', 2, 'Pergunta de pertencimento', ['Onde você se sente em casa sendo exatamente quem é?']),
  ref('family', 3, 'Pergunta de herança', ['Que herança emocional você quer transmitir, diferente da que recebeu?']),
  ref('creativity', 1, 'Pergunta criativa', ['O que você criaria se o fracasso fosse impossível?']),
  ref('creativity', 2, 'Pergunta de expressão', ['Que parte sua nunca apareceu em nada que você fez?']),
  ref('creativity', 3, 'Pergunta de prazer', ['Quando foi a última vez que você fez algo só pelo prazer de fazer?']),
  ref('communication', 1, 'Pergunta de escuta', ['O que as pessoas repetem para você que você ainda não ouviu?']),
  ref('communication', 2, 'Pergunta de verdade', ['Que verdade sua está esperando palavras há mais de um ano?']),
  ref('communication', 3, 'Pergunta de silêncio', ['O que seu silêncio comunica quando você escolhe não falar?']),
  ref('transformation', 1, 'Pergunta de sombra', ['Que aspecto seu você defenderia nos outros e condena em si?']),
  ref('transformation', 2, 'Pergunta de fim', ['O que precisa morrer na sua vida para algo nascer?']),
  ref('transformation', 3, 'Pergunta de poder', ['Onde você entrega seu poder para não lidar com ele?']),
  ref('freedom', 1, 'Pergunta de prisão', ['Que liberdade você evita por medo do que faria com ela?']),
  ref('freedom', 2, 'Pergunta de rotina', ['Sua rotina atual é uma base ou uma cela?']),
  ref('freedom', 3, 'Pergunta de ruptura', ['O que mudaria se você tivesse metade das obrigações atuais?']),
  ref('travel', 1, 'Pergunta de horizonte', ['Que lugar — geográfico ou interior — você evita visitar?']),
  ref('travel', 2, 'Pergunta de estrangeiro', ['O que em você ainda é estrangeiro para você mesmo?']),
  ref('travel', 3, 'Pergunta de retorno', ['De que viagem interior você ainda não voltou?']),
  ref('sexuality', 1, 'Pergunta de desejo', ['O que você deseja e nunca contou a ninguém?']),
  ref('sexuality', 2, 'Pergunta de corpo', ['Seu corpo é moradia ou campo de batalha?']),
  ref('sexuality', 3, 'Pergunta de fusão', ['Onde termina você e começa o outro nos seus vínculos?']),
  ref('love', 4, 'Pergunta de cuidado', ['Você ama a pessoa real ou a pessoa que ela poderia ser?']),
  ref('career', 4, 'Pergunta de suficiente', ['Quanto basta para você considerar sua vida profissional bem-sucedida?']),
  ref('finances', 4, 'Pergunta de liberdade', ['Quanto dinheiro compra sua liberdade de dizer não?']),
  ref('health', 4, 'Pergunta de energia', ['O que mais drena sua energia que você finge não perceber?']),
  ref('spirituality', 4, 'Pergunta de mistério', ['Que mistério você aceita sem precisar resolver?']),
  ref('family', 4, 'Pergunta de perdão', ['Quem você ainda não perdoou — e o que isso custa por ano?']),
  ref('creativity', 4, 'Pergunta de obra', ['Que obra sua falta no mundo porque você não a fez?']),
  ref('communication', 4, 'Pergunta de coragem', ['Que conversa adiada mudaria sua vida se acontecesse amanhã?']),
  ref('transformation', 4, 'Pergunta de renascimento', ['Quem você está se tornando que assustaria quem você era?']),
  ref('freedom', 4, 'Pergunta de voo', ['Se nada te prendesse, onde você estaria daqui a um ano?']),
  ref('travel', 4, 'Pergunta de casa', ['O que você procura fora que ainda não encontrou dentro?']),
  ref('sexuality', 4, 'Pergunta de entrega', ['O que te impede de se entregar por inteiro?']),
];

const intEntry = (id: string, themes: Theme[], rule: string, title: string, texts: string[]): PoolEntry => ({
  id,
  kind: 'integration',
  themes,
  match: { rule },
  pt: { title, texts },
});

const themeEntry = (theme: Theme, title: string, texts: string[]): PoolEntry => ({
  id: `theme-${theme}`,
  kind: 'theme-synthesis',
  themes: [theme],
  match: { theme },
  pt: { title, texts },
});

const THEME_FRAMING: PoolEntry[] = [
  themeEntry('love', 'O amor no seu mapa',
    ['Os vínculos pedem tanto entrega quanto forma. Abaixo, os indicadores afetivos do seu mapa aparecem combinados — onde há tensão e onde há fluidez, e como cada posição conversa com as demais.']),
  themeEntry('career', 'Vocação e lugar no mundo',
    ['Carreira aqui não é cargo: é o ponto onde necessidade interna e contribuição externa se encontram. Os indicadores abaixo mostram estilo de trabalho, relação com autoridade e ritmo de construção.']),
  themeEntry('finances', 'Recursos e valores',
    ['Dinheiro no mapa natal fala menos de quantia e mais de relação: como você gera, retém e solta recursos. Os trechos abaixo combinam os indicadores materiais do seu mapa.']),
  themeEntry('health', 'Corpo e ritmo',
    ['O corpo registra antes o que a mente adia. Abaixo, os indicadores ligados a energia, tensão e recuperação, com práticas que respeitam o seu ritmo específico.']),
  themeEntry('spirituality', 'Direção e sentido',
    ['Para além dos eventos do cotidiano, o mapa aponta eixos de desenvolvimento. Os trechos abaixo organizam esses eixos em práticas e perguntas, não em promessas.']),
  themeEntry('family', 'Base e pertencimento',
    ['Ninguém se inventa sozinho: as primeiras marcas moldam necessidades adultas. Abaixo, os indicadores de base, cuidado e segurança emocional do seu mapa.']),
];

const INTEGRATIONS: PoolEntry[] = [
  intEntry('int-venus-saturn-jupiter', ['love', 'finances'], 'venus-saturn-hard+venus-jupiter-soft',
    'Amor entre contenção e expansão',
    ['{A} pede estrutura e prova ao longo do tempo, enquanto {B} promete leveza e abundância — e as duas forças atuam sobre os mesmos vínculos, ao mesmo tempo. O desafio não é escolher entre segurança e prazer, mas sequenciá-los: primeiro o alicerce, depois a festa.']),
  intEntry('int-sun-moon-hard', ['family', 'creativity'], 'sun-moon-hard',
    'Vontade e necessidade',
    ['{A} aponta para onde você quer chegar e {B} revela do que você precisa para aguentar a viagem — quando os dois discordam, a vida parece exigir que você escolha entre ambição e bem-estar, ao mesmo tempo. A saída é negociar turnos: há fases para conquistar e fases para nutrir, e confundi-las cobra preço dos dois lados.']),
  intEntry('int-saturn-jupiter', ['career', 'finances'], 'saturn-hard+jupiter-soft',
    'Freio e acelerador',
    ['{A} cobra método, prazo e responsabilidade, enquanto {B} abre portas, otimismo e margem para arriscar — estrutura e expansão operando ao mesmo tempo. O ponto de equilíbrio é crescer com lastro: cada aposta maior pede um alicerce proporcionalmente mais sólido.']),
  intEntry('int-mercury-mixed', ['communication', 'career'], 'mercury-hard+mercury-soft',
    'Mente em dois registros',
    ['{A} tensiona o pensamento crítico e {B} facilita a expressão — a mesma mente que desconfia é a que comunica bem, ao mesmo tempo. Use a desconfiança na apuração e a fluência na entrega: duvidar antes, explicar depois.']),
  intEntry('int-mars-venus-hard', ['love', 'sexuality'], 'mars-venus-hard',
    'Desejo e harmonia',
    ['{A} quer conquista e intensidade imediata, enquanto o vínculo pede tato e reciprocidade — impulso e diplomacia disputando o mesmo território, ao mesmo tempo. A faísca inicial precisa de tradução: transformar urgência em presença é o que separa paixão que consome de paixão que constrói.']),
  intEntry('int-moon-saturn-hard', ['family', 'health'], 'moon-saturn-hard',
    'Coração sob disciplina',
    ['{A} expõe carência e sensibilidade onde a vida ensinou contenção — sentir e dever aparecem ao mesmo tempo, e o dever costuma vencer. O trabalho é autorizar a necessidade sem abandonar a responsabilidade: cuidado programado também é cuidado legítimo.']),
];
