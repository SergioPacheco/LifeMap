import type { Locale } from './index';
import { getInterpretations } from '../engine/interpretations';

type TwelveStrings = readonly [
  string, string, string, string, string, string,
  string, string, string, string, string, string,
];

export interface SolarReturnText {
  year: string;
  returnDate: string;
  selectProfile: string;
  chartTitle: string;
  interpretationTitle: string;
  interpretationDescription: string;
  yearTheme: string;
  mainFocus: string;
  emotionalNeed: string;
  ascendantTitle: string;
  sunTitle: string;
  moonTitle: string;
  ctaTitle: string;
  ctaDescription: string;
  ascInterpretations: TwelveStrings;
}

const texts: Record<Locale, SolarReturnText> = {
  pt: {
    year: 'Ano', returnDate: 'Retorno Solar: {date}', selectProfile: 'Selecione um perfil para calcular a Revolução Solar',
    chartTitle: 'Revolução Solar {year} — {name}', interpretationTitle: 'Interpretação — Revolução Solar {year}',
    interpretationDescription: 'A Revolução Solar é o mapa do momento exato em que o Sol retorna à sua posição natal — define o "clima" do ano de aniversário a aniversário.',
    yearTheme: 'Tema do Ano', mainFocus: 'Foco Principal', emotionalNeed: 'Necessidade Emocional',
    ascendantTitle: 'Ascendente de RS em {sign}', sunTitle: '☉ Sol na Casa {house}', moonTitle: '☽ Lua em {sign} na Casa {house}',
    ctaTitle: '✨ Quer a previsão completa mês a mês?', ctaDescription: 'O Relatório de Previsão Anual inclui profecção, trânsitos detalhados, eclipses e tendências por trimestre.',
    ascInterpretations: [
      'Ascendente de RS em Áries: ano de novos começos, iniciativa pessoal e coragem. Você sentirá impulso para liderar, começar projetos e se colocar em primeiro lugar. Energia alta mas impaciente.',
      'Ascendente de RS em Touro: ano de estabilização, prazer e construção material. Ritmo mais lento, foco em segurança financeira e conforto. Resultados concretos mas exige paciência.',
      'Ascendente de RS em Gêmeos: ano de comunicação intensa, aprendizado e conexões. Muita movimentação mental, viagens curtas, novos contatos. Versatilidade é a tônica — cuidado com dispersão.',
      'Ascendente de RS em Câncer: ano voltado para o lar, família e vida emocional. Necessidade de criar raízes, nutrir relações íntimas. Pode haver mudanças domésticas ou gravidez.',
      'Ascendente de RS em Leão: ano de brilho pessoal, criatividade e expressão. Você estará mais visível, mais confiante, mais disposto a se mostrar. Romance e projetos criativos em destaque.',
      'Ascendente de RS em Virgem: ano de organização, saúde e aprimoramento. Foco em rotinas, detalhes, serviço. Bom para resolver pendências, mas cuidado com autocrítica excessiva.',
      'Ascendente de RS em Libra: ano voltado para relacionamentos, parcerias e equilíbrio. Decisões importantes sobre compromissos. Busca de harmonia — mas evite se anular para agradar.',
      'Ascendente de RS em Escorpião: ano intenso de transformação profunda. Temas de poder, intimidade, morte simbólica e renascimento. Nada fica na superfície — prepare-se para profundidade.',
      'Ascendente de RS em Sagitário: ano de expansão, viagens, estudos e busca de sentido. Otimismo e desejo de liberdade. Bom para se aventurar em novas direções filosóficas ou geográficas.',
      'Ascendente de RS em Capricórnio: ano de trabalho árduo, ambição e construção de legado. Carreira em foco. Responsabilidades aumentam — mas o que você constrói agora é duradouro.',
      'Ascendente de RS em Aquário: ano de inovação, amizades e causas coletivas. Desejo de liberdade e originalidade. Rupturas possíveis com o convencional. Tecnologia e futuro em foco.',
      'Ascendente de RS em Peixes: ano de interiorização, espiritualidade e sensibilidade aumentada. Intuição aguçada. Bom para arte e cura — mas cuidado com escapismo e limites difusos.',
    ],
  },
  en: {
    year: 'Year', returnDate: 'Solar Return: {date}', selectProfile: 'Select a profile to calculate the Solar Return',
    chartTitle: 'Solar Return {year} — {name}', interpretationTitle: 'Interpretation — Solar Return {year}',
    interpretationDescription: 'The Solar Return is the chart for the exact moment the Sun returns to its natal position — it defines the tone from one birthday to the next.',
    yearTheme: 'Theme of the Year', mainFocus: 'Main Focus', emotionalNeed: 'Emotional Need',
    ascendantTitle: 'Solar Return Ascendant in {sign}', sunTitle: '☉ Sun in House {house}', moonTitle: '☽ Moon in {sign}, House {house}',
    ctaTitle: '✨ Want the complete month-by-month forecast?', ctaDescription: 'The Annual Forecast Report includes profection, detailed transits, eclipses, and quarterly trends.',
    ascInterpretations: [
      'Solar Return Ascendant in Aries: a year of new beginnings, personal initiative, and courage. You will feel driven to lead, start projects, and put yourself first. Energy is high but impatient.',
      'Solar Return Ascendant in Taurus: a year of stabilization, pleasure, and material building. The pace is slower, with focus on financial security and comfort. Concrete results require patience.',
      'Solar Return Ascendant in Gemini: a year of intense communication, learning, and connections. Expect mental activity, short trips, and new contacts. Versatility sets the tone; avoid scattering your energy.',
      'Solar Return Ascendant in Cancer: a year centered on home, family, and emotional life. You need to create roots and nurture close bonds. Domestic changes or pregnancy may arise.',
      'Solar Return Ascendant in Leo: a year of personal radiance, creativity, and expression. You are more visible, confident, and willing to be seen. Romance and creative projects stand out.',
      'Solar Return Ascendant in Virgo: a year of organization, health, and improvement. Routines, details, and service take priority. It is good for resolving pending matters, but avoid excessive self-criticism.',
      'Solar Return Ascendant in Libra: a year focused on relationships, partnerships, and balance. Important decisions about commitment arise. Seek harmony without erasing yourself to please others.',
      'Solar Return Ascendant in Scorpio: an intense year of deep transformation. Power, intimacy, symbolic death, and rebirth come forward. Nothing remains superficial; prepare to go deeper.',
      'Solar Return Ascendant in Sagittarius: a year of expansion, travel, study, and the search for meaning. Optimism and freedom grow. Explore new philosophical or geographic directions.',
      'Solar Return Ascendant in Capricorn: a year of hard work, ambition, and legacy building. Career is central. Responsibilities increase, but what you build now can endure.',
      'Solar Return Ascendant in Aquarius: a year of innovation, friendships, and collective causes. Freedom and originality matter. Breaks with convention are possible; technology and the future stand out.',
      'Solar Return Ascendant in Pisces: a year of introspection, spirituality, and greater sensitivity. Intuition sharpens. Art and healing are favored, but watch escapism and blurred boundaries.',
    ],
  },
  es: {
    year: 'Año', returnDate: 'Retorno Solar: {date}', selectProfile: 'Selecciona un perfil para calcular la Revolución Solar',
    chartTitle: 'Revolución Solar {year} — {name}', interpretationTitle: 'Interpretación — Revolución Solar {year}',
    interpretationDescription: 'La Revolución Solar es la carta del momento exacto en que el Sol vuelve a su posición natal — define el tono de cumpleaños a cumpleaños.',
    yearTheme: 'Tema del Año', mainFocus: 'Enfoque Principal', emotionalNeed: 'Necesidad Emocional',
    ascendantTitle: 'Ascendente de RS en {sign}', sunTitle: '☉ Sol en la Casa {house}', moonTitle: '☽ Luna en {sign}, Casa {house}',
    ctaTitle: '✨ ¿Quieres la previsión completa mes a mes?', ctaDescription: 'El Informe de Previsión Anual incluye profección, tránsitos detallados, eclipses y tendencias trimestrales.',
    ascInterpretations: [
      'Ascendente de RS en Aries: año de nuevos comienzos, iniciativa personal y valentía. Sentirás impulso para liderar, iniciar proyectos y ponerte en primer lugar. Energía alta, aunque impaciente.',
      'Ascendente de RS en Tauro: año de estabilización, placer y construcción material. Ritmo más lento, con foco en seguridad económica y comodidad. Los resultados concretos exigen paciencia.',
      'Ascendente de RS en Géminis: año de comunicación intensa, aprendizaje y conexiones. Mucha actividad mental, viajes cortos y nuevos contactos. La versatilidad marca el tono; evita dispersarte.',
      'Ascendente de RS en Cáncer: año centrado en hogar, familia y vida emocional. Necesidad de crear raíces y nutrir vínculos íntimos. Puede haber cambios domésticos o embarazo.',
      'Ascendente de RS en Leo: año de brillo personal, creatividad y expresión. Estarás más visible, seguro y dispuesto a mostrarte. Destacan el romance y los proyectos creativos.',
      'Ascendente de RS en Virgo: año de organización, salud y mejora. Foco en rutinas, detalles y servicio. Es favorable para resolver pendientes, pero evita la autocrítica excesiva.',
      'Ascendente de RS en Libra: año dedicado a relaciones, asociaciones y equilibrio. Habrá decisiones importantes sobre compromisos. Busca armonía sin anularte para agradar.',
      'Ascendente de RS en Escorpio: año intenso de transformación profunda. Poder, intimidad, muerte simbólica y renacimiento pasan al frente. Nada queda en la superficie.',
      'Ascendente de RS en Sagitario: año de expansión, viajes, estudios y búsqueda de sentido. Crecen el optimismo y el deseo de libertad. Explora nuevas direcciones filosóficas o geográficas.',
      'Ascendente de RS en Capricornio: año de trabajo duro, ambición y construcción de legado. La carrera ocupa el centro. Aumentan las responsabilidades, pero lo construido será duradero.',
      'Ascendente de RS en Acuario: año de innovación, amistades y causas colectivas. Importan la libertad y la originalidad. Puede haber rupturas con lo convencional; destacan tecnología y futuro.',
      'Ascendente de RS en Piscis: año de introspección, espiritualidad y mayor sensibilidad. La intuición se agudiza. Favorece arte y sanación, pero cuida el escapismo y los límites difusos.',
    ],
  },
  fr: {
    year: 'Année', returnDate: 'Révolution Solaire : {date}', selectProfile: 'Sélectionnez un profil pour calculer la Révolution Solaire',
    chartTitle: 'Révolution Solaire {year} — {name}', interpretationTitle: 'Interprétation — Révolution Solaire {year}',
    interpretationDescription: 'La Révolution Solaire est le thème du moment exact où le Soleil revient à sa position natale — elle donne le ton d’un anniversaire au suivant.',
    yearTheme: 'Thème de l’Année', mainFocus: 'Priorité Principale', emotionalNeed: 'Besoin Émotionnel',
    ascendantTitle: 'Ascendant de RS en {sign}', sunTitle: '☉ Soleil en Maison {house}', moonTitle: '☽ Lune en {sign}, Maison {house}',
    ctaTitle: '✨ Vous souhaitez les prévisions complètes mois par mois ?', ctaDescription: 'Le Rapport Annuel inclut profection, transits détaillés, éclipses et tendances trimestrielles.',
    ascInterpretations: [
      'Ascendant de RS en Bélier : année de nouveaux départs, d’initiative et de courage. Vous voudrez diriger, lancer des projets et vous placer au premier plan. Énergie forte mais impatiente.',
      'Ascendant de RS en Taureau : année de stabilisation, de plaisir et de construction matérielle. Rythme plus lent, sécurité financière et confort au centre. Les résultats concrets demandent de la patience.',
      'Ascendant de RS en Gémeaux : année de communication, d’apprentissage et de connexions intenses. Activité mentale, courts voyages et nouveaux contacts. La polyvalence domine ; évitez la dispersion.',
      'Ascendant de RS en Cancer : année centrée sur le foyer, la famille et la vie émotionnelle. Besoin de créer des racines et de nourrir les liens intimes. Changements domestiques ou grossesse possibles.',
      'Ascendant de RS en Lion : année de rayonnement, de créativité et d’expression. Vous serez plus visible, confiant et prêt à vous montrer. Romance et projets créatifs sont favorisés.',
      'Ascendant de RS en Vierge : année d’organisation, de santé et d’amélioration. Routines, détails et service sont prioritaires. Idéale pour régler les dossiers en attente, sans tomber dans l’autocritique.',
      'Ascendant de RS en Balance : année consacrée aux relations, partenariats et à l’équilibre. Décisions importantes sur les engagements. Cherchez l’harmonie sans vous effacer.',
      'Ascendant de RS en Scorpion : année intense de transformation profonde. Pouvoir, intimité, mort symbolique et renaissance passent au premier plan. Rien ne reste superficiel.',
      'Ascendant de RS en Sagittaire : année d’expansion, de voyages, d’études et de quête de sens. Optimisme et besoin de liberté grandissent. Explorez de nouvelles directions philosophiques ou géographiques.',
      'Ascendant de RS en Capricorne : année de travail, d’ambition et de construction d’un héritage. La carrière est centrale. Les responsabilités augmentent, mais vos acquis peuvent durer.',
      'Ascendant de RS en Verseau : année d’innovation, d’amitiés et de causes collectives. Liberté et originalité comptent. Ruptures avec les conventions possibles ; technologie et avenir dominent.',
      'Ascendant de RS en Poissons : année d’intériorisation, de spiritualité et de sensibilité accrue. L’intuition s’affine. Art et guérison sont favorisés ; attention à la fuite et aux limites floues.',
    ],
  },
  de: {
    year: 'Jahr', returnDate: 'Solarrückkehr: {date}', selectProfile: 'Wählen Sie ein Profil, um die Solarrückkehr zu berechnen',
    chartTitle: 'Solarrückkehr {year} — {name}', interpretationTitle: 'Deutung — Solarrückkehr {year}',
    interpretationDescription: 'Die Solarrückkehr ist das Horoskop für den exakten Moment, in dem die Sonne zu ihrer Radixposition zurückkehrt — sie prägt den Ton von Geburtstag zu Geburtstag.',
    yearTheme: 'Jahresthema', mainFocus: 'Hauptfokus', emotionalNeed: 'Emotionales Bedürfnis',
    ascendantTitle: 'Solarrückkehr-Aszendent in {sign}', sunTitle: '☉ Sonne in Haus {house}', moonTitle: '☽ Mond in {sign}, Haus {house}',
    ctaTitle: '✨ Möchten Sie die vollständige Monatsprognose?', ctaDescription: 'Der Jahresprognose-Bericht enthält Profektion, detaillierte Transite, Finsternisse und Quartalstendenzen.',
    ascInterpretations: [
      'Solarrückkehr-Aszendent in Widder: ein Jahr der Neuanfänge, Eigeninitiative und des Mutes. Sie wollen führen, Projekte starten und sich selbst priorisieren. Die Energie ist hoch, aber ungeduldig.',
      'Solarrückkehr-Aszendent in Stier: ein Jahr der Stabilisierung, des Genusses und materiellen Aufbaus. Langsameres Tempo, finanzielle Sicherheit und Komfort stehen im Fokus. Konkrete Ergebnisse brauchen Geduld.',
      'Solarrückkehr-Aszendent in Zwillinge: ein Jahr intensiver Kommunikation, des Lernens und neuer Verbindungen. Viel geistige Bewegung, kurze Reisen und Kontakte. Vielseitigkeit prägt das Jahr; vermeiden Sie Zerstreuung.',
      'Solarrückkehr-Aszendent in Krebs: ein Jahr rund um Zuhause, Familie und Gefühlsleben. Sie möchten Wurzeln schaffen und enge Bindungen nähren. Häusliche Veränderungen oder Schwangerschaft sind möglich.',
      'Solarrückkehr-Aszendent in Löwe: ein Jahr persönlicher Ausstrahlung, Kreativität und Selbstentfaltung. Sie sind sichtbarer, selbstbewusster und zeigen sich eher. Romantik und kreative Projekte treten hervor.',
      'Solarrückkehr-Aszendent in Jungfrau: ein Jahr der Organisation, Gesundheit und Verbesserung. Routinen, Details und Dienst stehen im Fokus. Gut für offene Aufgaben; vermeiden Sie übermäßige Selbstkritik.',
      'Solarrückkehr-Aszendent in Waage: ein Jahr für Beziehungen, Partnerschaften und Gleichgewicht. Wichtige Entscheidungen über Bindungen stehen an. Suchen Sie Harmonie, ohne sich selbst aufzugeben.',
      'Solarrückkehr-Aszendent in Skorpion: ein intensives Jahr tiefer Transformation. Macht, Intimität, symbolischer Tod und Wiedergeburt werden zentral. Nichts bleibt oberflächlich.',
      'Solarrückkehr-Aszendent in Schütze: ein Jahr der Expansion, Reisen, Studien und Sinnsuche. Optimismus und Freiheitsdrang wachsen. Erkunden Sie neue philosophische oder geografische Richtungen.',
      'Solarrückkehr-Aszendent in Steinbock: ein Jahr harter Arbeit, des Ehrgeizes und Vermächtnisaufbaus. Karriere steht im Mittelpunkt. Verantwortung wächst, doch das Erbaute kann Bestand haben.',
      'Solarrückkehr-Aszendent in Wassermann: ein Jahr der Innovation, Freundschaften und kollektiven Anliegen. Freiheit und Originalität zählen. Brüche mit Konventionen sind möglich; Technik und Zukunft stehen vorn.',
      'Solarrückkehr-Aszendent in Fische: ein Jahr der Innenschau, Spiritualität und erhöhten Sensibilität. Die Intuition wird stärker. Kunst und Heilung sind begünstigt; achten Sie auf Flucht und unklare Grenzen.',
    ],
  },
  it: {
    year: 'Anno', returnDate: 'Rivoluzione Solare: {date}', selectProfile: 'Seleziona un profilo per calcolare la Rivoluzione Solare',
    chartTitle: 'Rivoluzione Solare {year} — {name}', interpretationTitle: 'Interpretazione — Rivoluzione Solare {year}',
    interpretationDescription: 'La Rivoluzione Solare è il tema del momento esatto in cui il Sole torna alla posizione natale — definisce il tono da un compleanno al successivo.',
    yearTheme: 'Tema dell’Anno', mainFocus: 'Focus Principale', emotionalNeed: 'Bisogno Emotivo',
    ascendantTitle: 'Ascendente di RS in {sign}', sunTitle: '☉ Sole in Casa {house}', moonTitle: '☽ Luna in {sign}, Casa {house}',
    ctaTitle: '✨ Vuoi la previsione completa mese per mese?', ctaDescription: 'Il Rapporto Annuale include profezione, transiti dettagliati, eclissi e tendenze trimestrali.',
    ascInterpretations: [
      'Ascendente di RS in Ariete: anno di nuovi inizi, iniziativa personale e coraggio. Sentirai la spinta a guidare, avviare progetti e metterti al primo posto. Energia alta ma impaziente.',
      'Ascendente di RS in Toro: anno di stabilizzazione, piacere e costruzione materiale. Ritmo più lento, sicurezza finanziaria e comodità al centro. I risultati concreti richiedono pazienza.',
      'Ascendente di RS in Gemelli: anno di comunicazione intensa, apprendimento e connessioni. Molta attività mentale, brevi viaggi e nuovi contatti. La versatilità domina; evita di disperderti.',
      'Ascendente di RS in Cancro: anno centrato su casa, famiglia e vita emotiva. Bisogno di mettere radici e nutrire i legami intimi. Possibili cambiamenti domestici o gravidanza.',
      'Ascendente di RS in Leone: anno di splendore personale, creatività ed espressione. Sarai più visibile, sicuro e disposto a mostrarti. In primo piano romanticismo e progetti creativi.',
      'Ascendente di RS in Vergine: anno di organizzazione, salute e miglioramento. Focus su routine, dettagli e servizio. Utile per risolvere questioni pendenti, evitando l’eccessiva autocritica.',
      'Ascendente di RS in Bilancia: anno dedicato a relazioni, collaborazioni ed equilibrio. Decisioni importanti sugli impegni. Cerca armonia senza annullarti per compiacere.',
      'Ascendente di RS in Scorpione: anno intenso di trasformazione profonda. Potere, intimità, morte simbolica e rinascita emergono. Nulla resta superficiale.',
      'Ascendente di RS in Sagittario: anno di espansione, viaggi, studi e ricerca di senso. Crescono ottimismo e desiderio di libertà. Esplora nuove direzioni filosofiche o geografiche.',
      'Ascendente di RS in Capricorno: anno di duro lavoro, ambizione e costruzione di un’eredità. La carriera è centrale. Aumentano le responsabilità, ma ciò che costruisci può durare.',
      'Ascendente di RS in Acquario: anno di innovazione, amicizie e cause collettive. Libertà e originalità contano. Possibili rotture con le convenzioni; tecnologia e futuro in primo piano.',
      'Ascendente di RS in Pesci: anno di introspezione, spiritualità e maggiore sensibilità. L’intuizione si affina. Arte e guarigione favorite; attenzione a evasione e confini sfumati.',
    ],
  },
  ja: {
    year: '年', returnDate: 'ソーラーリターン：{date}', selectProfile: 'プロフィールを選択してソーラーリターンを計算',
    chartTitle: '{year}年 ソーラーリターン — {name}', interpretationTitle: '{year}年 ソーラーリターン解釈',
    interpretationDescription: 'ソーラーリターンは太陽が出生時の位置へ正確に戻る瞬間のチャートで、誕生日から次の誕生日までの一年の基調を示します。',
    yearTheme: '一年のテーマ', mainFocus: '主な焦点', emotionalNeed: '感情的な必要',
    ascendantTitle: 'ソーラーリターンASC：{sign}', sunTitle: '☉ 太陽 第{house}ハウス', moonTitle: '☽ 月 {sign}・第{house}ハウス',
    ctaTitle: '✨ 月ごとの完全な予測を見ますか？', ctaDescription: '年間予測レポートにはプロフェクション、詳細なトランジット、日食・月食、四半期ごとの傾向が含まれます。',
    ascInterpretations: [
      'ソーラーリターンASCが牡羊座：新しい始まり、自発性、勇気の一年です。先頭に立ち、計画を始め、自分を優先したくなります。エネルギーは高いものの、焦りに注意。',
      'ソーラーリターンASCが牡牛座：安定、喜び、物質的な基盤づくりの一年です。歩みはゆっくりになり、経済的安心と快適さが中心に。具体的な成果には忍耐が必要です。',
      'ソーラーリターンASCが双子座：活発なコミュニケーション、学習、つながりの一年です。思考活動、短い旅行、新しい出会いが増えます。柔軟性が鍵ですが、散漫さに注意。',
      'ソーラーリターンASCが蟹座：家庭、家族、感情生活を中心とする一年です。根を張り、親密な関係を育てる必要があります。住環境の変化や妊娠の可能性も。',
      'ソーラーリターンASCが獅子座：自己表現、創造性、輝きの一年です。より目立ち、自信を持って姿を見せられます。恋愛と創作プロジェクトが注目されます。',
      'ソーラーリターンASCが乙女座：整理、健康、改善の一年です。日課、細部、奉仕が中心。未解決事項の処理に適しますが、過度な自己批判は避けてください。',
      'ソーラーリターンASCが天秤座：関係、協力、均衡を中心とする一年です。約束に関する重要な決断が生じます。調和を求めつつ、他者のために自分を消さないこと。',
      'ソーラーリターンASCが蠍座：深い変容の激しい一年です。力、親密さ、象徴的な死と再生が前面に出ます。表面的なままでは済みません。',
      'ソーラーリターンASCが射手座：拡大、旅行、学び、意味の探求の一年です。楽観性と自由への欲求が高まります。新しい思想的・地理的方向を探りましょう。',
      'ソーラーリターンASCが山羊座：努力、野心、長く残るものを築く一年です。キャリアが中心となり、責任が増えますが、今築くものは持続します。',
      'ソーラーリターンASCが水瓶座：革新、友情、社会的な活動の一年です。自由と独創性が重要になります。慣習との決別もあり、技術と未来が焦点に。',
      'ソーラーリターンASCが魚座：内省、精神性、感受性の高まりの一年です。直感が鋭くなり、芸術と癒やしに適します。逃避と曖昧な境界には注意。',
    ],
  },
  zh: {
    year: '年份', returnDate: '太阳回归：{date}', selectProfile: '选择档案以计算太阳回归',
    chartTitle: '{year}年太阳回归 — {name}', interpretationTitle: '{year}年太阳回归解读',
    interpretationDescription: '太阳回归盘对应太阳精确回到出生位置的时刻，界定从一次生日到下一次生日的一年基调。',
    yearTheme: '年度主题', mainFocus: '主要焦点', emotionalNeed: '情感需求',
    ascendantTitle: '太阳回归上升：{sign}', sunTitle: '☉ 太阳在第{house}宫', moonTitle: '☽ 月亮在{sign}・第{house}宫',
    ctaTitle: '✨ 想查看完整的逐月预测吗？', ctaDescription: '年度预测报告包含年限推运、详细行运、日月食和季度趋势。',
    ascInterpretations: [
      '太阳回归上升在白羊座：这是开启新局、主动行动和展现勇气的一年。你会想领导、启动项目并优先考虑自己。能量高昂，但要留意急躁。',
      '太阳回归上升在金牛座：这是稳定、享受和建立物质基础的一年。节奏放慢，重点在财务安全与舒适。具体成果需要耐心。',
      '太阳回归上升在双子座：这是沟通、学习和建立联系活跃的一年。思维活动、短途旅行和新接触增多。灵活性是主调，但要避免分散。',
      '太阳回归上升在巨蟹座：这是以家庭、家人和情感生活为中心的一年。你需要扎根并滋养亲密关系。可能出现居住变化或怀孕。',
      '太阳回归上升在狮子座：这是个人光彩、创造力和表达的一年。你会更受关注、更自信，也更愿意展现自己。恋爱和创意项目突出。',
      '太阳回归上升在处女座：这是组织、健康和改善的一年。日常、细节和服务成为重点。适合处理积压事项，但要避免过度自我批评。',
      '太阳回归上升在天秤座：这是关注关系、合作与平衡的一年。承诺方面会有重要决定。追求和谐时，不要为了取悦他人而抹去自己。',
      '太阳回归上升在天蝎座：这是深刻转化、强度很高的一年。权力、亲密、象征性死亡与重生走到前台。没有什么会停留在表面。',
      '太阳回归上升在射手座：这是扩展、旅行、学习和寻找意义的一年。乐观与自由需求增强。适合探索新的思想或地理方向。',
      '太阳回归上升在摩羯座：这是努力工作、追求成就和建立长期成果的一年。事业居于核心，责任增加，但现在所建可长久。',
      '太阳回归上升在水瓶座：这是创新、友谊和集体议题的一年。自由与独创性很重要。可能打破惯例，科技和未来成为重点。',
      '太阳回归上升在双鱼座：这是内省、灵性和敏感度增强的一年。直觉变敏锐，艺术与疗愈有利，但要注意逃避和模糊界限。',
    ],
  },
  ru: {
    year: 'Год', returnDate: 'Солнечный Возврат: {date}', selectProfile: 'Выберите профиль для расчёта Солнечного Возврата',
    chartTitle: 'Солнечный Возврат {year} — {name}', interpretationTitle: 'Толкование — Солнечный Возврат {year}',
    interpretationDescription: 'Солнечный Возврат — карта точного момента возвращения Солнца в натальное положение; она задаёт тон от одного дня рождения до следующего.',
    yearTheme: 'Тема Года', mainFocus: 'Главный Фокус', emotionalNeed: 'Эмоциональная Потребность',
    ascendantTitle: 'Асцендент Солнечного Возврата в {sign}', sunTitle: '☉ Солнце в Доме {house}', moonTitle: '☽ Луна в {sign}, Дом {house}',
    ctaTitle: '✨ Хотите полный прогноз по месяцам?', ctaDescription: 'Годовой прогноз включает профекцию, подробные транзиты, затмения и тенденции каждого квартала.',
    ascInterpretations: [
      'Асцендент Солнечного Возврата в Овне: год новых начинаний, личной инициативы и смелости. Захочется вести, запускать проекты и ставить себя на первое место. Энергии много, но возможна нетерпеливость.',
      'Асцендент Солнечного Возврата в Тельце: год стабилизации, удовольствия и материального строительства. Темп замедляется, в центре финансовая безопасность и комфорт. Конкретные результаты требуют терпения.',
      'Асцендент Солнечного Возврата в Близнецах: год активного общения, учёбы и связей. Много умственной активности, коротких поездок и новых контактов. Гибкость задаёт тон; избегайте распыления.',
      'Асцендент Солнечного Возврата в Раке: год дома, семьи и эмоциональной жизни. Нужно укореняться и питать близкие связи. Возможны бытовые перемены или беременность.',
      'Асцендент Солнечного Возврата во Льве: год личного сияния, творчества и самовыражения. Вы станете заметнее, увереннее и охотнее покажете себя. Выделяются романтика и творческие проекты.',
      'Асцендент Солнечного Возврата в Деве: год организации, здоровья и совершенствования. В центре рутина, детали и служение. Хорошо завершать накопившиеся дела, избегая чрезмерной самокритики.',
      'Асцендент Солнечного Возврата в Весах: год отношений, партнёрства и равновесия. Возникнут важные решения об обязательствах. Ищите гармонию, не отказываясь от себя ради других.',
      'Асцендент Солнечного Возврата в Скорпионе: интенсивный год глубокой трансформации. Власть, близость, символическая смерть и возрождение выходят на первый план. Ничто не останется поверхностным.',
      'Асцендент Солнечного Возврата в Стрельце: год расширения, путешествий, учёбы и поиска смысла. Растут оптимизм и стремление к свободе. Исследуйте новые философские или географические направления.',
      'Асцендент Солнечного Возврата в Козероге: год тяжёлой работы, амбиций и создания наследия. Карьера в центре. Ответственность растёт, но построенное сейчас будет долговечным.',
      'Асцендент Солнечного Возврата в Водолее: год инноваций, дружбы и коллективных целей. Важны свобода и оригинальность. Возможен разрыв с условностями; выделяются технологии и будущее.',
      'Асцендент Солнечного Возврата в Рыбах: год внутренней работы, духовности и повышенной чувствительности. Интуиция обостряется. Благоприятны искусство и исцеление; следите за бегством и размытыми границами.',
    ],
  },
  tr: {
    year: 'Yıl', returnDate: 'Güneş Dönüşü: {date}', selectProfile: 'Güneş Dönüşünü hesaplamak için bir profil seçin',
    chartTitle: '{year} Güneş Dönüşü — {name}', interpretationTitle: 'Yorum — {year} Güneş Dönüşü',
    interpretationDescription: 'Güneş Dönüşü, Güneş’in doğum konumuna tam döndüğü anın haritasıdır; bir doğum gününden sonrakine kadar yılın tonunu belirler.',
    yearTheme: 'Yılın Teması', mainFocus: 'Ana Odak', emotionalNeed: 'Duygusal İhtiyaç',
    ascendantTitle: 'Güneş Dönüşü Yükseleni {sign}', sunTitle: '☉ Güneş {house}. Evde', moonTitle: '☽ Ay {sign}, {house}. Ev',
    ctaTitle: '✨ Ay ay eksiksiz öngörüyü ister misiniz?', ctaDescription: 'Yıllık Öngörü Raporu profeksiyon, ayrıntılı transitler, tutulmalar ve üç aylık eğilimleri içerir.',
    ascInterpretations: [
      'Güneş Dönüşü Yükseleni Koç: yeni başlangıçlar, kişisel girişim ve cesaret yılı. Liderlik etmek, projeler başlatmak ve kendinizi önceliklendirmek isteyeceksiniz. Enerji yüksek, ancak sabırsız olabilir.',
      'Güneş Dönüşü Yükseleni Boğa: istikrar, keyif ve maddi yapı kurma yılı. Tempo yavaşlar; finansal güvenlik ve konfor öne çıkar. Somut sonuçlar sabır ister.',
      'Güneş Dönüşü Yükseleni İkizler: yoğun iletişim, öğrenme ve bağlantılar yılı. Zihinsel hareket, kısa yolculuklar ve yeni kişiler artar. Çok yönlülük belirleyicidir; dağılmamaya dikkat edin.',
      'Güneş Dönüşü Yükseleni Yengeç: ev, aile ve duygusal yaşama odaklı bir yıl. Kök salma ve yakın bağları besleme ihtiyacı vardır. Ev değişiklikleri veya hamilelik mümkün olabilir.',
      'Güneş Dönüşü Yükseleni Aslan: kişisel parlaklık, yaratıcılık ve ifade yılı. Daha görünür, özgüvenli ve kendinizi göstermeye açık olursunuz. Romantizm ve yaratıcı projeler öne çıkar.',
      'Güneş Dönüşü Yükseleni Başak: düzen, sağlık ve gelişim yılı. Rutinler, ayrıntılar ve hizmet odaktadır. Bekleyen işleri çözmek için iyidir; aşırı öz eleştiriden kaçının.',
      'Güneş Dönüşü Yükseleni Terazi: ilişkiler, ortaklıklar ve denge yılı. Taahhütlerle ilgili önemli kararlar doğar. Başkalarını memnun etmek için kendinizden vazgeçmeden uyum arayın.',
      'Güneş Dönüşü Yükseleni Akrep: derin dönüşümün yoğun yılı. Güç, yakınlık, sembolik ölüm ve yeniden doğuş öne çıkar. Hiçbir şey yüzeyde kalmaz.',
      'Güneş Dönüşü Yükseleni Yay: genişleme, seyahat, eğitim ve anlam arayışı yılı. İyimserlik ve özgürlük isteği büyür. Yeni felsefi veya coğrafi yönleri keşfedin.',
      'Güneş Dönüşü Yükseleni Oğlak: sıkı çalışma, hırs ve kalıcı yapı kurma yılı. Kariyer merkezde. Sorumluluklar artar, fakat şimdi kurduklarınız uzun ömürlü olabilir.',
      'Güneş Dönüşü Yükseleni Kova: yenilik, arkadaşlıklar ve kolektif amaçlar yılı. Özgürlük ve özgünlük önemlidir. Geleneklerden kopuş olabilir; teknoloji ve gelecek öne çıkar.',
      'Güneş Dönüşü Yükseleni Balık: içe dönüş, maneviyat ve artan hassasiyet yılı. Sezgi keskinleşir. Sanat ve şifa desteklenir; kaçışa ve belirsiz sınırlara dikkat edin.',
    ],
  },
  nl: {
    year: 'Jaar', returnDate: 'Zonneretour: {date}', selectProfile: 'Selecteer een profiel om de Zonneretour te berekenen',
    chartTitle: 'Zonneretour {year} — {name}', interpretationTitle: 'Duiding — Zonneretour {year}',
    interpretationDescription: 'De Zonneretour is de horoscoop van het exacte moment waarop de Zon terugkeert naar haar geboortepositie — hij bepaalt de toon van verjaardag tot verjaardag.',
    yearTheme: 'Jaarthema', mainFocus: 'Hoofdfocus', emotionalNeed: 'Emotionele Behoefte',
    ascendantTitle: 'Zonneretour-Ascendant in {sign}', sunTitle: '☉ Zon in Huis {house}', moonTitle: '☽ Maan in {sign}, Huis {house}',
    ctaTitle: '✨ Wil je de volledige maandelijkse voorspelling?', ctaDescription: 'Het Jaarprognoserapport bevat profectie, gedetailleerde transits, eclipsen en kwartaaltrends.',
    ascInterpretations: [
      'Zonneretour-Ascendant in Ram: een jaar van een nieuw begin, persoonlijk initiatief en moed. Je wilt leiden, projecten starten en jezelf vooropstellen. De energie is hoog maar ongeduldig.',
      'Zonneretour-Ascendant in Stier: een jaar van stabilisatie, plezier en materiële opbouw. Het tempo ligt lager, met financiële zekerheid en comfort centraal. Concrete resultaten vragen geduld.',
      'Zonneretour-Ascendant in Tweelingen: een jaar van intensieve communicatie, leren en verbindingen. Veel mentale activiteit, korte reizen en nieuwe contacten. Veelzijdigheid voert de toon; voorkom versnippering.',
      'Zonneretour-Ascendant in Kreeft: een jaar rond huis, familie en gevoelsleven. Je wilt wortels vormen en hechte banden voeden. Veranderingen thuis of een zwangerschap zijn mogelijk.',
      'Zonneretour-Ascendant in Leeuw: een jaar van persoonlijke uitstraling, creativiteit en expressie. Je bent zichtbaarder, zelfverzekerder en bereid jezelf te tonen. Romantiek en creatieve projecten vallen op.',
      'Zonneretour-Ascendant in Maagd: een jaar van organisatie, gezondheid en verbetering. Routines, details en dienstbaarheid staan centraal. Goed om achterstallige zaken op te lossen; vermijd overdreven zelfkritiek.',
      'Zonneretour-Ascendant in Weegschaal: een jaar voor relaties, partnerschappen en balans. Belangrijke beslissingen over verbintenissen ontstaan. Zoek harmonie zonder jezelf weg te cijferen.',
      'Zonneretour-Ascendant in Schorpioen: een intens jaar van diepe transformatie. Macht, intimiteit, symbolische dood en wedergeboorte komen naar voren. Niets blijft oppervlakkig.',
      'Zonneretour-Ascendant in Boogschutter: een jaar van groei, reizen, studie en zingeving. Optimisme en vrijheidsdrang nemen toe. Verken nieuwe filosofische of geografische richtingen.',
      'Zonneretour-Ascendant in Steenbok: een jaar van hard werken, ambitie en iets blijvends opbouwen. Carrière staat centraal. Verantwoordelijkheden groeien, maar wat je nu bouwt kan standhouden.',
      'Zonneretour-Ascendant in Waterman: een jaar van innovatie, vriendschappen en collectieve doelen. Vrijheid en originaliteit tellen. Breuken met conventies zijn mogelijk; technologie en toekomst vallen op.',
      'Zonneretour-Ascendant in Vissen: een jaar van introspectie, spiritualiteit en grotere gevoeligheid. De intuïtie wordt scherper. Kunst en genezing worden gesteund; let op vluchtgedrag en vage grenzen.',
    ],
  },
};

const portugueseSunHouse: TwelveStrings = [
  'Sol de RS na Casa 1: o foco do ano é VOCÊ — identidade, aparência, novos começos pessoais. Ano de protagonismo.',
  'Sol de RS na Casa 2: o foco do ano é dinheiro, valores e autoestima. Construção de segurança material.',
  'Sol de RS na Casa 3: o foco do ano é comunicação, aprendizado, irmãos e vizinhança. Muita movimentação mental.',
  'Sol de RS na Casa 4: o foco do ano é lar, família e raízes emocionais. Possível mudança de casa ou reestruturação familiar.',
  'Sol de RS na Casa 5: o foco do ano é criatividade, romance, filhos e prazer. Ano de expressão e diversão.',
  'Sol de RS na Casa 6: o foco do ano é trabalho, saúde e rotina. Reorganização do dia-a-dia e cuidado com o corpo.',
  'Sol de RS na Casa 7: o foco do ano é relacionamentos e parcerias. Casamento, sociedade ou compromissos importantes.',
  'Sol de RS na Casa 8: o foco do ano é transformação, recursos compartilhados e intimidade. Ano de renascimento psicológico.',
  'Sol de RS na Casa 9: o foco do ano é expansão — viagens, estudos superiores, filosofia de vida. Novos horizontes.',
  'Sol de RS na Casa 10: o foco do ano é carreira, vocação e reputação. Conquistas profissionais e reconhecimento público.',
  'Sol de RS na Casa 11: o foco do ano é amizades, grupos e projetos futuros. Networking e causas coletivas.',
  'Sol de RS na Casa 12: o foco do ano é interiorização, espiritualidade e processamento de ciclos. Retiro e reflexão.',
];

const portugueseMoonHouse: TwelveStrings = [
  'Lua de RS na Casa 1: necessidades emocionais em primeiro plano. Ano reativo, com muita oscilação de humor. Cuidar de si é prioridade.',
  'Lua de RS na Casa 2: segurança emocional ligada ao dinheiro e conforto. Pode haver flutuações financeiras que refletem estados emocionais.',
  'Lua de RS na Casa 3: emoções se processam pela conversa e escrita. Muito contato com irmãos/vizinhos. Comunicação emocional intensa.',
  'Lua de RS na Casa 4: ano muito doméstico — lar e família são o centro emocional. Possível mudança de casa ou intensificação da vida familiar.',
  'Lua de RS na Casa 5: ano de romance, paixão e criatividade emocional. Relação com filhos em destaque. Prazer como nutrição.',
  'Lua de RS na Casa 6: emoções impactam diretamente a saúde. Rotina precisa incluir autocuidado. Ambiente de trabalho emocionalmente carregado.',
  'Lua de RS na Casa 7: necessidade emocional de parceria. Relacionamento é fonte de nutrição (ou de drenagem, se não saudável).',
  'Lua de RS na Casa 8: emoções profundas e intensas o ano todo. Possíveis crises que levam a transformação emocional. Nada fica superficial.',
  'Lua de RS na Casa 9: necessidade de expansão emocional — viagens, estudos ou novas perspectivas nutrem a alma.',
  'Lua de RS na Casa 10: vida pública e carreira emocionalmente carregadas. O que você sente fica visível. Mãe pode ter papel profissional.',
  'Lua de RS na Casa 11: emoções se processam em grupo. Amizades são fonte de nutrição. Conexão com causas maiores traz conforto.',
  'Lua de RS na Casa 12: ano de muita vida interior. Emoções processadas em solidão. Sonhos intensos. Necessidade de retiro periódico.',
];

export function getSolarReturnText(locale: Locale): SolarReturnText {
  return texts[locale] || texts.pt;
}

export function getSolarReturnSunHouse(locale: Locale, house: number): string {
  return locale === 'pt' ? portugueseSunHouse[house - 1] : getInterpretations(locale).SUN_IN_HOUSE[house - 1];
}

export function getSolarReturnMoonHouse(locale: Locale, house: number): string {
  return locale === 'pt' ? portugueseMoonHouse[house - 1] : getInterpretations(locale).MOON_IN_HOUSE[house - 1];
}

export function formatSolarReturnText(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce((result, [key, value]) => result.replaceAll(`{${key}}`, String(value)), template);
}
