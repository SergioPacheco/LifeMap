// ============================================================
// BuyReportButton — Fluxo completo: pagar → gerar PDF → salvar → redirect
// ============================================================

import { createSignal, Show } from 'solid-js';
import { processPayment, savePurchase, PRODUCTS } from '../../store/payment';
import { db } from '../../store/db';
import { localePath } from '../../i18n';
import type { NatalChart } from '../../engine/types';
import type { ReportOptions } from '../../reports/report-generators';

interface Props {
  productId: string;
  locale: string;
  generatePdf: (chart: NatalChart, options: ReportOptions) => Blob;
}

export default function BuyReportButton(props: Props) {
  const [status, setStatus] = createSignal<'idle' | 'paying' | 'generating' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = createSignal('');

  const product = () => PRODUCTS[props.productId];

  const handleBuy = async () => {
    setStatus('paying');
    setErrorMsg('');

    try {
      // 1. Get the latest profile
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length === 0) {
        setErrorMsg('Nenhum perfil salvo. Calcule um mapa natal primeiro.');
        setStatus('error');
        return;
      }
      const profile = profiles[0];

      // 2. Process payment (mock — always approves after 2s)
      const paymentResult = await processPayment(props.productId, profile.id!, profile.name);

      if (!paymentResult.success) {
        setErrorMsg(paymentResult.error || 'Erro no pagamento');
        setStatus('error');
        return;
      }

      // 3. Generate PDF
      setStatus('generating');

      // Import and calculate chart
      const { calculateNatalChart, initSweph } = await import('../../engine/index');
      await initSweph();

      const chart = calculateNatalChart({
        name: profile.name,
        date: profile.date,
        time: profile.time,
        lat: profile.lat,
        lng: profile.lng,
        timezone: profile.timezone,
        city: profile.city,
        country: profile.country,
      });

      const pdfBlob = props.generatePdf(chart, {
        locale: props.locale,
        profileName: profile.name,
        birthDate: profile.date,
        birthTime: profile.time,
        birthCity: profile.city || '',
      });

      // 4. Save to IndexedDB
      await savePurchase(
        paymentResult.sessionId,
        props.productId,
        profile.id!,
        profile.name,
        pdfBlob
      );

      // 5. Done!
      setStatus('done');

      // 6. Auto-download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LifeMap_${props.productId}_${profile.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (e) {
      console.error('Purchase error:', e);
      setErrorMsg('Erro inesperado. Tente novamente.');
      setStatus('error');
    }
  };

  return (
    <div class="mt-6">
      <Show when={status() === 'idle'}>
        <button
          onClick={handleBuy}
          class="w-full px-6 py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-bold text-lg rounded-xl transition-all hover:shadow-gold-lg hover:scale-[1.01] active:scale-[0.99]"
        >
          Comprar {product()?.name} — R$ {product()?.price.toFixed(2)}
        </button>
        <p class="text-xs text-muted text-center mt-2">
          PDF gerado instantaneamente • Disponível offline em "Meus Relatórios"
        </p>
      </Show>

      <Show when={status() === 'paying'}>
        <div class="w-full px-6 py-4 bg-base-200 rounded-xl text-center">
          <div class="animate-pulse text-gold text-lg mb-1">💳 Processando pagamento...</div>
          <p class="text-xs text-muted">Simulação — aguarde 2 segundos</p>
        </div>
      </Show>

      <Show when={status() === 'generating'}>
        <div class="w-full px-6 py-4 bg-base-200 rounded-xl text-center">
          <div class="animate-spin text-2xl mb-1">✦</div>
          <p class="text-sm text-cream">Gerando seu relatório personalizado...</p>
        </div>
      </Show>

      <Show when={status() === 'done'}>
        <div class="w-full px-6 py-4 bg-green-900/20 border border-green-800/30 rounded-xl text-center">
          <div class="text-2xl mb-1">✅</div>
          <p class="text-sm text-green-400 font-medium">Relatório gerado com sucesso!</p>
          <p class="text-xs text-muted mt-1">O download iniciou automaticamente.</p>
          <a
            href={localePath('/purchases', props.locale as any)}
            class="inline-block mt-3 text-sm text-gold hover:underline"
          >
            Ver em "Meus Relatórios" →
          </a>
        </div>
      </Show>

      <Show when={status() === 'error'}>
        <div class="w-full px-6 py-4 bg-red-900/20 border border-red-800/30 rounded-xl text-center">
          <p class="text-sm text-red-400">{errorMsg()}</p>
          <button
            onClick={() => setStatus('idle')}
            class="mt-2 text-xs text-muted hover:text-cream underline"
          >
            Tentar novamente
          </button>
        </div>
      </Show>
    </div>
  );
}
