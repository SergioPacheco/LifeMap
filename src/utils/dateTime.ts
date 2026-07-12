export function localeToDateLocale(locale?: string): string {
  if (!locale) return 'pt-BR';
  const map: Record<string, string> = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    nl: 'nl-NL',
    ja: 'ja-JP',
    zh: 'zh-CN',
    ru: 'ru-RU',
    tr: 'tr-TR',
  };
  return map[locale] || locale;
}

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function dateInputFromLocalDate(date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function dateInputFromDateInTimeZone(date: Date, timeZoneId?: string): string {
  if (!timeZoneId || !isValidTimeZone(timeZoneId)) return dateInputFromLocalDate(date);
  const parts = getDatePartsInTimeZone(date, timeZoneId);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function todayDateInput(timeZoneId?: string): string {
  return dateInputFromDateInTimeZone(new Date(), timeZoneId);
}

export function addDaysToDateInput(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function addMonthsToDateInput(dateStr: string, months: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, day, 12, 0, 0));
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function dateInputToNoonDate(dateStr: string, timeZoneId?: string, fallbackOffset = 0): Date {
  return zonedDateTimeToUtc(dateStr, '12:00', timeZoneId, fallbackOffset);
}

export function isValidTimeZone(timeZoneId?: string): boolean {
  if (!timeZoneId) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timeZoneId }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getEffectiveTimezoneOffset(
  dateStr: string,
  timeStr: string,
  fallbackOffset: number,
  timeZoneId?: string
): number {
  if (!isValidTimeZone(timeZoneId)) return fallbackOffset;
  const utcDate = zonedDateTimeToUtc(dateStr, timeStr, timeZoneId, fallbackOffset);
  return getOffsetHoursForInstant(utcDate, timeZoneId!);
}

export function zonedDateTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZoneId?: string,
  fallbackOffset = 0
): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const wallClockMs = Date.UTC(year, month - 1, day, hour, minute || 0, 0);

  if (!isValidTimeZone(timeZoneId)) {
    return new Date(wallClockMs - fallbackOffset * 3600000);
  }

  let offsetMs = getOffsetMsForInstant(new Date(wallClockMs), timeZoneId!);
  let utcMs = wallClockMs - offsetMs;
  const correctedOffsetMs = getOffsetMsForInstant(new Date(utcMs), timeZoneId!);
  if (correctedOffsetMs !== offsetMs) {
    offsetMs = correctedOffsetMs;
    utcMs = wallClockMs - offsetMs;
  }

  return new Date(utcMs);
}

export function getOffsetHoursForInstant(date: Date, timeZoneId: string): number {
  return getOffsetMsForInstant(date, timeZoneId) / 3600000;
}

export function formatUtcOffset(offset: number): string {
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const hours = Math.floor(abs);
  const minutes = Math.round((abs - hours) * 60);
  return `UTC${sign}${hours}${minutes ? `:${pad2(minutes)}` : ''}`;
}

interface TimeZoneLookupInput {
  lat: number;
  lng: number;
  country?: string;
  countryCode?: string;
  state?: string;
}

export function inferTimeZoneId(input: TimeZoneLookupInput): string | undefined {
  const countryCode = input.countryCode?.toLowerCase();
  const state = normalizeName(input.state || '');
  const lng = input.lng;

  if (countryCode === 'br' || normalizeName(input.country || '') === 'brasil' || normalizeName(input.country || '') === 'brazil') {
    return inferBrazilTimeZone(state, lng);
  }

  if (countryCode === 'ar') return 'America/Argentina/Buenos_Aires';
  if (countryCode === 'cl') return 'America/Santiago';
  if (countryCode === 'uy') return 'America/Montevideo';
  if (countryCode === 'py') return 'America/Asuncion';
  if (countryCode === 'bo') return 'America/La_Paz';
  if (countryCode === 'pe') return 'America/Lima';
  if (countryCode === 'co') return 'America/Bogota';
  if (countryCode === 've') return 'America/Caracas';
  if (countryCode === 'mx') return inferMexicoTimeZone(state, lng);
  if (countryCode === 'us') return inferUnitedStatesTimeZone(state, lng);
  if (countryCode === 'ca') return inferCanadaTimeZone(state, lng);
  if (countryCode === 'pt') return input.lng < -15 ? 'Atlantic/Azores' : 'Europe/Lisbon';
  if (countryCode === 'gb') return 'Europe/London';
  if (countryCode === 'fr') return 'Europe/Paris';
  if (countryCode === 'de') return 'Europe/Berlin';
  if (countryCode === 'it') return 'Europe/Rome';
  if (countryCode === 'es') return input.lng < -12 ? 'Atlantic/Canary' : 'Europe/Madrid';
  if (countryCode === 'nl') return 'Europe/Amsterdam';
  if (countryCode === 'tr') return 'Europe/Istanbul';
  if (countryCode === 'ru') return inferRussiaTimeZone(lng);
  if (countryCode === 'cn') return 'Asia/Shanghai';
  if (countryCode === 'jp') return 'Asia/Tokyo';
  if (countryCode === 'in') return 'Asia/Kolkata';
  if (countryCode === 'au') return inferAustraliaTimeZone(state, lng);

  return undefined;
}

export function estimateOffsetFromLongitude(longitude: number): number {
  return Math.round(longitude / 15);
}

function getDatePartsInTimeZone(date: Date, timeZoneId: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return {
    year: Number(part(parts, 'year')),
    month: Number(part(parts, 'month')),
    day: Number(part(parts, 'day')),
  };
}

function getOffsetMsForInstant(date: Date, timeZoneId: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZoneId,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const asUtc = Date.UTC(
    Number(part(parts, 'year')),
    Number(part(parts, 'month')) - 1,
    Number(part(parts, 'day')),
    Number(part(parts, 'hour')),
    Number(part(parts, 'minute')),
    Number(part(parts, 'second'))
  );

  return asUtc - date.getTime();
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((p) => p.type === type)?.value || '0';
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function inferBrazilTimeZone(state: string, lng: number): string {
  if (state.includes('acre')) return 'America/Rio_Branco';
  if (state.includes('amazonas') || state.includes('rondonia') || state.includes('roraima')) return 'America/Manaus';
  if (state.includes('mato grosso') || state.includes('mato grosso do sul')) return 'America/Cuiaba';
  if (state.includes('bahia')) return 'America/Bahia';
  if (state.includes('pernambuco')) return 'America/Recife';
  if (state.includes('ceara') || state.includes('maranhao') || state.includes('piaui')) return 'America/Fortaleza';
  if (state.includes('paraiba') || state.includes('rio grande do norte') || state.includes('alagoas') || state.includes('sergipe')) return 'America/Maceio';
  if (state.includes('para') && lng < -54) return 'America/Santarem';
  if (state.includes('para')) return 'America/Belem';
  return 'America/Sao_Paulo';
}

function inferMexicoTimeZone(state: string, lng: number): string {
  if (state.includes('quintana roo')) return 'America/Cancun';
  if (state.includes('sonora')) return 'America/Hermosillo';
  if (state.includes('baja california')) return 'America/Tijuana';
  if (lng < -106) return 'America/Mazatlan';
  return 'America/Mexico_City';
}

function inferUnitedStatesTimeZone(state: string, lng: number): string {
  if (state.includes('hawaii')) return 'Pacific/Honolulu';
  if (state.includes('alaska')) return 'America/Anchorage';
  if (state.includes('arizona')) return 'America/Phoenix';
  if (lng < -114) return 'America/Los_Angeles';
  if (lng < -101) return 'America/Denver';
  if (lng < -86) return 'America/Chicago';
  return 'America/New_York';
}

function inferCanadaTimeZone(state: string, lng: number): string {
  if (state.includes('newfoundland')) return 'America/St_Johns';
  if (lng < -120) return 'America/Vancouver';
  if (lng < -102) return 'America/Edmonton';
  if (lng < -88) return 'America/Winnipeg';
  if (lng < -70) return 'America/Toronto';
  return 'America/Halifax';
}

function inferRussiaTimeZone(lng: number): string {
  if (lng < 45) return 'Europe/Moscow';
  if (lng < 75) return 'Asia/Yekaterinburg';
  if (lng < 95) return 'Asia/Omsk';
  if (lng < 115) return 'Asia/Irkutsk';
  if (lng < 140) return 'Asia/Yakutsk';
  return 'Asia/Vladivostok';
}

function inferAustraliaTimeZone(state: string, lng: number): string {
  if (state.includes('western')) return 'Australia/Perth';
  if (state.includes('south australia')) return 'Australia/Adelaide';
  if (state.includes('northern territory')) return 'Australia/Darwin';
  if (state.includes('queensland')) return 'Australia/Brisbane';
  if (state.includes('tasmania')) return 'Australia/Hobart';
  if (lng < 130) return 'Australia/Perth';
  if (lng < 142) return 'Australia/Adelaide';
  return 'Australia/Sydney';
}
