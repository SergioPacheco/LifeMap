import { createSignal, onMount, For, Show } from 'solid-js';
import { db, getCartTotal, clearCart, type CartItem } from '../../store/db';
import type { Locale } from '../../i18n';

interface Props {
  locale: Locale;
}

export default function CartPage(props: Props) {
  const [items, setItems] = createSignal<CartItem[]>([]);
  const [total, setTotal] = createSignal(0);
  const [checkingOut, setCheckingOut] = createSignal(false);

  const isPt = () => props.locale === 'pt';

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
    const msg = isPt() ? 'Limpar todo o carrinho?' : 'Clear entire cart?';
    if (confirm(msg)) {
      await clearCart();
      await refreshCart();
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    alert(isPt()
      ? 'Checkout com Stripe será implementado em breve.\nPor enquanto, os relatórios estão disponíveis como preview gratuito.'
      : 'Stripe checkout coming soon.\nFor now, reports are available as free previews.'
    );
    setCheckingOut(false);
  };

  return (
    <div class="max-w-3xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-serif font-bold text-cream mb-8">
        {isPt() ? '🛒 Carrinho' : '🛒 Cart'}
      </h1>

      <Show when={items().length === 0}>
        <div class="text-center py-20 glass rounded-2xl">
          <div class="text-6xl mb-4">🛒</div>
          <p class="text-lg text-cream-dark mb-2">
            {isPt() ? 'Seu carrinho está vazio' : 'Your cart is empty'}
          </p>
          <p class="text-sm text-muted mb-6">
            {isPt() ? 'Explore nossos relatórios premium para descobrir insights profundos sobre seu mapa.' : 'Explore our premium reports for deep insights into your chart.'}
          </p>
          <a
            href={`/${props.locale}/reports`}
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-xl hover:shadow-gold transition-all"
          >
            {isPt() ? 'Ver Relatórios Premium' : 'View Premium Reports'}
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
                      {isPt() ? 'Para:' : 'For:'} {item.profileName}
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
                    title={isPt() ? 'Remover' : 'Remove'}
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
            <span class="text-cream-dark">{isPt() ? 'Total:' : 'Total:'}</span>
            <span class="text-2xl font-bold text-gold">
              R$ {total().toFixed(2).replace('.', ',')}
            </span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={checkingOut()}
            class="w-full px-6 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold text-lg rounded-xl transition-all hover:shadow-gold-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {checkingOut()
              ? (isPt() ? 'Processando...' : 'Processing...')
              : (isPt() ? 'Finalizar Compra' : 'Checkout')
            }
          </button>

          <button
            onClick={handleClear}
            class="w-full mt-3 px-4 py-2 text-sm text-muted hover:text-red-400 transition-colors"
          >
            {isPt() ? 'Limpar carrinho' : 'Clear cart'}
          </button>
        </div>
      </Show>
    </div>
  );
}
