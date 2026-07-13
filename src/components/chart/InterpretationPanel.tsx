import { Show, For } from 'solid-js';
import type { NatalChart } from '../../engine/types';
import { generateNatalInterpretation, type InterpretationSection } from '../../engine/interpret';
import { localePath, type Locale } from '../../i18n';
import { getChartUi } from '../../i18n/chart-ui';

interface Props {
  chart: NatalChart | null;
  locale?: Locale;
}

const CATEGORY_STYLES: Record<string, { border: string; badge: string }> = {
  mask: { border: 'border-purple-600/40', badge: 'bg-purple-900/20 text-purple-300' },
  identity: { border: 'border-gold/40', badge: 'bg-gold/10 text-gold' },
  emotion: { border: 'border-blue-500/40', badge: 'bg-blue-900/20 text-blue-300' },
  mind: { border: 'border-cyan-500/40', badge: 'bg-cyan-900/20 text-cyan-300' },
  love: { border: 'border-pink-500/40', badge: 'bg-pink-900/20 text-pink-300' },
  action: { border: 'border-red-500/40', badge: 'bg-red-900/20 text-red-300' },
  direction: { border: 'border-green-500/40', badge: 'bg-green-900/20 text-green-300' },
};

export default function InterpretationPanel(props: Props) {
  const locale = () => props.locale || 'pt';
  const text = () => getChartUi(locale()).interpretation;
  const sections = () => props.chart ? generateNatalInterpretation(props.chart, locale()) : [];

  return (
    <Show when={props.chart && sections().length > 0}>
      <div class="glass rounded-2xl p-6">
        <h3 class="text-lg font-serif font-semibold text-cream mb-2">
          {text().title}
        </h3>
        <p class="text-xs text-muted mb-6">
          {text().intro}
        </p>

        <div class="space-y-5">
          <For each={sections()}>
            {(section) => {
              const style = CATEGORY_STYLES[section.category || ''] || CATEGORY_STYLES.identity;
              return (
                <div class={`border-l-4 ${style.border} pl-4 py-3`}>
                  <div class="flex items-center gap-2 mb-1.5">
                    <span class={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${style.badge}`}>
                      {(text().categories as Record<string, string>)[section.category || 'identity']}
                    </span>
                  </div>
                  <h4 class="text-sm font-semibold text-cream mb-1.5">
                    {section.title}
                  </h4>
                  <p class="text-sm text-cream-dark leading-relaxed">
                    {section.text}
                  </p>
                </div>
              );
            }}
          </For>
        </div>

        {/* CTA for premium */}
        <div class="mt-8 p-4 bg-gold/5 rounded-lg border border-gold/20">
          <p class="text-sm text-gold font-medium">
            ✨ {text().premiumTitle}
          </p>
          <p class="text-xs text-muted mt-1">
            {text().premiumBody}
          </p>
          <a
            href={localePath('/reports', locale())}
            class="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-gold-dark to-gold text-black text-sm font-semibold rounded-lg transition-all hover:shadow-gold"
          >
            {text().premiumLink}
          </a>
        </div>
      </div>
    </Show>
  );
}
