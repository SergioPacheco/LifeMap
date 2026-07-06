export const aspects = {
  title: 'Planetary Aspects',
  intro: 'Aspects are angles between planets — the "conversations" they hold. They show natural talents, creative tensions and internal dynamics that operate throughout life.',
  colorLegend: { harmonic: 'Blue = Harmonic (flows)', tense: 'Red = Tense (challenges)' },
  list: [
    { symbol: '☌', name: 'Conjunction', angle: '0°', orb: '8°', nature: 'Neutral', color: '#cc0000', description: 'Two planets at the same degree — fusion of energies. Like two people in the same room: they can\'t ignore each other. The conjunction intensifies and amplifies both energies.', example: 'Sun ☌ Moon = New Moon (beginning). Venus ☌ Mars = intense passion.' },
    { symbol: '⚹', name: 'Sextile', angle: '60°', orb: '5°', nature: 'Harmonic', color: '#0000cc', description: 'Opportunity that requires conscious action. Like a door ajar — you need to push it open. Connects signs of compatible elements.', example: 'Mercury ⚹ Jupiter = ease in learning, communicating big ideas.' },
    { symbol: '□', name: 'Square', angle: '90°', orb: '7°', nature: 'Tense', color: '#cc0000', description: 'Productive tension — discomfort that generates growth. It\'s the engine of evolution. Without squares, there\'s no motivation to change.', example: 'Moon □ Saturn = emotional difficulty that builds maturity over time.' },
    { symbol: '△', name: 'Trine', angle: '120°', orb: '7°', nature: 'Harmonic', color: '#0000cc', description: 'Natural flow and innate talent. Like a river that already knows its path. Connects signs of the same element, creating natural harmony.', example: 'Venus △ Jupiter = luck in love, natural generosity, good taste.' },
    { symbol: '☍', name: 'Opposition', angle: '180°', orb: '8°', nature: 'Tense', color: '#cc0000', description: 'Polarity that demands integration — the mirror. Two planets on opposite sides of the chart create a "tug of war" that requires balance.', example: 'Sun ☍ Moon = Full Moon. Mars ☍ Saturn = effort vs blockage.' },
  ],
};
