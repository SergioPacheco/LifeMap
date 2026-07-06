import { createSignal, onMount, For, Show } from 'solid-js';
import { db, type Purchase } from '../../store/db';
import type { Locale } from '../../i18n';

interface Props {
  locale: Locale;
}

export default function PurchasesPage(props: Props) {
  const [purchases, setPurchases] = createSignal<Purchase[]>([]);
  const [loading, setLoading] = createSignal(true);

  const isPt = () => props.locale === 'pt';

  onMount(async () => {
    try {
      const items = await db.purchases.orderBy('purchasedAt').reverse().toArray();
      setPurchases(items);
    } catch (e) {
      console.warn('Failed to load purchases:', e);
    } finally {
      setLoading(false);
    }
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(props.locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div class="max-w-3xl mx-auto px-4 py-12">
      <h1 class="text-3xl font-serif font-bold text-cream mb-2">
        {isPt() ? '📄 Meus Relatórios' : '📄 My Reports'}
      </h1>
      <p class="text-cream-dark mb-8">
        {isPt()
          ? 'Relatórios comprados ficam salvos no seu navegador para acesso offline.'
          : 'Purchased reports are saved in your browser for offline access.'}
      </p>

      <Show when={loading()}>
        <div class="text-center py-12 text-muted">
          <div class="animate-spin text-3xl mb-3">⏳</div>
          <p class="text-sm">{isPt() ? 'Carregando...' : 'Loading...'}</p>
        </div>
      </Show>

      <Show when={!loading() && purchases().length === 0}>
        <div class="text-center py-20 glass rounded-2xl">
          <div class="text-6xl mb-4">📄</div>
          <p class="text-lg text-cream-dark mb-2">
            {isPt() ? 'Nenhum relatório comprado' : 'No reports purchased yet'}
          </p>
          <p class="text-sm text-muted mb-6">
            {isPt()
              ? 'Seus relatórios premium aparecerão aqui após a compra.'
              : 'Your premium reports will appear here after purchase.'}
          </p>
          <a
            href={`/${props.locale}/reports`}
            class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-xl hover:shadow-gold transition-all"
          >
            {isPt() ? 'Ver Relatórios Disponíveis' : 'View Available Reports'}
            <span>→</span>
          </a>
        </div>
      </Show>

      <Show when={!loading() && purchases().length > 0}>
        <div class="space-y-3">
          <For each={purchases()}>
            {(purchase) => (
              <div class="flex items-center justify-between p-4 glass rounded-xl border border-base-300">
                <div class="flex-1">
                  <p class="font-medium text-cream">{purchase.productId}</p>
                  <p class="text-sm text-muted">
                    {isPt() ? 'Para:' : 'For:'} {purchase.profileName}
                  </p>
                  <p class="text-xs text-muted mt-1">
                    {formatDate(purchase.purchasedAt)}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <Show when={purchase.pdfData}>
                    <button
                      onClick={() => downloadPdf(purchase)}
                      class="px-4 py-2 text-sm font-medium text-gold border border-gold/30 rounded-lg hover:bg-gold/10 transition-colors"
                    >
                      {isPt() ? '⬇ Baixar PDF' : '⬇ Download PDF'}
                    </button>
                  </Show>
                  <Show when={!purchase.pdfData}>
                    <span class="px-3 py-1 text-xs text-muted bg-base-200 rounded-full">
                      {isPt() ? 'Gerando...' : 'Generating...'}
                    </span>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

function downloadPdf(purchase: Purchase) {
  if (!purchase.pdfData) return;
  const blob = new Blob([purchase.pdfData], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lifemap-${purchase.productId}-${purchase.profileName}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
