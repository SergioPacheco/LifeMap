// ============================================================
// REPORT-LABELS.TS — Shared i18n labels for PDF report generators
// Sign names, planet names, months, house ordinals — all 11 locales
// ============================================================

export interface ReportLabels {
  signs: string[];
  planets: Record<string, string>;
  months: string[];
  houseOrdinal: (n: number) => string;
  houseLabel: (n: number) => string;
}

const SIGNS: Record<string, string[]> = {
  pt: ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'],
  en: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'],
  es: ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'],
  fr: ['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'],
  de: ['Widder','Stier','Zwillinge','Krebs','Löwe','Jungfrau','Waage','Skorpion','Schütze','Steinbock','Wassermann','Fische'],
  it: ['Ariete','Toro','Gemelli','Cancro','Leone','Vergine','Bilancia','Scorpione','Sagittario','Capricorno','Acquario','Pesci'],
  nl: ['Ram','Stier','Tweelingen','Kreeft','Leeuw','Maagd','Weegschaal','Schorpioen','Boogschutter','Steenbok','Waterman','Vissen'],
  tr: ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'],
  ru: ['Овен','Телец','Близнецы','Рак','Лев','Дева','Весы','Скорпион','Стрелец','Козерог','Водолей','Рыбы'],
  zh: ['白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座','水瓶座','双鱼座'],
  ja: ['牡羊座','牡牛座','双子座','蟹座','獅子座','乙女座','天秤座','蠍座','射手座','山羊座','水瓶座','魚座'],
};

const PLANETS: Record<string, Record<string, string>> = {
  pt: { sun:'Sol', moon:'Lua', mercury:'Mercúrio', venus:'Vênus', mars:'Marte', jupiter:'Júpiter', saturn:'Saturno', uranus:'Urano', neptune:'Netuno', pluto:'Plutão', northNode:'Nodo Norte', southNode:'Nodo Sul', chiron:'Quíron', lilith:'Lilith' },
  en: { sun:'Sun', moon:'Moon', mercury:'Mercury', venus:'Venus', mars:'Mars', jupiter:'Jupiter', saturn:'Saturn', uranus:'Uranus', neptune:'Neptune', pluto:'Pluto', northNode:'North Node', southNode:'South Node', chiron:'Chiron', lilith:'Lilith' },
  es: { sun:'Sol', moon:'Luna', mercury:'Mercurio', venus:'Venus', mars:'Marte', jupiter:'Júpiter', saturn:'Saturno', uranus:'Urano', neptune:'Neptuno', pluto:'Plutón', northNode:'Nodo Norte', southNode:'Nodo Sur', chiron:'Quirón', lilith:'Lilith' },
  fr: { sun:'Soleil', moon:'Lune', mercury:'Mercure', venus:'Vénus', mars:'Mars', jupiter:'Jupiter', saturn:'Saturne', uranus:'Uranus', neptune:'Neptune', pluto:'Pluton', northNode:'Nœud Nord', southNode:'Nœud Sud', chiron:'Chiron', lilith:'Lilith' },
  de: { sun:'Sonne', moon:'Mond', mercury:'Merkur', venus:'Venus', mars:'Mars', jupiter:'Jupiter', saturn:'Saturn', uranus:'Uranus', neptune:'Neptun', pluto:'Pluto', northNode:'Nordknoten', southNode:'Südknoten', chiron:'Chiron', lilith:'Lilith' },
  it: { sun:'Sole', moon:'Luna', mercury:'Mercurio', venus:'Venere', mars:'Marte', jupiter:'Giove', saturn:'Saturno', uranus:'Urano', neptune:'Nettuno', pluto:'Plutone', northNode:'Nodo Nord', southNode:'Nodo Sud', chiron:'Chirone', lilith:'Lilith' },
  nl: { sun:'Zon', moon:'Maan', mercury:'Mercurius', venus:'Venus', mars:'Mars', jupiter:'Jupiter', saturn:'Saturnus', uranus:'Uranus', neptune:'Neptunus', pluto:'Pluto', northNode:'Noordknoop', southNode:'Zuidknoop', chiron:'Chiron', lilith:'Lilith' },
  tr: { sun:'Güneş', moon:'Ay', mercury:'Merkür', venus:'Venüs', mars:'Mars', jupiter:'Jüpiter', saturn:'Satürn', uranus:'Uranüs', neptune:'Neptün', pluto:'Plüton', northNode:'Kuzey Düğümü', southNode:'Güney Düğümü', chiron:'Kiron', lilith:'Lilith' },
  ru: { sun:'Солнце', moon:'Луна', mercury:'Меркурий', venus:'Венера', mars:'Марс', jupiter:'Юпитер', saturn:'Сатурн', uranus:'Уран', neptune:'Нептун', pluto:'Плутон', northNode:'Северный Узел', southNode:'Южный Узел', chiron:'Хирон', lilith:'Лилит' },
  zh: { sun:'太阳', moon:'月亮', mercury:'水星', venus:'金星', mars:'火星', jupiter:'木星', saturn:'土星', uranus:'天王星', neptune:'海王星', pluto:'冥王星', northNode:'北交点', southNode:'南交点', chiron:'凯龙', lilith:'莉莉丝' },
  ja: { sun:'太陽', moon:'月', mercury:'水星', venus:'金星', mars:'火星', jupiter:'木星', saturn:'土星', uranus:'天王星', neptune:'海王星', pluto:'冥王星', northNode:'ノースノード', southNode:'サウスノード', chiron:'キロン', lilith:'リリス' },
};

const MONTHS: Record<string, string[]> = {
  pt: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  fr: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
  nl: ['Januari','Februari','Maart','April','Mei','Juni','Juli','Augustus','September','Oktober','November','December'],
  tr: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  zh: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
  ja: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
};

// Ordinals for house numbers (1st, 2nd, 3rd...)
function getOrdinalFn(locale: string): (n: number) => string {
  switch (locale) {
    case 'en': return (n) => { const s = ['th','st','nd','rd']; const v = n % 100; return n + (s[(v-20)%10] || s[v] || s[0]); };
    case 'fr': return (n) => n === 1 ? '1ère' : `${n}ème`;
    case 'de': return (n) => `${n}.`;
    case 'it': return (n) => `${n}°`;
    case 'nl': return (n) => `${n}e`;
    case 'tr': return (n) => `${n}.`;
    case 'ru': return (n) => `${n}-й`;
    case 'zh': return (n) => `第${n}`;
    case 'ja': return (n) => `第${n}`;
    default: return (n) => `${n}ª`; // pt, es
  }
}

// "Casa X" / "House X" / "Maison X" etc.
function getHouseLabelFn(locale: string): (n: number) => string {
  switch (locale) {
    case 'en': return (n) => `House ${n}`;
    case 'fr': return (n) => `Maison ${n}`;
    case 'de': return (n) => `${n}. Haus`;
    case 'it': return (n) => `Casa ${n}`;
    case 'nl': return (n) => `${n}e Huis`;
    case 'tr': return (n) => `${n}. Ev`;
    case 'ru': return (n) => `${n}-й Дом`;
    case 'zh': return (n) => `第${n}宫`;
    case 'ja': return (n) => `${n}ハウス`;
    default: return (n) => `Casa ${n}`; // pt, es
  }
}

/**
 * Get localized labels for PDF report generation.
 * Usage: const labels = getReportLabels(options.locale);
 */
export function getReportLabels(locale: string): ReportLabels {
  const loc = locale in SIGNS ? locale : 'en';
  return {
    signs: SIGNS[loc],
    planets: PLANETS[loc],
    months: MONTHS[loc],
    houseOrdinal: getOrdinalFn(loc),
    houseLabel: getHouseLabelFn(loc),
  };
}

// Universal — no translation needed
export const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
