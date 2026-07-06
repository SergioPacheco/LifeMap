// INTERPRETATIONS — Español (es)
// Textos interpretativos: fallback PT até tradução completa
import { SUN_IN_HOUSE, MOON_IN_HOUSE, MERCURY_IN_HOUSE } from './pt';
import { VENUS_IN_HOUSE, MARS_IN_HOUSE, NORTH_NODE_HOUSE, NORTH_NODE_IN_SIGN } from '../interpret';
import { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, URANUS_IN_HOUSE, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE } from '../outer-planets';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../chiron';
export { SUN_IN_HOUSE, MOON_IN_HOUSE, MERCURY_IN_HOUSE, VENUS_IN_HOUSE, MARS_IN_HOUSE };
export { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, URANUS_IN_HOUSE, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE };
export { CHIRON_IN_HOUSE, CHIRON_IN_SIGN, NORTH_NODE_HOUSE, NORTH_NODE_IN_SIGN };

export const SIGN_NAMES = ['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];
export const PLANET_NAMES: Record<string,string> = { sun:'Sol', moon:'Luna', mercury:'Mercurio', venus:'Venus', mars:'Marte', jupiter:'Júpiter', saturn:'Saturno', uranus:'Urano', neptune:'Neptuno', pluto:'Plutón', northNode:'Nodo Norte', chiron:'Quirón', lilith:'Lilith' };
export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export const SECTION_TITLES = {
  sun: (house: number, sign: string) => `☉ Sol en Casa ${house} en ${sign}`,
  moon: (house: number, sign: string) => `☽ Luna en Casa ${house} en ${sign}`,
  mercury: (house: number, sign: string) => `☿ Mercurio en Casa ${house} en ${sign}`,
  venus: (house: number, sign: string) => `♀ Venus en Casa ${house} en ${sign}`,
  mars: (house: number, sign: string) => `♂ Marte en Casa ${house} en ${sign}`,
  jupiter: (house: number, sign: string) => `♃ Júpiter en Casa ${house} en ${sign}`,
  saturn: (house: number, sign: string) => `♄ Saturno en Casa ${house} en ${sign}`,
  uranus: (house: number, sign: string) => `♅ Urano en Casa ${house} en ${sign}`,
  neptune: (house: number, sign: string) => `♆ Neptuno en Casa ${house} en ${sign}`,
  pluto: (house: number, sign: string) => `♇ Plutón en Casa ${house} en ${sign}`,
  northNode: (house: number, sign: string) => `☊ Nodo Norte en Casa ${house} en ${sign}`,
  chiron: (house: number, sign: string) => `⚷ Quirón en Casa ${house} en ${sign}`,
  ascendant: (sign: string) => `Ascendente en ${sign}`,
};

export const PLANET_SUBTITLES: Record<string,string> = {
  sun:'Tu esencia solar — identidad, propósito y energía vital', moon:'Tu mundo emocional — necesidades, instintos y seguridad interior', mercury:'Tu mente y comunicación — cómo piensas, aprendes y te expresas', venus:'Tu lenguaje del amor — lo que atraes, valoras y deseas', mars:'Tu impulso y acción — cómo persigues objetivos y deseas', jupiter:'Tu camino de expansión — donde fluyen abundancia y crecimiento', saturn:'Tu zona de maestría — donde la disciplina forja logros duraderos', uranus:'Tu revolución interior — donde rompes patrones', neptune:'Tu portal espiritual — donde disuelves fronteras', pluto:'Tu poder transformador — muerte y renacimiento profundo', northNode:'Tu propósito evolutivo — la dirección de tu alma', chiron:'Tu herida sagrada — el dolor que se vuelve don de sanación',
};

export const LABELS = {
  reportTitle:'Informe Natal Completo', reportSubtitle:'Interpretación Profunda', positions:'Posiciones Planetarias', houses:'Cúspides de las Casas', overview:'Visión General', potentials:'Tus 5 Mayores Potenciales', challenges:'Tus 5 Principales Desafíos', conclusion:'Conclusión', advice:'Consejo Práctico', elements:'Elementos y Modalidades', dignities:'Dignidades Esenciales', aspects:'Aspectos Principales', themes:'Síntesis Temática', quote:'"Los astros inclinan, no obligan."', sampleNote:'¡Esta fue una muestra gratuita!', sampleFull:'El informe completo contiene 20-30 páginas con interpretación detallada.', buyNow:'Versión completa:', buyInstant:'Compra ahora y descarga instantáneamente — 100% en tu navegador.', natalChart:'Tu Carta Natal', retrograde:'(retrógrado)',
  annualTitle:'Previsión Anual', annualSubtitle:'Tránsitos y tendencias', profection:'Profección Anual — Tema del Año', houseInFocus:'en Foco', rulerOfYear:'Regente del Año', eclipses:'Eclipses del Año', jupiterExpansion:'La Expansión del Año', saturnLesson:'La Lección del Año', conclusionAnnual:'Conclusión — Tu Año en Perspectiva',
  relationshipTitle:'Informe de Relación', compatibility:'Compatibilidad', emotionalConnection:'Conexión Emocional', attractionChemistry:'Atracción y Química', communication:'Comunicación', commitmentLimits:'Compromiso y Límites — Saturno', growthPotential:'Potencial de Crecimiento', challengesTension:'Puntos de Tensión',
  psychTitle:'Análisis Psicológico Profundo', egoStructure:'Estructura del Ego — Sol y Ascendente', emotionalWorld:'Mundo Emocional — Luna', mentalProcesses:'Procesos Mentales — Mercurio', lovePatterns:'Patrones de Amor — Venus', vitalForce:'Fuerza Vital — Marte', shadow:'Sombra — Plutón', wound:'Herida Central — Quirón', unconscious:'Inconsciente — Casa 12 y Neptuno', familyPatterns:'Patrones Familiares — Luna, Casa 4 y Saturno', defenseMechanisms:'Mecanismos de Defensa — Saturno', integrationPath:'Camino de Integración — Nodo Norte',
  careerTitle:'Carrera y Vocación', midheaven:'Medio Cielo', house10:'Casa 10 — Vocación', house6:'Casa 6 — Rutina y Trabajo', house2:'Casa 2 — Recursos y Talentos',
  sinsTitle:'Los Siete Pecados', pride:'Orgullo — Sol', lust:'Lujuria — Venus y Marte', greed:'Avaricia — Saturno', gluttony:'Gula — Júpiter', wrath:'Ira — Marte', envy:'Envidia — Plutón', sloth:'Pereza — Neptuno',
  repetitivePatterns:'Patrones Repetitivos — Cuadraturas y Oposiciones', unexploredPotentials:'Potenciales Inexplorados — Trígonos y Talentos', integrationPaths:'Caminos de Integración', recommendedPractices:'Prácticas Recomendadas', childhoodTemplate:'Infancia y Patrón Emocional', fromWoundToGift:'De la Herida al Don', differentiation:'Diferenciación — Ser Tú, No Tu Familia', mainTensions:'Tensiones Principales del Mapa', plutoAspects:'Aspectos Tensos de Plutón',
};

export const TRANSITIONS = {
  afterOverview:'Esta base de identidad se manifiesta concretamente al observar los planetas en sus casas.',
  afterPersonalPlanets:'Los aspectos entre planetas revelan cómo estas energías conversan entre sí.',
  afterAspects:'De estas interacciones emergen patrones — temas centrales que definen tu experiencia.',
  beforeConclusion:'Reuniendo todo lo visto, tu carta cuenta una historia coherente.',
};
