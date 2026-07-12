// ============================================================
// DAY-CLASSIFIER.TS — Classifica energia do dia (favorável/neutro/tenso)
// Baseado em: Robert Hand "Planets in Transit" + pesquisa de correlações
// ============================================================

import type { CalendarConfig, CalendarEvent, DayEnergy } from './types';

export interface DayClassification {
  energy: DayEnergy;
  score: number;          // -10 a +10
  tip: string;            // Dica do dia
  reasons: string[];      // Motivos da classificação
}

// Conjunções podem ser positivas ou negativas dependendo dos planetas
const CONJUNCTION_NATURE: Record<string, 'positive' | 'negative' | 'neutral'> = {
  // Trânsito + Natal → natureza da conjunção
  'jupiter': 'positive', 'venus': 'positive', 'sun': 'neutral',
  'moon': 'neutral', 'mercury': 'neutral',
  'saturn': 'negative', 'mars': 'negative',
  'uranus': 'neutral', 'neptune': 'neutral', 'pluto': 'negative',
};

export function classifyDayEnergy(events: CalendarEvent[], cfg: CalendarConfig): DayClassification {
  let score = 0;
  let totalWeight = 0;
  const reasons: string[] = [];

  for (const event of events) {
    if (event.type !== 'transit-aspect') continue;

    const aspectWeight = cfg.dayClassification.aspectWeights[event.aspectType || ''] || 0;
    const transitWeight = cfg.dayClassification.planetWeights[event.transitPlanet || ''] || 1;
    const natalWeight = cfg.dayClassification.planetWeights[event.natalPlanet || ''] || 1;

    let eventScore = aspectWeight;

    // Conjunção: natureza depende do planeta transitante
    if (event.aspectType === 'conjunction') {
      const nature = CONJUNCTION_NATURE[event.transitPlanet || ''] || 'neutral';
      if (nature === 'positive') eventScore = 2;
      else if (nature === 'negative') eventScore = -1.5;
      else eventScore = 0.5;
    }

    // Weight by planet importance (average of transit + natal)
    const planetFactor = (transitWeight + natalWeight) / 4;
    eventScore *= planetFactor;

    // Decay by orb (tighter = stronger)
    if (cfg.dayClassification.orbDecay && event.orb !== undefined) {
      const maxOrb = cfg.aspects.orbs[event.aspectType || 'conjunction'] || 2;
      const orbFactor = 1 - (event.orb / maxOrb) * 0.5;
      eventScore *= orbFactor;
    }

    // Applying bonus
    if (cfg.aspects.applicationBonus && event.isApplying) {
      eventScore *= 1.3;
    }

    score += eventScore;
    totalWeight += Math.abs(eventScore);

    if (Math.abs(eventScore) > 2) {
      reasons.push(`${event.title} (${eventScore > 0 ? '+' : ''}${eventScore.toFixed(1)})`);
    }
  }

  // NORMALIZE: weighted average instead of raw sum
  // This prevents days with many weak aspects from outscoring days with 1 strong aspect
  const significantEvents = events.filter(e => e.type === 'transit-aspect').length;
  if (significantEvents > 3) {
    score = score / Math.sqrt(significantEvents / 3); // Diminishing returns after 3 events
  }

  // Penalties
  const hasVoC = events.some(e => e.type === 'void-of-course');
  if (hasVoC) {
    score += cfg.dayClassification.voidMoonPenalty;
    reasons.push('Lua Vazia de Curso');
  }

  const hasRetroStation = events.some(e => e.type === 'retrograde-start');
  if (hasRetroStation) {
    score += cfg.dayClassification.retroPenalty;
    reasons.push('Estação retrógrada');
  }

  // Classificar
  let energy: DayEnergy;
  if (events.some(e => e.type === 'eclipse-solar' || e.type === 'eclipse-lunar' || e.type === 'planetary-return')) {
    energy = 'special';
  } else if (score >= cfg.dayClassification.favorableThreshold) {
    energy = 'favorable';
  } else if (score <= cfg.dayClassification.tenseThreshold) {
    energy = 'tense';
  } else {
    energy = 'neutral';
  }

  // Gerar dica do dia
  const tip = generateDayTip(energy, events, reasons);

  return {
    energy,
    score: Math.max(-10, Math.min(10, score)),
    tip,
    reasons,
  };
}

function generateDayTip(energy: DayEnergy, events: CalendarEvent[], reasons: string[]): string {
  const topEvent = events.filter(e => e.type === 'transit-aspect').sort((a, b) => b.importance - a.importance)[0];

  if (!topEvent) {
    return energy === 'favorable'
      ? 'Dia tranquilo e harmonioso. Aproveite para atividades pessoais.'
      : 'Dia sem aspectos marcantes. Siga sua rotina.';
  }

  const tips: Record<DayEnergy, string[]> = {
    favorable: [
      'Energia positiva fluindo. Bom dia para iniciar projetos.',
      'Aproveite a harmonia para avançar em objetivos.',
      'Dia favorável para decisões e ações importantes.',
    ],
    neutral: [
      'Dia equilibrado. Observe as sutilezas.',
      'Energia mista — use o discernimento.',
      'Bom dia para avaliação e planejamento.',
    ],
    tense: [
      'Tensões ativas — evite decisões impulsivas.',
      'Canalize a energia em exercício ou trabalho focado.',
      'Desafios trazem crescimento. Respire antes de reagir.',
    ],
    special: [
      'Dia significativo — preste atenção aos sinais.',
      'Momento de virada. Esteja presente.',
      'Energia intensa e transformadora.',
    ],
  };

  const tipList = tips[energy];
  return tipList[Math.floor(Math.random() * tipList.length)];
}
