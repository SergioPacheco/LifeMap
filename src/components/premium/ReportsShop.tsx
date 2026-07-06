import { createSignal, For, Show } from 'solid-js';
import { db } from '../../store/db';
import { getTranslations, type Locale } from '../../i18n';

interface Props {
  locale?: Locale;
}

interface Product {
  id: string;
  icon: string;
  category: 'personality' | 'forecast' | 'relationship' | 'career';
  price: number;
  currency: string;
  pages: { pt: string; en: string };
  name: Record<string, string>;
  description: Record<string, string>;
  features: Record<string, string[]>;
}

const PRODUCTS: Product[] = [
  {
    id: 'natal-completo', icon: '☉', category: 'personality', price: 29.90, currency: 'BRL',
    pages: { pt: '20-30 páginas', en: '20-30 pages' },
    name: { pt: 'Mapa Natal Completo', en: 'Complete Natal Report', es: 'Carta Natal Completa', fr: 'Rapport Natal Complet', de: 'Vollständiger Geburtsbericht', it: 'Report Natale Completo', nl: 'Volledig Geboorterapport', tr: 'Tam Doğum Raporu', ru: 'Полный Натальный Отчёт', zh: '完整本命报告', ja: '完全ネイタルレポート' },
    description: { pt: 'Análise profunda de todas as posições, aspectos, dignidades e casas do seu mapa natal.', en: 'In-depth analysis of all positions, aspects, dignities and houses in your natal chart.', es: 'Análisis profundo de todas las posiciones, aspectos y casas de tu carta natal.', fr: 'Analyse approfondie de toutes les positions, aspects et maisons de votre carte natale.', de: 'Tiefgehende Analyse aller Positionen, Aspekte und Häuser in Ihrem Geburtshoroskop.', it: 'Analisi approfondita di tutte le posizioni, aspetti e case della tua carta natale.', nl: 'Diepgaande analyse van alle posities, aspecten en huizen in uw geboortekaart.', tr: 'Doğum haritanızdaki tüm konum, açı ve evlerin derinlemesine analizi.', ru: 'Глубокий анализ всех позиций, аспектов и домов вашей натальной карты.', zh: '深度分析本命盘中所有行星位置、相位和宫位。', ja: 'ネイタルチャートの全惑星位置、アスペクト、ハウスの詳細分析。' },
    features: { pt: ['Todos os planetas em signos e casas', 'Aspectos com interpretação detalhada', 'Dignidades e debilidades', 'Síntese da personalidade', 'Mapa visual em alta resolução'], en: ['All planets in signs and houses', 'Aspects with detailed interpretation', 'Dignities and debilities', 'Personality synthesis', 'High-resolution visual chart'] },
  },
  {
    id: 'relacionamento', icon: '♡', category: 'relationship', price: 39.90, currency: 'BRL',
    pages: { pt: '25-35 páginas', en: '25-35 pages' },
    name: { pt: 'Relatório de Relacionamento', en: 'Relationship Report', es: 'Informe de Relación', fr: 'Rapport de Relation', de: 'Beziehungsbericht', it: 'Report di Relazione', nl: 'Relatierapport', tr: 'İlişki Raporu', ru: 'Отчёт об Отношениях', zh: '关系报告', ja: '関係性レポート' },
    description: { pt: 'Análise completa da sinastria e mapa composto entre duas pessoas.', en: 'Complete synastry and composite analysis between two people.', es: 'Análisis completo de sinastría y carta compuesta entre dos personas.', fr: 'Analyse complète de synastrie et composite entre deux personnes.', de: 'Vollständige Synastrie- und Komposit-Analyse zwischen zwei Personen.', it: 'Analisi completa di sinastria e composito tra due persone.', nl: 'Volledige synastrie- en composietanalyse tussen twee personen.', tr: 'İki kişi arasında tam sinastri ve kompozit analizi.', ru: 'Полный анализ синастрии и композита между двумя людьми.', zh: '两人之间的完整合盘和组合盘分析。', ja: '二人の間のシナストリーとコンポジットの完全分析。' },
    features: { pt: ['Sinastria completa (planeta × planeta)', 'Mapa Composto com interpretação', 'Pontos de atração e tensão', 'Compatibilidade por área de vida', 'Conselhos para o relacionamento'], en: ['Complete synastry (planet × planet)', 'Composite chart with interpretation', 'Attraction and tension points', 'Compatibility by life area', 'Relationship advice'] },
  },
  {
    id: 'previsao-anual', icon: '↻', category: 'forecast', price: 34.90, currency: 'BRL',
    pages: { pt: '30-40 páginas', en: '30-40 pages' },
    name: { pt: 'Previsão Anual', en: 'Annual Forecast', es: 'Previsión Anual', fr: 'Prévision Annuelle', de: 'Jahresvorschau', it: 'Previsione Annuale', nl: 'Jaarvoorspelling', tr: 'Yıllık Öngörü', ru: 'Годовой Прогноз', zh: '年度预测', ja: '年間予測' },
    description: { pt: 'Trânsitos, profecção e revolução solar combinados para os próximos 12 meses.', en: 'Transits, profection and solar return combined for the next 12 months.', es: 'Tránsitos, profección y revolución solar combinados para los próximos 12 meses.', fr: 'Transits, profection et révolution solaire combinés pour les 12 prochains mois.', de: 'Transite, Profektionen und Solarrückkehr kombiniert für die nächsten 12 Monate.', it: 'Transiti, profezione e rivoluzione solare combinati per i prossimi 12 mesi.', nl: 'Transits, profectie en zonneretour gecombineerd voor de komende 12 maanden.', tr: 'Önümüzdeki 12 ay için transitler, profeksiyon ve güneş dönüşü.', ru: 'Транзиты, профекция и солнечный возврат на следующие 12 месяцев.', zh: '未来12个月的行运、小限和太阳回归综合预测。', ja: '今後12ヶ月のトランジット、プロフェクション、ソーラーリターン。' },
    features: { pt: ['Revolução Solar do ano', 'Trânsitos mês a mês', 'Profecção anual', 'Eclipses pessoais', 'Períodos favoráveis e desafiadores'], en: ['Solar Return of the year', 'Month-by-month transits', 'Annual profection', 'Personal eclipses', 'Favorable and challenging periods'] },
  },
  {
    id: 'carreira', icon: '♄', category: 'career', price: 29.90, currency: 'BRL',
    pages: { pt: '15-20 páginas', en: '15-20 pages' },
    name: { pt: 'Carreira e Vocação', en: 'Career & Vocation', es: 'Carrera y Vocación', fr: 'Carrière et Vocation', de: 'Karriere und Berufung', it: 'Carriera e Vocazione', nl: 'Carrière en Roeping', tr: 'Kariyer ve Meslek', ru: 'Карьера и Призвание', zh: '事业与天职', ja: 'キャリアと天職' },
    description: { pt: 'Análise do potencial profissional baseada no MC, Casa 10, Saturno e Júpiter.', en: 'Professional potential analysis based on MC, 10th House, Saturn and Jupiter.', es: 'Análisis del potencial profesional basado en MC, Casa 10, Saturno y Júpiter.', fr: 'Analyse du potentiel professionnel basée sur MC, Maison 10, Saturne et Jupiter.', de: 'Berufsanalyse basierend auf MC, 10. Haus, Saturn und Jupiter.', it: 'Analisi del potenziale professionale basata su MC, Casa 10, Saturno e Giove.', nl: 'Professionele potentieelanalyse op basis van MC, 10e Huis, Saturnus en Jupiter.', tr: 'MC, 10. Ev, Satürn ve Jüpiter bazlı profesyonel potansiyel analizi.', ru: 'Анализ профессионального потенциала на основе MC, 10 Дома, Сатурна и Юпитера.', zh: '基于天顶、第十宫、土星和木星的职业潜力分析。', ja: 'MC、10ハウス、土星、木星に基づく職業的可能性の分析。' },
    features: { pt: ['MC e Casa 10 — vocação', 'Saturno — disciplina e conquista', 'Júpiter — expansão e oportunidades', 'Casa 6 — rotina de trabalho', 'Timing de mudanças de carreira'], en: ['MC and 10th House — vocation', 'Saturn — discipline and achievement', 'Jupiter — expansion and opportunities', '6th House — work routine', 'Career change timing'] },
  },
  {
    id: 'psicologico', icon: '♇', category: 'personality', price: 39.90, currency: 'BRL',
    pages: { pt: '25-35 páginas', en: '25-35 pages' },
    name: { pt: 'Análise Psicológica Profunda', en: 'Deep Psychological Analysis', es: 'Análisis Psicológico Profundo', fr: 'Analyse Psychologique Profonde', de: 'Tiefenpsychologische Analyse', it: 'Analisi Psicologica Profonda', nl: 'Diepte Psychologische Analyse', tr: 'Derin Psikolojik Analiz', ru: 'Глубокий Психологический Анализ', zh: '深度心理分析', ja: '深層心理分析' },
    description: { pt: 'Exploração detalhada da psique baseada no mapa natal — padrões inconscientes e potenciais.', en: 'Detailed exploration of the psyche based on the natal chart — unconscious patterns and potentials.', es: 'Exploración detallada de la psique basada en la carta natal — patrones inconscientes.', fr: 'Exploration détaillée de la psyché — schémas inconscients et potentiels.', de: 'Detaillierte Erforschung der Psyche — unbewusste Muster und Potenziale.', it: 'Esplorazione dettagliata della psiche — modelli inconsci e potenziali.', nl: 'Gedetailleerde verkenning van de psyche — onbewuste patronen en potenties.', tr: 'Natal haritaya dayalı detaylı psişe keşfi — bilinçdışı kalıplar.', ru: 'Детальное исследование психики — бессознательные паттерны и потенциалы.', zh: '基于本命盘的心理深度探索——潜意识模式与潜能。', ja: 'ネイタルチャートに基づく心理の詳細な探求——無意識のパターンと可能性。' },
    features: { pt: ['Lua — mundo emocional e infância', 'Plutão — poder e transformação', 'Quíron — ferida e cura', 'Casa 12 — inconsciente', 'Padrões kármicos (Nodos)'], en: ['Moon — emotional world and childhood', 'Pluto — power and transformation', 'Chiron — wound and healing', '12th House — unconscious', 'Karmic patterns (Nodes)'] },
  },
  {
    id: 'seven-sins', icon: '🔥', category: 'personality', price: 19.90, currency: 'BRL',
    pages: { pt: '15-20 páginas', en: '15-20 pages' },
    name: { pt: 'Os Sete Pecados', en: 'The Seven Sins', es: 'Los Siete Pecados', fr: 'Les Sept Péchés', de: 'Die Sieben Sünden', it: 'I Sette Peccati', nl: 'De Zeven Zonden', tr: 'Yedi Günah', ru: 'Семь Грехов', zh: '七宗罪', ja: '七つの大罪' },
    description: { pt: 'A sombra lúdica do zodíaco — seus 7 pecados astrológicos com humor e profundidade.', en: 'The playful shadow of the zodiac — your 7 astrological sins with humor and depth.', es: 'La sombra lúdica del zodíaco — tus 7 pecados astrológicos.', fr: 'L\'ombre ludique du zodiaque — vos 7 péchés astrologiques.', de: 'Der spielerische Schatten des Tierkreises — Ihre 7 astrologischen Sünden.', it: 'L\'ombra ludica dello zodiaco — i tuoi 7 peccati astrologici.', nl: 'De speelse schaduw van de dierenriem — uw 7 astrologische zonden.', tr: 'Burcun eğlenceli gölgesi — 7 astrolojik günahınız.', ru: 'Игривая тень зодиака — ваши 7 астрологических грехов.', zh: '黄道的趣味阴影面——您的7个占星学罪行。', ja: '黄道の遊び心ある影——あなたの7つの占星術的罪。' },
    features: { pt: ['Orgulho (Sol)', 'Luxúria (Vênus/Marte)', 'Avareza (Saturno)', 'Gula (Júpiter)', 'Ira (Marte)', 'Inveja (Plutão)', 'Preguiça (Netuno)'], en: ['Pride (Sun)', 'Lust (Venus/Mars)', 'Greed (Saturn)', 'Gluttony (Jupiter)', 'Wrath (Mars)', 'Envy (Pluto)', 'Sloth (Neptune)'] },
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
  const t = () => getTranslations(locale());

  const filteredProducts = () => {
    if (selectedCategory() === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory());
  };

  const getText = (map: Record<string, string>) => map[locale()] || map.en || map.pt;

  const addToCart = async (product: Product) => {
    await db.cart.add({
      productId: product.id,
      productName: getText(product.name),
      profileId: 0,
      profileName: '',
      price: product.price,
      currency: product.currency,
      addedAt: new Date(),
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const trust = () => TRUST[locale()] || TRUST.en;

  return (
    <div class="space-y-6">
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
            <div class="glass rounded-2xl border-glow overflow-hidden hover:border-gold/40 hover:shadow-gold transition-all group">
              <div class="p-6 pb-4">
                <div class="flex items-start justify-between">
                  <div class="text-3xl">{product.icon}</div>
                  <span class="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full border border-gold/20">
                    {product.pages[locale() as 'pt' | 'en'] || product.pages.en}
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
                        ? 'bg-green-600 text-white'
                        : 'bg-gradient-to-r from-gold-dark to-gold text-black hover:shadow-gold hover:scale-[1.02]'
                    }`}
                  >
                    {addedToCart() === product.id ? (ADDED[locale()] || ADDED.en) : t().reports.buyNow}
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
