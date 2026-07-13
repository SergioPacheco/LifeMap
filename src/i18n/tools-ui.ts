import type { Locale } from './index';

interface ToolsUiText {
  moon: {
    phases: [string, string, string, string, string, string, string, string];
    signChange: string;
  };
  aspects: {
    exact: string;
    none: string;
    day: string;
    aspect: string;
    type: string;
    orb: string;
  };
  retrogrades: {
    previous: string;
    next: string;
    found: string;
    calculating: string;
    error: string;
    retry: string;
    timeline: string;
    planet: string;
    start: string;
    end: string;
    signs: string;
    days: string;
    daySuffix: string;
    none: string;
  };
}

const texts: Record<Locale, ToolsUiText> = {
  pt: { moon: { phases: ['Lua Nova','Lua Crescente','Quarto Crescente','Gibosa Crescente','Lua Cheia','Gibosa Minguante','Quarto Minguante','Lua Minguante'], signChange: 'Mudança de signo' }, aspects: { exact: 'aspectos exatos', none: 'Nenhum aspecto exato neste mês (orbe < 1°)', day: 'Dia', aspect: 'Aspecto', type: 'Tipo', orb: 'Orbe' }, retrogrades: { previous: 'Anterior', next: 'Próximo', found: 'períodos retrógrados encontrados', calculating: 'Calculando retrógrados de', error: 'Erro ao calcular retrógrados', retry: 'Tentar novamente', timeline: 'Linha do Tempo Visual', planet: 'Planeta', start: 'Início', end: 'Fim', signs: 'Signos', days: 'Dias', daySuffix: 'd', none: 'Nenhum período retrógrado encontrado para' } },
  en: { moon: { phases: ['New Moon','Waxing Crescent','First Quarter','Waxing Gibbous','Full Moon','Waning Gibbous','Last Quarter','Waning Crescent'], signChange: 'Sign change' }, aspects: { exact: 'exact aspects', none: 'No exact aspects this month (orb < 1°)', day: 'Day', aspect: 'Aspect', type: 'Type', orb: 'Orb' }, retrogrades: { previous: 'Previous', next: 'Next', found: 'retrograde periods found', calculating: 'Calculating retrogrades for', error: 'Error calculating retrogrades', retry: 'Try again', timeline: 'Visual Timeline', planet: 'Planet', start: 'Start', end: 'End', signs: 'Signs', days: 'Days', daySuffix: 'd', none: 'No retrograde periods found for' } },
  es: { moon: { phases: ['Luna Nueva','Creciente Cóncava','Cuarto Creciente','Gibosa Creciente','Luna Llena','Gibosa Menguante','Cuarto Menguante','Menguante Cóncava'], signChange: 'Cambio de signo' }, aspects: { exact: 'aspectos exactos', none: 'Ningún aspecto exacto este mes (orbe < 1°)', day: 'Día', aspect: 'Aspecto', type: 'Tipo', orb: 'Orbe' }, retrogrades: { previous: 'Anterior', next: 'Siguiente', found: 'períodos retrógrados encontrados', calculating: 'Calculando retrógrados de', error: 'Error al calcular los retrógrados', retry: 'Intentar de nuevo', timeline: 'Línea de Tiempo Visual', planet: 'Planeta', start: 'Inicio', end: 'Fin', signs: 'Signos', days: 'Días', daySuffix: 'd', none: 'No se encontraron períodos retrógrados para' } },
  fr: { moon: { phases: ['Nouvelle Lune','Premier Croissant','Premier Quartier','Gibbeuse Croissante','Pleine Lune','Gibbeuse Décroissante','Dernier Quartier','Dernier Croissant'], signChange: 'Changement de signe' }, aspects: { exact: 'aspects exacts', none: 'Aucun aspect exact ce mois-ci (orbe < 1°)', day: 'Jour', aspect: 'Aspect', type: 'Type', orb: 'Orbe' }, retrogrades: { previous: 'Précédent', next: 'Suivant', found: 'périodes rétrogrades trouvées', calculating: 'Calcul des rétrogrades pour', error: 'Erreur lors du calcul des rétrogrades', retry: 'Réessayer', timeline: 'Chronologie Visuelle', planet: 'Planète', start: 'Début', end: 'Fin', signs: 'Signes', days: 'Jours', daySuffix: 'j', none: 'Aucune période rétrograde trouvée pour' } },
  de: { moon: { phases: ['Neumond','Zunehmende Sichel','Erstes Viertel','Zunehmender Dreiviertelmond','Vollmond','Abnehmender Dreiviertelmond','Letztes Viertel','Abnehmende Sichel'], signChange: 'Zeichenwechsel' }, aspects: { exact: 'exakte Aspekte', none: 'Keine exakten Aspekte in diesem Monat (Orbis < 1°)', day: 'Tag', aspect: 'Aspekt', type: 'Typ', orb: 'Orbis' }, retrogrades: { previous: 'Zurück', next: 'Weiter', found: 'rückläufige Perioden gefunden', calculating: 'Rückläufigkeiten werden berechnet für', error: 'Fehler bei der Berechnung der Rückläufigkeiten', retry: 'Erneut versuchen', timeline: 'Visuelle Zeitleiste', planet: 'Planet', start: 'Beginn', end: 'Ende', signs: 'Zeichen', days: 'Tage', daySuffix: 'T', none: 'Keine rückläufigen Perioden gefunden für' } },
  it: { moon: { phases: ['Luna Nuova','Falce Crescente','Primo Quarto','Gibbosa Crescente','Luna Piena','Gibbosa Calante','Ultimo Quarto','Falce Calante'], signChange: 'Cambio di segno' }, aspects: { exact: 'aspetti esatti', none: 'Nessun aspetto esatto questo mese (orbe < 1°)', day: 'Giorno', aspect: 'Aspetto', type: 'Tipo', orb: 'Orbe' }, retrogrades: { previous: 'Precedente', next: 'Successivo', found: 'periodi retrogradi trovati', calculating: 'Calcolo dei retrogradi per', error: 'Errore nel calcolo dei retrogradi', retry: 'Riprova', timeline: 'Cronologia Visiva', planet: 'Pianeta', start: 'Inizio', end: 'Fine', signs: 'Segni', days: 'Giorni', daySuffix: 'g', none: 'Nessun periodo retrogrado trovato per' } },
  ja: { moon: { phases: ['新月','三日月','上弦','十三夜月','満月','寝待月','下弦','有明月'], signChange: '星座の移動' }, aspects: { exact: '正確なアスペクト', none: '今月は正確なアスペクトがありません（オーブ < 1°）', day: '日', aspect: 'アスペクト', type: '種類', orb: 'オーブ' }, retrogrades: { previous: '前年', next: '翌年', found: '件の逆行期間', calculating: '逆行を計算中：', error: '逆行の計算中にエラーが発生しました', retry: '再試行', timeline: 'ビジュアル・タイムライン', planet: '惑星', start: '開始', end: '終了', signs: '星座', days: '日数', daySuffix: '日', none: '逆行期間が見つかりません：' } },
  zh: { moon: { phases: ['新月','娥眉月','上弦月','盈凸月','满月','亏凸月','下弦月','残月'], signChange: '星座变更' }, aspects: { exact: '个精确相位', none: '本月没有精确相位（容许度 < 1°）', day: '日期', aspect: '相位', type: '类型', orb: '容许度' }, retrogrades: { previous: '上一年', next: '下一年', found: '个逆行时段', calculating: '正在计算逆行：', error: '计算逆行时出错', retry: '重试', timeline: '可视时间线', planet: '行星', start: '开始', end: '结束', signs: '星座', days: '天数', daySuffix: '天', none: '未找到逆行时段：' } },
  ru: { moon: { phases: ['Новолуние','Растущий серп','Первая четверть','Растущая Луна','Полнолуние','Убывающая Луна','Последняя четверть','Убывающий серп'], signChange: 'Смена знака' }, aspects: { exact: 'точных аспектов', none: 'В этом месяце нет точных аспектов (орбис < 1°)', day: 'День', aspect: 'Аспект', type: 'Тип', orb: 'Орбис' }, retrogrades: { previous: 'Предыдущий', next: 'Следующий', found: 'ретроградных периодов найдено', calculating: 'Расчёт ретроградов на', error: 'Ошибка расчёта ретроградов', retry: 'Попробовать снова', timeline: 'Визуальная Шкала', planet: 'Планета', start: 'Начало', end: 'Конец', signs: 'Знаки', days: 'Дни', daySuffix: 'д', none: 'Ретроградные периоды не найдены для' } },
  tr: { moon: { phases: ['Yeni Ay','Büyüyen Hilal','İlk Dördün','Büyüyen Şişkin Ay','Dolunay','Küçülen Şişkin Ay','Son Dördün','Küçülen Hilal'], signChange: 'Burç değişimi' }, aspects: { exact: 'kesin açı', none: 'Bu ay kesin açı yok (orb < 1°)', day: 'Gün', aspect: 'Açı', type: 'Tür', orb: 'Orb' }, retrogrades: { previous: 'Önceki', next: 'Sonraki', found: 'retrograd dönem bulundu', calculating: 'Retrogradlar hesaplanıyor:', error: 'Retrogradlar hesaplanırken hata oluştu', retry: 'Tekrar dene', timeline: 'Görsel Zaman Çizelgesi', planet: 'Gezegen', start: 'Başlangıç', end: 'Bitiş', signs: 'Burçlar', days: 'Gün', daySuffix: 'g', none: 'Retrograd dönem bulunamadı:' } },
  nl: { moon: { phases: ['Nieuwe Maan','Wassende Sikkel','Eerste Kwartier','Wassende Maan','Volle Maan','Afnemende Maan','Laatste Kwartier','Afnemende Sikkel'], signChange: 'Tekenwisseling' }, aspects: { exact: 'exacte aspecten', none: 'Geen exacte aspecten deze maand (orb < 1°)', day: 'Dag', aspect: 'Aspect', type: 'Type', orb: 'Orb' }, retrogrades: { previous: 'Vorige', next: 'Volgende', found: 'retrograde perioden gevonden', calculating: 'Retrogrades berekenen voor', error: 'Fout bij het berekenen van retrogrades', retry: 'Opnieuw proberen', timeline: 'Visuele Tijdlijn', planet: 'Planeet', start: 'Begin', end: 'Einde', signs: 'Tekens', days: 'Dagen', daySuffix: 'd', none: 'Geen retrograde perioden gevonden voor' } },
};

export function getToolsUi(locale: Locale): ToolsUiText {
  return texts[locale] || texts.pt;
}

interface CurrentPlanetsText {
  realtime: string;
  illumination: string;
  position: string;
  longitude: string;
}

const currentPlanetsTexts: Record<Locale, CurrentPlanetsText> = {
  pt: { realtime: 'Posições em tempo real', illumination: 'Iluminação', position: 'Posição', longitude: 'Longitude' },
  en: { realtime: 'Real-time positions', illumination: 'Illumination', position: 'Position', longitude: 'Longitude' },
  es: { realtime: 'Posiciones en tiempo real', illumination: 'Iluminación', position: 'Posición', longitude: 'Longitud' },
  fr: { realtime: 'Positions en temps réel', illumination: 'Illumination', position: 'Position', longitude: 'Longitude' },
  de: { realtime: 'Positionen in Echtzeit', illumination: 'Beleuchtung', position: 'Position', longitude: 'Längengrad' },
  it: { realtime: 'Posizioni in tempo reale', illumination: 'Illuminazione', position: 'Posizione', longitude: 'Longitudine' },
  ja: { realtime: 'リアルタイムの位置', illumination: '照度', position: '位置', longitude: '黄経' },
  zh: { realtime: '实时位置', illumination: '照明度', position: '位置', longitude: '黄经' },
  ru: { realtime: 'Положения в реальном времени', illumination: 'Освещённость', position: 'Положение', longitude: 'Долгота' },
  tr: { realtime: 'Gerçek zamanlı konumlar', illumination: 'Aydınlanma', position: 'Konum', longitude: 'Boylam' },
  nl: { realtime: 'Realtime posities', illumination: 'Verlichting', position: 'Positie', longitude: 'Lengtegraad' },
};

export function getCurrentPlanetsText(locale: Locale): CurrentPlanetsText {
  return currentPlanetsTexts[locale] || currentPlanetsTexts.pt;
}
