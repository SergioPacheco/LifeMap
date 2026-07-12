import { createSignal, Show, For } from 'solid-js';
import { SIGNS, getCompatibility, LEVEL_COLORS, LEVEL_LABELS } from './compatibility-data';

interface Props {
  locale?: string;
}

interface SignButtonProps {
  index: number;
  selected: boolean;
  onClick: () => void;
}

function SignButton(props: SignButtonProps) {
  const sign = SIGNS[props.index];
  return (
    <button
      onClick={props.onClick}
      style={{
        background: props.selected
          ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.12))'
          : 'rgba(255,255,255,0.03)',
        border: props.selected ? '1.5px solid rgba(212,175,55,0.7)' : '1.5px solid rgba(255,255,255,0.08)',
        'border-radius': '12px',
        padding: '10px 6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        'flex-direction': 'column',
        'align-items': 'center',
        gap: '4px',
        color: props.selected ? '#d4af37' : '#c0b8d0',
        'font-family': 'inherit',
      }}
    >
      <span style={{ 'font-size': '22px', 'line-height': '1' }}>{sign.symbol}</span>
      <span style={{ 'font-size': '10px', 'font-weight': '500', 'letter-spacing': '0.02em' }}>
        {sign.name}
      </span>
    </button>
  );
}

interface SignSelectorProps {
  label: string;
  selected: number | null;
  onSelect: (i: number) => void;
}

function SignSelector(props: SignSelectorProps) {
  return (
    <div style={{ flex: '1', 'min-width': '0' }}>
      <p style={{
        'text-align': 'center',
        'font-size': '13px',
        'font-weight': '600',
        color: '#d4af37',
        'letter-spacing': '0.08em',
        'text-transform': 'uppercase',
        'margin-bottom': '14px',
      }}>
        {props.label}
      </p>
      <div style={{
        display: 'grid',
        'grid-template-columns': 'repeat(3, 1fr)',
        gap: '8px',
      }}>
        <For each={SIGNS}>
          {(_, i) => (
            <SignButton
              index={i()}
              selected={props.selected === i()}
              onClick={() => props.onSelect(i())}
            />
          )}
        </For>
      </div>
    </div>
  );
}

export default function LoversSelector(_props: Props) {
  const [mySign, setMySign] = createSignal<number | null>(null);
  const [theirSign, setTheirSign] = createSignal<number | null>(null);

  const compat = () => {
    const a = mySign();
    const b = theirSign();
    if (a === null || b === null) return null;
    return getCompatibility(a, b);
  };

  return (
    <div style={{
      'max-width': '860px',
      margin: '0 auto',
      padding: '0 16px 40px',
    }}>
      {/* Header */}
      <div style={{ 'text-align': 'center', 'margin-bottom': '36px' }}>
        <div style={{ 'font-size': '48px', 'margin-bottom': '8px' }}>♡</div>
        <h1 style={{
          'font-family': "'Playfair Display', serif",
          'font-size': 'clamp(22px, 4vw, 32px)',
          'font-weight': '700',
          color: '#f5f0e8',
          margin: '0 0 8px',
        }}>
          Compatibilidade dos Signos
        </h1>
        <p style={{ color: '#8888aa', 'font-size': '14px', margin: '0' }}>
          Selecione os dois signos para descobrir a afinidade
        </p>
      </div>

      {/* Two selectors side by side */}
      <div style={{
        display: 'flex',
        gap: '24px',
        'margin-bottom': '32px',
        'align-items': 'flex-start',
        'flex-wrap': 'wrap',
      }}>
        <SignSelector
          label="Eu sou"
          selected={mySign()}
          onSelect={setMySign}
        />

        {/* Divider */}
        <div style={{
          display: 'flex',
          'align-items': 'center',
          'padding-top': '36px',
          color: '#d4af37',
          'font-size': '28px',
          'flex-shrink': '0',
        }}>
          ×
        </div>

        <SignSelector
          label="Ele/Ela é"
          selected={theirSign()}
          onSelect={setTheirSign}
        />
      </div>

      {/* Result card */}
      <Show when={compat()}>
        {(c) => {
          const info = c();
          const color = LEVEL_COLORS[info.level];
          const label = LEVEL_LABELS[info.level];
          const a = mySign()!;
          const b = theirSign()!;
          return (
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              'backdrop-filter': 'blur(12px)',
              border: `1.5px solid ${color}44`,
              'border-radius': '20px',
              padding: '28px 24px',
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{
                display: 'flex',
                'align-items': 'center',
                gap: '16px',
                'margin-bottom': '16px',
                'flex-wrap': 'wrap',
              }}>
                {/* Signs display */}
                <div style={{ display: 'flex', 'align-items': 'center', gap: '12px', flex: '1' }}>
                  <div style={{ 'text-align': 'center' }}>
                    <div style={{ 'font-size': '36px' }}>{SIGNS[a].symbol}</div>
                    <div style={{ 'font-size': '11px', color: '#8888aa', 'margin-top': '2px' }}>{SIGNS[a].name}</div>
                  </div>
                  <div style={{ color: '#d4af37', 'font-size': '24px' }}>♡</div>
                  <div style={{ 'text-align': 'center' }}>
                    <div style={{ 'font-size': '36px' }}>{SIGNS[b].symbol}</div>
                    <div style={{ 'font-size': '11px', color: '#8888aa', 'margin-top': '2px' }}>{SIGNS[b].name}</div>
                  </div>
                </div>
                {/* Level badge */}
                <div style={{
                  padding: '6px 14px',
                  'border-radius': '20px',
                  background: `${color}22`,
                  border: `1px solid ${color}55`,
                  color: color,
                  'font-size': '12px',
                  'font-weight': '600',
                  'letter-spacing': '0.04em',
                  'white-space': 'nowrap',
                }}>
                  {label}
                </div>
              </div>
              <p style={{
                color: '#d8d0e8',
                'font-size': '15px',
                'line-height': '1.7',
                margin: '0',
              }}>
                {info.text}
              </p>
            </div>
          );
        }}
      </Show>

      {/* Placeholder when nothing selected */}
      <Show when={compat() === null}>
        <div style={{
          'text-align': 'center',
          color: '#555570',
          'font-size': '14px',
          padding: '24px',
          border: '1px dashed rgba(255,255,255,0.08)',
          'border-radius': '16px',
        }}>
          ✦ Selecione um signo em cada coluna para ver a compatibilidade
        </div>
      </Show>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
