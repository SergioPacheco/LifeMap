// ============================================================
// PurchasesApp — Lista de relatórios comprados com download
// ============================================================

import { createSignal, onMount, Show, For } from 'solid-js';
import { getPurchases, downloadPurchasedPdf, PRODUCTS } from '../../store/payment';
import type { Purchase } from '../../store/db';

interface PurchaseWithMeta extends Purchase {
  productName: string;
  price: number;
}

export default function PurchasesApp() {
  const [purchases, setPurchases] = createSignal<PurchaseWithMeta[]>([]);
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    const data = await getPurchases();
    setPurchases(data);
    setLoading(false);
  });

  const handleDownload = (purchase: PurchaseWithMeta) => {
    downloadPurchasedPdf(purchase);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div class="max-w-4xl mx-auto">
      <div class="mb-8">
        <h1 class="text-2xl font-serif font-bold text-cream">Meus Relatórios</h1>
        <p class="text-sm text-muted mt-1">Relatórios comprados ficam disponíveis para download a qualquer momento.</p>
      </div>

      <Show when={!loading()} fallback={
        <div class="text-center py-12 text-muted">
          <div class="animate-spin text-3xl mb-2 text-gold">✦</div>
          <p class="text-sm">Carregando seus relatórios...</p>
        </div>
      }>
        <Show when={purchases().length > 0} fallback={
          <div class="glass rounded-2xl p-12 text-center">
            <div class="text-5xl mb-4">📄</div>
            <h2 class="text-lg font-medium text-cream mb-2">Nenhum relatório comprado ainda</h2>
            <p class="text-sm text-muted mb-6">Explore nossos relatórios personalizados e adquira uma análise profunda do seu mapa.</p>
            <a href="/pt/reports" class="inline-block px-6 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-lg hover:shadow-gold transition-all">
              Ver Relatórios Disponíveis
            </a>
          </div>
        }>
          <div class="space-y-4">
            <For each={purchases()}>
              {(purchase) => (
                <div class="glass rounded-xl p-5 flex items-center justify-between gap-4">
                  <div class="flex-1">
                    <h3 class="font-medium text-cream">{purchase.productName}</h3>
                    <div class="flex flex-wrap gap-3 mt-1 text-xs text-muted">
                      <span>Para: <strong class="text-cream-dark">{purchase.profileName}</strong></span>
                      <span>Comprado: {formatDate(purchase.purchasedAt)}</span>
                      <span>R$ {purchase.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Show when={purchase.pdfData}>
                      <button
                        onClick={() => handleDownload(purchase)}
                        class="px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold text-sm font-medium rounded-lg border border-gold/30 transition-colors"
                      >
                        ⬇ Download PDF
                      </button>
                    </Show>
                  </div>
                </div>
              )}
            </For>
          </div>

          <div class="mt-8 text-center text-xs text-muted">
            <p>Os PDFs ficam salvos no seu navegador. Se limpar os dados do browser, os relatórios serão perdidos.</p>
          </div>
        </Show>
      </Show>
    </div>
  );
}
