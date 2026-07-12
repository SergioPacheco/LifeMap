import { createSignal, onMount, For, Show } from 'solid-js';
import { db, getCartTotal, clearCart, type CartItem } from '../../store/db';
import { processPayment, savePurchase } from '../../store/payment';
import { calculateNatalChart, initSweph } from '../../engine/index';
import { generateNatalPdf, downloadPdf } from '../../reports/pdf-generator';
import { generateAnnualPdf, generateRelationshipPdf, generatePsychologicalPdf, generateCareerPdf, generateSevenSinsPdf } from '../../reports/report-generators';
import { generateFinancialPdf } from '../../reports/financial-report';
import { generateSpiritualPdf } from '../../reports/spiritual-report';
import { generateSaturnReturnPdf } from '../../reports/saturn-return-report';
import { localePath, getTranslations } from '../../i18n';
import type { Locale } from '../../i18n';
import { birthDataFromProfile } from '../../utils/profile';

interface Props {
  locale: Locale;
}

export default function CartPage(props: Props) {
  const [items, setItems] = createSignal<CartItem[]>([]);
  const [total, setTotal] = createSignal(0);
  const [checkingOut, setCheckingOut] = createSignal(false);
  const [checkoutStatus, setCheckoutStatus] = createSignal<'idle' | 'paying' | 'generating' | 'done' | 'error'>('idle');
  const [checkoutError, setCheckoutError] = createSignal('');

  const t = () => getTranslations(props.locale);

  onMount(async () => {
    await refreshCart();
  });

  const refreshCart = async () => {
    const cartItems = await db.cart.toArray();
    setItems(cartItems);
    setTotal(await getCartTotal());
  };

  const removeItem = async (id: number) => {
    await db.cart.delete(id);
    await refreshCart();
  };

  const handleClear = async () => {
    const msg = t().cart.clearConfirm;
    if (confirm(msg)) {
      await clearCart();
      await refreshCart();
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setCheckoutStatus('paying');
    setCheckoutError('');

    try {
      await initSweph();
      const cartItems = items();

      // Process each item in the cart
      for (const item of cartItems) {
        // 1. Payment mock (2s per item)
        const result = await processPayment(item.productId, item.profileId, item.profileName);
        if (!result.success) {
          setCheckoutError(result.error || 'Erro no pagamento');
          setCheckoutStatus('error');
          setCheckingOut(false);
          return;
        }

        // 2. Generate PDF
        setCheckoutStatus('generating');

        // Load profile data (use item's profileId or fallback to latest profile)
        let profile = item.profileId ? await db.profiles.get(item.profileId) : null;
        if (!profile) {
          const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
          if (profiles.length === 0) {
            setCheckoutError('Nenhum perfil salvo. Calcule um mapa natal primeiro.');
            setCheckoutStatus('error');
            setCheckingOut(false);
            return;
          }
          profile = profiles[0];
        }

        const chart = calculateNatalChart(birthDataFromProfile(profile));

        const opts = {
          locale: props.locale,
          isTryout: false,
          profileName: profile.name,
          birthDate: profile.date,
          birthTime: profile.time,
          birthCity: profile.city,
        };

        let blob: Blob;
        switch (item.productId) {
          case 'previsao-anual':
          case 'annual-forecast':
            blob = generateAnnualPdf(chart, opts); break;
          case 'relacionamento':
          case 'relationship':
            blob = generateRelationshipPdf(chart, opts); break;
          case 'psicologico':
          case 'psychological':
            blob = generatePsychologicalPdf(chart, opts); break;
          case 'carreira':
          case 'career':
            blob = generateCareerPdf(chart, opts); break;
          case 'seven-sins':
            blob = generateSevenSinsPdf(chart, opts); break;
          case 'financeiro':
          case 'financial':
            blob = generateFinancialPdf(chart, opts); break;
          case 'espiritual':
          case 'spiritual':
            blob = generateSpiritualPdf(chart, opts); break;
          case 'retorno-saturno':
          case 'saturn-return':
            blob = generateSaturnReturnPdf(chart, opts); break;
          default:
            blob = generateNatalPdf(chart, opts);
        }

        // 3. Save to IndexedDB
        await savePurchase(result.sessionId, item.productId, item.profileId, item.profileName, blob);

        // 4. Auto-download
        const filename = `LifeMap_${item.productId}_${profile.name.replace(/\s/g, '_')}.pdf`;
        downloadPdf(blob, filename);
      }

      // 5. Clear cart and done
      await clearCart();
      await refreshCart();
      setCheckoutStatus('done');
    } catch (e) {
      console.error('Checkout error:', e);
      setCheckoutError('Erro inesperado. Tente novamente.');
      setCheckoutStatus('error');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div class="max-w-3xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-serif font-bold text-cream mb-8">
        {t().cart.title}
      </h1>

      <Show when={items().length === 0}>
        <div class="text-center py-20 glass rounded-2xl">
          <div class="text-6xl mb-4">🛒</div>
          <p class="text-lg text-cream-dark mb-2">
            {t().cart.empty}
          </p>
          <p class="text-sm text-muted mb-6">
            {t().cart.emptyDesc}
          </p>
          <a
            href={localePath('/reports', props.locale)}
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-xl hover:shadow-gold transition-all"
          >
            {t().cart.viewReports}
            <span>→</span>
          </a>
        </div>
      </Show>

      <Show when={items().length > 0}>
        <div class="space-y-3 mb-8">
          <For each={items()}>
            {(item) => (
              <div class="flex items-center justify-between p-4 glass rounded-xl border border-base-300">
                <div class="flex-1">
                  <p class="font-medium text-cream">{item.productName}</p>
                  <Show when={item.profileName}>
                    <p class="text-sm text-muted">
                      {t().cart.for}: {item.profileName}
                    </p>
                  </Show>
                </div>
                <div class="flex items-center gap-4">
                  <span class="text-lg font-bold text-gold">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </span>
                  <button
                    onClick={() => removeItem(item.id!)}
                    class="p-2 text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                    title={t().cart.remove}
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Summary */}
        <div class="glass rounded-xl p-6 border border-gold/20">
          <div class="flex justify-between items-center mb-6">
            <span class="text-cream-dark">{t().cart.total}:</span>
            <span class="text-2xl font-bold text-gold">
              R$ {total().toFixed(2).replace('.', ',')}
            </span>
          </div>

          <Show when={checkoutStatus() === 'idle' || checkoutStatus() === 'error'}>
            <button
              onClick={handleCheckout}
              disabled={checkingOut()}
              class="w-full px-6 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold text-lg rounded-xl transition-all hover:shadow-gold-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {t().cart.checkout}
            </button>
          </Show>

          <Show when={checkoutStatus() === 'paying'}>
            <div class="w-full px-6 py-4 bg-base-200 rounded-xl text-center">
              <div class="animate-pulse text-gold text-lg">💳 Processando pagamento...</div>
            </div>
          </Show>

          <Show when={checkoutStatus() === 'generating'}>
            <div class="w-full px-6 py-4 bg-base-200 rounded-xl text-center">
              <div class="animate-spin inline-block text-2xl text-gold">✦</div>
              <p class="text-sm text-cream mt-1">Gerando seus relatórios...</p>
            </div>
          </Show>

          <Show when={checkoutStatus() === 'done'}>
            <div class="w-full px-6 py-4 bg-green-900/20 border border-green-800/30 rounded-xl text-center">
              <p class="text-lg text-green-400 font-medium">✅ Compra finalizada!</p>
              <p class="text-sm text-muted mt-1">PDFs baixados automaticamente.</p>
              <a href={localePath('/purchases', props.locale)} class="inline-block mt-3 text-sm text-gold hover:underline">
                Ver em "Meus Relatórios" →
              </a>
            </div>
          </Show>

          <Show when={checkoutStatus() === 'error'}>
            <div class="w-full px-4 py-3 bg-red-900/20 border border-red-800/30 rounded-lg text-center mb-3">
              <p class="text-sm text-red-400">{checkoutError()}</p>
            </div>
          </Show>

          <button
            onClick={handleClear}
            class="w-full mt-3 px-4 py-2 text-sm text-muted hover:text-red-400 transition-colors"
          >
            {t().cart.clearCart}
          </button>
        </div>
      </Show>
    </div>
  );
}
