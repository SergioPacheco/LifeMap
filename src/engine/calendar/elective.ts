// ============================================================
// ELECTIVE.TS — Astrologia Eletiva (Busca de Melhores Datas)
// Referência: Joann Hampar "Electional Astrology", Dorotheus, Scribd Rules
//
// Regras fundamentais:
// 1. Lua forte: crescente, não vazia de curso, sem aspectos duros
// 2. Lua aplicando a benéficos (Vênus/Júpiter)
// 3. Sem Mercúrio retrógrado (para contratos/comunicação)
// 4. Planeta regente da ação forte e bem aspectado
// 5. Sem eclipses recentes (14 dias)
// 6. Evitar estações retrógradas (dia exato)
// ============================================================

import type { NatalChart } from '../types';
import type { CalendarConfig } from './types';
import { calculatePositions } from '../calculations';
import { getSignIndex, norm } from '../calculations';

// ============================================================
// TIPOS
// ============================================================

export type ElectiveAction =
  | 'wedding'         // Casamento
  | 'business'        // Abrir empresa / lançamento
  | 'contract'        // Assinar contrato
  | 'travel'          // Viagem
  | 'surgery'         // Cirurgia
  | 'move'            // Mudança de casa
  | 'job-interview'   // Entrevista de emprego
  | 'first-date'      // Primeiro encontro
  | 'investment'      // Investimento financeiro
  | 'study'           // Iniciar estudo/curso
  | 'creative'        // Projeto criativo
  | 'spiritual';      // Retiro/prática espiritual

export interface ElectiveResult {
  date: Date;
  score: number;           // 0-100 (quanto maior, melhor)
  grade: 'excellent' | 'good' | 'acceptable' | 'poor';
  reasons: string[];       // Motivos positivos
  warnings: string[];      // Alertas/cuidados
  moonPhase: string;
  moonSign: number;
  isVoidOfCourse: boolean;
  hasRetroMercury: boolean;
}

export interface ElectiveRules {
  action: ElectiveAction;
  label: string;
  significator: string;       // Planeta regente da ação
  favorableSigns: number[];   // Signos bons para a Lua
  avoidSigns: number[];       // Signos ruins para a Lua
  requireWaxingMoon: boolean; // Obrigatório Lua crescente?
  avoidRetroMercury: boolean; // Evitar Mercúrio ℞?
  avoidRetroVenus: boolean;   // Evitar Vênus ℞?
  beneficAspects: string[];   // Planetas que devem estar bem aspectados
  maleficAvoid: string[];     // Planetas cujos aspectos duros evitar
}

// ============================================================
// REGRAS POR AÇÃO (baseado na tradição eletiva)
// ============================================================

const ELECTIVE_RULES: Record<ElectiveAction, ElectiveRules> = {
  wedding: {
    action: 'wedding',
    label: 'Casamento',
    significator: 'venus',
    favorableSigns: [1, 3, 4, 6], // Touro, Câncer, Leão, Libra
    avoidSigns: [0, 7, 9],        // Áries, Escorpião, Capricórnio
    requireWaxingMoon: true,
    avoidRetroMercury: true,
    avoidRetroVenus: true,
    beneficAspects: ['venus', 'jupiter'],
    maleficAvoid: ['saturn', 'mars', 'pluto'],
  },
  business: {
    action: 'business',
    label: 'Abrir Empresa',
    significator: 'jupiter',
    favorableSigns: [1, 4, 8, 9], // Touro, Leão, Sagitário, Capricórnio
    avoidSigns: [11],             // Peixes
    requireWaxingMoon: true,
    avoidRetroMercury: true,
    avoidRetroVenus: false,
    beneficAspects: ['jupiter', 'sun'],
    maleficAvoid: ['saturn', 'neptune'],
  },
  contract: {
    action: 'contract',
    label: 'Assinar Contrato',
    significator: 'mercury',
    favorableSigns: [2, 5, 6, 10], // Gêmeos, Virgem, Libra, Aquário
    avoidSigns: [8, 11],           // Sagitário, Peixes
    requireWaxingMoon: true,
    avoidRetroMercury: true,
    avoidRetroVenus: false,
    beneficAspects: ['mercury', 'jupiter'],
    maleficAvoid: ['neptune', 'pluto'],
  },
  travel: {
    action: 'travel',
    label: 'Viagem',
    significator: 'jupiter',
    favorableSigns: [2, 8, 10],   // Gêmeos, Sagitário, Aquário
    avoidSigns: [3, 9],           // Câncer, Capricórnio
    requireWaxingMoon: false,
    avoidRetroMercury: true,
    avoidRetroVenus: false,
    beneficAspects: ['jupiter', 'mercury'],
    maleficAvoid: ['saturn', 'mars'],
  },
  surgery: {
    action: 'surgery',
    label: 'Cirurgia',
    significator: 'mars',
    favorableSigns: [1, 5, 9],    // Touro (fixo), Virgem, Capricórnio
    avoidSigns: [0, 7],           // Áries, Escorpião (regidos por Marte)
    requireWaxingMoon: false,     // Minguante preferido (reduzir)
    avoidRetroMercury: true,
    avoidRetroVenus: false,
    beneficAspects: ['saturn'],   // Saturno = precisão
    maleficAvoid: ['mars'],       // Marte forte = sangramento
  },
  move: {
    action: 'move',
    label: 'Mudança de Casa',
    significator: 'moon',
    favorableSigns: [1, 3, 4],    // Touro, Câncer, Leão
    avoidSigns: [0, 7],           // Áries, Escorpião
    requireWaxingMoon: true,
    avoidRetroMercury: true,
    avoidRetroVenus: false,
    beneficAspects: ['venus', 'jupiter'],
    maleficAvoid: ['saturn', 'uranus'],
  },
  'job-interview': {
    action: 'job-interview',
    label: 'Entrevista de Emprego',
    significator: 'saturn',
    favorableSigns: [1, 4, 5, 9], // Touro, Leão, Virgem, Capricórnio
    avoidSigns: [11],             // Peixes
    requireWaxingMoon: true,
    avoidRetroMercury: true,
    avoidRetroVenus: false,
    beneficAspects: ['saturn', 'sun', 'jupiter'],
    maleficAvoid: ['neptune'],
  },
  'first-date': {
    action: 'first-date',
    label: 'Primeiro Encontro',
    significator: 'venus',
    favorableSigns: [1, 3, 4, 6, 11], // Touro, Câncer, Leão, Libra, Peixes
    avoidSigns: [5, 9],               // Virgem, Capricórnio
    requireWaxingMoon: true,
    avoidRetroMercury: false,
    avoidRetroVenus: true,
    beneficAspects: ['venus', 'moon'],
    maleficAvoid: ['saturn', 'pluto'],
  },
  investment: {
    action: 'investment',
    label: 'Investimento',
    significator: 'jupiter',
    favorableSigns: [1, 4, 8, 9], // Touro, Leão, Sagitário, Capricórnio
    avoidSigns: [2, 11],          // Gêmeos (mutável), Peixes
    requireWaxingMoon: true,
    avoidRetroMercury: true,
    avoidRetroVenus: false,
    beneficAspects: ['jupiter', 'venus'],
    maleficAvoid: ['neptune', 'uranus'],
  },
  study: {
    action: 'study',
    label: 'Iniciar Estudos',
    significator: 'mercury',
    favorableSigns: [2, 5, 8, 10], // Gêmeos, Virgem, Sagitário, Aquário
    avoidSigns: [],
    requireWaxingMoon: true,
    avoidRetroMercury: true,
    avoidRetroVenus: false,
    beneficAspects: ['mercury', 'jupiter'],
    maleficAvoid: ['neptune'],
  },
  creative: {
    action: 'creative',
    label: 'Projeto Criativo',
    significator: 'venus',
    favorableSigns: [1, 3, 4, 6, 11], // Touro, Câncer, Leão, Libra, Peixes
    avoidSigns: [5, 9],               // Virgem, Capricórnio
    requireWaxingMoon: true,
    avoidRetroMercury: false,
    avoidRetroVenus: false,
    beneficAspects: ['venus', 'neptune'],
    maleficAvoid: ['saturn'],
  },
  spiritual: {
    action: 'spiritual',
    label: 'Retiro Espiritual',
    significator: 'neptune',
    favorableSigns: [3, 7, 8, 11], // Câncer, Escorpião, Sagitário, Peixes
    avoidSigns: [2, 5],            // Gêmeos, Virgem
    requireWaxingMoon: false,
    avoidRetroMercury: false,
    avoidRetroVenus: false,
    beneficAspects: ['neptune', 'jupiter'],
    maleficAvoid: ['mars'],
  },
};

// ============================================================
// MAIN: Find best dates for an action
// ============================================================

export function findBestDates(
  action: ElectiveAction,
  natal: NatalChart | null,
  startDate: Date,
  rangeDays: number = 30
): ElectiveResult[] {
  const rules = ELECTIVE_RULES[action];
  if (!rules) return [];

  const results: ElectiveResult[] = [];

  for (let d = 0; d < rangeDays; d++) {
    const date = new Date(startDate.getTime() + d * 86400000);
    date.setHours(10, 0, 0, 0); // Default: 10h da manhã

    const result = evaluateDate(date, rules);
    results.push(result);
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

// ============================================================
// Evaluate a single date against elective rules
// ============================================================

function evaluateDate(date: Date, rules: ElectiveRules): ElectiveResult {
  const positions = calculatePositions(date);
  let score = 50; // Start at middle
  const reasons: string[] = [];
  const warnings: string[] = [];

  const moonPos = positions.moon;
  const moonLon = moonPos?.longitude || 0;
  const moonSign = getSignIndex(moonLon);
  const sunLon = positions.sun?.longitude || 0;

  // 1. Moon phase (waxing vs waning)
  const elongation = norm(moonLon - sunLon);
  const isWaxing = elongation > 0 && elongation < 180;

  if (rules.requireWaxingMoon) {
    if (isWaxing) {
      score += 10;
      reasons.push('Lua crescente ✓');
    } else {
      score -= 15;
      warnings.push('Lua minguante — prefira Lua crescente');
    }
  }

  // 2. Moon sign
  if (rules.favorableSigns.includes(moonSign)) {
    score += 10;
    reasons.push(`Lua em signo favorável ✓`);
  } else if (rules.avoidSigns.includes(moonSign)) {
    score -= 10;
    warnings.push(`Lua em signo desfavorável`);
  }

  // 3. Mercury retrograde
  const mercuryRetro = positions.mercury?.isRetrograde || false;
  if (rules.avoidRetroMercury && mercuryRetro) {
    score -= 20;
    warnings.push('Mercúrio retrógrado ⚠️');
  } else if (rules.avoidRetroMercury && !mercuryRetro) {
    score += 5;
    reasons.push('Mercúrio direto ✓');
  }

  // 4. Venus retrograde
  const venusRetro = positions.venus?.isRetrograde || false;
  if (rules.avoidRetroVenus && venusRetro) {
    score -= 15;
    warnings.push('Vênus retrógrado ⚠️');
  }

  // 5. Significator condition
  const sigPos = positions[rules.significator];
  if (sigPos && !sigPos.isRetrograde) {
    score += 5;
    reasons.push(`${rules.significator} direto ✓`);
  } else if (sigPos?.isRetrograde) {
    score -= 10;
    warnings.push(`Significador (${rules.significator}) retrógrado`);
  }

  // 6. Moon aspects to benefics (Venus, Jupiter)
  for (const benefic of rules.beneficAspects) {
    const bPos = positions[benefic];
    if (!bPos) continue;
    const diff = angularDiff(moonLon, bPos.longitude);
    // Trine or sextile to benefic
    if (Math.abs(diff - 120) < 5 || Math.abs(diff - 60) < 5) {
      score += 8;
      reasons.push(`Lua em aspecto harmonioso com ${benefic} ✓`);
    }
    // Conjunction to benefic
    if (diff < 5) {
      score += 10;
      reasons.push(`Lua conjunta ${benefic} ✓`);
    }
  }

  // 7. Moon aspects to malefics
  for (const malefic of rules.maleficAvoid) {
    const mPos = positions[malefic];
    if (!mPos) continue;
    const diff = angularDiff(moonLon, mPos.longitude);
    // Square or opposition to malefic
    if (Math.abs(diff - 90) < 4 || Math.abs(diff - 180) < 4) {
      score -= 12;
      warnings.push(`Lua em aspecto tenso com ${malefic}`);
    }
  }

  // 8. Void of Course check (simplified — Moon in last 5° of sign)
  const degInSign = moonLon % 30;
  const isVoC = degInSign > 27; // Simplified: last 3° = likely VoC
  if (isVoC) {
    score -= 15;
    warnings.push('Possível Lua Vazia de Curso');
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Grade
  let grade: ElectiveResult['grade'];
  if (score >= 75) grade = 'excellent';
  else if (score >= 60) grade = 'good';
  else if (score >= 40) grade = 'acceptable';
  else grade = 'poor';

  // Moon phase name
  let moonPhase: string;
  if (elongation < 45) moonPhase = 'Nova';
  else if (elongation < 90) moonPhase = 'Crescente';
  else if (elongation < 135) moonPhase = 'Quarto Crescente';
  else if (elongation < 180) moonPhase = 'Gibosa';
  else if (elongation < 225) moonPhase = 'Cheia';
  else if (elongation < 270) moonPhase = 'Disseminadora';
  else if (elongation < 315) moonPhase = 'Quarto Minguante';
  else moonPhase = 'Balsâmica';

  return {
    date,
    score,
    grade,
    reasons,
    warnings,
    moonPhase,
    moonSign,
    isVoidOfCourse: isVoC,
    hasRetroMercury: mercuryRetro,
  };
}

// ============================================================
// HELPERS
// ============================================================

function angularDiff(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// ============================================================
// EXPORTS
// ============================================================

export { ELECTIVE_RULES };
export type { ElectiveRules };
