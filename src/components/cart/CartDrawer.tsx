import { createSignal, onMount, For, Show } from 'solid-js';
import { db, getCartTotal, getCartCount, clearCart, type CartItem } from '../../store/db';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer(props: Props) {
  const [items, setItems] = createSignal<CartItem[]>([]);
  const [total, setTotal] = createSignal(0);
  const [checkingOut, setCheckingOut] = createSignal(false);

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
    if (confirm('Limpar todo o carrinho?')) {
      await clearCart();
      await refreshCart();
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    alert('Checkout com Stripe será implementado na próxima fase.\n\nPor enquanto, os relatórios serão gerados como preview gratuito.');
    setCheckingOut(false);
  };

  return (
    <Show when={props.open}>
      {/* Overlay */}
      <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={props.onClose} />

      {/* Drawer */}
      <div class="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-base shadow-dark flex flex-col border-l border-base-300">
        {/* Header */}
        <div class="flex items-center justify-between p-4 border-b border-base-300">
          <h2 class="text-lg font-semibold text-cream">
            Carrinho ({items().length})
          </h2>
          <button onClick={props.onClose} class="p-2 text-muted hover:text-cream transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <Show when={items().length === 0}>
            <div class="text-center py-12 text-muted">
              <div class="text-4xl mb-3">🛒</div>
              <p class="text-sm">Seu carrinho está vazio</p>
              <a href="/pt/reports" class="text-gold text-sm hover:underline mt-2 inline-block">
                Ver relatórios premium →
              </a>
            </div>
          </Show>

          <For each={items()}>
            {(item) => (
              <div class="flex items-center justify-between p-3 bg-base-50 rounded-lg border border-base-300">
                <div class="flex-1">
                  <p class="text-sm font-medium text-cream">
                    {item.productName}
                  </p>
                  <Show when={item.profileName}>
                    <p class="text-xs text-muted">Para: {item.profileName}</p>
                  </Show>
                  <p class="text-sm font-bold text-gold mt-1">
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id!)}
                  class="p-2 text-muted hover:text-red-400 transition-colors"
                  title="Remover"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </For>
        </div>

        {/* Footer: Total + Checkout */}
        <Show when={items().length > 0}>
          <div class="p-4 border-t border-base-300 space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted">Total:</span>
              <span class="text-xl font-bold text-gold">
                R$ {total().toFixed(2).replace('.', ',')}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut()}
              class="w-full px-4 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-lg transition-all hover:shadow-gold disabled:opacity-50"
            >
              {checkingOut() ? 'Processando...' : 'Finalizar Compra'}
            </button>
            <button
              onClick={handleClear}
              class="w-full px-4 py-2 text-sm text-muted hover:text-red-400 transition-colors"
            >
              Limpar carrinho
            </button>
          </div>
        </Show>
      </div>
    </Show>
  );
}
