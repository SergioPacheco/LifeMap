// ============================================================
// CALENDAR ENGINE — Index
// ============================================================

export { calculateMonth } from './month-calculator';
export { classifyDayEnergy } from './day-classifier';
export { mapEventThemes, THEME_INFO } from './theme-mapper';
export { getMoonPhaseForDate, getMoonIngresses, getMoonPhaseName } from './moon-phases';
export { getVoidOfCoursePeriods } from './void-moon';
export { getRetrogradeEvents } from './retrogrades';
export { getProfectionForDate, PROFECTION_HOUSE_THEMES } from './profection';
export { findBestDates, ELECTIVE_RULES } from './elective';
export { getTransitText, getTransitTextWithFallback, CALENDAR_TRANSIT_TEXTS } from './calendar-texts';
export { getEclipseEvents } from './eclipses';
export { getPlanetaryReturns, getPlanetaryReturnEvents } from './planetary-returns';
export { DEFAULT_CALENDAR_CONFIG } from './types';
export type {
  CalendarConfig,
  CalendarEvent,
  DayData,
  MonthData,
  DayEnergy,
  EventType,
  Theme,
  RetroPeriod,
  ProfectionData,
  MonthSummary,
} from './types';
export type { ElectiveAction, ElectiveResult, ElectiveRules } from './elective';
export type { PlanetaryReturnInfo } from './planetary-returns';
