import { createMemo, createSignal, Show } from 'solid-js';
import type { NatalChart } from '../../engine/types';
import { renderWheel } from '../../renderer/wheel';
import type { Locale } from '../../i18n';
import { getChartUi } from '../../i18n/chart-ui';

interface Props {
  chart: NatalChart | null;
  locale?: Locale;
}

export default function NatalWheel(props: Props) {
  const text = () => getChartUi(props.locale).natal;
  const [isFullscreen, setIsFullscreen] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  const svgHtml = createMemo(() => {
    if (!props.chart) return '';
    return renderWheel(props.chart);
  });

  const toggleFullscreen = () => {
    if (!isFullscreen()) {
      // Enter fullscreen
      if (containerRef?.requestFullscreen) {
        containerRef.requestFullscreen().catch(() => {
          // Fallback: use CSS fullscreen
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Listen for native fullscreen changes (Esc key, etc.)
  if (typeof document !== 'undefined') {
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
      }
    });
  }

  return (
    <div
      ref={containerRef}
      class={`chart-wheel-container glass rounded-2xl p-4 relative ${isFullscreen() ? 'fixed inset-0 z-50 bg-base flex items-center justify-center rounded-none' : ''}`}
      style={isFullscreen() ? 'background: #0d0d14;' : ''}
    >
      <Show when={props.chart} fallback={
        <div class="flex items-center justify-center h-96 text-muted">
          <div class="text-center">
            <div class="text-5xl mb-3">✦</div>
            <p class="text-sm">{text().fillBirthData}</p>
          </div>
        </div>
      }>
        {/* Fullscreen toggle button */}
        <button
          onClick={toggleFullscreen}
          class="absolute top-3 right-3 z-10 p-2 rounded-lg bg-base-200/80 hover:bg-base-300 border border-base-400 text-muted hover:text-cream transition-colors"
          title={isFullscreen() ? text().exitFullscreen : text().expandFullscreen}
        >
          <Show when={!isFullscreen()} fallback={
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 0a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"/>
            </svg>
          }>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"/>
            </svg>
          </Show>
        </button>

        {/* Chart SVG */}
        <div
          class={isFullscreen() ? 'w-full h-full max-w-[90vh] max-h-[90vh] mx-auto' : 'w-full max-w-[700px] mx-auto'}
          innerHTML={svgHtml()}
        />

        {/* Fullscreen hint */}
        <Show when={isFullscreen()}>
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted opacity-50">
            {text().fullscreenHint}
          </div>
        </Show>
      </Show>
    </div>
  );
}
