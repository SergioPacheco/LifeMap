import type { Locale } from './index';

type AspectName = 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
type CategoryName = 'mask' | 'identity' | 'emotion' | 'mind' | 'love' | 'action' | 'direction';

interface ChartUiText {
  aspectGrid: string;
  elementsModalities: string;
  totalPoints: string;
  modalities: { cardinal: string; fixed: string; mutable: string };
  aspects: Record<AspectName, string>;
  interpretation: {
    title: string;
    intro: string;
    categories: Record<CategoryName, string>;
    premiumTitle: string;
    premiumBody: string;
    premiumLink: string;
  };
  natal: {
    unnamed: string;
    calculateError: string;
    calculatingPositions: string;
    natalInner: string;
    todayTransitsOuter: string;
    fillBirthData: string;
    exitFullscreen: string;
    expandFullscreen: string;
    fullscreenHint: string;
  };
}

const chartUi: Record<Locale, ChartUiText> = {
  pt: {
    aspectGrid: 'Grade de Aspectos', elementsModalities: 'Elementos & Modalidades', totalPoints: 'Total de pontos',
    modalities: { cardinal: 'Cardinal', fixed: 'Fixo', mutable: 'Mutável' },
    aspects: { conjunction: 'Conjunção', sextile: 'Sextil', square: 'Quadratura', trine: 'Trígono', opposition: 'Oposição' },
    interpretation: {
      title: 'Interpretação do Mapa',
      intro: 'Leitura baseada no planeta na casa (área de vida), com o signo como tempero na expressão. Para análise completa com aspectos e dignidades, veja nossos relatórios premium.',
      categories: { mask: 'Máscara / Primeira Impressão', identity: 'Identidade / Propósito', emotion: 'Emoções / Necessidades', mind: 'Mente / Comunicação', love: 'Afeto / Relacionamentos', action: 'Ação / Energia', direction: 'Direção de Vida' },
      premiumTitle: 'Quer a análise completa com aspectos, dignidades e trânsitos?',
      premiumBody: 'O Relatório Natal Completo inclui todos os planetas, aspectos entre planetas, dignidades essenciais e previsões - 20-30 páginas em PDF profissional.',
      premiumLink: 'Ver Relatórios Premium',
    },
    natal: { unnamed: 'Sem nome', calculateError: 'Erro ao calcular o mapa. Verifique os dados.', calculatingPositions: 'Calculando posições astronômicas...', natalInner: 'Natal (interno)', todayTransitsOuter: 'Trânsitos de hoje (externo)', fillBirthData: 'Preencha os dados de nascimento para gerar seu mapa', exitFullscreen: 'Sair da tela cheia (Esc)', expandFullscreen: 'Expandir para tela cheia', fullscreenHint: 'Pressione Esc ou clique no botão para sair' },
  },
  en: {
    aspectGrid: 'Aspect Grid', elementsModalities: 'Elements & Modalities', totalPoints: 'Total points',
    modalities: { cardinal: 'Cardinal', fixed: 'Fixed', mutable: 'Mutable' },
    aspects: { conjunction: 'Conjunction', sextile: 'Sextile', square: 'Square', trine: 'Trine', opposition: 'Opposition' },
    interpretation: {
      title: 'Chart Interpretation',
      intro: 'A reading based on each planet in its house (area of life), with the sign coloring its expression. See our premium reports for a complete analysis with aspects and dignities.',
      categories: { mask: 'Mask / First Impression', identity: 'Identity / Purpose', emotion: 'Emotions / Needs', mind: 'Mind / Communication', love: 'Affection / Relationships', action: 'Action / Energy', direction: 'Life Direction' },
      premiumTitle: 'Want the complete analysis with aspects, dignities, and transits?',
      premiumBody: 'The Complete Natal Report includes every planet, interplanetary aspects, essential dignities, and forecasts - 20-30 pages in a professional PDF.',
      premiumLink: 'View Premium Reports',
    },
    natal: { unnamed: 'Unnamed', calculateError: 'Unable to calculate the chart. Check the data.', calculatingPositions: 'Calculating astronomical positions...', natalInner: 'Natal (inner)', todayTransitsOuter: "Today's transits (outer)", fillBirthData: 'Enter the birth data to generate your chart', exitFullscreen: 'Exit fullscreen (Esc)', expandFullscreen: 'Expand to fullscreen', fullscreenHint: 'Press Esc or click the button to exit' },
  },
  es: {
    aspectGrid: 'Cuadrícula de Aspectos', elementsModalities: 'Elementos y Modalidades', totalPoints: 'Puntos totales',
    modalities: { cardinal: 'Cardinal', fixed: 'Fijo', mutable: 'Mutable' },
    aspects: { conjunction: 'Conjunción', sextile: 'Sextil', square: 'Cuadratura', trine: 'Trígono', opposition: 'Oposición' },
    interpretation: {
      title: 'Interpretación de la Carta',
      intro: 'Lectura basada en el planeta en la casa (área de vida), con el signo como matiz de su expresión. Consulta nuestros informes premium para un análisis completo con aspectos y dignidades.',
      categories: { mask: 'Máscara / Primera Impresión', identity: 'Identidad / Propósito', emotion: 'Emociones / Necesidades', mind: 'Mente / Comunicación', love: 'Afecto / Relaciones', action: 'Acción / Energía', direction: 'Dirección de Vida' },
      premiumTitle: '¿Quieres el análisis completo con aspectos, dignidades y tránsitos?',
      premiumBody: 'El Informe Natal Completo incluye todos los planetas, aspectos entre planetas, dignidades esenciales y previsiones: 20-30 páginas en PDF profesional.',
      premiumLink: 'Ver Informes Premium',
    },
    natal: { unnamed: 'Sin nombre', calculateError: 'No se pudo calcular la carta. Revisa los datos.', calculatingPositions: 'Calculando posiciones astronómicas...', natalInner: 'Natal (interior)', todayTransitsOuter: 'Tránsitos de hoy (exterior)', fillBirthData: 'Introduce los datos de nacimiento para generar tu carta', exitFullscreen: 'Salir de pantalla completa (Esc)', expandFullscreen: 'Ampliar a pantalla completa', fullscreenHint: 'Pulsa Esc o haz clic en el botón para salir' },
  },
  fr: {
    aspectGrid: 'Grille des Aspects', elementsModalities: 'Éléments et Modalités', totalPoints: 'Total des points',
    modalities: { cardinal: 'Cardinal', fixed: 'Fixe', mutable: 'Mutable' },
    aspects: { conjunction: 'Conjonction', sextile: 'Sextile', square: 'Carré', trine: 'Trigone', opposition: 'Opposition' },
    interpretation: {
      title: 'Interprétation du Thème',
      intro: "Lecture fondée sur la planète en maison (domaine de vie), le signe nuançant son expression. Consultez nos rapports premium pour une analyse complète avec aspects et dignités.",
      categories: { mask: 'Masque / Première Impression', identity: 'Identité / But', emotion: 'Émotions / Besoins', mind: 'Esprit / Communication', love: 'Affection / Relations', action: 'Action / Énergie', direction: 'Direction de Vie' },
      premiumTitle: 'Vous souhaitez une analyse complète avec aspects, dignités et transits ?',
      premiumBody: 'Le Rapport Natal Complet comprend toutes les planètes, les aspects, les dignités essentielles et les prévisions : 20 à 30 pages dans un PDF professionnel.',
      premiumLink: 'Voir les Rapports Premium',
    },
    natal: { unnamed: 'Sans nom', calculateError: 'Impossible de calculer le thème. Vérifiez les données.', calculatingPositions: 'Calcul des positions astronomiques...', natalInner: 'Natal (intérieur)', todayTransitsOuter: "Transits du jour (extérieur)", fillBirthData: 'Saisissez les données de naissance pour générer votre thème', exitFullscreen: 'Quitter le plein écran (Échap)', expandFullscreen: 'Afficher en plein écran', fullscreenHint: 'Appuyez sur Échap ou cliquez sur le bouton pour quitter' },
  },
  de: {
    aspectGrid: 'Aspektgitter', elementsModalities: 'Elemente & Modalitäten', totalPoints: 'Gesamtpunkte',
    modalities: { cardinal: 'Kardinal', fixed: 'Fix', mutable: 'Veränderlich' },
    aspects: { conjunction: 'Konjunktion', sextile: 'Sextil', square: 'Quadrat', trine: 'Trigon', opposition: 'Opposition' },
    interpretation: {
      title: 'Horoskopdeutung',
      intro: 'Deutung auf Grundlage des Planeten im Haus (Lebensbereich), wobei das Zeichen seinen Ausdruck färbt. Eine vollständige Analyse mit Aspekten und Würden finden Sie in unseren Premium-Berichten.',
      categories: { mask: 'Maske / Erster Eindruck', identity: 'Identität / Bestimmung', emotion: 'Gefühle / Bedürfnisse', mind: 'Denken / Kommunikation', love: 'Zuneigung / Beziehungen', action: 'Handlung / Energie', direction: 'Lebensrichtung' },
      premiumTitle: 'Möchten Sie die vollständige Analyse mit Aspekten, Würden und Transiten?',
      premiumBody: 'Der vollständige Geburtshoroskop-Bericht enthält alle Planeten, Aspekte, wesentlichen Würden und Prognosen - 20-30 Seiten als professionelles PDF.',
      premiumLink: 'Premium-Berichte ansehen',
    },
    natal: { unnamed: 'Ohne Namen', calculateError: 'Das Horoskop konnte nicht berechnet werden. Prüfen Sie die Daten.', calculatingPositions: 'Astronomische Positionen werden berechnet...', natalInner: 'Radix (innen)', todayTransitsOuter: 'Heutige Transite (außen)', fillBirthData: 'Geben Sie die Geburtsdaten ein, um Ihr Horoskop zu erstellen', exitFullscreen: 'Vollbild verlassen (Esc)', expandFullscreen: 'Auf Vollbild erweitern', fullscreenHint: 'Drücken Sie Esc oder klicken Sie zum Beenden auf die Schaltfläche' },
  },
  it: {
    aspectGrid: 'Griglia degli Aspetti', elementsModalities: 'Elementi e Modalità', totalPoints: 'Punti totali',
    modalities: { cardinal: 'Cardinale', fixed: 'Fissa', mutable: 'Mobile' },
    aspects: { conjunction: 'Congiunzione', sextile: 'Sestile', square: 'Quadratura', trine: 'Trigono', opposition: 'Opposizione' },
    interpretation: {
      title: 'Interpretazione del Tema',
      intro: "Lettura basata sul pianeta nella casa (area della vita), con il segno che ne colora l'espressione. Consulta i nostri report premium per un'analisi completa con aspetti e dignità.",
      categories: { mask: 'Maschera / Prima Impressione', identity: 'Identità / Scopo', emotion: 'Emozioni / Bisogni', mind: 'Mente / Comunicazione', love: 'Affetto / Relazioni', action: 'Azione / Energia', direction: 'Direzione di Vita' },
      premiumTitle: "Vuoi l'analisi completa con aspetti, dignità e transiti?",
      premiumBody: 'Il Report Natale Completo include tutti i pianeti, gli aspetti, le dignità essenziali e le previsioni: 20-30 pagine in PDF professionale.',
      premiumLink: 'Vedi i Report Premium',
    },
    natal: { unnamed: 'Senza nome', calculateError: 'Impossibile calcolare il tema. Controlla i dati.', calculatingPositions: 'Calcolo delle posizioni astronomiche...', natalInner: 'Natale (interno)', todayTransitsOuter: 'Transiti di oggi (esterno)', fillBirthData: 'Inserisci i dati di nascita per generare il tema', exitFullscreen: 'Esci dalla modalità a schermo intero (Esc)', expandFullscreen: 'Espandi a schermo intero', fullscreenHint: 'Premi Esc o fai clic sul pulsante per uscire' },
  },
  ja: {
    aspectGrid: 'アスペクト・グリッド', elementsModalities: 'エレメントと三区分', totalPoints: '合計ポイント',
    modalities: { cardinal: '活動宮', fixed: '不動宮', mutable: '柔軟宮' },
    aspects: { conjunction: 'コンジャンクション', sextile: 'セクスタイル', square: 'スクエア', trine: 'トライン', opposition: 'オポジション' },
    interpretation: {
      title: 'チャート解釈',
      intro: '惑星が入るハウス（人生領域）を中心に、サインがその表現に色合いを加える読み方です。アスペクトや品位を含む完全な分析はプレミアムレポートをご覧ください。',
      categories: { mask: '仮面 / 第一印象', identity: 'アイデンティティ / 目的', emotion: '感情 / 欲求', mind: '思考 / コミュニケーション', love: '愛情 / 関係', action: '行動 / エネルギー', direction: '人生の方向性' },
      premiumTitle: 'アスペクト、品位、トランジットを含む完全な分析をご希望ですか？',
      premiumBody: '完全版ネイタルレポートには、すべての惑星、惑星間アスペクト、本質的品位、予測が含まれます。プロ仕様PDFで20〜30ページです。',
      premiumLink: 'プレミアムレポートを見る',
    },
    natal: { unnamed: '名称未設定', calculateError: 'チャートを計算できませんでした。データを確認してください。', calculatingPositions: '天体位置を計算中...', natalInner: 'ネイタル（内側）', todayTransitsOuter: '今日のトランジット（外側）', fillBirthData: '出生データを入力してチャートを作成してください', exitFullscreen: '全画面表示を終了（Esc）', expandFullscreen: '全画面表示にする', fullscreenHint: 'Escキーまたはボタンをクリックして終了' },
  },
  zh: {
    aspectGrid: '相位网格', elementsModalities: '元素与模式', totalPoints: '总点数',
    modalities: { cardinal: '开创', fixed: '固定', mutable: '变动' },
    aspects: { conjunction: '合相', sextile: '六分相', square: '四分相', trine: '三分相', opposition: '对分相' },
    interpretation: {
      title: '星盘解读',
      intro: '以行星落宫（生活领域）为基础，并由星座赋予表达方式。包含相位与尊贵状态的完整分析，请查看我们的高级报告。',
      categories: { mask: '面具 / 第一印象', identity: '身份 / 目标', emotion: '情绪 / 需求', mind: '思维 / 沟通', love: '情感 / 关系', action: '行动 / 能量', direction: '人生方向' },
      premiumTitle: '想要包含相位、尊贵状态和行运的完整分析吗？',
      premiumBody: '完整本命报告涵盖所有行星、行星间相位、本质尊贵状态与预测，共20至30页专业PDF。',
      premiumLink: '查看高级报告',
    },
    natal: { unnamed: '未命名', calculateError: '无法计算星盘，请检查数据。', calculatingPositions: '正在计算天体位置...', natalInner: '本命盘（内圈）', todayTransitsOuter: '今日行运（外圈）', fillBirthData: '请输入出生数据以生成星盘', exitFullscreen: '退出全屏（Esc）', expandFullscreen: '展开至全屏', fullscreenHint: '按Esc键或点击按钮退出' },
  },
  ru: {
    aspectGrid: 'Сетка аспектов', elementsModalities: 'Стихии и модальности', totalPoints: 'Всего баллов',
    modalities: { cardinal: 'Кардинальный', fixed: 'Фиксированный', mutable: 'Мутабельный' },
    aspects: { conjunction: 'Соединение', sextile: 'Секстиль', square: 'Квадрат', trine: 'Трин', opposition: 'Оппозиция' },
    interpretation: {
      title: 'Интерпретация карты',
      intro: 'Толкование основано на положении планеты в доме (сфере жизни), а знак придаёт выражению оттенок. Полный анализ аспектов и достоинств доступен в наших премиум-отчётах.',
      categories: { mask: 'Маска / Первое впечатление', identity: 'Личность / Предназначение', emotion: 'Эмоции / Потребности', mind: 'Ум / Общение', love: 'Чувства / Отношения', action: 'Действие / Энергия', direction: 'Направление жизни' },
      premiumTitle: 'Хотите полный анализ аспектов, достоинств и транзитов?',
      premiumBody: 'Полный натальный отчёт включает все планеты, аспекты, эссенциальные достоинства и прогнозы - 20-30 страниц профессионального PDF.',
      premiumLink: 'Посмотреть премиум-отчёты',
    },
    natal: { unnamed: 'Без имени', calculateError: 'Не удалось рассчитать карту. Проверьте данные.', calculatingPositions: 'Расчёт астрономических положений...', natalInner: 'Натал (внутри)', todayTransitsOuter: 'Транзиты сегодня (снаружи)', fillBirthData: 'Введите данные рождения, чтобы построить карту', exitFullscreen: 'Выйти из полноэкранного режима (Esc)', expandFullscreen: 'Развернуть на весь экран', fullscreenHint: 'Нажмите Esc или кнопку, чтобы выйти' },
  },
  tr: {
    aspectGrid: 'Açı Izgarası', elementsModalities: 'Elementler ve Nitelikler', totalPoints: 'Toplam puan',
    modalities: { cardinal: 'Öncü', fixed: 'Sabit', mutable: 'Değişken' },
    aspects: { conjunction: 'Kavuşum', sextile: 'Sekstil', square: 'Kare', trine: 'Üçgen', opposition: 'Karşıt' },
    interpretation: {
      title: 'Harita Yorumu',
      intro: 'Gezegenin evdeki konumunu (yaşam alanı) temel alan, burcun ifadeye renk kattığı bir yorumdur. Açılar ve asaletlerle tam analiz için premium raporlarımıza bakın.',
      categories: { mask: 'Maske / İlk İzlenim', identity: 'Kimlik / Amaç', emotion: 'Duygular / İhtiyaçlar', mind: 'Zihin / İletişim', love: 'Sevgi / İlişkiler', action: 'Eylem / Enerji', direction: 'Yaşam Yönü' },
      premiumTitle: 'Açılar, asaletler ve transitlerle tam analizi ister misiniz?',
      premiumBody: 'Tam Doğum Haritası Raporu tüm gezegenleri, gezegenler arası açıları, temel asaletleri ve öngörüleri içerir; profesyonel PDF olarak 20-30 sayfadır.',
      premiumLink: 'Premium Raporları Gör',
    },
    natal: { unnamed: 'Adsız', calculateError: 'Harita hesaplanamadı. Verileri kontrol edin.', calculatingPositions: 'Astronomik konumlar hesaplanıyor...', natalInner: 'Doğum haritası (iç)', todayTransitsOuter: 'Bugünün transitleri (dış)', fillBirthData: 'Haritanızı oluşturmak için doğum bilgilerini girin', exitFullscreen: 'Tam ekrandan çık (Esc)', expandFullscreen: 'Tam ekrana genişlet', fullscreenHint: 'Çıkmak için Esc tuşuna basın veya düğmeye tıklayın' },
  },
  nl: {
    aspectGrid: 'Aspectenraster', elementsModalities: 'Elementen & Modaliteiten', totalPoints: 'Totaal aantal punten',
    modalities: { cardinal: 'Kardinaal', fixed: 'Vast', mutable: 'Beweeglijk' },
    aspects: { conjunction: 'Conjunctie', sextile: 'Sextiel', square: 'Vierkant', trine: 'Driehoek', opposition: 'Oppositie' },
    interpretation: {
      title: 'Horoscoopinterpretatie',
      intro: 'Een duiding op basis van de planeet in het huis (levensgebied), waarbij het teken de uitdrukking kleurt. Bekijk onze premiumrapporten voor een volledige analyse met aspecten en waardigheden.',
      categories: { mask: 'Masker / Eerste Indruk', identity: 'Identiteit / Doel', emotion: 'Emoties / Behoeften', mind: 'Geest / Communicatie', love: 'Genegenheid / Relaties', action: 'Actie / Energie', direction: 'Levensrichting' },
      premiumTitle: 'Wil je de volledige analyse met aspecten, waardigheden en transits?',
      premiumBody: 'Het Volledige Geboortehoroscooprapport bevat alle planeten, onderlinge aspecten, essentiële waardigheden en voorspellingen - 20-30 pagina\'s in een professionele PDF.',
      premiumLink: 'Premiumrapporten bekijken',
    },
    natal: { unnamed: 'Naamloos', calculateError: 'De horoscoop kon niet worden berekend. Controleer de gegevens.', calculatingPositions: 'Astronomische posities worden berekend...', natalInner: 'Geboortehoroscoop (binnen)', todayTransitsOuter: 'Transits van vandaag (buiten)', fillBirthData: 'Voer de geboortegegevens in om je horoscoop te maken', exitFullscreen: 'Volledig scherm sluiten (Esc)', expandFullscreen: 'Naar volledig scherm', fullscreenHint: 'Druk op Esc of klik op de knop om af te sluiten' },
  },
};

export function getChartUi(locale: Locale | string | undefined): ChartUiText {
  return chartUi[(locale || 'pt') as Locale] || chartUi.pt;
}
