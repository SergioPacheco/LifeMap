// ============================================================
// PROFECTION.TS — Profecção Anual (Técnica Helenística)
// Referência: Chris Brennan "Hellenistic Astrology", Vettius Valens
//
// Regras:
// - A cada aniversário, o foco da vida avança 1 casa zodiacal
// - A casa ativada = casa de profecção do ano
// - O planeta que rege o signo na cúspide dessa casa = Senhor do Ano (Time Lord)
// - Trânsitos AO Senhor do Ano ou NA casa de profecção são mais significativos
// - Ciclo de 12 anos: idade mod 12 = casa (0 = Casa 1, 1 = Casa 2, etc)
//
// Profecção Mensal (opcional):
// - A cada mês após o aniversário, avança 1 casa a mais
// - Ex: ano = Casa 5, mês 3 = Casa 5+3 = Casa 8
// ============================================================

import type { NatalChart } from '../types';
import type { CalendarConfig, ProfectionData } from './types';
import { getSignIndex } from '../calculations';
import { getHouseForLongitude } from '../houses';
import {
  calendarDateAtLocalTime,
  calendarDateKey,
  calendarDateKeyForInstant,
  calendarDatePartsForInstant,
  getCalendarTimeContext,
} from './calendar-date';

// ============================================================
// REGENTES TRADICIONAIS (Hellenísticos — usados em profecção)
// ============================================================

const TRADITIONAL_RULERS: Record<number, string> = {
  0: 'mars',       // Áries
  1: 'venus',      // Touro
  2: 'mercury',    // Gêmeos
  3: 'moon',       // Câncer
  4: 'sun',        // Leão
  5: 'mercury',    // Virgem
  6: 'venus',      // Libra
  7: 'mars',       // Escorpião
  8: 'jupiter',    // Sagitário
  9: 'saturn',     // Capricórnio
  10: 'saturn',    // Aquário
  11: 'jupiter',   // Peixes
};

const MODERN_RULERS: Record<number, string> = {
  0: 'mars', 1: 'venus', 2: 'mercury', 3: 'moon',
  4: 'sun', 5: 'mercury', 6: 'venus', 7: 'pluto',
  8: 'jupiter', 9: 'saturn', 10: 'uranus', 11: 'neptune',
};

// ============================================================
// MAIN: Calculate profection for a date
// ============================================================

export function getProfectionForDate(
  natal: NatalChart,
  currentDate: Date,
  cfg: CalendarConfig
): ProfectionData | null {
  if (!natal.date) return null;
  const ctx = getCalendarTimeContext(natal);
  const birthDate = calendarDatePartsForInstant(natal.date, ctx);
  const current = calendarDatePartsForInstant(currentDate, ctx);

  // Calculate age
  const age = getAge(birthDate, current);

  // Annual profection house (0-indexed: 0 = Casa 1)
  const profectedHouseIndex = age % 12;
  const profectedHouse = profectedHouseIndex + 1; // 1-12

  // Sign on the cusp of the profected house (Whole Sign = ASC sign + houses)
  // In Whole Sign (used in profections): each house = one sign starting from ASC sign
  const ascSign = getSignIndex(natal.houses.ascendant);
  const profectedSign = (ascSign + profectedHouseIndex) % 12;

  // Lord of the Year
  const rulers = cfg.profection.rulers === 'traditional' ? TRADITIONAL_RULERS : MODERN_RULERS;
  const lord = rulers[profectedSign];

  // Lord's natal position
  const lordNatalPos = natal.positions[lord];
  const lordNatalSign = lordNatalPos ? getSignIndex(lordNatalPos.longitude) : 0;
  const lordNatalHouse = lordNatalPos ? getHouseNumber(lordNatalPos.longitude, natal) : 1;

  // Birthday range
  const thisYearBirthdayKey = calendarDateKey(current.year, birthDate.month - 1, birthDate.day);
  const currentKey = calendarDateKeyForInstant(currentDate, ctx);
  const hasHadBirthday = thisYearBirthdayKey <= currentKey;
  const startYear = hasHadBirthday ? current.year : current.year - 1;
  const endYear = startYear + 1;
  const startDate = calendarDateAtLocalTime(startYear, birthDate.month - 1, birthDate.day, 12, 0, ctx);
  const endDate = calendarDateAtLocalTime(endYear, birthDate.month - 1, birthDate.day, 12, 0, ctx);

  // Monthly profection (optional)
  let monthlyHouse: number | undefined;
  if (cfg.profection.level === 'monthly' || cfg.profection.level === 'both') {
    const monthsSinceBirthday = getMonthsSince(startDate, currentDate, ctx);
    const monthlyHouseIndex = (profectedHouseIndex + monthsSinceBirthday) % 12;
    monthlyHouse = monthlyHouseIndex + 1;
  }

  return {
    house: profectedHouse,
    sign: profectedSign,
    lord,
    lordNatalHouse,
    lordNatalSign,
    age,
    startDate,
    endDate,
    monthlyHouse,
  };
}

// ============================================================
// PROFECTION THEMES — What the year's focus is about
// ============================================================

export const PROFECTION_HOUSE_THEMES: Record<number, { theme: string; focus: string; keywords: string[] }> = {
  1: { theme: 'Identidade', focus: 'Quem você é e como se apresenta ao mundo', keywords: ['corpo', 'aparência', 'novas direções', 'self'] },
  2: { theme: 'Recursos', focus: 'Dinheiro, valores e autoestima', keywords: ['finanças', 'talentos', 'posses', 'segurança'] },
  3: { theme: 'Comunicação', focus: 'Aprendizado, irmãos e conexões locais', keywords: ['escrita', 'viagens curtas', 'vizinhos', 'ensino'] },
  4: { theme: 'Raízes', focus: 'Lar, família e fundações emocionais', keywords: ['casa', 'pais', 'ancestralidade', 'privacidade'] },
  5: { theme: 'Criação', focus: 'Romance, filhos, arte e prazer', keywords: ['amor', 'criatividade', 'diversão', 'autoexpressão'] },
  6: { theme: 'Serviço', focus: 'Trabalho diário, saúde e rotinas', keywords: ['emprego', 'corpo', 'hábitos', 'animais'] },
  7: { theme: 'Parcerias', focus: 'Relacionamentos, casamento e contratos', keywords: ['casamento', 'sócios', 'inimigos declarados', 'outro'] },
  8: { theme: 'Transformação', focus: 'Crises, sexualidade, recursos compartilhados', keywords: ['morte/renascimento', 'herança', 'investimentos', 'poder'] },
  9: { theme: 'Expansão', focus: 'Viagens longas, filosofia e ensino superior', keywords: ['estrangeiro', 'lei', 'fé', 'publicações'] },
  10: { theme: 'Vocação', focus: 'Carreira, reputação e realizações públicas', keywords: ['profissão', 'autoridade', 'reconhecimento', 'legado'] },
  11: { theme: 'Comunidade', focus: 'Amigos, grupos e esperanças para o futuro', keywords: ['networking', 'causas sociais', 'benefícios', 'aliados'] },
  12: { theme: 'Interiorização', focus: 'Espiritualidade, isolamento e autossabotagem', keywords: ['retiro', 'inconsciente', 'hospitais', 'sacrifício'] },
};

// ============================================================
// HELPERS
// ============================================================

function getAge(birthDate: { year: number; month: number; day: number }, currentDate: { year: number; month: number; day: number }): number {
  let age = currentDate.year - birthDate.year;
  const monthDiff = currentDate.month - birthDate.month;
  if (monthDiff < 0 || (monthDiff === 0 && currentDate.day < birthDate.day)) {
    age--;
  }
  return age;
}

function getMonthsSince(startDate: Date, currentDate: Date, ctx: { timeZoneId?: string; timezone: number }): number {
  const start = calendarDatePartsForInstant(startDate, ctx);
  const current = calendarDatePartsForInstant(currentDate, ctx);
  const months = (current.year - start.year) * 12 + current.month - start.month;
  return Math.max(0, months);
}

function getHouseNumber(longitude: number, natal: NatalChart): number {
  return getHouseForLongitude(longitude, natal.houses.cusps);
}
