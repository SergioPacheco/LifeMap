// ============================================================
// IDS.TS — Deterministic fact/evidence identifier scheme
//
// Links between ForecastEvents and AstroFacts resolve through these
// IDs. Both the factual pipeline and the dataset share this module so
// references stay stable without layering cycles.
// ============================================================

export function natalPositionFactId(subjectIndex: number, point: string): string {
  return `s${subjectIndex}-position-${point}`;
}

export function natalAngleFactId(subjectIndex: number, angle: string): string {
  return `s${subjectIndex}-angle-${angle}`;
}

export function profectionFactId(subjectIndex: number, year: number): string {
  return `s${subjectIndex}-profection-${year}`;
}

export function solarReturnFactId(subjectIndex: number, year: number): string {
  return `s${subjectIndex}-solar-return-${year}`;
}

export function progressedAspectFactId(subjectIndex: number, occurrence: number): string {
  return `s${subjectIndex}-progressed-aspect-${String(occurrence).padStart(2, '0')}`;
}
