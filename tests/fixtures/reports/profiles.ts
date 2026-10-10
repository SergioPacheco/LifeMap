import type { ReportSubject } from '../../../src/reports/core/types';

// Synthetic inputs only. Dates deliberately exercise DST, leap days and birthdays.
const cases = [
  ['1988-02-29', '06:15', -23.55, -46.63, -3, 'America/Sao_Paulo', 'exact'],
  ['1990-03-20', '23:59', 0, 0, 0, 'Etc/UTC', 'exact'],
  ['2000-01-01', '00:00', 51.5, -0.12, 0, 'Europe/London', 'exact'],
  ['1985-11-03', '01:30', 40.71, -74, -5, 'America/New_York', 'approximate'],
  ['1992-03-29', '01:30', 48.86, 2.35, 1, 'Europe/Paris', 'exact'],
  ['1970-10-10', '', -22.9, -43.2, -3, 'America/Sao_Paulo', 'unknown'],
  ['1999-12-31', '23:59', 35.68, 139.69, 9, 'Asia/Tokyo', 'exact'],
  ['2001-06-21', '12:00', 31.23, 121.47, 8, 'Asia/Shanghai', 'exact'],
  ['1980-12-21', '12:00', 69.65, 18.96, 1, 'Europe/Oslo', 'exact'],
  ['1975-06-21', '00:01', -54.8, -68.3, -3, 'America/Argentina/Ushuaia', 'approximate'],
  ['2004-02-29', '', 55.75, 37.62, 3, 'Europe/Moscow', 'unknown'],
  ['1991-04-01', '18:45', 41.01, 28.98, 3, 'Europe/Istanbul', 'exact'],
  ['1982-09-22', '08:30', 52.37, 4.9, 2, 'Europe/Amsterdam', 'exact'],
  ['1998-10-25', '02:30', 52.52, 13.4, 1, 'Europe/Berlin', 'approximate'],
  ['1987-07-15', '15:00', 41.9, 12.5, 2, 'Europe/Rome', 'exact'],
  ['1993-01-05', '', -34.6, -58.4, -3, 'America/Argentina/Buenos_Aires', 'unknown'],
  ['2002-12-01', '07:00', 28.61, 77.21, 5.5, 'Asia/Kolkata', 'exact'],
  ['1989-08-30', '22:00', 27.72, 85.32, 5.75, 'Asia/Kathmandu', 'exact'],
  ['1978-05-12', '13:10', -33.87, 151.21, 10, 'Australia/Sydney', 'exact'],
  ['1995-09-10', '19:30', -36.85, 174.76, 12, 'Pacific/Auckland', 'approximate'],
  ['2015-04-20', '09:15', 19.43, -99.13, -6, 'America/Mexico_City', 'exact'],
  ['1960-02-28', '', 64.15, -21.94, 0, 'Atlantic/Reykjavik', 'unknown'],
  ['2000-03-01', '11:00', 1.35, 103.82, 8, 'Asia/Singapore', 'exact'],
  ['1990-10-10', '10:10', -23.55, -46.63, -3, 'America/Sao_Paulo', 'exact'],
] as const;

export const reportSubjects: ReportSubject[] = cases.map(([date, time, lat, lng, timezone, timeZoneId, timeQuality]) => ({
  birth: { date, time, lat, lng, timezone, timeZoneId, city: 'Synthetic city' },
  timeQuality,
  ...(timeQuality === 'approximate' ? { timeUncertaintyMinutes: 30 } : {}),
}));

export const displayNames = [
  'Perfil Sintético 01', 'Synthetic profile 02', 'Perfil sintético 03',
  'Profil synthétique 04', 'Synthetisches Profil 05', 'Profilo sintetico 06',
  '合成プロフィール 07', '合成档案 08', 'Синтетический профиль 09',
  'Sentetik profil 10', 'Synthetisch profiel 11',
  'Nome sintético muito extenso para verificar quebra de linhas e continuidade de texto no relatório',
];
