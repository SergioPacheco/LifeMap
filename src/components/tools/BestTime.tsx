import { createSignal, createMemo, For, Show, onMount, createEffect } from 'solid-js';
import { findBestDates, ELECTIVE_RULES, type ElectiveAction, type ElectiveResult } from '../../engine/calendar/elective';
import { db, type Profile } from '../../store/db';

// ============================================================
// TYPES
// ============================================================

interface ActionCategory {
  id: string;
  label: string;
  icon: string;
  actions: ActionOption[];
}

interface ActionOption {
  id: ElectiveAction;
  label: string;
  icon: string;
  description: string;
}

// ============================================================
// EXPANDED ACTION CATEGORIES (astro.com-inspired)
// ============================================================

const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'love',
    label: 'Amor y Relaciones',
    icon: '💕',
    actions: [
      { id: 'wedding', label: 'Boda / Casamiento', icon: '💒', description: 'Ceremonia civil o religiosa, firma del acta' },
      { id: 'first-date', label: 'Primera cita', icon: '🌹', description: 'Primer encuentro romántico, invitar a salir' },
    ],
  },
  {
    id: 'career',
    label: 'Carrera y Negocios',
    icon: '💼',
    actions: [
      { id: 'business', label: 'Abrir empresa / Lanzamiento', icon: '🏢', description: 'Registrar empresa, inauguración, lanzar producto' },
      { id: 'contract', label: 'Firmar contrato', icon: '📝', description: 'Contratos, acuerdos, firmas legales' },
      { id: 'job-interview', label: 'Entrevista de trabajo', icon: '🤝', description: 'Entrevista, reunión decisiva, postulación' },
      { id: 'investment', label: 'Inversión financiera', icon: '📈', description: 'Invertir, abrir cuenta, comprar acciones' },
    ],
  },
  {
    id: 'personal',
    label: 'Vida Personal',
    icon: '🏠',
    actions: [
      { id: 'move', label: 'Mudanza', icon: '🏡', description: 'Cambio de casa, inicio de convivencia' },
      { id: 'travel', label: 'Viaje', icon: '✈️', description: 'Iniciar un viaje, comprar pasajes' },
      { id: 'surgery', label: 'Cirugía / Procedimiento médico', icon: '🏥', description: 'Operaciones, tratamientos, procedimientos estéticos' },
    ],
  },
  {
    id: 'growth',
    label: 'Crecimiento y Creatividad',
    icon: '🌱',
    actions: [
      { id: 'study', label: 'Iniciar estudios', icon: '📚', description: 'Comenzar un curso, matricularse, estudiar' },
      { id: 'creative', label: 'Proyecto creativo', icon: '🎨', description: 'Lanzar arte, iniciar escritura, grabación' },
      { id: 'spiritual', label: 'Retiro espiritual', icon: '🧘', description: 'Meditación, retiro, iniciación espiritual' },
    ],
  },
];

// ============================================================
// PERIOD OPTIONS
// ============================================================

interface PeriodOption {
  label: string;
  days: number;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { label: '7 días', days: 7 },
  { label: '14 días', days: 14 },
  { label: '30 días', days: 30 },
  { label: '60 días', days: 60 },
  { label: '90 días', days: 90 },
];

// ============================================================
// SIGN NAMES
// ============================================================

const SIGN_NAMES = ['Aries', 'Tauro', 'Géminis', 'Cáncer', 'Leo', 'Virgo',
                    'Libra', 'Escorpio', 'Sagitario', 'Capricornio', 'Acuario', 'Piscis'];

const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

// ============================================================
// COMPONENT
// ============================================================

export default function BestTime() {
  // State
  const [selectedAction, setSelectedAction] = createSignal<ElectiveAction | null>(null);
  const [selectedPeriod, setSelectedPeriod] = createSignal<number>(30);
  const [startDate, setStartDate] = createSignal<string>(todayStr());
  const [results, setResults] = createSignal<ElectiveResult[]>([]);
  const [isCalculating, setIsCalculating] = createSignal(false);
  const [profiles, setProfiles] = createSignal<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = createSignal<number | null>(null);
  const [showResults, setShowResults] = createSignal(false);
  const [expandedDay, setExpandedDay] = createSignal<number | null>(null);
  const [viewMode, setViewMode] = createSignal<'timeline' | 'calendar' | 'list'>('timeline');

  // Load profiles from DB
  onMount(async () => {
    try {
      const allProfiles = await db.profiles.toArray();
      setProfiles(allProfiles);
      if (allProfiles.length > 0) {
        setSelectedProfile(allProfiles[0].id!);
      }
    } catch (e) {
      // DB not available — continue without natal chart
    }
  });

  // Get selected action info
  const actionInfo = createMemo(() => {
    if (!selectedAction()) return null;
    for (const cat of ACTION_CATEGORIES) {
      const found = cat.actions.find(a => a.id === selectedAction());
      if (found) return found;
    }
    return null;
  });

  // Calculate
  async function calculate() {
    const action = selectedAction();
    if (!action) return;

    setIsCalculating(true);
    setShowResults(false);

    // Small delay to allow UI update
    await new Promise(r => setTimeout(r, 50));

    try {
      const start = new Date(startDate() + 'T00:00:00');
      const days = selectedPeriod();

      // TODO: If profile selected, pass natal chart
      // For now: null natal (mundane-only calculation)
      const electiveResults = findBestDates(action, null, start, days);

      setResults(electiveResults);
      setShowResults(true);
    } catch (e) {
      console.error('Electional calculation error:', e);
    } finally {
      setIsCalculating(false);
    }
  }

  // Stats from results
  const stats = createMemo(() => {
    const r = results();
    if (r.length === 0) return null;
    const excellent = r.filter(x => x.grade === 'excellent').length;
    const good = r.filter(x => x.grade === 'good').length;
    const acceptable = r.filter(x => x.grade === 'acceptable').length;
    const poor = r.filter(x => x.grade === 'poor').length;
    const best = r[0]; // Already sorted by score desc
    return { excellent, good, acceptable, poor, best, total: r.length };
  });

  // Results sorted by date (for timeline/calendar)
  const resultsByDate = createMemo(() => {
    return [...results()].sort((a, b) => a.date.getTime() - b.date.getTime());
  });

  return (
    <div class="space-y-6">

      {/* ═══ STEP 1: Select Action ═══ */}
      <div class="glass rounded-2xl p-5 border border-white/5">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-gold text-lg">①</span>
          <h2 class="text-sm font-semibold text-cream uppercase tracking-wider">
            ¿Qué quieres hacer?
          </h2>
        </div>

        <div class="space-y-4">
          <For each={ACTION_CATEGORIES}>
            {(category) => (
              <div>
                <p class="text-xs text-muted font-medium mb-2 flex items-center gap-2">
                  <span>{category.icon}</span> {category.label}
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <For each={category.actions}>
                    {(action) => (
                      <button
                        onClick={() => setSelectedAction(action.id)}
                        class={`text-left px-4 py-3 rounded-xl border transition-all duration-200
                          ${selectedAction() === action.id
                            ? 'border-gold/60 bg-gold/10 shadow-[0_0_12px_rgba(240,184,64,0.1)]'
                            : 'border-white/5 bg-base-50 hover:border-white/20 hover:bg-base-100'}`}
                      >
                        <div class="flex items-center gap-3">
                          <span class="text-xl">{action.icon}</span>
                          <div>
                            <p class={`text-sm font-medium ${selectedAction() === action.id ? 'text-gold' : 'text-cream'}`}>
                              {action.label}
                            </p>
                            <p class="text-xs text-muted mt-0.5">{action.description}</p>
                          </div>
                        </div>
                      </button>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* ═══ STEP 2: Period & Options ═══ */}
      <Show when={selectedAction()}>
        <div class="glass rounded-2xl p-5 border border-white/5">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-gold text-lg">②</span>
            <h2 class="text-sm font-semibold text-cream uppercase tracking-wider">
              ¿Cuándo buscas?
            </h2>
          </div>

          <div class="space-y-4">
            {/* Start date */}
            <div>
              <label class="text-xs text-muted block mb-1.5">Fecha de inicio</label>
              <input
                type="date"
                value={startDate()}
                onInput={(e) => setStartDate(e.currentTarget.value)}
                min={todayStr()}
                class="w-full px-4 py-2.5 rounded-xl bg-base-100 border border-white/10
                       text-cream text-sm focus:outline-none focus:border-gold/40"
              />
            </div>

            {/* Period */}
            <div>
              <label class="text-xs text-muted block mb-1.5">Período de búsqueda</label>
              <div class="flex flex-wrap gap-2">
                <For each={PERIOD_OPTIONS}>
                  {(opt) => (
                    <button
                      onClick={() => setSelectedPeriod(opt.days)}
                      class={`px-4 py-2 rounded-lg text-xs font-medium border transition-all
                        ${selectedPeriod() === opt.days
                          ? 'border-gold/60 bg-gold/10 text-gold'
                          : 'border-white/10 text-muted hover:border-white/20'}`}
                    >
                      {opt.label}
                    </button>
                  )}
                </For>
              </div>
            </div>

            {/* Profile (optional) */}
            <Show when={profiles().length > 0}>
              <div>
                <label class="text-xs text-muted block mb-1.5">
                  Carta natal (opcional — personaliza el análisis)
                </label>
                <select
                  value={selectedProfile() ?? ''}
                  onChange={(e) => setSelectedProfile(e.currentTarget.value ? Number(e.currentTarget.value) : null)}
                  class="w-full px-4 py-2.5 rounded-xl bg-base-100 border border-white/10
                         text-cream text-sm focus:outline-none focus:border-gold/40"
                >
                  <option value="">Sin carta natal (análisis general)</option>
                  <For each={profiles()}>
                    {(p) => <option value={p.id}>{p.name} — {p.city}</option>}
                  </For>
                </select>
              </div>
            </Show>

            {/* Calculate button */}
            <button
              onClick={calculate}
              disabled={isCalculating()}
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold/80 to-amber-500/80
                     text-base-900 font-bold text-sm uppercase tracking-wider
                     hover:from-gold hover:to-amber-500 transition-all duration-200
                     disabled:opacity-50 disabled:cursor-wait
                     shadow-[0_4px_20px_rgba(240,184,64,0.2)]"
            >
              {isCalculating() ? (
                <span class="flex items-center justify-center gap-2">
                  <span class="animate-spin">⏳</span> Calculando posiciones planetarias...
                </span>
              ) : (
                <span class="flex items-center justify-center gap-2">
                  <span>🔮</span> Encontrar Mejor Momento
                </span>
              )}
            </button>
          </div>
        </div>
      </Show>

      {/* ═══ RESULTS ═══ */}
      <Show when={showResults() && results().length > 0}>

        {/* Summary header */}
        <div class="glass rounded-2xl p-5 border border-white/5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="text-gold text-lg">③</span>
              <h2 class="text-sm font-semibold text-cream uppercase tracking-wider">
                Resultados: {actionInfo()?.label}
              </h2>
            </div>
            <span class="text-xs text-muted">
              {stats()?.total} días analizados
            </span>
          </div>

          {/* Stats pills */}
          <div class="flex flex-wrap gap-2 mb-4">
            <Show when={(stats()?.excellent ?? 0) > 0}>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/40 text-emerald-400 border border-emerald-700/40">
                ✦ {stats()?.excellent} excelente{(stats()?.excellent ?? 0) > 1 ? 's' : ''}
              </span>
            </Show>
            <Show when={(stats()?.good ?? 0) > 0}>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/40 text-blue-300 border border-blue-700/40">
                ● {stats()?.good} bueno{(stats()?.good ?? 0) > 1 ? 's' : ''}
              </span>
            </Show>
            <Show when={(stats()?.acceptable ?? 0) > 0}>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-amber-900/40 text-amber-400 border border-amber-700/40">
                ○ {stats()?.acceptable} aceptable{(stats()?.acceptable ?? 0) > 1 ? 's' : ''}
              </span>
            </Show>
            <Show when={(stats()?.poor ?? 0) > 0}>
              <span class="px-3 py-1 rounded-full text-xs font-semibold bg-red-900/30 text-red-400/70 border border-red-800/30">
                ✗ {stats()?.poor} desfavorable{(stats()?.poor ?? 0) > 1 ? 's' : ''}
              </span>
            </Show>
          </div>

          {/* Best date highlight */}
          <Show when={stats()?.best}>
            <div class="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/20
                        shadow-[0_0_20px_rgba(52,211,153,0.05)]">
              <p class="text-xs text-emerald-400/80 uppercase tracking-wider mb-1">
                ★ Mejor fecha encontrada
              </p>
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-lg font-serif font-bold text-cream">
                    {formatDateLong(stats()!.best.date)}
                  </p>
                  <p class="text-xs text-muted mt-0.5">
                    Luna {stats()!.best.moonPhase} en {SIGN_NAMES[stats()!.best.moonSign]}
                    {SIGN_SYMBOLS[stats()!.best.moonSign]}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-2xl font-bold text-emerald-400">{stats()!.best.score}</p>
                  <p class="text-xs text-muted">/100</p>
                </div>
              </div>
            </div>
          </Show>
        </div>

        {/* View mode toggle */}
        <div class="flex gap-1 bg-base-100 rounded-xl p-1 border border-white/5">
          <button
            onClick={() => setViewMode('timeline')}
            class={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
              ${viewMode() === 'timeline' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-muted hover:text-cream'}`}
          >
            ▰ Timeline
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            class={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
              ${viewMode() === 'calendar' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-muted hover:text-cream'}`}
          >
            📅 Calendario
          </button>
          <button
            onClick={() => setViewMode('list')}
            class={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
              ${viewMode() === 'list' ? 'bg-gold/10 text-gold border border-gold/30' : 'text-muted hover:text-cream'}`}
          >
            📋 Lista
          </button>
        </div>

        {/* ── TIMELINE VIEW ── */}
        <Show when={viewMode() === 'timeline'}>
          <div class="glass rounded-2xl p-4 border border-white/5 space-y-1">
            <For each={resultsByDate()}>
              {(result, i) => (
                <div>
                  <button
                    onClick={() => setExpandedDay(expandedDay() === i() ? null : i())}
                    class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-100 transition-all"
                  >
                    {/* Date */}
                    <span class="text-xs text-muted w-16 flex-shrink-0 text-left">
                      {formatDateShort(result.date)}
                    </span>
                    {/* Score bar */}
                    <div class="flex-1 h-4 bg-base-200 rounded-full overflow-hidden relative">
                      <div
                        class={`h-full rounded-full transition-all duration-500 ${gradeBarColor(result.grade)}`}
                        style={{ width: `${result.score}%` }}
                      />
                      <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-cream/80">
                        {result.score}
                      </span>
                    </div>
                    {/* Grade dot */}
                    <div class={`w-3 h-3 rounded-full flex-shrink-0 ${gradeDotColor(result.grade)}`}
                         title={gradeLabel(result.grade)} />
                    {/* Moon info */}
                    <span class="text-xs text-muted w-6 text-center flex-shrink-0">
                      {SIGN_SYMBOLS[result.moonSign]}
                    </span>
                    {/* Expand indicator */}
                    <span class="text-xs text-muted/50">
                      {expandedDay() === i() ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Expanded details */}
                  <Show when={expandedDay() === i()}>
                    <div class="mx-3 mt-1 mb-3 p-4 rounded-xl bg-base-50 border border-white/5 space-y-3">
                      {/* Header */}
                      <div class="flex items-center justify-between">
                        <div>
                          <p class="text-sm font-medium text-cream">{formatDateLong(result.date)}</p>
                          <p class="text-xs text-muted">
                            Luna {result.moonPhase} en {SIGN_NAMES[result.moonSign]} {SIGN_SYMBOLS[result.moonSign]}
                            {result.isVoidOfCourse && ' • Vacío de Curso ⚠️'}
                            {result.hasRetroMercury && ' • Mercurio ℞'}
                          </p>
                        </div>
                        <div class={`px-3 py-1 rounded-full text-xs font-bold ${gradeBadgeClass(result.grade)}`}>
                          {gradeLabel(result.grade)} ({result.score}/100)
                        </div>
                      </div>

                      {/* Reasons (positive) */}
                      <Show when={result.reasons.length > 0}>
                        <div>
                          <p class="text-xs text-emerald-400/80 font-semibold mb-1">A favor:</p>
                          <div class="space-y-1">
                            <For each={result.reasons}>
                              {(r) => (
                                <p class="text-xs text-cream-dark flex items-start gap-2">
                                  <span class="text-emerald-400 flex-shrink-0">✓</span> {r}
                                </p>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>

                      {/* Warnings (negative) */}
                      <Show when={result.warnings.length > 0}>
                        <div>
                          <p class="text-xs text-amber-400/80 font-semibold mb-1">Cuidado:</p>
                          <div class="space-y-1">
                            <For each={result.warnings}>
                              {(w) => (
                                <p class="text-xs text-cream-dark/70 flex items-start gap-2">
                                  <span class="text-amber-400 flex-shrink-0">⚠</span> {w}
                                </p>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>

        {/* ── CALENDAR VIEW ── */}
        <Show when={viewMode() === 'calendar'}>
          <div class="glass rounded-2xl p-4 border border-white/5">
            <CalendarGrid results={resultsByDate()} />
          </div>
        </Show>

        {/* ── LIST VIEW (top dates) ── */}
        <Show when={viewMode() === 'list'}>
          <div class="space-y-2">
            <For each={results().slice(0, 10)}>
              {(result, i) => (
                <div class={`glass rounded-xl p-4 border ${i() === 0 ? 'border-emerald-700/30' : 'border-white/5'}`}>
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                      <span class={`text-lg font-bold ${i() === 0 ? 'text-emerald-400' : i() < 3 ? 'text-gold' : 'text-muted'}`}>
                        #{i() + 1}
                      </span>
                      <div>
                        <p class="text-sm font-medium text-cream">{formatDateLong(result.date)}</p>
                        <p class="text-xs text-muted">
                          {getDayName(result.date)} • Luna {result.moonPhase} en {SIGN_NAMES[result.moonSign]}
                        </p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class={`text-xl font-bold ${gradeScoreColor(result.grade)}`}>{result.score}</p>
                      <p class={`text-xs font-medium ${gradeBadgeTextColor(result.grade)}`}>{gradeLabel(result.grade)}</p>
                    </div>
                  </div>
                  {/* Compact reasons */}
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <For each={result.reasons.slice(0, 3)}>
                      {(r) => (
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400/80 border border-emerald-800/20">
                          {r}
                        </span>
                      )}
                    </For>
                    <For each={result.warnings.slice(0, 2)}>
                      {(w) => (
                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-400/80 border border-amber-800/20">
                          {w}
                        </span>
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>

        {/* Legend */}
        <div class="glass rounded-xl px-4 py-3 border border-white/5">
          <p class="text-xs text-muted font-medium mb-2">Leyenda de calidad:</p>
          <div class="flex flex-wrap gap-4 text-xs text-muted">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Excelente (75-100)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-400" /> Bueno (60-74)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400" /> Aceptable (40-59)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-red-400/60" /> Desfavorable (0-39)
            </span>
          </div>
        </div>

        {/* Methodology disclaimer */}
        <div class="glass rounded-xl px-4 py-3 border border-white/5">
          <p class="text-xs text-muted leading-relaxed">
            <strong class="text-cream/80">Metodología:</strong> Cálculo basado en posiciones planetarias reales
            (Swiss Ephemeris), fases lunares, retrógrados, signos lunares y aspectos entre planetas.
            Las reglas siguen la tradición de Astrología Eletiva (Dorotheus, Joann Hampar).
            Los planetas sugieren — tú decides.
          </p>
        </div>
      </Show>
    </div>
  );
}

// ============================================================
// CALENDAR GRID SUB-COMPONENT
// ============================================================

function CalendarGrid(props: { results: ElectiveResult[] }) {
  const weeks = createMemo(() => {
    const r = props.results;
    if (r.length === 0) return [];

    const firstDay = r[0].date.getDay(); // 0=Sun
    const rows: (ElectiveResult | null)[][] = [];
    let currentWeek: (ElectiveResult | null)[] = [];

    // Pad first week
    for (let i = 0; i < firstDay; i++) currentWeek.push(null);

    for (const result of r) {
      currentWeek.push(result);
      if (currentWeek.length === 7) {
        rows.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      rows.push(currentWeek);
    }

    return rows;
  });

  return (
    <div>
      {/* Header */}
      <div class="grid grid-cols-7 gap-1 mb-2">
        <For each={['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']}>
          {(d) => <div class="text-center text-[10px] text-muted font-medium py-1">{d}</div>}
        </For>
      </div>
      {/* Grid */}
      <div class="space-y-1">
        <For each={weeks()}>
          {(week) => (
            <div class="grid grid-cols-7 gap-1">
              <For each={week}>
                {(cell) => (
                  <div class={`aspect-square rounded-lg flex flex-col items-center justify-center
                    ${cell ? `${gradeCalendarBg(cell.grade)} border border-white/5` : ''}`}
                    title={cell ? `${formatDateLong(cell.date)}: ${cell.score}/100 — ${gradeLabel(cell.grade)}` : ''}
                  >
                    <Show when={cell}>
                      <span class="text-xs font-medium text-cream/80">{cell!.date.getDate()}</span>
                      <span class="text-[9px] text-muted">{cell!.score}</span>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

function formatDateLong(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function getDayName(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'long' });
}

function gradeBarColor(grade: ElectiveResult['grade']): string {
  switch (grade) {
    case 'excellent': return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
    case 'good': return 'bg-gradient-to-r from-blue-600 to-blue-400';
    case 'acceptable': return 'bg-gradient-to-r from-amber-600 to-amber-400';
    case 'poor': return 'bg-gradient-to-r from-red-800 to-red-600';
  }
}

function gradeDotColor(grade: ElectiveResult['grade']): string {
  switch (grade) {
    case 'excellent': return 'bg-emerald-400';
    case 'good': return 'bg-blue-400';
    case 'acceptable': return 'bg-amber-400';
    case 'poor': return 'bg-red-400/60';
  }
}

function gradeBadgeClass(grade: ElectiveResult['grade']): string {
  switch (grade) {
    case 'excellent': return 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40';
    case 'good': return 'bg-blue-900/40 text-blue-300 border border-blue-700/40';
    case 'acceptable': return 'bg-amber-900/40 text-amber-400 border border-amber-700/40';
    case 'poor': return 'bg-red-900/30 text-red-400/70 border border-red-800/30';
  }
}

function gradeBadgeTextColor(grade: ElectiveResult['grade']): string {
  switch (grade) {
    case 'excellent': return 'text-emerald-400';
    case 'good': return 'text-blue-400';
    case 'acceptable': return 'text-amber-400';
    case 'poor': return 'text-red-400/60';
  }
}

function gradeScoreColor(grade: ElectiveResult['grade']): string {
  switch (grade) {
    case 'excellent': return 'text-emerald-400';
    case 'good': return 'text-blue-400';
    case 'acceptable': return 'text-amber-400';
    case 'poor': return 'text-red-400/60';
  }
}

function gradeCalendarBg(grade: ElectiveResult['grade']): string {
  switch (grade) {
    case 'excellent': return 'bg-emerald-950/50';
    case 'good': return 'bg-blue-950/40';
    case 'acceptable': return 'bg-amber-950/30';
    case 'poor': return 'bg-red-950/20';
  }
}

function gradeLabel(grade: ElectiveResult['grade']): string {
  switch (grade) {
    case 'excellent': return 'Excelente';
    case 'good': return 'Bueno';
    case 'acceptable': return 'Aceptable';
    case 'poor': return 'Desfavorable';
  }
}
