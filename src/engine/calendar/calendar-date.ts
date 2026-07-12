import type { NatalChart } from '../types';
import { isValidTimeZone, pad2, zonedDateTimeToUtc } from '../../utils/dateTime';

export interface CalendarTimeContext {
  timeZoneId?: string;
  timezone: number;
}

export interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
}

export function getCalendarTimeContext(natal: NatalChart): CalendarTimeContext {
  return {
    timeZoneId: natal.meta.timeZoneId,
    timezone: natal.meta.timezone,
  };
}

export function daysInCalendarMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0, 12)).getUTCDate();
}

export function calendarDateKey(year: number, month: number, day: number): string {
  const normalized = new Date(Date.UTC(year, month, day, 12));
  return `${normalized.getUTCFullYear()}-${pad2(normalized.getUTCMonth() + 1)}-${pad2(normalized.getUTCDate())}`;
}

export function calendarDateAtLocalTime(
  year: number,
  month: number,
  day: number,
  hour = 12,
  minute = 0,
  ctx: CalendarTimeContext
): Date {
  return zonedDateTimeToUtc(calendarDateKey(year, month, day), `${pad2(hour)}:${pad2(minute)}`, ctx.timeZoneId, ctx.timezone);
}

export function calendarDayOfWeek(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month, day, 12)).getUTCDay();
}

export function calendarDateKeyForInstant(date: Date, ctx: CalendarTimeContext): string {
  const parts = calendarDatePartsForInstant(date, ctx);
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

export function calendarDatePartsForInstant(date: Date, ctx: CalendarTimeContext): CalendarDateParts {
  if (isValidTimeZone(ctx.timeZoneId)) {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: ctx.timeZoneId,
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

  const shifted = new Date(date.getTime() + ctx.timezone * 3600000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function formatCalendarTime(date: Date, ctx: CalendarTimeContext, locale = 'pt-BR'): string {
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  if (isValidTimeZone(ctx.timeZoneId)) {
    return date.toLocaleTimeString(locale, { ...options, timeZone: ctx.timeZoneId });
  }

  const shifted = new Date(date.getTime() + ctx.timezone * 3600000);
  return shifted.toLocaleTimeString(locale, { ...options, timeZone: 'UTC' });
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((p) => p.type === type)?.value || '0';
}
