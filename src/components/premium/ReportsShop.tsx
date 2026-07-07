import { createSignal, onMount, For, Show } from 'solid-js';
import { db } from '../../store/db';
import { getTranslations, localePath, type Locale } from '../../i18n';

interface Props {
  locale?: Locale;
}

interface ProductMeta {
  id: string;
  icon: string;
  category: 'personality' | 'forecast' | 'relationship' | 'career';
  price: number;
  currency: string;
}

// Static product metadata — translations come from i18n/*.json
const PRODUCTS_META: ProductMeta[] = [
  { id: 'natal-completo', icon: '☉', category: 'personality', price: 29.90, currency: 'BRL' },
  { id: 'relacionamento', icon: '♡', category: 'relationship', price: 39.90, currency: 'BRL' },
  { id: 'previsao-anual', icon: '↻', category: 'forecast', price: 34.90, currency: 'BRL' },
  { id: 'carreira', icon: '♄', category: 'career', price: 29.90, currency: 'BRL' },
  { id: 'psicologico', icon: '♇', category: 'personality', price: 39.90, currency: 'BRL' },
  { id: 'seven-sins', icon: '🔥', category: 'personality', price: 19.90, currency: 'BRL' },
  { id: 'financeiro', icon: '💰', category: 'career', price: 29.90, currency: 'BRL' },
  { id: 'espiritual', icon: '🔮', category: 'personality', price: 34.90, currency: 'BRL' },
  { id: 'retorno-saturno', icon: '♄', category: 'forecast', price: 24.90, currency: 'BRL' },
];

const CATEGORY_KEYS = ['all', 'personality', 'forecast', 'relationship', 'career'] as const;

export default function ReportsShop(props: Props) {
  const locale = () => props.locale || 'pt';
  const [selectedCategory, setSelectedCategory] = createSignal<string>('all');
  const [addedToCart, setAddedToCart] = createSignal<string | null>(null);
  const [cartCount, setCartCount] = createSignal(0);
  const [cartItems, setCartItems] = createSignal<Set<string>>(new Set());
  const [showToast, setShowToast] = createSignal(false);
  const [lastAdded, setLastAdded] = createSignal('');
  const t = () => getTranslations(locale());

  const products = () => t().reports.products as Record<string, { name: string; description: string; pages: string; features: string[] }>;
  const categories = () => t().reports.categories as Record<string, string>;
  const trust = () => t().reports.trust as { instant: string; privacy: string; offline: string };
  const added = () => (t().reports as any).added as string;

  const filteredProducts = () => {
    if (selectedCategory() === 'all') return PRODUCTS_META;
    return PRODUCTS_META.filter(p => p.category === selectedCategory());
  };

  // Load cart count on mount
  onMount(async () => {
    try {
      const items = await db.cart.toArray();
      setCartCount(items.length);
      setCartItems(new Set(items.map(i => i.productId)));
    } catch (e) { /* IndexedDB may not be available */ }
  });

  const addToCart = async (product: ProductMeta) => {
    const productTexts = products()[product.id];
    const productName = productTexts?.name || product.id;

    // Check if already in cart
    const existing = await db.cart.where('productId').equals(product.id).first();
    if (existing) {
      setAddedToCart(product.id);
      setLastAdded(productName);
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
      productName: productName,
      profileId: latestProfile.id!,
      profileName: latestProfile.name,
      price: product.price,
      currency: product.currency,
      addedAt: new Date(),
    });
    setAddedToCart(product.id);
    setCartCount(c => c + 1);
    setCartItems(prev => new Set([...prev, product.id]));
    setLastAdded(productName);
    setShowToast(true);
    setTimeout(() => setAddedToCart(null), 2500);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div class="space-y-6">
      {/* Toast notification */}
      <Show when={showToast()}>
        <div class="fixed top-4 right-4 z-50 animate-slide-in">
          <div class="glass rounded-xl border border-green-500/30 p-4 shadow-lg flex items-center gap-3 max-w-sm">
            <span class="text-2xl">✅</span>
            <div class="flex-1">
              <p class="text-sm font-medium text-cream">{lastAdded()}</p>
              <p class="text-xs text-green-400">{added()}</p>
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
        <For each={[...CATEGORY_KEYS]}>
          {(catId) => (
            <button
              onClick={() => setSelectedCategory(catId)}
              class={`px-4 py-2 text-sm rounded-full transition-all ${
                selectedCategory() === catId
                  ? 'bg-gradient-to-r from-gold-dark to-gold text-black font-semibold'
                  : 'bg-base-200 text-cream-dark border border-base-300 hover:border-gold/30 hover:text-gold'
              }`}
            >
              {categories()[catId] || catId}
            </button>
          )}
        </For>
      </div>

      {/* Products grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={filteredProducts()}>
          {(product) => {
            const texts = () => products()[product.id] || { name: product.id, description: '', pages: '', features: [] };
            return (
              <div class={`glass rounded-2xl border-glow overflow-hidden hover:border-gold/40 hover:shadow-gold transition-all group ${
                addedToCart() === product.id ? 'ring-2 ring-green-500/50 scale-[1.02]' : ''
              }`}>
                <div class="p-6 pb-4">
                  <div class="flex items-start justify-between">
                    <div class="text-3xl">{product.icon}</div>
                    <span class="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full border border-gold/20">
                      {texts().pages}
                    </span>
                  </div>
                  <h3 class="text-lg font-semibold text-cream mt-3 group-hover:text-gold transition-colors">
                    {texts().name}
                  </h3>
                  <p class="text-sm text-muted mt-1">{texts().description}</p>
                </div>
                <div class="px-6 pb-4">
                  <ul class="space-y-1">
                    <For each={texts().features}>
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
                        ? added()
                        : cartItems().has(product.id)
                        ? '✓ ' + (t().cart?.inCart || 'In cart')
                        : t().reports.buyNow}
                    </button>
                  </div>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* Trust badges */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-center">
        <div class="p-4 glass rounded-2xl border-glow"><div class="text-2xl mb-1">⚡</div><p class="text-xs text-muted">{trust().instant}</p></div>
        <div class="p-4 glass rounded-2xl border-glow"><div class="text-2xl mb-1">🔒</div><p class="text-xs text-muted">{trust().privacy}</p></div>
        <div class="p-4 glass rounded-2xl border-glow"><div class="text-2xl mb-1">📱</div><p class="text-xs text-muted">{trust().offline}</p></div>
      </div>
    </div>
  );
}
