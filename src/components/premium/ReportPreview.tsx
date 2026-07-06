import { createSignal, onMount, Show } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import { calculateNatalChart, initSweph } from '../../engine/index';
import { generateNatalPdf, downloadPdf } from '../../reports/pdf-generator';
import { generateAnnualPdf, generateRelationshipPdf, generatePsychologicalPdf, generateCareerPdf, generateSevenSinsPdf } from '../../reports/report-generators';
import { processPayment, savePurchase, PRODUCTS } from '../../store/payment';
import { localePath } from '../../i18n';
import type { NatalChart } from '../../engine/types';
import type { Profile } from '../../store/db';

interface Props {
  locale: string;
  reportType: 'natal' | 'relationship' | 'career' | 'annual' | 'psychological' | 'seven-sins';
}

const REPORT_TITLES: Record<string, Record<string, string>> = {
  pt: { natal: 'Relatório Natal Completo', relationship: 'Relatório de Relacionamento', career: 'Carreira e Vocação', annual: 'Previsão Anual', psychological: 'Análise Psicológica Profunda', 'seven-sins': 'Os Sete Pecados' },
  en: { natal: 'Complete Natal Report', relationship: 'Relationship Report', career: 'Career & Vocation', annual: 'Annual Forecast', psychological: 'Deep Psychological Analysis', 'seven-sins': 'The Seven Sins' },
};

const LABELS: Record<string, Record<string, string>> = {
  pt: {
    selectProfile: 'Selecione um perfil para gerar a amostra',
    generating: 'Gerando PDF...',
    downloadSample: '⬇ Baixar Amostra Gratuita (PDF)',
    downloadFull: '⬇ Baixar Relatório Completo (PDF)',
    sampleNote: 'Amostra gratuita — 3 páginas com posições e visão geral. O relatório completo tem 20-30 páginas.',
    buyFull: 'Comprar versão completa — R$ 29,90',
    generated: 'PDF gerado com sucesso!',
    pages: 'páginas',
  },
  en: {
    selectProfile: 'Select a profile to generate the sample',
    generating: 'Generating PDF...',
    downloadSample: '⬇ Download Free Sample (PDF)',
    downloadFull: '⬇ Download Complete Report (PDF)',
    sampleNote: 'Free sample — 3 pages with positions and overview. The full report has 20-30 pages.',
    buyFull: 'Buy full version — $9.90',
    generated: 'PDF generated successfully!',
    pages: 'pages',
  },
};

export default function ReportPreview(props: Props) {
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [profile, setProfile] = createSignal<Profile | null>(null);
  const [generating, setGenerating] = createSignal(false);
  const [generated, setGenerated] = createSignal(false);
  const [buyStatus, setBuyStatus] = createSignal<'idle' | 'paying' | 'generating' | 'done' | 'error'>('idle');
  const [buyError, setBuyError] = createSignal('');

  const labels = () => LABELS[props.locale] || LABELS.en;
  const title = () => (REPORT_TITLES[props.locale] || REPORT_TITLES.en)[props.reportType];

  onMount(async () => { await initSweph(); });

  const handleProfileSelect = (p: Profile) => {
    const chart = calculateNatalChart({
      name: p.name, date: p.date, time: p.time,
      lat: p.lat, lng: p.lng, timezone: p.timezone,
      city: p.city, country: p.country,
    });
    setNatal(chart);
    setProfile(p);
    setGenerated(false);
  };

  const handleDownloadSample = async () => {
    if (!natal() || !profile()) return;
    setGenerating(true);

    try {
      const opts = {
        locale: props.locale,
        isTryout: true,
        profileName: profile()!.name,
        birthDate: profile()!.date,
        birthTime: profile()!.time,
        birthCity: profile()!.city,
      };

      let blob: Blob;
      switch (props.reportType) {
        case 'annual':
          blob = generateAnnualPdf(natal()!, opts);
          break;
        case 'relationship':
          blob = generateRelationshipPdf(natal()!, opts);
          break;
        case 'psychological':
          blob = generatePsychologicalPdf(natal()!, opts);
          break;
        case 'career':
          blob = generateCareerPdf(natal()!, opts);
          break;
        case 'seven-sins':
          blob = generateSevenSinsPdf(natal()!, opts);
          break;
        default:
          blob = generateNatalPdf(natal()!, opts);
      }

      const filename = `lifemap-${props.reportType}-sample-${profile()!.name.replace(/\s/g, '_')}.pdf`;
      downloadPdf(blob, filename);
      setGenerated(true);
    } catch (e) {
      console.error('PDF generation error:', e);
    } finally {
      setGenerating(false);
    }
  };

  const PRODUCT_MAP: Record<string, string> = {
    natal: 'natal-complete',
    annual: 'annual-forecast',
    relationship: 'relationship',
    psychological: 'psychological',
    career: 'career',
    'seven-sins': 'seven-sins',
  };

  const handleDownloadFull = async () => {
    if (!natal() || !profile()) return;

    const productId = PRODUCT_MAP[props.reportType] || 'natal-complete';
    setBuyStatus('paying');
    setBuyError('');

    try {
      // 1. Process payment (mock — always approves after 2s)
      const result = await processPayment(productId, profile()!.id!, profile()!.name);
      if (!result.success) {
        setBuyError(result.error || 'Erro no pagamento');
        setBuyStatus('error');
        return;
      }

      // 2. Generate full PDF
      setBuyStatus('generating');
      const opts = {
        locale: props.locale,
        isTryout: false,
        profileName: profile()!.name,
        birthDate: profile()!.date,
        birthTime: profile()!.time,
        birthCity: profile()!.city,
      };

      let blob: Blob;
      switch (props.reportType) {
        case 'annual': blob = generateAnnualPdf(natal()!, opts); break;
        case 'relationship': blob = generateRelationshipPdf(natal()!, opts); break;
        case 'psychological': blob = generatePsychologicalPdf(natal()!, opts); break;
        case 'career': blob = generateCareerPdf(natal()!, opts); break;
        case 'seven-sins': blob = generateSevenSinsPdf(natal()!, opts); break;
        default: blob = generateNatalPdf(natal()!, opts);
      }

      // 3. Save to IndexedDB
      await savePurchase(result.sessionId, productId, profile()!.id!, profile()!.name, blob);

      // 4. Auto-download
      const filename = `LifeMap_${productId}_${profile()!.name.replace(/\s/g, '_')}.pdf`;
      downloadPdf(blob, filename);

      setBuyStatus('done');
    } catch (e) {
      console.error('Purchase error:', e);
      setBuyError('Erro inesperado. Tente novamente.');
      setBuyStatus('error');
    }
  };

  return (
    <div class="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div class="text-center">
        <h2 class="text-2xl font-serif font-bold text-cream">{title()}</h2>
      </div>

      {/* Profile selector */}
      <div class="glass rounded-2xl p-6">
        <p class="text-sm text-muted mb-3">{labels().selectProfile}</p>
        <ProfileSelector onSelect={handleProfileSelect} locale={props.locale} />
      </div>

      {/* Download buttons */}
      <Show when={natal()}>
        <div class="glass rounded-2xl p-6 space-y-4">
          <div class="text-center">
            <p class="text-sm text-muted mb-4">{labels().sampleNote}</p>

            {/* Sample download */}
            <button
              onClick={handleDownloadSample}
              disabled={generating()}
              class="w-full px-6 py-3 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-semibold rounded-lg transition-all hover:shadow-gold hover:scale-[1.01] disabled:opacity-50 mb-3"
            >
              {generating() ? labels().generating : labels().downloadSample}
            </button>

            {/* Full version (paid) */}
            <Show when={buyStatus() === 'idle'}>
              <button
                onClick={handleDownloadFull}
                class="w-full px-6 py-3 bg-base-200 hover:bg-base-100 text-cream font-medium rounded-lg transition-colors border border-base-400 hover:border-gold/30"
              >
                💳 {labels().buyFull} — R$ {PRODUCTS[PRODUCT_MAP[props.reportType]]?.price.toFixed(2) || '29.90'}
              </button>
            </Show>

            <Show when={buyStatus() === 'paying'}>
              <div class="w-full px-6 py-3 bg-base-200 rounded-lg text-center">
                <div class="animate-pulse text-gold">💳 Processando pagamento...</div>
              </div>
            </Show>

            <Show when={buyStatus() === 'generating'}>
              <div class="w-full px-6 py-3 bg-base-200 rounded-lg text-center">
                <div class="animate-spin inline-block text-gold">✦</div>
                <span class="ml-2 text-cream">Gerando relatório completo...</span>
              </div>
            </Show>

            <Show when={buyStatus() === 'done'}>
              <div class="w-full px-6 py-3 bg-green-900/20 border border-green-800/30 rounded-lg text-center">
                <p class="text-green-400 font-medium">✅ Relatório comprado e baixado!</p>
                <a href={localePath('/purchases', props.locale as any)} class="text-xs text-gold hover:underline mt-1 inline-block">
                  Ver em "Meus Relatórios" →
                </a>
              </div>
            </Show>

            <Show when={buyStatus() === 'error'}>
              <div class="w-full px-6 py-3 bg-red-900/20 border border-red-800/30 rounded-lg text-center">
                <p class="text-sm text-red-400">{buyError()}</p>
                <button onClick={() => setBuyStatus('idle')} class="text-xs text-muted hover:text-cream underline mt-1">
                  Tentar novamente
                </button>
              </div>
            </Show>
          </div>

          <Show when={generated()}>
            <div class="p-3 bg-green-900/20 border border-green-800/30 rounded-lg text-center text-sm text-green-400">
              ✓ {labels().generated}
            </div>
          </Show>
        </div>
      </Show>

      {/* Preview of what the report contains */}
      <div class="bg-base-100 rounded-xl p-6 border border-base-300">
        <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">
          {props.locale === 'pt' ? 'O que contém' : 'What\'s included'}
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted">
          <div class="flex items-center gap-2"><span class="text-gold">✓</span> {props.locale === 'pt' ? 'Capa personalizada' : 'Personalized cover'}</div>
          <div class="flex items-center gap-2"><span class="text-gold">✓</span> {props.locale === 'pt' ? 'Tabela de posições' : 'Positions table'}</div>
          <div class="flex items-center gap-2"><span class="text-gold">✓</span> {props.locale === 'pt' ? 'Cúspides das casas' : 'House cusps'}</div>
          <div class="flex items-center gap-2"><span class="text-gold">✓</span> {props.locale === 'pt' ? 'Interpretação planeta a planeta' : 'Planet-by-planet interpretation'}</div>
          <div class="flex items-center gap-2"><span class="text-gold">✓</span> {props.locale === 'pt' ? 'Aspectos com análise' : 'Aspects with analysis'}</div>
          <div class="flex items-center gap-2"><span class="text-gold">✓</span> {props.locale === 'pt' ? 'Dignidades e debilidades' : 'Dignities and debilities'}</div>
        </div>
      </div>
    </div>
  );
}
