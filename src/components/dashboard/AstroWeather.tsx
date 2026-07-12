/**
 * AstroWeather — Clima Astral do Dia
 *
 * Calcula o aspecto astrológico dominante baseado na data atual usando
 * posições planetárias simplificadas (ciclos médios). Totalmente client-side,
 * sem APIs externas. Textos em pt-BR hardcoded (serão internacionalizados).
 */

import { createSignal, onMount } from 'solid-js';
import { localeToDateLocale } from '../../utils/dateTime';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Aspect {
  planet1: string;
  planet2: string;
  symbol1: string;
  symbol2: string;
  aspectName: string;
  aspectGlyph: string;
  headline: string;
  body: string;
  advice: string;
  color: string;       // cor hex temática
  glow: string;        // rgba para o glow
  energy: 'harmonic' | 'tense' | 'neutral';
}

// ─── Dados planetários ────────────────────────────────────────────────────────

/**
 * Posição eclíptica simplificada em graus (longitude eclíptica média).
 * Referência: posição em J2000.0 + velocidade média × dias desde J2000.
 * Suficiente para calcular ângulos entre planetas com ~2–5° de precisão.
 */
function getPlanetLongitude(planet: string, daysSinceJ2000: number): number {
  // L0 = longitude em J2000, speed = graus/dia
  const data: Record<string, { L0: number; speed: number }> = {
    sun:     { L0: 280.46,  speed: 0.98563 },
    moon:    { L0: 218.316, speed: 13.1764 },
    mercury: { L0: 252.25,  speed: 4.09234 },
    venus:   { L0: 181.98,  speed: 1.60214 },
    mars:    { L0: 355.45,  speed: 0.52403 },
    jupiter: { L0: 34.40,   speed: 0.08309 },
    saturn:  { L0: 50.08,   speed: 0.03346 },
    uranus:  { L0: 314.06,  speed: 0.01172 },
    neptune: { L0: 304.35,  speed: 0.00598 },
    pluto:   { L0: 238.93,  speed: 0.00397 },
  };
  const p = data[planet];
  if (!p) return 0;
  return ((p.L0 + p.speed * daysSinceJ2000) % 360 + 360) % 360;
}

/** Normaliza ângulo para [0, 360) */
function norm(a: number): number {
  return ((a % 360) + 360) % 360;
}

/** Diferença angular mínima entre dois ângulos [-180, 180] */
function angleDiff(a: number, b: number): number {
  const d = norm(b - a);
  return d > 180 ? d - 360 : d;
}

// ─── Banco de aspectos + interpretações ──────────────────────────────────────

const PLANETS_LIST = [
  { id: 'sun',     name: 'Sol',      symbol: '☉' },
  { id: 'moon',    name: 'Lua',      symbol: '☽' },
  { id: 'mercury', name: 'Mercúrio', symbol: '☿' },
  { id: 'venus',   name: 'Vênus',    symbol: '♀' },
  { id: 'mars',    name: 'Marte',    symbol: '♂' },
  { id: 'jupiter', name: 'Júpiter',  symbol: '♃' },
  { id: 'saturn',  name: 'Saturno',  symbol: '♄' },
  { id: 'uranus',  name: 'Urano',    symbol: '♅' },
  { id: 'neptune', name: 'Netuno',   symbol: '♆' },
  { id: 'pluto',   name: 'Plutão',   symbol: '♇' },
];

// Aspectos: nome, glifo, orbe, energia
const ASPECT_TYPES = [
  { name: 'Conjunção',     glyph: '☌', angle: 0,   orb: 8,  energy: 'neutral'  as const },
  { name: 'Sextil',        glyph: '⚹', angle: 60,  orb: 5,  energy: 'harmonic' as const },
  { name: 'Quadratura',    glyph: '□', angle: 90,  orb: 7,  energy: 'tense'    as const },
  { name: 'Trígono',       glyph: '△', angle: 120, orb: 7,  energy: 'harmonic' as const },
  { name: 'Oposição',      glyph: '☍', angle: 180, orb: 8,  energy: 'tense'    as const },
  { name: 'Quincúncio',    glyph: '⚻', angle: 150, orb: 3,  energy: 'tense'    as const },
];

// Interpretações por par de planetas + tipo de aspecto
// Formato: [headline, body, advice, colorHex, glowRgba]
type InterpKey = `${string}_${string}_${string}`;

const INTERPRETATIONS: Partial<Record<InterpKey, [string, string, string, string, string]>> = {
  // Sol ☌ Lua — Novilúnio
  'sun_moon_☌': ['Novilúnio — Novos Começos', 'Uma fase de renovação e intenções frescas. A mente e o coração apontam na mesma direção.', 'Defina suas intenções para o próximo ciclo.', '#f0b840', 'rgba(240,184,64,0.22)'],
  // Sol △ Júpiter
  'sun_jupiter_△': ['Sol Trígono Júpiter — Expansão Iluminada', 'Otimismo e oportunidades fluem naturalmente. Sorte e vitalidade andam juntos hoje.', 'Arrisque-se em projetos que envolvam crescimento.', '#f5d470', 'rgba(245,212,112,0.22)'],
  // Sol □ Saturno
  'sun_saturn_□': ['Sol Quadratura Saturno — Disciplina ou Bloqueio', 'Tensão entre vontade e limitações. O esforço extra é recompensado, mas a resistência é real.', 'Enfrente obstáculos com paciência — não com força bruta.', '#a0a0b0', 'rgba(160,160,176,0.20)'],
  // Sol △ Lua
  'sun_moon_△': ['Sol Trígono Lua — Harmonia Interna', 'Emoções e intenções em sintonia. Ótimo para tomar decisões importantes com clareza.', 'Confie nos seus instintos hoje — eles estão afiados.', '#f5d470', 'rgba(245,212,112,0.20)'],
  // Vênus □ Marte
  'venus_mars_□': ['Vênus Quadratura Marte — Desejo em Choque', 'Atração intensa mas com fricção. Impulsos românticos entram em conflito com a realidade prática.', 'Canalize a energia para a criatividade em vez de confrontos.', '#ff7eb3', 'rgba(255,126,179,0.22)'],
  // Vênus △ Júpiter
  'venus_jupiter_△': ['Vênus Trígono Júpiter — Abundância no Amor', 'Um dos melhores dias para relações e finanças. Generosidade e prazer se multiplicam.', 'Celebre o que tem. Generosidade atrai mais abundância.', '#f5d470', 'rgba(245,212,112,0.25)'],
  // Vênus ☌ Marte
  'venus_mars_☌': ['Vênus Conjunção Marte — Magnetismo Total', 'Paixão e charme no auge. Atração física e criativa intensificada.', 'Expresse seus desejos com autenticidade.', '#ff5599', 'rgba(255,85,153,0.22)'],
  // Vênus □ Urano
  'venus_uranus_□': ['Vênus Quadratura Urano — Reviravoltas no Amor', 'Instabilidade nos afetos. Surpresas inesperadas podem sacudir relacionamentos.', 'Quebre rotinas e abrace o inesperado com leveza.', '#55aaff', 'rgba(85,170,255,0.22)'],
  // Vênus ☍ Saturno
  'venus_saturn_☍': ['Vênus Oposição Saturno — Amor vs. Dever', 'Tensão entre o coração e as responsabilidades. Relacionamentos podem sentir o peso do tempo.', 'Seja honesto sobre seus limites emocionais.', '#a0a0b0', 'rgba(160,160,176,0.18)'],
  // Mercúrio □ Marte
  'mercury_mars_□': ['Mercúrio Quadratura Marte — Mente Combativa', 'Comunicação acelerada e impulsiva. Risco de mal-entendidos e discussões.', 'Pense duas vezes antes de enviar aquela mensagem difícil.', '#ff6655', 'rgba(255,102,85,0.20)'],
  // Mercúrio △ Júpiter
  'mercury_jupiter_△': ['Mercúrio Trígono Júpiter — Mente Expansiva', 'Clareza intelectual e otimismo mental. Ótimo para aprendizado, negociações e viagens.', 'Expanda seus horizontes — estude, negocie, explore.', '#88ccff', 'rgba(136,204,255,0.22)'],
  // Mercúrio ☍ Netuno
  'mercury_neptune_☍': ['Mercúrio Oposição Netuno — Névoa Mental', 'Confusão e ilusões em potencial. A intuição fala alto, mas a razão pode se perder.', 'Verifique os fatos antes de agir. A intuição pode enganar.', '#8866ff', 'rgba(136,102,255,0.20)'],
  // Marte △ Júpiter
  'mars_jupiter_△': ['Marte Trígono Júpiter — Ação Vitoriosa', 'Energia abundante e confiante. Iniciativas têm maiores chances de sucesso.', 'Avance com confiança — o momento é favorável para ação.', '#ff9944', 'rgba(255,153,68,0.22)'],
  // Marte □ Saturno
  'mars_saturn_□': ['Marte Quadratura Saturno — Força vs. Limite', 'Frustração quando o impulso encontra restrições. Paciência é testada.', 'Trabalhe com os limites, não contra eles.', '#aa6644', 'rgba(170,102,68,0.20)'],
  // Júpiter △ Urano
  'jupiter_uranus_△': ['Júpiter Trígono Urano — Liberdade Expansiva', 'Descobertas súbitas e oportunidades inesperadas. Mudanças positivas chegam de surpresa.', 'Esteja aberto a oportunidades fora do roteiro.', '#aaddff', 'rgba(170,221,255,0.22)'],
  // Saturno □ Netuno
  'saturn_neptune_□': ['Saturno Quadratura Netuno — Realidade vs. Sonho', 'Tensão entre o ideal e o possível. Ilusões são confrontadas com realidade.', 'Ajuste expectativas sem perder a visão.', '#6688aa', 'rgba(102,136,170,0.20)'],
  // Lua △ Sol (ordem reversa capturada)
  'moon_sun_△': ['Sol Trígono Lua — Harmonia Interna', 'Emoções e intenções em sintonia. Ótimo para decisões importantes com clareza.', 'Confie nos seus instintos hoje — eles estão afiados.', '#f5d470', 'rgba(245,212,112,0.20)'],
  // Lua ☌ Vênus
  'moon_venus_☌': ['Lua Conjunção Vênus — Ternura e Beleza', 'Sensibilidade emocional e apreciação estética elevadas. Dia propício para conexões afetivas.', 'Valorize os pequenos gestos de carinho.', '#ffaad4', 'rgba(255,170,212,0.22)'],
  // Lua △ Júpiter
  'moon_jupiter_△': ['Lua Trígono Júpiter — Generosidade Emocional', 'Bom humor e otimismo fluem naturalmente. Generosidade e fé se expandem.', 'Compartilhe sua alegria — ela se multiplica.', '#f5d470', 'rgba(245,212,112,0.20)'],
  // Lua □ Saturno
  'moon_saturn_□': ['Lua Quadratura Saturno — Peso Emocional', 'Dificuldade em expressar sentimentos. Responsabilidades pesam sobre o humor.', 'Cuide de si mesmo antes de cuidar dos outros.', '#888899', 'rgba(136,136,153,0.20)'],
  // Lua ☍ Marte
  'moon_mars_☍': ['Lua Oposição Marte — Impulsos à Flor da Pele', 'Irritabilidade e reações emocionais exageradas. Cuidado com impulsividade.', 'Respire fundo antes de responder.', '#ff7755', 'rgba(255,119,85,0.20)'],
};

// Cores e glows padrão por energia do aspecto (fallback)
const ENERGY_DEFAULTS = {
  harmonic: { color: '#55dd99', glow: 'rgba(85,221,153,0.20)' },
  tense:    { color: '#ff7755', glow: 'rgba(255,119,85,0.20)' },
  neutral:  { color: '#f0b840', glow: 'rgba(240,184,64,0.20)' },
};

// Textos padrão por aspecto + energia (fallback genérico)
function fallbackHeadline(p1: string, p2: string, glyph: string, aspectName: string): string {
  return `${p1} ${glyph} ${p2} — ${aspectName}`;
}

function fallbackBody(energy: 'harmonic' | 'tense' | 'neutral'): string {
  const map = {
    harmonic: 'Energias fluem em harmonia. Aproveite para avançar nos seus projetos com leveza.',
    tense:    'Uma tensão criativa está no ar. Use-a como combustível para superar desafios.',
    neutral:  'Energias se combinam. Um momento de intensidade e foco.',
  };
  return map[energy];
}

function fallbackAdvice(energy: 'harmonic' | 'tense' | 'neutral'): string {
  const map = {
    harmonic: 'Siga o fluxo — o momento apoia suas iniciativas.',
    tense:    'Canalize a tensão criativamente em vez de resistir.',
    neutral:  'Observe as forças em jogo antes de agir.',
  };
  return map[energy];
}

// ─── Motor de cálculo ─────────────────────────────────────────────────────────

function calcDaysSinceJ2000(date: Date): number {
  const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  return (date.getTime() - J2000) / 86400000;
}

function findDominantAspect(date: Date): Aspect {
  const days = calcDaysSinceJ2000(date);

  // Calcular longitudes
  const longitudes: Record<string, number> = {};
  for (const p of PLANETS_LIST) {
    longitudes[p.id] = getPlanetLongitude(p.id, days);
  }

  // Coletar todos os aspectos ativos ordenados por orbe
  const candidates: Array<{
    p1: typeof PLANETS_LIST[0];
    p2: typeof PLANETS_LIST[0];
    aspect: typeof ASPECT_TYPES[0];
    exactness: number; // quanto mais próximo de 0, mais exato
  }> = [];

  for (let i = 0; i < PLANETS_LIST.length; i++) {
    for (let j = i + 1; j < PLANETS_LIST.length; j++) {
      const p1 = PLANETS_LIST[i];
      const p2 = PLANETS_LIST[j];
      const diff = Math.abs(angleDiff(longitudes[p1.id], longitudes[p2.id]));

      for (const asp of ASPECT_TYPES) {
        const deviation = Math.abs(diff - asp.angle);
        if (deviation <= asp.orb) {
          candidates.push({ p1, p2, aspect: asp, exactness: deviation });
        }
      }
    }
  }

  // Priorização: planetas pessoais (Sol, Lua, Vênus, Marte, Mercúrio) têm peso maior
  const PERSONAL = ['sun', 'moon', 'venus', 'mars', 'mercury'];
  const isPersonal = (id: string) => PERSONAL.includes(id);

  // Score: quanto mais exato E mais pessoal, maior score
  const scored = candidates.map(c => {
    let score = (10 - c.exactness) * 2; // precisão vale mais
    if (isPersonal(c.p1.id)) score += 4;
    if (isPersonal(c.p2.id)) score += 4;
    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    // Fallback absoluto: aspecto do dia baseado no dia do ano
    const doy = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const fallbackAspects: Aspect[] = [
      {
        planet1: 'Sol', planet2: 'Lua', symbol1: '☉', symbol2: '☽',
        aspectName: 'Semissextil', aspectGlyph: '⚺',
        headline: 'Sol Semissextil Lua — Ajuste Sutil',
        body: 'Uma leve tensão entre vontade e emoção. Pequenos ajustes no curso fazem grande diferença.',
        advice: 'Preste atenção aos detalhes emocionais que você costuma ignorar.',
        color: '#f0b840', glow: 'rgba(240,184,64,0.20)', energy: 'neutral',
      },
    ];
    return fallbackAspects[doy % fallbackAspects.length];
  }

  const best = scored[0];
  const key1 = `${best.p1.id}_${best.p2.id}_${best.aspect.glyph}` as InterpKey;
  const key2 = `${best.p2.id}_${best.p1.id}_${best.aspect.glyph}` as InterpKey;

  const interp = INTERPRETATIONS[key1] || INTERPRETATIONS[key2];

  if (interp) {
    const [headline, body, advice, color, glow] = interp;
    return {
      planet1: best.p1.name,
      planet2: best.p2.name,
      symbol1: best.p1.symbol,
      symbol2: best.p2.symbol,
      aspectName: best.aspect.name,
      aspectGlyph: best.aspect.glyph,
      headline,
      body,
      advice,
      color,
      glow,
      energy: best.aspect.energy,
    };
  }

  // Fallback genérico
  const defaults = ENERGY_DEFAULTS[best.aspect.energy];
  return {
    planet1: best.p1.name,
    planet2: best.p2.name,
    symbol1: best.p1.symbol,
    symbol2: best.p2.symbol,
    aspectName: best.aspect.name,
    aspectGlyph: best.aspect.glyph,
    headline: fallbackHeadline(best.p1.name, best.p2.name, best.aspect.glyph, best.aspect.name),
    body: fallbackBody(best.aspect.energy),
    advice: fallbackAdvice(best.aspect.energy),
    color: defaults.color,
    glow: defaults.glow,
    energy: best.aspect.energy,
  };
}

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function formatDate(date: Date, locale?: string): string {
  return date.toLocaleDateString(localeToDateLocale(locale), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

const ENERGY_LABEL: Record<string, string> = {
  harmonic: 'Aspecto Harmonioso',
  tense:    'Aspecto Desafiador',
  neutral:  'Aspecto de Intensidade',
};

const ENERGY_BADGE_CLASS: Record<string, string> = {
  harmonic: 'text-emerald-400 bg-emerald-900/20 border-emerald-800/30',
  tense:    'text-orange-400 bg-orange-900/20 border-orange-800/30',
  neutral:  'text-gold bg-gold/10 border-gold/20',
};

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  locale?: string;
}

export default function AstroWeather(props: Props) {
  const [aspect, setAspect] = createSignal<Aspect | null>(null);
  const [today, setToday] = createSignal('');

  onMount(() => {
    const now = new Date();
    setToday(formatDate(now, props.locale));
    setAspect(findDominantAspect(now));
  });

  return (
    <div class="max-w-md mx-auto px-4">
      {aspect() && (
        <div
          class="relative rounded-2xl glass border overflow-hidden"
          style={{
            'border-color': `${aspect()!.color}22`,
            'box-shadow': `0 0 32px ${aspect()!.glow}, 0 0 8px ${aspect()!.glow}`,
          }}
        >
          {/* Subtle glow background */}
          <div
            class="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top left, ${aspect()!.glow} 0%, transparent 60%)`,
            }}
          />

          <div class="relative px-5 py-5">
            {/* Header */}
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="text-xl" style={{ color: aspect()!.color }}>
                  {aspect()!.symbol1}
                </span>
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-widest text-cream-dark">
                    Clima Astral de Hoje
                  </p>
                  <p class="text-[11px] text-muted capitalize">{today()}</p>
                </div>
              </div>
              <span
                class={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ENERGY_BADGE_CLASS[aspect()!.energy]}`}
              >
                {ENERGY_LABEL[aspect()!.energy]}
              </span>
            </div>

            {/* Main aspect display */}
            <div class="mb-3">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-2xl" style={{ color: aspect()!.color }}>
                  {aspect()!.symbol1}
                </span>
                <span class="text-lg font-light text-cream-dark">
                  {aspect()!.aspectGlyph}
                </span>
                <span class="text-2xl" style={{ color: aspect()!.color }}>
                  {aspect()!.symbol2}
                </span>
                <span class="text-base font-semibold text-cream-light ml-1">
                  {aspect()!.planet1} {aspect()!.aspectGlyph} {aspect()!.planet2}
                </span>
              </div>
              <p
                class="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: aspect()!.color }}
              >
                {aspect()!.aspectName}
              </p>
            </div>

            {/* Divider */}
            <div class="border-t mb-3" style={{ 'border-color': 'rgba(255,255,255,0.06)' }} />

            {/* Interpretation */}
            <p class="text-[13px] text-cream-dark leading-relaxed mb-2">
              {aspect()!.body}
            </p>

            {/* Advice */}
            <p class="text-[12px] text-muted leading-relaxed italic">
              ✦ {aspect()!.advice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
