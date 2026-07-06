import { createMemo, Show } from 'solid-js';
import type { NatalChart } from '../../engine/types';
import { renderWheel } from '../../renderer/wheel';

interface Props {
  chart: NatalChart | null;
}

export default function NatalWheel(props: Props) {
  const svgHtml = createMemo(() => {
    if (!props.chart) return '';
    return renderWheel(props.chart, { showAspects: true, showDegrees: true, showRetrograde: true });
  });

  return (
    <div class="chart-wheel-container glass rounded-2xl p-4">
      <Show when={props.chart} fallback={
        <div class="flex items-center justify-center h-96 text-muted">
          <div class="text-center">
            <div class="text-5xl mb-3">✦</div>
            <p class="text-sm">Preencha os dados de nascimento para gerar seu mapa</p>
          </div>
        </div>
      }>
        <div class="w-full max-w-[600px] mx-auto" innerHTML={svgHtml()} />
      </Show>
    </div>
  );
}
