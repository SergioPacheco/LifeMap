import type { Locale } from './index';

type FourStrings = readonly [string, string, string, string];
type SixStrings = readonly [string, string, string, string, string, string];
type TwoStrings = readonly [string, string];

export interface SolarReturnGuide {
  intro: string;
  summary: string;
  titles: FourStrings;
  definition: TwoStrings;
  observe: SixStrings;
  location: TwoStrings;
  validity: TwoStrings;
  readingTitle: string;
  reading: string;
}

const guides: Record<Locale, SolarReturnGuide> = {
  pt: {
    intro: 'A revolução solar é o <strong class="text-cream">mapa do exato momento em que o Sol retorna à posição do seu nascimento</strong> — seu aniversário astrológico. Ela define os temas, oportunidades e desafios do próximo ano solar (aniversário a aniversário).',
    summary: 'Como funciona? O que estou vendo?', titles: ['O que é a Revolução Solar?', 'O que observar', 'Localização importa', 'Validade'],
    definition: ['Todo ano, o Sol volta ao grau exato que estava no seu nascimento. Esse momento (que pode ser no dia anterior, no dia ou no posterior ao aniversário civil) gera um novo mapa válido por 12 meses.', 'É como se a cada ano você recebesse uma "missão renovada" — o mapa solar mostra o cenário dessa missão.'],
    observe: ['<strong class="text-cream">Ascendente da RS</strong> — o tom geral do ano (como você se apresenta)', '<strong class="text-cream">Casa do Sol</strong> — a área da vida que será protagonista', '<strong class="text-cream">Lua na RS</strong> — necessidades emocionais do ano', '<strong class="text-cream">Planetas angulares</strong> (casas 1, 4, 7, 10) — energias em destaque', '<strong class="text-cream">Saturno</strong> — onde haverá reestruturação ou responsabilidade', '<strong class="text-cream">Júpiter</strong> — onde há expansão e oportunidade'],
    location: ['A revolução solar depende de <strong class="text-cream">onde você está no momento exato</strong> do retorno solar — não de onde nasceu. Astrólogos usam isso a favor: viajar para mudar o Ascendente da RS (técnica de "Astrocartografia Solar").', 'Calcule com a cidade onde estava (ou estará) no aniversário.'],
    validity: ['A revolução solar vale de <strong class="text-cream">aniversário a aniversário</strong>, não de janeiro a dezembro. Se seu aniversário é em março, o mapa de 2026 vale de março/2026 a março/2027.', 'Compare com os trânsitos do mesmo período para ver onde os temas convergem.'],
    readingTitle: 'Dica de leitura', reading: 'Foque no <strong class="text-cream">Ascendente</strong> (tom do ano), na <strong class="text-cream">casa onde o Sol cai</strong> (tema central) e em qualquer planeta na <strong class="text-cream">Casa 1 ou Casa 10</strong> (energias protagonistas). Aspectos tensos com Saturno ou Plutão indicam anos de transformação profunda — difíceis mas evolutivos.',
  },
  en: {
    intro: 'The Solar Return is the <strong class="text-cream">chart for the exact moment the Sun returns to its position at your birth</strong> — your astrological birthday. It defines the themes, opportunities, and challenges of the next solar year, from birthday to birthday.',
    summary: 'How does it work? What am I seeing?', titles: ['What is a Solar Return?', 'What to observe', 'Location matters', 'Validity'],
    definition: ['Every year, the Sun returns to the exact degree it occupied at your birth. This moment, which can occur before, on, or after your calendar birthday, creates a new chart valid for 12 months.', 'It is as if you receive a renewed mission each year — the Solar Return chart shows the setting for that mission.'],
    observe: ['<strong class="text-cream">Solar Return Ascendant</strong> — the overall tone of the year and how you present yourself', '<strong class="text-cream">House of the Sun</strong> — the area of life that takes center stage', '<strong class="text-cream">Solar Return Moon</strong> — the year’s emotional needs', '<strong class="text-cream">Angular planets</strong> (houses 1, 4, 7, 10) — emphasized energies', '<strong class="text-cream">Saturn</strong> — where restructuring or responsibility arises', '<strong class="text-cream">Jupiter</strong> — where expansion and opportunity arise'],
    location: ['The Solar Return depends on <strong class="text-cream">where you are at the exact return moment</strong>, not where you were born. Astrologers may use this deliberately by traveling to change the Solar Return Ascendant, a technique called Solar Astrocartography.', 'Calculate it for the city where you were, or will be, on your birthday.'],
    validity: ['The Solar Return runs from <strong class="text-cream">birthday to birthday</strong>, not January through December. If your birthday is in March, the 2026 chart applies from March 2026 to March 2027.', 'Compare it with transits for the same period to see where the themes converge.'],
    readingTitle: 'Reading tip', reading: 'Focus on the <strong class="text-cream">Ascendant</strong> (the year’s tone), the <strong class="text-cream">house occupied by the Sun</strong> (the central theme), and any planet in <strong class="text-cream">House 1 or House 10</strong> (leading energies). Tense aspects to Saturn or Pluto indicate years of profound transformation — difficult but evolutionary.',
  },
  es: {
    intro: 'La Revolución Solar es la <strong class="text-cream">carta del momento exacto en que el Sol vuelve a la posición de tu nacimiento</strong> — tu cumpleaños astrológico. Define los temas, oportunidades y desafíos del próximo año solar, de cumpleaños a cumpleaños.',
    summary: '¿Cómo funciona? ¿Qué estoy viendo?', titles: ['¿Qué es la Revolución Solar?', 'Qué observar', 'La ubicación importa', 'Validez'],
    definition: ['Cada año, el Sol vuelve al grado exacto que ocupaba al nacer. Ese momento, que puede ocurrir antes, durante o después del cumpleaños civil, genera una nueva carta válida durante 12 meses.', 'Es como recibir cada año una misión renovada — la carta solar muestra el escenario de esa misión.'],
    observe: ['<strong class="text-cream">Ascendente de RS</strong> — tono general del año y forma de presentarte', '<strong class="text-cream">Casa del Sol</strong> — área de vida protagonista', '<strong class="text-cream">Luna de RS</strong> — necesidades emocionales del año', '<strong class="text-cream">Planetas angulares</strong> (casas 1, 4, 7, 10) — energías destacadas', '<strong class="text-cream">Saturno</strong> — dónde habrá reestructuración o responsabilidad', '<strong class="text-cream">Júpiter</strong> — dónde hay expansión y oportunidad'],
    location: ['La Revolución Solar depende de <strong class="text-cream">dónde estás en el momento exacto</strong> del retorno, no de dónde naciste. Los astrólogos pueden viajar para cambiar el Ascendente de RS, técnica llamada Astrocartografía Solar.', 'Calcula la carta con la ciudad donde estabas, o estarás, en tu cumpleaños.'],
    validity: ['La Revolución Solar vale de <strong class="text-cream">cumpleaños a cumpleaños</strong>, no de enero a diciembre. Si cumples años en marzo, la carta de 2026 vale de marzo de 2026 a marzo de 2027.', 'Compárala con los tránsitos del mismo período para ver dónde convergen los temas.'],
    readingTitle: 'Consejo de lectura', reading: 'Concéntrate en el <strong class="text-cream">Ascendente</strong> (tono del año), la <strong class="text-cream">casa donde cae el Sol</strong> (tema central) y cualquier planeta en la <strong class="text-cream">Casa 1 o Casa 10</strong> (energías protagonistas). Los aspectos tensos con Saturno o Plutón señalan años de transformación profunda — difíciles pero evolutivos.',
  },
  fr: {
    intro: 'La Révolution Solaire est le <strong class="text-cream">thème du moment exact où le Soleil revient à sa position de naissance</strong> — votre anniversaire astrologique. Elle définit les thèmes, occasions et défis de la prochaine année solaire, d’un anniversaire au suivant.',
    summary: 'Comment cela fonctionne-t-il ? Que vois-je ?', titles: ['Qu’est-ce qu’une Révolution Solaire ?', 'Points à observer', 'Le lieu compte', 'Validité'],
    definition: ['Chaque année, le Soleil revient au degré exact qu’il occupait à votre naissance. Ce moment, avant, pendant ou après l’anniversaire civil, produit un nouveau thème valable 12 mois.', 'C’est comme recevoir chaque année une mission renouvelée — le thème solaire en montre le décor.'],
    observe: ['<strong class="text-cream">Ascendant de RS</strong> — ton général de l’année et manière de vous présenter', '<strong class="text-cream">Maison du Soleil</strong> — domaine de vie au premier plan', '<strong class="text-cream">Lune de RS</strong> — besoins émotionnels de l’année', '<strong class="text-cream">Planètes angulaires</strong> (maisons 1, 4, 7, 10) — énergies accentuées', '<strong class="text-cream">Saturne</strong> — restructuration ou responsabilité', '<strong class="text-cream">Jupiter</strong> — expansion et occasions'],
    location: ['La Révolution Solaire dépend de <strong class="text-cream">l’endroit où vous êtes au moment exact</strong> du retour, et non de votre lieu de naissance. Certains astrologues voyagent pour modifier l’Ascendant de RS, technique d’Astrocartographie Solaire.', 'Calculez-la pour la ville où vous étiez, ou serez, à votre anniversaire.'],
    validity: ['La Révolution Solaire va d’un <strong class="text-cream">anniversaire au suivant</strong>, et non de janvier à décembre. Pour un anniversaire en mars, le thème 2026 s’applique de mars 2026 à mars 2027.', 'Comparez-la aux transits de la même période pour repérer la convergence des thèmes.'],
    readingTitle: 'Conseil de lecture', reading: 'Concentrez-vous sur l’<strong class="text-cream">Ascendant</strong> (ton de l’année), la <strong class="text-cream">maison du Soleil</strong> (thème central) et toute planète en <strong class="text-cream">Maison 1 ou Maison 10</strong> (énergies principales). Les aspects tendus à Saturne ou Pluton signalent des années de transformation profonde — difficiles mais évolutives.',
  },
  de: {
    intro: 'Die Solarrückkehr ist das <strong class="text-cream">Horoskop für den exakten Moment, in dem die Sonne zu ihrer Geburtsposition zurückkehrt</strong> — Ihr astrologischer Geburtstag. Sie beschreibt Themen, Chancen und Herausforderungen des nächsten Sonnenjahres, von Geburtstag zu Geburtstag.',
    summary: 'Wie funktioniert es? Was sehe ich?', titles: ['Was ist eine Solarrückkehr?', 'Worauf achten?', 'Der Ort ist wichtig', 'Gültigkeit'],
    definition: ['Jedes Jahr kehrt die Sonne auf den exakten Grad Ihrer Geburt zurück. Dieser Moment, vor, an oder nach dem kalendarischen Geburtstag, erzeugt ein neues Horoskop mit zwölf Monaten Gültigkeit.', 'Es ist, als erhielten Sie jedes Jahr einen erneuerten Auftrag — das Solarhoroskop zeigt dessen Schauplatz.'],
    observe: ['<strong class="text-cream">Solar-Aszendent</strong> — allgemeiner Jahreston und Auftreten', '<strong class="text-cream">Haus der Sonne</strong> — zentraler Lebensbereich', '<strong class="text-cream">Solar-Mond</strong> — emotionale Bedürfnisse des Jahres', '<strong class="text-cream">Planeten an den Achsen</strong> (Häuser 1, 4, 7, 10) — betonte Energien', '<strong class="text-cream">Saturn</strong> — Umstrukturierung oder Verantwortung', '<strong class="text-cream">Jupiter</strong> — Expansion und Chancen'],
    location: ['Die Solarrückkehr hängt davon ab, <strong class="text-cream">wo Sie sich im exakten Moment</strong> befinden, nicht von Ihrem Geburtsort. Astrologen reisen mitunter, um den Solar-Aszendenten zu verändern; diese Technik heißt Solar-Astrogeografie.', 'Berechnen Sie das Horoskop für die Stadt, in der Sie an Ihrem Geburtstag waren oder sein werden.'],
    validity: ['Die Solarrückkehr gilt von <strong class="text-cream">Geburtstag zu Geburtstag</strong>, nicht von Januar bis Dezember. Bei einem Geburtstag im März gilt das Horoskop 2026 von März 2026 bis März 2027.', 'Vergleichen Sie es mit den Transiten desselben Zeitraums, um Überschneidungen der Themen zu erkennen.'],
    readingTitle: 'Lesetipp', reading: 'Achten Sie auf den <strong class="text-cream">Aszendenten</strong> (Jahreston), das <strong class="text-cream">Haus der Sonne</strong> (Hauptthema) und Planeten in <strong class="text-cream">Haus 1 oder Haus 10</strong> (führende Energien). Spannungsaspekte zu Saturn oder Pluto kennzeichnen Jahre tiefer Transformation — schwierig, aber entwicklungsfördernd.',
  },
  it: {
    intro: 'La Rivoluzione Solare è il <strong class="text-cream">tema del momento esatto in cui il Sole torna alla posizione di nascita</strong> — il tuo compleanno astrologico. Definisce temi, opportunità e sfide del prossimo anno solare, da compleanno a compleanno.',
    summary: 'Come funziona? Che cosa sto vedendo?', titles: ['Che cos’è la Rivoluzione Solare?', 'Che cosa osservare', 'Il luogo conta', 'Validità'],
    definition: ['Ogni anno il Sole torna al grado esatto occupato alla nascita. Quel momento, prima, durante o dopo il compleanno civile, genera un nuovo tema valido per 12 mesi.', 'È come ricevere ogni anno una missione rinnovata — il tema solare mostra lo scenario di quella missione.'],
    observe: ['<strong class="text-cream">Ascendente di RS</strong> — tono generale dell’anno e modo di presentarti', '<strong class="text-cream">Casa del Sole</strong> — area della vita protagonista', '<strong class="text-cream">Luna di RS</strong> — bisogni emotivi dell’anno', '<strong class="text-cream">Pianeti angolari</strong> (case 1, 4, 7, 10) — energie in evidenza', '<strong class="text-cream">Saturno</strong> — ristrutturazione o responsabilità', '<strong class="text-cream">Giove</strong> — espansione e opportunità'],
    location: ['La Rivoluzione Solare dipende da <strong class="text-cream">dove ti trovi nel momento esatto</strong> del ritorno, non dal luogo di nascita. Alcuni astrologi viaggiano per cambiare l’Ascendente di RS, tecnica chiamata Astrocartografia Solare.', 'Calcola il tema per la città in cui eri, o sarai, al compleanno.'],
    validity: ['La Rivoluzione Solare vale da <strong class="text-cream">compleanno a compleanno</strong>, non da gennaio a dicembre. Se compi gli anni a marzo, il tema 2026 vale da marzo 2026 a marzo 2027.', 'Confrontala con i transiti dello stesso periodo per vedere dove convergono i temi.'],
    readingTitle: 'Suggerimento di lettura', reading: 'Concentrati sull’<strong class="text-cream">Ascendente</strong> (tono dell’anno), sulla <strong class="text-cream">casa del Sole</strong> (tema centrale) e sui pianeti in <strong class="text-cream">Casa 1 o Casa 10</strong> (energie protagoniste). Aspetti tesi con Saturno o Plutone indicano anni di trasformazione profonda — difficili ma evolutivi.',
  },
  ja: {
    intro: 'ソーラーリターンは、<strong class="text-cream">太陽が出生時の位置へ正確に戻る瞬間のチャート</strong>、つまり占星術上の誕生日です。次の誕生日までの一年のテーマ、機会、課題を示します。',
    summary: 'どのような仕組みで、何を見ていますか？', titles: ['ソーラーリターンとは？', '注目するポイント', '場所の重要性', '有効期間'],
    definition: ['毎年、太陽は出生時とまったく同じ度数へ戻ります。暦上の誕生日の前日、当日、翌日になることもあるその瞬間から、12か月有効な新しいチャートが生まれます。', '毎年新しい使命を受け取るようなもので、ソーラーリターンはその使命が展開する舞台を示します。'],
    observe: ['<strong class="text-cream">ソーラーリターンASC</strong> — 一年の全体的な調子と見せ方', '<strong class="text-cream">太陽のハウス</strong> — 主役となる生活領域', '<strong class="text-cream">ソーラーリターンの月</strong> — 一年の感情的な必要', '<strong class="text-cream">アングル上の天体</strong>（第1・4・7・10ハウス）— 強調されるエネルギー', '<strong class="text-cream">土星</strong> — 再構築や責任が生じる領域', '<strong class="text-cream">木星</strong> — 拡大と機会が生じる領域'],
    location: ['ソーラーリターンは出生地ではなく、リターンの<strong class="text-cream">正確な瞬間にいる場所</strong>で決まります。ASCを変えるために移動する「ソーラー・アストロカートグラフィー」を使う占星術師もいます。', '誕生日にいた、または滞在する予定の都市で計算してください。'],
    validity: ['ソーラーリターンは1月から12月ではなく、<strong class="text-cream">誕生日から次の誕生日まで</strong>有効です。3月生まれなら2026年のチャートは2026年3月から2027年3月までです。', '同じ期間のトランジットと比較し、テーマが重なる場所を確認してください。'],
    readingTitle: '読み方のヒント', reading: '<strong class="text-cream">ASC</strong>（一年の調子）、<strong class="text-cream">太陽が入るハウス</strong>（中心テーマ）、<strong class="text-cream">第1または第10ハウス</strong>の天体（主役のエネルギー）に注目します。土星や冥王星との緊張角は、困難でも成長につながる深い変容の年を示します。',
  },
  zh: {
    intro: '太阳回归是<strong class="text-cream">太阳精确回到出生时位置那一刻的星盘</strong>，也就是你的占星生日。它界定从一次生日到下一次生日之间的主题、机会与挑战。',
    summary: '它如何运作？我正在看什么？', titles: ['什么是太阳回归？', '观察重点', '地点很重要', '有效期'],
    definition: ['每年太阳都会回到出生时的精确度数。这个时刻可能在公历生日之前、当天或之后，并生成一张有效12个月的新星盘。', '这就像每年收到一次更新后的使命，而太阳回归盘展示这项使命展开的舞台。'],
    observe: ['<strong class="text-cream">太阳回归上升</strong> — 一年的整体基调与自我呈现', '<strong class="text-cream">太阳所在宫位</strong> — 成为主角的生活领域', '<strong class="text-cream">太阳回归月亮</strong> — 一年的情感需求', '<strong class="text-cream">轴点行星</strong>（第1、4、7、10宫）— 被强调的能量', '<strong class="text-cream">土星</strong> — 需要重组或承担责任之处', '<strong class="text-cream">木星</strong> — 扩展与机会所在'],
    location: ['太阳回归取决于回归<strong class="text-cream">精确时刻你所在的地点</strong>，而不是出生地。有些占星师会旅行以改变太阳回归上升，这称为太阳地理占星技术。', '请使用你生日当天所在或计划停留的城市进行计算。'],
    validity: ['太阳回归从<strong class="text-cream">一次生日持续到下一次生日</strong>，并非1月至12月。若生日在3月，2026年的星盘从2026年3月有效至2027年3月。', '将它与同一时期的行运比较，查看哪些主题相互汇合。'],
    readingTitle: '阅读提示', reading: '重点关注<strong class="text-cream">上升</strong>（年度基调）、<strong class="text-cream">太阳所在宫位</strong>（核心主题），以及<strong class="text-cream">第1宫或第10宫</strong>的行星（主导能量）。与土星或冥王星的紧张相位表示深刻转化的一年 — 虽有困难，却能促进成长。',
  },
  ru: {
    intro: 'Солнечный Возврат — это <strong class="text-cream">карта точного момента возвращения Солнца в положение при рождении</strong>, ваш астрологический день рождения. Она определяет темы, возможности и испытания следующего солнечного года, от дня рождения до дня рождения.',
    summary: 'Как это работает? Что я вижу?', titles: ['Что такое Солнечный Возврат?', 'Что наблюдать', 'Место имеет значение', 'Срок действия'],
    definition: ['Каждый год Солнце возвращается на точный градус рождения. Этот момент, до, во время или после календарного дня рождения, создаёт новую карту на 12 месяцев.', 'Это словно ежегодно обновляемая миссия — карта Солнечного Возврата показывает сцену, на которой она разворачивается.'],
    observe: ['<strong class="text-cream">Асцендент Возврата</strong> — общий тон года и способ самопрезентации', '<strong class="text-cream">Дом Солнца</strong> — главная сфера жизни', '<strong class="text-cream">Луна Возврата</strong> — эмоциональные потребности года', '<strong class="text-cream">Угловые планеты</strong> (дома 1, 4, 7, 10) — усиленные энергии', '<strong class="text-cream">Сатурн</strong> — перестройка или ответственность', '<strong class="text-cream">Юпитер</strong> — расширение и возможности'],
    location: ['Солнечный Возврат зависит от того, <strong class="text-cream">где вы находитесь в точный момент</strong> возвращения, а не от места рождения. Астрологи иногда путешествуют, чтобы изменить Асцендент Возврата; это техника Солнечной Астрокартографии.', 'Рассчитывайте карту для города, где вы были или будете в день рождения.'],
    validity: ['Солнечный Возврат действует <strong class="text-cream">от дня рождения до следующего дня рождения</strong>, а не с января по декабрь. Если день рождения в марте, карта 2026 года действует с марта 2026 до марта 2027.', 'Сравните её с транзитами того же периода, чтобы увидеть, где темы сходятся.'],
    readingTitle: 'Совет по чтению', reading: 'Сосредоточьтесь на <strong class="text-cream">Асценденте</strong> (тон года), <strong class="text-cream">доме Солнца</strong> (центральная тема) и планетах в <strong class="text-cream">1-м или 10-м доме</strong> (ведущие энергии). Напряжённые аспекты к Сатурну или Плутону указывают на годы глубокой трансформации — трудные, но развивающие.',
  },
  tr: {
    intro: 'Güneş Dönüşü, <strong class="text-cream">Güneş’in doğum anındaki konumuna tam döndüğü anın haritasıdır</strong> — astrolojik doğum gününüz. Bir doğum gününden diğerine kadar gelecek güneş yılının temalarını, fırsatlarını ve zorluklarını belirler.',
    summary: 'Nasıl çalışır? Neye bakıyorum?', titles: ['Güneş Dönüşü nedir?', 'Neleri izlemeli?', 'Konum önemlidir', 'Geçerlilik'],
    definition: ['Güneş her yıl doğumdaki kesin dereceye döner. Takvim doğum gününden önce, o gün veya sonra gerçekleşebilen bu an, 12 ay geçerli yeni bir harita oluşturur.', 'Her yıl yenilenmiş bir görev almak gibidir — Güneş Dönüşü haritası bu görevin sahnesini gösterir.'],
    observe: ['<strong class="text-cream">Güneş Dönüşü Yükseleni</strong> — yılın genel tonu ve kendinizi sunuşunuz', '<strong class="text-cream">Güneş’in Evi</strong> — öne çıkan yaşam alanı', '<strong class="text-cream">Dönüş Ayı</strong> — yılın duygusal ihtiyaçları', '<strong class="text-cream">Köşe evlerdeki gezegenler</strong> (1, 4, 7, 10) — vurgulanan enerjiler', '<strong class="text-cream">Satürn</strong> — yeniden yapılanma veya sorumluluk', '<strong class="text-cream">Jüpiter</strong> — genişleme ve fırsat'],
    location: ['Güneş Dönüşü doğum yerinize değil, dönüşün <strong class="text-cream">kesin anında bulunduğunuz yere</strong> bağlıdır. Astrologlar Dönüş Yükselenini değiştirmek için seyahat edebilir; buna Güneş Astrokartografisi denir.', 'Haritayı doğum gününüzde bulunduğunuz veya bulunacağınız şehir için hesaplayın.'],
    validity: ['Güneş Dönüşü ocaktan aralığa değil, <strong class="text-cream">bir doğum gününden diğerine</strong> geçerlidir. Doğum gününüz marttaysa 2026 haritası Mart 2026’dan Mart 2027’ye kadar sürer.', 'Temaların nerede birleştiğini görmek için aynı dönemin transitleriyle karşılaştırın.'],
    readingTitle: 'Okuma ipucu', reading: '<strong class="text-cream">Yükselene</strong> (yılın tonu), <strong class="text-cream">Güneş’in bulunduğu eve</strong> (ana tema) ve <strong class="text-cream">1. veya 10. evdeki</strong> gezegenlere (başrol enerjileri) odaklanın. Satürn ya da Plüton ile gergin açılar, zorlayıcı fakat geliştirici derin dönüşüm yıllarını gösterir.',
  },
  nl: {
    intro: 'De Zonneretour is de <strong class="text-cream">horoscoop van het exacte moment waarop de Zon terugkeert naar haar positie bij je geboorte</strong> — je astrologische verjaardag. Hij bepaalt de thema’s, kansen en uitdagingen van het komende zonnejaar, van verjaardag tot verjaardag.',
    summary: 'Hoe werkt het? Waar kijk ik naar?', titles: ['Wat is een Zonneretour?', 'Waarop letten?', 'Locatie telt', 'Geldigheid'],
    definition: ['Elk jaar keert de Zon terug naar de exacte graad van je geboorte. Dit moment, vóór, op of na je kalenderverjaardag, vormt een nieuwe horoscoop die twaalf maanden geldig is.', 'Het is alsof je elk jaar een vernieuwde opdracht krijgt — de Zonneretour toont het decor van die opdracht.'],
    observe: ['<strong class="text-cream">Zonneretour-Ascendant</strong> — algemene jaartoon en presentatie', '<strong class="text-cream">Huis van de Zon</strong> — levensgebied dat centraal staat', '<strong class="text-cream">Zonneretour-Maan</strong> — emotionele behoeften van het jaar', '<strong class="text-cream">Planeten op de hoeken</strong> (huizen 1, 4, 7, 10) — benadrukte energieën', '<strong class="text-cream">Saturnus</strong> — herstructurering of verantwoordelijkheid', '<strong class="text-cream">Jupiter</strong> — groei en kansen'],
    location: ['De Zonneretour hangt af van <strong class="text-cream">waar je op het exacte moment</strong> bent, niet van je geboorteplaats. Astrologen reizen soms om de Ascendant te veranderen; deze techniek heet Zonne-Astrocartografie.', 'Bereken de horoscoop voor de stad waar je op je verjaardag was of zult zijn.'],
    validity: ['De Zonneretour geldt van <strong class="text-cream">verjaardag tot verjaardag</strong>, niet van januari tot december. Bij een verjaardag in maart geldt de kaart van 2026 van maart 2026 tot maart 2027.', 'Vergelijk hem met de transits van dezelfde periode om te zien waar thema’s samenkomen.'],
    readingTitle: 'Leestip', reading: 'Let op de <strong class="text-cream">Ascendant</strong> (jaartoon), het <strong class="text-cream">huis van de Zon</strong> (centraal thema) en planeten in <strong class="text-cream">Huis 1 of Huis 10</strong> (hoofdenergieën). Spanningsaspecten met Saturnus of Pluto wijzen op jaren van diepe transformatie — moeilijk maar bevorderlijk voor groei.',
  },
};

export function getSolarReturnGuide(locale: Locale): SolarReturnGuide {
  return guides[locale] || guides.pt;
}
