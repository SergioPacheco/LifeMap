import { createSignal, onMount, createMemo } from 'solid-js';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PlanetaryColor {
  planet: string;
  planetEmoji: string;
  baseName: string;
  baseHex: string;
  meaning: string;
  tip: string;
  // RGB channels for programmatic lightness adjustment
  r: number;
  g: number;
  b: number;
}

// ── Planetary data ─────────────────────────────────────────────────────────────
// Day index: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const PLANETARY_COLORS: PlanetaryColor[] = [
  {
    planet: 'Sol',
    planetEmoji: '☀️',
    baseName: 'Dourado Solar',
    baseHex: '#f0b840',
    r: 240, g: 184, b: 64,
    meaning:
      'O Sol irradia vitalidade e autoexpressão. Esta cor desperta a confiança interior e ilumina sua identidade mais autêntica. É um dia propício para brilhar, liderar e ser visto.',
    tip: 'Use esta cor em acessórios dourados, roupas amarelas ou âmbar. Coloque flores solares em seu ambiente.',
  },
  {
    planet: 'Lua',
    planetEmoji: '🌙',
    baseName: 'Prata Lunar',
    baseHex: '#c0c8d8',
    r: 192, g: 200, b: 216,
    meaning:
      'A Lua regenta as emoções, intuição e o inconsciente. Esta cor traz suavidade, receptividade e conexão com os ciclos naturais. Ótimo dia para introspecção e cuidado.',
    tip: 'Use esta cor em roupas cinza-peroladas ou brancas com brilho sutil. Pratique meditação à luz da lua.',
  },
  {
    planet: 'Marte',
    planetEmoji: '♂️',
    baseName: 'Vermelho Marciano',
    baseHex: '#d94040',
    r: 217, g: 64, b: 64,
    meaning:
      'Marte energiza a ação, coragem e determinação. Esta cor acende a força de vontade e combate a inércia. É um dia poderoso para iniciar projetos e superar desafios.',
    tip: 'Use esta cor em roupas vermelhas ou detalhes vibrantes. Faça exercício físico para canalizar a energia marciana.',
  },
  {
    planet: 'Mercúrio',
    planetEmoji: '☿',
    baseName: 'Verde Mercurial',
    baseHex: '#40b870',
    r: 64, g: 184, b: 112,
    meaning:
      'Mercúrio governa a comunicação, o intelecto e as conexões. Esta cor estimula a clareza mental, a aprendizagem e a troca de ideias. Ideal para conversas importantes.',
    tip: 'Use esta cor em roupas verdes ou esmeralda. Escreva em um diário ou aprenda algo novo hoje.',
  },
  {
    planet: 'Júpiter',
    planetEmoji: '♃',
    baseName: 'Roxo Jupiteriano',
    baseHex: '#8040d8',
    r: 128, g: 64, b: 216,
    meaning:
      'Júpiter expande a sabedoria, abundância e otimismo. Esta cor eleva a perspectiva espiritual e atrai prosperidade. Um dia favorável para grandes planos e generosidade.',
    tip: 'Use esta cor em roupas roxas ou índigo. Pratique gratidão e compartilhe conhecimento com alguém.',
  },
  {
    planet: 'Vênus',
    planetEmoji: '♀️',
    baseName: 'Rosa Venusiano',
    baseHex: '#e060a0',
    r: 224, g: 96, b: 160,
    meaning:
      'Vênus rege o amor, a beleza e os prazeres. Esta cor ativa o magnetismo pessoal e a harmonia nos relacionamentos. Um dia ideal para conexões afetivas e autocuidado.',
    tip: 'Use esta cor em roupas rosas ou tons de pêssego. Cuide-se com um ritual de beleza ou arte.',
  },
  {
    planet: 'Saturno',
    planetEmoji: '♄',
    baseName: 'Azul Saturnino',
    baseHex: '#204878',
    r: 32, g: 72, b: 120,
    meaning:
      'Saturno impõe disciplina, estrutura e responsabilidade. Esta cor traz seriedade, foco e respeito pelo tempo. Um dia ideal para organizar, planejar e construir bases sólidas.',
    tip: 'Use esta cor em roupas azul-marinho ou cinza-escuro. Organize seu espaço ou resolva pendências antigas.',
  },
];

// Weekday index in JS: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
// Map to planetary index above:         0=Sun,    1=Mon,       2=Tue,       3=Wed,         4=Thu,        5=Fri,    6=Sat
const WEEKDAY_TO_PLANET = [0, 1, 2, 3, 4, 5, 6] as const;

// ── Algorithm ─────────────────────────────────────────────────────────────────

/**
 * Blend a base RGB toward lighter or darker depending on day of month.
 * Days 1–10: gradually lighter (+lightBoost)
 * Days 11–20: base
 * Days 21–31: gradually darker (−darkBoost)
 */
function adjustBrightness(base: PlanetaryColor, dayOfMonth: number): string {
  let factor = 0;
  if (dayOfMonth <= 10) {
    factor = ((10 - dayOfMonth) / 10) * 0.28; // up to +28% lighter
  } else if (dayOfMonth >= 21) {
    factor = -((dayOfMonth - 20) / 11) * 0.28; // up to -28% darker
  }

  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(base.r + base.r * factor);
  const g = clamp(base.g + base.g * factor);
  const b = clamp(base.b + base.b * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

function toHexFromRgb(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function getAdjustedHex(base: PlanetaryColor, dayOfMonth: number): string {
  let factor = 0;
  if (dayOfMonth <= 10) {
    factor = ((10 - dayOfMonth) / 10) * 0.28;
  } else if (dayOfMonth >= 21) {
    factor = -((dayOfMonth - 20) / 11) * 0.28;
  }
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return toHexFromRgb(
    clamp(base.r + base.r * factor),
    clamp(base.g + base.g * factor),
    clamp(base.b + base.b * factor),
  );
}

function getModifiedColorName(base: PlanetaryColor, dayOfMonth: number): string {
  if (dayOfMonth <= 10) return `${base.baseName} Claro`;
  if (dayOfMonth >= 21) return `${base.baseName} Escuro`;
  return base.baseName;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ColorOracle() {
  const [now] = createSignal(new Date());

  const data = createMemo(() => {
    const date = now();
    const weekday = date.getDay(); // 0–6
    const dayOfMonth = date.getDate(); // 1–31
    const planetIndex = WEEKDAY_TO_PLANET[weekday];
    const base = PLANETARY_COLORS[planetIndex];
    const adjustedColor = adjustBrightness(base, dayOfMonth);
    const adjustedHex = getAdjustedHex(base, dayOfMonth);
    const colorName = getModifiedColorName(base, dayOfMonth);

    const weekdayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    return {
      base,
      adjustedColor,
      adjustedHex,
      colorName,
      weekdayName: weekdayNames[weekday],
      dateFormatted: `${dayOfMonth} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`,
    };
  });

  const glowStyle = () => `
    0 0 40px ${data().adjustedHex}88,
    0 0 80px ${data().adjustedHex}44,
    0 0 120px ${data().adjustedHex}22
  `;

  const orbGradient = () => `
    radial-gradient(circle at 35% 35%,
      ${data().adjustedHex}ff 0%,
      ${data().adjustedColor} 40%,
      ${data().adjustedHex}bb 70%,
      ${data().adjustedHex}33 100%
    )
  `;

  return (
    <div class="flex flex-col items-center gap-10 py-8">

      {/* Header */}
      <div class="text-center space-y-2">
        <h1 class="text-3xl sm:text-4xl font-serif font-bold text-cream tracking-wide">
          Oráculo de Cores
        </h1>
        <p class="text-cream-dark text-base">Sua cor pessoal para hoje</p>
        <p class="text-muted text-sm mt-1">
          {data().weekdayName} — {data().dateFormatted}
        </p>
      </div>

      {/* Orb */}
      <div
        class="relative flex items-center justify-center"
        style="width: 220px; height: 220px;"
      >
        {/* Outer glow ring */}
        <div
          style={`
            position: absolute;
            inset: -16px;
            border-radius: 50%;
            background: radial-gradient(circle, ${data().adjustedHex}18 0%, transparent 70%);
            animation: pulse-glow 3s ease-in-out infinite;
          `}
        />

        {/* Main orb */}
        <div
          style={`
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: ${orbGradient()};
            box-shadow: ${glowStyle()};
            position: relative;
            overflow: hidden;
          `}
        >
          {/* Inner highlight */}
          <div style="
            position: absolute;
            top: 18%;
            left: 22%;
            width: 35%;
            height: 30%;
            border-radius: 50%;
            background: rgba(255,255,255,0.25);
            filter: blur(8px);
            transform: rotate(-30deg);
          " />
          {/* Planet emoji center */}
          <div style="
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
          ">
            {data().base.planetEmoji}
          </div>
        </div>
      </div>

      {/* Info card */}
      <div
        class="glass rounded-2xl border-glow glow-hover w-full max-w-md space-y-5 p-6"
        style={`border-color: ${data().adjustedHex}33;`}
      >
        {/* Color name + planet */}
        <div class="text-center">
          <div
            class="text-2xl font-serif font-bold mb-1"
            style={`color: ${data().adjustedHex};`}
          >
            {data().colorName}
          </div>
          <div class="text-sm text-muted">
            Regido por {data().base.planet} {data().base.planetEmoji}
          </div>
        </div>

        <div style={`height: 1px; background: ${data().adjustedHex}22;`} />

        {/* Meaning */}
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span style={`color: ${data().adjustedHex};`}>✦</span>
            <span class="text-xs font-semibold text-cream-dark uppercase tracking-widest">Significado</span>
          </div>
          <p class="text-sm text-cream-dark leading-relaxed">
            {data().base.meaning}
          </p>
        </div>

        <div style={`height: 1px; background: ${data().adjustedHex}22;`} />

        {/* Tip */}
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <span style={`color: ${data().adjustedHex};`}>◈</span>
            <span class="text-xs font-semibold text-cream-dark uppercase tracking-widest">Dica Prática</span>
          </div>
          <p class="text-sm text-cream-dark leading-relaxed">
            {data().base.tip}
          </p>
        </div>
      </div>

      {/* Weekday color strip — subtle reference */}
      <div class="flex gap-2 items-center">
        {PLANETARY_COLORS.map((p, i) => {
          const isActive = WEEKDAY_TO_PLANET[new Date().getDay()] === i;
          return (
            <div
              title={p.planet}
              style={`
                width: ${isActive ? '28px' : '10px'};
                height: ${isActive ? '28px' : '10px'};
                border-radius: 50%;
                background: ${p.baseHex};
                opacity: ${isActive ? 1 : 0.35};
                transition: all 0.3s;
                box-shadow: ${isActive ? `0 0 12px ${p.baseHex}88` : 'none'};
              `}
            />
          );
        })}
      </div>
      <p class="text-xs text-muted -mt-6">Ciclo planetário semanal</p>

      {/* CSS animation */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
