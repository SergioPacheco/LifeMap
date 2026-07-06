// INTERPRETATIONS — Français (fr)
import { SUN_IN_HOUSE, MOON_IN_HOUSE, MERCURY_IN_HOUSE } from './pt';
import { VENUS_IN_HOUSE, MARS_IN_HOUSE, NORTH_NODE_HOUSE, NORTH_NODE_IN_SIGN } from '../interpret';
import { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, URANUS_IN_HOUSE, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE } from '../outer-planets';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../chiron';
export { SUN_IN_HOUSE, MOON_IN_HOUSE, MERCURY_IN_HOUSE, VENUS_IN_HOUSE, MARS_IN_HOUSE };
export { JUPITER_IN_HOUSE, SATURN_IN_HOUSE, URANUS_IN_HOUSE, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE };
export { CHIRON_IN_HOUSE, CHIRON_IN_SIGN, NORTH_NODE_HOUSE, NORTH_NODE_IN_SIGN };

export const SIGN_NAMES = ['Bélier','Taureau','Gémeaux','Cancer','Lion','Vierge','Balance','Scorpion','Sagittaire','Capricorne','Verseau','Poissons'];
export const PLANET_NAMES: Record<string,string> = { sun:'Soleil', moon:'Lune', mercury:'Mercure', venus:'Vénus', mars:'Mars', jupiter:'Jupiter', saturn:'Saturne', uranus:'Uranus', neptune:'Neptune', pluto:'Pluton', northNode:'Nœud Nord', chiron:'Chiron', lilith:'Lilith' };
export const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

export const SECTION_TITLES = {
  sun: (house: number, sign: string) => `☉ Soleil en Maison ${house} en ${sign}`,
  moon: (house: number, sign: string) => `☽ Lune en Maison ${house} en ${sign}`,
  mercury: (house: number, sign: string) => `☿ Mercure en Maison ${house} en ${sign}`,
  venus: (house: number, sign: string) => `♀ Vénus en Maison ${house} en ${sign}`,
  mars: (house: number, sign: string) => `♂ Mars en Maison ${house} en ${sign}`,
  jupiter: (house: number, sign: string) => `♃ Jupiter en Maison ${house} en ${sign}`,
  saturn: (house: number, sign: string) => `♄ Saturne en Maison ${house} en ${sign}`,
  uranus: (house: number, sign: string) => `♅ Uranus en Maison ${house} en ${sign}`,
  neptune: (house: number, sign: string) => `♆ Neptune en Maison ${house} en ${sign}`,
  pluto: (house: number, sign: string) => `♇ Pluton en Maison ${house} en ${sign}`,
  northNode: (house: number, sign: string) => `☊ Nœud Nord en Maison ${house} en ${sign}`,
  chiron: (house: number, sign: string) => `⚷ Chiron en Maison ${house} en ${sign}`,
  ascendant: (sign: string) => `Ascendant en ${sign}`,
};

export const PLANET_SUBTITLES: Record<string,string> = {
  sun:'Votre essence solaire — identité, but et énergie vitale', moon:'Votre monde émotionnel — besoins, instincts et sécurité intérieure', mercury:'Votre esprit et communication — comment vous pensez et apprenez', venus:'Votre langage amoureux — ce que vous attirez et désirez', mars:'Votre élan et action — comment vous poursuivez vos objectifs', jupiter:'Votre voie d\'expansion — où coulent abondance et croissance', saturn:'Votre zone de maîtrise — où la discipline forge des acquis durables', uranus:'Votre révolution intérieure — où vous brisez les schémas', neptune:'Votre portail spirituel — où vous dissolvez les frontières', pluto:'Votre pouvoir transformateur — mort et renaissance profondes', northNode:'Votre but évolutif — la direction de votre âme', chiron:'Votre blessure sacrée — la douleur qui devient don de guérison',
};

export const LABELS = {
  reportTitle:'Rapport Natal Complet', reportSubtitle:'Interprétation Profonde', positions:'Positions Planétaires', houses:'Cuspides des Maisons', overview:'Vue d\'Ensemble', potentials:'Vos 5 Plus Grands Potentiels', challenges:'Vos 5 Principaux Défis', conclusion:'Conclusion', advice:'Conseil Pratique', elements:'Éléments et Modalités', dignities:'Dignités Essentielles', aspects:'Aspects Majeurs', themes:'Synthèse Thématique', quote:'"Les astres inclinent, ils ne déterminent pas."', sampleNote:'Ceci était un aperçu gratuit !', sampleFull:'Le rapport complet contient 20-30 pages avec interprétation détaillée.', buyNow:'Version complète :', buyInstant:'Achetez maintenant et téléchargez instantanément — 100% dans votre navigateur.', natalChart:'Votre Carte Natale', retrograde:'(rétrograde)',
  annualTitle:'Prévision Annuelle', annualSubtitle:'Transits et tendances', profection:'Profection Annuelle — Thème de l\'Année', houseInFocus:'en Focus', rulerOfYear:'Maître de l\'Année', eclipses:'Éclipses de l\'Année', jupiterExpansion:'L\'Expansion de l\'Année', saturnLesson:'La Leçon de l\'Année', conclusionAnnual:'Conclusion — Votre Année en Perspective',
  relationshipTitle:'Rapport de Relation', compatibility:'Compatibilité', emotionalConnection:'Connexion Émotionnelle', attractionChemistry:'Attraction et Chimie', communication:'Communication', commitmentLimits:'Engagement et Limites — Saturne', growthPotential:'Potentiel de Croissance', challengesTension:'Points de Tension',
  psychTitle:'Analyse Psychologique Profonde', egoStructure:'Structure de l\'Ego — Soleil et Ascendant', emotionalWorld:'Monde Émotionnel — Lune', mentalProcesses:'Processus Mentaux — Mercure', lovePatterns:'Schémas Amoureux — Vénus', vitalForce:'Force Vitale — Mars', shadow:'Ombre — Pluton', wound:'Blessure Centrale — Chiron', unconscious:'Inconscient — Maison 12 et Neptune', familyPatterns:'Schémas Familiaux — Lune, Maison 4 et Saturne', defenseMechanisms:'Mécanismes de Défense — Saturne', integrationPath:'Chemin d\'Intégration — Nœud Nord',
  careerTitle:'Carrière et Vocation', midheaven:'Milieu du Ciel', house10:'Maison 10 — Vocation', house6:'Maison 6 — Routine et Travail', house2:'Maison 2 — Ressources et Talents',
  sinsTitle:'Les Sept Péchés', pride:'Orgueil — Soleil', lust:'Luxure — Vénus et Mars', greed:'Avarice — Saturne', gluttony:'Gourmandise — Jupiter', wrath:'Colère — Mars', envy:'Envie — Pluton', sloth:'Paresse — Neptune',
  repetitivePatterns:'Schémas Répétitifs — Carrés et Oppositions', unexploredPotentials:'Potentiels Inexplorés — Trigones et Talents', integrationPaths:'Chemins d\'Intégration', recommendedPractices:'Pratiques Recommandées', childhoodTemplate:'Enfance et Schéma Émotionnel', fromWoundToGift:'De la Blessure au Don', differentiation:'Différenciation — Être Vous, Pas Votre Famille', mainTensions:'Tensions Principales de la Carte', plutoAspects:'Aspects Tendus de Pluton',
};

export const TRANSITIONS = {
  afterOverview:'Cette base identitaire se manifeste concrètement en observant les planètes dans leurs maisons.',
  afterPersonalPlanets:'Les aspects entre planètes révèlent comment ces énergies dialoguent entre elles.',
  afterAspects:'De ces interactions émergent des schémas — thèmes centraux de votre expérience.',
  beforeConclusion:'En rassemblant tout ce que nous avons vu, votre carte raconte une histoire cohérente.',
};
