import type { Locale } from './index';
import { planets as ptPlanets } from '../content/pt/planets';
import { planets as enPlanets } from '../content/en/planets';
import { planets as esPlanets } from '../content/es/planets';
import { planets as frPlanets } from '../content/fr/planets';
import { planets as dePlanets } from '../content/de/planets';
import { planets as itPlanets } from '../content/it/planets';
import { planets as jaPlanets } from '../content/ja/planets';
import { planets as zhPlanets } from '../content/zh/planets';
import { planets as ruPlanets } from '../content/ru/planets';
import { planets as trPlanets } from '../content/tr/planets';
import { planets as nlPlanets } from '../content/nl/planets';

export const ASTROCLICK_PLANET_IDS = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter',
  'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'chiron',
] as const;

export type AstroClickPlanetId = typeof ASTROCLICK_PLANET_IDS[number];

type TwelveStrings = readonly [
  string, string, string, string, string, string,
  string, string, string, string, string, string,
];

interface AstroClickText {
  title: string;
  subtitle: string;
  clickToInterpret: string;
  inSign: string;
  house: string;
  selectProfile: string;
  clickForInterpretations: string;
  explore: string;
  selectedPlanet: string;
  none: string;
  reflect: string;
  themes: TwelveStrings;
  questions: TwelveStrings;
  extraMeanings: Record<'northNode' | 'chiron', string>;
}

const texts: Record<Locale, AstroClickText> = {
  pt: {
    title: 'AstroClick Portrait', subtitle: 'Explore seu mapa de forma interativa — clique em cada planeta para descobrir seu significado',
    clickToInterpret: 'Clique em qualquer planeta no mapa para ver sua interpretação', inSign: 'Em', house: 'Casa',
    selectProfile: 'Selecione um perfil para explorar o mapa interativo', clickForInterpretations: 'Clique nos planetas para ver interpretações',
    explore: 'Clique nos planetas para explorar', selectedPlanet: 'Planeta selecionado', none: 'nenhum', reflect: 'Pergunte-se',
    themes: ['Sua Essência', 'Suas Emoções', 'Sua Mente', 'Seu Amor', 'Sua Ação', 'Sua Expansão', 'Sua Disciplina', 'Sua Liberdade', 'Sua Espiritualidade', 'Sua Transformação', 'Seu Destino', 'Sua Cura'],
    questions: ['Onde preciso brilhar e ser reconhecido?', 'O que me faz sentir em casa?', 'Como funciona meu raciocínio?', 'O que eu realmente valorizo?', 'O que me motiva a agir?', 'Onde posso crescer e expandir?', 'O que preciso construir com disciplina?', 'Onde preciso ser original?', 'O que transcende o material em mim?', 'O que preciso transformar radicalmente?', 'Para onde devo caminhar?', 'Qual dor me tornou curador?'],
    extraMeanings: {
      northNode: 'O Nodo Norte aponta a direção da sua evolução nesta vida — o território desconhecido que traz crescimento. É o futuro.',
      chiron: 'Quíron é a ferida que não cicatriza completamente, mas se torna sua maior fonte de sabedoria e capacidade de curar outros.',
    },
  },
  en: {
    title: 'AstroClick Portrait', subtitle: 'Explore your chart interactively — click each planet to discover its meaning',
    clickToInterpret: 'Click any planet in the chart to see its interpretation', inSign: 'In', house: 'House',
    selectProfile: 'Select a profile to explore the interactive chart', clickForInterpretations: 'Click the planets to see interpretations',
    explore: 'Click the planets to explore', selectedPlanet: 'Selected planet', none: 'none', reflect: 'Ask yourself',
    themes: ['Your Essence', 'Your Emotions', 'Your Mind', 'Your Love', 'Your Action', 'Your Expansion', 'Your Discipline', 'Your Freedom', 'Your Spirituality', 'Your Transformation', 'Your Destiny', 'Your Healing'],
    questions: ['Where do I need to shine and be recognized?', 'What makes me feel at home?', 'How does my reasoning work?', 'What do I truly value?', 'What motivates me to act?', 'Where can I grow and expand?', 'What do I need to build with discipline?', 'Where do I need to be original?', 'What in me transcends the material?', 'What do I need to transform radically?', 'Which direction should I follow?', 'What pain made me a healer?'],
    extraMeanings: {
      northNode: 'The North Node points toward your evolution in this life — unfamiliar territory that brings growth. It represents the future.',
      chiron: 'Chiron is the wound that never heals completely, yet becomes your greatest source of wisdom and your ability to heal others.',
    },
  },
  es: {
    title: 'AstroClick Portrait', subtitle: 'Explora tu carta de forma interactiva — pulsa cada planeta para descubrir su significado',
    clickToInterpret: 'Pulsa cualquier planeta de la carta para ver su interpretación', inSign: 'En', house: 'Casa',
    selectProfile: 'Selecciona un perfil para explorar la carta interactiva', clickForInterpretations: 'Pulsa los planetas para ver sus interpretaciones',
    explore: 'Pulsa los planetas para explorar', selectedPlanet: 'Planeta seleccionado', none: 'ninguno', reflect: 'Pregúntate',
    themes: ['Tu Esencia', 'Tus Emociones', 'Tu Mente', 'Tu Amor', 'Tu Acción', 'Tu Expansión', 'Tu Disciplina', 'Tu Libertad', 'Tu Espiritualidad', 'Tu Transformación', 'Tu Destino', 'Tu Sanación'],
    questions: ['¿Dónde necesito brillar y ser reconocido?', '¿Qué me hace sentir en casa?', '¿Cómo funciona mi razonamiento?', '¿Qué valoro de verdad?', '¿Qué me motiva a actuar?', '¿Dónde puedo crecer y expandirme?', '¿Qué necesito construir con disciplina?', '¿Dónde necesito ser original?', '¿Qué hay en mí que trasciende lo material?', '¿Qué necesito transformar radicalmente?', '¿Hacia dónde debo caminar?', '¿Qué dolor me convirtió en sanador?'],
    extraMeanings: {
      northNode: 'El Nodo Norte señala la dirección de tu evolución en esta vida — el territorio desconocido que trae crecimiento. Representa el futuro.',
      chiron: 'Quirón es la herida que nunca sana por completo, pero que se convierte en tu mayor fuente de sabiduría y capacidad para sanar a otros.',
    },
  },
  fr: {
    title: 'AstroClick Portrait', subtitle: 'Explorez votre thème de façon interactive — cliquez sur chaque planète pour découvrir sa signification',
    clickToInterpret: 'Cliquez sur une planète du thème pour voir son interprétation', inSign: 'En', house: 'Maison',
    selectProfile: 'Sélectionnez un profil pour explorer le thème interactif', clickForInterpretations: 'Cliquez sur les planètes pour voir les interprétations',
    explore: 'Cliquez sur les planètes pour explorer', selectedPlanet: 'Planète sélectionnée', none: 'aucune', reflect: 'Demandez-vous',
    themes: ['Votre Essence', 'Vos Émotions', 'Votre Esprit', 'Votre Amour', 'Votre Action', 'Votre Expansion', 'Votre Discipline', 'Votre Liberté', 'Votre Spiritualité', 'Votre Transformation', 'Votre Destin', 'Votre Guérison'],
    questions: ['Où ai-je besoin de briller et d’être reconnu ?', 'Qu’est-ce qui me fait sentir chez moi ?', 'Comment fonctionne mon raisonnement ?', 'Qu’est-ce que je valorise vraiment ?', 'Qu’est-ce qui me pousse à agir ?', 'Où puis-je grandir et m’épanouir ?', 'Que dois-je construire avec discipline ?', 'Où ai-je besoin d’être original ?', 'Qu’est-ce qui, en moi, transcende la matière ?', 'Que dois-je transformer radicalement ?', 'Dans quelle direction dois-je avancer ?', 'Quelle douleur a fait de moi un guérisseur ?'],
    extraMeanings: {
      northNode: 'Le Nœud Nord indique la direction de votre évolution dans cette vie — le territoire inconnu qui favorise la croissance. Il représente l’avenir.',
      chiron: 'Chiron est la blessure qui ne guérit jamais complètement, mais qui devient votre plus grande source de sagesse et votre capacité à guérir les autres.',
    },
  },
  de: {
    title: 'AstroClick Portrait', subtitle: 'Erkunden Sie Ihr Horoskop interaktiv — klicken Sie auf jeden Planeten, um seine Bedeutung zu entdecken',
    clickToInterpret: 'Klicken Sie auf einen Planeten im Horoskop, um seine Deutung zu sehen', inSign: 'In', house: 'Haus',
    selectProfile: 'Wählen Sie ein Profil, um das interaktive Horoskop zu erkunden', clickForInterpretations: 'Klicken Sie auf die Planeten, um Deutungen zu sehen',
    explore: 'Klicken Sie zum Erkunden auf die Planeten', selectedPlanet: 'Ausgewählter Planet', none: 'keiner', reflect: 'Fragen Sie sich',
    themes: ['Ihr Wesen', 'Ihre Emotionen', 'Ihr Verstand', 'Ihre Liebe', 'Ihr Handeln', 'Ihre Entfaltung', 'Ihre Disziplin', 'Ihre Freiheit', 'Ihre Spiritualität', 'Ihre Transformation', 'Ihre Bestimmung', 'Ihre Heilung'],
    questions: ['Wo muss ich strahlen und anerkannt werden?', 'Was lässt mich zu Hause fühlen?', 'Wie funktioniert mein Denken?', 'Was schätze ich wirklich?', 'Was motiviert mich zum Handeln?', 'Wo kann ich wachsen und mich entfalten?', 'Was muss ich mit Disziplin aufbauen?', 'Wo muss ich originell sein?', 'Was in mir geht über das Materielle hinaus?', 'Was muss ich grundlegend verwandeln?', 'In welche Richtung soll ich gehen?', 'Welcher Schmerz machte mich zum Heiler?'],
    extraMeanings: {
      northNode: 'Der Nordknoten weist auf die Richtung Ihrer Entwicklung in diesem Leben — unbekanntes Terrain, das Wachstum bringt. Er steht für die Zukunft.',
      chiron: 'Chiron ist die Wunde, die nie vollständig heilt, aber zu Ihrer größten Quelle von Weisheit und Ihrer Fähigkeit wird, andere zu heilen.',
    },
  },
  it: {
    title: 'AstroClick Portrait', subtitle: 'Esplora il tuo tema in modo interattivo — fai clic su ogni pianeta per scoprirne il significato',
    clickToInterpret: 'Fai clic su un pianeta del tema per vedere la sua interpretazione', inSign: 'In', house: 'Casa',
    selectProfile: 'Seleziona un profilo per esplorare il tema interattivo', clickForInterpretations: 'Fai clic sui pianeti per vedere le interpretazioni',
    explore: 'Fai clic sui pianeti per esplorare', selectedPlanet: 'Pianeta selezionato', none: 'nessuno', reflect: 'Chiediti',
    themes: ['La tua Essenza', 'Le tue Emozioni', 'La tua Mente', 'Il tuo Amore', 'La tua Azione', 'La tua Espansione', 'La tua Disciplina', 'La tua Libertà', 'La tua Spiritualità', 'La tua Trasformazione', 'Il tuo Destino', 'La tua Guarigione'],
    questions: ['Dove ho bisogno di brillare ed essere riconosciuto?', 'Che cosa mi fa sentire a casa?', 'Come funziona il mio ragionamento?', 'Che cosa valorizzo davvero?', 'Che cosa mi motiva ad agire?', 'Dove posso crescere ed espandermi?', 'Che cosa devo costruire con disciplina?', 'Dove ho bisogno di essere originale?', 'Che cosa in me trascende la materia?', 'Che cosa devo trasformare radicalmente?', 'Verso quale direzione devo camminare?', 'Quale dolore mi ha reso capace di guarire?'],
    extraMeanings: {
      northNode: 'Il Nodo Nord indica la direzione della tua evoluzione in questa vita — il territorio sconosciuto che porta crescita. Rappresenta il futuro.',
      chiron: 'Chirone è la ferita che non guarisce mai del tutto, ma diventa la tua più grande fonte di saggezza e la capacità di guarire gli altri.',
    },
  },
  ja: {
    title: 'AstroClick Portrait', subtitle: '出生図をインタラクティブに探索 — 各天体をクリックして意味を確認できます',
    clickToInterpret: '出生図の天体をクリックすると解釈が表示されます', inSign: '星座', house: 'ハウス',
    selectProfile: 'プロフィールを選択してインタラクティブ出生図を探索', clickForInterpretations: '天体をクリックして解釈を表示',
    explore: '天体をクリックして探索', selectedPlanet: '選択中の天体', none: 'なし', reflect: '自分に問いかけてください',
    themes: ['あなたの本質', 'あなたの感情', 'あなたの思考', 'あなたの愛', 'あなたの行動', 'あなたの拡大', 'あなたの規律', 'あなたの自由', 'あなたの精神性', 'あなたの変容', 'あなたの運命', 'あなたの癒やし'],
    questions: ['どこで輝き、認められる必要がありますか？', '何が自分に安心できる居場所を感じさせますか？', '自分の思考はどのように働きますか？', '自分が本当に大切にしているものは何ですか？', '何が自分を行動へ動かしますか？', 'どこで成長し、可能性を広げられますか？', '何を規律をもって築く必要がありますか？', 'どこで独創性を発揮する必要がありますか？', '自分の中で物質を超えるものは何ですか？', '何を根本から変容させる必要がありますか？', 'どの方向へ進むべきですか？', 'どの痛みが自分を癒やす人にしましたか？'],
    extraMeanings: {
      northNode: 'ノースノードは、この人生での進化の方向を示します。成長をもたらす未知の領域であり、未来を表します。',
      chiron: 'キロンは完全には癒えない傷ですが、その傷が最大の知恵と、他者を癒やす力の源になります。',
    },
  },
  zh: {
    title: 'AstroClick Portrait', subtitle: '以互动方式探索你的星盘 — 点击每颗行星查看其含义',
    clickToInterpret: '点击星盘中的任意行星查看解读', inSign: '位于', house: '宫',
    selectProfile: '选择一个档案以探索互动星盘', clickForInterpretations: '点击行星查看解读',
    explore: '点击行星进行探索', selectedPlanet: '已选行星', none: '无', reflect: '问问自己',
    themes: ['你的本质', '你的情绪', '你的思维', '你的爱', '你的行动', '你的扩展', '你的纪律', '你的自由', '你的灵性', '你的转化', '你的命运', '你的疗愈'],
    questions: ['我需要在哪里发光并获得认可？', '什么让我有家的感觉？', '我的思维方式如何运作？', '我真正重视什么？', '什么促使我行动？', '我可以在哪里成长和扩展？', '我需要以纪律建立什么？', '我需要在哪里展现独创性？', '我内在有什么超越物质？', '我需要彻底转化什么？', '我应该朝哪个方向前进？', '哪种痛苦让我成为疗愈者？'],
    extraMeanings: {
      northNode: '北交点指向你今生的进化方向 — 那片带来成长的未知领域。它代表未来。',
      chiron: '凯龙代表无法完全愈合的伤口，但它会成为你最大的智慧来源，以及疗愈他人的能力。',
    },
  },
  ru: {
    title: 'AstroClick Portrait', subtitle: 'Исследуйте свою карту интерактивно — нажимайте на планеты, чтобы узнать их значение',
    clickToInterpret: 'Нажмите на любую планету в карте, чтобы увидеть её толкование', inSign: 'В знаке', house: 'Дом',
    selectProfile: 'Выберите профиль, чтобы исследовать интерактивную карту', clickForInterpretations: 'Нажимайте на планеты, чтобы увидеть толкования',
    explore: 'Нажимайте на планеты для исследования', selectedPlanet: 'Выбранная планета', none: 'нет', reflect: 'Спросите себя',
    themes: ['Ваша Сущность', 'Ваши Эмоции', 'Ваш Разум', 'Ваша Любовь', 'Ваше Действие', 'Ваше Расширение', 'Ваша Дисциплина', 'Ваша Свобода', 'Ваша Духовность', 'Ваша Трансформация', 'Ваше Предназначение', 'Ваше Исцеление'],
    questions: ['Где мне нужно сиять и быть признанным?', 'Что даёт мне ощущение дома?', 'Как работает моё мышление?', 'Что я действительно ценю?', 'Что побуждает меня действовать?', 'Где я могу расти и расширять возможности?', 'Что мне нужно построить с дисциплиной?', 'Где мне нужно проявлять оригинальность?', 'Что во мне выходит за пределы материального?', 'Что мне нужно радикально преобразить?', 'В каком направлении мне следует идти?', 'Какая боль сделала меня целителем?'],
    extraMeanings: {
      northNode: 'Северный узел указывает направление вашей эволюции в этой жизни — незнакомую область, которая приносит рост. Он представляет будущее.',
      chiron: 'Хирон — это рана, которая не заживает полностью, но становится величайшим источником мудрости и способности исцелять других.',
    },
  },
  tr: {
    title: 'AstroClick Portrait', subtitle: 'Haritanızı etkileşimli olarak keşfedin — anlamını görmek için her gezegene tıklayın',
    clickToInterpret: 'Yorumunu görmek için haritadaki herhangi bir gezegene tıklayın', inSign: 'Burç', house: 'Ev',
    selectProfile: 'Etkileşimli haritayı keşfetmek için bir profil seçin', clickForInterpretations: 'Yorumları görmek için gezegenlere tıklayın',
    explore: 'Keşfetmek için gezegenlere tıklayın', selectedPlanet: 'Seçili gezegen', none: 'yok', reflect: 'Kendinize sorun',
    themes: ['Özünüz', 'Duygularınız', 'Zihniniz', 'Sevginiz', 'Eyleminiz', 'Genişlemeniz', 'Disiplininiz', 'Özgürlüğünüz', 'Maneviyatınız', 'Dönüşümünüz', 'Kaderiniz', 'Şifanız'],
    questions: ['Nerede parlamaya ve tanınmaya ihtiyacım var?', 'Bana kendimi evimde hissettiren nedir?', 'Akıl yürütme biçimim nasıl çalışıyor?', 'Gerçekten neye değer veriyorum?', 'Beni harekete geçiren nedir?', 'Nerede büyüyüp genişleyebilirim?', 'Disiplinle ne inşa etmem gerekiyor?', 'Nerede özgün olmam gerekiyor?', 'İçimde maddi olanı aşan nedir?', 'Neyi kökten dönüştürmem gerekiyor?', 'Hangi yöne yürümeliyim?', 'Hangi acı beni şifacı yaptı?'],
    extraMeanings: {
      northNode: 'Kuzey Ay Düğümü bu yaşamdaki gelişiminizin yönünü gösterir — büyüme getiren bilinmeyen alandır. Geleceği temsil eder.',
      chiron: 'Şiron tamamen iyileşmeyen yaradır; ancak en büyük bilgelik kaynağınıza ve başkalarını iyileştirme yeteneğinize dönüşür.',
    },
  },
  nl: {
    title: 'AstroClick Portrait', subtitle: 'Verken je horoscoop interactief — klik op elke planeet om de betekenis te ontdekken',
    clickToInterpret: 'Klik op een planeet in de horoscoop om de duiding te zien', inSign: 'In', house: 'Huis',
    selectProfile: 'Selecteer een profiel om de interactieve horoscoop te verkennen', clickForInterpretations: 'Klik op de planeten om duidingen te zien',
    explore: 'Klik op de planeten om te verkennen', selectedPlanet: 'Geselecteerde planeet', none: 'geen', reflect: 'Vraag jezelf',
    themes: ['Je Essentie', 'Je Emoties', 'Je Geest', 'Je Liefde', 'Je Actie', 'Je Groei', 'Je Discipline', 'Je Vrijheid', 'Je Spiritualiteit', 'Je Transformatie', 'Je Bestemming', 'Je Genezing'],
    questions: ['Waar moet ik stralen en erkend worden?', 'Wat geeft mij het gevoel thuis te zijn?', 'Hoe werkt mijn manier van denken?', 'Wat waardeer ik werkelijk?', 'Wat motiveert mij om te handelen?', 'Waar kan ik groeien en mij ontwikkelen?', 'Wat moet ik met discipline opbouwen?', 'Waar moet ik origineel zijn?', 'Wat in mij overstijgt het materiële?', 'Wat moet ik radicaal transformeren?', 'Welke richting moet ik volgen?', 'Welke pijn heeft van mij een genezer gemaakt?'],
    extraMeanings: {
      northNode: 'De Noordknoop wijst naar de richting van je ontwikkeling in dit leven — onbekend terrein dat groei brengt. Hij vertegenwoordigt de toekomst.',
      chiron: 'Chiron is de wond die nooit volledig geneest, maar die je grootste bron van wijsheid en je vermogen om anderen te helen wordt.',
    },
  },
};

const contentByLocale: Record<Locale, typeof ptPlanets> = {
  pt: ptPlanets, en: enPlanets, es: esPlanets, fr: frPlanets, de: dePlanets, it: itPlanets,
  ja: jaPlanets, zh: zhPlanets, ru: ruPlanets, tr: trPlanets, nl: nlPlanets,
};

const portugueseMeanings: Record<AstroClickPlanetId, string> = {
  sun: 'O Sol no seu mapa representa quem você é no centro — sua identidade, vontade e propósito de vida. É a energia que você irradia quando está sendo autêntico.',
  moon: 'A Lua revela seu mundo emocional inconsciente — como reage automaticamente, o que precisa para se sentir seguro e nutrido. É a criança interior.',
  mercury: 'Mercúrio mostra como você pensa, comunica e processa informações. É o estilo da sua mente — rápida ou profunda, prática ou abstrata.',
  venus: 'Vênus indica o que você valoriza, como ama e o que considera belo. É seu magnetismo, seu charme e sua capacidade de atrair.',
  mars: 'Marte é sua energia vital em movimento — como luta, toma iniciativa, expressa raiva e canaliza desejo. É a coragem e a assertividade.',
  jupiter: 'Júpiter mostra onde encontra sentido, crescimento e abundância. É o Grande Benéfico — fé, generosidade e visão ampla.',
  saturn: 'Saturno representa seus maiores desafios e deveres — onde amadurece com paciência. Restrição que se torna estrutura.',
  uranus: 'Urano indica onde precisa de independência radical, rompe padrões e inova. É o gênio rebelde e o despertar súbito.',
  neptune: 'Netuno é a porta para o transcendente — compaixão, arte, intuição, mas também ilusão e fuga. O véu entre mundos.',
  pluto: 'Plutão é poder de transformação absoluta — morte simbólica e renascimento. Intensidade, regeneração e profundidade.',
  northNode: texts.pt.extraMeanings.northNode,
  chiron: texts.pt.extraMeanings.chiron,
};

export function getAstroClickText(locale: Locale): AstroClickText {
  return texts[locale] || texts.pt;
}

export function getAstroClickPlanetMeaning(locale: Locale, planetId: AstroClickPlanetId): string {
  if (locale === 'pt') return portugueseMeanings[planetId];
  if (planetId === 'northNode' || planetId === 'chiron') return texts[locale].extraMeanings[planetId];

  const index = ASTROCLICK_PLANET_IDS.indexOf(planetId);
  return contentByLocale[locale].list[index]?.description || enPlanets.list[index]?.description || '';
}
