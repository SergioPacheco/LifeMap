import type { Locale } from './index';

interface NatalGuide {
  title: string;
  intro: string;
  summary: string;
  wheelTitle: string;
  wheel: string[];
  planetsTitle: string;
  planets: string[];
  housesTitle: string;
  houses: string[];
  aspectsTitle: string;
  aspects: string[];
  tipTitle: string;
  tip: string;
}

const natalGuides: Record<Locale, NatalGuide> = {
  pt: {
    title: 'Mapa Natal',
    intro: 'O mapa natal é uma <strong class="text-cream">fotografia do céu no momento exato do seu nascimento</strong>. Ele mostra onde cada planeta estava posicionado e como essas energias se combinam para formar sua personalidade única.',
    summary: 'Como funciona? O que estou vendo?',
    wheelTitle: 'O Mapa (Roda)',
    wheel: [
      'O círculo externo mostra os <strong class="text-cream">12 signos do zodíaco</strong>. O círculo interno está dividido em <strong class="text-cream">12 casas</strong> (áreas da vida). Os símbolos dentro são os <strong class="text-cream">planetas</strong> na posição que ocupavam no céu quando você nasceu.',
      'As linhas coloridas entre planetas são <strong class="text-cream">aspectos</strong> — ângulos que indicam como essas energias interagem (harmonia, tensão, fusão).',
    ],
    planetsTitle: 'Planetas = Funções Psicológicas',
    planets: ['<strong class="text-cream">☉ Sol</strong> — identidade, vontade, propósito', '<strong class="text-cream">☽ Lua</strong> — emoções, instinto, memória', '<strong class="text-cream">☿ Mercúrio</strong> — mente, comunicação, aprendizado', '<strong class="text-cream">♀ Vênus</strong> — amor, valores, prazer', '<strong class="text-cream">♂ Marte</strong> — ação, desejo, coragem', '<strong class="text-cream">♃♄♅♆♇</strong> — padrões geracionais e transformações profundas'],
    housesTitle: 'Casas = Áreas da Vida',
    houses: ['<strong class="text-cream">Casa 1</strong> — aparência, eu no mundo', '<strong class="text-cream">Casa 4</strong> — família, raízes, lar', '<strong class="text-cream">Casa 7</strong> — parcerias, relacionamentos', '<strong class="text-cream">Casa 10</strong> — carreira, reputação, vocação', 'O signo na ponta da Casa 1 é seu Ascendente'],
    aspectsTitle: 'Aspectos = Conexões',
    aspects: ['<span class="text-blue-400">△ Trígono (120°)</span> — fluxo natural, talento', '<span class="text-green-400">⚹ Sextil (60°)</span> — oportunidade, cooperação', '<span class="text-red-400">□ Quadratura (90°)</span> — tensão criativa, desafio', '<span class="text-orange-400">☍ Oposição (180°)</span> — polarização, equilíbrio', '<span class="text-gold">☌ Conjunção (0°)</span> — fusão, intensificação'],
    tipTitle: 'Dica de leitura',
    tip: 'Comece pelo <strong class="text-cream">Sol</strong> (seu signo solar — identidade), depois veja a <strong class="text-cream">Lua</strong> (emoções) e o <strong class="text-cream">Ascendente</strong> (como o mundo te vê). Esses três juntos formam o "tripé" da sua personalidade. Os aspectos entre eles revelam se essas partes de você cooperam ou entram em conflito.',
  },
  en: {
    title: 'Natal Chart',
    intro: 'The natal chart is a <strong class="text-cream">snapshot of the sky at the exact moment of your birth</strong>. It shows where every planet was positioned and how these energies combine to form your unique personality.',
    summary: 'How does it work? What am I seeing?',
    wheelTitle: 'The Chart Wheel',
    wheel: [
      'The outer circle shows the <strong class="text-cream">12 zodiac signs</strong>. The inner circle is divided into <strong class="text-cream">12 houses</strong> (areas of life). The symbols inside are the <strong class="text-cream">planets</strong> in the positions they occupied in the sky when you were born.',
      'The colored lines between planets are <strong class="text-cream">aspects</strong> — angles that indicate how these energies interact (harmony, tension, fusion).',
    ],
    planetsTitle: 'Planets = Psychological Functions',
    planets: ['<strong class="text-cream">☉ Sun</strong> — identity, will, purpose', '<strong class="text-cream">☽ Moon</strong> — emotions, instinct, memory', '<strong class="text-cream">☿ Mercury</strong> — mind, communication, learning', '<strong class="text-cream">♀ Venus</strong> — love, values, pleasure', '<strong class="text-cream">♂ Mars</strong> — action, desire, courage', '<strong class="text-cream">♃♄♅♆♇</strong> — generational patterns and deep transformations'],
    housesTitle: 'Houses = Areas of Life',
    houses: ['<strong class="text-cream">House 1</strong> — appearance, the self in the world', '<strong class="text-cream">House 4</strong> — family, roots, home', '<strong class="text-cream">House 7</strong> — partnerships, relationships', '<strong class="text-cream">House 10</strong> — career, reputation, vocation', 'The sign on the cusp of House 1 is your Ascendant'],
    aspectsTitle: 'Aspects = Connections',
    aspects: ['<span class="text-blue-400">△ Trine (120°)</span> — natural flow, talent', '<span class="text-green-400">⚹ Sextile (60°)</span> — opportunity, cooperation', '<span class="text-red-400">□ Square (90°)</span> — creative tension, challenge', '<span class="text-orange-400">☍ Opposition (180°)</span> — polarization, balance', '<span class="text-gold">☌ Conjunction (0°)</span> — fusion, intensification'],
    tipTitle: 'Reading tip',
    tip: 'Begin with the <strong class="text-cream">Sun</strong> (your solar sign — identity), then look at the <strong class="text-cream">Moon</strong> (emotions) and the <strong class="text-cream">Ascendant</strong> (how the world sees you). Together, these three form the foundation of your personality. Their aspects reveal whether these parts of you cooperate or come into conflict.',
  },
  es: {
    title: 'Carta Natal',
    intro: 'La carta natal es una <strong class="text-cream">fotografía del cielo en el momento exacto de tu nacimiento</strong>. Muestra dónde estaba cada planeta y cómo se combinan esas energías para formar tu personalidad única.',
    summary: '¿Cómo funciona? ¿Qué estoy viendo?',
    wheelTitle: 'La Carta (Rueda)',
    wheel: ['El círculo exterior muestra los <strong class="text-cream">12 signos del zodiaco</strong>. El círculo interior está dividido en <strong class="text-cream">12 casas</strong> (áreas de la vida). Los símbolos interiores son los <strong class="text-cream">planetas</strong> en la posición que ocupaban cuando naciste.', 'Las líneas de colores entre los planetas son <strong class="text-cream">aspectos</strong>: ángulos que indican cómo interactúan esas energías (armonía, tensión, fusión).'],
    planetsTitle: 'Planetas = Funciones Psicológicas',
    planets: ['<strong class="text-cream">☉ Sol</strong> — identidad, voluntad, propósito', '<strong class="text-cream">☽ Luna</strong> — emociones, instinto, memoria', '<strong class="text-cream">☿ Mercurio</strong> — mente, comunicación, aprendizaje', '<strong class="text-cream">♀ Venus</strong> — amor, valores, placer', '<strong class="text-cream">♂ Marte</strong> — acción, deseo, valentía', '<strong class="text-cream">♃♄♅♆♇</strong> — patrones generacionales y transformaciones profundas'],
    housesTitle: 'Casas = Áreas de la Vida',
    houses: ['<strong class="text-cream">Casa 1</strong> — apariencia, el yo en el mundo', '<strong class="text-cream">Casa 4</strong> — familia, raíces, hogar', '<strong class="text-cream">Casa 7</strong> — asociaciones, relaciones', '<strong class="text-cream">Casa 10</strong> — carrera, reputación, vocación', 'El signo en la cúspide de la Casa 1 es tu Ascendente'],
    aspectsTitle: 'Aspectos = Conexiones',
    aspects: ['<span class="text-blue-400">△ Trígono (120°)</span> — fluidez natural, talento', '<span class="text-green-400">⚹ Sextil (60°)</span> — oportunidad, cooperación', '<span class="text-red-400">□ Cuadratura (90°)</span> — tensión creativa, desafío', '<span class="text-orange-400">☍ Oposición (180°)</span> — polarización, equilibrio', '<span class="text-gold">☌ Conjunción (0°)</span> — fusión, intensificación'],
    tipTitle: 'Consejo de lectura',
    tip: 'Empieza por el <strong class="text-cream">Sol</strong> (tu signo solar — identidad), después mira la <strong class="text-cream">Luna</strong> (emociones) y el <strong class="text-cream">Ascendente</strong> (cómo te ve el mundo). Juntos forman la base de tu personalidad. Sus aspectos revelan si esas partes cooperan o entran en conflicto.',
  },
  fr: {
    title: 'Thème Natal',
    intro: 'Le thème natal est une <strong class="text-cream">photographie du ciel au moment exact de votre naissance</strong>. Il montre la position de chaque planète et la façon dont ces énergies se combinent pour former votre personnalité unique.',
    summary: 'Comment cela fonctionne-t-il ? Que suis-je en train de voir ?',
    wheelTitle: 'Le Thème (Roue)',
    wheel: ['Le cercle extérieur montre les <strong class="text-cream">12 signes du zodiaque</strong>. Le cercle intérieur est divisé en <strong class="text-cream">12 maisons</strong> (domaines de vie). Les symboles à l’intérieur sont les <strong class="text-cream">planètes</strong> à la position qu’elles occupaient lors de votre naissance.', 'Les lignes colorées entre les planètes sont des <strong class="text-cream">aspects</strong> — des angles indiquant comment ces énergies interagissent (harmonie, tension, fusion).'],
    planetsTitle: 'Planètes = Fonctions Psychologiques',
    planets: ['<strong class="text-cream">☉ Soleil</strong> — identité, volonté, but', '<strong class="text-cream">☽ Lune</strong> — émotions, instinct, mémoire', '<strong class="text-cream">☿ Mercure</strong> — esprit, communication, apprentissage', '<strong class="text-cream">♀ Vénus</strong> — amour, valeurs, plaisir', '<strong class="text-cream">♂ Mars</strong> — action, désir, courage', '<strong class="text-cream">♃♄♅♆♇</strong> — schémas générationnels et transformations profondes'],
    housesTitle: 'Maisons = Domaines de Vie',
    houses: ['<strong class="text-cream">Maison 1</strong> — apparence, soi dans le monde', '<strong class="text-cream">Maison 4</strong> — famille, racines, foyer', '<strong class="text-cream">Maison 7</strong> — partenariats, relations', '<strong class="text-cream">Maison 10</strong> — carrière, réputation, vocation', 'Le signe à la cuspide de la Maison 1 est votre Ascendant'],
    aspectsTitle: 'Aspects = Connexions',
    aspects: ['<span class="text-blue-400">△ Trigone (120°)</span> — fluidité naturelle, talent', '<span class="text-green-400">⚹ Sextile (60°)</span> — occasion, coopération', '<span class="text-red-400">□ Carré (90°)</span> — tension créatrice, défi', '<span class="text-orange-400">☍ Opposition (180°)</span> — polarisation, équilibre', '<span class="text-gold">☌ Conjonction (0°)</span> — fusion, intensification'],
    tipTitle: 'Conseil de lecture',
    tip: 'Commencez par le <strong class="text-cream">Soleil</strong> (votre signe solaire — identité), puis observez la <strong class="text-cream">Lune</strong> (émotions) et l’<strong class="text-cream">Ascendant</strong> (la manière dont le monde vous voit). Ensemble, ils forment le socle de votre personnalité. Leurs aspects révèlent si ces parties coopèrent ou entrent en conflit.',
  },
  de: {
    title: 'Geburtshoroskop',
    intro: 'Das Geburtshoroskop ist eine <strong class="text-cream">Momentaufnahme des Himmels zum exakten Zeitpunkt Ihrer Geburt</strong>. Es zeigt, wo jeder Planet stand und wie sich diese Energien zu Ihrer einzigartigen Persönlichkeit verbinden.',
    summary: 'Wie funktioniert es? Was sehe ich?',
    wheelTitle: 'Das Horoskoprad',
    wheel: ['Der äußere Kreis zeigt die <strong class="text-cream">12 Tierkreiszeichen</strong>. Der innere Kreis ist in <strong class="text-cream">12 Häuser</strong> (Lebensbereiche) unterteilt. Die Symbole darin sind die <strong class="text-cream">Planeten</strong> an ihrer Position zum Zeitpunkt Ihrer Geburt.', 'Die farbigen Linien zwischen den Planeten sind <strong class="text-cream">Aspekte</strong> — Winkel, die zeigen, wie diese Energien zusammenwirken (Harmonie, Spannung, Verschmelzung).'],
    planetsTitle: 'Planeten = Psychologische Funktionen',
    planets: ['<strong class="text-cream">☉ Sonne</strong> — Identität, Wille, Bestimmung', '<strong class="text-cream">☽ Mond</strong> — Gefühle, Instinkt, Erinnerung', '<strong class="text-cream">☿ Merkur</strong> — Denken, Kommunikation, Lernen', '<strong class="text-cream">♀ Venus</strong> — Liebe, Werte, Genuss', '<strong class="text-cream">♂ Mars</strong> — Handlung, Begehren, Mut', '<strong class="text-cream">♃♄♅♆♇</strong> — Generationenmuster und tiefe Wandlungen'],
    housesTitle: 'Häuser = Lebensbereiche',
    houses: ['<strong class="text-cream">1. Haus</strong> — Erscheinung, das Selbst in der Welt', '<strong class="text-cream">4. Haus</strong> — Familie, Wurzeln, Zuhause', '<strong class="text-cream">7. Haus</strong> — Partnerschaften, Beziehungen', '<strong class="text-cream">10. Haus</strong> — Karriere, Ansehen, Berufung', 'Das Zeichen an der Spitze des 1. Hauses ist Ihr Aszendent'],
    aspectsTitle: 'Aspekte = Verbindungen',
    aspects: ['<span class="text-blue-400">△ Trigon (120°)</span> — natürlicher Fluss, Talent', '<span class="text-green-400">⚹ Sextil (60°)</span> — Gelegenheit, Zusammenarbeit', '<span class="text-red-400">□ Quadrat (90°)</span> — kreative Spannung, Herausforderung', '<span class="text-orange-400">☍ Opposition (180°)</span> — Polarisierung, Ausgleich', '<span class="text-gold">☌ Konjunktion (0°)</span> — Verschmelzung, Verstärkung'],
    tipTitle: 'Lesetipp',
    tip: 'Beginnen Sie mit der <strong class="text-cream">Sonne</strong> (Sonnenzeichen — Identität), betrachten Sie dann den <strong class="text-cream">Mond</strong> (Gefühle) und den <strong class="text-cream">Aszendenten</strong> (wie die Welt Sie sieht). Zusammen bilden sie das Fundament Ihrer Persönlichkeit. Ihre Aspekte zeigen, ob diese Seiten zusammenarbeiten oder in Konflikt geraten.',
  },
  it: {
    title: 'Tema Natale',
    intro: 'Il tema natale è una <strong class="text-cream">fotografia del cielo nel momento esatto della nascita</strong>. Mostra la posizione di ogni pianeta e come queste energie si combinano per formare la tua personalità unica.',
    summary: 'Come funziona? Cosa sto osservando?',
    wheelTitle: 'Il Tema (Ruota)',
    wheel: ['Il cerchio esterno mostra i <strong class="text-cream">12 segni zodiacali</strong>. Il cerchio interno è diviso in <strong class="text-cream">12 case</strong> (aree della vita). I simboli al suo interno sono i <strong class="text-cream">pianeti</strong> nella posizione che occupavano quando sei nato.', 'Le linee colorate tra i pianeti sono gli <strong class="text-cream">aspetti</strong>: angoli che indicano come interagiscono queste energie (armonia, tensione, fusione).'],
    planetsTitle: 'Pianeti = Funzioni Psicologiche',
    planets: ['<strong class="text-cream">☉ Sole</strong> — identità, volontà, scopo', '<strong class="text-cream">☽ Luna</strong> — emozioni, istinto, memoria', '<strong class="text-cream">☿ Mercurio</strong> — mente, comunicazione, apprendimento', '<strong class="text-cream">♀ Venere</strong> — amore, valori, piacere', '<strong class="text-cream">♂ Marte</strong> — azione, desiderio, coraggio', '<strong class="text-cream">♃♄♅♆♇</strong> — schemi generazionali e trasformazioni profonde'],
    housesTitle: 'Case = Aree della Vita',
    houses: ['<strong class="text-cream">Casa 1</strong> — aspetto, l’io nel mondo', '<strong class="text-cream">Casa 4</strong> — famiglia, radici, casa', '<strong class="text-cream">Casa 7</strong> — unioni, relazioni', '<strong class="text-cream">Casa 10</strong> — carriera, reputazione, vocazione', 'Il segno sulla cuspide della Casa 1 è il tuo Ascendente'],
    aspectsTitle: 'Aspetti = Connessioni',
    aspects: ['<span class="text-blue-400">△ Trigono (120°)</span> — flusso naturale, talento', '<span class="text-green-400">⚹ Sestile (60°)</span> — opportunità, cooperazione', '<span class="text-red-400">□ Quadratura (90°)</span> — tensione creativa, sfida', '<span class="text-orange-400">☍ Opposizione (180°)</span> — polarizzazione, equilibrio', '<span class="text-gold">☌ Congiunzione (0°)</span> — fusione, intensificazione'],
    tipTitle: 'Suggerimento di lettura',
    tip: 'Inizia dal <strong class="text-cream">Sole</strong> (segno solare — identità), poi osserva la <strong class="text-cream">Luna</strong> (emozioni) e l’<strong class="text-cream">Ascendente</strong> (come ti vede il mondo). Insieme formano la base della personalità. I loro aspetti rivelano se queste parti collaborano o entrano in conflitto.',
  },
  ja: {
    title: '出生図',
    intro: '出生図は、<strong class="text-cream">あなたが生まれた正確な瞬間の空を写したもの</strong>です。各惑星がどこに位置し、そのエネルギーがどのように組み合わさって独自の個性を形作るかを示します。',
    summary: 'どのような仕組みですか？何が表示されていますか？',
    wheelTitle: 'チャート（ホイール）',
    wheel: ['外側の円は<strong class="text-cream">12星座</strong>を示します。内側の円は<strong class="text-cream">12ハウス</strong>（人生の領域）に分かれています。内側の記号は、出生時の空にあった<strong class="text-cream">惑星</strong>の位置です。', '惑星を結ぶ色付きの線は<strong class="text-cream">アスペクト</strong>です。エネルギー同士の関わり方（調和、緊張、融合）を示す角度です。'],
    planetsTitle: '惑星 = 心理的な働き',
    planets: ['<strong class="text-cream">☉ 太陽</strong> — 自我、意志、目的', '<strong class="text-cream">☽ 月</strong> — 感情、本能、記憶', '<strong class="text-cream">☿ 水星</strong> — 思考、コミュニケーション、学習', '<strong class="text-cream">♀ 金星</strong> — 愛、価値観、喜び', '<strong class="text-cream">♂ 火星</strong> — 行動、欲求、勇気', '<strong class="text-cream">♃♄♅♆♇</strong> — 世代的パターンと深い変容'],
    housesTitle: 'ハウス = 人生の領域',
    houses: ['<strong class="text-cream">第1ハウス</strong> — 外見、世界における自己', '<strong class="text-cream">第4ハウス</strong> — 家族、ルーツ、家庭', '<strong class="text-cream">第7ハウス</strong> — パートナーシップ、人間関係', '<strong class="text-cream">第10ハウス</strong> — キャリア、評判、天職', '第1ハウスのカスプにある星座がアセンダントです'],
    aspectsTitle: 'アスペクト = つながり',
    aspects: ['<span class="text-blue-400">△ トライン（120°）</span> — 自然な流れ、才能', '<span class="text-green-400">⚹ セクスタイル（60°）</span> — 機会、協力', '<span class="text-red-400">□ スクエア（90°）</span> — 創造的緊張、課題', '<span class="text-orange-400">☍ オポジション（180°）</span> — 対極化、均衡', '<span class="text-gold">☌ コンジャンクション（0°）</span> — 融合、強調'],
    tipTitle: '読み方のヒント',
    tip: 'まず<strong class="text-cream">太陽</strong>（太陽星座 — アイデンティティ）、次に<strong class="text-cream">月</strong>（感情）と<strong class="text-cream">アセンダント</strong>（世界からどう見られるか）を見ます。この3つが個性の土台です。相互のアスペクトは、それぞれが協調するか葛藤するかを示します。',
  },
  zh: {
    title: '本命盘',
    intro: '本命盘是<strong class="text-cream">你出生准确时刻的天空快照</strong>。它显示每颗行星当时的位置，以及这些能量如何结合，形成你独特的个性。',
    summary: '它如何运作？我看到的是什么？',
    wheelTitle: '星盘（圆盘）',
    wheel: ['外圈显示<strong class="text-cream">黄道十二星座</strong>。内圈分为<strong class="text-cream">十二宫</strong>（生活领域）。其中的符号是你出生时天空中<strong class="text-cream">行星</strong>所在的位置。', '行星之间的彩色线条是<strong class="text-cream">相位</strong>，这些角度表示能量如何互动（和谐、紧张、融合）。'],
    planetsTitle: '行星 = 心理功能',
    planets: ['<strong class="text-cream">☉ 太阳</strong> — 身份、意志、目标', '<strong class="text-cream">☽ 月亮</strong> — 情绪、本能、记忆', '<strong class="text-cream">☿ 水星</strong> — 思维、沟通、学习', '<strong class="text-cream">♀ 金星</strong> — 爱、价值、愉悦', '<strong class="text-cream">♂ 火星</strong> — 行动、欲望、勇气', '<strong class="text-cream">♃♄♅♆♇</strong> — 世代模式与深层转化'],
    housesTitle: '宫位 = 生活领域',
    houses: ['<strong class="text-cream">第一宫</strong> — 外表、世界中的自我', '<strong class="text-cream">第四宫</strong> — 家庭、根源、居所', '<strong class="text-cream">第七宫</strong> — 伙伴关系、亲密关系', '<strong class="text-cream">第十宫</strong> — 事业、声誉、使命', '第一宫宫头所在的星座就是你的上升星座'],
    aspectsTitle: '相位 = 连接',
    aspects: ['<span class="text-blue-400">△ 三分相（120°）</span> — 自然流动、天赋', '<span class="text-green-400">⚹ 六分相（60°）</span> — 机会、合作', '<span class="text-red-400">□ 四分相（90°）</span> — 创造性张力、挑战', '<span class="text-orange-400">☍ 对分相（180°）</span> — 两极、平衡', '<span class="text-gold">☌ 合相（0°）</span> — 融合、强化'],
    tipTitle: '解读提示',
    tip: '先看<strong class="text-cream">太阳</strong>（太阳星座 — 身份），再看<strong class="text-cream">月亮</strong>（情绪）和<strong class="text-cream">上升星座</strong>（世界如何看你）。三者共同构成人格基础。它们之间的相位揭示这些部分是相互合作还是发生冲突。',
  },
  ru: {
    title: 'Натальная карта',
    intro: 'Натальная карта — это <strong class="text-cream">снимок неба в точный момент вашего рождения</strong>. Она показывает положение каждой планеты и то, как эти энергии складываются в вашу уникальную личность.',
    summary: 'Как это работает? Что я вижу?',
    wheelTitle: 'Карта (Круг)',
    wheel: ['Внешний круг показывает <strong class="text-cream">12 знаков зодиака</strong>. Внутренний круг разделён на <strong class="text-cream">12 домов</strong> (сфер жизни). Символы внутри — это <strong class="text-cream">планеты</strong> в положениях, которые они занимали при вашем рождении.', 'Цветные линии между планетами — это <strong class="text-cream">аспекты</strong>, углы, показывающие взаимодействие энергий (гармонию, напряжение, слияние).'],
    planetsTitle: 'Планеты = Психологические Функции',
    planets: ['<strong class="text-cream">☉ Солнце</strong> — личность, воля, предназначение', '<strong class="text-cream">☽ Луна</strong> — эмоции, инстинкт, память', '<strong class="text-cream">☿ Меркурий</strong> — ум, общение, обучение', '<strong class="text-cream">♀ Венера</strong> — любовь, ценности, удовольствие', '<strong class="text-cream">♂ Марс</strong> — действие, желание, смелость', '<strong class="text-cream">♃♄♅♆♇</strong> — поколенческие модели и глубокие перемены'],
    housesTitle: 'Дома = Сферы Жизни',
    houses: ['<strong class="text-cream">1-й дом</strong> — внешность, проявление себя в мире', '<strong class="text-cream">4-й дом</strong> — семья, корни, дом', '<strong class="text-cream">7-й дом</strong> — партнёрство, отношения', '<strong class="text-cream">10-й дом</strong> — карьера, репутация, призвание', 'Знак на куспиде 1-го дома — ваш Асцендент'],
    aspectsTitle: 'Аспекты = Связи',
    aspects: ['<span class="text-blue-400">△ Трин (120°)</span> — естественный поток, талант', '<span class="text-green-400">⚹ Секстиль (60°)</span> — возможность, сотрудничество', '<span class="text-red-400">□ Квадрат (90°)</span> — творческое напряжение, вызов', '<span class="text-orange-400">☍ Оппозиция (180°)</span> — поляризация, равновесие', '<span class="text-gold">☌ Соединение (0°)</span> — слияние, усиление'],
    tipTitle: 'Совет по чтению',
    tip: 'Начните с <strong class="text-cream">Солнца</strong> (солнечный знак — личность), затем посмотрите на <strong class="text-cream">Луну</strong> (эмоции) и <strong class="text-cream">Асцендент</strong> (как вас видит мир). Вместе они образуют основу личности. Аспекты показывают, сотрудничают ли эти части или вступают в конфликт.',
  },
  tr: {
    title: 'Doğum Haritası',
    intro: 'Doğum haritası, <strong class="text-cream">doğduğunuz tam andaki gökyüzünün fotoğrafıdır</strong>. Her gezegenin nerede bulunduğunu ve bu enerjilerin benzersiz kişiliğinizi oluşturmak için nasıl birleştiğini gösterir.',
    summary: 'Nasıl çalışır? Neye bakıyorum?',
    wheelTitle: 'Harita (Çark)',
    wheel: ['Dış çember <strong class="text-cream">12 burcu</strong> gösterir. İç çember <strong class="text-cream">12 eve</strong> (yaşam alanlarına) ayrılmıştır. İçerideki semboller, doğduğunuz anda gökyüzünde bulundukları konumdaki <strong class="text-cream">gezegenlerdir</strong>.', 'Gezegenler arasındaki renkli çizgiler <strong class="text-cream">açılardır</strong>; bu enerjilerin nasıl etkileştiğini (uyum, gerilim, birleşme) gösterir.'],
    planetsTitle: 'Gezegenler = Psikolojik İşlevler',
    planets: ['<strong class="text-cream">☉ Güneş</strong> — kimlik, irade, amaç', '<strong class="text-cream">☽ Ay</strong> — duygular, içgüdü, hafıza', '<strong class="text-cream">☿ Merkür</strong> — zihin, iletişim, öğrenme', '<strong class="text-cream">♀ Venüs</strong> — sevgi, değerler, haz', '<strong class="text-cream">♂ Mars</strong> — eylem, arzu, cesaret', '<strong class="text-cream">♃♄♅♆♇</strong> — kuşaksal kalıplar ve derin dönüşümler'],
    housesTitle: 'Evler = Yaşam Alanları',
    houses: ['<strong class="text-cream">1. Ev</strong> — görünüm, dünyadaki benlik', '<strong class="text-cream">4. Ev</strong> — aile, kökler, yuva', '<strong class="text-cream">7. Ev</strong> — ortaklıklar, ilişkiler', '<strong class="text-cream">10. Ev</strong> — kariyer, itibar, meslek', '1. Evin başlangıcındaki burç Yükseleninizdir'],
    aspectsTitle: 'Açılar = Bağlantılar',
    aspects: ['<span class="text-blue-400">△ Üçgen (120°)</span> — doğal akış, yetenek', '<span class="text-green-400">⚹ Sekstil (60°)</span> — fırsat, iş birliği', '<span class="text-red-400">□ Kare (90°)</span> — yaratıcı gerilim, zorluk', '<span class="text-orange-400">☍ Karşıt (180°)</span> — kutuplaşma, denge', '<span class="text-gold">☌ Kavuşum (0°)</span> — birleşme, yoğunlaşma'],
    tipTitle: 'Okuma ipucu',
    tip: 'Önce <strong class="text-cream">Güneş</strong>e (Güneş burcu — kimlik), sonra <strong class="text-cream">Ay</strong>a (duygular) ve <strong class="text-cream">Yükselen</strong>e (dünyanın sizi nasıl gördüğü) bakın. Bu üçü kişiliğinizin temelini oluşturur. Aralarındaki açılar bu parçaların uyum içinde mi yoksa çatışma halinde mi olduğunu gösterir.',
  },
  nl: {
    title: 'Geboortehoroscoop',
    intro: 'De geboortehoroscoop is een <strong class="text-cream">momentopname van de hemel op het exacte moment van je geboorte</strong>. Hij toont waar elke planeet stond en hoe deze energieën samen je unieke persoonlijkheid vormen.',
    summary: 'Hoe werkt het? Waar kijk ik naar?',
    wheelTitle: 'De Horoscoop (Cirkel)',
    wheel: ['De buitenste cirkel toont de <strong class="text-cream">12 dierenriemtekens</strong>. De binnenste cirkel is verdeeld in <strong class="text-cream">12 huizen</strong> (levensgebieden). De symbolen daarbinnen zijn de <strong class="text-cream">planeten</strong> op de positie die zij bij je geboorte innamen.', 'De gekleurde lijnen tussen planeten zijn <strong class="text-cream">aspecten</strong>: hoeken die aangeven hoe deze energieën samenwerken (harmonie, spanning, versmelting).'],
    planetsTitle: 'Planeten = Psychologische Functies',
    planets: ['<strong class="text-cream">☉ Zon</strong> — identiteit, wil, doel', '<strong class="text-cream">☽ Maan</strong> — emoties, instinct, geheugen', '<strong class="text-cream">☿ Mercurius</strong> — geest, communicatie, leren', '<strong class="text-cream">♀ Venus</strong> — liefde, waarden, plezier', '<strong class="text-cream">♂ Mars</strong> — actie, verlangen, moed', '<strong class="text-cream">♃♄♅♆♇</strong> — generatiepatronen en diepe transformaties'],
    housesTitle: 'Huizen = Levensgebieden',
    houses: ['<strong class="text-cream">Huis 1</strong> — uiterlijk, het zelf in de wereld', '<strong class="text-cream">Huis 4</strong> — familie, wortels, thuis', '<strong class="text-cream">Huis 7</strong> — partnerschappen, relaties', '<strong class="text-cream">Huis 10</strong> — carrière, reputatie, roeping', 'Het teken op de cusp van Huis 1 is je Ascendant'],
    aspectsTitle: 'Aspecten = Verbindingen',
    aspects: ['<span class="text-blue-400">△ Driehoek (120°)</span> — natuurlijke stroom, talent', '<span class="text-green-400">⚹ Sextiel (60°)</span> — kans, samenwerking', '<span class="text-red-400">□ Vierkant (90°)</span> — creatieve spanning, uitdaging', '<span class="text-orange-400">☍ Oppositie (180°)</span> — polarisatie, evenwicht', '<span class="text-gold">☌ Conjunctie (0°)</span> — versmelting, versterking'],
    tipTitle: 'Leestip',
    tip: 'Begin met de <strong class="text-cream">Zon</strong> (zonneteken — identiteit), kijk daarna naar de <strong class="text-cream">Maan</strong> (emoties) en de <strong class="text-cream">Ascendant</strong> (hoe de wereld je ziet). Samen vormen ze de basis van je persoonlijkheid. Hun aspecten tonen of deze delen samenwerken of met elkaar botsen.',
  },
};

export function getNatalGuide(locale: Locale): NatalGuide {
  return natalGuides[locale] || natalGuides.pt;
}

interface TransitGuide {
  title: string;
  intro: string;
  summary: string;
  sectionTitles: [string, string, string, string];
  what: [string, string];
  durations: string[];
  interpretIntro: string;
  aspectMeanings: string[];
  priorityIntro: string;
  priorities: string[];
  legendTitle: string;
  legend: [string, string, string, string];
}

const transitGuides: Record<Locale, TransitGuide> = {
  pt: {
    title: 'Trânsitos', intro: 'Os trânsitos mostram <strong class="text-cream">onde os planetas estão AGORA no céu</strong> e como interagem com o seu mapa natal. São os "eventos astrológicos" da sua vida — oportunidades, desafios e transformações que o universo apresenta.', summary: 'Como funciona? O que estou vendo?',
    sectionTitles: ['O que são Trânsitos?', 'Duração dos Trânsitos', 'Como interpretar', 'Prioridade de atenção'],
    what: ['Os planetas continuam se movendo após o seu nascimento. Quando um planeta <strong class="text-cream">hoje</strong> forma um ângulo significativo com um planeta <strong class="text-cream">do seu mapa natal</strong>, dizemos que há um trânsito ativo.', 'É como se o céu "apertasse botões" no seu mapa — ativando temas específicos da sua vida em momentos específicos.'],
    durations: ['<strong class="text-cream">Lua</strong> — horas (humor do dia)', '<strong class="text-cream">Sol, Mercúrio, Vênus</strong> — 1-3 dias', '<strong class="text-cream">Marte</strong> — 1-2 semanas', '<strong class="text-cream">Júpiter</strong> — 2-3 semanas (oportunidades)', '<strong class="text-cream">Saturno</strong> — 2-3 meses (reestruturação)', '<strong class="text-cream">Urano, Netuno, Plutão</strong> — 1-2 anos (transformação profunda)'],
    interpretIntro: 'Olhe para os <strong class="text-cream">aspectos que se formam</strong> entre planetas em trânsito (anel externo) e seus planetas natais (anel interno).',
    aspectMeanings: ['<strong class="text-cream">Conjunção</strong> = começo de um ciclo no tema daquele planeta', '<strong class="text-cream">Quadratura</strong> = crise que exige ação ou decisão', '<strong class="text-cream">Oposição</strong> = culminação, confronto, consciência plena', '<strong class="text-cream">Trígono</strong> = fluxo, oportunidade, facilidade'],
    priorityIntro: 'Nem todo trânsito é igualmente importante. Priorize:',
    priorities: ['Trânsitos de <strong class="text-cream">Saturno, Urano, Netuno, Plutão</strong> — os mais transformadores', 'Trânsitos ao <strong class="text-cream">Sol, Lua ou Ascendente</strong> natal — afetam o "centro" de quem você é', 'Trânsitos de <strong class="text-cream">Júpiter</strong> — oportunidades e expansão', 'Planetas rápidos — só se confirmar um padrão com os anteriores'],
    legendTitle: 'Legenda de leitura', legend: ['Anel interno = seu mapa natal (fixo, não muda)', 'Anel externo = planetas em trânsito (posição hoje)', 'Linhas = aspectos ativos entre trânsito e natal', 'Altere a data para explorar trânsitos futuros ou passados'],
  },
  en: {
    title: 'Transits', intro: 'Transits show <strong class="text-cream">where the planets are NOW in the sky</strong> and how they interact with your natal chart. They are the astrological events of your life — opportunities, challenges, and transformations presented by the universe.', summary: 'How does it work? What am I seeing?',
    sectionTitles: ['What are Transits?', 'Transit Duration', 'How to interpret', 'What to prioritize'],
    what: ['The planets keep moving after your birth. When a planet <strong class="text-cream">today</strong> forms a significant angle with a planet <strong class="text-cream">in your natal chart</strong>, we call it an active transit.', 'It is as if the sky were pressing buttons in your chart — activating specific life themes at specific times.'],
    durations: ['<strong class="text-cream">Moon</strong> — hours (the mood of the day)', '<strong class="text-cream">Sun, Mercury, Venus</strong> — 1-3 days', '<strong class="text-cream">Mars</strong> — 1-2 weeks', '<strong class="text-cream">Jupiter</strong> — 2-3 weeks (opportunities)', '<strong class="text-cream">Saturn</strong> — 2-3 months (restructuring)', '<strong class="text-cream">Uranus, Neptune, Pluto</strong> — 1-2 years (deep transformation)'],
    interpretIntro: 'Look at the <strong class="text-cream">aspects being formed</strong> between transiting planets (outer ring) and your natal planets (inner ring).',
    aspectMeanings: ['<strong class="text-cream">Conjunction</strong> = the beginning of a cycle around that planet’s theme', '<strong class="text-cream">Square</strong> = a crisis that requires action or a decision', '<strong class="text-cream">Opposition</strong> = culmination, confrontation, full awareness', '<strong class="text-cream">Trine</strong> = flow, opportunity, ease'],
    priorityIntro: 'Not every transit is equally important. Prioritize:',
    priorities: ['Transits from <strong class="text-cream">Saturn, Uranus, Neptune, and Pluto</strong> — the most transformative', 'Transits to the natal <strong class="text-cream">Sun, Moon, or Ascendant</strong> — they affect the center of who you are', '<strong class="text-cream">Jupiter</strong> transits — opportunities and expansion', 'Fast planets — mainly when they confirm a pattern set by the planets above'],
    legendTitle: 'Reading legend', legend: ['Inner ring = your natal chart (fixed and unchanging)', 'Outer ring = transiting planets (current position)', 'Lines = active aspects between transits and natal positions', 'Change the date to explore future or past transits'],
  },
  es: {
    title: 'Tránsitos', intro: 'Los tránsitos muestran <strong class="text-cream">dónde están AHORA los planetas en el cielo</strong> y cómo interactúan con tu carta natal. Son los acontecimientos astrológicos de tu vida: oportunidades, desafíos y transformaciones que presenta el universo.', summary: '¿Cómo funciona? ¿Qué estoy viendo?',
    sectionTitles: ['¿Qué son los Tránsitos?', 'Duración de los Tránsitos', 'Cómo interpretar', 'Prioridad de atención'],
    what: ['Los planetas siguen moviéndose después de tu nacimiento. Cuando un planeta <strong class="text-cream">hoy</strong> forma un ángulo significativo con un planeta <strong class="text-cream">de tu carta natal</strong>, decimos que hay un tránsito activo.', 'Es como si el cielo pulsara botones en tu carta, activando temas específicos de tu vida en momentos concretos.'],
    durations: ['<strong class="text-cream">Luna</strong> — horas (estado de ánimo del día)', '<strong class="text-cream">Sol, Mercurio, Venus</strong> — 1-3 días', '<strong class="text-cream">Marte</strong> — 1-2 semanas', '<strong class="text-cream">Júpiter</strong> — 2-3 semanas (oportunidades)', '<strong class="text-cream">Saturno</strong> — 2-3 meses (reestructuración)', '<strong class="text-cream">Urano, Neptuno, Plutón</strong> — 1-2 años (transformación profunda)'],
    interpretIntro: 'Observa los <strong class="text-cream">aspectos que se forman</strong> entre los planetas en tránsito (anillo exterior) y tus planetas natales (anillo interior).',
    aspectMeanings: ['<strong class="text-cream">Conjunción</strong> = inicio de un ciclo en el tema de ese planeta', '<strong class="text-cream">Cuadratura</strong> = crisis que exige acción o decisión', '<strong class="text-cream">Oposición</strong> = culminación, confrontación, conciencia plena', '<strong class="text-cream">Trígono</strong> = fluidez, oportunidad, facilidad'],
    priorityIntro: 'No todos los tránsitos tienen la misma importancia. Prioriza:',
    priorities: ['Tránsitos de <strong class="text-cream">Saturno, Urano, Neptuno y Plutón</strong> — los más transformadores', 'Tránsitos al <strong class="text-cream">Sol, Luna o Ascendente</strong> natal — afectan el centro de quien eres', 'Tránsitos de <strong class="text-cream">Júpiter</strong> — oportunidades y expansión', 'Planetas rápidos — principalmente si confirman un patrón de los anteriores'],
    legendTitle: 'Leyenda de lectura', legend: ['Anillo interior = tu carta natal (fija, no cambia)', 'Anillo exterior = planetas en tránsito (posición actual)', 'Líneas = aspectos activos entre tránsito y natal', 'Cambia la fecha para explorar tránsitos futuros o pasados'],
  },
  fr: {
    title: 'Transits', intro: 'Les transits montrent <strong class="text-cream">où se trouvent les planètes MAINTENANT dans le ciel</strong> et comment elles interagissent avec votre thème natal. Ce sont les événements astrologiques de votre vie — occasions, défis et transformations présentés par l’univers.', summary: 'Comment cela fonctionne-t-il ? Que suis-je en train de voir ?',
    sectionTitles: ['Que sont les Transits ?', 'Durée des Transits', 'Comment interpréter', 'Priorités d’attention'],
    what: ['Les planètes continuent de se déplacer après votre naissance. Lorsqu’une planète <strong class="text-cream">aujourd’hui</strong> forme un angle significatif avec une planète <strong class="text-cream">de votre thème natal</strong>, on parle de transit actif.', 'C’est comme si le ciel appuyait sur des boutons de votre thème, activant des sujets précis de votre vie à des moments précis.'],
    durations: ['<strong class="text-cream">Lune</strong> — quelques heures (humeur du jour)', '<strong class="text-cream">Soleil, Mercure, Vénus</strong> — 1 à 3 jours', '<strong class="text-cream">Mars</strong> — 1 à 2 semaines', '<strong class="text-cream">Jupiter</strong> — 2 à 3 semaines (occasions)', '<strong class="text-cream">Saturne</strong> — 2 à 3 mois (restructuration)', '<strong class="text-cream">Uranus, Neptune, Pluton</strong> — 1 à 2 ans (transformation profonde)'],
    interpretIntro: 'Observez les <strong class="text-cream">aspects qui se forment</strong> entre les planètes en transit (anneau extérieur) et vos planètes natales (anneau intérieur).',
    aspectMeanings: ['<strong class="text-cream">Conjonction</strong> = début d’un cycle lié au thème de cette planète', '<strong class="text-cream">Carré</strong> = crise exigeant une action ou une décision', '<strong class="text-cream">Opposition</strong> = aboutissement, confrontation, pleine conscience', '<strong class="text-cream">Trigone</strong> = fluidité, occasion, facilité'],
    priorityIntro: 'Tous les transits n’ont pas la même importance. Donnez la priorité à :',
    priorities: ['Transits de <strong class="text-cream">Saturne, Uranus, Neptune et Pluton</strong> — les plus transformateurs', 'Transits au <strong class="text-cream">Soleil, à la Lune ou à l’Ascendant</strong> natal — ils touchent le centre de votre identité', 'Transits de <strong class="text-cream">Jupiter</strong> — occasions et expansion', 'Planètes rapides — surtout lorsqu’elles confirment un schéma indiqué par les précédentes'],
    legendTitle: 'Légende de lecture', legend: ['Anneau intérieur = votre thème natal (fixe)', 'Anneau extérieur = planètes en transit (position actuelle)', 'Lignes = aspects actifs entre transit et natal', 'Changez la date pour explorer les transits futurs ou passés'],
  },
  de: {
    title: 'Transite', intro: 'Transite zeigen, <strong class="text-cream">wo die Planeten JETZT am Himmel stehen</strong> und wie sie mit Ihrem Geburtshoroskop interagieren. Sie sind die astrologischen Ereignisse Ihres Lebens — Chancen, Herausforderungen und Wandlungen, die das Universum bereithält.', summary: 'Wie funktioniert es? Was sehe ich?',
    sectionTitles: ['Was sind Transite?', 'Dauer der Transite', 'So wird gedeutet', 'Worauf Sie achten sollten'],
    what: ['Die Planeten bewegen sich nach Ihrer Geburt weiter. Bildet ein Planet <strong class="text-cream">heute</strong> einen bedeutsamen Winkel zu einem Planeten <strong class="text-cream">in Ihrem Geburtshoroskop</strong>, sprechen wir von einem aktiven Transit.', 'Es ist, als würde der Himmel Tasten in Ihrem Horoskop drücken und bestimmte Lebensthemen zu bestimmten Zeiten aktivieren.'],
    durations: ['<strong class="text-cream">Mond</strong> — Stunden (Tagesstimmung)', '<strong class="text-cream">Sonne, Merkur, Venus</strong> — 1-3 Tage', '<strong class="text-cream">Mars</strong> — 1-2 Wochen', '<strong class="text-cream">Jupiter</strong> — 2-3 Wochen (Chancen)', '<strong class="text-cream">Saturn</strong> — 2-3 Monate (Neustrukturierung)', '<strong class="text-cream">Uranus, Neptun, Pluto</strong> — 1-2 Jahre (tiefe Wandlung)'],
    interpretIntro: 'Betrachten Sie die <strong class="text-cream">entstehenden Aspekte</strong> zwischen Transitplaneten (äußerer Ring) und Ihren Radixplaneten (innerer Ring).',
    aspectMeanings: ['<strong class="text-cream">Konjunktion</strong> = Beginn eines Zyklus zum Thema dieses Planeten', '<strong class="text-cream">Quadrat</strong> = Krise, die Handlung oder Entscheidung verlangt', '<strong class="text-cream">Opposition</strong> = Höhepunkt, Konfrontation, volle Bewusstheit', '<strong class="text-cream">Trigon</strong> = Fluss, Chance, Leichtigkeit'],
    priorityIntro: 'Nicht jeder Transit ist gleich wichtig. Priorisieren Sie:',
    priorities: ['Transite von <strong class="text-cream">Saturn, Uranus, Neptun und Pluto</strong> — die transformierendsten', 'Transite zu <strong class="text-cream">Sonne, Mond oder Aszendent</strong> im Radix — sie betreffen den Kern Ihrer Identität', '<strong class="text-cream">Jupiter</strong>-Transite — Chancen und Expansion', 'Schnelle Planeten — vor allem wenn sie ein Muster der vorherigen bestätigen'],
    legendTitle: 'Leselegende', legend: ['Innerer Ring = Ihr Geburtshoroskop (fest)', 'Äußerer Ring = Transitplaneten (aktuelle Position)', 'Linien = aktive Aspekte zwischen Transit und Radix', 'Ändern Sie das Datum, um frühere oder künftige Transite zu erkunden'],
  },
  it: {
    title: 'Transiti', intro: 'I transiti mostrano <strong class="text-cream">dove si trovano ORA i pianeti nel cielo</strong> e come interagiscono con il tuo tema natale. Sono gli eventi astrologici della vita: opportunità, sfide e trasformazioni presentate dall’universo.', summary: 'Come funziona? Cosa sto osservando?',
    sectionTitles: ['Cosa sono i Transiti?', 'Durata dei Transiti', 'Come interpretare', 'Priorità di attenzione'],
    what: ['I pianeti continuano a muoversi dopo la nascita. Quando un pianeta <strong class="text-cream">oggi</strong> forma un angolo significativo con un pianeta <strong class="text-cream">del tema natale</strong>, si parla di transito attivo.', 'È come se il cielo premesse dei pulsanti nel tuo tema, attivando argomenti specifici della vita in momenti precisi.'],
    durations: ['<strong class="text-cream">Luna</strong> — ore (umore del giorno)', '<strong class="text-cream">Sole, Mercurio, Venere</strong> — 1-3 giorni', '<strong class="text-cream">Marte</strong> — 1-2 settimane', '<strong class="text-cream">Giove</strong> — 2-3 settimane (opportunità)', '<strong class="text-cream">Saturno</strong> — 2-3 mesi (ristrutturazione)', '<strong class="text-cream">Urano, Nettuno, Plutone</strong> — 1-2 anni (trasformazione profonda)'],
    interpretIntro: 'Osserva gli <strong class="text-cream">aspetti che si formano</strong> tra i pianeti in transito (anello esterno) e i pianeti natali (anello interno).',
    aspectMeanings: ['<strong class="text-cream">Congiunzione</strong> = inizio di un ciclo relativo al pianeta', '<strong class="text-cream">Quadratura</strong> = crisi che richiede azione o decisione', '<strong class="text-cream">Opposizione</strong> = culmine, confronto, piena consapevolezza', '<strong class="text-cream">Trigono</strong> = flusso, opportunità, facilità'],
    priorityIntro: 'Non tutti i transiti hanno la stessa importanza. Dai priorità a:',
    priorities: ['Transiti di <strong class="text-cream">Saturno, Urano, Nettuno e Plutone</strong> — i più trasformativi', 'Transiti al <strong class="text-cream">Sole, alla Luna o all’Ascendente</strong> natale — toccano il centro della tua identità', 'Transiti di <strong class="text-cream">Giove</strong> — opportunità ed espansione', 'Pianeti veloci — soprattutto se confermano uno schema dei precedenti'],
    legendTitle: 'Legenda di lettura', legend: ['Anello interno = tema natale (fisso)', 'Anello esterno = pianeti in transito (posizione attuale)', 'Linee = aspetti attivi tra transiti e tema natale', 'Cambia la data per esplorare transiti futuri o passati'],
  },
  ja: {
    title: 'トランジット', intro: 'トランジットは、<strong class="text-cream">今この瞬間に惑星が空のどこにあるか</strong>、そして出生図とどう関わるかを示します。人生に現れる占星術的な出来事、機会、課題、変容を表します。', summary: 'どのような仕組みですか？何が表示されていますか？',
    sectionTitles: ['トランジットとは？', 'トランジットの期間', '解釈の方法', '注目する優先順位'],
    what: ['惑星は出生後も動き続けます。<strong class="text-cream">今日の惑星</strong>が<strong class="text-cream">出生図の惑星</strong>と重要な角度を作るとき、トランジットが有効になっていると考えます。', '空がチャートのボタンを押し、人生の特定のテーマを特定の時期に活性化するようなものです。'],
    durations: ['<strong class="text-cream">月</strong> — 数時間（その日の気分）', '<strong class="text-cream">太陽、水星、金星</strong> — 1〜3日', '<strong class="text-cream">火星</strong> — 1〜2週間', '<strong class="text-cream">木星</strong> — 2〜3週間（機会）', '<strong class="text-cream">土星</strong> — 2〜3か月（再構築）', '<strong class="text-cream">天王星、海王星、冥王星</strong> — 1〜2年（深い変容）'],
    interpretIntro: 'トランジット惑星（外側のリング）と出生図の惑星（内側のリング）の間に<strong class="text-cream">形成されるアスペクト</strong>を見ます。',
    aspectMeanings: ['<strong class="text-cream">コンジャンクション</strong> = その惑星のテーマに関する周期の始まり', '<strong class="text-cream">スクエア</strong> = 行動や決断を求める危機', '<strong class="text-cream">オポジション</strong> = 完成、対面、十分な自覚', '<strong class="text-cream">トライン</strong> = 流れ、機会、容易さ'],
    priorityIntro: 'すべてのトランジットが同じ重要度ではありません。優先するもの：',
    priorities: ['<strong class="text-cream">土星、天王星、海王星、冥王星</strong>のトランジット — 最も変容的', '出生図の<strong class="text-cream">太陽、月、アセンダント</strong>へのトランジット — 自分の中心に影響', '<strong class="text-cream">木星</strong>のトランジット — 機会と拡大', '速い惑星 — 上記の惑星が示すパターンを確認するときに重視'],
    legendTitle: '読み方の凡例', legend: ['内側のリング = 出生図（固定）', '外側のリング = トランジット惑星（現在位置）', '線 = トランジットと出生図の間の有効なアスペクト', '日付を変更して過去や未来のトランジットを確認'],
  },
  zh: {
    title: '行运', intro: '行运显示<strong class="text-cream">行星此刻在天空中的位置</strong>，以及它们如何与本命盘互动。它们是人生中的占星事件：宇宙带来的机会、挑战与转化。', summary: '它如何运作？我看到的是什么？',
    sectionTitles: ['什么是行运？', '行运持续时间', '如何解读', '关注优先级'],
    what: ['你出生后，行星仍在继续运行。当<strong class="text-cream">今天的行星</strong>与<strong class="text-cream">本命盘中的行星</strong>形成重要角度时，就产生了有效行运。', '这就像天空按下星盘上的按钮，在特定时刻激活人生中特定的主题。'],
    durations: ['<strong class="text-cream">月亮</strong> — 数小时（当天情绪）', '<strong class="text-cream">太阳、水星、金星</strong> — 1至3天', '<strong class="text-cream">火星</strong> — 1至2周', '<strong class="text-cream">木星</strong> — 2至3周（机会）', '<strong class="text-cream">土星</strong> — 2至3个月（重组）', '<strong class="text-cream">天王星、海王星、冥王星</strong> — 1至2年（深层转化）'],
    interpretIntro: '观察行运行星（外圈）与本命行星（内圈）之间<strong class="text-cream">形成的相位</strong>。',
    aspectMeanings: ['<strong class="text-cream">合相</strong> = 与该行星主题有关的新周期开始', '<strong class="text-cream">四分相</strong> = 需要行动或决定的危机', '<strong class="text-cream">对分相</strong> = 高潮、对峙、充分觉察', '<strong class="text-cream">三分相</strong> = 流动、机会、顺利'],
    priorityIntro: '并非所有行运都同等重要。优先关注：',
    priorities: ['<strong class="text-cream">土星、天王星、海王星、冥王星</strong>的行运 — 转化最深', '行运触及本命<strong class="text-cream">太阳、月亮或上升点</strong> — 影响身份核心', '<strong class="text-cream">木星</strong>行运 — 机会与扩张', '快速行星 — 主要用于确认以上行星形成的模式'],
    legendTitle: '解读图例', legend: ['内圈 = 本命盘（固定不变）', '外圈 = 行运行星（当前位置）', '线条 = 行运与本命位置之间的有效相位', '更改日期以探索过去或未来的行运'],
  },
  ru: {
    title: 'Транзиты', intro: 'Транзиты показывают, <strong class="text-cream">где планеты находятся СЕЙЧАС</strong> и как они взаимодействуют с вашей натальной картой. Это астрологические события жизни — возможности, испытания и перемены, которые предлагает Вселенная.', summary: 'Как это работает? Что я вижу?',
    sectionTitles: ['Что такое Транзиты?', 'Продолжительность Транзитов', 'Как интерпретировать', 'Приоритет внимания'],
    what: ['После рождения планеты продолжают двигаться. Когда планета <strong class="text-cream">сегодня</strong> образует значимый угол с планетой <strong class="text-cream">натальной карты</strong>, мы говорим об активном транзите.', 'Это похоже на то, как небо нажимает кнопки в вашей карте, активируя определённые темы жизни в определённые моменты.'],
    durations: ['<strong class="text-cream">Луна</strong> — часы (настроение дня)', '<strong class="text-cream">Солнце, Меркурий, Венера</strong> — 1-3 дня', '<strong class="text-cream">Марс</strong> — 1-2 недели', '<strong class="text-cream">Юпитер</strong> — 2-3 недели (возможности)', '<strong class="text-cream">Сатурн</strong> — 2-3 месяца (перестройка)', '<strong class="text-cream">Уран, Нептун, Плутон</strong> — 1-2 года (глубокая трансформация)'],
    interpretIntro: 'Смотрите на <strong class="text-cream">образующиеся аспекты</strong> между транзитными планетами (внешнее кольцо) и натальными планетами (внутреннее кольцо).',
    aspectMeanings: ['<strong class="text-cream">Соединение</strong> = начало цикла по теме этой планеты', '<strong class="text-cream">Квадрат</strong> = кризис, требующий действия или решения', '<strong class="text-cream">Оппозиция</strong> = кульминация, противостояние, полное осознание', '<strong class="text-cream">Трин</strong> = поток, возможность, лёгкость'],
    priorityIntro: 'Не все транзиты одинаково важны. В первую очередь смотрите:',
    priorities: ['Транзиты <strong class="text-cream">Сатурна, Урана, Нептуна и Плутона</strong> — самые преобразующие', 'Транзиты к натальным <strong class="text-cream">Солнцу, Луне или Асценденту</strong> — затрагивают центр личности', 'Транзиты <strong class="text-cream">Юпитера</strong> — возможности и расширение', 'Быстрые планеты — главным образом когда подтверждают схему предыдущих'],
    legendTitle: 'Условные обозначения', legend: ['Внутреннее кольцо = натальная карта (неизменная)', 'Внешнее кольцо = транзитные планеты (текущее положение)', 'Линии = активные аспекты между транзитами и наталом', 'Измените дату, чтобы исследовать прошлые или будущие транзиты'],
  },
  tr: {
    title: 'Transitler', intro: 'Transitler, <strong class="text-cream">gezegenlerin ŞİMDİ gökyüzünde nerede olduğunu</strong> ve doğum haritanızla nasıl etkileştiğini gösterir. Hayatınızdaki astrolojik olaylardır: evrenin sunduğu fırsatlar, zorluklar ve dönüşümler.', summary: 'Nasıl çalışır? Neye bakıyorum?',
    sectionTitles: ['Transit Nedir?', 'Transitlerin Süresi', 'Nasıl yorumlanır?', 'Dikkat önceliği'],
    what: ['Gezegenler doğumunuzdan sonra hareket etmeye devam eder. <strong class="text-cream">Bugünkü</strong> bir gezegen <strong class="text-cream">doğum haritanızdaki</strong> bir gezegenle önemli bir açı kurduğunda aktif bir transit vardır.', 'Sanki gökyüzü haritanızdaki düğmelere basarak hayatınızın belirli temalarını belirli zamanlarda etkinleştirir.'],
    durations: ['<strong class="text-cream">Ay</strong> — saatler (günün ruh hâli)', '<strong class="text-cream">Güneş, Merkür, Venüs</strong> — 1-3 gün', '<strong class="text-cream">Mars</strong> — 1-2 hafta', '<strong class="text-cream">Jüpiter</strong> — 2-3 hafta (fırsatlar)', '<strong class="text-cream">Satürn</strong> — 2-3 ay (yeniden yapılanma)', '<strong class="text-cream">Uranüs, Neptün, Plüton</strong> — 1-2 yıl (derin dönüşüm)'],
    interpretIntro: 'Transit gezegenler (dış halka) ile doğum gezegenleriniz (iç halka) arasında <strong class="text-cream">oluşan açılara</strong> bakın.',
    aspectMeanings: ['<strong class="text-cream">Kavuşum</strong> = o gezegenin temasında yeni döngünün başlangıcı', '<strong class="text-cream">Kare</strong> = eylem veya karar gerektiren kriz', '<strong class="text-cream">Karşıt</strong> = doruk, yüzleşme, tam farkındalık', '<strong class="text-cream">Üçgen</strong> = akış, fırsat, kolaylık'],
    priorityIntro: 'Her transit aynı derecede önemli değildir. Öncelik verin:',
    priorities: ['<strong class="text-cream">Satürn, Uranüs, Neptün ve Plüton</strong> transitleri — en dönüştürücü olanlar', 'Doğum haritasındaki <strong class="text-cream">Güneş, Ay veya Yükselen</strong>e transitler — kimliğinizin merkezini etkiler', '<strong class="text-cream">Jüpiter</strong> transitleri — fırsatlar ve genişleme', 'Hızlı gezegenler — özellikle öncekilerin oluşturduğu örüntüyü doğruladığında'],
    legendTitle: 'Okuma açıklaması', legend: ['İç halka = doğum haritanız (sabit)', 'Dış halka = transit gezegenler (güncel konum)', 'Çizgiler = transit ile doğum haritası arasındaki aktif açılar', 'Geçmiş veya gelecek transitleri incelemek için tarihi değiştirin'],
  },
  nl: {
    title: 'Transits', intro: 'Transits tonen <strong class="text-cream">waar de planeten NU aan de hemel staan</strong> en hoe zij met je geboortehoroscoop samenwerken. Het zijn de astrologische gebeurtenissen van je leven: kansen, uitdagingen en transformaties die het universum aanreikt.', summary: 'Hoe werkt het? Waar kijk ik naar?',
    sectionTitles: ['Wat zijn Transits?', 'Duur van Transits', 'Hoe te interpreteren', 'Prioriteit van aandacht'],
    what: ['De planeten blijven na je geboorte bewegen. Wanneer een planeet <strong class="text-cream">vandaag</strong> een betekenisvolle hoek vormt met een planeet <strong class="text-cream">in je geboortehoroscoop</strong>, noemen we dat een actieve transit.', 'Het is alsof de hemel knoppen in je horoscoop indrukt en specifieke levensthema’s op specifieke momenten activeert.'],
    durations: ['<strong class="text-cream">Maan</strong> — uren (stemming van de dag)', '<strong class="text-cream">Zon, Mercurius, Venus</strong> — 1-3 dagen', '<strong class="text-cream">Mars</strong> — 1-2 weken', '<strong class="text-cream">Jupiter</strong> — 2-3 weken (kansen)', '<strong class="text-cream">Saturnus</strong> — 2-3 maanden (herstructurering)', '<strong class="text-cream">Uranus, Neptunus, Pluto</strong> — 1-2 jaar (diepe transformatie)'],
    interpretIntro: 'Kijk naar de <strong class="text-cream">aspecten die ontstaan</strong> tussen transitplaneten (buitenste ring) en je geboorteplaneten (binnenste ring).',
    aspectMeanings: ['<strong class="text-cream">Conjunctie</strong> = begin van een cyclus rond het thema van die planeet', '<strong class="text-cream">Vierkant</strong> = crisis die actie of een beslissing vraagt', '<strong class="text-cream">Oppositie</strong> = hoogtepunt, confrontatie, volledig bewustzijn', '<strong class="text-cream">Driehoek</strong> = stroom, kans, gemak'],
    priorityIntro: 'Niet elke transit is even belangrijk. Geef voorrang aan:',
    priorities: ['Transits van <strong class="text-cream">Saturnus, Uranus, Neptunus en Pluto</strong> — de meest transformerende', 'Transits naar de geboorte-<strong class="text-cream">Zon, Maan of Ascendant</strong> — zij raken de kern van wie je bent', '<strong class="text-cream">Jupiter</strong>-transits — kansen en uitbreiding', 'Snelle planeten — vooral wanneer zij een patroon van de voorgaande bevestigen'],
    legendTitle: 'Leeslegenda', legend: ['Binnenste ring = je geboortehoroscoop (vast)', 'Buitenste ring = transitplaneten (huidige positie)', 'Lijnen = actieve aspecten tussen transit en geboortehoroscoop', 'Wijzig de datum om toekomstige of eerdere transits te onderzoeken'],
  },
};

export function getTransitGuide(locale: Locale): TransitGuide {
  return transitGuides[locale] || transitGuides.pt;
}
