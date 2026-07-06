import { createSignal, onMount, For, Show } from 'solid-js';
import { db } from '../../store/db';
import { getTranslations, localePath, type Locale } from '../../i18n';

interface Props {
  locale?: Locale;
}

interface Product {
  id: string;
  icon: string;
  category: 'personality' | 'forecast' | 'relationship' | 'career';
  price: number;
  currency: string;
  pages: Record<string, string>;
  name: Record<string, string>;
  description: Record<string, string>;
  features: Record<string, string[]>;
}

const PRODUCTS: Product[] = [
  {
    id: 'natal-completo', icon: '☉', category: 'personality', price: 29.90, currency: 'BRL',
    pages: { pt: '20-30 páginas', en: '20-30 pages', es: '20-30 páginas', fr: '20-30 pages', de: '20-30 Seiten', it: '20-30 pagine', nl: "20-30 pagina's", tr: '20-30 sayfa', ru: '20-30 страниц', zh: '20-30页', ja: '20-30ページ' },
    name: { pt: 'Mapa Natal Completo', en: 'Complete Natal Report', es: 'Carta Natal Completa', fr: 'Rapport Natal Complet', de: 'Vollständiger Geburtsbericht', it: 'Report Natale Completo', nl: 'Volledig Geboorterapport', tr: 'Tam Doğum Raporu', ru: 'Полный Натальный Отчёт', zh: '完整本命报告', ja: '完全ネイタルレポート' },
    description: { pt: 'Análise profunda de todas as posições, aspectos, dignidades e casas do seu mapa natal.', en: 'In-depth analysis of all positions, aspects, dignities and houses in your natal chart.', es: 'Análisis profundo de todas las posiciones, aspectos y casas de tu carta natal.', fr: 'Analyse approfondie de toutes les positions, aspects et maisons de votre carte natale.', de: 'Tiefgehende Analyse aller Positionen, Aspekte und Häuser in Ihrem Geburtshoroskop.', it: 'Analisi approfondita di tutte le posizioni, aspetti e case della tua carta natale.', nl: 'Diepgaande analyse van alle posities, aspecten en huizen in uw geboortekaart.', tr: 'Doğum haritanızdaki tüm konum, açı ve evlerin derinlemesine analizi.', ru: 'Глубокий анализ всех позиций, аспектов и домов вашей натальной карты.', zh: '深度分析本命盘中所有行星位置、相位和宫位。', ja: 'ネイタルチャートの全惑星位置、アスペクト、ハウスの詳細分析。' },
    features: { pt: ['Todos os planetas em signos e casas', 'Aspectos com interpretação detalhada', 'Dignidades e debilidades', 'Síntese da personalidade', 'Mapa visual em alta resolução'], en: ['All planets in signs and houses', 'Aspects with detailed interpretation', 'Dignities and debilities', 'Personality synthesis', 'High-resolution visual chart'], es: ['Todos los planetas en signos y casas', 'Aspectos con interpretación detallada', 'Dignidades y debilidades', 'Síntesis de personalidad', 'Gráfico visual de alta resolución'], fr: ['Toutes les planètes en signes et maisons', 'Aspects avec interprétation détaillée', 'Dignités et débilités', 'Synthèse de la personnalité', 'Graphique visuel haute résolution'], de: ['Alle Planeten in Zeichen und Häusern', 'Aspekte mit detaillierter Interpretation', 'Würden und Schwächen', 'Persönlichkeitssynthese', 'Hochauflösendes Sternbild'], it: ['Tutti i pianeti in segni e case', 'Aspetti con interpretazione dettagliata', 'Dignità e debolezze', 'Sintesi della personalità', 'Grafico visivo ad alta risoluzione'], nl: ['Alle planeten in tekens en huizen', 'Aspecten met gedetailleerde interpretatie', 'Waardigheden en zwakheden', 'Persoonlijkheidssynthese', 'Visuele kaart hoge resolutie'], tr: ['Tüm gezegenler burçlarda ve evlerde', 'Ayrıntılı yorumlu açılar', 'Onurlar ve zayıflıklar', 'Kişilik sentezi', 'Yüksek çözünürlüklü görsel harita'], ru: ['Все планеты в знаках и домах', 'Аспекты с подробной интерпретацией', 'Достоинства и слабости', 'Синтез личности', 'Визуальная карта высокого разрешения'], zh: ['所有行星在星座和宫位中', '带详细解释的相位', '尊贵与入弱', '个性综合', '高分辨率视觉星盘'], ja: ['全惑星のサインとハウス配置', '詳細解釈付きアスペクト', '尊貴と弱体', '個性の統合', '高解像度ビジュアルチャート'] },
  },
  {
    id: 'relacionamento', icon: '♡', category: 'relationship', price: 39.90, currency: 'BRL',
    pages: { pt: '25-35 páginas', en: '25-35 pages', es: '25-35 páginas', fr: '25-35 pages', de: '25-35 Seiten', it: '25-35 pagine', nl: "25-35 pagina's", tr: '25-35 sayfa', ru: '25-35 страниц', zh: '25-35页', ja: '25-35ページ' },
    name: { pt: 'Relatório de Relacionamento', en: 'Relationship Report', es: 'Informe de Relación', fr: 'Rapport de Relation', de: 'Beziehungsbericht', it: 'Report di Relazione', nl: 'Relatierapport', tr: 'İlişki Raporu', ru: 'Отчёт об Отношениях', zh: '关系报告', ja: '関係性レポート' },
    description: { pt: 'Análise completa da sinastria e mapa composto entre duas pessoas.', en: 'Complete synastry and composite analysis between two people.', es: 'Análisis completo de sinastría y carta compuesta entre dos personas.', fr: 'Analyse complète de synastrie et composite entre deux personnes.', de: 'Vollständige Synastrie- und Komposit-Analyse zwischen zwei Personen.', it: 'Analisi completa di sinastria e composito tra due persone.', nl: 'Volledige synastrie- en composietanalyse tussen twee personen.', tr: 'İki kişi arasında tam sinastri ve kompozit analizi.', ru: 'Полный анализ синастрии и композита между двумя людьми.', zh: '两人之间的完整合盘和组合盘分析。', ja: '二人の間のシナストリーとコンポジットの完全分析。' },
    features: { pt: ['Sinastria completa (planeta × planeta)', 'Mapa Composto com interpretação', 'Pontos de atração e tensão', 'Compatibilidade por área de vida', 'Conselhos para o relacionamento'], en: ['Complete synastry (planet × planet)', 'Composite chart with interpretation', 'Attraction and tension points', 'Compatibility by life area', 'Relationship advice'], es: ['Sinastría completa (planeta × planeta)', 'Carta compuesta con interpretación', 'Puntos de atracción y tensión', 'Compatibilidad por área de vida', 'Consejos para la relación'], fr: ['Synastrie complète (planète × planète)', 'Carte composite avec interprétation', 'Points d\'attraction et de tension', 'Compatibilité par domaine de vie', 'Conseils relationnels'], de: ['Vollständige Synastrie (Planet × Planet)', 'Komposit-Karte mit Interpretation', 'Anziehungs- und Spannungspunkte', 'Kompatibilität nach Lebensbereich', 'Beziehungsratschläge'], it: ['Sinastria completa (pianeta × pianeta)', 'Carta composita con interpretazione', 'Punti di attrazione e tensione', 'Compatibilità per area di vita', 'Consigli per la relazione'], nl: ['Volledige synastrie (planeet × planeet)', 'Composietkaart met interpretatie', 'Aantrekkings- en spanningspunten', 'Compatibiliteit per levensgebied', 'Relatieadvies'], tr: ['Tam sinastri (gezegen × gezegen)', 'Yorumlu kompozit harita', 'Çekim ve gerilim noktaları', 'Yaşam alanına göre uyumluluk', 'İlişki tavsiyeleri'], ru: ['Полная синастрия (планета × планета)', 'Композитная карта с интерпретацией', 'Точки притяжения и напряжения', 'Совместимость по сферам жизни', 'Советы по отношениям'], zh: ['完整合盘（行星×行星）', '带解释的组合盘', '吸引与张力点', '各生活领域的相容性', '关系建议'], ja: ['完全シナストリー（惑星×惑星）', '解釈付きコンポジットチャート', '引き合いと緊張のポイント', '人生領域別の相性', '関係へのアドバイス'] },
  },
  {
    id: 'previsao-anual', icon: '↻', category: 'forecast', price: 34.90, currency: 'BRL',
    pages: { pt: '30-40 páginas', en: '30-40 pages', es: '30-40 páginas', fr: '30-40 pages', de: '30-40 Seiten', it: '30-40 pagine', nl: "30-40 pagina's", tr: '30-40 sayfa', ru: '30-40 страниц', zh: '30-40页', ja: '30-40ページ' },
    name: { pt: 'Previsão Anual', en: 'Annual Forecast', es: 'Previsión Anual', fr: 'Prévision Annuelle', de: 'Jahresvorschau', it: 'Previsione Annuale', nl: 'Jaarvoorspelling', tr: 'Yıllık Öngörü', ru: 'Годовой Прогноз', zh: '年度预测', ja: '年間予測' },
    description: { pt: 'Trânsitos, profecção e revolução solar combinados para os próximos 12 meses.', en: 'Transits, profection and solar return combined for the next 12 months.', es: 'Tránsitos, profección y revolución solar combinados para los próximos 12 meses.', fr: 'Transits, profection et révolution solaire combinés pour les 12 prochains mois.', de: 'Transite, Profektionen und Solarrückkehr kombiniert für die nächsten 12 Monate.', it: 'Transiti, profezione e rivoluzione solare combinati per i prossimi 12 mesi.', nl: 'Transits, profectie en zonneretour gecombineerd voor de komende 12 maanden.', tr: 'Önümüzdeki 12 ay için transitler, profeksiyon ve güneş dönüşü.', ru: 'Транзиты, профекция и солнечный возврат на следующие 12 месяцев.', zh: '未来12个月的行运、小限和太阳回归综合预测。', ja: '今後12ヶ月のトランジット、プロフェクション、ソーラーリターン。' },
    features: { pt: ['Revolução Solar do ano', 'Trânsitos mês a mês', 'Profecção anual', 'Eclipses pessoais', 'Períodos favoráveis e desafiadores'], en: ['Solar Return of the year', 'Month-by-month transits', 'Annual profection', 'Personal eclipses', 'Favorable and challenging periods'], es: ['Revolución Solar del año', 'Tránsitos mes a mes', 'Profección anual', 'Eclipses personales', 'Períodos favorables y desafiantes'], fr: ['Révolution solaire de l\'année', 'Transits mois par mois', 'Profection annuelle', 'Éclipses personnelles', 'Périodes favorables et difficiles'], de: ['Solarrückkehr des Jahres', 'Monatliche Transite', 'Jährliche Profektion', 'Persönliche Finsternisse', 'Günstige und herausfordernde Perioden'], it: ['Rivoluzione solare dell\'anno', 'Transiti mese per mese', 'Profezione annuale', 'Eclissi personali', 'Periodi favorevoli e difficili'], nl: ['Zonneretour van het jaar', 'Maand-voor-maand transits', 'Jaarlijkse profectie', 'Persoonlijke eclipsen', 'Gunstige en uitdagende periodes'], tr: ['Yılın güneş dönüşü', 'Ay ay transitler', 'Yıllık profeksiyon', 'Kişisel tutulmalar', 'Olumlu ve zorlu dönemler'], ru: ['Солнечный возврат года', 'Транзиты месяц за месяцем', 'Годовая профекция', 'Личные затмения', 'Благоприятные и сложные периоды'], zh: ['当年太阳回归', '逐月行运', '年度小限', '个人日月食', '有利和挑战性时期'], ja: ['今年のソーラーリターン', '月ごとのトランジット', '年間プロフェクション', '個人の日食・月食', '有利な時期と困難な時期'] },
  },
  {
    id: 'carreira', icon: '♄', category: 'career', price: 29.90, currency: 'BRL',
    pages: { pt: '15-20 páginas', en: '15-20 pages', es: '15-20 páginas', fr: '15-20 pages', de: '15-20 Seiten', it: '15-20 pagine', nl: "15-20 pagina's", tr: '15-20 sayfa', ru: '15-20 страниц', zh: '15-20页', ja: '15-20ページ' },
    name: { pt: 'Carreira e Vocação', en: 'Career & Vocation', es: 'Carrera y Vocación', fr: 'Carrière et Vocation', de: 'Karriere und Berufung', it: 'Carriera e Vocazione', nl: 'Carrière en Roeping', tr: 'Kariyer ve Meslek', ru: 'Карьера и Призвание', zh: '事业与天职', ja: 'キャリアと天職' },
    description: { pt: 'Análise do potencial profissional baseada no MC, Casa 10, Saturno e Júpiter.', en: 'Professional potential analysis based on MC, 10th House, Saturn and Jupiter.', es: 'Análisis del potencial profesional basado en MC, Casa 10, Saturno y Júpiter.', fr: 'Analyse du potentiel professionnel basée sur MC, Maison 10, Saturne et Jupiter.', de: 'Berufsanalyse basierend auf MC, 10. Haus, Saturn und Jupiter.', it: 'Analisi del potenziale professionale basata su MC, Casa 10, Saturno e Giove.', nl: 'Professionele potentieelanalyse op basis van MC, 10e Huis, Saturnus en Jupiter.', tr: 'MC, 10. Ev, Satürn ve Jüpiter bazlı profesyonel potansiyel analizi.', ru: 'Анализ профессионального потенциала на основе MC, 10 Дома, Сатурна и Юпитера.', zh: '基于天顶、第十宫、土星和木星的职业潜力分析。', ja: 'MC、10ハウス、土星、木星に基づく職業的可能性の分析。' },
    features: { pt: ['MC e Casa 10 — vocação', 'Saturno — disciplina e conquista', 'Júpiter — expansão e oportunidades', 'Casa 6 — rotina de trabalho', 'Timing de mudanças de carreira'], en: ['MC and 10th House — vocation', 'Saturn — discipline and achievement', 'Jupiter — expansion and opportunities', '6th House — work routine', 'Career change timing'], es: ['MC y Casa 10 — vocación', 'Saturno — disciplina y logro', 'Júpiter — expansión y oportunidades', 'Casa 6 — rutina de trabajo', 'Timing de cambios de carrera'], fr: ['MC et Maison 10 — vocation', 'Saturne — discipline et accomplissement', 'Jupiter — expansion et opportunités', 'Maison 6 — routine de travail', 'Timing des changements de carrière'], de: ['MC und 10. Haus — Berufung', 'Saturn — Disziplin und Leistung', 'Jupiter — Expansion und Chancen', '6. Haus — Arbeitsroutine', 'Timing für Karriereveränderungen'], it: ['MC e Casa 10 — vocazione', 'Saturno — disciplina e successo', 'Giove — espansione e opportunità', 'Casa 6 — routine lavorativa', 'Timing dei cambiamenti di carriera'], nl: ['MC en 10e Huis — roeping', 'Saturnus — discipline en prestatie', 'Jupiter — expansie en kansen', '6e Huis — werkroutine', 'Timing van carrièrewisselingen'], tr: ['MC ve 10. Ev — meslek', 'Satürn — disiplin ve başarı', 'Jüpiter — genişleme ve fırsatlar', '6. Ev — çalışma rutini', 'Kariyer değişim zamanlaması'], ru: ['MC и 10-й Дом — призвание', 'Сатурн — дисциплина и достижения', 'Юпитер — расширение и возможности', '6-й Дом — рабочий распорядок', 'Тайминг смены карьеры'], zh: ['天顶和第十宫——职业', '土星——纪律与成就', '木星——扩展与机遇', '第六宫——工作日常', '职业转换时机'], ja: ['MCと10ハウス――天職', '土星――規律と達成', '木星――拡張とチャンス', '6ハウス――仕事のルーティン', 'キャリアチェンジのタイミング'] },
  },
  {
    id: 'psicologico', icon: '♇', category: 'personality', price: 39.90, currency: 'BRL',
    pages: { pt: '25-35 páginas', en: '25-35 pages', es: '25-35 páginas', fr: '25-35 pages', de: '25-35 Seiten', it: '25-35 pagine', nl: "25-35 pagina's", tr: '25-35 sayfa', ru: '25-35 страниц', zh: '25-35页', ja: '25-35ページ' },
    name: { pt: 'Análise Psicológica Profunda', en: 'Deep Psychological Analysis', es: 'Análisis Psicológico Profundo', fr: 'Analyse Psychologique Profonde', de: 'Tiefenpsychologische Analyse', it: 'Analisi Psicologica Profonda', nl: 'Diepte Psychologische Analyse', tr: 'Derin Psikolojik Analiz', ru: 'Глубокий Психологический Анализ', zh: '深度心理分析', ja: '深層心理分析' },
    description: { pt: 'Exploração detalhada da psique baseada no mapa natal — padrões inconscientes e potenciais.', en: 'Detailed exploration of the psyche based on the natal chart — unconscious patterns and potentials.', es: 'Exploración detallada de la psique basada en la carta natal — patrones inconscientes.', fr: 'Exploration détaillée de la psyché — schémas inconscients et potentiels.', de: 'Detaillierte Erforschung der Psyche — unbewusste Muster und Potenziale.', it: 'Esplorazione dettagliata della psiche — modelli inconsci e potenziali.', nl: 'Gedetailleerde verkenning van de psyche — onbewuste patronen en potenties.', tr: 'Natal haritaya dayalı detaylı psişe keşfi — bilinçdışı kalıplar.', ru: 'Детальное исследование психики — бессознательные паттерны и потенциалы.', zh: '基于本命盘的心理深度探索——潜意识模式与潜能。', ja: 'ネイタルチャートに基づく心理の詳細な探求——無意識のパターンと可能性。' },
    features: { pt: ['Lua — mundo emocional e infância', 'Plutão — poder e transformação', 'Quíron — ferida e cura', 'Casa 12 — inconsciente', 'Padrões kármicos (Nodos)'], en: ['Moon — emotional world and childhood', 'Pluto — power and transformation', 'Chiron — wound and healing', '12th House — unconscious', 'Karmic patterns (Nodes)'], es: ['Luna — mundo emocional e infancia', 'Plutón — poder y transformación', 'Quirón — herida y sanación', 'Casa 12 — inconsciente', 'Patrones kármicos (Nodos)'], fr: ['Lune — monde émotionnel et enfance', 'Pluton — pouvoir et transformation', 'Chiron — blessure et guérison', 'Maison 12 — inconscient', 'Schémas karmiques (Nœuds)'], de: ['Mond — emotionale Welt und Kindheit', 'Pluto — Macht und Transformation', 'Chiron — Wunde und Heilung', '12. Haus — Unterbewusstsein', 'Karmische Muster (Mondknoten)'], it: ['Luna — mondo emotivo e infanzia', 'Plutone — potere e trasformazione', 'Chirone — ferita e guarigione', 'Casa 12 — inconscio', 'Schemi karmici (Nodi)'], nl: ['Maan — emotionele wereld en kindertijd', 'Pluto — macht en transformatie', 'Chiron — wond en genezing', '12e Huis — onbewuste', 'Karmische patronen (Knopen)'], tr: ['Ay — duygusal dünya ve çocukluk', 'Plüton — güç ve dönüşüm', 'Kiron — yara ve iyileşme', '12. Ev — bilinçdışı', 'Karmik kalıplar (Düğümler)'], ru: ['Луна — эмоциональный мир и детство', 'Плутон — власть и трансформация', 'Хирон — рана и исцеление', '12-й Дом — бессознательное', 'Кармические паттерны (Узлы)'], zh: ['月亮——情感世界与童年', '冥王星——力量与转化', '凯龙——伤痛与疗愈', '第12宫——潜意识', '业力模式（月交点）'], ja: ['月——感情の世界と幼少期', '冥王星——力と変容', 'キロン——傷と癒し', '12ハウス——無意識', 'カルマのパターン（ノード）'] },
  },
  {
    id: 'seven-sins', icon: '🔥', category: 'personality', price: 19.90, currency: 'BRL',
    pages: { pt: '15-20 páginas', en: '15-20 pages', es: '15-20 páginas', fr: '15-20 pages', de: '15-20 Seiten', it: '15-20 pagine', nl: "15-20 pagina's", tr: '15-20 sayfa', ru: '15-20 страниц', zh: '15-20页', ja: '15-20ページ' },
    name: { pt: 'Os Sete Pecados', en: 'The Seven Sins', es: 'Los Siete Pecados', fr: 'Les Sept Péchés', de: 'Die Sieben Sünden', it: 'I Sette Peccati', nl: 'De Zeven Zonden', tr: 'Yedi Günah', ru: 'Семь Грехов', zh: '七宗罪', ja: '七つの大罪' },
    description: { pt: 'A sombra lúdica do zodíaco — seus 7 pecados astrológicos com humor e profundidade.', en: 'The playful shadow of the zodiac — your 7 astrological sins with humor and depth.', es: 'La sombra lúdica del zodíaco — tus 7 pecados astrológicos.', fr: 'L\'ombre ludique du zodiaque — vos 7 péchés astrologiques.', de: 'Der spielerische Schatten des Tierkreises — Ihre 7 astrologischen Sünden.', it: 'L\'ombra ludica dello zodiaco — i tuoi 7 peccati astrologici.', nl: 'De speelse schaduw van de dierenriem — uw 7 astrologische zonden.', tr: 'Burcun eğlenceli gölgesi — 7 astrolojik günahınız.', ru: 'Игривая тень зодиака — ваши 7 астрологических грехов.', zh: '黄道的趣味阴影面——您的7个占星学罪行。', ja: '黄道の遊び心ある影——あなたの7つの占星術的罪。' },
    features: { pt: ['Orgulho (Sol)', 'Luxúria (Vênus/Marte)', 'Avareza (Saturno)', 'Gula (Júpiter)', 'Ira (Marte)', 'Inveja (Plutão)', 'Preguiça (Netuno)'], en: ['Pride (Sun)', 'Lust (Venus/Mars)', 'Greed (Saturn)', 'Gluttony (Jupiter)', 'Wrath (Mars)', 'Envy (Pluto)', 'Sloth (Neptune)'], es: ['Soberbia (Sol)', 'Lujuria (Venus/Marte)', 'Avaricia (Saturno)', 'Gula (Júpiter)', 'Ira (Marte)', 'Envidia (Plutón)', 'Pereza (Neptuno)'], fr: ['Orgueil (Soleil)', 'Luxure (Vénus/Mars)', 'Avarice (Saturne)', 'Gourmandise (Jupiter)', 'Colère (Mars)', 'Envie (Pluton)', 'Paresse (Neptune)'], de: ['Stolz (Sonne)', 'Wollust (Venus/Mars)', 'Gier (Saturn)', 'Völlerei (Jupiter)', 'Zorn (Mars)', 'Neid (Pluto)', 'Faulheit (Neptun)'], it: ['Superbia (Sole)', 'Lussuria (Venere/Marte)', 'Avarizia (Saturno)', 'Gola (Giove)', 'Ira (Marte)', 'Invidia (Plutone)', 'Accidia (Nettuno)'], nl: ['Trots (Zon)', 'Wellust (Venus/Mars)', 'Hebzucht (Saturnus)', 'Gulzigheid (Jupiter)', 'Woede (Mars)', 'Jaloezie (Pluto)', 'Luiheid (Neptunus)'], tr: ['Kibir (Güneş)', 'Şehvet (Venüs/Mars)', 'Açgözlülük (Satürn)', 'Oburluk (Jüpiter)', 'Öfke (Mars)', 'Kıskançlık (Plüton)', 'Tembellik (Neptün)'], ru: ['Гордыня (Солнце)', 'Похоть (Венера/Марс)', 'Жадность (Сатурн)', 'Чревоугодие (Юпитер)', 'Гнев (Марс)', 'Зависть (Плутон)', 'Лень (Нептун)'], zh: ['傲慢（太阳）', '色欲（金星/火星）', '贪婪（土星）', '暴食（木星）', '愤怒（火星）', '嫉妒（冥王星）', '懒惰（海王星）'], ja: ['傲慢（太陽）', '色欲（金星/火星）', '強欲（土星）', '暴食（木星）', '憤怒（火星）', '嫉妬（冥王星）', '怠惰（海王星）'] },
  },
  {
    id: 'financeiro', icon: '💰', category: 'career', price: 29.90, currency: 'BRL',
    pages: { pt: '12-15 páginas', en: '12-15 pages', es: '12-15 páginas', fr: '12-15 pages', de: '12-15 Seiten', it: '12-15 pagine', nl: "12-15 pagina's", tr: '12-15 sayfa', ru: '12-15 страниц', zh: '12-15页', ja: '12-15ページ' },
    name: { pt: 'Mapa Financeiro', en: 'Financial Map', es: 'Mapa Financiero', fr: 'Carte Financière', de: 'Finanzielle Karte', it: 'Mappa Finanziaria', nl: 'Financiële Kaart', tr: 'Finansal Harita', ru: 'Финансовая Карта', zh: '财富星图', ja: 'ファイナンシャルマップ' },
    description: { pt: 'Análise do potencial financeiro: Casa 2/8, Vênus, Júpiter e Saturno.', en: 'Financial potential analysis: Houses 2/8, Venus, Jupiter and Saturn.', es: 'Análisis del potencial financiero: Casas 2/8, Venus, Júpiter y Saturno.', fr: 'Analyse du potentiel financier: Maisons 2/8, Vénus, Jupiter et Saturne.', de: 'Finanzpotenzialanalyse: Häuser 2/8, Venus, Jupiter und Saturn.', it: 'Analisi del potenziale finanziario: Case 2/8, Venere, Giove e Saturno.', nl: 'Financieel potentieelanalyse: Huizen 2/8, Venus, Jupiter en Saturnus.', tr: '2/8. Ev, Venüs, Jüpiter ve Satürn bazlı finansal potansiyel analizi.', ru: 'Анализ финансового потенциала: Дома 2/8, Венера, Юпитер и Сатурн.', zh: '基于第2/8宫、金星、木星和土星的财务潜力分析。', ja: '2/8ハウス、金星、木星、土星に基づく財務的可能性の分析。' },
    features: { pt: ['Casa 2 — recursos e talentos monetizáveis', 'Casa 8 — investimentos e recursos compartilhados', 'Vênus — o que você atrai', 'Júpiter — onde a abundância flui', 'Saturno — disciplina que constrói riqueza'], en: ['House 2 — monetizable resources and talents', 'House 8 — investments and shared resources', 'Venus — what you attract', 'Jupiter — where abundance flows', 'Saturn — discipline that builds wealth'], es: ['Casa 2 — recursos y talentos monetizables', 'Casa 8 — inversiones y recursos compartidos', 'Venus — lo que atraes', 'Júpiter — donde fluye la abundancia', 'Saturno — disciplina que construye riqueza'], fr: ['Maison 2 — ressources et talents monétisables', 'Maison 8 — investissements et ressources partagées', 'Vénus — ce que vous attirez', 'Jupiter — où coule l\'abondance', 'Saturne — discipline qui construit la richesse'], de: ['2. Haus — monetarisierbare Ressourcen und Talente', '8. Haus — Investitionen und geteilte Ressourcen', 'Venus — was Sie anziehen', 'Jupiter — wo Fülle fließt', 'Saturn — Disziplin, die Reichtum aufbaut'], it: ['Casa 2 — risorse e talenti monetizzabili', 'Casa 8 — investimenti e risorse condivise', 'Venere — ciò che attrai', 'Giove — dove scorre l\'abbondanza', 'Saturno — disciplina che costruisce ricchezza'], nl: ['2e Huis — monetariseerbare bronnen en talenten', '8e Huis — investeringen en gedeelde bronnen', 'Venus — wat u aantrekt', 'Jupiter — waar overvloed stroomt', 'Saturnus — discipline die rijkdom opbouwt'], tr: ['2. Ev — para kazandıran kaynaklar ve yetenekler', '8. Ev — yatırımlar ve paylaşılan kaynaklar', 'Venüs — neyi çektiğiniz', 'Jüpiter — bolluğun aktığı yer', 'Satürn — zenginlik inşa eden disiplin'], ru: ['2-й Дом — монетизируемые ресурсы и таланты', '8-й Дом — инвестиции и общие ресурсы', 'Венера — что вы притягиваете', 'Юпитер — где течёт изобилие', 'Сатурн — дисциплина, строящая богатство'], zh: ['第二宫——可变现的资源和才能', '第八宫——投资和共享资源', '金星——你所吸引的', '木星——丰盛流向之处', '土星——建立财富的纪律'], ja: ['2ハウス――換金できる資源と才能', '8ハウス――投資と共有資源', '金星――あなたが引き寄せるもの', '木星――豊かさが流れる場所', '土星――富を築く規律'] },
  },
  {
    id: 'espiritual', icon: '🔮', category: 'personality', price: 34.90, currency: 'BRL',
    pages: { pt: '15-20 páginas', en: '15-20 pages', es: '15-20 páginas', fr: '15-20 pages', de: '15-20 Seiten', it: '15-20 pagine', nl: "15-20 pagina's", tr: '15-20 sayfa', ru: '15-20 страниц', zh: '15-20页', ja: '15-20ページ' },
    name: { pt: 'Mapa Espiritual e Kármico', en: 'Spiritual & Karmic Map', es: 'Mapa Espiritual y Kármico', fr: 'Carte Spirituelle et Karmique', de: 'Spirituelle & Karmische Karte', it: 'Mappa Spirituale e Karmica', nl: 'Spirituele & Karmische Kaart', tr: 'Ruhsal ve Karmik Harita', ru: 'Духовная и Кармическая Карта', zh: '灵性与业力星图', ja: 'スピリチュアル＆カルママップ' },
    description: { pt: 'O caminho da alma: Nodos Lunares, Casa 12, Netuno, Quíron e Plutão.', en: 'The soul\'s journey: Lunar Nodes, 12th House, Neptune, Chiron and Pluto.', es: 'El camino del alma: Nodos Lunares, Casa 12, Neptuno, Quirón y Plutón.', fr: 'Le chemin de l\'âme: Nœuds Lunaires, Maison 12, Neptune, Chiron et Pluton.', de: 'Der Weg der Seele: Mondknoten, 12. Haus, Neptun, Chiron und Pluto.', it: 'Il percorso dell\'anima: Nodi Lunari, Casa 12, Nettuno, Chirone e Plutone.', nl: 'Het pad van de ziel: Maansknopen, 12e Huis, Neptunus, Chiron en Pluto.', tr: 'Ruhun yolculuğu: Ay Düğümleri, 12. Ev, Neptün, Kiron ve Plüton.', ru: 'Путь души: Лунные Узлы, 12-й Дом, Нептун, Хирон и Плутон.', zh: '灵魂之路：月交点、第12宫、海王星、凯龙和冥王星。', ja: '魂の旅路：ルナーノード、12ハウス、海王星、キロン、冥王星。' },
    features: { pt: ['Nodo Norte — propósito evolutivo', 'Casa 12 — conexão com o transcendente', 'Quíron — ferida sagrada e dom de cura', 'Netuno — portal espiritual', 'Plutão — poder transformador profundo'], en: ['North Node — evolutionary purpose', '12th House — connection to the transcendent', 'Chiron — sacred wound and healing gift', 'Neptune — spiritual portal', 'Pluto — deep transformative power'], es: ['Nodo Norte — propósito evolutivo', 'Casa 12 — conexión con lo trascendente', 'Quirón — herida sagrada y don de sanación', 'Neptuno — portal espiritual', 'Plutón — poder transformador profundo'], fr: ['Nœud Nord — objectif évolutif', 'Maison 12 — connexion au transcendant', 'Chiron — blessure sacrée et don de guérison', 'Neptune — portail spirituel', 'Pluton — pouvoir transformateur profond'], de: ['Nordknoten — evolutionärer Zweck', '12. Haus — Verbindung zum Transzendenten', 'Chiron — heilige Wunde und Heilungsgabe', 'Neptun — spirituelles Portal', 'Pluto — tiefe transformative Kraft'], it: ['Nodo Nord — scopo evolutivo', 'Casa 12 — connessione al trascendente', 'Chirone — ferita sacra e dono di guarigione', 'Nettuno — portale spirituale', 'Plutone — potere trasformativo profondo'], nl: ['Noordknoop — evolutionair doel', '12e Huis — verbinding met het transcendente', 'Chiron — heilige wond en genezingsgave', 'Neptunus — spiritueel portaal', 'Pluto — diepe transformatieve kracht'], tr: ['Kuzey Düğümü — evrimsel amaç', '12. Ev — aşkın ile bağlantı', 'Kiron — kutsal yara ve şifa armağanı', 'Neptün — ruhsal portal', 'Plüton — derin dönüştürücü güç'], ru: ['Северный Узел — эволюционная цель', '12-й Дом — связь с трансцендентным', 'Хирон — священная рана и дар исцеления', 'Нептун — духовный портал', 'Плутон — глубокая трансформирующая сила'], zh: ['北交点——进化目的', '第12宫——与超越性的连接', '凯龙——神圣伤痛与疗愈天赋', '海王星——灵性门户', '冥王星——深层转化力量'], ja: ['ノースノード――進化の目的', '12ハウス――超越的なものとの繋がり', 'キロン――聖なる傷と癒しの賜物', '海王星――スピリチュアルな門', '冥王星――深い変容の力'] },
  },
  {
    id: 'retorno-saturno', icon: '♄', category: 'forecast', price: 24.90, currency: 'BRL',
    pages: { pt: '12-15 páginas', en: '12-15 pages', es: '12-15 páginas', fr: '12-15 pages', de: '12-15 Seiten', it: '12-15 pagine', nl: "12-15 pagina's", tr: '12-15 sayfa', ru: '12-15 страниц', zh: '12-15页', ja: '12-15ページ' },
    name: { pt: 'Retorno de Saturno', en: 'Saturn Return', es: 'Retorno de Saturno', fr: 'Retour de Saturne', de: 'Saturn-Rückkehr', it: 'Ritorno di Saturno', nl: 'Saturnus Terugkeer', tr: 'Satürn Dönüşü', ru: 'Возвращение Сатурна', zh: '土星回归', ja: 'サターンリターン' },
    description: { pt: 'Guia para o ciclo de 29 anos de Saturno — reestruturação, maturidade e propósito.', en: 'Guide for Saturn\'s 29-year cycle — restructuring, maturity and purpose.', es: 'Guía para el ciclo de 29 años de Saturno — reestructuración y madurez.', fr: 'Guide du cycle de 29 ans de Saturne — restructuration et maturité.', de: 'Leitfaden für Saturns 29-Jahres-Zyklus — Neustrukturierung und Reife.', it: 'Guida al ciclo di 29 anni di Saturno — ristrutturazione e maturità.', nl: 'Gids voor de 29-jarige cyclus van Saturnus — herstructurering en rijpheid.', tr: 'Satürn\'ün 29 yıllık döngüsü rehberi — yeniden yapılanma ve olgunluk.', ru: 'Руководство по 29-летнему циклу Сатурна — перестройка и зрелость.', zh: '土星29年周期指南——重组、成熟与目标。', ja: 'サターンの29年サイクルガイド——再構築、成熟、目的。' },
    features: { pt: ['Saturno natal — a lição central', 'Casas regidas por Saturno — áreas ativadas', 'Fases do retorno', 'O que Saturno exige de você', 'O que Saturno recompensa'], en: ['Natal Saturn — the core lesson', 'Saturn-ruled houses — activated areas', 'Phases of the return', 'What Saturn demands from you', 'What Saturn rewards'], es: ['Saturno natal — la lección central', 'Casas regidas por Saturno — áreas activadas', 'Fases del retorno', 'Lo que Saturno exige de ti', 'Lo que Saturno recompensa'], fr: ['Saturne natal — la leçon centrale', 'Maisons régies par Saturne — zones activées', 'Phases du retour', 'Ce que Saturne exige de vous', 'Ce que Saturne récompense'], de: ['Nataler Saturn — die Kernlektion', 'Von Saturn beherrschte Häuser — aktivierte Bereiche', 'Phasen der Rückkehr', 'Was Saturn von Ihnen fordert', 'Was Saturn belohnt'], it: ['Saturno natale — la lezione centrale', 'Case governate da Saturno — aree attivate', 'Fasi del ritorno', 'Cosa Saturno richiede da te', 'Cosa Saturno ricompensa'], nl: ['Natale Saturnus — de kernles', 'Door Saturnus geregeerde huizen — geactiveerde gebieden', 'Fasen van de terugkeer', 'Wat Saturnus van u verlangt', 'Wat Saturnus beloont'], tr: ['Natal Satürn — temel ders', 'Satürn tarafından yönetilen evler — aktive edilen alanlar', 'Dönüşün evreleri', 'Satürn\'ün sizden talepleri', 'Satürn\'ün ödüllendirdikleri'], ru: ['Натальный Сатурн — главный урок', 'Дома, управляемые Сатурном — активированные области', 'Фазы возвращения', 'Что Сатурн требует от вас', 'Что Сатурн вознаграждает'], zh: ['本命土星——核心课题', '土星主管的宫位——激活的领域', '回归的阶段', '土星对你的要求', '土星的奖励'], ja: ['ネイタル土星――核心の課題', '土星が支配するハウス――活性化される領域', '回帰のフェーズ', '土星があなたに求めること', '土星が報いること'] },
  },
];

const CATEGORIES: Record<string, Record<string, string>> = {
  all: { pt: 'Todos', en: 'All', es: 'Todos', fr: 'Tous', de: 'Alle', it: 'Tutti', nl: 'Alle', tr: 'Tümü', ru: 'Все', zh: '全部', ja: 'すべて' },
  personality: { pt: 'Personalidade', en: 'Personality', es: 'Personalidad', fr: 'Personnalité', de: 'Persönlichkeit', it: 'Personalità', nl: 'Persoonlijkheid', tr: 'Kişilik', ru: 'Личность', zh: '性格', ja: '性格' },
  forecast: { pt: 'Previsão', en: 'Forecast', es: 'Previsión', fr: 'Prévision', de: 'Vorschau', it: 'Previsione', nl: 'Voorspelling', tr: 'Öngörü', ru: 'Прогноз', zh: '预测', ja: '予測' },
  relationship: { pt: 'Relacionamento', en: 'Relationship', es: 'Relación', fr: 'Relation', de: 'Beziehung', it: 'Relazione', nl: 'Relatie', tr: 'İlişki', ru: 'Отношения', zh: '关系', ja: '関係' },
  career: { pt: 'Carreira', en: 'Career', es: 'Carrera', fr: 'Carrière', de: 'Karriere', it: 'Carriera', nl: 'Carrière', tr: 'Kariyer', ru: 'Карьера', zh: '事业', ja: 'キャリア' },
};

const TRUST: Record<string, { t1: string; t2: string; t3: string }> = {
  pt: { t1: 'Gerado instantaneamente no seu navegador', t2: 'Seus dados nunca saem do dispositivo', t3: 'PDF disponível offline após geração' },
  en: { t1: 'Generated instantly in your browser', t2: 'Your data never leaves your device', t3: 'PDF available offline after generation' },
  es: { t1: 'Generado instantáneamente en tu navegador', t2: 'Tus datos nunca salen del dispositivo', t3: 'PDF disponible sin conexión después de la generación' },
  fr: { t1: 'Généré instantanément dans votre navigateur', t2: 'Vos données ne quittent jamais votre appareil', t3: 'PDF disponible hors ligne après génération' },
  de: { t1: 'Sofort in Ihrem Browser generiert', t2: 'Ihre Daten verlassen nie Ihr Gerät', t3: 'PDF offline verfügbar nach Generierung' },
  it: { t1: 'Generato istantaneamente nel tuo browser', t2: 'I tuoi dati non lasciano mai il dispositivo', t3: 'PDF disponibile offline dopo la generazione' },
  nl: { t1: 'Direct gegenereerd in uw browser', t2: 'Uw gegevens verlaten nooit uw apparaat', t3: 'PDF offline beschikbaar na generatie' },
  tr: { t1: 'Tarayıcınızda anında oluşturuldu', t2: 'Verileriniz asla cihazınızdan çıkmaz', t3: 'PDF oluşturma sonrası çevrimdışı kullanılabilir' },
  ru: { t1: 'Мгновенно генерируется в вашем браузере', t2: 'Ваши данные никогда не покидают устройство', t3: 'PDF доступен офлайн после генерации' },
  zh: { t1: '在浏览器中即时生成', t2: '您的数据永远不会离开设备', t3: '生成后PDF可离线使用' },
  ja: { t1: 'ブラウザで即座に生成', t2: 'データはデバイスから出ません', t3: '生成後はオフラインでPDF利用可能' },
};

const ADDED: Record<string, string> = { pt: '✓ Adicionado!', en: '✓ Added!', es: '✓ Añadido!', fr: '✓ Ajouté!', de: '✓ Hinzugefügt!', it: '✓ Aggiunto!', nl: '✓ Toegevoegd!', tr: '✓ Eklendi!', ru: '✓ Добавлено!', zh: '✓ 已添加!', ja: '✓ 追加しました!' };

export default function ReportsShop(props: Props) {
  const locale = () => props.locale || 'pt';
  const [selectedCategory, setSelectedCategory] = createSignal<string>('all');
  const [addedToCart, setAddedToCart] = createSignal<string | null>(null);
  const [cartCount, setCartCount] = createSignal(0);
  const [cartItems, setCartItems] = createSignal<Set<string>>(new Set());
  const [showToast, setShowToast] = createSignal(false);
  const [lastAdded, setLastAdded] = createSignal('');
  const t = () => getTranslations(locale());

  const filteredProducts = () => {
    if (selectedCategory() === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory());
  };

  const getText = (map: Record<string, string>) => map[locale()] || map.en || map.pt;

  // Load cart count on mount
  onMount(async () => {
    try {
      const items = await db.cart.toArray();
      setCartCount(items.length);
      setCartItems(new Set(items.map(i => i.productId)));
    } catch (e) { /* IndexedDB may not be available */ }
  });

  const addToCart = async (product: Product) => {
    // Check if already in cart
    const existing = await db.cart.where('productId').equals(product.id).first();
    if (existing) {
      // Already in cart — flash feedback
      setAddedToCart(product.id);
      setLastAdded(getText(product.name));
      setShowToast(true);
      setTimeout(() => setAddedToCart(null), 2500);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    // Check if user has at least one profile saved
    const profiles = await db.profiles.toArray();
    if (profiles.length === 0) {
      const msg = locale() === 'pt'
        ? 'Você precisa calcular seu mapa natal primeiro para gerar relatórios.'
        : 'You need to calculate your natal chart first to generate reports.';
      alert(msg);
      return;
    }

    // Use the most recent profile
    const latestProfile = profiles.sort((a, b) =>
      (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0)
    )[0];

    await db.cart.add({
      productId: product.id,
      productName: getText(product.name),
      profileId: latestProfile.id!,
      profileName: latestProfile.name,
      price: product.price,
      currency: product.currency,
      addedAt: new Date(),
    });
    setAddedToCart(product.id);
    setCartCount(c => c + 1);
    setCartItems(prev => new Set([...prev, product.id]));
    setLastAdded(getText(product.name));
    setShowToast(true);
    setTimeout(() => setAddedToCart(null), 2500);
    setTimeout(() => setShowToast(false), 4000);
  };

  const trust = () => TRUST[locale()] || TRUST.en;

  return (
    <div class="space-y-6">
      {/* Toast notification */}
      <Show when={showToast()}>
        <div class="fixed top-4 right-4 z-50 animate-slide-in">
          <div class="glass rounded-xl border border-green-500/30 p-4 shadow-lg flex items-center gap-3 max-w-sm">
            <span class="text-2xl">✅</span>
            <div class="flex-1">
              <p class="text-sm font-medium text-cream">{lastAdded()}</p>
              <p class="text-xs text-green-400">{ADDED[locale()] || ADDED.en}</p>
            </div>
            <a
              href={localePath('/cart', locale() as any)}
              class="px-3 py-1.5 text-xs font-medium bg-gold text-black rounded-lg hover:bg-gold-light transition-colors whitespace-nowrap"
            >
              🛒 {t().nav.cart} ({cartCount()})
            </a>
          </div>
        </div>
      </Show>

      {/* Cart badge - fixed */}
      <Show when={cartCount() > 0}>
        <div class="flex justify-end">
          <a
            href={localePath('/cart', locale() as any)}
            class="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-gold/30 hover:border-gold/60 transition-all hover:scale-[1.02]"
          >
            <span>🛒</span>
            <span class="text-sm text-cream">{t().nav.cart}</span>
            <span class="bg-gold text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount()}</span>
          </a>
        </div>
      </Show>

      {/* Category filter */}
      <div class="flex gap-2 flex-wrap justify-center">
        <For each={Object.keys(CATEGORIES)}>
          {(catId) => (
            <button
              onClick={() => setSelectedCategory(catId)}
              class={`px-4 py-2 text-sm rounded-full transition-all ${
                selectedCategory() === catId
                  ? 'bg-gradient-to-r from-gold-dark to-gold text-black font-semibold'
                  : 'bg-base-200 text-cream-dark border border-base-300 hover:border-gold/30 hover:text-gold'
              }`}
            >
              {CATEGORIES[catId][locale()] || CATEGORIES[catId].en}
            </button>
          )}
        </For>
      </div>

      {/* Products grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={filteredProducts()}>
          {(product) => (
            <div class={`glass rounded-2xl border-glow overflow-hidden hover:border-gold/40 hover:shadow-gold transition-all group ${
              addedToCart() === product.id ? 'ring-2 ring-green-500/50 scale-[1.02]' : ''
            }`}>
              <div class="p-6 pb-4">
                <div class="flex items-start justify-between">
                  <div class="text-3xl">{product.icon}</div>
                  <span class="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full border border-gold/20">
                    {product.pages[locale()] || product.pages.en}
                  </span>
                </div>
                <h3 class="text-lg font-semibold text-cream mt-3 group-hover:text-gold transition-colors">
                  {getText(product.name)}
                </h3>
                <p class="text-sm text-muted mt-1">{getText(product.description)}</p>
              </div>
              <div class="px-6 pb-4">
                <ul class="space-y-1">
                  <For each={product.features[locale()] || product.features.en || product.features.pt}>
                    {(feat) => (
                      <li class="text-xs text-muted flex items-start gap-1.5">
                        <span class="text-gold mt-0.5">✓</span>{feat}
                      </li>
                    )}
                  </For>
                </ul>
              </div>
              <div class="p-6 pt-4 border-t border-base-300/50 bg-base-100/50">
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold text-gold">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                  <button
                    onClick={() => addToCart(product)}
                    class={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      addedToCart() === product.id
                        ? 'bg-green-600 text-white scale-105'
                        : cartItems().has(product.id)
                        ? 'bg-green-700/50 text-green-200 border border-green-500/30 cursor-default'
                        : 'bg-gradient-to-r from-gold-dark to-gold text-black hover:shadow-gold hover:scale-[1.02]'
                    }`}
                  >
                    {addedToCart() === product.id
                      ? (ADDED[locale()] || ADDED.en)
                      : cartItems().has(product.id)
                      ? '✓ ' + (t().cart?.inCart || 'In cart')
                      : t().reports.buyNow}
                  </button>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Trust badges */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-center">
        <div class="p-4 glass rounded-2xl border-glow"><div class="text-2xl mb-1">⚡</div><p class="text-xs text-muted">{trust().t1}</p></div>
        <div class="p-4 glass rounded-2xl border-glow"><div class="text-2xl mb-1">🔒</div><p class="text-xs text-muted">{trust().t2}</p></div>
        <div class="p-4 glass rounded-2xl border-glow"><div class="text-2xl mb-1">📱</div><p class="text-xs text-muted">{trust().t3}</p></div>
      </div>
    </div>
  );
}
