import { createSignal, createMemo, For, Show } from 'solid-js';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DayData {
  dayIndex: number;      // 0=Sun … 6=Sat
  dayName: string;
  planet: string;
  planetSymbol: string;
  planetIcon: string;
  color: string;
  quality: 'good' | 'neutral' | 'challenging';
  qualityLabel: string;
  favorable: Activity[];
  unfavorable: Activity[];
  advice: string;
}

interface Activity {
  icon: string;
  label: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const DAYS_DATA: DayData[] = [
  {
    dayIndex: 0,
    dayName: 'Domingo',
    planet: 'Sol',
    planetSymbol: '☉',
    planetIcon: '🌞',
    color: '#f0b840',
    quality: 'good',
    qualityLabel: 'Dia Excelente',
    favorable: [
      { icon: '👑', label: 'Liderança e autoridade' },
      { icon: '🎭', label: 'Autoexpressão e criatividade' },
      { icon: '🎨', label: 'Projetos artísticos pessoais' },
      { icon: '💡', label: 'Inovação e visibilidade' },
      { icon: '🌟', label: 'Brilhar e se destacar' },
    ],
    unfavorable: [
      { icon: '🙈', label: 'Recolhimento e introspecção' },
      { icon: '🧮', label: 'Tarefas detalhistas e repetitivas' },
      { icon: '🤝', label: 'Negociações de compromisso' },
    ],
    advice: 'O Sol ilumina tudo que você toca hoje. Assuma o protagonismo, mostre seu trabalho ao mundo e tome decisões que refletem quem você realmente é.',
  },
  {
    dayIndex: 1,
    dayName: 'Segunda-feira',
    planet: 'Lua',
    planetSymbol: '☽',
    planetIcon: '🌙',
    color: '#c8d8f0',
    quality: 'neutral',
    qualityLabel: 'Dia Reflexivo',
    favorable: [
      { icon: '🏠', label: 'Família e vida doméstica' },
      { icon: '🥗', label: 'Nutrição e cuidados com o corpo' },
      { icon: '🌿', label: 'Introspecção e descanso emocional' },
      { icon: '💧', label: 'Atividades intuitivas e criativas' },
      { icon: '📔', label: 'Journaling e memórias' },
    ],
    unfavorable: [
      { icon: '📢', label: 'Apresentações públicas de alto impacto' },
      { icon: '⚡', label: 'Decisões rápidas e irreversíveis' },
      { icon: '🏋️', label: 'Esportes de alta intensidade' },
    ],
    advice: 'A Lua convida à sensibilidade e ao cuidado. Nutra suas relações próximas, ouça seu corpo e deixe a intuição guiar mais do que a razão hoje.',
  },
  {
    dayIndex: 2,
    dayName: 'Terça-feira',
    planet: 'Marte',
    planetSymbol: '♂',
    planetIcon: '🔴',
    color: '#e05a5a',
    quality: 'good',
    qualityLabel: 'Dia Dinâmico',
    favorable: [
      { icon: '🏃', label: 'Esportes e exercícios intensos' },
      { icon: '⚔️', label: 'Decisões ousadas e corajosas' },
      { icon: '🔧', label: 'Reparos, construção, trabalho físico' },
      { icon: '🩺', label: 'Cirurgias e procedimentos médicos' },
      { icon: '🚀', label: 'Iniciar projetos com energia' },
    ],
    unfavorable: [
      { icon: '🕊️', label: 'Mediações e acordos delicados' },
      { icon: '💆', label: 'Atividades que exigem calma absoluta' },
      { icon: '💌', label: 'Declarações amorosas e romances' },
    ],
    advice: 'Marte energiza sua vontade e determinação. Use essa força para agir, superar obstáculos e iniciar o que foi adiado. Evite conflitos desnecessários.',
  },
  {
    dayIndex: 3,
    dayName: 'Quarta-feira',
    planet: 'Mercúrio',
    planetSymbol: '☿',
    planetIcon: '✉️',
    color: '#a0c8a0',
    quality: 'good',
    qualityLabel: 'Dia Comunicativo',
    favorable: [
      { icon: '💬', label: 'Comunicação e conversas importantes' },
      { icon: '📋', label: 'Negócios e reuniões de trabalho' },
      { icon: '📚', label: 'Estudos e aprendizado' },
      { icon: '📝', label: 'Assinar contratos e documentos' },
      { icon: '🧠', label: 'Análises e planejamento estratégico' },
    ],
    unfavorable: [
      { icon: '🎨', label: 'Arte contemplativa e inspiração lenta' },
      { icon: '😴', label: 'Descanso total e desligamento' },
      { icon: '💪', label: 'Atividades puramente físicas' },
    ],
    advice: 'Mercúrio afina sua mente e linguagem. É o melhor dia para escrever, negociar, aprender algo novo ou ter aquela conversa importante que você tem adiado.',
  },
  {
    dayIndex: 4,
    dayName: 'Quinta-feira',
    planet: 'Júpiter',
    planetSymbol: '♃',
    planetIcon: '🔵',
    color: '#7090d8',
    quality: 'good',
    qualityLabel: 'Dia Expansivo',
    favorable: [
      { icon: '📈', label: 'Expansão e crescimento de negócios' },
      { icon: '✈️', label: 'Viagens e aventuras' },
      { icon: '💰', label: 'Investimentos e oportunidades' },
      { icon: '🎓', label: 'Ensino, mentorias e filosofia' },
      { icon: '🌍', label: 'Conexões internacionais' },
    ],
    unfavorable: [
      { icon: '🔬', label: 'Trabalho minucioso e detalhista' },
      { icon: '💳', label: 'Economizar e conter gastos' },
      { icon: '🏠', label: 'Rotinas domésticas sem objetivo' },
    ],
    advice: 'Júpiter amplia tudo que você toca. Pense grande, arrisque com sabedoria e abra-se para oportunidades que chegam por caminhos inesperados hoje.',
  },
  {
    dayIndex: 5,
    dayName: 'Sexta-feira',
    planet: 'Vênus',
    planetSymbol: '♀',
    planetIcon: '💚',
    color: '#90d080',
    quality: 'good',
    qualityLabel: 'Dia Harmonioso',
    favorable: [
      { icon: '🎨', label: 'Arte, música e criação estética' },
      { icon: '💕', label: 'Amor, relacionamentos e afeto' },
      { icon: '👫', label: 'Socialização e encontros' },
      { icon: '💄', label: 'Beleza e autocuidado' },
      { icon: '🌹', label: 'Prazer, luxo e bem-estar' },
    ],
    unfavorable: [
      { icon: '⚔️', label: 'Confrontos e disputas' },
      { icon: '📊', label: 'Análises frias e decisões lógicas' },
      { icon: '🏋️', label: 'Competições esportivas intensas' },
    ],
    advice: 'Vênus convida à harmonia e ao prazer. Cultive a beleza ao seu redor, conecte-se com pessoas que ama e permita-se desfrutar dos prazeres simples da vida.',
  },
  {
    dayIndex: 6,
    dayName: 'Sábado',
    planet: 'Saturno',
    planetSymbol: '♄',
    planetIcon: '⬛',
    color: '#8888a0',
    quality: 'challenging',
    qualityLabel: 'Dia Disciplinado',
    favorable: [
      { icon: '📅', label: 'Planejamento e organização' },
      { icon: '🏗️', label: 'Projetos de longo prazo e estruturação' },
      { icon: '📊', label: 'Revisões, auditorias e balanços' },
      { icon: '🧹', label: 'Limpeza, ordem e descarte' },
      { icon: '📖', label: 'Estudo sério e aprofundado' },
    ],
    unfavorable: [
      { icon: '🎉', label: 'Festas e celebrações espontâneas' },
      { icon: '💸', label: 'Gastos impulsivos' },
      { icon: '🌀', label: 'Improviso e espontaneidade' },
    ],
    advice: 'Saturno exige seriedade e compromisso. Use o dia para construir fundações sólidas, honrar suas responsabilidades e fazer o que é necessário — não apenas o que é fácil.',
  },
];

// Day names for the week view
const WEEK_DAY_NAMES_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getNext7Days(): { date: Date; data: DayData }[] {
  const result = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({ date: d, data: DAYS_DATA[d.getDay()] });
  }
  return result;
}

function qualityBadgeClasses(quality: DayData['quality']): string {
  switch (quality) {
    case 'good': return 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40';
    case 'neutral': return 'bg-blue-900/40 text-blue-300 border border-blue-700/40';
    case 'challenging': return 'bg-amber-900/40 text-amber-400 border border-amber-700/40';
  }
}

function qualityDot(quality: DayData['quality']): string {
  switch (quality) {
    case 'good': return 'bg-emerald-400';
    case 'neutral': return 'bg-blue-400';
    case 'challenging': return 'bg-amber-400';
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BestTime() {
  const today = new Date();
  const todayData = DAYS_DATA[today.getDay()];
  const [showWeek, setShowWeek] = createSignal(false);
  const next7 = createMemo(() => getNext7Days());

  return (
    <div class="space-y-6">

      {/* ── Today header ── */}
      <div class="glass rounded-2xl p-6 border border-white/5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p class="text-xs text-muted uppercase tracking-widest mb-1">Hoje é</p>
            <h2 class="text-2xl font-serif font-bold text-cream capitalize">
              {formatDate(today)}
            </h2>
          </div>
          <div
            class="flex items-center gap-3 px-5 py-3 rounded-xl border border-white/10"
            style={{ background: `${todayData.color}15` }}
          >
            <span class="text-3xl">{todayData.planetIcon}</span>
            <div>
              <p class="text-xs text-muted">Planeta regente</p>
              <p class="font-bold text-lg" style={{ color: todayData.color }}>
                {todayData.planetSymbol} {todayData.planet}
              </p>
            </div>
          </div>
        </div>

        {/* Quality indicator */}
        <div class="mt-4 flex items-center gap-2">
          <div class={`w-2 h-2 rounded-full ${qualityDot(todayData.quality)}`} />
          <span class={`text-xs font-semibold px-3 py-1 rounded-full ${qualityBadgeClasses(todayData.quality)}`}>
            {todayData.qualityLabel}
          </span>
        </div>
      </div>

      {/* ── Favorable activities ── */}
      <div class="glass rounded-2xl p-5 border border-emerald-800/20"
           style="box-shadow: 0 0 20px rgba(52,211,153,0.04);">
        <h3 class="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>✦</span> Atividades Favorecidas
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <For each={todayData.favorable}>
            {(activity) => (
              <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-950/30 border border-emerald-800/20">
                <span class="text-xl flex-shrink-0">{activity.icon}</span>
                <span class="text-sm text-cream-dark">{activity.label}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* ── Unfavorable activities ── */}
      <div class="glass rounded-2xl p-5 border border-red-900/20"
           style="box-shadow: 0 0 20px rgba(239,68,68,0.03);">
        <h3 class="text-sm font-semibold text-red-400/80 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>✦</span> Evitar ou Adiar
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <For each={todayData.unfavorable}>
            {(activity) => (
              <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-950/20 border border-red-900/20">
                <span class="text-xl flex-shrink-0 opacity-60">{activity.icon}</span>
                <span class="text-sm text-cream-dark/60">{activity.label}</span>
              </div>
            )}
          </For>
        </div>
      </div>

      {/* ── Advice ── */}
      <div class="glass rounded-2xl p-5 border border-white/5"
           style={{ "border-left": `3px solid ${todayData.color}` }}>
        <h3 class="text-sm font-semibold uppercase tracking-wider mb-3"
            style={{ color: todayData.color }}>
          ✦ Conselho do Dia
        </h3>
        <p class="text-cream-dark leading-relaxed text-sm">{todayData.advice}</p>
      </div>

      {/* ── Toggle next 7 days ── */}
      <div>
        <button
          onClick={() => setShowWeek(v => !v)}
          class="w-full glass rounded-2xl px-5 py-4 text-sm font-medium text-gold border border-white/5
                 hover:border-gold/30 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>{showWeek() ? '▲' : '▼'}</span>
          {showWeek() ? 'Ocultar próximos 7 dias' : 'Ver próximos 7 dias'}
        </button>

        <Show when={showWeek()}>
          <div class="mt-3 glass rounded-2xl overflow-hidden border border-white/5">
            {/* Table header */}
            <div class="grid grid-cols-[2fr_1fr_1fr_2fr] gap-px bg-base-300 text-xs font-semibold text-muted uppercase tracking-wider">
              <div class="bg-base-100 px-4 py-3">Dia</div>
              <div class="bg-base-100 px-3 py-3 text-center">Planeta</div>
              <div class="bg-base-100 px-3 py-3 text-center">Qualidade</div>
              <div class="bg-base-100 px-4 py-3">Foco</div>
            </div>

            <For each={next7()}>
              {({ date, data }, i) => (
                <div
                  class={`grid grid-cols-[2fr_1fr_1fr_2fr] gap-px bg-base-300 text-sm
                          ${i() === 0 ? 'bg-opacity-100' : ''}`}
                >
                  {/* Day name */}
                  <div class={`px-4 py-3 flex items-center gap-2
                               ${i() === 0 ? 'bg-base-100 font-bold' : 'bg-base-50'}`}>
                    <span class={i() === 0 ? 'text-gold' : 'text-cream-dark'}>
                      {i() === 0 ? '→ Hoje' : WEEK_DAY_NAMES_SHORT[date.getDay()]}
                    </span>
                    <span class="text-muted text-xs">
                      {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>

                  {/* Planet */}
                  <div class={`px-3 py-3 flex items-center justify-center gap-1.5
                               ${i() === 0 ? 'bg-base-100' : 'bg-base-50'}`}>
                    <span class="text-base">{data.planetIcon}</span>
                    <span class="text-xs font-medium hidden sm:inline" style={{ color: data.color }}>
                      {data.planet}
                    </span>
                  </div>

                  {/* Quality dot */}
                  <div class={`px-3 py-3 flex items-center justify-center
                               ${i() === 0 ? 'bg-base-100' : 'bg-base-50'}`}>
                    <div class={`w-2.5 h-2.5 rounded-full ${qualityDot(data.quality)}`}
                         title={data.qualityLabel} />
                  </div>

                  {/* First favorable activity */}
                  <div class={`px-4 py-3 flex items-center gap-2
                               ${i() === 0 ? 'bg-base-100' : 'bg-base-50'}`}>
                    <span class="text-base">{data.favorable[0].icon}</span>
                    <span class="text-xs text-cream-dark truncate">{data.favorable[0].label}</span>
                  </div>
                </div>
              )}
            </For>

            {/* Legend */}
            <div class="bg-base-100 px-4 py-3 flex gap-5 text-xs text-muted border-t border-base-300">
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Excelente
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Neutro
              </span>
              <span class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Desafiador
              </span>
            </div>
          </div>
        </Show>
      </div>

      {/* ── Footer disclaimer ── */}
      <p class="text-center text-xs text-muted/60 pb-2">
        Baseado em Astrologia Eletiva simplificada · Os planetas sugerem, você decide
      </p>
    </div>
  );
}
