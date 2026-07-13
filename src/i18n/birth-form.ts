import type { Locale } from './index';

interface BirthFormText {
  optional: string;
  advanced: string;
  customized: string;
  extraBodies: string;
  asteroids: string;
  partOfFortune: string;
  visualization: string;
  showTodayTransits: string;
  transitsNote: string;
  lunarNode: string;
  trueNode: string;
  meanNode: string;
  aspectOrbs: string;
  presetDefault: string;
  presetTight: string;
  presetWide: string;
  largerOrbs: string;
  reset: string;
}

const texts: Record<Locale, BirthFormText> = {
  pt: { optional: 'opcional', advanced: 'Seleção Estendida', customized: 'Customizado', extraBodies: 'Corpos Extras', asteroids: 'Asteroides (Ceres, Vesta, Pallas, Juno)', partOfFortune: 'Parte da Fortuna', visualization: 'Visualização', showTodayTransits: 'Mostrar trânsitos de hoje', transitsNote: 'Sobrepõe as posições planetárias de hoje ao seu mapa natal', lunarNode: 'Nodo Lunar', trueNode: 'Nodo Verdadeiro', meanNode: 'Nodo Médio', aspectOrbs: 'Orbes de Aspecto', presetDefault: 'Padrão', presetTight: 'Apertado', presetWide: 'Largo', largerOrbs: 'Orbes maiores = mais aspectos detectados', reset: 'Resetar para configuração padrão' },
  en: { optional: 'optional', advanced: 'Advanced Options', customized: 'Customized', extraBodies: 'Extra Bodies', asteroids: 'Asteroids (Ceres, Vesta, Pallas, Juno)', partOfFortune: 'Part of Fortune', visualization: 'Display', showTodayTransits: "Show today's transits", transitsNote: "Overlays today's planetary positions on your natal chart", lunarNode: 'Lunar Node', trueNode: 'True Node', meanNode: 'Mean Node', aspectOrbs: 'Aspect Orbs', presetDefault: 'Default', presetTight: 'Tight', presetWide: 'Wide', largerOrbs: 'Larger orbs = more aspects detected', reset: 'Reset to default settings' },
  es: { optional: 'opcional', advanced: 'Opciones Avanzadas', customized: 'Personalizado', extraBodies: 'Cuerpos Adicionales', asteroids: 'Asteroides (Ceres, Vesta, Pallas, Juno)', partOfFortune: 'Parte de la Fortuna', visualization: 'Visualización', showTodayTransits: 'Mostrar los tránsitos de hoy', transitsNote: 'Superpone las posiciones planetarias de hoy a tu carta natal', lunarNode: 'Nodo Lunar', trueNode: 'Nodo Verdadero', meanNode: 'Nodo Medio', aspectOrbs: 'Orbes de Aspecto', presetDefault: 'Predeterminado', presetTight: 'Estrecho', presetWide: 'Amplio', largerOrbs: 'Orbes mayores = más aspectos detectados', reset: 'Restablecer la configuración predeterminada' },
  fr: { optional: 'facultatif', advanced: 'Options Avancées', customized: 'Personnalisé', extraBodies: 'Corps Supplémentaires', asteroids: 'Astéroïdes (Cérès, Vesta, Pallas, Junon)', partOfFortune: 'Part de Fortune', visualization: 'Affichage', showTodayTransits: "Afficher les transits du jour", transitsNote: "Superpose les positions planétaires du jour à votre thème natal", lunarNode: 'Nœud Lunaire', trueNode: 'Nœud Vrai', meanNode: 'Nœud Moyen', aspectOrbs: "Orbes d'Aspect", presetDefault: 'Standard', presetTight: 'Serré', presetWide: 'Large', largerOrbs: "Orbes plus larges = davantage d'aspects détectés", reset: 'Rétablir les paramètres par défaut' },
  de: { optional: 'optional', advanced: 'Erweiterte Optionen', customized: 'Angepasst', extraBodies: 'Zusätzliche Himmelskörper', asteroids: 'Asteroiden (Ceres, Vesta, Pallas, Juno)', partOfFortune: 'Glückspunkt', visualization: 'Darstellung', showTodayTransits: 'Heutige Transite anzeigen', transitsNote: 'Legt die heutigen Planetenpositionen über Ihr Geburtshoroskop', lunarNode: 'Mondknoten', trueNode: 'Wahrer Mondknoten', meanNode: 'Mittlerer Mondknoten', aspectOrbs: 'Aspektorben', presetDefault: 'Standard', presetTight: 'Eng', presetWide: 'Weit', largerOrbs: 'Größere Orben = mehr erkannte Aspekte', reset: 'Auf Standardeinstellungen zurücksetzen' },
  it: { optional: 'facoltativo', advanced: 'Opzioni Avanzate', customized: 'Personalizzato', extraBodies: 'Corpi Aggiuntivi', asteroids: 'Asteroidi (Cerere, Vesta, Pallade, Giunone)', partOfFortune: 'Parte di Fortuna', visualization: 'Visualizzazione', showTodayTransits: 'Mostra i transiti di oggi', transitsNote: 'Sovrappone le posizioni planetarie di oggi al tema natale', lunarNode: 'Nodo Lunare', trueNode: 'Nodo Vero', meanNode: 'Nodo Medio', aspectOrbs: 'Orbi degli Aspetti', presetDefault: 'Predefinito', presetTight: 'Stretto', presetWide: 'Ampio', largerOrbs: 'Orbi maggiori = più aspetti rilevati', reset: 'Ripristina le impostazioni predefinite' },
  ja: { optional: '任意', advanced: '詳細オプション', customized: 'カスタマイズ済み', extraBodies: '追加天体', asteroids: '小惑星（セレス、ベスタ、パラス、ジュノー）', partOfFortune: 'パート・オブ・フォーチュン', visualization: '表示', showTodayTransits: '今日のトランジットを表示', transitsNote: '今日の惑星位置を出生図に重ねて表示します', lunarNode: '月のノード', trueNode: 'トゥルーノード', meanNode: 'ミーンノード', aspectOrbs: 'アスペクトのオーブ', presetDefault: '標準', presetTight: '狭い', presetWide: '広い', largerOrbs: 'オーブが広いほど検出されるアスペクトが増えます', reset: '標準設定に戻す' },
  zh: { optional: '可选', advanced: '高级选项', customized: '已自定义', extraBodies: '附加天体', asteroids: '小行星（谷神星、灶神星、智神星、婚神星）', partOfFortune: '福点', visualization: '显示', showTodayTransits: '显示今日行运', transitsNote: '将今日行星位置叠加到本命盘上', lunarNode: '月交点', trueNode: '真交点', meanNode: '平均交点', aspectOrbs: '相位容许度', presetDefault: '默认', presetTight: '严格', presetWide: '宽松', largerOrbs: '容许度越大，检测到的相位越多', reset: '恢复默认设置' },
  ru: { optional: 'необязательно', advanced: 'Расширенные Настройки', customized: 'Настроено', extraBodies: 'Дополнительные Объекты', asteroids: 'Астероиды (Церера, Веста, Паллада, Юнона)', partOfFortune: 'Парс Фортуны', visualization: 'Отображение', showTodayTransits: 'Показать сегодняшние транзиты', transitsNote: 'Накладывает сегодняшние положения планет на натальную карту', lunarNode: 'Лунный Узел', trueNode: 'Истинный Узел', meanNode: 'Средний Узел', aspectOrbs: 'Орбисы Аспектов', presetDefault: 'Стандартный', presetTight: 'Узкий', presetWide: 'Широкий', largerOrbs: 'Больше орбис = больше обнаруженных аспектов', reset: 'Восстановить настройки по умолчанию' },
  tr: { optional: 'isteğe bağlı', advanced: 'Gelişmiş Seçenekler', customized: 'Özelleştirilmiş', extraBodies: 'Ek Gök Cisimleri', asteroids: 'Asteroitler (Ceres, Vesta, Pallas, Juno)', partOfFortune: 'Şans Noktası', visualization: 'Görünüm', showTodayTransits: 'Bugünün transitlerini göster', transitsNote: 'Bugünün gezegen konumlarını doğum haritanızın üzerine bindirir', lunarNode: 'Ay Düğümü', trueNode: 'Gerçek Ay Düğümü', meanNode: 'Ortalama Ay Düğümü', aspectOrbs: 'Açı Orbları', presetDefault: 'Varsayılan', presetTight: 'Dar', presetWide: 'Geniş', largerOrbs: 'Daha geniş orb = daha fazla tespit edilen açı', reset: 'Varsayılan ayarlara sıfırla' },
  nl: { optional: 'optioneel', advanced: 'Geavanceerde Opties', customized: 'Aangepast', extraBodies: 'Extra Hemellichamen', asteroids: 'Asteroïden (Ceres, Vesta, Pallas, Juno)', partOfFortune: 'Pars Fortunae', visualization: 'Weergave', showTodayTransits: 'Transits van vandaag tonen', transitsNote: 'Plaatst de huidige planeetstanden over je geboortehoroscoop', lunarNode: 'Maansknoop', trueNode: 'Ware Maansknoop', meanNode: 'Gemiddelde Maansknoop', aspectOrbs: 'Aspectorben', presetDefault: 'Standaard', presetTight: 'Nauw', presetWide: 'Ruim', largerOrbs: 'Grotere orben = meer gedetecteerde aspecten', reset: 'Standaardinstellingen herstellen' },
};

export function getBirthFormText(locale: Locale): BirthFormText {
  return texts[locale] || texts.pt;
}
