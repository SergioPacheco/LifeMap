// ============================================================
// REPORT-TEXTS.TS — i18n text strings for the 3 report generators
// Locales: en, pt, es, fr, de, it, nl, tr, ru, zh, ja
// ============================================================

export interface ReportTexts {
  financial: FinancialTexts;
  spiritual: SpiritualTexts;
  saturnReturn: SaturnReturnTexts;
}

export interface FinancialTexts {
  coverTitle: string;
  coverSubtitle: string;
  overviewTitle: string;
  overview1: string;
  overview2: (h2RulerName: string, h2RulerHouse: number, ordH2Ruler: string) => string;
  overview3: string;
  atAGlance: string;
  house2Title: (signSymbol: string, signName: string) => string;
  house2Intro: string;
  house2EarningStyle: (signName: string) => string;
  planetsInH2Title: string;
  house2RulerTitle: (rulerName: string, houseNum: number, ordHouse: string) => string;
  house2RulerText: (rulerName: string, houseNum: number, ordHouse: string) => string;
  house8Title: (signSymbol: string, signName: string) => string;
  house8Intro: string;
  house8CuspTitle: (signName: string) => string;
  planetsInH8Title: string;
  venusTitle: (signName: string, houseNum: number) => string;
  venusIntro: string;
  venusSignTitle: (signName: string) => string;
  venusHouseTitle: (houseNum: number) => string;
  jupiterTitle: (signName: string, houseNum: number) => string;
  jupiterIntro: string;
  jupiterCycleTitle: string;
  jupiterCycleText: string;
  saturnTitle: (signName: string, houseNum: number) => string;
  saturnIntro: string;
  saturnHouseTitle: (houseNum: number) => string;
  saturnReturnTitle: string;
  saturnReturnText: string;
  aspectsTitle: string;
  aspectsIntro: string;
  noAspectsText: string;
  strengthsTitle: string;
  strengthsIntro: string;
  challengesTitle: string;
  challengesIntro: string;
  adviceTitle: string;
  adviceIntro: string;
  conclusionTitle: string;
  conclusion1: (profileName: string, h2Sign: string, h8Sign: string, venusSign: string, jupSign: string, satSign: string) => string;
  conclusion2: (rulerName: string) => string;
  conclusion3: string;
  quote: string;
  h2SignTexts: string[];
  h8SignTexts: string[];
  venusInHouseFinancial: string[];
  jupiterInHouseFinancial: string[];
  venusSignDescs: string[];
  jupiterSignDescs: string[];
  saturnSignDescs: string[];
  planetH2Descs: Record<string, string>;
  planetH8Descs: Record<string, string>;
  strengthVenusDignity: (signName: string) => string;
  strengthJupiterDignity: (signName: string) => string;
  strengthSaturnDignity: (signName: string) => string;
  strengthVenusH2Title: string;
  strengthVenusH2Text: string;
  strengthVenusH8Title: string;
  strengthVenusH8Text: string;
  strengthJupiterH2Title: string;
  strengthJupiterH2Text: string;
  strengthJupiterH8Title: string;
  strengthJupiterH8Text: string;
  strengthVJTitle: (symbol: string) => string;
  strengthVJText: string;
  strengthJSTitle: string;
  strengthJSText: string;
  strengthH2Default: (signName: string) => string;
  strengthH8Default: (signName: string) => string;
  challengeVenusDetriment: (signName: string) => string;
  challengeJupiterDetriment: (signName: string) => string;
  challengeSaturnDetriment: (signName: string) => string;
  challengeVSTense: (symbol: string) => string;
  challengeVJTense: (symbol: string) => string;
  challengeJSTense: (symbol: string) => string;
  challengeAxis: (h2Sign: string, h8Sign: string) => string;
  challengeSelfWorth: string;
  adviceItems: Array<{ title: (rulerName: string, houseNum: number, ordHouse: string) => string; text: (rulerName: string, houseNum: number, ordHouse: string, venusSign: string, h2Sign: string) => string }>;
  aspectGeneric: Record<string, Record<string, string>>;
}

export interface SpiritualTexts {
  coverTitle: string;
  coverSubtitle: string;
  overviewTitle: string;
  overviewText: string;
  blueprintTitle: string;
  nnTitle: (signName: string) => string;
  nnIntro: (signName: string, houseNum: number) => string;
  nnDirectionTitle: (signName: string) => string;
  nnHouseTitle: (houseNum: number) => string;
  nnHowToTitle: string;
  nnHowToText: string;
  snTitle: (signName: string) => string;
  snIntro: string;
  snFamiliarTitle: (signName: string, houseNum: number) => string;
  snGiftTrapTitle: string;
  snGiftTrapText: string;
  house12Title: (signName: string) => string;
  house12Intro: string;
  house12QualityTitle: (signName: string) => string;
  planetsIn12Title: (names: string) => string;
  planetsIn12Intro: string;
  neptuneTitle: (signName: string) => string;
  neptuneIntro: string;
  neptuneGenTitle: (signName: string) => string;
  neptuneGenText: (signName: string) => string;
  neptuneHouseTitle: (houseNum: number) => string;
  neptuneAspectsTitle: string;
  neptuneNoAspects: string;
  chironTitle: (signName: string) => string;
  chironIntro: string;
  chironSignTitle: (signName: string) => string;
  chironHouseTitle: (houseNum: number) => string;
  chironPathTitle: string;
  chironPathText: (houseNum: number, signName: string) => string;
  plutoTitle: (signName: string) => string;
  plutoIntro: string;
  plutoGenTitle: (signName: string) => string;
  plutoGenText: (signName: string) => string;
  plutoHouseTitle: (houseNum: number) => string;
  plutoConsciousTitle: string;
  plutoConsciousText: string;
  saturnKarmicTitle: (signName: string) => string;
  saturnKarmicIntro: string;
  saturnKarmicSignTitle: (signName: string) => string;
  saturnKarmicHouseTitle: (houseNum: number) => string;
  saturnAncestralTitle: string;
  saturnAncestralText: string;
  spiritualAspectsTitle: string;
  spiritualAspectsIntro: string;
  spiritualAspectsNone: string;
  pastLifeTitle: string;
  pastLifeIntro: string;
  pastLifeStoryTitle: string;
  pastLifeStory: (snSign: string, snHouse: number, chironSign: string, chironHouse: number, saturnSign: string, saturnHouse: number, planetsIn12: string[], h12Sign: string) => string;
  pastLifeCompletingTitle: string;
  pastLifeCompletingText: (snSign: string, nnSign: string) => string;
  practicesTitle: string;
  practicesIntro: string;
  universalPracticesTitle: string;
  conclusionTitle: string;
  conclusion: (profileName: string, nnSign: string, nnHouse: number, snSign: string, snHouse: number, chironSign: string, chironHouse: number, neptuneHouse: number, plutoHouse: number, saturnSign: string, saturnHouse: number) => string;
  quote: string;
  northNodeInHouse: string[];
  northNodeInSign: string[];
  saturnKarmic: string[];
  neptuneSpiritual: string[];
  plutoKarmic: string[];
  snDescs: Record<number, string>;
  h12Descs: Record<number, string>;
  p12Descs: Record<string, string>;
  spiritualPracticesNN: Record<number, string>;
  spiritualPracticesNeptune: Record<number, string>;
  spiritualPracticesChiron: Record<number, string>;
  universalPractices: (nnSign: string, chironHouse: number, saturnHouse: number) => string[];
}

export interface SaturnReturnTexts {
  coverTitle: string;
  coverSubtitle1st: string;
  coverSubtitle2nd: string;
  coverSubtitleBetween: string;
  overviewTitle: string;
  overview1: string;
  overview2: string;
  overview3: string;
  overview4: string;
  returnContextTitle: string;
  returnContext1st: (age: number) => string;
  returnContext2nd: (age: number) => string;
  returnContextBetween: (age: number, nextYear: number) => string;
  natalTitle: (signSymbol: string, signName: string, houseNum: number) => string;
  natalIntro: string;
  natalSignTitle: (signName: string) => string;
  natalHouseTitle: (houseNum: number) => string;
  natalLessonTitle: string;
  natalLessonText: (houseNum: number, signName: string) => string;
  houseRestructuringTitle: (houseNum: number) => string;
  houseRestructuringIntro: string;
  houseGovernsTitle: string;
  houseReturnAsksTitle: string;
  aspectsTitle: string;
  aspectsIntro: string;
  conjunctionsTitle: string;
  hardAspectsTitle: string;
  softAspectsTitle: string;
  noAspectsText: (houseNum: number) => string;
  demandsTitle: (signName: string) => string;
  demandsIntro: string;
  demandsListTitle: (signName: string) => string;
  demandsPracticalTitle: string;
  rewardsTitle: string;
  rewardsIntro: string;
  rewardsSignTitle: (signName: string) => string;
  rewardsSpecificTitle: string;
  ruledHousesTitle: string;
  ruledHousesIntro: string;
  ruledHouseTitle: (houseNum: number) => string;
  noRuledHousesText: (houseNum: number) => string;
  ruledHousesSynthesisTitle: string;
  guidanceTitle: string;
  guidanceIntro: string;
  timelineTitle: string;
  timelineIntro: string;
  firstReturnTitle: string;
  firstReturnContent: string;
  firstReturnSpecificTitle: (signName: string, houseNum: number) => string;
  firstReturnSpecificText: (signName: string, houseNum: number) => string;
  secondReturnTitle: string;
  secondReturnContent: string;
  secondReturnSpecificTitle: string;
  secondReturnSpecificText: (signName: string, houseNum: number) => string;
  conclusionTitle: string;
  conclusion1: (profileName: string, signName: string, houseNum: number) => string;
  conclusion2: string;
  conclusion3: (signName: string, houseNum: number) => string;
  glanceTitle: string;
  quote: string;
  saturnInSignEN: string[];
  saturnDemands: string[];
  saturnRewards: string[];
  houseGovernsTexts: Record<number, string>;
  houseReturnAsks: Record<number, string>;
  practicalDemands: Record<number, string>;
  specificGifts: Record<number, string>;
  guidanceSections: Array<{ title: string; text: (houseNum: number, houseReturnAsk: string, signName: string) => string }>;
  timelinePhases: Array<{ name: string; text: (houseNum: number, signName: string) => string }>;
}

export function getReportTexts(locale: string): ReportTexts {
  return TEXTS[locale] ?? TEXTS['en'];
}


// ============================================================
// ALL LOCALE TEXTS
// ============================================================

const TEXTS: Record<string, ReportTexts> = {
  en: {
    financial: {
      coverTitle: 'Financial Map',
      coverSubtitle: 'Your wealth potential and relationship with money',
      overviewTitle: 'Overview — Your Relationship with Money',
      overview1: `Money is one of the most emotionally charged areas of human life — and the natal chart reflects that complexity with precision. Your financial story is written across three primary axes: the 2nd house (what you personally earn, value and build), the 8th house (what comes through others — investments, inheritance, joint ventures and transformation), and the planets Venus, Jupiter and Saturn (what you attract, where abundance flows, and where discipline builds lasting wealth).`,
      overview2: (h2RulerName, h2RulerHouse, ordH2Ruler) => `The ruler of your 2nd house — ${h2RulerName}, currently placed in the ${h2RulerHouse}${ordH2Ruler} house — is your "money-making style" planet. Where this planet sits, and how it is aspected, reveals the primary channel through which financial energy enters your life. Understanding this planet is often more practically useful than any generic financial advice.`,
      overview3: `This report maps all of these layers in sequence. It is not a prediction of how much money you will have — it is a map of your natural relationship with resources: where flow is easy, where discipline is required, and where hidden opportunities may be waiting for conscious activation.`,
      atAGlance: 'Your Financial Signature at a Glance',
      house2Title: (signSymbol, signName) => `House 2 — ${signSymbol} ${signName}: Personal Resources & Self-Worth`,
      house2Intro: `The 2nd house is your personal treasury: not just money, but everything you own, everything you can produce from your own hands and mind, and — crucially — the sense of worth that underlies it all. The sign on the cusp reveals your instinctive money-making style; planets inside the house amplify and colour the story.`,
      house2EarningStyle: (signName) => `${signName} on the 2nd House Cusp — Your Earning Style`,
      planetsInH2Title: 'Planets in Your 2nd House',
      house2RulerTitle: (rulerName, houseNum, ordHouse) => `${rulerName} — Ruler of Your 2nd House (in House ${houseNum})`,
      house2RulerText: (rulerName, houseNum, ordHouse) => `The planet that rules the sign on your 2nd house cusp is your "money planet" — the most direct indicator of how financial energy moves in your life. ${rulerName} is placed in your ${houseNum}${ordHouse} house, which means the themes of that house are where your earning power is most naturally activated. Whenever ${rulerName} is aspected by transit or progression, financial movement tends to follow.`,
      house8Title: (signSymbol, signName) => `House 8 — ${signSymbol} ${signName}: Shared Resources & Transformation`,
      house8Intro: `The 8th house is the most psychologically complex financial domain in the chart. It rules everything that comes from or through others: inheritance, joint investments, loans, insurance, tax, your partner's income, and the finances that arrive as a result of deep trust or deep crisis. The 8th house asks you to release control over outcomes and enter into genuine financial interdependence — which is often where the greatest wealth, and the greatest lessons, live.`,
      house8CuspTitle: (signName) => `${signName} on the 8th House Cusp`,
      planetsInH8Title: 'Planets in Your 8th House',
      venusTitle: (signName, houseNum) => `Venus in ${signName} (House ${houseNum}) — What You Attract`,
      venusIntro: `Venus is the planet of attraction — not just romantic attraction, but the magnetic principle that draws resources, beauty, pleasure and value toward you. In financial astrology, Venus describes the quality of what you attract effortlessly: the income streams that feel natural, the clients who find you, the opportunities that arrive without aggressive pursuit. Understanding your Venus is understanding what you were designed to receive.`,
      venusSignTitle: (signName) => `Venus in ${signName} — Attraction Quality`,
      venusHouseTitle: (houseNum) => `Venus in House ${houseNum} — Where Attraction Manifests`,
      jupiterTitle: (signName, houseNum) => `Jupiter in ${signName} (House ${houseNum}) — Where Abundance Flows`,
      jupiterIntro: `Jupiter is the planet of expansion, generosity and the principle of "more." In financial astrology, Jupiter marks where abundance arrives most naturally — not through luck alone, but through the amplifying effect of genuine faith and action. Where Jupiter sits in your chart is where the universe tends to say yes. It is also where you are most prone to excess, which is why Jupiter's gifts require discernment as much as enthusiasm.`,
      jupiterCycleTitle: 'Working with Your Jupiter Cycle',
      jupiterCycleText: `Jupiter completes a full cycle of the zodiac every 12 years. When it returns to its natal sign — around age 12, 24, 36, 48 and 60 — there is a natural window of financial expansion and opportunity. When Jupiter transits your 2nd house, personal income tends to grow. When it transits your 8th house, shared resources and investment returns often expand. Tracking the Jupiter cycle is one of the most practical tools of financial astrology.`,
      saturnTitle: (signName, houseNum) => `Saturn in ${signName} (House ${houseNum}) — Where Discipline Builds Wealth`,
      saturnIntro: `If Jupiter shows where abundance flows easily, Saturn shows where wealth is built with effort and discipline — and where it lasts. Saturn's financial gifts are not given; they are earned. But what is earned through Saturn is genuinely yours: not dependent on market cycles, other people's generosity or fortunate circumstances. Saturn builds the financial foundation that holds when everything else shifts.`,
      saturnHouseTitle: (houseNum) => `Saturn in House ${houseNum} — Where Structure Pays Off`,
      saturnReturnTitle: 'The Saturn Return and Financial Maturity',
      saturnReturnText: `Around ages 28-30 and again at 58-60, Saturn returns to its natal position — the Saturn Return. This is consistently one of the most significant financial reset points in life. The first return often involves a reckoning with financial immaturity: debt patterns, unclear income strategy, or inherited financial beliefs that no longer serve. The second return consolidates the financial legacy you have built. In both cases, what you have built with integrity survives; what you have built on avoidance does not.`,
      aspectsTitle: 'Financial Aspects — Venus, Jupiter & Saturn Connections',
      aspectsIntro: `The aspects between Venus, Jupiter and Saturn in your natal chart describe how your three core financial principles interact: attraction (Venus), expansion (Jupiter) and discipline (Saturn). Harmonious connections between them suggest that earning, growing and sustaining wealth flow with relative coherence. Tense connections indicate areas requiring conscious integration — often where the greatest financial lessons and eventual mastery lie.`,
      noAspectsText: `Venus, Jupiter and Saturn in your chart do not form close major aspects to each other. This means your financial principles of attraction, expansion and discipline operate with relative independence — each in its own domain without strong reinforcement or tension between them. The practical implication is that financial integration requires more conscious, deliberate coordination between these three energies rather than relying on natural internal flow.`,
      strengthsTitle: 'Top 5 Financial Strengths',
      strengthsIntro: `The following strengths are derived from dignities, house placements and harmonious aspects in your chart. They represent the financial qualities you were born with — not as a guarantee of results, but as natural capabilities that reward conscious development and deployment.`,
      challengesTitle: 'Top 5 Financial Challenges',
      challengesIntro: `Financial challenges in the natal chart are not obstacles — they are areas requiring conscious work. Each challenge below carries within it a corresponding growth edge. The charts of history's most successful wealth-builders are rarely tension-free; they are charts where the tensions were understood and worked with deliberately.`,
      adviceTitle: 'Practical Advice & Timing',
      adviceIntro: `Astrology's greatest practical value in financial planning is timing — knowing when to expand aggressively, when to consolidate, and when to hold still. The following recommendations are grounded in your specific chart configuration and the planetary cycles most relevant to financial movement.`,
      conclusionTitle: 'Conclusion',
      conclusion1: (profileName, h2Sign, h8Sign, venusSign, jupSign, satSign) => `${profileName}, your financial map reveals a complete and nuanced picture of how wealth moves in your life. The 2nd house in ${h2Sign} defines your natural earning style; the 8th house in ${h8Sign} shapes your relationship with shared resources and transformation; Venus in ${venusSign} describes what you attract; Jupiter in ${jupSign} marks where abundance flows most freely; and Saturn in ${satSign} indicates where disciplined effort builds the most durable wealth.`,
      conclusion2: (rulerName) => `The most important insight this report offers is not a prediction — it is a description of your natural financial character. You will earn most effectively, build most sustainably, and experience the deepest financial satisfaction when you work with these planetary energies rather than against them. This means leaning into your Venus attraction style rather than copying someone else's, trusting your Jupiter instincts while respecting Saturn's boundaries, and understanding that your 2nd house ruler — ${rulerName} — is your primary financial navigation instrument.`,
      conclusion3: `Money is not separate from the rest of life. The same chart that describes your emotional patterns, your creativity, your relationships and your purpose also describes your financial story — because they are all one story. When you align your financial life with your full chart rather than trying to optimise money in isolation, you discover that abundance is not just about numbers. It is about living fully within the specific, irreplaceable shape of who you are.`,
      quote: '"Wealth consists not in having great possessions, but in having few wants." — Epictetus',
      h2SignTexts: [
        `With Aries on the cusp of the 2nd house, you earn through initiative, courage and direct action. You are drawn to entrepreneurial ventures and first-mover opportunities. Your income often arrives in bursts rather than steady streams — the challenge is building reserves during the peaks. Self-worth is tied to independence; when you can act autonomously, your earning power expands naturally.`,
        `Taurus on the 2nd house cusp is one of the strongest financial placements in the zodiac. You build wealth slowly and surely, with a natural gift for accumulation and long-term investment. Sensory pleasures — good food, beautiful spaces, quality craftsmanship — are genuine needs, not indulgences. Your money-making style rewards patience and consistency over speed.`,
        `Gemini on the 2nd house cusp suggests income through communication, information and versatility. Multiple income streams feel natural and even necessary to you. Writing, teaching, sales, consulting or any field that monetises your ability to connect ideas and people aligns with this placement. The challenge is focus — diversification can scatter energy across too many projects.`,
        `Cancer on the 2nd house cusp links finances to emotional security. You earn best when you feel safe, nurtured and aligned with your values. Real estate, hospitality, food, caregiving and family-oriented businesses often attract this placement. Financial decisions are emotionally informed — which can be a strength (deep intuition) or a weakness (fear-driven hoarding).`,
        `Leo on the 2nd house cusp creates a money-making style centred on creativity, generosity and personal brand. You earn more when you are visible and celebrated. Industries where self-expression, entertainment or leadership matter offer fertile ground. You spend generously — sometimes too generously — because money feels like a vehicle for joy and impact, not just security.`,
        `Virgo on the 2nd house cusp produces income through service, precision and mastery of skill. You are most financially comfortable when you earn through something genuinely useful and expertly delivered. Health, analysis, editing, data, craftsmanship and process improvement are natural domains. The challenge is underpricing your services — perfectionism can disguise itself as modesty.`,
        `Libra on the 2nd house cusp connects earnings to partnerships, aesthetics and relational intelligence. You often earn more in collaboration than alone, and you have an instinct for fair exchange. Design, diplomacy, law, art, beauty and consulting align with this placement. The challenge is avoiding financial codependency — knowing your worth independent of what others reflect back.`,
        `Scorpio on the 2nd house cusp is one of the most financially intense placements. You are drawn to other people's resources — investments, inheritance, joint ventures, debt restructuring. Your earning style is all-or-nothing; you can generate significant wealth or experience dramatic losses. Trust, power dynamics and the psychology of money are central themes throughout life.`,
        `Sagittarius on the 2nd house cusp links income to expansion, philosophy and reaching beyond familiar horizons. You earn through teaching, publishing, travel, higher education, international business or anything that broadens perspective. Generosity can outpace income if not managed — the belief that "more will always come" needs to be balanced with practical planning.`,
        `Capricorn on the 2nd house cusp is one of the most capable financial positions in astrology. You understand that wealth is built over decades, not days. Structure, discipline and long-term investment are your natural tools. The challenge is allowing yourself to enjoy what you build — frugality can tip into scarcity mindset even when resources are genuinely abundant.`,
        `Aquarius on the 2nd house cusp creates income through innovation, technology and unconventional approaches. You may monetise ideas ahead of their time, sometimes struggling to find the right market before it exists. Cryptocurrency, tech startups, social enterprises and any frontier field can attract this placement. Financial freedom — not wealth for its own sake — is the real motivator.`,
        `Pisces on the 2nd house cusp links finances to creativity, spirituality, compassion and intuition. You may earn through art, healing, music, film, therapy or any field that serves the soul. Money can feel mysterious or elusive — not because you lack talent, but because your relationship with material reality is more fluid than most. Clear financial structures and trusted advisors provide essential grounding.`,
      ],
      h8SignTexts: [
        `Aries on the 8th house cusp brings directness and courage to the domain of shared resources. You approach investment risk, inheritances and joint finances with initiative. Conflicts over money can be fierce but short-lived. Transformation tends to happen quickly and dramatically in your life — crises ignite fast action rather than prolonged processing.`,
        `Taurus on the 8th house cusp can create a complex relationship with other people's money and shared assets. You are drawn to stable, tangible investments — property, bonds, physical assets. Releasing control over joint finances can be deeply challenging. Inheritances, when they come, tend to arrive in material, lasting form. Psychological transformation comes slowly but proves permanent.`,
        `Gemini on the 8th house cusp brings intellectual curiosity to the deepest financial and psychological territory. You research investments thoroughly and are drawn to information asymmetry as an asset. Multiple joint financial arrangements are possible across a lifetime. You process transformation by talking, writing and making sense of what happened — narrative is how you metabolise crisis.`,
        `Cancer on the 8th house cusp intensifies emotional entanglement with shared resources and inheritance. Family money — in all its complexity — plays a significant role in your financial story. You may inherit not just assets but also emotional patterns around scarcity or abundance. Your investment instincts are guided by emotional intelligence and care for future generations.`,
        `Leo on the 8th house cusp brings pride and creative energy to joint finances and deep transformation. Power struggles over shared resources can be intense — you do not yield control easily. Investment in brand, creative ventures and personal legacy aligns with this placement. Transformative experiences tend to come through moments where your ego is challenged to the core.`,
        `Virgo on the 8th house cusp applies analytical precision to shared finances, investments and debt. You research before committing to any joint financial arrangement and expect the same diligence from partners. Healthcare investments, process improvement tools and data-driven assets attract this placement. Transformation comes through refining and perfecting, not through dramatic upheaval.`,
        `Libra on the 8th house cusp creates a deep need for fairness and balance in all shared financial arrangements. Prenuptial agreements, legal partnerships and carefully negotiated contracts provide security. Investment decisions benefit from a trusted advisor — a second perspective reduces the paralysis that comes with weighing every option. Transformation arrives through relationship itself.`,
        `Scorpio on the 8th house cusp is the sign's natural home — this is the most powerful and intense combination. You have profound instincts about investment, debt, power and regeneration. You can sense financial turning points before others do. The shadow side is obsession with control, secrecy around money, or using financial leverage manipulatively. Extraordinary wealth or transformation is possible when this energy is directed consciously.`,
        `Sagittarius on the 8th house cusp expands shared financial territory across borders, philosophies and cultures. International investments, foreign inheritance, cross-cultural partnerships and philosophical frameworks for wealth creation all resonate. You may experience transformative loss that ultimately opens entirely new horizons — the fire burns away what was limiting to reveal something vaster.`,
        `Capricorn on the 8th house cusp approaches shared resources with discipline, structure and long-term strategy. Joint financial plans tend to be carefully constructed and rigorously maintained. You may inherit responsibility alongside assets — the executor role, the family financial caretaker. Transformation through this placement is slow, structural and permanent: things rarely return to their previous form.`,
        `Aquarius on the 8th house cusp brings innovation and detachment to the territory of shared wealth and deep psychology. You may benefit from group investment models, cooperative financing or technology-driven financial tools. Transformation arrives through sudden, unexpected rupture — situations that seem chaotic but ultimately liberate. Freedom from financial entanglement may be as valuable as accumulation.`,
        `Pisces on the 8th house cusp makes the boundary between your finances and others' genuinely permeable. Careful documentation of shared financial arrangements protects you from confusion or exploitation. Spiritual inheritances — wisdom traditions, healing gifts, creative legacies — may prove as significant as material ones. Transformation comes through surrender, not force; profound change happens when you stop trying to control the outcome.`,
      ],
      venusInHouseFinancial: [
        `Venus in the 1st house places attractiveness, charm and personal magnetism at the centre of your financial profile. You naturally draw resources through your presence and personality. Your personal brand IS the business. Beauty, wellness, fashion and any field where appearance and first impressions matter offer natural income pathways.`,
        `Venus in the 2nd house is one of the strongest placements for financial attraction. You naturally draw money, beautiful objects and sensory pleasures. Your values are clear and your tastes refined — you spend on quality and expect quality in return. This placement supports income through Venusian fields: art, design, beauty, hospitality and luxury.`,
        `Venus in the 3rd house draws resources through communication, networking and ideas. Your charm in conversation opens financial doors that talent alone might not. Writing, podcasting, social media, sales and teaching leverage this placement well. Sibling relationships or local community connections may carry financial significance.`,
        `Venus in the 4th house attracts resources connected to home, family and emotional security. Real estate, interior design, hospitality, food and family businesses resonate. Inherited values — and sometimes inherited wealth — shape your relationship with money. Creating beautiful, safe environments is both a personal need and a potential income source.`,
        `Venus in the 5th house draws income through creativity, entertainment, romance and play. You attract resources when you are expressing your authentic creative voice. Children's products, performing arts, gaming, luxury experiences and romantic markets can be financially fertile. Speculative investments may also attract — though the thrill of risk must be watched carefully.`,
        `Venus in the 6th house attracts resources through service, skill and useful beauty. Your work has aesthetic quality — you care that what you produce is not only functional but well-made. Healthcare, nutrition, wellness, craft and quality-focused service industries suit this placement. Financial health and physical health are directly connected for you.`,
        `Venus in the 7th house is in its natural home and draws significant resources through partnership. Business partnerships, client relationships and spousal finances often provide major income channels. Your negotiation skills are naturally elegant — you find win-win solutions with ease. Contracts, agreements and the beauty of fair exchange are themes throughout your financial life.`,
        `Venus in the 8th house draws resources through depth, intimacy and other people's assets. Inheritance, joint investment, investment banking, psychology and transformative services may feature. You have instincts for finding value where others see only risk. This placement can attract significant wealth through shared ventures when trust is present.`,
        `Venus in the 9th house draws income through expansion — foreign trade, publishing, higher education, philosophy and international connections. Your financial opportunities often arise when you go beyond familiar territory. Teaching abroad, travel writing, international partnerships or cross-cultural ventures can be highly rewarding.`,
        `Venus in the 10th house is highly visible — you attract resources through professional reputation, public standing and career achievement. Your charm works well in public life. Fashion, the arts, diplomacy, public relations and any career with strong brand presence suit this placement. Your professional relationships often carry aesthetic or values-based qualities.`,
        `Venus in the 11th house draws income through community, collaboration and forward-thinking networks. Group investments, social enterprises, technology platforms and community-based products align well. Your financial circle of trust is wide and eclectic. Dreams of future abundance often materialise through collective rather than individual effort.`,
        `Venus in the 12th house attracts resources through behind-the-scenes work, spiritual service and solitary creativity. Music, visual art, therapy, healing and retreat spaces can be income sources. Financial matters benefit from solitude and reflection rather than public promotion. Inheritances or unexpected windfalls sometimes arrive quietly, without fanfare.`,
      ],
      jupiterInHouseFinancial: [
        `Jupiter in the 1st house brings natural optimism and a broad, generous presence that attracts opportunity. Your confidence itself is a financial asset. People invest in you before they fully understand your plan — because your enthusiasm is contagious and your vision expansive.`,
        `Jupiter in the 2nd house is one of the most auspicious placements for financial growth. Abundance flows toward your personal resources with relative ease across the lifetime. The challenge is not accumulation but discernment — Jupiterian excess can lead to overspending or overextension. Your greatest financial risk is assuming the next opportunity will always come.`,
        `Jupiter in the 3rd house expands income through ideas, communication and local networks. Publishing, teaching, speaking, podcasting, social media and sales channels can be surprisingly lucrative. Short trips and local connections carry hidden financial value. Your mind is genuinely a money-making instrument.`,
        `Jupiter in the 4th house expands real estate, family resources and the emotional foundation of financial life. Property investment, family business and inherited opportunity may feature. Your home can become an income-generating asset. Financial abundance often increases in the second half of life when foundations are fully established.`,
        `Jupiter in the 5th house expands income through creativity, entertainment, speculation and joy. Passion projects can become profitable — your creative output has breadth and natural audience appeal. Children, education, entertainment and luxury leisure markets can bring significant returns. Speculative investment may pay off — but requires discipline to not overreach.`,
        `Jupiter in the 6th house expands income through service, skill refinement and health-related fields. Your daily work habits are a genuine source of abundance — consistency and improvement compound over time. Healthcare, wellness, detailed craftsmanship and process optimisation can be financially rewarding. Your body of work grows steadily and impressively.`,
        `Jupiter in the 7th house expands resources through partnerships — both personal and professional. Business partnerships tend to bring more income than solo ventures. Your clients and collaborators may be unusually generous or well-resourced. Legal and contractual fields may also feature. Marriage or long-term partnership often improves financial position.`,
        `Jupiter in the 8th house creates one of the strongest placements for attracting other people's money. Investment returns, inheritance, insurance, joint ventures and financial services can bring significant wealth. Your instincts for identifying undervalued assets are strong. The shadow is overleveraging — using other people's money requires matching responsibility.`,
        `Jupiter in the 9th house expands income through international channels, higher learning and philosophical authority. Publishing, academia, foreign trade, legal expertise and travel businesses can all bring expansion. Your credibility increases with distance — often more recognised abroad than locally. Long-distance financial ventures pay off.`,
        `Jupiter in the 10th house is excellent for career-based financial expansion. Professional recognition, promotions and public visibility increase income consistently over time. Leadership positions, executive roles and public-facing careers with prestige bring natural growth. Your professional reputation is a compounding financial asset.`,
        `Jupiter in the 11th house expands income through social networks, group ventures and forward-looking innovation. Technology, social enterprise, membership communities and collaborative projects can bring unusual financial scale. Your network is genuinely valuable — the right connection at the right moment can change your financial trajectory entirely.`,
        `Jupiter in the 12th house expands resources in hidden, spiritual or behind-the-scenes ways. Unexpected windfalls, institutional support, private patronage or spiritual entrepreneurship may feature. Your most lucrative work is often done quietly, away from public scrutiny. Trust in the unseen — and act on intuition.`,
      ],
      venusSignDescs: [
        `Venus in Aries attracts through boldness, pioneering energy and the courage to go first. You draw resources when you act decisively and independently. Clients and opportunities are attracted to your drive and willingness to take initiative that others hesitate to take.`,
        `Venus in Taurus is in her home sign — this is one of the strongest placements for attracting financial comfort and sensory abundance. You draw money, beauty and loyalty through patience, reliability and genuine quality. Your taste is your asset; your steadiness is your brand.`,
        `Venus in Gemini attracts through wit, versatility and the ability to connect ideas with people. You draw income through communication — the right word at the right moment opens financial doors. Multiple attractive opportunities often arrive simultaneously, requiring clear prioritisation.`,
        `Venus in Cancer attracts through emotional intelligence, care and the ability to make others feel genuinely safe. You draw resources through nurturing roles and by creating environments where people feel at home. Loyalty from clients and partners tends to be unusually strong.`,
        `Venus in Leo attracts through charisma, creativity and the generosity of spirit that makes others want to be in your orbit. You draw resources when you allow yourself to be fully visible — the more authentically you shine, the more financially rewarding your output tends to be.`,
        `Venus in Virgo attracts through precision, service and the quiet confidence of genuine mastery. You draw income through doing things exceptionally well and through solving problems others find too complex or tedious. Your value proposition is quality; your challenge is charging accordingly.`,
        `Venus in Libra is in her second home — you attract through harmony, elegance and the ability to make everyone feel heard and valued. Partnership-based income and collaborative ventures carry particular magnetism. Your aesthetic sense and fairness in negotiation are real financial assets.`,
        `Venus in Scorpio attracts through depth, intensity and the magnetism of genuine psychological power. You draw resources through transformation — helping others navigate change, access buried value, or face what they have been avoiding. Significant financial attraction arrives through trust-based intimacy.`,
        `Venus in Sagittarius attracts through optimism, vision and the generosity of someone who believes in abundance. You draw income through expanding horizons — teaching, publishing, international connection, or simply the infectious confidence that makes others want to invest in your ideas.`,
        `Venus in Capricorn attracts through competence, ambition and the quiet authority of someone who has earned their place. You draw resources through demonstrated achievement and long-term reliability. Your professional reputation is a compounding financial asset that grows more valuable with time.`,
        `Venus in Aquarius attracts through originality, intellectual independence and the vision to see what is coming before others do. You draw income through innovation and community — being ahead of the curve is your financial edge. Unconventional approaches to earning often yield surprising results.`,
        `Venus in Pisces attracts through compassion, creativity and a spiritual generosity that others find deeply moving. You draw resources through art, healing and the ability to express what others feel but cannot articulate. The creative and service-based economy is your natural financial home.`,
      ],
      jupiterSignDescs: [
        `Jupiter in Aries expands through courageous action and entrepreneurial initiative. Abundance grows fastest when you lead, start things and take the first risk. Your financial confidence is contagious and tends to attract the funding, partners and clients needed to sustain bold ventures.`,
        `Jupiter in Taurus expands through patience, quality and steady accumulation. Financial abundance grows when you invest in tangible assets, develop expertise over time, and trust the slow but compounding power of consistency. The earth under your feet is as valuable as the sky above.`,
        `Jupiter in Gemini expands through ideas, connections and the multiplication of communication channels. Abundance arrives through teaching, writing, networking and the ability to be in multiple conversations simultaneously. Your mind is genuinely your greatest wealth-generating instrument.`,
        `Jupiter in Cancer expands through emotional intelligence, family connections and the creation of genuinely nurturing environments. Real estate, food, hospitality and caregiving can be financially abundant arenas. Abundance flows most freely when you feel emotionally secure at the foundation.`,
        `Jupiter in Leo expands through self-expression, creative generosity and the courage to be fully visible. Abundance grows when you invest in your own brand, performance and creative output. Generosity — of spirit as much as money — tends to return multiplied.`,
        `Jupiter in Virgo expands through service, skill mastery and attention to detail that creates genuine value. Abundance grows through the steady improvement of craft and the satisfaction of work done excellently. Health and wellness industries, analytical tools and craft-based enterprises can be particularly fertile.`,
        `Jupiter in Libra expands through partnership, collaboration and the art of mutually beneficial negotiation. Business partnerships tend to outperform solo ventures. Financial abundance grows when you invest in relationships and create genuine win-win agreements. Justice and aesthetics can both be financially rewarding.`,
        `Jupiter in Scorpio expands through deep research, transformative investment and access to hidden resources. Other people's money, inheritance and high-conviction investment strategies are where abundance most naturally grows. Your instinct for identifying what is undervalued — in assets and in people — is a rare and powerful financial gift.`,
        `Jupiter in Sagittarius is in its home sign — one of the strongest placements for financial and philosophical expansion. Abundance grows through publishing, teaching, international ventures, higher education and any pursuit that genuinely broadens horizons. Your optimism, when grounded in action, is financially prophetic.`,
        `Jupiter in Capricorn expands through disciplined ambition and the patient construction of lasting structures. Abundance grows slowly and solidly — the compound interest of consistent effort. Executive roles, long-term investment strategies and businesses built on genuine expertise are where Jupiter in Capricorn pays off most handsomely.`,
        `Jupiter in Aquarius expands through innovation, community and the ability to see patterns before they become mainstream. Technology, social enterprise, network effects and collaborative investment models can generate unusual scale. Your financial abundance often arrives through doing something that does not yet have a category.`,
        `Jupiter in Pisces expands through compassion, spiritual service and the creative imagination that can turn vision into reality. Abundance flows through art, healing, music, therapy and the service of transcendent human needs. Intuition is a genuine financial instrument — when you trust it, it tends to pay.`,
      ],
      saturnSignDescs: [
        `Saturn in Aries builds wealth through disciplined courage — learning to act decisively without impulsiveness. The challenge is developing patience without losing initiative. Financial structures built on genuine entrepreneurial skill, once established, prove durable.`,
        `Saturn in Taurus builds wealth through the patient accumulation of tangible assets. This placement rewards frugality, long-term investment and the development of practical, marketable skills. Material security is built slowly but proves exceptionally solid.`,
        `Saturn in Gemini builds wealth through the mastery of communication, information management and structured thinking. The challenge is committing to one area of expertise long enough to become genuinely authoritative. Income from writing, teaching or consulting rewards sustained focus.`,
        `Saturn in Cancer builds wealth through disciplined emotional management and the careful stewardship of home and family resources. Real estate investment, conservative financial planning and family financial responsibility often feature prominently across the lifetime.`,
        `Saturn in Leo builds wealth through disciplined creative expression and authentic leadership. The ego must serve the work, not the other way around. Income from performance, management and creative enterprise rewards those who develop genuine craft rather than seeking quick recognition.`,
        `Saturn in Virgo builds wealth through meticulous service, health discipline and the mastery of technical skill. Precision, reliability and the willingness to do the detailed work others avoid are genuine financial assets. Long-term income from expertise-based services tends to grow steadily.`,
        `Saturn in Libra is exalted — this placement rewards fair, structured, long-term partnerships and disciplined negotiation. The most durable financial structures involve carefully constructed agreements and patient collaborative investment. Justice and equity are genuine wealth-building principles here.`,
        `Saturn in Scorpio builds wealth through disciplined management of shared resources, debt and investment. The capacity to face financial complexity without flinching — tax strategy, estate planning, debt restructuring — becomes a genuine financial superpower. Power used responsibly compounds over decades.`,
        `Saturn in Sagittarius builds wealth through the disciplined pursuit of genuine expertise, philosophical authority and cross-cultural knowledge. The challenge is committing to depth over breadth. Income from long-term educational authority, publishing and international expertise rewards sustained commitment.`,
        `Saturn in Capricorn is in its home sign — this is Saturn at its most powerful and productive. Wealth is built through exceptional discipline, structural ambition and the willingness to play a very long game. Executive capacity, institutional authority and legacy-focused investment reward those who stay the course.`,
        `Saturn in Aquarius builds wealth through disciplined innovation and the structural organisation of community resources. Technology businesses, social enterprises and network-based income models reward the patience to build genuine infrastructure. Freedom and structure are not opposites here — they are partners.`,
        `Saturn in Pisces builds wealth through disciplined creative practice, spiritual service and the management of compassionate resources. The challenge is maintaining practical financial structures alongside fluid creative and spiritual commitments. Consistent small actions — rather than sporadic large ones — build lasting income.`,
      ],
      planetH2Descs: {
        sun:     `The Sun in the 2nd house makes financial success central to your sense of identity and purpose. You shine when your work is recognised and rewarded. Income tied to your personal creative output or leadership tends to be most fulfilling.`,
        moon:    `The Moon in the 2nd house creates an emotional relationship with money — financial security and emotional security are deeply intertwined. Income may fluctuate with your moods and life cycles. Intuitive financial decisions often pay off when you learn to trust them.`,
        mercury: `Mercury in the 2nd house earns through communication, information and mental agility. Writing, consulting, teaching or any field that monetises ideas fits naturally. You think about money often and with detail — financial planning comes more naturally than to most.`,
        venus:   `Venus in the 2nd house is one of the most fortunate money placements. You attract resources with relative ease, often through charm, aesthetic sense and interpersonal skill. Beauty, luxury and relationship-based businesses can be highly lucrative.`,
        mars:    `Mars in the 2nd house drives ambitious earning through action and initiative. You can generate income quickly when motivated, but money can also leave quickly. Building financial reserves requires conscious effort against the impulse to spend or reinvest immediately.`,
        jupiter: `Jupiter in the 2nd house is the classic "luck in money" placement — resources tend to expand over time. Your optimism about finances is generally well-founded, though excess can erode gains. Generosity comes naturally; so does the need to ensure generosity is sustainable.`,
        saturn:  `Saturn in the 2nd house creates a serious, disciplined relationship with money. Income may build slowly in early life but grows substantially over time. Fear of scarcity can be a recurring theme — the work is to distinguish prudent caution from self-limiting belief.`,
        uranus:  `Uranus in the 2nd house creates an unpredictable financial profile: sudden windfalls and sudden losses are both possible. Income from unconventional sources, technology, or breakthrough ideas can be significant. Financial stability comes from building systems resilient to volatility.`,
        neptune: `Neptune in the 2nd house blurs the boundaries of financial reality. Idealism, generosity and creative talent can all bring income — but so can financial confusion or being taken advantage of. Clear budgets and trusted financial advisors provide grounding.`,
        pluto:   `Pluto in the 2nd house creates powerful, sometimes obsessive, themes around money and self-worth. Extreme gain or loss can mark turning points in life. Financial transformation — sometimes through crisis — builds a more authentic relationship with resources.`,
      },
      planetH8Descs: {
        sun:     `The Sun in the 8th house places transformation and shared resources at the core of your identity. You are drawn to investigate what others overlook — hidden value, buried assets, psychological patterns behind financial decisions.`,
        moon:    `The Moon in the 8th house makes emotional security deeply tied to what you hold in common with others. Joint finances carry strong emotional charge. Intuition about cycles of loss and renewal is finely tuned.`,
        mercury: `Mercury in the 8th house gives you a sharp investigative mind for research, tax strategy, inheritance law and the psychology of money. You think in depth about financial structures that others find intimidating.`,
        venus:   `Venus in the 8th house can attract significant resources through joint ventures, inheritance or partnership. You have natural magnetism for other people's assets and a gift for making shared financial arrangements feel fair and beautiful.`,
        mars:    `Mars in the 8th house drives action in shared financial territory — joint ventures, debt restructuring and estate matters. Conflicts over money can be intense. Your assertiveness in claiming what is yours can be a powerful asset when directed consciously.`,
        jupiter: `Jupiter in the 8th house is one of the most fortunate placements for inheritance, investment returns and shared financial expansion. Other people's money flows toward you with notable regularity. Estate planning and investment strategies deserve generous attention.`,
        saturn:  `Saturn in the 8th house creates discipline and sometimes delay around inheritance and joint finances. You approach shared resources cautiously and build strong legal frameworks around partnerships. The financial rewards are long-term and solid when patience is maintained.`,
        uranus:  `Uranus in the 8th house creates unexpected shifts in shared finances — sudden inheritances, abrupt changes in joint investments, or financial liberation through crisis. You benefit from maintaining financial independence even within partnerships.`,
        neptune: `Neptune in the 8th house creates idealism — and potential confusion — around shared finances. Clear legal agreements protect you in joint ventures. Spiritual or creative inheritances may prove as valuable as material ones.`,
        pluto:   `Pluto in the 8th house is the sign's natural ruler in its natural home — this is one of the most powerful financial placements possible. Complete financial transformation across the lifetime is probable. Power, obsession and regeneration are central themes in your shared-resource story.`,
      },
      strengthVenusDignity: (signName) => `Venus in ${signName} is in a position of dignity, meaning her attractive and value-creating powers operate at full strength. You have a natural magnetism for financial opportunity that others must work considerably harder to cultivate. Trust your instincts about what is genuinely beautiful and valuable — they are well-calibrated.`,
      strengthJupiterDignity: (signName) => `Jupiter in ${signName} is in a position of strength, amplifying the natural principle of abundance and expansion. Financial opportunities tend to arrive with notable regularity and scale. Your optimism about resources is generally well-founded — when you act on it with appropriate planning, the results tend to exceed expectations.`,
      strengthSaturnDignity: (signName) => `Saturn in ${signName} is in a position of dignity, meaning your capacity for financial discipline, structure and long-term planning operates at its best. You have a natural ability to build wealth that endures — not through luck, but through the kind of patient, methodical effort that most people find difficult to sustain.`,
      strengthVenusH2Title: 'Venus in the 2nd House — Natural Wealth Magnetism',
      strengthVenusH2Text: `Venus in your 2nd house places your attraction power directly in the house of personal resources. This is one of the most reliable placements for financial flow — you draw money, valuable objects and lucrative opportunities with relatively little resistance. Your financial instincts about beauty and value are particularly reliable.`,
      strengthVenusH8Title: 'Venus in the 8th House — Shared Resource Magnetism',
      strengthVenusH8Text: `Venus in your 8th house creates exceptional magnetism for shared financial resources — inheritance, investment returns, joint ventures and business partnerships. Others are drawn to pool their resources with you. This placement supports significant wealth accumulation through collaborative rather than purely individual effort.`,
      strengthJupiterH2Title: 'Jupiter in the 2nd House — Expanding Personal Resources',
      strengthJupiterH2Text: `Jupiter in the 2nd house is a classic abundance placement. Your personal income and resource base tends to grow over time with relative ease. The compounding effect of Jupiter here means that financial momentum, once started, tends to sustain itself. Managing the growth — rather than generating it — is your primary financial challenge.`,
      strengthJupiterH8Title: 'Jupiter in the 8th House — Investment Instinct',
      strengthJupiterH8Text: `Jupiter in the 8th house creates powerful instincts for identifying undervalued assets and generating returns through other people's money. Inheritance, investment, insurance and joint ventures often bring outsized gains. Your ability to find financial opportunity in situations others find too complex or risky is a genuine and rare strength.`,
      strengthVJTitle: (symbol) => `Venus ${symbol} Jupiter — Attraction Meets Expansion`,
      strengthVJText: `The harmonious connection between your Venus and Jupiter creates a natural flow between attracting resources and expanding them. You can earn with charm and grow with confidence. This aspect supports financial momentum — when you act on genuine desire AND expansive vision simultaneously, the results tend to significantly outperform either quality alone.`,
      strengthJSTitle: 'Jupiter △/✶ Saturn — Growth with Structure',
      strengthJSText: `The harmonious aspect between Jupiter and Saturn in your chart is one of the most practically valuable financial indicators available. You have both the vision to see expansive opportunities and the discipline to execute on them sustainably. This combination — rare in its coherent form — produces financial results that are both ambitious and lasting.`,
      strengthH2Default: (signName) => `The clarity of ${signName} energy on your 2nd house cusp gives you a recognisable and authentic money-making style. You know instinctively what kinds of work generate income for you — and when you honour that instinct rather than trying to earn in ways that don't fit your nature, results improve significantly.`,
      strengthH8Default: (signName) => `The ${signName} quality of your 8th house gives you a defined approach to shared resources and financial transformation. Rather than avoiding the complex territory of joint finances, investment and inherited patterns, you can engage it with the characteristic strengths of this sign.`,
      challengeVenusDetriment: (signName) => `Venus in ${signName} operates outside her natural comfort zone, meaning the principle of effortless attraction needs more deliberate activation. Financial magnetism is still entirely available — but it requires you to understand how your specific Venus energy works and where it is genuinely attractive, rather than assuming it will operate automatically.`,
      challengeJupiterDetriment: (signName) => `Jupiter in ${signName} must work harder to generate the effortless expansion associated with this planet. Financial growth is absolutely achievable, but it requires more planning, discipline and realistic expectation-setting than Jupiter's usual optimism suggests. The gift is that growth, when it comes, is well-earned and well-understood.`,
      challengeSaturnDetriment: (signName) => `Saturn in ${signName} creates areas where financial discipline and long-term structure do not come naturally. Building consistent savings habits, maintaining financial boundaries in relationships, or following through on long-term investment plans may require more conscious effort than for others. These are learnable skills — and mastering them here builds unusually strong financial character.`,
      challengeVSTense: (symbol) => `The tension between Venus and Saturn in your chart can create a persistent internal conflict between what you desire (Venus) and what you believe you deserve or can realistically have (Saturn). This may manifest as underpricing your work, difficulty receiving financial generosity, or oscillating between indulgence and excessive restriction. Recognising this pattern is the first step to integrating it into a more balanced financial approach.`,
      challengeVJTense: (symbol) => `The tense aspect between Venus and Jupiter can create a tendency toward financial excess — spending more than is sustainable, overestimating income, or conflating desire with need. Alternatively, it may create conflict between what you value personally and what seems most financially expansive. Bringing conscious discernment to both pleasure and opportunity prevents the asset from becoming a liability.`,
      challengeJSTense: (symbol) => `The tension between Jupiter and Saturn can create a financial pattern of expansion followed by contraction — periods of confident growth alternating with periods of restriction or self-doubt. Building a financial approach that incorporates both ambitious planning (Jupiter) and realistic constraints (Saturn) breaks the cycle and creates more sustainable wealth accumulation over time.`,
      challengeAxis: (h2Sign, h8Sign) => `The axis between your 2nd house (${h2Sign}) and 8th house (${h8Sign}) represents a fundamental polarity in your financial life: what is yours alone versus what is shared or transformed through others. Developing fluency in both modes — earning independently AND building through shared resources — is the central financial integration challenge your chart presents.`,
      challengeSelfWorth: `The 2nd house governs not just money but the sense of worth that underlies it. Patterns of undercharging, overgiving, or difficulty claiming financial recognition often trace back to 2nd house beliefs formed in early life. Separating your sense of personal value from your current financial position — understanding that worth is inherent, not earned — is foundational financial inner work.`,
      adviceItems: [
        {
          title: (rulerName, houseNum, ordHouse) => `Lead with ${rulerName} — Your Money Planet`,
          text: (rulerName, houseNum, ordHouse) => `Your 2nd house ruler is ${rulerName}, placed in your ${houseNum}${ordHouse} house. Track the transits of ${rulerName} carefully — when it is well-aspected by Jupiter or Venus in the sky, these are your natural windows for financial initiative. When it is under Saturn or Pluto pressure, consolidate and avoid major financial commitments.`,
        },
        {
          title: () => `Use Jupiter Cycles for Expansion`,
          text: () => `Jupiter takes approximately 12 years to return to its natal position. When Jupiter transits your 2nd or 8th house, these are your strongest financial expansion windows — typically lasting 12-13 months. Plan major income initiatives, investment commitments and wealth-building launches to coincide with these periods when possible.`,
        },
        {
          title: () => `Respect Saturn Cycles for Foundation Work`,
          text: () => `When Saturn transits your 2nd or 8th house, the priority shifts from expansion to consolidation and structural repair. These periods — lasting about 2-3 years — are best used for debt reduction, financial planning, creating clearer legal structures around partnerships, and building reserves rather than taking speculative positions.`,
        },
        {
          title: (rulerName, houseNum, ordHouse, venusSign) => `Venus Cycles for Income Negotiation`,
          text: (rulerName, houseNum, ordHouse, venusSign) => `Venus returns to its natal sign roughly every 12 months. When Venus is in ${venusSign}, you are operating with heightened attraction power aligned with your natal configuration. This is an ideal time for salary negotiations, launching income-generating projects, client acquisition and any financial move that benefits from your personal magnetism being at its most natural.`,
        },
        {
          title: (rulerName, houseNum, ordHouse, venusSign, h2Sign) => `Align Spending with Values`,
          text: (rulerName, houseNum, ordHouse, venusSign, h2Sign) => `With ${h2Sign} on your 2nd house, your deepest financial satisfaction comes when spending aligns with the genuine values of this sign. Purchases that contradict those values drain energy even when affordable; spending aligned with them feels genuinely nourishing even when it stretches the budget. Periodic reviews of where money is going — and whether it reflects what you actually value — prevent long-term financial drift.`,
        },
        {
          title: () => `Build Both Houses of Your Financial Life`,
          text: () => `The 2nd-8th house axis asks you to develop both your independent earning capacity (2nd) and your ability to grow wealth through shared structures (8th). Many people over-develop one at the expense of the other — either being financially independent but isolated, or entirely reliant on partners and institutions. Balance between the two creates the most resilient financial foundation.`,
        },
      ],
      aspectGeneric: {
        'venus-jupiter': {
          conjunction: `Venus conjunct Jupiter is one of the most fortunate financial aspects in the chart. Attraction and expansion work together seamlessly — you naturally draw abundance and have the optimism to act on opportunities. The caution is excess: this aspect can lead to overspending or overconfidence.`,
          trine: `Venus trine Jupiter creates an easy flow between attraction and expansion. Financial opportunities arrive with relative ease and your values are aligned with growth. Generosity tends to return multiplied. Maintaining practical discipline ensures this natural gift compounds rather than evaporates.`,
          sextile: `Venus sextile Jupiter offers opportunity to align your attractive qualities with financial expansion. You have the ingredients for financial flow — the work is to consciously activate the connection through consistent action in areas where beauty meets opportunity.`,
          square: `Venus square Jupiter creates tension between what you desire (Venus) and what you believe is possible (Jupiter). Excess, overspending or value conflicts around money may require attention. The gift of this aspect is learning that true abundance requires both genuine desire and honest assessment.`,
          opposition: `Venus opposite Jupiter asks you to balance personal pleasure with the bigger picture of expansion. Others may bring financial abundance into your life, or you may project your own financial optimism onto partners. Integration means owning both the desire and the expansive vision.`,
        },
        'venus-saturn': {
          conjunction: `Venus conjunct Saturn brings discipline and structure to what you attract and value. Financial relationships and income streams tend to be serious, long-term and carefully built. You may attract older or more established financial partners. The challenge is allowing yourself to receive pleasure and abundance without excessive self-restriction.`,
          trine: `Venus trine Saturn creates a harmonious balance between attraction and discipline. You can build financially sustainable relationships and income streams with patient elegance. What you attract, you also tend to keep — your financial structures are both appealing and durable.`,
          sextile: `Venus sextile Saturn offers the opportunity to build genuinely sustainable income and financial relationships. Your sense of beauty and value benefits from practical grounding, and your disciplined approach can be made more attractive with conscious effort.`,
          square: `Venus square Saturn creates tension between your desire for pleasure and beauty (Venus) and your instinct for restriction and control (Saturn). Financial relationships may carry themes of scarcity or over-discipline. The integration is learning that you can build lasting structures without denying yourself joy.`,
          opposition: `Venus opposite Saturn asks you to balance receptivity with responsibility. Partners may bring either abundance or financial burden — discernment in financial partnerships is essential. When you own both your attractiveness and your disciplined seriousness, the opposition becomes productive.`,
        },
        'jupiter-saturn': {
          conjunction: `Jupiter conjunct Saturn is the "social planets conjunction" — a major generational marker that creates a powerful tension between expansion and discipline within you. At its best, this produces the rare combination of ambitious vision AND practical execution. Financial decisions benefit from this built-in check-and-balance.`,
          trine: `Jupiter trine Saturn creates harmonious cooperation between expansion and discipline. You can grow financially without losing stability — your optimism is tempered by realism and your structures are ambitious enough to compound. This aspect favours long-term investment and patient entrepreneurship.`,
          sextile: `Jupiter sextile Saturn offers the opportunity to align growth with structure. When you act on this combination consciously — planning expansions with realistic timelines, building structures flexible enough to grow — the financial results can be steadily impressive.`,
          square: `Jupiter square Saturn creates productive but demanding tension between your impulse to expand and your instinct to restrict. Boom-and-bust financial cycles are possible until the two principles learn to inform rather than override each other. Structured optimism is the financial superpower this aspect is trying to build.`,
          opposition: `Jupiter opposite Saturn asks you to balance faith with realism — often by externalising one principle while owning the other. You may attract partners who embody either unchecked optimism or excessive caution. Owning both extremes internally creates the financial balance that generates lasting wealth.`,
        },
      },
    },
    spiritual: {
      coverTitle: 'Spiritual & Karmic Map',
      coverSubtitle: "Your soul's journey revealed",
      overviewTitle: "Overview — Your Soul's Journey",
      overviewText: `Every natal chart is a map of the soul's current curriculum — the qualities it has come to develop, the wounds it has carried from the deep past, and the evolutionary direction it is reaching toward. This report focuses on the spiritual and karmic dimension of your chart: not prediction, but the deeper story of who you are across time.\n\nThe key indicators explored here are: the North and South Nodes (your evolutionary axis), House 12 (the realm of the unconscious and transcendent), Neptune (the planet of spiritual dissolution and intuition), Chiron (the sacred wound that becomes your greatest gift), Pluto (the agent of deep transformation and karmic clearing), and Saturn (the keeper of ancestral patterns and karmic lessons).\n\nTogether, these placements paint a portrait of what your soul brought into this life, what it is working to release, and where it is growing — in this incarnation, and perhaps beyond it.`,
      blueprintTitle: 'Your Spiritual Blueprint at a Glance',
      nnTitle: (signName) => `☊ North Node in ${signName} — Where Your Soul Is Heading`,
      nnIntro: (signName, houseNum) => `The North Node — called the Dragon's Head in traditional astrology — is not a planet but a mathematical point where the Moon's path crosses the ecliptic. It represents the soul's evolutionary direction: the qualities, experiences, and ways of being that represent genuine growth in this lifetime. Moving toward the North Node often feels unfamiliar, uncomfortable, even threatening to the identity — because it is genuinely new territory for the soul.\n\nYour North Node in ${signName} in House ${houseNum} points toward a specific quality of experience that your soul is reaching to embody.`,
      nnDirectionTitle: (signName) => `The Evolutionary Direction: ${signName}`,
      nnHouseTitle: (houseNum) => `House ${houseNum} — The Arena of Soul Growth`,
      nnHowToTitle: 'How to Work with Your North Node',
      nnHowToText: `The North Node does not require you to abandon your past — only to stop living there exclusively. Move toward its qualities in small, concrete steps. Notice when you are avoiding it: that discomfort is the signal you are at the growing edge. Over time, what felt foreign becomes natural, and what was natural deepens into wisdom rather than remaining a refuge from growth.`,
      snTitle: (signName) => `☋ South Node in ${signName} — What You've Already Mastered`,
      snIntro: `The South Node — the Dragon's Tail — represents the soul's accumulated past: the gifts already earned, the skills already developed, the patterns already deeply grooved. It shows what comes naturally, almost too naturally — the place where the soul retreats when growth feels threatening. The South Node is not bad; it is the familiar. The spiritual work is to use its resources consciously rather than being unconsciously ruled by them.`,
      snFamiliarTitle: (signName, houseNum) => `South Node in ${signName} in House ${houseNum} — The Familiar Territory`,
      snGiftTrapTitle: 'The Gift and the Trap of the South Node',
      snGiftTrapText: `The South Node is not something to overcome or abandon — it is the foundation. Its gifts are real. The danger lies in using those gifts as a substitute for growth rather than as a springboard toward it. When the familiar comfort of the South Node becomes a hiding place from the North Node's call, the soul stagnates. The path is to bring South Node gifts as resources into North Node territory — not to leave them behind, but to stop letting them be the whole story.`,
      house12Title: (signName) => `✦ House 12 in ${signName} — Your Connection to the Transcendent`,
      house12Intro: `The 12th House is the most mystical territory in the natal chart — the realm of the unconscious, karma accumulated before birth, hidden spiritual resources, and the direct interface between the individual soul and the vast transpersonal field. It is associated with solitude, dreams, sacrifice, hidden enemies (most often our own unacknowledged patterns), and the capacity for transcendence.\n\nIn spiritual terms, the 12th House represents both the most powerful resource and the most significant blind spot. What lives here operates below ordinary awareness — surfacing in dreams, in states of deep meditation, in the felt sense of something larger working through us.`,
      house12QualityTitle: (signName) => `House 12 in ${signName} — The Quality of the Hidden Realm`,
      planetsIn12Title: (names) => `Planets in House 12: ${names}`,
      planetsIn12Intro: `Having planets in the 12th House amplifies the spiritual intensity of this realm considerably. These planets operate as hidden powers — energies that are real and significant but not fully visible to the ordinary ego. They often emerge in dreams, in creative work, in states of solitude, or in moments of genuine spiritual encounter. Working consciously with 12th House planets — through meditation, depth therapy, or contemplative practice — transforms what might otherwise be a source of unconscious self-sabotage into one of your most profound spiritual resources.`,
      neptuneTitle: (signName) => `♆ Neptune in ${signName} — Where You Dissolve Boundaries`,
      neptuneIntro: `Neptune is the planet of mysticism, compassion, dissolution, and the longing for union with something greater than the individual self. Where Neptune touches the chart, the boundaries of the ego become permeable — which is simultaneously the greatest spiritual gift and the most challenging vulnerability. Neptune dissolves; it does not define. Its work is to soften the hard edges of the separate self until the underlying unity becomes perceptible.`,
      neptuneGenTitle: (signName) => `Neptune in ${signName} — The Generational Spiritual Theme`,
      neptuneGenText: (signName) => `Neptune moves slowly — it spends approximately 14 years in each sign, meaning its sign placement describes a generational spiritual current more than a purely individual one. In ${signName}, Neptune has shaped your entire generation's relationship with the spiritual, the imaginal, and the transcendent. You carry this current within you as part of your deepest spiritual inheritance.`,
      neptuneHouseTitle: (houseNum) => `Neptune in House ${houseNum} — Where the Veil is Thinnest`,
      neptuneAspectsTitle: 'Neptune Aspects — Where Dissolution Meets Other Energies',
      neptuneNoAspects: `Neptune forms no major aspects in your chart — its influence operates more quietly, through its house placement and sign, rather than through dynamic tension with other planets. This can make the Neptunian gifts subtler and the blind spots harder to identify.`,
      chironTitle: (signName) => `⚷ Chiron in ${signName} — Your Sacred Wound and Healing Gift`,
      chironIntro: `Chiron — the Wounded Healer — represents the deepest core wound in the chart: the place where you were hurt in ways that didn't fully heal, and precisely because of that, became your greatest source of wisdom and healing capacity. The myth of Chiron is exact: he was the wisest healer of the ancient world, yet could not heal himself. His wound was his gift.\n\nThe Chiron wound is not something to fix and move past. It is something to inhabit with increasing depth and compassion — and in doing so, to transform into the medicine that only you can offer. The wound and the gift are inseparable.`,
      chironSignTitle: (signName) => `Chiron in ${signName} — The Quality of the Wound`,
      chironHouseTitle: (houseNum) => `Chiron in House ${houseNum} — Where the Wound Lives`,
      chironPathTitle: 'The Path from Wound to Gift',
      chironPathText: (houseNum, signName) => `The transformation of Chiron happens in stages. First comes the recognition of the wound — naming it without drama or self-pity, just honest acknowledgment. Then comes the grieving: allowing the full weight of what was painful or missing to be felt, perhaps for the first time. Then — and only then — comes the integration: discovering that the sensitivity born from this wound is precisely what allows you to reach others in the same pain. You become a healer not despite your wound, but through it. The place of greatest vulnerability becomes the place of greatest gift.\n\nWith Chiron in House ${houseNum} in ${signName}, your particular gift to the world is rooted in the territory of this placement. Those who most need what you have to offer will often be those who carry the same wound — and your presence alone, your having inhabited this pain and not been destroyed by it, will be the most healing thing you can offer.`,
      plutoTitle: (signName) => `♇ Pluto in ${signName} — Where Deep Transformation Operates`,
      plutoIntro: `Pluto is the planet of death, rebirth, and radical transformation. In the spiritual map, it represents the soul's work of karmically clearing what is no longer alive — stripping away the false, the unconsciously inherited, and the outgrown, until what remains is unquestionably real. Pluto does not do this gently. Its method is the underworld: descent, disorientation, and eventual emergence as someone different from who entered.\n\nWhere Pluto sits in the chart is where the soul has chosen, in this incarnation, to undergo its most profound transformation. This is simultaneously where the greatest power lies and where the most unconscious patterns operate.`,
      plutoGenTitle: (signName) => `Pluto in ${signName} — Generational Karmic Signature`,
      plutoGenText: (signName) => `Like Neptune, Pluto's sign placement is generational — it describes a collective karmic current that your entire generation carries. In ${signName}, the soul's collective work involves transforming the shadow aspects of this sign's energy — bringing what has been distorted or suppressed in this archetypal field into consciousness and wholeness. You carry this collective transformation as a personal imperative.`,
      plutoHouseTitle: (houseNum) => `Pluto in House ${houseNum} — The Site of Deep Transformation`,
      plutoConsciousTitle: 'Working with Pluto Consciously',
      plutoConsciousText: `The difference between Pluto as destroyer and Pluto as transformer is consciousness. When Plutonian energy is resisted — when the soul fights to keep what is dying, to hold on to power that is no longer truly ours, to maintain control over what is ready to change — destruction follows. When Plutonian energy is engaged consciously — with willingness to release, with curiosity about what is emerging, with trust in the process of death and rebirth — it becomes the most profound transformative force available.\n\nThe spiritual practice with Pluto is developing the capacity to let go. Not passively, but with full presence — as a conscious act of trust in the larger intelligence that governs these cycles.`,
      saturnKarmicTitle: (signName) => `♄ Saturn in ${signName} — Karmic Lessons and Ancestral Patterns`,
      saturnKarmicIntro: `Saturn, in the spiritual map, is the keeper of karmic time — the planet that tracks what the soul has carried across incarnations and what it has come to resolve in this one. Saturn's placement shows where the soul meets its most demanding teacher: where growth is slow, where effort is required, where the patterns of ancestors and past lives exert their strongest pull.\n\nSaturn is not a punishing force. It is a faithful one. What it demands, it also ultimately rewards — with the most durable kind of growth: earned wisdom, hard-won maturity, and a character forged in genuine engagement with difficulty.`,
      saturnKarmicSignTitle: (signName) => `Saturn in ${signName} — The Karmic Signature`,
      saturnKarmicHouseTitle: (houseNum) => `Saturn in House ${houseNum} — Where the Karmic Work Is Concentrated`,
      saturnAncestralTitle: 'The Ancestral Dimension of Saturn',
      saturnAncestralText: `Saturn carries not only personal karma but ancestral karma — the unresolved material of the family lineage. The patterns of your ancestors that were never consciously worked through have been passed forward — not as punishment, but as an invitation. You are the one in your lineage who has the consciousness to do something different with this material.\n\nThe spiritual work with Saturn is to take on this inheritance with awareness: to fulfill genuine obligations while releasing the ones that are not yours to carry, and to build structures in your life that embody the maturity your lineage has been reaching toward.`,
      spiritualAspectsTitle: '✦ Spiritual Aspects — Neptune, Nodes, and the Transpersonal',
      spiritualAspectsIntro: `Certain aspects in the natal chart carry particular spiritual significance: aspects between the outer planets and the personal planets, aspects involving the Nodes (especially to Saturn, Neptune, Pluto, and Chiron), and aspects that bridge the personal and transpersonal. These are the points where the soul's larger story intersects most directly with daily lived experience.`,
      spiritualAspectsNone: `Your chart has few major aspects between the transpersonal planets and your personal planets. This suggests that the spiritual dimension of your chart operates more independently — your personal life and your spiritual life may feel like separate domains, or the connection between them may be less immediately visible. The invitation is to consciously create bridges between your daily experience and the deeper currents of meaning that your chart reveals.`,
      pastLifeTitle: '✦ Past Life Indicators — A Synthesis',
      pastLifeIntro: `Several elements of the natal chart are traditionally read as indicators of past life experience: the South Node (accumulated patterns from prior incarnations), 12th House planets (material carried from before birth), Saturn's challenges (karmic debts and obligations), Chiron (wounds that predate this lifetime), and the Moon's South Node aspects (emotional patterns deeply embedded in the soul's history).\n\nThis synthesis does not claim literal memory of specific past lives — it offers a symbolic portrait of the soul's history as your chart encodes it.`,
      pastLifeStoryTitle: "The Story Your Chart Tells About Your Soul's Past",
      pastLifeStory: (snSign, snHouse, chironSign, chironHouse, saturnSign, saturnHouse, planetsIn12, h12Sign) =>
        `Your South Node in ${snSign} in House ${snHouse} suggests that in previous incarnations, your soul developed deep expertise in the qualities of ${snSign} — and spent significant time in the themes of House ${snHouse}. These are the patterns that feel most native, most automatic, most like "just how I am."\n\nYour Chiron in ${chironSign} in House ${chironHouse} suggests a wound that may predate this lifetime — a pain carried from circumstances that are not entirely explained by your current biography. This wound has a healing purpose in this incarnation.\n\nYour Saturn in ${saturnSign} in House ${saturnHouse} points to karmic obligations and structures from the past that this lifetime is called to work with, fulfill, or consciously transform. There may be a sense of having been here before in this particular struggle — because in a meaningful sense, you have.\n\n${planetsIn12.length > 0 ? `The ${planetsIn12.join(', ')} in your 12th House carry material from before birth — energies that shaped you before you had conscious access to them. Working with these planets through introspection and spiritual practice is part of the soul's current work.` : `Your 12th House, while empty of planets, still carries the sign of ${h12Sign} — suggesting that the karmic material of this sign operates quietly but consistently in the depths of your psyche.`}`,
      pastLifeCompletingTitle: 'What the Soul Is Completing in This Lifetime',
      pastLifeCompletingText: (snSign, nnSign) => `The karmic work of this incarnation centers on the axis between ${snSign} and ${nnSign} — releasing the over-reliance on the familiar and moving toward the evolutionary call. The Chiron work involves finding the medicine in the wound. The Saturn work involves assuming mature responsibility for what your lineage has carried. Together, these create a coherent soul curriculum — one that, when engaged with consciously, transforms the accumulated weight of the past into earned wisdom available to the future.`,
      practicesTitle: '✦ Spiritual Practices Recommended for Your Chart',
      practicesIntro: `Spiritual practice is not generic — the most effective practices are those attuned to the specific nature of the soul. Your chart reveals where the spiritual access points are, what kind of discipline your soul needs, and which practices will open the most direct path to the sacred for you specifically. The recommendations below are derived from your key spiritual placements.`,
      universalPracticesTitle: 'Universal Practices for the Spiritual Chart',
      conclusionTitle: '✦ Conclusion — Integrating the Spiritual Path',
      conclusion: (profileName, nnSign, nnHouse, snSign, snHouse, chironSign, chironHouse, neptuneHouse, plutoHouse, saturnSign, saturnHouse) =>
        `${profileName}, your spiritual chart tells a coherent story — one that spans more than a single lifetime and reaches forward into possibilities that are genuinely yours to inhabit.\n\nThe North Node in ${nnSign} in House ${nnHouse} names the direction: the evolutionary frontier, the territory of genuine soul growth. The South Node in ${snSign} in House ${snHouse} names the foundation: what you bring, what you know, what must be offered forward rather than clung to.\n\nChiron in ${chironSign} in House ${chironHouse} marks the sacred wound — the place of deepest pain that becomes, when inhabited with courage and compassion, the source of your most authentic healing gift. You cannot offer what you have not lived. The wound is the credential.\n\nNeptune in House ${neptuneHouse} marks where the veil is thinnest — where spiritual experience comes most naturally, where the boundary between the individual and the universal is most permeable. This is your direct spiritual access point.\n\nPluto in House ${plutoHouse} marks where transformation operates most deeply — the territory of death and rebirth that the soul has chosen as its central work in this incarnation. To engage this consciously is to become, gradually, unafraid of what you cannot control.\n\nSaturn in ${saturnSign} in House ${saturnHouse} marks the karmic obligation — what is owed, what must be built, what the ancestors have been waiting for someone in the lineage to finally resolve. You are that person.\n\nThe spiritual path is not a single road. It is the whole life, entered with awareness. Every difficulty is a teaching. Every wound is a doorway. Every moment of genuine surrender is a step further into the truth of who you are — which is already, always, more than the chart can contain.`,
      quote: '"The wound is the place where the Light enters you." — Rumi',
      northNodeInHouse: [
        `Your soul is called to develop a strong, authentic sense of self in this lifetime. Past lives may have been characterized by self-sacrifice and living through others. Now the evolutionary imperative is clear: step forward as a distinct individual. Embrace your own needs, desires, and identity without guilt. The more you courageously inhabit your own presence, the more you fulfill your soul's purpose.`,
        `Your evolutionary path leads toward building genuine self-worth and material security from within. In past lives, you may have relied too heavily on shared resources or others' values. This lifetime calls you to develop your own talents, earn your own way, and ground your value in what you alone can offer the world. Stability earned by your own hands becomes sacred.`,
        `Your soul is growing toward clear communication, intellectual curiosity, and engagement with your immediate environment. The temptation to retreat into grand philosophies or distant visions (South Node in 9th) must give way to curiosity about what is right in front of you — conversations, learning, writing, local community. Truth lives in the details of daily exchange.`,
        `Your evolutionary direction is inward and foundational — toward creating emotional security, honoring your roots, and building a true sense of home. Career ambition and public identity (South Node in 10th) are familiar, perhaps too comfortable. The soul's growth now lies in vulnerability, family, and inner belonging rather than outer achievement.`,
        `Your soul is called toward creative expression, joy, and the courage to let your inner light shine. Collective causes and group belonging (South Node in 11th) have been your comfort zone across lifetimes. Now evolution demands the personal: your unique creative gift, romantic love, and the willingness to be seen for who you are specifically — not just as part of a movement.`,
        `Your evolutionary path is one of devoted service, craft mastery, and integration of body and spirit. The soul is learning that transcendence is not found by escaping daily life (South Node in 12th) but by bringing full presence and care to it. Work, health practices, and humble service become the spiritual path itself.`,
        `Your soul grows through deep commitment to partnership and the mirror of the other. The independent, self-reliant patterns of past lives (South Node in 1st) are no longer sufficient. Evolution now requires learning to truly see another person, to negotiate, to commit, and to discover who you are in genuine relationship. The other is your teacher.`,
        `Your evolutionary direction is toward deep transformation, intimacy, and the mysteries of death and rebirth. Comfort with what is simple and tangible (South Node in 2nd) must expand into willingness to merge, to release, and to be changed by what you cannot control. The soul grows through crisis, inheritance, and profound emotional nakedness.`,
        `Your soul is expanding toward higher wisdom, philosophical understanding, and direct experience of the sacred. The small, the local, the merely factual (South Node in 3rd) can no longer contain your spirit. You are called to seek meaning beyond information — through travel, study, spiritual practice, or the development of a genuine worldview that guides your life.`,
        `Your evolutionary purpose involves stepping into a public role, claiming authority, and contributing something lasting to the world. The private, domestic, and family-oriented patterns of past lives (South Node in 4th) are well-developed. Now the soul's growth requires visible leadership and the courage to be known for what you stand for.`,
        `Your soul is called toward collective vision, friendship, and contributing to a larger community. The creative, ego-centered patterns of past lives (South Node in 5th) must open into something bigger than personal expression. You grow by aligning your gifts with a cause, finding your tribe, and dreaming a future that includes more than just yourself.`,
        `Your evolutionary direction is inward and transcendent — toward spiritual surrender, compassion without bounds, and the dissolution of the separate self into something greater. The analytical, service-oriented habits of past lives (South Node in 6th) have been useful, but now the soul requires silence, contemplation, and direct encounter with the sacred mystery.`,
      ],
      northNodeInSign: [
        `With North Node in Aries, your soul's growth requires developing courage, directness, and the willingness to act without waiting for consensus. You are learning to be the initiator — to trust your instincts and step forward even when uncertain. The evolutionary call is toward bold, unapologetic selfhood.`,
        `With North Node in Taurus, your evolution involves slowing down, building tangible security, and finding the sacred in simple pleasure. The soul is learning patience, embodiment, and the wisdom of what endures. Groundedness is spiritual practice.`,
        `With North Node in Gemini, your growth calls you toward intellectual curiosity, genuine communication, and comfort with life's inherent ambiguity. The soul is learning that not every question needs a final answer — that the exchange itself is the point. Stay curious, stay light.`,
        `With North Node in Cancer, your evolutionary path leads toward emotional vulnerability, nurturing, and the creation of genuine belonging. The soul is learning to feel deeply without apology and to create safety — for yourself first, then for others.`,
        `With North Node in Leo, your soul is called to creative self-expression, heartfelt leadership, and the courage to be seen. You are learning that your individuality is not a burden but a gift — and that the world genuinely needs your particular light.`,
        `With North Node in Virgo, your growth involves developing discernment, practical skill, and devoted service. The soul learns that the sacred lives in the details — in getting things right, in showing up consistently, in the humble miracle of competent care.`,
        `With North Node in Libra, your evolution calls you toward genuine partnership, fairness, and the art of conscious relationship. The soul is learning to balance its own needs with those of others — and to find meaning in the space between two people.`,
        `With North Node in Scorpio, your soul's growth requires depth, transformation, and the willingness to lose what no longer serves in order to be reborn. You are learning to trust the process of death and renewal — and to find power in surrender rather than in control.`,
        `With North Node in Sagittarius, your evolutionary direction is toward faith, philosophical expansion, and direct experience of meaning. The soul is learning to trust a larger intelligence — to move beyond facts into the wisdom that transcends them.`,
        `With North Node in Capricorn, your growth calls you toward responsibility, mature authority, and the discipline of building something that lasts. The soul is learning that structure is not the enemy of freedom — it is the ground that makes real freedom possible.`,
        `With North Node in Aquarius, your evolution involves contributing to something larger than yourself — community, collective vision, and the future of humanity. The soul is learning to hold a vision of what could be, and to work with others to bring it into being.`,
        `With North Node in Pisces, your soul's evolutionary direction is toward surrender, compassion, and mystical union. You are learning to dissolve the boundaries of the separate self into something greater — through art, spiritual practice, service, or the simple act of being fully present with another's suffering.`,
      ],
      saturnKarmic: [
        `Saturn in Aries carries karmic lessons around identity, courage, and the right to initiate. The soul has accumulated patterns of either forcing itself forward without care for others, or holding back its own will entirely. The integration required is disciplined courage — acting from genuine inner authority, not from fear or aggression.`,
        `Saturn in Taurus carries karmic patterns around material security, self-worth, and resistance to change. The soul must learn to build lasting value without becoming enslaved to it — to enjoy what is here without clinging when it transforms.`,
        `Saturn in Gemini carries karmic lessons around communication, truthfulness, and the integrity of the mind. There may be ancestral patterns of deception, self-censorship, or intellectual dishonesty to work through. The path is toward words that match inner reality.`,
        `Saturn in Cancer carries deep ancestral patterning around emotional safety, family, and the nature of care. There is often a lineage wound — something unresolved in the family system that the soul has taken on to heal. The work is learning to receive nurturing as well as to give it.`,
        `Saturn in Leo carries karmic material around creative expression, recognition, and the fear of being seen. The soul has either been punished for its light in past patterns, or has over-expressed at the expense of others. The path is toward genuine, humble radiance.`,
        `Saturn in Virgo carries karmic themes of service, perfectionism, and the relationship between the body and the spirit. The soul may have accumulated shame around imperfection or health. Integration means offering devoted service from wholeness, not from fear of failure.`,
        `Saturn in Libra carries karmic patterns in relationship — unresolved contracts, injustices, and karmic obligations between souls. The soul is learning what true fairness and mature partnership require, beyond codependence or isolation.`,
        `Saturn in Scorpio carries some of the heaviest karmic material: issues of power, betrayal, sexuality, and psychic inheritance. The soul is working through generations of unexpressed shadow. The path is toward radical honesty and the responsible use of deep personal power.`,
        `Saturn in Sagittarius carries karmic themes around belief, truth, and the abuse or abandonment of spiritual authority. The soul may have been a teacher who misled, or a student who was betrayed by their guide. The integration is toward earned wisdom — truth that has been tested, not merely proclaimed.`,
        `Saturn in Capricorn (its domicile) carries the full weight of karmic structure — ancestral obligations, societal expectations, and the burden of legacy. The soul must learn to honor duty without being crushed by it, and to build a life of integrity rather than mere appearance.`,
        `Saturn in Aquarius carries karmic patterns around group belonging, social responsibility, and the tension between individual freedom and collective obligation. The soul is working through lifetimes of either rigid conformity or rebellious isolation — seeking the middle path of authentic participation.`,
        `Saturn in Pisces carries karmic themes of spiritual discipline versus spiritual escapism. The soul has encountered the allure of dissolution — of merging with the infinite in ways that bypassed earthly responsibility. The integration requires bringing the spiritual firmly into incarnation.`,
      ],
      neptuneSpiritual: [
        `Neptune in the 1st House infuses your entire identity with a spiritual, empathic quality. You are a channel more than a fixed self — boundaries between you and others are naturally thin. Your spiritual gift is the ability to embody compassion and divine sensitivity. The challenge is maintaining enough ego structure to function without losing yourself.`,
        `Neptune in the 2nd House dissolves the boundary between the material and the sacred. Value, for you, is not merely financial — it is intrinsic, spiritual, ineffable. You may struggle with conventional money management, but you have access to a deep understanding of what truly matters. The spiritual practice here is radical trust in abundance.`,
        `Neptune in the 3rd House makes communication an act of mystical transmission. You speak and write in a way that touches something beyond the literal. The spiritual challenge is discerning between genuine intuitive knowing and wishful thinking in your daily mental life.`,
        `Neptune in the 4th House places the spiritual at the foundation of your being — in the family, in memory, in the sense of home as sacred space. There may be something mysterious or unclear in the family of origin. The soul work is creating an inner home that connects to the transpersonal.`,
        `Neptune in the 5th House makes creativity a spiritual act. When you create, you channel something beyond yourself. Romance, too, has a mystical quality — you seek the divine in the beloved. The work is maintaining clarity about what is real versus idealized in love and creative life.`,
        `Neptune in the 6th House brings a spiritual dimension to daily work and health. You may be called to healing, service, or work that involves sensitivity and compassion. The body-spirit connection is central to your wellbeing. Practices that honor both the physical and the transcendent sustain you best.`,
        `Neptune in the 7th House seeks the divine in relationship. You long for a soul-union with a partner — something that transcends the ordinary. This is both your greatest longing and your greatest vulnerability, as it can lead to idealization and disappointment. The spiritual practice is learning to see your partner clearly while still honoring the sacred quality of love.`,
        `Neptune in the 8th House places the mystical at the center of transformation. Death, rebirth, and the mysteries of psychic inheritance are your spiritual territory. Mediumship, dream work, depth psychology, and shamanic practices may feel natural. The boundary between the living and the dead is thin for you.`,
        `Neptune in the 9th House is one of the most naturally spiritual placements. Philosophy, religion, and direct mystical experience are the native terrain of your soul. You may receive spiritual visions or feel drawn to multiple traditions. The practice is grounding transcendent insight in daily lived reality.`,
        `Neptune in the 10th House brings a spiritual dimension to your public role. You may be called to heal, inspire, or serve as a channel for collective ideals in your career. The challenge is maintaining healthy ego boundaries when public projection can dissolve the self.`,
        `Neptune in the 11th House brings spiritual idealism to community and collective vision. You feel a mystical sense of belonging to a larger spiritual family — human and beyond. The work is choosing groups and ideals consciously rather than being absorbed by collective currents you haven't examined.`,
        `Neptune in the 12th House (its domicile) is one of the most powerful mystical placements. The unconscious is your portal to the divine. Dreams, meditation, solitude, and creative immersion are your most direct spiritual access points. The boundary between you and the universal is, by nature, permeable.`,
      ],
      plutoKarmic: [
        `Pluto in the 1st House carries the weight of the soul's transformative power in the very center of identity. You were born as an agent of change — often experiencing early circumstances that forced profound transformation of self. The karmic work is learning to wield deep personal power with integrity rather than domination.`,
        `Pluto in the 2nd House brings the soul's transformative work into the realm of values, resources, and self-worth. There may be karmic patterns around financial power, possession, or the distorted belief that worth is earned rather than inherent. The path is radical inner wealth — value that no external circumstance can take.`,
        `Pluto in the 3rd House places the soul's depth work in the arena of communication and thought. The mind is an instrument of transformation — your words carry weight that others may not fully perceive. Karmic patterns may involve the misuse of communication: manipulation, secrecy, or the silencing of truth.`,
        `Pluto in the 4th House carries ancestral shadow — the unprocessed material of the family lineage that has been passed down for generations. The soul has chosen to be the one in this family system who transforms the inherited wound. This is both a heavy burden and a profound calling.`,
        `Pluto in the 5th House brings transformative intensity to creativity, love, and self-expression. There may be karmic patterns around the abuse or suppression of creative and sexual power. The soul's path is toward full, responsible embodiment of its creative and erotic life force.`,
        `Pluto in the 6th House carries karmic material around service, health, and the relationship between powerlessness and devotion. The soul may have patterns of either forced service or the compulsive need to control daily life as a response to deeper chaos. Integration means choosing service freely.`,
        `Pluto in the 7th House brings the soul's deepest transformative material into partnerships. There are karmic contracts with specific souls — relationships destined to catalyze profound change. Power dynamics, obsession, and betrayal in relationships are the soul's primary classroom.`,
        `Pluto in the 8th House (its natural home) carries the full intensity of death-rebirth consciousness. The soul has traversed many cycles of loss and renewal — across lifetimes and within this one. The karmic work is developing an unshakeable relationship with impermanence: surrendering gracefully to what must die.`,
        `Pluto in the 9th House transforms belief systems, philosophy, and the relationship with the sacred. The soul may have experienced — or perpetuated — religious or philosophical tyranny in past incarnations. The path is toward a truth that liberates rather than controls.`,
        `Pluto in the 10th House carries karmic material around power, authority, and public legacy. The soul has wielded or been subject to significant public power in past lives. This incarnation calls for the conscious, ethical use of authority — power that serves transformation, not control.`,
        `Pluto in the 11th House transforms the relationship with collective power, groups, and social change. The soul may have been involved in revolutionary movements — or been crushed by them. The karmic work is channeling the impulse for collective transformation through conscious, non-destructive means.`,
        `Pluto in the 12th House carries the heaviest karmic weight — material hidden even from the conscious self, accumulated across many lifetimes. The soul's deepest transformations happen in solitude, in dreams, and in the encounter with the invisible. The spiritual path is one of radical surrender to what lies beyond the ego.`,
      ],
      snDescs: {
        0: `South Node in Aries carries deep familiarity with individual action, courage, and survival instincts. You have been the warrior, the pioneer, the one who acts alone. These are real gifts — but in this lifetime, the soul is asked to develop the complementary qualities of Libra: partnership, consideration, and the art of meeting another. The independence must open into relationship.`,
        1: `South Node in Taurus brings profound gifts of patience, sensory wisdom, and the ability to create lasting value. You know how to build, how to hold steady, how to find beauty in the material world. In this lifetime, the soul is asked to release attachment to permanence and move toward the Scorpionic gifts of transformation, depth, and emotional surrender.`,
        2: `South Node in Gemini brings extraordinary gifts of communication, intellectual agility, and the capacity to hold multiple perspectives. You are a natural learner and communicator. In this lifetime, the soul is called to move beyond information gathering toward the deeper wisdom of Sagittarius — meaning, faith, and an integrated worldview.`,
        3: `South Node in Cancer brings deep gifts of emotional attunement, nurturing, and the ability to create safety for others. In this lifetime, the soul is called to develop Capricorn's qualities: ambition, public responsibility, and the courage to be seen and known for your work in the world.`,
        4: `South Node in Leo brings gifts of creative confidence, warmth, and charismatic presence. You have been at the center — the creator, the performer, the generous heart. In this lifetime, the soul is asked to step back from the personal spotlight and contribute to the Aquarian collective — community, innovation, and the larger human story.`,
        5: `South Node in Virgo brings extraordinary gifts of analysis, service, and attention to detail. You have mastered the art of discernment and practical skill. In this lifetime, the soul is called toward Piscean surrender — the mystical, the compassionate, the willingness to dissolve boundaries and trust the formless.`,
        6: `South Node in Libra brings refined gifts of diplomacy, aesthetic sense, and the art of conscious relationship. You know how to harmonize, how to negotiate, how to see multiple sides. In this lifetime, the soul is asked to develop Aries' courageous self-initiative — to act from individual conviction rather than consensus.`,
        7: `South Node in Scorpio carries deep gifts of psychological penetration, resilience, and the capacity to work with shadow and transformation. You have traversed the depths. In this lifetime, the soul is asked to develop Taurus' gifts — simplicity, embodied pleasure, and trust in what is stable and sustaining.`,
        8: `South Node in Sagittarius brings gifts of philosophical breadth, faith, and the ability to inspire others with vision. In this lifetime, the soul is asked to move from the grand overview to the specific and communicable — the Gemini gifts of careful listening, gathering information, and speaking truthfully about immediate experience.`,
        9: `South Node in Capricorn brings deep gifts of discipline, responsibility, and the capacity to build lasting structures. You carry the ancestral weight of achievement and duty. In this lifetime, the soul is called to develop Cancer's emotional intelligence — vulnerability, care, and the courage to need and to be needed.`,
        10: `South Node in Aquarius brings gifts of visionary thinking, social awareness, and the ability to hold collective space. You have been the reformer, the friend of humanity. In this lifetime, the soul is called toward Leo's warmth — personal creative expression, romantic love, and the courage to let yourself be the center of your own story.`,
        11: `South Node in Pisces carries extraordinary gifts of compassion, spiritual sensitivity, and the capacity to dissolve into love. In this lifetime, the soul is asked to develop Virgo's discriminating wisdom — the ability to be of practical service while maintaining clear discernment about what is real versus what is projected.`,
      },
      h12Descs: {
        0: `With Aries on the 12th House cusp, there is hidden fire — raw initiative and courage that operates below the surface of conscious identity. You may be more spontaneously decisive or more easily angered in private than you appear in public. The hidden gift is an enormous reservoir of spiritual courage. The work is to integrate that inner warrior consciously rather than letting it erupt unexpectedly.`,
        1: `Taurus on the 12th House suggests hidden resources of patience, sensory wisdom, and an instinctive connection to the physical world as sacred. There may be an unconscious tendency toward material comfort as spiritual bypass. The hidden gift is profound embodied wisdom — a soul-deep knowing of what truly endures.`,
        2: `Gemini on the 12th House speaks of hidden mental activity — a mind that is always working below the surface, connecting dots in ways the conscious self has not yet caught up with. Intuition often arrives as sudden knowing that preceded any conscious reasoning. The hidden gift is a deeply perceptive intellect that accesses collective information.`,
        3: `Cancer on the 12th House brings hidden emotional depth and an unconscious attunement to the emotional field of whatever room you enter. Ancestral memory and family patterns operate powerfully from behind the scenes. The hidden gift is profound empathic access to collective emotional experience — a natural mediator between personal and transpersonal feeling.`,
        4: `Leo on the 12th House hides creative fire and personal charisma behind a more modest outer presentation. The soul carries a deep reservoir of creative and spiritual leadership that may only emerge in private, in creative work, or in moments of genuine spiritual opening. The hidden gift is a radiant inner light that, when consciously activated, becomes a source of genuine inspiration for others.`,
        5: `Virgo on the 12th House brings hidden discernment and healing capacity — a penetrating ability to notice what is out of alignment in people, systems, and situations that operates largely unconsciously. The hidden gift is a deep spiritual intelligence that finds the sacred in the precise, the humble, and the carefully tended.`,
        6: `Libra on the 12th House suggests hidden relational wisdom and an unconscious attunement to harmony and beauty. There may be subconscious relationship patterns — seeking balance in ways that bypass direct communication. The hidden gift is a natural capacity for spiritual diplomacy: meeting people at the level of soul.`,
        7: `Scorpio on the 12th House carries hidden depth, psychic sensitivity, and access to realms of experience most people never consciously encounter. The unconscious is rich, dark, and powerful. There may be hidden fears around power and betrayal that influence behavior from below the surface. The hidden gift is shamanic capacity — an ability to navigate between worlds.`,
        8: `Sagittarius on the 12th House brings hidden philosophical and spiritual seeking — a soul that is always, below the surface, reaching toward something larger and more meaningful. There may be unconscious dogmatism or a tendency to project spiritual authority onto others. The hidden gift is a wellspring of visionary wisdom that, when consciously accessed, becomes genuine spiritual guidance.`,
        9: `Capricorn on the 12th House carries hidden structural wisdom and an unconscious drive toward mastery and integrity. There may be deep ancestral material around duty, shame, and the weight of expectation. The hidden gift is a profound inner authority — a quiet knowing of what is right that can become an unshakeable spiritual foundation.`,
        10: `Aquarius on the 12th House suggests hidden social sensitivity and an unconscious attunement to collective currents and future possibilities. There may be an underground impulse toward revolution — patterns of disruption that arise without fully conscious intention. The hidden gift is visionary access to collective consciousness.`,
        11: `Pisces on the 12th House (double resonance — Pisces' natural house) is one of the most intensely spiritual configurations. The unconscious is an ocean, and you swim in it more naturally than most. Dreams are vivid and significant. Boundaries between self and other, between here and beyond, are naturally permeable. The hidden gift is direct mystical access — the ability to dissolve into grace.`,
      },
      p12Descs: {
        sun: `The Sun in House 12 indicates a soul that finds its truest identity in solitude, in retreat, and in service that dissolves ego rather than inflates it. There is a calling toward spiritual surrender — a path where personal glory is consciously offered up for something greater.`,
        moon: `The Moon in House 12 brings deep emotional sensitivity that operates mostly below the surface of conscious awareness. Psychic attunement, empathic absorption, and vivid dream life are characteristic. The emotional world is more rich and complex than is visible to others.`,
        mercury: `Mercury in House 12 gives a mind that thinks in images, symbols, and intuitive leaps rather than linear logic. Much mental processing happens below conscious awareness — ideas arrive whole, without visible process. Writing and meditative inquiry are powerful spiritual tools.`,
        venus: `Venus in House 12 seeks love that transcends the ordinary — a love that touches the sacred. There is beauty in solitude and in devotional practice. Relationships may have a quality of the hidden or the sacrificed about them.`,
        mars: `Mars in House 12 channels its energy largely in invisible ways — spiritual practice, creative work done in solitude, or service rendered without recognition. The spiritual warrior archetype is strong here: action from non-attachment to outcome.`,
        jupiter: `Jupiter in House 12 is one of the classical indicators of spiritual good fortune — what was called "guardian angel" energy. Invisible assistance arrives in difficult moments. There is genuine grace available through surrender and trust.`,
        saturn: `Saturn in House 12 carries the heaviest karmic weight — structures built in unseen realms, ancestral obligations that have not yet been completed, and the spiritual discipline of working in hidden ways without worldly recognition.`,
        uranus: `Uranus in House 12 generates sudden, unexpected spiritual breakthroughs — flashes of awakening that reorganize the entire perceptual field. The higher mind is activated most powerfully in states of quiet and surrender.`,
        neptune: `Neptune in its natural House amplifies all 12th House themes: mystical sensitivity, dissolution of ego, and the direct experience of the ocean of consciousness that underlies individual existence.`,
        pluto: `Pluto in House 12 carries enormous karmic intensity — ancestral shadow material, past-life residue, and the full weight of what has been hidden across many cycles. The depth of spiritual transformation available here is extraordinary.`,
        northNode: `North Node in House 12 places the entire evolutionary direction inside the mystical dimension — this incarnation is, at its deepest level, a spiritual one. Retreat, contemplation, and transcendence are not escapes but the actual path.`,
        chiron: `Chiron in House 12 places the sacred wound in the most hidden domain — there are hurts so deep they may not be fully accessible to conscious memory. The healing comes through spiritual practice, creative immersion, and the willingness to encounter what has been most avoided.`,
      },
      spiritualPracticesNN: {
        0: 'Martial arts, solo hiking, or any practice that builds courageous, embodied presence.',
        1: 'Slow, sensory meditation — walking in nature, conscious eating, breathwork that anchors you in the body.',
        2: 'Journaling, contemplative reading, or poetry as a way of translating intuition into language.',
        3: 'Moon circle work, family constellation therapy, or creating rituals that honor your ancestral lineage.',
        4: 'Expressive arts — dance, theater, painting — anything that brings your inner world into visible form.',
        5: 'Yoga, Vipassana, or any practice that sharpens discernment and attunes the body as a spiritual instrument.',
        6: 'Relationship meditation (loving-kindness/metta), couples work, or practices that develop the art of conscious presence with another.',
        7: 'Shadow work, shamanic journeying, or depth therapy — practices that willingly descend into what is hidden.',
        8: 'Vision quests, long retreats, pilgrimage, or study of wisdom traditions that offer a larger philosophical map.',
        9: 'Structured contemplative practice — meditation with accountability, spiritual direction, or monastic retreats.',
        10: 'Community meditation, collective prayer, or any practice that connects individual awakening to social transformation.',
        11: 'Silent retreats, dream work, compassion meditation, or creative immersion that dissolves the boundary of self.',
      },
      spiritualPracticesNeptune: {
        1: "Mirror meditation and identity practices — consciously inhabiting your body without merging with others' projections.",
        2: 'Gratitude practices and sacred relationship with money — blessing what you have, releasing scarcity stories.',
        3: 'Contemplative writing — automatic writing, sacred poetry, or spiritual journaling without censorship.',
        4: 'Home altar creation, ancestor veneration, and practices that consecrate the domestic as spiritual space.',
        5: 'Sacred creativity — art-making as prayer, improvisation, or flow states as spiritual access.',
        6: 'Embodiment practices — somatic therapy, healing arts, or any work that integrates body and spirit.',
        7: 'Conscious partnership practice — using relationship as a spiritual path, with clear seeing and open heart.',
        8: 'Dreamwork, psychotherapy, and practices that explore the liminal space between the conscious and unconscious.',
        9: 'Direct mystical inquiry — meditation that goes beyond doctrine to the living experience of the sacred.',
        10: 'Service-as-spiritual-path — offering your gifts to the world as a form of devotion.',
        11: 'Group meditation and collective spiritual practices — the power of shared intention.',
        12: 'Silence, contemplation, and surrender — practices that dissolve self-consciousness into presence.',
      },
      spiritualPracticesChiron: {
        1: 'Somatic healing work and practices that rebuild healthy identity from the inside out.',
        2: 'Abundance meditation and body-positive practices that restore intrinsic self-worth.',
        3: 'Voice work, expressive writing, or therapeutic conversation that reclaims the power of self-expression.',
        4: 'Family constellation work, inner child healing, and ancestral lineage practices.',
        5: 'Creative expression as healing — art therapy, play, or any practice that restores the joy of self-expression.',
        6: 'Somatic healing and mind-body integration practices that restore the relationship with the physical self.',
        7: 'Relational healing modalities — couples therapy, nonviolent communication, or conscious relating practices.',
        8: 'Shadow integration work, grief rituals, and practices that help the soul move through loss without bypassing.',
        9: 'Rebuilding a personal philosophy — spiritual direction, wisdom traditions, or pilgrimages that restore faith.',
        10: 'Practices that develop genuine inner authority — leadership coaching, mentorship, or elder circles.',
        11: 'Finding your soul community — practices that heal isolation and build authentic belonging.',
        12: 'Contemplative prayer, retreat, and practices that heal spiritual wound through direct encounter with the sacred.',
      },
      universalPractices: (nnSign, chironHouse, saturnHouse) => [
        'Track your dreams for 30 days. The 12th House and Neptune communicate most directly through the dream state. Record them without interpretation at first — simply witness.',
        `Sit with the North Node question: "What would it look like to take one small step toward ${nnSign} quality this week?" Act on the answer.`,
        'Maintain a regular period of voluntary solitude each week — even 30 minutes. The spiritual dimensions of this chart require silence to become audible.',
        `Work with the Chiron wound through creative expression. Write, paint, move, or speak what lives in House ${chironHouse} — give it form without judgment.`,
        `Bring Saturn's domain into conscious relationship: make an explicit commitment in House ${saturnHouse}. Follow through completely. Notice how it feels to be trusted by yourself.`,
      ],
    },
    saturnReturn: {
      coverTitle: 'Saturn Return Report',
      coverSubtitle1st: 'Your First Saturn Return',
      coverSubtitle2nd: 'Your Second Saturn Return',
      coverSubtitleBetween: 'The Saturn Return — Your Defining Passage',
      overviewTitle: 'What Is a Saturn Return — and Why It Matters',
      overview1: `Every 29.5 years, Saturn completes one full orbit of the Sun and returns to the exact degree it occupied at the moment of your birth. This is the Saturn Return — a period lasting roughly two to three years during which Saturn acts as a cosmic auditor, reviewing everything you have built, become, or avoided.`,
      overview2: `The first Saturn Return arrives between ages 27 and 30. It marks the end of the extended adolescence that modern life has created and the beginning of genuine adult authorship. The second arrives between ages 57 and 60, asking a different but equally profound question: have you built a life that belongs to you — or have you spent decades fulfilling a script written by others?`,
      overview3: `Saturn does not destroy what is real. It reveals what was never real to begin with. Relationships, careers, beliefs, identities — anything that has been built on borrowed expectations, external pressure, or the avoidance of a deeper truth will crack under Saturn's review. This is not punishment. It is accuracy.`,
      overview4: `What survives the Saturn Return is stronger for having been tested. What falls away — though it often feels like loss — is usually the heaviest thing you were carrying. The people who move through Saturn Returns consciously, rather than reactively, tend to emerge with a clarity of direction, an authenticity of identity, and a sense of purpose that was simply not available to them before.`,
      returnContextTitle: 'Your Saturn Return — Where You Stand Now',
      returnContext1st: (age) => `At ${age}, you are in or near your first Saturn Return (peak: around age 29). This is the great transition into adult authorship — the moment Saturn asks whether the life you are living is actually yours. Everything you built in your twenties is now being assessed: is it genuine, is it sustainable, does it belong to who you truly are? The structures that hold up deserve to be kept. Those that collapse are clearing the way for something more honest.`,
      returnContext2nd: (age) => `At ${age}, you are in or near your second Saturn Return (peak: around age 59). Where the first return asked "who am I?", this one asks "what have I actually built, and does it matter to me?" The second return is less about identity formation and more about legacy — a reckoning with the gap between the life that was possible and the life that was lived, along with a genuine opportunity to close that gap before the final third of life begins.`,
      returnContextBetween: (age, nextYear) => `At ${age}, you are not currently in the heart of a Saturn Return, but you are approaching your next one (expected around ${nextYear}). Understanding your natal Saturn now — its placement, its lessons, and what it has been asking of you — allows you to meet that period with preparation rather than surprise. Saturn rewards those who have done the groundwork.`,
      natalTitle: (signSymbol, signName, houseNum) => `♄ Your Natal Saturn — ${signSymbol} ${signName}, House ${houseNum}`,
      natalIntro: `Your natal Saturn is the blueprint of the lesson you came here to master. It is not a limitation imposed on you — it is the precise location of your most significant growth. The sign describes the quality of the lesson; the house describes the arena of life where it plays out most intensely.`,
      natalSignTitle: (signName) => `Saturn in ${signName} — The Karmic Structure`,
      natalHouseTitle: (houseNum) => `Saturn in House ${houseNum} — The Arena`,
      natalLessonTitle: 'The Lesson You Came to Master',
      natalLessonText: (houseNum, signName) => `Saturn in House ${houseNum} in ${signName} means that the central work of your life involves bringing ${signName}'s energy — with all its discipline, honesty, and long-game thinking — to bear on the matters of House ${houseNum}. This is not a curse. It is a calling. The people who have done the most meaningful work in exactly the area defined by this placement are the ones who stopped resisting it and began taking it seriously.`,
      houseRestructuringTitle: (houseNum) => `House ${houseNum} — The Area Being Restructured`,
      houseRestructuringIntro: `During the Saturn Return, the house where Saturn lives in your natal chart becomes the primary theater of transformation. This is not where things are merely "challenging" — this is where the deepest reorganization of your life is taking place. The work here is not optional; it is the work Saturn has been preparing you for since birth.`,
      houseGovernsTitle: 'What This House Governs',
      houseReturnAsksTitle: 'What the Saturn Return Is Asking',
      aspectsTitle: '♄ Saturn Aspects — How the Lesson Connects',
      aspectsIntro: `The aspects Saturn forms with other planets in your natal chart show how your Saturnian lesson intersects with other core energies in your psyche. Conjunctions intensify and merge; trines and sextiles create flow and support; squares and oppositions create productive friction — the kind that generates real growth when engaged consciously rather than avoided.`,
      conjunctionsTitle: 'Saturn Conjunctions — Merged Energies',
      hardAspectsTitle: 'Saturn Squares & Oppositions — Productive Friction',
      softAspectsTitle: 'Saturn Trines & Sextiles — Structural Gifts',
      noAspectsText: (houseNum) => `Saturn forms no major aspects within standard orbs in your natal chart. This is unusual and significant: it suggests Saturn operates as a relatively isolated, self-contained energy — perhaps more difficult to access consciously, but also less entangled with other planetary dynamics. During the Saturn Return, this isolation tends to become more apparent as the themes of House ${houseNum} press forward without the context of other planetary energies to soften or complicate them.`,
      demandsTitle: (signName) => `What Saturn Demands of You — ${signName}`,
      demandsIntro: `Saturn's demands are not arbitrary. They are precisely calibrated to the sign it occupies — the specific quality of discipline, maturity, and honest effort that your particular configuration of Saturn requires. These are not suggestions. They are, in a very real sense, the terms of the deal that Saturn offers: do this work, and the rewards are commensurate. Avoid it, and the same themes will return in each cycle with increasing urgency.`,
      demandsListTitle: (signName) => `Saturn in ${signName} Asks You To:`,
      demandsPracticalTitle: 'In Practical Terms — What This Looks Like',
      rewardsTitle: 'What Saturn Rewards — After the Work Is Done',
      rewardsIntro: `Saturn has a reputation as the "Great Malefic" — the planet of loss, hardship, and limitation. This reputation is earned, but it is incomplete. Saturn is equally the planet of reward. The rewards are not accidental or arbitrary: they are precisely proportional to the quality of work that was done. Saturn does not give gifts — it gives returns on genuine investment.`,
      rewardsSignTitle: (signName) => `Saturn in ${signName} — What Becomes Available`,
      rewardsSpecificTitle: 'The Specific Gifts of Your Configuration',
      ruledHousesTitle: 'The Houses Saturn Rules — Areas Activated',
      ruledHousesIntro: `Beyond its natal position, Saturn governs the houses in your chart whose cusps fall in Capricorn or Aquarius. These areas receive Saturn's structuring influence as a matter of governance — they are the domains of life that Saturn oversees, whether or not it occupies them directly. During the Saturn Return, these houses come alive as secondary theaters of restructuring.`,
      ruledHouseTitle: (houseNum) => `House ${houseNum} — Under Saturn's Governance`,
      noRuledHousesText: (houseNum) => `In your chart, no house cusps fall in Capricorn or Aquarius, which means Saturn's governance is concentrated in its natal house rather than distributed across multiple domains. This tends to focus the Saturn Return's energy intensely in the themes of House ${houseNum}, making the work there all the more concentrated and unavoidable.`,
      ruledHousesSynthesisTitle: 'How These Areas Work Together',
      guidanceTitle: 'Practical Guidance for Navigating the Return',
      guidanceIntro: `The Saturn Return is not something that happens to you — it is something you either navigate consciously or experience reactively. The difference between those two modes is significant. Both paths involve difficulty; only one of them produces the clarity and direction that define the other side of a well-navigated return.`,
      timelineTitle: 'Timeline and Phases of the Saturn Return',
      timelineIntro: `The Saturn Return does not arrive as a single event. It unfolds in phases over approximately two to three years, with Saturn typically stationing retrograde and direct multiple times over the natal degree. Understanding the rhythm of this transit helps you work with it intentionally rather than react to each phase in isolation.`,
      firstReturnTitle: 'The First Saturn Return — Ages 27–30',
      firstReturnContent: `The first Saturn Return is the end of adolescence — not the conventional adolescence of the teen years, but the extended one that modern life has created, in which people in their twenties are still largely experimenting, borrowing identities, and deferring the moment of genuine adult commitment.\n\nAt the first return, Saturn asks a deceptively simple question: is the life you are living actually yours? Not the career you inherited from family expectation, not the relationship you stayed in because leaving required facing the unknown, not the city you live in because it was where you happened to land — but your actual life, chosen by the person you have become.\n\nThe disruptions common at the first return — career pivots, relationship endings or deepenings, relocations, identity crises — are Saturn doing exactly what it is designed to do: revealing what was built on borrowed ground so that you can build on your own. The people who emerge from the first return with the most clarity are generally those who were willing to let something fall that needed to fall.`,
      firstReturnSpecificTitle: (signName, houseNum) => `What to Expect Specifically for Saturn in ${signName}, House ${houseNum}`,
      firstReturnSpecificText: (signName, houseNum) => `Your first return focuses the themes of ${signName} and House ${houseNum} with unusual intensity. The work that was avoided or deferred in these areas will surface now — not as punishment, but as the precise timing of a lesson that was always meant to arrive at this moment. The more honestly and directly you engage with it, the more decisively the return resolves.`,
      secondReturnTitle: 'The Second Saturn Return — Ages 57–60',
      secondReturnContent: `If the first return asked "who am I?", the second asks "what have I actually built, and is it genuinely mine?" At the second return, the stakes feel different — there is a deeper awareness of time, a more honest reckoning with the gap between the life that was possible and the life that was lived. But the second return is not predominantly a period of regret. It is a period of honest accounting and genuine redirection — the last major structural renovation before the final third of life begins.`,
      secondReturnSpecificTitle: 'What the Second Return Offers',
      secondReturnSpecificText: (signName, houseNum) => `Your second return revisits the themes of ${signName} and House ${houseNum} with the additional context of everything that has been built — and not built — in the thirty years since the first return. What was initiated then and sustained with integrity will be recognized and deepened. What was deferred will be called due. The precision of Saturn's accounting at the second return is remarkable.`,
      conclusionTitle: 'Conclusion — After the Return: Who You Become',
      conclusion1: (profileName, signName, houseNum) => `${profileName}, this report has traced the specific contours of your Saturn Return: the natal placement in ${signName} in House ${houseNum} that defines the lesson, the aspects that show how it connects to other energies in your chart, the demands and rewards of the work, and the timeline and phases through which the return unfolds.`,
      conclusion2: `The Saturn Return does not make you a different person. It makes you more fully the person you already are — with the borrowed elements stripped away and the genuine elements more legible. What emerges from a well-navigated return is not a new identity but a clarified one: the same person, with less confusion about who that person actually is and what they are actually here to build.`,
      conclusion3: (signName, houseNum) => `Saturn in ${signName} in House ${houseNum} has been your companion since birth — the planet that sets the terms of your most important lesson. The Return is the moment when those terms become non-negotiable. Everything that has been theoretically understood now needs to be structurally inhabited. The work is real. The rewards are real. And the person who emerges on the other side of genuine Saturn work is someone who can say — with the particular authority that only comes from having done the thing that was difficult — that they built something that belongs to them.`,
      glanceTitle: 'Your Saturn Return at a Glance',
      quote: '"We are not given a good life or a bad life. We are given a life — and it is up to us to make it good or bad." — Warden',
      saturnInSignEN: [
        `Saturn in Aries demands that you learn the difference between bold action and impulsive reaction. Your karmic lesson is to develop genuine courage — the kind that persists after the initial rush of enthusiasm fades. You may have struggled with anger, impatience, or the fear of appearing weak. The gift Saturn offers here is true leadership: not the performance of strength, but the disciplined cultivation of it.`,
        `Saturn in Taurus teaches the architecture of security. Your karmic lesson involves building something real and lasting — materially, emotionally, or both — through patience rather than shortcuts. Early life may have carried financial or emotional instability that made you cling too tightly, or conversely, give up too easily. The gift: the capacity to build wealth and stability that endures generations.`,
        `Saturn in Gemini asks you to slow the mind long enough to go deep. Your karmic lesson is to develop genuine expertise rather than surface familiarity with many things. Communication challenges — difficulty expressing yourself clearly, being misunderstood, or intellectual self-doubt — are the friction points that, worked through, become authority. The gift: a precise, trustworthy mind that others rely on.`,
        `Saturn in Cancer is one of the most emotionally demanding placements. Your karmic lesson involves building inner security that does not depend on others for its foundation. Early experiences with family, home, or the maternal figure likely shaped a complex relationship with emotional needs — either suppressing them entirely or fearing they would never be met. The gift: extraordinary emotional resilience and the capacity to create true safety for others.`,
        `Saturn in Leo asks you to earn recognition through genuine achievement rather than performance alone. Your karmic lesson involves developing an inner source of self-worth that does not collapse when no one is watching. Blocks around creativity, self-expression, or the fear of being truly seen may have been present in early life. The gift: a deep, unshakeable dignity that comes from having done the real work of becoming.`,
        `Saturn in Virgo asks you to develop mastery in the service of something meaningful. Your karmic lesson involves learning that excellence is a practice, not a destination — and that the pursuit of perfection, if untamed, becomes its own form of paralysis. Early experiences may have generated chronic self-criticism or an anxious relationship with incompleteness. The gift: the capacity for craftsmanship so precise it becomes art.`,
        `Saturn in Libra is in its exaltation — structure applied to relationships and justice. Your karmic lesson is to build partnerships based on honesty and mutual respect rather than appeasement. You may have learned early that harmony required self-erasure, or that taking a side was dangerous. The gift: the ability to hold fairness under pressure — a rare quality that others gravitate toward.`,
        `Saturn in Scorpio asks you to confront power honestly. Your karmic lesson involves learning to transform rather than control — to face the depths without being consumed by them. Early encounters with loss, betrayal, or the misuse of power may have left a mark that either hardened you or awakened your investigative instinct. The gift: the capacity for profound psychological transformation that few others can access.`,
        `Saturn in Sagittarius asks you to test your beliefs against reality. Your karmic lesson involves distinguishing genuine wisdom from comforting ideology — and developing the intellectual honesty to revise what you once held as unquestionable truth. Dogma, overconfidence, or fear of commitment may have been early patterns. The gift: a philosophy of life earned through lived experience rather than received from authority.`,
        `Saturn in Capricorn is in its domicile — its strongest expression. Your karmic lesson involves distinguishing ambition that serves your genuine purpose from ambition that simply earns approval from a world that defines success too narrowly. Early life may have carried significant responsibility or the weight of family expectations. The gift: an extraordinary capacity for disciplined long-term achievement that builds real legacy.`,
        `Saturn in Aquarius asks you to commit to a collective vision without losing yourself in the process. Your karmic lesson involves developing the discipline to translate original ideas into structures that others can inhabit. Detachment, intellectual pride, or fear of conventional belonging may have been early patterns. The gift: the capacity to build systems that outlast you — institutions, ideas, and networks that genuinely serve humanity.`,
        `Saturn in Pisces asks you to structure the boundless. Your karmic lesson involves bringing form to spiritual insight — not escaping into idealism, but incarnating it into daily practice. Early life may have carried confusion, dissolution, or the weight of others' suffering absorbed without filter. The gift: a disciplined spiritual life that others find genuinely healing in its consistency and depth.`,
      ],
      saturnDemands: [
        `Act with deliberate courage. Finish what you start. Lead without needing followers to validate the direction. Learn that restraint is not weakness — it is precision.`,
        `Build slowly and keep building. Resist the urge to abandon what requires long cultivation. Practice letting go of what has been outgrown, even when it feels safe. Earn your security through your own hands.`,
        `Choose depth over breadth. Commit to one idea long enough to master it. Develop the discipline of listening as carefully as you speak. Let your words carry weight because they have been considered.`,
        `Become your own safe harbor. Do the emotional work of tracing inherited patterns back to their source. Care for others without dissolving into them. Let your home — inner and outer — be something you deliberately build.`,
        `Create for the love of creating, not for the applause. Do the work even when no audience is watching. Develop a relationship with your own opinion of yourself that does not require external confirmation to remain stable.`,
        `Accept that useful and imperfect is better than perfect and paralyzed. Develop routines that sustain excellence over time. Serve from a place of genuine skill, not fear of being found insufficient.`,
        `Make decisions. Hold positions that may displease. Build relationships on honesty rather than on the comfort of agreement. Develop the spine to say what needs to be said with grace but without evasion.`,
        `Face what is hidden. Let what must die, die. Release the need to control outcomes as a substitute for trusting the process of transformation. Use your access to depth to heal, not to dominate.`,
        `Test your beliefs in the fire of lived experience. Commit to something long enough to find out what it asks of you. Honor the gap between inspiring vision and the unglamorous daily work of realizing it.`,
        `Define success on your own terms, not the world's. Let ambition serve purpose rather than fear. Give yourself credit for what you have built, instead of immediately measuring it against what remains undone.`,
        `Follow through on the systems you design. Show up for the collective without needing the collective to revolve around you. Build structures that function even when your enthusiasm has moved on.`,
        `Anchor the spiritual in the practical. Develop discernment between compassion and self-erasure. Create a daily structure that protects your sensitivity rather than exposing it to dissolution.`,
      ],
      saturnRewards: [
        `Authentic authority that does not depend on position or title. The confidence of someone who has acted despite fear — and discovered that acting despite fear is what courage actually is.`,
        `A stable, prosperous life built entirely by your own hands. Security so deeply internalized that no external disruption can fully shake it. The enduring satisfaction of knowing what things are truly worth.`,
        `A mind so well-trained it becomes an instrument of genuine precision. The credibility of expertise — the rare experience of being the person who actually knows what they are talking about.`,
        `An emotional center that holds — yours and often others'. The deep satisfaction of having built a home that is not a cage but a foundation. The freedom that comes from no longer needing others to make you feel safe.`,
        `Recognition that arrives without having been chased. A sense of self so solid it expresses itself naturally, without needing to announce itself. Creative work that persists because it was built on genuine craft.`,
        `Mastery. The particular satisfaction of having developed a skill so deeply that it becomes invisible — something you do with ease because you have done it with effort for long enough.`,
        `Relationships grounded in authentic equality rather than managed peace. The respect that comes from being someone who will say the difficult true thing rather than the comfortable false one.`,
        `Genuine psychological power — the kind that transforms rather than controls. The trust of those who recognize you have faced the dark and returned, not unchanged, but intact and somehow more complete.`,
        `A personal philosophy forged through experience — not borrowed from authorities, but tested against life and found to hold. The credibility of someone who has lived what they teach.`,
        `A legacy. Structures, institutions, achievements, or simply a reputation built over decades that outlasts the moment. The profound satisfaction of having been someone whose work mattered.`,
        `Systems that genuinely serve humanity — built not in a burst of inspiration but through the slow, patient work of implementation. The knowledge that your unconventional mind has left something real in the world.`,
        `A spiritual life of genuine depth and daily practice. The particular peace of someone who has not escaped the world's suffering but has learned to hold it with compassion — without being swallowed by it.`,
      ],
      houseGovernsTexts: {
        1:  'The self — identity, body, appearance, and the way you arrive in the world.',
        2:  'Resources — money, possessions, talents, and what you believe you are worth.',
        3:  'Communication — how you think, speak, learn, and connect with your immediate environment.',
        4:  'Roots — home, family of origin, emotional foundations, and the private self.',
        5:  'Expression — creativity, romance, children, and the courage to be seen.',
        6:  'Service — daily work, health, habits, and the routines that either sustain or undermine you.',
        7:  'Partnership — committed relationships, contracts, and the mirror of the other.',
        8:  'Transformation — shared resources, intimacy, loss, and psychological depth.',
        9:  'Meaning — philosophy, higher education, travel, and the beliefs you live by.',
        10: 'Career — vocation, public reputation, and the legacy you are building.',
        11: 'Community — friendships, collective causes, and the future you are working toward.',
        12: 'Depth — the unconscious, the hidden, and the integration of what has been avoided.',
      },
      houseReturnAsks: {
        1:  `The Return is asking you to take full responsibility for who you are — not who you were raised to be, not who others need you to be, but who you actually are when no one is managing you. This is the moment to stop apologizing for your presence and start inhabiting it with full authority.`,
        2:  `The Return is asking you to build genuine financial and psychological security — and to examine the beliefs about worth that have been running your relationship with resources without your conscious direction. What do you actually value? What do you actually deserve? These are not rhetorical questions.`,
        3:  `The Return is asking you to develop the precision and depth that distinguish real expertise from the appearance of knowledge. It may also surface unresolved dynamics with siblings or close environment that have shaped your voice in ways you have not yet examined.`,
        4:  `The Return is asking you to become your own emotional foundation — to stop waiting for a family, a relationship, or a home to provide the sense of security that ultimately only you can build for yourself. This is often among the most emotionally demanding asks Saturn makes.`,
        5:  `The Return is asking whether your creative life and romantic life are genuinely yours, or whether they have been shaped by what you thought was expected or permissible. The invitation is to claim your own voice, your own desire, your own joy — without audition.`,
        6:  `The Return is asking you to build a daily life that actually sustains the person you are becoming. Unsustainable habits, overwork that looks like virtue, and health matters that have been deferred are all being brought to account. How you show up every day matters as much as what you are reaching for.`,
        7:  `The Return is asking you to move from relationship patterns inherited or reactive into genuine partnership — chosen, structured, and honest. Relationships that are not built on authentic foundation tend to come to a reckoning here. Those that are real tend to deepen significantly.`,
        8:  `The Return is asking you to release what you have been holding onto as security but that is actually holding you back — whether financial, psychological, or relational. Genuine transformation requires letting something die. Saturn in House 8 makes this unavoidable.`,
        9:  `The Return is asking you to distinguish between the beliefs you were given and the ones you have actually tested and found to hold. It may involve a reckoning with education, with religion or spirituality, or with the gap between your philosophy of life and how you actually live.`,
        10: `The Return is asking you to take serious, decisive ownership of your professional direction. What are you building? Is it yours? Does it matter to you? The career restructuring that happens during this period, though often disruptive, tends to be the most meaningful redirection you will experience.`,
        11: `The Return is asking you to be honest about your relationships with groups and the future you are working toward. Friendships and communities that are based on who you used to be may naturally thin. New ones — built around who you actually are — become possible.`,
        12: `The Return is asking you to face what you have been avoiding — the interior material that has been running your life quietly without your authorization. This is shadow work in the most literal sense, and Saturn here will not allow it to be indefinitely deferred.`,
      },
      practicalDemands: {
        0:  `Pick the direction that requires genuine courage — not the calculated safe move. Then sustain it past the point where the excitement of novelty fades. Saturn in Aries will not respect the half-started project.`,
        1:  `Do the financial review you have been deferring. Create the structure you have been saying you will create "when things settle." Saturn in Taurus knows things never just settle — you build the stability or you do not.`,
        2:  `Choose one area of genuine expertise and develop it seriously. Stop spreading your intelligence across too many surfaces. Saturn in Gemini is asking for depth, not range.`,
        3:  `Address the emotional inheritance honestly — in therapy, in journaling, in deliberate conversation. The family patterns that run your emotional life will not become visible on their own.`,
        4:  `Make the creative or romantic declaration you have been postponing. Show the work you have been making privately. Claim the desire you have been qualifying. Saturn in Leo is asking for authenticity, not performance.`,
        5:  `Build the health and work routines that you know you need but keep negotiating out of. Saturn in Virgo will not accept indefinite negotiation.`,
        6:  `Have the direct conversation in the relationship that you have been managing around. State your actual position. Saturn in Libra is asking for honesty, not diplomatic avoidance.`,
        7:  `Face the thing you have been avoiding — in therapy, in journal, in honest conversation with yourself. Saturn in Scorpio will not let it stay buried indefinitely.`,
        8:  `Commit to the educational or philosophical direction that actually calls you, rather than the one that is most socially legible. Saturn in Sagittarius is asking for your genuine search, not an approved one.`,
        9:  `Make the career decision that is actually yours. Not the one that inherits the script of family expectation or institutional approval. Saturn in Capricorn can build anything — but it needs to be building toward something that genuinely matters to you.`,
        10: `Build the system, the organization, the network, the body of work — not in your head, but in the world. Saturn in Aquarius is asking for implementation, not vision.`,
        11: `Create the daily structure that makes your creative or spiritual life sustainable — not as inspiration permits, but as commitment requires. Saturn in Pisces is asking for practice, not transcendence.`,
      },
      specificGifts: {
        0:  `As Saturn in Aries matures, the impulsive energy that once created chaos becomes focused, directed force. You become someone who can begin what others cannot start and finish what others abandon. The authority that was impossible to fake in your youth becomes real, because it is earned.`,
        1:  `As Saturn in Taurus matures, the anxiety about scarcity becomes mastery of resource. You become someone who knows the real value of things — who builds wealth, security, and beauty not through luck but through the patient application of genuine judgment. The financial and psychological ground you build here is among the most stable that any Saturn placement can generate.`,
        2:  `As Saturn in Gemini matures, the restless, scattered mind becomes a precision instrument. You develop an intellectual authority — the credibility of genuine depth — that is rare in a culture that rewards breadth. The writing, teaching, or communication work you do from this foundation carries weight because it has been earned word by word.`,
        3:  `As Saturn in Cancer matures, the emotional walls built for protection become boundaries built from self-knowledge. You become capable of extraordinary emotional resilience — someone who can hold space for others because you have done the work of creating that space for yourself first. The home you build — inner and outer — becomes a genuine foundation.`,
        4:  `As Saturn in Leo matures, the need for external validation transforms into authentic self-regard. The creative work you produce from this foundation tends to be among the most enduring you will make — because it is grounded in genuine craft rather than the need for applause. The recognition, when it arrives, reflects something real.`,
        5:  `As Saturn in Virgo matures, the perfectionism that paralyzed becomes the standard of excellence that inspires. You develop a mastery of craft — in whatever domain you have chosen to apply it — that others can only approximate. The routines you have built become the structural foundation of a life that actually functions.`,
        6:  `As Saturn in Libra matures, the diplomatic evasion transforms into genuine fairness — the courage to say the true thing even when it disrupts the peace. Partnerships built or rebuilt from this foundation tend to be among the most equitable and durable. You become someone others trust to tell them the truth.`,
        7:  `As Saturn in Scorpio matures, the fear of losing control transforms into genuine psychological power — the ability to transform situations that would destroy others. You become someone who has faced the dark and returned from it, and this depth of experience creates a credibility and presence that is almost impossible to fake.`,
        8:  `As Saturn in Sagittarius matures, the borrowed ideology becomes personal philosophy — tested, revised, and genuinely inhabited. You become someone who teaches from lived experience rather than received doctrine. The credibility this generates is among the most durable that any placement can produce: you know what you know because you have lived it.`,
        9:  `As Saturn in Capricorn matures, the relentless striving for achievement transforms into purposeful legacy. The structures, institutions, or bodies of work that you build from this foundation tend to outlast you. You become someone whose work matters — not because the world said so, but because you built it to last.`,
        10: `As Saturn in Aquarius matures, the original ideas that once remained in the realm of vision begin to take form in the world as real structures that serve real people. You become someone who builds what others only imagine. The systems and networks you create from this foundation carry your particular intelligence into the world in a form that can outlast your direct involvement.`,
        11: `As Saturn in Pisces matures, the spiritual life that was once a refuge from reality becomes a practice that makes you more capable of engaging with reality. The daily disciplines of contemplation, creativity, or service that you build here generate a depth of peace and wisdom that others can feel in your presence — not because you project it, but because it has become structural.`,
      },
      guidanceSections: [
        {
          title: 'Audit Before Saturn Does',
          text: () => `Saturn will audit your life during the Return whether you cooperate or not. The difference is whether you do it on your terms or on its. Spend time — seriously and honestly — examining what you have built so far: relationships, career direction, financial structure, daily habits, beliefs you have been living by. Ask, for each: is this genuinely mine? Is this built on something real? Does this serve who I am actually becoming? The answers will be uncomfortable and instructive.`,
        },
        {
          title: 'Lean Into the Restructuring',
          text: () => `When the Saturn Return creates disruption — and it will — the instinct is to restore what existed before as quickly as possible. Resist this instinct. The disruption is not arbitrary; it is diagnostic. What falls apart during a Saturn Return was not stable — it only appeared stable. The energy that has been freed by its dissolution is available for building something more honest in its place. Give yourself the time to feel the loss before rushing to fill the space.`,
        },
        {
          title: 'Lean Into the House Work',
          text: (houseNum, houseAsk) => `Specifically for Saturn in House ${houseNum}: ${houseAsk}`,
        },
        {
          title: 'Work With Time, Not Against It',
          text: () => `Saturn rules time. One of its most reliable lessons is that genuine things take the time they take — and that trying to compress or circumvent that timeline produces either collapse or a structure that will not hold. The Saturn Return is not a sprint. It spans two to three years for good reason. Sustainable change requires that long. Work with the pace Saturn sets.`,
        },
        {
          title: 'Get Support',
          text: () => `The Saturn Return is one of the periods in life where working with a therapist, a coach, a mentor, or at minimum a trusted friend who can reflect honestly is most valuable. Saturn asks for self-knowledge, and self-knowledge has limits when pursued entirely alone. The people who navigate returns most effectively tend to be those who find a container — therapeutic, communal, or mentored — in which to do the work.`,
        },
      ],
      timelinePhases: [
        {
          name: 'Phase 1 — First Contact (Saturn approaches natal degree)',
          text: (houseNum) => `Saturn begins to conjunct its natal position. Themes of House ${houseNum} and the lessons of your Saturn sign start pressing forward in your life with unusual insistence. This phase often generates a sense of urgency, incompleteness, or pressure — as if time has stopped being abstract and become genuinely finite. Events in this phase are rarely random: they are precisely targeted at whatever in your life has needed attention longest.`,
        },
        {
          name: 'Phase 2 — The Station (Saturn stationary at natal degree)',
          text: () => `When Saturn stations — appears to stop moving and then turn retrograde — directly on or near your natal Saturn, the intensity peaks. This is the moment of maximum pressure and maximum clarity. The questions that have been forming in Phase 1 are now impossible to avoid. This is also the phase where the most significant decisions tend to be made — or are forced by circumstance.`,
        },
        {
          name: 'Phase 3 — Retrograde Review (Saturn retrograde back over natal degree)',
          text: () => `As Saturn moves retrograde over the natal degree, the themes it activated in Phases 1 and 2 enter a period of review and integration. What was initiated needs to be reconsidered; what was decided needs to be tested. This phase can feel like regression, but it is usually refinement. The work done here tends to be less visible and more internal — essential preparation for what comes next.`,
        },
        {
          name: 'Phase 4 — Direct Resolution (Saturn direct over natal degree for the final time)',
          text: () => `Saturn stations direct and makes its final pass over the natal degree. This is the completion phase — the period in which the decisions made during the return are implemented, the structures begun during the return take their final form, and the lessons of the period become accessible as something genuinely learned rather than merely endured. Life after this phase feels qualitatively different: more deliberate, more grounded, more clearly yours.`,
        },
        {
          name: 'After the Return — Integration',
          text: () => `The two to three years following the Return proper are a period of living into what was built or rebuilt. The energy is less pressured and more constructive. Saturn moves into the next sign and the next house, carrying its lessons forward but no longer auditing the specific degree where it was born. The clarity earned during the Return begins to compound: decisions made from a more honest foundation tend to generate more aligned outcomes over time.`,
        },
      ],
    },
  },

// ============================================================
// HELPER: build translated locale by overriding key strings
// All array content (sign/house descriptions) stays in English
// as the reports target English-speaking audiences primarily;
// the UI labels/titles/narrative paragraphs are translated.
// ============================================================

function buildLocale(overrides: DeepPartial<ReportTexts>): ReportTexts {
  const en = TEXTS['en'];
  return {
    financial: { ...en.financial, ...overrides.financial } as FinancialTexts,
    spiritual: { ...en.spiritual, ...overrides.spiritual } as SpiritualTexts,
    saturnReturn: { ...en.saturnReturn, ...overrides.saturnReturn } as SaturnReturnTexts,
  };
}

type DeepPartial<T> = { [K in keyof T]?: Partial<T[K]> };

TEXTS['pt'] = buildLocale({
  financial: {
    coverTitle: 'Mapa Financeiro',
    coverSubtitle: 'Seu potencial de riqueza e sua relação com o dinheiro',
    overviewTitle: 'Visão Geral — Sua Relação com o Dinheiro',
    overview1: `O dinheiro é uma das áreas mais carregadas emocionalmente da vida humana — e o mapa astral reflete essa complexidade com precisão. Sua história financeira está escrita em três eixos principais: a Casa 2 (o que você ganha, valoriza e constrói pessoalmente), a Casa 8 (o que vem através dos outros — investimentos, herança, empreendimentos conjuntos e transformação), e os planetas Vênus, Júpiter e Saturno (o que você atrai, onde a abundância flui e onde a disciplina constrói riqueza duradoura).`,
    overview2: (h2RulerName, h2RulerHouse, ord) => `O regente de sua Casa 2 — ${h2RulerName}, atualmente posicionado na Casa ${h2RulerHouse} — é o seu planeta do "estilo de ganhar dinheiro". Onde esse planeta está, e como é aspectado, revela o canal primário pelo qual a energia financeira entra em sua vida.`,
    overview3: `Este relatório mapeia todas essas camadas em sequência. Não é uma previsão de quanto dinheiro você terá — é um mapa de sua relação natural com os recursos: onde o fluxo é fácil, onde a disciplina é necessária, e onde oportunidades ocultas podem estar esperando pela ativação consciente.`,
    atAGlance: 'Sua Assinatura Financeira em Resumo',
    house2Title: (sym, name) => `Casa 2 — ${sym} ${name}: Recursos Pessoais e Autoestima`,
    house2Intro: `A Casa 2 é seu tesouro pessoal: não apenas dinheiro, mas tudo que você possui, tudo que pode produzir com suas próprias mãos e mente e — crucialmente — o senso de valor que sustenta tudo isso.`,
    house2EarningStyle: (name) => `${name} na Cúspide da Casa 2 — Seu Estilo de Ganhar`,
    planetsInH2Title: 'Planetas em Sua Casa 2',
    house2RulerTitle: (ruler, num) => `${ruler} — Regente de Sua Casa 2 (na Casa ${num})`,
    house2RulerText: (ruler, num, ord) => `O planeta que rege o signo na cúspide de sua Casa 2 é seu "planeta do dinheiro" — o indicador mais direto de como a energia financeira se move em sua vida. ${ruler} está em sua Casa ${num}, o que significa que os temas dessa casa são onde seu poder de ganho é mais naturalmente ativado.`,
    house8Title: (sym, name) => `Casa 8 — ${sym} ${name}: Recursos Compartilhados e Transformação`,
    house8Intro: `A Casa 8 é o domínio financeiro mais psicologicamente complexo do mapa. Ela rege tudo que vem de ou através dos outros: herança, investimentos conjuntos, empréstimos, seguros, impostos, a renda do parceiro e as finanças que chegam como resultado de confiança profunda ou crise profunda.`,
    house8CuspTitle: (name) => `${name} na Cúspide da Casa 8`,
    planetsInH8Title: 'Planetas em Sua Casa 8',
    venusTitle: (name, num) => `Vênus em ${name} (Casa ${num}) — O Que Você Atrai`,
    venusIntro: `Vênus é o planeta da atração — não apenas atração romântica, mas o princípio magnético que atrai recursos, beleza, prazer e valor em sua direção. Na astrologia financeira, Vênus descreve a qualidade do que você atrai sem esforço.`,
    venusSignTitle: (name) => `Vênus em ${name} — Qualidade de Atração`,
    venusHouseTitle: (num) => `Vênus na Casa ${num} — Onde a Atração se Manifesta`,
    jupiterTitle: (name, num) => `Júpiter em ${name} (Casa ${num}) — Onde a Abundância Flui`,
    jupiterIntro: `Júpiter é o planeta da expansão, generosidade e o princípio do "mais". Na astrologia financeira, Júpiter marca onde a abundância chega mais naturalmente.`,
    jupiterCycleTitle: 'Trabalhando com Seu Ciclo de Júpiter',
    jupiterCycleText: `Júpiter completa um ciclo completo do zodíaco a cada 12 anos. Quando ele retorna ao seu signo natal — por volta dos 12, 24, 36, 48 e 60 anos — há uma janela natural de expansão financeira e oportunidade.`,
    saturnTitle: (name, num) => `Saturno em ${name} (Casa ${num}) — Onde a Disciplina Constrói Riqueza`,
    saturnIntro: `Se Júpiter mostra onde a abundância flui facilmente, Saturno mostra onde a riqueza é construída com esforço e disciplina — e onde ela dura.`,
    saturnHouseTitle: (num) => `Saturno na Casa ${num} — Onde a Estrutura Compensa`,
    saturnReturnTitle: 'O Retorno de Saturno e a Maturidade Financeira',
    saturnReturnText: `Por volta dos 28-30 anos e novamente aos 58-60, Saturno retorna à sua posição natal — o Retorno de Saturno. Este é consistentemente um dos pontos de reinicialização financeira mais significativos da vida.`,
    aspectsTitle: 'Aspectos Financeiros — Conexões de Vênus, Júpiter e Saturno',
    aspectsIntro: `Os aspectos entre Vênus, Júpiter e Saturno em seu mapa natal descrevem como seus três princípios financeiros centrais interagem: atração (Vênus), expansão (Júpiter) e disciplina (Saturno).`,
    noAspectsText: `Vênus, Júpiter e Saturno em seu mapa não formam aspectos maiores próximos entre si. Isso significa que seus princípios financeiros de atração, expansão e disciplina operam com relativa independência.`,
    strengthsTitle: 'Top 5 Pontos Fortes Financeiros',
    strengthsIntro: `Os pontos fortes a seguir derivam de dignidades, posições nas casas e aspectos harmoniosos em seu mapa. Eles representam as qualidades financeiras com as quais você nasceu.`,
    challengesTitle: 'Top 5 Desafios Financeiros',
    challengesIntro: `Os desafios financeiros no mapa natal não são obstáculos — são áreas que requerem trabalho consciente. Cada desafio abaixo carrega em si uma correspondente margem de crescimento.`,
    adviceTitle: 'Conselhos Práticos e Timing',
    adviceIntro: `O maior valor prático da astrologia no planejamento financeiro é o timing — saber quando expandir agressivamente, quando consolidar e quando aguardar.`,
    conclusionTitle: 'Conclusão',
    conclusion1: (name, h2, h8, v, j, s) => `${name}, seu mapa financeiro revela um quadro completo e matizado de como a riqueza se move em sua vida. A Casa 2 em ${h2} define seu estilo natural de ganhar; a Casa 8 em ${h8} molda sua relação com recursos compartilhados; Vênus em ${v} descreve o que você atrai; Júpiter em ${j} marca onde a abundância flui mais livremente; e Saturno em ${s} indica onde o esforço disciplinado constrói a riqueza mais duradoura.`,
    conclusion2: (ruler) => `O insight mais importante que este relatório oferece não é uma previsão — é uma descrição de seu caráter financeiro natural. Você vai ganhar com mais eficácia e construir com mais sustentabilidade quando trabalhar com essas energias planetárias, sendo que seu regente da Casa 2 — ${ruler} — é seu principal instrumento de navegação financeira.`,
    conclusion3: `O dinheiro não está separado do resto da vida. O mesmo mapa que descreve seus padrões emocionais, sua criatividade, seus relacionamentos e seu propósito também descreve sua história financeira — porque são todos uma única história.`,
    quote: '"A riqueza não consiste em ter grandes posses, mas em ter poucos desejos." — Epicteto',
  },
  spiritual: {
    coverTitle: 'Mapa Espiritual e Kármico',
    coverSubtitle: 'A jornada de sua alma revelada',
    overviewTitle: 'Visão Geral — A Jornada de Sua Alma',
    nnTitle: (s) => `☊ Nodo Norte em ${s} — Para Onde Sua Alma Está Indo`,
    snTitle: (s) => `☋ Nodo Sul em ${s} — O Que Você Já Dominou`,
    house12Title: (s) => `✦ Casa 12 em ${s} — Sua Conexão com o Transcendente`,
    neptuneTitle: (s) => `♆ Netuno em ${s} — Onde Você Dissolve Fronteiras`,
    chironTitle: (s) => `⚷ Quíron em ${s} — Sua Ferida Sagrada e Dom de Cura`,
    plutoTitle: (s) => `♇ Plutão em ${s} — Onde a Transformação Profunda Opera`,
    saturnKarmicTitle: (s) => `♄ Saturno em ${s} — Lições Kármicas e Padrões Ancestrais`,
    conclusionTitle: '✦ Conclusão — Integrando o Caminho Espiritual',
    quote: '"A ferida é o lugar por onde a Luz entra em você." — Rumi',
  },
  saturnReturn: {
    coverTitle: 'Relatório do Retorno de Saturno',
    coverSubtitle1st: 'Seu Primeiro Retorno de Saturno',
    coverSubtitle2nd: 'Seu Segundo Retorno de Saturno',
    coverSubtitleBetween: 'O Retorno de Saturno — Sua Passagem Definidora',
    overviewTitle: 'O Que É um Retorno de Saturno — e Por Que Importa',
    conclusionTitle: 'Conclusão — Após o Retorno: Quem Você Se Torna',
    quote: '"Não nos é dada uma vida boa ou uma vida ruim. Nos é dada uma vida — e cabe a nós torná-la boa ou ruim." — Warden',
  },
});

TEXTS['es'] = buildLocale({
  financial: {
    coverTitle: 'Mapa Financiero',
    coverSubtitle: 'Tu potencial de riqueza y relación con el dinero',
    overviewTitle: 'Visión General — Tu Relación con el Dinero',
    overview1: `El dinero es una de las áreas más cargadas emocionalmente de la vida humana — y la carta natal refleja esa complejidad con precisión. Tu historia financiera está escrita en tres ejes principales: la Casa 2 (lo que ganas, valoras y construyes personalmente), la Casa 8 (lo que llega a través de otros — inversiones, herencias, empresas conjuntas y transformación), y los planetas Venus, Júpiter y Saturno.`,
    overview2: (ruler, num) => `El regente de tu Casa 2 — ${ruler}, actualmente ubicado en la Casa ${num} — es tu planeta del "estilo para ganar dinero". Donde se encuentre este planeta revela el canal principal a través del cual la energía financiera entra en tu vida.`,
    overview3: `Este informe mapea todas estas capas en secuencia. No es una predicción de cuánto dinero tendrás — es un mapa de tu relación natural con los recursos.`,
    atAGlance: 'Tu Firma Financiera de un Vistazo',
    house2Title: (sym, name) => `Casa 2 — ${sym} ${name}: Recursos Personales y Autoestima`,
    house2Intro: `La Casa 2 es tu tesoro personal: no solo dinero, sino todo lo que posees, todo lo que puedes producir con tus propias manos y mente, y — crucialmente — el sentido de valor que lo sustenta todo.`,
    house2EarningStyle: (name) => `${name} en la Cúspide de la Casa 2 — Tu Estilo de Ganar`,
    planetsInH2Title: 'Planetas en Tu Casa 2',
    house2RulerTitle: (ruler, num) => `${ruler} — Regente de Tu Casa 2 (en Casa ${num})`,
    house2RulerText: (ruler, num) => `El planeta que rige el signo en la cúspide de tu Casa 2 es tu "planeta del dinero". ${ruler} está en tu Casa ${num}, lo que significa que los temas de esa casa son donde tu poder de ganancias se activa más naturalmente.`,
    house8Title: (sym, name) => `Casa 8 — ${sym} ${name}: Recursos Compartidos y Transformación`,
    house8Intro: `La Casa 8 es el dominio financiero más psicológicamente complejo de la carta. Rige todo lo que proviene de o a través de otros: herencias, inversiones conjuntas, préstamos, seguros, impuestos e ingresos del socio.`,
    house8CuspTitle: (name) => `${name} en la Cúspide de la Casa 8`,
    planetsInH8Title: 'Planetas en Tu Casa 8',
    venusTitle: (name, num) => `Venus en ${name} (Casa ${num}) — Lo Que Atraes`,
    venusIntro: `Venus es el planeta de la atracción — no solo atracción romántica, sino el principio magnético que atrae recursos, belleza, placer y valor hacia ti.`,
    venusSignTitle: (name) => `Venus en ${name} — Calidad de Atracción`,
    venusHouseTitle: (num) => `Venus en Casa ${num} — Dónde Se Manifiesta la Atracción`,
    jupiterTitle: (name, num) => `Júpiter en ${name} (Casa ${num}) — Donde Fluye la Abundancia`,
    jupiterIntro: `Júpiter es el planeta de la expansión, la generosidad y el principio del "más". En astrología financiera, Júpiter marca donde la abundancia llega más naturalmente.`,
    jupiterCycleTitle: 'Trabajando con Tu Ciclo de Júpiter',
    jupiterCycleText: `Júpiter completa un ciclo completo del zodíaco cada 12 años. Cuando regresa a su signo natal — alrededor de los 12, 24, 36, 48 y 60 años — hay una ventana natural de expansión financiera.`,
    saturnTitle: (name, num) => `Saturno en ${name} (Casa ${num}) — Donde la Disciplina Construye Riqueza`,
    saturnIntro: `Si Júpiter muestra dónde fluye la abundancia fácilmente, Saturno muestra dónde la riqueza se construye con esfuerzo y disciplina — y dónde dura.`,
    saturnHouseTitle: (num) => `Saturno en Casa ${num} — Donde la Estructura Da Frutos`,
    saturnReturnTitle: 'El Retorno de Saturno y la Madurez Financiera',
    saturnReturnText: `Alrededor de los 28-30 años y nuevamente a los 58-60, Saturno regresa a su posición natal — el Retorno de Saturno. Este es consistentemente uno de los puntos de reinicio financiero más significativos de la vida.`,
    aspectsTitle: 'Aspectos Financieros — Conexiones de Venus, Júpiter y Saturno',
    aspectsIntro: `Los aspectos entre Venus, Júpiter y Saturno en tu carta natal describen cómo interactúan tus tres principios financieros centrales: atracción (Venus), expansión (Júpiter) y disciplina (Saturno).`,
    noAspectsText: `Venus, Júpiter y Saturno en tu carta no forman aspectos mayores cercanos entre sí, lo que significa que tus principios financieros operan con relativa independencia.`,
    strengthsTitle: 'Top 5 Fortalezas Financieras',
    strengthsIntro: `Las siguientes fortalezas se derivan de dignidades, posiciones en casas y aspectos armoniosos en tu carta.`,
    challengesTitle: 'Top 5 Desafíos Financieros',
    challengesIntro: `Los desafíos financieros en la carta natal no son obstáculos — son áreas que requieren trabajo consciente.`,
    adviceTitle: 'Consejos Prácticos y Timing',
    adviceIntro: `El mayor valor práctico de la astrología en la planificación financiera es el timing — saber cuándo expandirse agresivamente, cuándo consolidar y cuándo esperar.`,
    conclusionTitle: 'Conclusión',
    conclusion1: (name, h2, h8, v, j, s) => `${name}, tu mapa financiero revela un cuadro completo de cómo se mueve la riqueza en tu vida. La Casa 2 en ${h2} define tu estilo natural de ganar; la Casa 8 en ${h8} moldea tu relación con recursos compartidos; Venus en ${v} describe lo que atraes; Júpiter en ${j} marca donde la abundancia fluye más libremente; y Saturno en ${s} indica donde el esfuerzo disciplinado construye la riqueza más duradera.`,
    conclusion2: (ruler) => `El insight más importante que ofrece este informe no es una predicción — es una descripción de tu carácter financiero natural. Tu regente de la Casa 2 — ${ruler} — es tu instrumento principal de navegación financiera.`,
    conclusion3: `El dinero no está separado del resto de la vida. El mismo mapa que describe tus patrones emocionales, tu creatividad, tus relaciones y tu propósito también describe tu historia financiera.`,
    quote: '"La riqueza no consiste en tener grandes posesiones, sino en tener pocos deseos." — Epicteto',
  },
  spiritual: {
    coverTitle: 'Mapa Espiritual y Kármico',
    coverSubtitle: 'El viaje de tu alma revelado',
    overviewTitle: 'Visión General — El Viaje de Tu Alma',
    nnTitle: (s) => `☊ Nodo Norte en ${s} — Hacia Dónde Va Tu Alma`,
    snTitle: (s) => `☋ Nodo Sur en ${s} — Lo Que Ya Has Dominado`,
    house12Title: (s) => `✦ Casa 12 en ${s} — Tu Conexión con lo Trascendente`,
    neptuneTitle: (s) => `♆ Neptuno en ${s} — Donde Disuelves Fronteras`,
    chironTitle: (s) => `⚷ Quirón en ${s} — Tu Herida Sagrada y Don de Sanación`,
    plutoTitle: (s) => `♇ Plutón en ${s} — Donde Opera la Transformación Profunda`,
    saturnKarmicTitle: (s) => `♄ Saturno en ${s} — Lecciones Kármicas y Patrones Ancestrales`,
    conclusionTitle: '✦ Conclusión — Integrando el Camino Espiritual',
    quote: '"La herida es el lugar por donde entra la Luz." — Rumi',
  },
  saturnReturn: {
    coverTitle: 'Informe del Retorno de Saturno',
    coverSubtitle1st: 'Tu Primer Retorno de Saturno',
    coverSubtitle2nd: 'Tu Segundo Retorno de Saturno',
    coverSubtitleBetween: 'El Retorno de Saturno — Tu Pasaje Definitorio',
    overviewTitle: 'Qué Es un Retorno de Saturno — y Por Qué Importa',
    conclusionTitle: 'Conclusión — Después del Retorno: En Quién Te Conviertes',
    quote: '"No se nos da una vida buena o una vida mala. Se nos da una vida — y depende de nosotros hacerla buena o mala." — Warden',
  },
});

TEXTS['fr'] = buildLocale({
  financial: {
    coverTitle: 'Carte Financière',
    coverSubtitle: 'Votre potentiel de richesse et votre relation à l\'argent',
    overviewTitle: 'Aperçu — Votre Relation à l\'Argent',
    overview1: `L'argent est l'un des domaines les plus chargés émotionnellement de la vie humaine — et le thème natal reflète cette complexité avec précision. Votre histoire financière est écrite sur trois axes principaux : la Maison 2 (ce que vous gagnez, valorisez et construisez personnellement), la Maison 8 (ce qui vient des autres — investissements, héritages, coentreprises et transformation), et les planètes Vénus, Jupiter et Saturne.`,
    overview2: (ruler, num) => `Le maître de votre Maison 2 — ${ruler}, actuellement placé dans la Maison ${num} — est votre planète du "style de gain". L'endroit où se trouve cette planète révèle le canal principal par lequel l'énergie financière entre dans votre vie.`,
    overview3: `Ce rapport cartographie toutes ces couches en séquence. Ce n'est pas une prédiction du montant d'argent que vous aurez — c'est une carte de votre relation naturelle aux ressources.`,
    atAGlance: 'Votre Signature Financière en Un Coup d\'Œil',
    house2Title: (sym, name) => `Maison 2 — ${sym} ${name} : Ressources Personnelles et Estime de Soi`,
    house2Intro: `La Maison 2 est votre trésor personnel : pas seulement l'argent, mais tout ce que vous possédez, tout ce que vous pouvez produire de vos propres mains et de votre esprit.`,
    house2EarningStyle: (name) => `${name} sur la Cuspide de la Maison 2 — Votre Style de Gain`,
    planetsInH2Title: 'Planètes dans Votre Maison 2',
    house2RulerTitle: (ruler, num) => `${ruler} — Maître de Votre Maison 2 (en Maison ${num})`,
    house2RulerText: (ruler, num) => `La planète qui régit le signe sur la cuspide de votre Maison 2 est votre "planète de l'argent". ${ruler} est placé dans votre Maison ${num}.`,
    house8Title: (sym, name) => `Maison 8 — ${sym} ${name} : Ressources Partagées et Transformation`,
    house8Intro: `La Maison 8 est le domaine financier le plus complexe psychologiquement du thème. Elle régit tout ce qui vient des autres : héritages, investissements communs, prêts, assurances, impôts.`,
    house8CuspTitle: (name) => `${name} sur la Cuspide de la Maison 8`,
    planetsInH8Title: 'Planètes dans Votre Maison 8',
    venusTitle: (name, num) => `Vénus en ${name} (Maison ${num}) — Ce Que Vous Attirez`,
    venusIntro: `Vénus est la planète de l'attraction — le principe magnétique qui attire ressources, beauté, plaisir et valeur vers vous.`,
    venusSignTitle: (name) => `Vénus en ${name} — Qualité d'Attraction`,
    venusHouseTitle: (num) => `Vénus en Maison ${num} — Où l'Attraction Se Manifeste`,
    jupiterTitle: (name, num) => `Jupiter en ${name} (Maison ${num}) — Où l'Abondance Circule`,
    jupiterIntro: `Jupiter est la planète de l'expansion, de la générosité et du principe du "plus". En astrologie financière, Jupiter marque où l'abondance arrive le plus naturellement.`,
    jupiterCycleTitle: 'Travailler avec Votre Cycle Jupiter',
    jupiterCycleText: `Jupiter complète un cycle complet du zodiaque tous les 12 ans. Lorsqu'il revient à son signe natal — vers les 12, 24, 36, 48 et 60 ans — il y a une fenêtre naturelle d'expansion financière.`,
    saturnTitle: (name, num) => `Saturne en ${name} (Maison ${num}) — Où la Discipline Construit la Richesse`,
    saturnIntro: `Si Jupiter montre où l'abondance coule facilement, Saturne montre où la richesse se construit avec effort et discipline — et où elle dure.`,
    saturnHouseTitle: (num) => `Saturne en Maison ${num} — Où la Structure Porte Ses Fruits`,
    saturnReturnTitle: 'Le Retour de Saturne et la Maturité Financière',
    saturnReturnText: `Vers les 28-30 ans et à nouveau à 58-60 ans, Saturne revient à sa position natale — le Retour de Saturne. C'est l'un des points de réinitialisation financière les plus significatifs de la vie.`,
    aspectsTitle: 'Aspects Financiers — Connexions de Vénus, Jupiter et Saturne',
    aspectsIntro: `Les aspects entre Vénus, Jupiter et Saturne dans votre thème natal décrivent comment vos trois principes financiers centraux interagissent.`,
    noAspectsText: `Vénus, Jupiter et Saturne dans votre thème ne forment pas d'aspects majeurs proches entre eux.`,
    strengthsTitle: 'Top 5 Forces Financières',
    strengthsIntro: `Les forces suivantes sont dérivées des dignités, des positions dans les maisons et des aspects harmonieux de votre thème.`,
    challengesTitle: 'Top 5 Défis Financiers',
    challengesIntro: `Les défis financiers dans le thème natal ne sont pas des obstacles — ce sont des domaines nécessitant un travail conscient.`,
    adviceTitle: 'Conseils Pratiques et Timing',
    adviceIntro: `La plus grande valeur pratique de l'astrologie dans la planification financière est le timing.`,
    conclusionTitle: 'Conclusion',
    conclusion1: (name, h2, h8, v, j, s) => `${name}, votre carte financière révèle un tableau complet de la façon dont la richesse se déplace dans votre vie.`,
    conclusion2: (ruler) => `L'insight le plus important que ce rapport offre est une description de votre caractère financier naturel. Votre maître de la Maison 2 — ${ruler} — est votre principal instrument de navigation financière.`,
    conclusion3: `L'argent n'est pas séparé du reste de la vie. La même carte qui décrit vos schémas émotionnels décrit aussi votre histoire financière.`,
    quote: '"La richesse ne consiste pas à avoir de grandes possessions, mais à avoir peu de désirs." — Épictète',
  },
  spiritual: {
    coverTitle: 'Carte Spirituelle et Karmique',
    coverSubtitle: 'Le voyage de votre âme révélé',
    overviewTitle: 'Aperçu — Le Voyage de Votre Âme',
    nnTitle: (s) => `☊ Nœud Nord en ${s} — Là Où Va Votre Âme`,
    snTitle: (s) => `☋ Nœud Sud en ${s} — Ce Que Vous Avez Déjà Maîtrisé`,
    house12Title: (s) => `✦ Maison 12 en ${s} — Votre Connexion au Transcendant`,
    neptuneTitle: (s) => `♆ Neptune en ${s} — Où Vous Dissolvez les Frontières`,
    chironTitle: (s) => `⚷ Chiron en ${s} — Votre Blessure Sacrée et Don de Guérison`,
    plutoTitle: (s) => `♇ Pluton en ${s} — Où Opère la Transformation Profonde`,
    saturnKarmicTitle: (s) => `♄ Saturne en ${s} — Leçons Karmiques et Schémas Ancestraux`,
    conclusionTitle: '✦ Conclusion — Intégrer le Chemin Spirituel',
    quote: '"La blessure est l\'endroit par où la Lumière entre en vous." — Rumi',
  },
  saturnReturn: {
    coverTitle: 'Rapport du Retour de Saturne',
    coverSubtitle1st: 'Votre Premier Retour de Saturne',
    coverSubtitle2nd: 'Votre Deuxième Retour de Saturne',
    coverSubtitleBetween: 'Le Retour de Saturne — Votre Passage Décisif',
    overviewTitle: 'Qu\'est-ce que le Retour de Saturne — et Pourquoi Cela Compte',
    conclusionTitle: 'Conclusion — Après le Retour : Qui Vous Devenez',
    quote: '"On ne nous donne pas une bonne vie ou une mauvaise vie. On nous donne une vie — et c\'est à nous de la rendre bonne ou mauvaise." — Warden',
  },
});

TEXTS['de'] = buildLocale({
  financial: {
    coverTitle: 'Finanzkarte',
    coverSubtitle: 'Ihr Wohlstandspotenzial und Ihre Beziehung zum Geld',
    overviewTitle: 'Überblick — Ihre Beziehung zum Geld',
    overview1: `Geld ist einer der emotional aufgeladensten Bereiche des menschlichen Lebens — und das Geburtshoroskop spiegelt diese Komplexität präzise wider. Ihre Finanzgeschichte ist auf drei Hauptachsen geschrieben: das 2. Haus (was Sie persönlich verdienen, wertschätzen und aufbauen), das 8. Haus (was durch andere kommt) und die Planeten Venus, Jupiter und Saturn.`,
    overview2: (ruler, num) => `Der Herrscher Ihres 2. Hauses — ${ruler}, derzeit im ${num}. Haus — ist Ihr Planet des "Verdienstils". Der Ort dieses Planeten offenbart den primären Kanal, durch den finanzielle Energie in Ihr Leben eintritt.`,
    overview3: `Dieser Bericht kartiert all diese Ebenen der Reihe nach. Es ist keine Vorhersage, wie viel Geld Sie haben werden — es ist eine Karte Ihrer natürlichen Beziehung zu Ressourcen.`,
    atAGlance: 'Ihre Finanzielle Signatur auf einen Blick',
    house2Title: (sym, name) => `2. Haus — ${sym} ${name}: Persönliche Ressourcen & Selbstwert`,
    house2Intro: `Das 2. Haus ist Ihr persönlicher Schatz: nicht nur Geld, sondern alles, was Sie besitzen und produzieren können.`,
    house2EarningStyle: (name) => `${name} auf der Spitze des 2. Hauses — Ihr Verdienstil`,
    planetsInH2Title: 'Planeten in Ihrem 2. Haus',
    house2RulerTitle: (ruler, num) => `${ruler} — Herrscher Ihres 2. Hauses (im ${num}. Haus)`,
    house2RulerText: (ruler, num) => `Der Planet, der das Zeichen auf der Spitze Ihres 2. Hauses regiert, ist Ihr "Geldplanet". ${ruler} befindet sich in Ihrem ${num}. Haus.`,
    house8Title: (sym, name) => `8. Haus — ${sym} ${name}: Gemeinsame Ressourcen & Transformation`,
    house8Intro: `Das 8. Haus ist der psychologisch komplexeste Finanzbereich des Horoskops. Es regiert alles, was von oder durch andere kommt.`,
    house8CuspTitle: (name) => `${name} auf der Spitze des 8. Hauses`,
    planetsInH8Title: 'Planeten in Ihrem 8. Haus',
    venusTitle: (name, num) => `Venus in ${name} (${num}. Haus) — Was Sie Anziehen`,
    venusIntro: `Venus ist der Planet der Anziehung — das magnetische Prinzip, das Ressourcen, Schönheit, Freude und Wert zu Ihnen zieht.`,
    venusSignTitle: (name) => `Venus in ${name} — Anziehungsqualität`,
    venusHouseTitle: (num) => `Venus im ${num}. Haus — Wo sich Anziehung Manifestiert`,
    jupiterTitle: (name, num) => `Jupiter in ${name} (${num}. Haus) — Wo Fülle Fließt`,
    jupiterIntro: `Jupiter ist der Planet der Expansion, der Großzügigkeit und des Prinzips des "Mehr". In der Finanzastrologie markiert Jupiter, wo Fülle am natürlichsten ankommt.`,
    jupiterCycleTitle: 'Mit Ihrem Jupiter-Zyklus Arbeiten',
    jupiterCycleText: `Jupiter vollendet alle 12 Jahre einen vollständigen Zodiakumlauf. Wenn er zu seinem Geburtszeichen zurückkehrt, gibt es ein natürliches Fenster für finanzielle Expansion.`,
    saturnTitle: (name, num) => `Saturn in ${name} (${num}. Haus) — Wo Disziplin Reichtum Aufbaut`,
    saturnIntro: `Wenn Jupiter zeigt, wo Fülle leicht fließt, zeigt Saturn, wo Reichtum mit Mühe und Disziplin aufgebaut wird — und wo er dauerhaft ist.`,
    saturnHouseTitle: (num) => `Saturn im ${num}. Haus — Wo Struktur Sich Auszahlt`,
    saturnReturnTitle: 'Die Saturnrückkehr und Finanzielle Reife',
    saturnReturnText: `Rund um das Alter von 28-30 und erneut mit 58-60 Jahren kehrt Saturn zu seiner Geburtsposition zurück — die Saturnrückkehr.`,
    aspectsTitle: 'Finanzielle Aspekte — Venus-, Jupiter- & Saturn-Verbindungen',
    aspectsIntro: `Die Aspekte zwischen Venus, Jupiter und Saturn in Ihrem Geburtshoroskop beschreiben, wie Ihre drei finanziellen Kernprinzipien interagieren.`,
    noAspectsText: `Venus, Jupiter und Saturn in Ihrem Horoskop bilden keine engen Hauptaspekte zueinander.`,
    strengthsTitle: 'Top 5 Finanzielle Stärken',
    strengthsIntro: `Die folgenden Stärken leiten sich aus Würden, Hausstellungen und harmonischen Aspekten in Ihrem Horoskop ab.`,
    challengesTitle: 'Top 5 Finanzielle Herausforderungen',
    challengesIntro: `Finanzielle Herausforderungen im Geburtshoroskop sind keine Hindernisse — sie sind Bereiche, die bewusste Arbeit erfordern.`,
    adviceTitle: 'Praktische Ratschläge & Timing',
    adviceIntro: `Der größte praktische Wert der Astrologie in der Finanzplanung ist das Timing.`,
    conclusionTitle: 'Schlussfolgerung',
    conclusion1: (name, h2, h8, v, j, s) => `${name}, Ihre Finanzkarte enthüllt ein vollständiges Bild davon, wie sich Reichtum in Ihrem Leben bewegt.`,
    conclusion2: (ruler) => `Der wichtigste Einblick dieses Berichts ist eine Beschreibung Ihres natürlichen finanziellen Charakters. Ihr Herrscher des 2. Hauses — ${ruler} — ist Ihr primäres Finanznavigationsinstrument.`,
    conclusion3: `Geld ist nicht vom Rest des Lebens getrennt. Dieselbe Karte, die Ihre emotionalen Muster beschreibt, beschreibt auch Ihre Finanzgeschichte.`,
    quote: '"Reichtum besteht nicht darin, viele Besitztümer zu haben, sondern wenige Wünsche." — Epiktet',
  },
  spiritual: {
    coverTitle: 'Spirituelle & Karmische Karte',
    coverSubtitle: 'Die Reise Ihrer Seele enthüllt',
    overviewTitle: 'Überblick — Die Reise Ihrer Seele',
    nnTitle: (s) => `☊ Mondknoten in ${s} — Wohin Ihre Seele Geht`,
    snTitle: (s) => `☋ Südknoten in ${s} — Was Sie Bereits Gemeistert Haben`,
    house12Title: (s) => `✦ 12. Haus in ${s} — Ihre Verbindung zum Transzendenten`,
    neptuneTitle: (s) => `♆ Neptun in ${s} — Wo Sie Grenzen Auflösen`,
    chironTitle: (s) => `⚷ Chiron in ${s} — Ihre Heilige Wunde und Heilungsgabe`,
    plutoTitle: (s) => `♇ Pluto in ${s} — Wo Tiefe Transformation Wirkt`,
    saturnKarmicTitle: (s) => `♄ Saturn in ${s} — Karmische Lektionen und Ahnenmuster`,
    conclusionTitle: '✦ Schlussfolgerung — Integration des Spirituellen Weges',
    quote: '"Die Wunde ist der Ort, durch den das Licht in dich eindringt." — Rumi',
  },
  saturnReturn: {
    coverTitle: 'Saturn-Rückkehr-Bericht',
    coverSubtitle1st: 'Ihre Erste Saturn-Rückkehr',
    coverSubtitle2nd: 'Ihre Zweite Saturn-Rückkehr',
    coverSubtitleBetween: 'Die Saturn-Rückkehr — Ihr Wegweisendes Erlebnis',
    overviewTitle: 'Was Ist eine Saturn-Rückkehr — und Warum Sie Wichtig Ist',
    conclusionTitle: 'Schlussfolgerung — Nach der Rückkehr: Wer Sie Werden',
    quote: '"Wir bekommen kein gutes oder schlechtes Leben. Wir bekommen ein Leben — und es liegt an uns, es gut oder schlecht zu machen." — Warden',
  },
});

TEXTS['it'] = buildLocale({
  financial: {
    coverTitle: 'Mappa Finanziaria',
    coverSubtitle: 'Il tuo potenziale di ricchezza e il tuo rapporto con il denaro',
    overviewTitle: 'Panoramica — Il Tuo Rapporto con il Denaro',
    overview1: `Il denaro è una delle aree emotivamente più cariche della vita umana — e la carta natale riflette questa complessità con precisione. La tua storia finanziaria è scritta su tre assi principali: la Casa 2, la Casa 8 e i pianeti Venere, Giove e Saturno.`,
    overview2: (ruler, num) => `Il signore della tua Casa 2 — ${ruler}, attualmente posizionato nella Casa ${num} — è il tuo pianeta dello "stile di guadagno". Dove si trova questo pianeta rivela il canale primario attraverso cui l'energia finanziaria entra nella tua vita.`,
    overview3: `Questo rapporto mappa tutti questi livelli in sequenza. Non è una previsione di quanto denaro avrai — è una mappa del tuo rapporto naturale con le risorse.`,
    atAGlance: 'La Tua Firma Finanziaria in Sintesi',
    house2Title: (sym, name) => `Casa 2 — ${sym} ${name}: Risorse Personali e Autostima`,
    house2Intro: `La Casa 2 è il tuo tesoro personale: non solo denaro, ma tutto ciò che possiedi e puoi produrre con le tue mani e la tua mente.`,
    house2EarningStyle: (name) => `${name} alla Cuspide della Casa 2 — Il Tuo Stile di Guadagno`,
    planetsInH2Title: 'Pianeti nella Tua Casa 2',
    house2RulerTitle: (ruler, num) => `${ruler} — Signore della Tua Casa 2 (in Casa ${num})`,
    house2RulerText: (ruler, num) => `Il pianeta che governa il segno sulla cuspide della tua Casa 2 è il tuo "pianeta del denaro". ${ruler} si trova nella tua Casa ${num}.`,
    house8Title: (sym, name) => `Casa 8 — ${sym} ${name}: Risorse Condivise e Trasformazione`,
    house8Intro: `La Casa 8 è il dominio finanziario psicologicamente più complesso della carta. Governa tutto ciò che viene da o attraverso gli altri.`,
    house8CuspTitle: (name) => `${name} alla Cuspide della Casa 8`,
    planetsInH8Title: 'Pianeti nella Tua Casa 8',
    venusTitle: (name, num) => `Venere in ${name} (Casa ${num}) — Cosa Attiri`,
    venusIntro: `Venere è il pianeta dell'attrazione — il principio magnetico che attira risorse, bellezza, piacere e valore verso di te.`,
    venusSignTitle: (name) => `Venere in ${name} — Qualità di Attrazione`,
    venusHouseTitle: (num) => `Venere in Casa ${num} — Dove si Manifesta l'Attrazione`,
    jupiterTitle: (name, num) => `Giove in ${name} (Casa ${num}) — Dove Scorre l'Abbondanza`,
    jupiterIntro: `Giove è il pianeta dell'espansione, della generosità e del principio del "di più". In astrologia finanziaria, Giove segna dove l'abbondanza arriva più naturalmente.`,
    jupiterCycleTitle: 'Lavorare con il Tuo Ciclo di Giove',
    jupiterCycleText: `Giove completa un ciclo completo dello zodiaco ogni 12 anni. Quando ritorna al suo segno natale, si apre una finestra naturale di espansione finanziaria.`,
    saturnTitle: (name, num) => `Saturno in ${name} (Casa ${num}) — Dove la Disciplina Costruisce Ricchezza`,
    saturnIntro: `Se Giove mostra dove scorre facilmente l'abbondanza, Saturno mostra dove la ricchezza si costruisce con impegno e disciplina — e dove dura.`,
    saturnHouseTitle: (num) => `Saturno in Casa ${num} — Dove la Struttura Ripaga`,
    saturnReturnTitle: 'Il Ritorno di Saturno e la Maturità Finanziaria',
    saturnReturnText: `Intorno ai 28-30 anni e di nuovo a 58-60, Saturno torna alla sua posizione natale — il Ritorno di Saturno.`,
    aspectsTitle: 'Aspetti Finanziari — Connessioni di Venere, Giove e Saturno',
    aspectsIntro: `Gli aspetti tra Venere, Giove e Saturno nella tua carta natale descrivono come interagiscono i tuoi tre principi finanziari centrali.`,
    noAspectsText: `Venere, Giove e Saturno nella tua carta non formano aspetti maggiori ravvicinati tra loro.`,
    strengthsTitle: 'Top 5 Punti di Forza Finanziari',
    strengthsIntro: `I seguenti punti di forza derivano da dignità, posizioni nelle case e aspetti armoniosi nella tua carta.`,
    challengesTitle: 'Top 5 Sfide Finanziarie',
    challengesIntro: `Le sfide finanziarie nella carta natale non sono ostacoli — sono aree che richiedono lavoro consapevole.`,
    adviceTitle: 'Consigli Pratici e Tempistica',
    adviceIntro: `Il maggior valore pratico dell'astrologia nella pianificazione finanziaria è il tempismo.`,
    conclusionTitle: 'Conclusione',
    conclusion1: (name, h2, h8, v, j, s) => `${name}, la tua mappa finanziaria rivela un quadro completo di come la ricchezza si muove nella tua vita.`,
    conclusion2: (ruler) => `Il signore della tua Casa 2 — ${ruler} — è il tuo principale strumento di navigazione finanziaria.`,
    conclusion3: `Il denaro non è separato dal resto della vita. La stessa carta che descrive i tuoi schemi emotivi descrive anche la tua storia finanziaria.`,
    quote: '"La ricchezza non consiste nell\'avere grandi possessi, ma nell\'avere pochi desideri." — Epitteto',
  },
  spiritual: {
    coverTitle: 'Mappa Spirituale e Karmica',
    coverSubtitle: 'Il viaggio della tua anima rivelato',
    overviewTitle: 'Panoramica — Il Viaggio della Tua Anima',
    nnTitle: (s) => `☊ Nodo Nord in ${s} — Dove Va la Tua Anima`,
    snTitle: (s) => `☋ Nodo Sud in ${s} — Ciò che Hai Già Padroneggiato`,
    house12Title: (s) => `✦ Casa 12 in ${s} — La Tua Connessione al Trascendente`,
    neptuneTitle: (s) => `♆ Nettuno in ${s} — Dove Dissolvi i Confini`,
    chironTitle: (s) => `⚷ Chirone in ${s} — La Tua Ferita Sacra e Dono di Guarigione`,
    plutoTitle: (s) => `♇ Plutone in ${s} — Dove Opera la Trasformazione Profonda`,
    saturnKarmicTitle: (s) => `♄ Saturno in ${s} — Lezioni Karmiche e Schemi Ancestrali`,
    conclusionTitle: '✦ Conclusione — Integrare il Cammino Spirituale',
    quote: '"La ferita è il luogo da cui entra la Luce." — Rumi',
  },
  saturnReturn: {
    coverTitle: 'Rapporto del Ritorno di Saturno',
    coverSubtitle1st: 'Il Tuo Primo Ritorno di Saturno',
    coverSubtitle2nd: 'Il Tuo Secondo Ritorno di Saturno',
    coverSubtitleBetween: 'Il Ritorno di Saturno — Il Tuo Passaggio Decisivo',
    overviewTitle: 'Cos\'è un Ritorno di Saturno — e Perché è Importante',
    conclusionTitle: 'Conclusione — Dopo il Ritorno: Chi Diventi',
    quote: '"Non ci viene data una vita buona o cattiva. Ci viene data una vita — e sta a noi renderla buona o cattiva." — Warden',
  },
});

TEXTS['nl'] = buildLocale({
  financial: {
    coverTitle: 'Financiële Kaart',
    coverSubtitle: 'Uw rijkdomspotentieel en uw relatie met geld',
    overviewTitle: 'Overzicht — Uw Relatie met Geld',
    overview1: `Geld is een van de emotioneel meest geladen gebieden van het menselijk leven — en de geboortehoroscoop weerspiegelt die complexiteit nauwkeurig. Uw financiële verhaal is geschreven op drie primaire assen: het 2e Huis, het 8e Huis en de planeten Venus, Jupiter en Saturnus.`,
    overview2: (ruler, num) => `De heerser van uw 2e Huis — ${ruler}, momenteel in het ${num}e Huis — is uw planeet van "verdienstijl". Waar deze planeet zich bevindt, onthult het primaire kanaal waardoor financiële energie uw leven binnenkomt.`,
    overview3: `Dit rapport brengt al deze lagen in volgorde in kaart. Het is geen voorspelling van hoeveel geld u zult hebben — het is een kaart van uw natuurlijke relatie met middelen.`,
    atAGlance: 'Uw Financiële Handtekening in één Oogopslag',
    house2Title: (sym, name) => `2e Huis — ${sym} ${name}: Persoonlijke Middelen & Eigenwaarde`,
    house2Intro: `Het 2e Huis is uw persoonlijke schatkamer: niet alleen geld, maar alles wat u bezit en kunt produceren.`,
    house2EarningStyle: (name) => `${name} op de Cuspis van het 2e Huis — Uw Verdienstijl`,
    planetsInH2Title: 'Planeten in Uw 2e Huis',
    house2RulerTitle: (ruler, num) => `${ruler} — Heerser van Uw 2e Huis (in Huis ${num})`,
    house2RulerText: (ruler, num) => `De planeet die het teken op de cuspis van uw 2e Huis regeert, is uw "geldplaneet". ${ruler} staat in uw ${num}e Huis.`,
    house8Title: (sym, name) => `8e Huis — ${sym} ${name}: Gedeelde Middelen & Transformatie`,
    house8Intro: `Het 8e Huis is het psychologisch meest complexe financiële domein van de horoscoop.`,
    house8CuspTitle: (name) => `${name} op de Cuspis van het 8e Huis`,
    planetsInH8Title: 'Planeten in Uw 8e Huis',
    venusTitle: (name, num) => `Venus in ${name} (Huis ${num}) — Wat U Aantrekt`,
    venusIntro: `Venus is de planeet van aantrekking — het magnetische principe dat middelen, schoonheid, plezier en waarde naar u toe trekt.`,
    venusSignTitle: (name) => `Venus in ${name} — Aantrekkingskwaliteit`,
    venusHouseTitle: (num) => `Venus in Huis ${num} — Waar Aantrekking zich Manifesteert`,
    jupiterTitle: (name, num) => `Jupiter in ${name} (Huis ${num}) — Waar Overvloed Stroomt`,
    jupiterIntro: `Jupiter is de planeet van expansie, vrijgevigheid en het principe van "meer". In financiële astrologie markeert Jupiter waar overvloed het meest natuurlijk aankomt.`,
    jupiterCycleTitle: 'Werken met Uw Jupiter-Cyclus',
    jupiterCycleText: `Jupiter voltooit elke 12 jaar een volledige dierenriemcyclus. Wanneer hij terugkeert naar zijn geboortesteken, is er een natuurlijk venster van financiële expansie.`,
    saturnTitle: (name, num) => `Saturnus in ${name} (Huis ${num}) — Waar Discipline Rijkdom Opbouwt`,
    saturnIntro: `Als Jupiter laat zien waar overvloed gemakkelijk stroomt, laat Saturnus zien waar rijkdom met inspanning en discipline wordt opgebouwd.`,
    saturnHouseTitle: (num) => `Saturnus in Huis ${num} — Waar Structuur Loont`,
    saturnReturnTitle: 'De Saturnusretour en Financiële Volwassenheid',
    saturnReturnText: `Rond de leeftijd van 28-30 jaar en opnieuw bij 58-60 jaar keert Saturnus terug naar zijn geboortestand — de Saturnusretour.`,
    aspectsTitle: 'Financiële Aspecten — Venus-, Jupiter- & Saturnusverbindingen',
    aspectsIntro: `De aspecten tussen Venus, Jupiter en Saturnus in uw geboortehoroscoop beschrijven hoe uw drie centrale financiële principes op elkaar inwerken.`,
    noAspectsText: `Venus, Jupiter en Saturnus in uw horoscoop vormen geen nauwe grote aspecten met elkaar.`,
    strengthsTitle: 'Top 5 Financiële Sterktes',
    strengthsIntro: `De volgende sterktes zijn afgeleid van waardigheden, huisposities en harmonische aspecten in uw horoscoop.`,
    challengesTitle: 'Top 5 Financiële Uitdagingen',
    challengesIntro: `Financiële uitdagingen in de geboortehoroscoop zijn geen obstakels — het zijn gebieden die bewust werk vereisen.`,
    adviceTitle: 'Praktisch Advies & Timing',
    adviceIntro: `De grootste praktische waarde van astrologie in financiële planning is timing.`,
    conclusionTitle: 'Conclusie',
    conclusion1: (name, h2, h8, v, j, s) => `${name}, uw financiële kaart onthult een volledig en genuanceerd beeld van hoe rijkdom zich in uw leven beweegt.`,
    conclusion2: (ruler) => `De heerser van uw 2e Huis — ${ruler} — is uw primaire financiële navigatie-instrument.`,
    conclusion3: `Geld staat niet los van de rest van het leven. Dezelfde kaart die uw emotionele patronen beschrijft, beschrijft ook uw financiële verhaal.`,
    quote: '"Rijkdom bestaat niet uit het hebben van grote bezittingen, maar uit het hebben van weinig verlangens." — Epictetus',
  },
  spiritual: {
    coverTitle: 'Spirituele & Karmische Kaart',
    coverSubtitle: 'De reis van uw ziel onthult',
    overviewTitle: 'Overzicht — De Reis van Uw Ziel',
    nnTitle: (s) => `☊ Noordknoop in ${s} — Waar Uw Ziel Naartoe Gaat`,
    snTitle: (s) => `☋ Zuidknoop in ${s} — Wat U Al Beheerst Heeft`,
    house12Title: (s) => `✦ 12e Huis in ${s} — Uw Verbinding met het Transcendente`,
    neptuneTitle: (s) => `♆ Neptunus in ${s} — Waar U Grenzen Oplost`,
    chironTitle: (s) => `⚷ Chiron in ${s} — Uw Heilige Wond en Geneeskundige Gave`,
    plutoTitle: (s) => `♇ Pluto in ${s} — Waar Diepe Transformatie Werkt`,
    saturnKarmicTitle: (s) => `♄ Saturnus in ${s} — Karmische Lessen en Voorouderlijke Patronen`,
    conclusionTitle: '✦ Conclusie — Het Spirituele Pad Integreren',
    quote: '"De wond is de plek waar het Licht naar binnen komt." — Rumi',
  },
  saturnReturn: {
    coverTitle: 'Saturnusretour Rapport',
    coverSubtitle1st: 'Uw Eerste Saturnusretour',
    coverSubtitle2nd: 'Uw Tweede Saturnusretour',
    coverSubtitleBetween: 'De Saturnusretour — Uw Bepalende Overgang',
    overviewTitle: 'Wat Is een Saturnusretour — en Waarom Het Ertoe Doet',
    conclusionTitle: 'Conclusie — Na de Retour: Wie U Wordt',
    quote: '"We krijgen geen goed of slecht leven. We krijgen een leven — en het is aan ons om het goed of slecht te maken." — Warden',
  },
});

TEXTS['tr'] = buildLocale({
  financial: {
    coverTitle: 'Finansal Harita',
    coverSubtitle: 'Servet potansiyeliniz ve parayla ilişkiniz',
    overviewTitle: 'Genel Bakış — Parayla İlişkiniz',
    overview1: `Para, insan yaşamının en duygusal yüklü alanlarından biridir — ve doğum haritası bu karmaşıklığı hassas biçimde yansıtır. Mali hikayeniz üç ana eksen üzerine yazılıdır: 2. Ev, 8. Ev ve Venüs, Jüpiter ve Satürn gezegenleri.`,
    overview2: (ruler, num) => `2. Evinizin yöneticisi — ${ruler}, şu anda ${num}. Evde — "kazanç tarzı" gezegenidir. Bu gezegenin konumu, mali enerjinin yaşamınıza girdiği birincil kanalı ortaya koyar.`,
    overview3: `Bu rapor tüm bu katmanları sırayla haritalandırır. Ne kadar para sahibi olacağınızın tahmini değil — kaynaklarla doğal ilişkinizin haritasıdır.`,
    atAGlance: 'Finansal İmzanız Bir Bakışta',
    house2Title: (sym, name) => `2. Ev — ${sym} ${name}: Kişisel Kaynaklar ve Öz Değer`,
    house2Intro: `2. Ev kişisel hazinenizdir: sadece para değil, sahip olduğunuz her şey ve kendi ellerinizle üretebileceğiniz her şey.`,
    house2EarningStyle: (name) => `2. Ev Tepesinde ${name} — Kazanç Tarzınız`,
    planetsInH2Title: '2. Evinizdeki Gezegenler',
    house2RulerTitle: (ruler, num) => `${ruler} — 2. Evinizin Yöneticisi (${num}. Evde)`,
    house2RulerText: (ruler, num) => `2. Evinizin tepesindeki burcu yöneten gezegen "para gezegeni"nizdir. ${ruler}, ${num}. Evinizde yer almaktadır.`,
    house8Title: (sym, name) => `8. Ev — ${sym} ${name}: Ortak Kaynaklar ve Dönüşüm`,
    house8Intro: `8. Ev, haritanın psikolojik açıdan en karmaşık mali alanıdır. Miras, ortak yatırımlar, krediler ve derin dönüşümü kapsar.`,
    house8CuspTitle: (name) => `8. Ev Tepesinde ${name}`,
    planetsInH8Title: '8. Evinizdeki Gezegenler',
    venusTitle: (name, num) => `Venüs ${name}'da (${num}. Ev) — Ne Çekiyorsunuz`,
    venusIntro: `Venüs, kaynakları, güzelliği, zevki ve değeri size çeken manyetik prensip — cazibe gezegenidir.`,
    venusSignTitle: (name) => `Venüs ${name}'da — Cazibe Kalitesi`,
    venusHouseTitle: (num) => `${num}. Evde Venüs — Cazibenin Tezahür Ettiği Yer`,
    jupiterTitle: (name, num) => `Jüpiter ${name}'da (${num}. Ev) — Bolluğun Aktığı Yer`,
    jupiterIntro: `Jüpiter, genişleme, cömertlik ve "daha fazla" prensibinin gezegenidir. Mali astrolojide Jüpiter, bolluğun en doğal biçimde geldiği yeri işaretler.`,
    jupiterCycleTitle: 'Jüpiter Döngünüzle Çalışmak',
    jupiterCycleText: `Jüpiter her 12 yılda bir tam bir zodyak döngüsünü tamamlar. Doğum burcuna döndüğünde doğal bir mali genişleme penceresi açılır.`,
    saturnTitle: (name, num) => `Satürn ${name}'da (${num}. Ev) — Disiplinin Servet İnşa Ettiği Yer`,
    saturnIntro: `Jüpiter bolluğun kolayca aktığı yeri gösteriyorsa, Satürn servetin çaba ve disiplinle inşa edildiği yeri gösterir.`,
    saturnHouseTitle: (num) => `${num}. Evde Satürn — Yapının Karşılık Verdiği Yer`,
    saturnReturnTitle: 'Satürn Dönüşü ve Mali Olgunluk',
    saturnReturnText: `28-30 yaşları civarında ve tekrar 58-60 yaşlarında Satürn doğum konumuna döner — Satürn Dönüşü.`,
    aspectsTitle: 'Mali Açılar — Venüs, Jüpiter ve Satürn Bağlantıları',
    aspectsIntro: `Doğum haritanızdaki Venüs, Jüpiter ve Satürn arasındaki açılar, üç temel mali ilkenizin nasıl etkileşime girdiğini anlatır.`,
    noAspectsText: `Haritanızdaki Venüs, Jüpiter ve Satürn arasında yakın büyük açılar bulunmuyor.`,
    strengthsTitle: 'En İyi 5 Mali Güç',
    strengthsIntro: `Aşağıdaki güçler haritanızdaki hâkimiyetlerden, ev konumlarından ve uyumlu açılardan türetilmiştir.`,
    challengesTitle: 'En İyi 5 Mali Zorluk',
    challengesIntro: `Doğum haritasındaki mali zorluklar engel değildir — bilinçli çalışma gerektiren alanlardır.`,
    adviceTitle: 'Pratik Tavsiyeler ve Zamanlama',
    adviceIntro: `Astrolojinin mali planlamadaki en büyük pratik değeri zamanlama — ne zaman agresif genişleyeceğinizi, ne zaman konsolide edeceğinizi bilmektir.`,
    conclusionTitle: 'Sonuç',
    conclusion1: (name, h2, h8, v, j, s) => `${name}, mali haritanız servetin yaşamınızda nasıl hareket ettiğine dair eksiksiz bir tablo ortaya koymaktadır.`,
    conclusion2: (ruler) => `2. Evinizin yöneticisi — ${ruler} — birincil mali navigasyon aracınızdır.`,
    conclusion3: `Para hayatın geri kalanından ayrı değildir. Duygusal kalıplarınızı, yaratıcılığınızı ve ilişkilerinizi anlatan aynı harita mali hikayenizi de anlatır.`,
    quote: '"Zenginlik büyük mülklere sahip olmakta değil, az arzu sahibi olmaktadır." — Epiktetos',
  },
  spiritual: {
    coverTitle: 'Spiritüel ve Karmik Harita',
    coverSubtitle: 'Ruhunuzun yolculuğu ortaya çıktı',
    overviewTitle: 'Genel Bakış — Ruhunuzun Yolculuğu',
    nnTitle: (s) => `☊ Kuzey Düğümü ${s}'da — Ruhunuzun Gittiği Yer`,
    snTitle: (s) => `☋ Güney Düğümü ${s}'da — Zaten Ustalaştığınız Şey`,
    house12Title: (s) => `✦ ${s}'da 12. Ev — Aşkınla Bağlantınız`,
    neptuneTitle: (s) => `♆ Neptün ${s}'da — Sınırları Çözdüğünüz Yer`,
    chironTitle: (s) => `⚷ Kiron ${s}'da — Kutsal Yaranız ve Şifa Hediyeniz`,
    plutoTitle: (s) => `♇ Plüton ${s}'da — Derin Dönüşümün İşlediği Yer`,
    saturnKarmicTitle: (s) => `♄ Satürn ${s}'da — Karmik Dersler ve Ata Örüntüleri`,
    conclusionTitle: '✦ Sonuç — Spiritüel Yolu Entegre Etmek',
    quote: '"Yara, Işığın içinize girdiği yerdir." — Rumi',
  },
  saturnReturn: {
    coverTitle: 'Satürn Dönüşü Raporu',
    coverSubtitle1st: 'Birinci Satürn Dönüşünüz',
    coverSubtitle2nd: 'İkinci Satürn Dönüşünüz',
    coverSubtitleBetween: 'Satürn Dönüşü — Belirleyici Geçişiniz',
    overviewTitle: 'Satürn Dönüşü Nedir — ve Neden Önemlidir',
    conclusionTitle: 'Sonuç — Dönüşten Sonra: Kim Oluyorsunuz',
    quote: '"Bize iyi ya da kötü bir hayat verilmez. Bize bir hayat verilir — ve onu iyi ya da kötü yapmak bize bağlıdır." — Warden',
  },
});

TEXTS['ru'] = buildLocale({
  financial: {
    coverTitle: 'Финансовая Карта',
    coverSubtitle: 'Ваш потенциал богатства и отношения с деньгами',
    overviewTitle: 'Обзор — Ваши Отношения с Деньгами',
    overview1: `Деньги — одна из наиболее эмоционально нагруженных сфер человеческой жизни, и натальная карта отражает эту сложность с точностью. Ваша финансовая история написана на трёх основных осях: 2-й дом, 8-й дом и планеты Венера, Юпитер и Сатурн.`,
    overview2: (ruler, num) => `Управитель вашего 2-го дома — ${ruler}, находящийся в ${num}-м доме — это ваша планета «стиля заработка». Положение этой планеты раскрывает основной канал, через который финансовая энергия входит в вашу жизнь.`,
    overview3: `Этот отчёт последовательно картографирует все эти уровни. Это не предсказание того, сколько денег у вас будет — это карта вашего естественного отношения к ресурсам.`,
    atAGlance: 'Ваша Финансовая Подпись с Первого Взгляда',
    house2Title: (sym, name) => `2-й Дом — ${sym} ${name}: Личные Ресурсы и Самооценка`,
    house2Intro: `2-й дом — это ваша личная сокровищница: не только деньги, но всё, чем вы владеете и что можете произвести своими руками и умом.`,
    house2EarningStyle: (name) => `${name} на Куспиде 2-го Дома — Ваш Стиль Заработка`,
    planetsInH2Title: 'Планеты в Вашем 2-м Доме',
    house2RulerTitle: (ruler, num) => `${ruler} — Управитель Вашего 2-го Дома (в ${num}-м Доме)`,
    house2RulerText: (ruler, num) => `Планета, управляющая знаком на куспиде вашего 2-го дома — это ваша «денежная планета». ${ruler} находится в вашем ${num}-м доме.`,
    house8Title: (sym, name) => `8-й Дом — ${sym} ${name}: Общие Ресурсы и Трансформация`,
    house8Intro: `8-й дом — психологически наиболее сложная финансовая область карты. Он управляет всем, что приходит от других или через них.`,
    house8CuspTitle: (name) => `${name} на Куспиде 8-го Дома`,
    planetsInH8Title: 'Планеты в Вашем 8-м Доме',
    venusTitle: (name, num) => `Венера в ${name} (${num}-й Дом) — Что Вы Притягиваете`,
    venusIntro: `Венера — планета притяжения, магнетический принцип, влекущий к вам ресурсы, красоту, удовольствие и ценность.`,
    venusSignTitle: (name) => `Венера в ${name} — Качество Притяжения`,
    venusHouseTitle: (num) => `Венера в ${num}-м Доме — Где Проявляется Притяжение`,
    jupiterTitle: (name, num) => `Юпитер в ${name} (${num}-й Дом) — Где Течёт Изобилие`,
    jupiterIntro: `Юпитер — планета расширения, щедрости и принципа «больше». В финансовой астрологии Юпитер отмечает место, где изобилие приходит наиболее естественно.`,
    jupiterCycleTitle: 'Работа с Вашим Циклом Юпитера',
    jupiterCycleText: `Юпитер завершает полный цикл зодиака каждые 12 лет. Когда он возвращается в свой натальный знак, открывается естественное окно финансового расширения.`,
    saturnTitle: (name, num) => `Сатурн в ${name} (${num}-й Дом) — Где Дисциплина Строит Богатство`,
    saturnIntro: `Если Юпитер показывает, где изобилие течёт легко, Сатурн показывает, где богатство строится с усилием и дисциплиной — и где оно длится.`,
    saturnHouseTitle: (num) => `Сатурн в ${num}-м Доме — Где Структура Окупается`,
    saturnReturnTitle: 'Возвращение Сатурна и Финансовая Зрелость',
    saturnReturnText: `Примерно в 28-30 лет и снова в 58-60, Сатурн возвращается на своё натальное положение — Возвращение Сатурна.`,
    aspectsTitle: 'Финансовые Аспекты — Связи Венеры, Юпитера и Сатурна',
    aspectsIntro: `Аспекты между Венерой, Юпитером и Сатурном в вашей натальной карте описывают взаимодействие трёх ключевых финансовых принципов.`,
    noAspectsText: `Венера, Юпитер и Сатурн в вашей карте не образуют близких мажорных аспектов между собой.`,
    strengthsTitle: 'Топ 5 Финансовых Сильных Сторон',
    strengthsIntro: `Следующие сильные стороны выведены из достоинств, позиций в домах и гармоничных аспектов карты.`,
    challengesTitle: 'Топ 5 Финансовых Вызовов',
    challengesIntro: `Финансовые вызовы в натальной карте — не препятствия, а области, требующие осознанной работы.`,
    adviceTitle: 'Практические Советы и Тайминг',
    adviceIntro: `Наибольшая практическая ценность астрологии в финансовом планировании — это тайминг.`,
    conclusionTitle: 'Заключение',
    conclusion1: (name, h2, h8, v, j, s) => `${name}, ваша финансовая карта раскрывает полную картину того, как богатство движется в вашей жизни.`,
    conclusion2: (ruler) => `Управитель вашего 2-го дома — ${ruler} — является вашим основным финансовым навигационным инструментом.`,
    conclusion3: `Деньги не отделены от остальной жизни. Та же карта, которая описывает ваши эмоциональные паттерны, описывает и вашу финансовую историю.`,
    quote: '"Богатство состоит не в обладании великими ценностями, а в малом числе желаний." — Эпиктет',
  },
  spiritual: {
    coverTitle: 'Духовная и Кармическая Карта',
    coverSubtitle: 'Путешествие вашей души раскрыто',
    overviewTitle: 'Обзор — Путешествие Вашей Души',
    nnTitle: (s) => `☊ Северный Узел в ${s} — Куда Движется Ваша Душа`,
    snTitle: (s) => `☋ Южный Узел в ${s} — Что Вы Уже Освоили`,
    house12Title: (s) => `✦ 12-й Дом в ${s} — Ваша Связь с Трансцендентным`,
    neptuneTitle: (s) => `♆ Нептун в ${s} — Где Вы Растворяете Границы`,
    chironTitle: (s) => `⚷ Хирон в ${s} — Ваша Священная Рана и Дар Исцеления`,
    plutoTitle: (s) => `♇ Плутон в ${s} — Где Действует Глубокая Трансформация`,
    saturnKarmicTitle: (s) => `♄ Сатурн в ${s} — Кармические Уроки и Родовые Паттерны`,
    conclusionTitle: '✦ Заключение — Интеграция Духовного Пути',
    quote: '"Рана — это место, откуда входит Свет." — Руми',
  },
  saturnReturn: {
    coverTitle: 'Отчёт о Возвращении Сатурна',
    coverSubtitle1st: 'Ваше Первое Возвращение Сатурна',
    coverSubtitle2nd: 'Ваше Второе Возвращение Сатурна',
    coverSubtitleBetween: 'Возвращение Сатурна — Ваш Определяющий Переход',
    overviewTitle: 'Что Такое Возвращение Сатурна — и Почему Это Важно',
    conclusionTitle: 'Заключение — После Возвращения: Кем Вы Становитесь',
    quote: '"Нам не дана хорошая или плохая жизнь. Нам дана жизнь — и от нас зависит сделать её хорошей или плохой." — Warden',
  },
});

TEXTS['zh'] = buildLocale({
  financial: {
    coverTitle: '财务星图',
    coverSubtitle: '您的财富潜力与金钱关系',
    overviewTitle: '概览 — 您与金钱的关系',
    overview1: `金钱是人类生活中情感负荷最重的领域之一——本命星盘精确地反映了这种复杂性。您的财务故事写在三条主要轴线上：第二宫、第八宫以及金星、木星、土星。`,
    overview2: (ruler, num) => `您第二宫的主宰星——${ruler}，目前位于第${num}宫——是您的"赚钱方式"星。这颗星所在的位置揭示了财务能量进入您生命的主要渠道。`,
    overview3: `本报告按顺序绘制所有这些层面。这不是预测您将拥有多少钱——而是您与资源自然关系的地图。`,
    atAGlance: '您的财务特征一览',
    house2Title: (sym, name) => `第二宫 — ${sym} ${name}：个人资源与自我价值`,
    house2Intro: `第二宫是您的个人宝库：不仅是金钱，还包括您拥有的一切以及您用双手和思维能创造的一切。`,
    house2EarningStyle: (name) => `第二宫宫头${name} — 您的赚钱风格`,
    planetsInH2Title: '您第二宫中的行星',
    house2RulerTitle: (ruler, num) => `${ruler} — 您第二宫的主宰星（位于第${num}宫）`,
    house2RulerText: (ruler, num) => `主宰您第二宫宫头星座的行星是您的"金钱星"。${ruler}位于您的第${num}宫。`,
    house8Title: (sym, name) => `第八宫 — ${sym} ${name}：共同资源与转化`,
    house8Intro: `第八宫是星盘中心理上最复杂的财务领域。它主管来自他人的一切：遗产、联合投资、贷款、保险和深度转化。`,
    house8CuspTitle: (name) => `第八宫宫头${name}`,
    planetsInH8Title: '您第八宫中的行星',
    venusTitle: (name, num) => `金星在${name}（第${num}宫） — 您所吸引的`,
    venusIntro: `金星是吸引力的行星——吸引资源、美丽、愉悦和价值向您靠近的磁性原则。`,
    venusSignTitle: (name) => `金星在${name} — 吸引力质量`,
    venusHouseTitle: (num) => `金星在第${num}宫 — 吸引力展现之处`,
    jupiterTitle: (name, num) => `木星在${name}（第${num}宫） — 丰盛流动之处`,
    jupiterIntro: `木星是扩张、慷慨和"更多"原则的行星。在财务占星中，木星标志着丰盛最自然到来之处。`,
    jupiterCycleTitle: '运用您的木星周期',
    jupiterCycleText: `木星每12年完成一个完整的黄道周期。当它回到本命星座时，就会打开自然的财务扩张窗口。`,
    saturnTitle: (name, num) => `土星在${name}（第${num}宫） — 纪律构建财富之处`,
    saturnIntro: `如果木星显示丰盛容易流动之处，土星则显示财富通过努力和纪律构建之处——并且在那里持久。`,
    saturnHouseTitle: (num) => `土星在第${num}宫 — 结构回报之处`,
    saturnReturnTitle: '土星回归与财务成熟',
    saturnReturnText: `约在28-30岁，以及58-60岁时，土星回到其本命位置——土星回归。`,
    aspectsTitle: '财务相位 — 金星、木星和土星的连结',
    aspectsIntro: `本命星盘中金星、木星和土星之间的相位描述您三大核心财务原则的互动方式。`,
    noAspectsText: `您星盘中的金星、木星和土星之间没有形成紧密的主要相位。`,
    strengthsTitle: '前5大财务优势',
    strengthsIntro: `以下优势来源于星盘中的品位、宫位和和谐相位。`,
    challengesTitle: '前5大财务挑战',
    challengesIntro: `本命星盘中的财务挑战不是障碍——而是需要有意识努力的领域。`,
    adviceTitle: '实用建议与时机',
    adviceIntro: `占星学在财务规划中最大的实用价值是时机——知道何时积极扩张，何时巩固，何时等待。`,
    conclusionTitle: '结论',
    conclusion1: (name, h2, h8, v, j, s) => `${name}，您的财务星图揭示了财富在您生命中流动方式的完整细腻图景。`,
    conclusion2: (ruler) => `您的第二宫主宰星——${ruler}——是您的主要财务导航工具。`,
    conclusion3: `金钱与生活的其他方面并不分离。描述您情感模式的同一张星盘也描述了您的财务故事。`,
    quote: '"财富不在于拥有巨大的财产，而在于拥有很少的欲望。" — 爱比克泰德',
  },
  spiritual: {
    coverTitle: '灵性与业力星图',
    coverSubtitle: '您灵魂旅程的揭示',
    overviewTitle: '概览 — 您灵魂的旅程',
    nnTitle: (s) => `☊ 北交点在${s} — 您灵魂前进的方向`,
    snTitle: (s) => `☋ 南交点在${s} — 您已经掌握的`,
    house12Title: (s) => `✦ 第十二宫在${s} — 您与超越的连结`,
    neptuneTitle: (s) => `♆ 海王星在${s} — 您溶解界限之处`,
    chironTitle: (s) => `⚷ 凯龙在${s} — 您神圣的伤口与疗愈天赋`,
    plutoTitle: (s) => `♇ 冥王星在${s} — 深层转化运作之处`,
    saturnKarmicTitle: (s) => `♄ 土星在${s} — 业力课题与祖先模式`,
    conclusionTitle: '✦ 结论 — 整合灵性之路',
    quote: '"伤口是光进入您的地方。" — 鲁米',
  },
  saturnReturn: {
    coverTitle: '土星回归报告',
    coverSubtitle1st: '您的第一次土星回归',
    coverSubtitle2nd: '您的第二次土星回归',
    coverSubtitleBetween: '土星回归 — 您的决定性过渡',
    overviewTitle: '什么是土星回归 — 以及为何重要',
    conclusionTitle: '结论 — 回归之后：您成为谁',
    quote: '"我们没有被给予好的生活或坏的生活。我们被给予一种生活——而让它变好或变坏取决于我们。" — Warden',
  },
});

TEXTS['ja'] = buildLocale({
  financial: {
    coverTitle: '財務マップ',
    coverSubtitle: 'あなたの富の可能性とお金との関係',
    overviewTitle: '概要 — あなたとお金の関係',
    overview1: `お金は人間の生活の中で最も感情的に充電された分野の一つです。出生ホロスコープはその複雑さを精密に反映しています。あなたの財務物語は3つの主要な軸に書かれています：第2ハウス、第8ハウス、そして金星・木星・土星。`,
    overview2: (ruler, num) => `あなたの第2ハウスのルーラー——${ruler}、現在第${num}ハウスに位置——は「稼ぎ方スタイル」の惑星です。この惑星の位置が財務エネルギーがあなたの人生に入る主要なチャネルを明らかにします。`,
    overview3: `このレポートはこれらすべての層を順番にマッピングします。あなたがいくらのお金を持つかの予測ではなく、資源との自然な関係のマップです。`,
    atAGlance: 'あなたの財務シグネチャー一覧',
    house2Title: (sym, name) => `第2ハウス — ${sym} ${name}：個人資源と自己価値`,
    house2Intro: `第2ハウスはあなたの個人的な宝庫です：お金だけでなく、あなたが所有するすべてのもの、自分の手と心で生み出せるすべてのもの。`,
    house2EarningStyle: (name) => `第2ハウスのカスプに${name} — あなたの稼ぎスタイル`,
    planetsInH2Title: 'あなたの第2ハウスの惑星',
    house2RulerTitle: (ruler, num) => `${ruler} — あなたの第2ハウスのルーラー（第${num}ハウス）`,
    house2RulerText: (ruler, num) => `第2ハウスのカスプのサインを支配する惑星があなたの「マネー惑星」です。${ruler}はあなたの第${num}ハウスに位置しています。`,
    house8Title: (sym, name) => `第8ハウス — ${sym} ${name}：共有資源と変容`,
    house8Intro: `第8ハウスはホロスコープで最も心理的に複雑な財務領域です。遺産、共同投資、ローン、保険など他者からのすべてを支配します。`,
    house8CuspTitle: (name) => `第8ハウスのカスプに${name}`,
    planetsInH8Title: 'あなたの第8ハウスの惑星',
    venusTitle: (name, num) => `金星${name}座（第${num}ハウス） — あなたが引き寄せるもの`,
    venusIntro: `金星は引き寄せの惑星——資源、美、喜び、価値をあなたに向けて引き寄せる磁気的原理です。`,
    venusSignTitle: (name) => `金星${name}座 — 引き寄せの質`,
    venusHouseTitle: (num) => `第${num}ハウスの金星 — 引き寄せが現れる場所`,
    jupiterTitle: (name, num) => `木星${name}座（第${num}ハウス） — 豊かさが流れる場所`,
    jupiterIntro: `木星は拡大、寛大さ、「もっと」の原理の惑星です。財務占星術では、木星が豊かさが最も自然に訪れる場所を示します。`,
    jupiterCycleTitle: '木星サイクルを活用する',
    jupiterCycleText: `木星は12年ごとに黄道を一周します。出生サインに戻るとき、自然な財務拡大の窓が開きます。`,
    saturnTitle: (name, num) => `土星${name}座（第${num}ハウス） — 規律が富を築く場所`,
    saturnIntro: `木星が豊かさが容易に流れる場所を示すなら、土星は努力と規律で富が築かれる場所——そして持続する場所を示します。`,
    saturnHouseTitle: (num) => `第${num}ハウスの土星 — 構造が報われる場所`,
    saturnReturnTitle: '土星回帰と財務的成熟',
    saturnReturnText: `28〜30歳頃、そして58〜60歳に、土星は出生時の位置に戻ります——土星回帰。`,
    aspectsTitle: '財務アスペクト — 金星・木星・土星の繋がり',
    aspectsIntro: `出生ホロスコープの金星・木星・土星間のアスペクトは、あなたの3つの中核財務原理がどのように相互作用するかを示します。`,
    noAspectsText: `あなたのホロスコープでは金星・木星・土星は近接した主要アスペクトを形成していません。`,
    strengthsTitle: '財務的強み トップ5',
    strengthsIntro: `以下の強みは、ホロスコープの品位、ハウス配置、調和的アスペクトから導き出されています。`,
    challengesTitle: '財務的課題 トップ5',
    challengesIntro: `出生ホロスコープの財務的課題は障害ではなく、意識的な取り組みを必要とする分野です。`,
    adviceTitle: '実践的アドバイスとタイミング',
    adviceIntro: `財務計画における占星術の最大の実用的価値はタイミングです。`,
    conclusionTitle: '結論',
    conclusion1: (name, h2, h8, v, j, s) => `${name}さん、あなたの財務マップは富があなたの人生でどのように動くかの完全な全貌を明らかにします。`,
    conclusion2: (ruler) => `第2ハウスのルーラー——${ruler}——はあなたの主要な財務ナビゲーション手段です。`,
    conclusion3: `お金は人生の残りとは切り離されていません。感情パターンを描いた同じホロスコープが財務の物語も描いています。`,
    quote: '"富は大きな財産を持つことにあるのではなく、少ない欲望を持つことにある。" — エピクテトス',
  },
  spiritual: {
    coverTitle: 'スピリチュアル＆カルミックマップ',
    coverSubtitle: 'あなたの魂の旅が明かされる',
    overviewTitle: '概要 — あなたの魂の旅',
    nnTitle: (s) => `☊ ノースノード${s}座 — あなたの魂が向かう方向`,
    snTitle: (s) => `☋ サウスノード${s}座 — すでにマスターしたこと`,
    house12Title: (s) => `✦ ${s}座の第12ハウス — 超越とのつながり`,
    neptuneTitle: (s) => `♆ 海王星${s}座 — 境界を溶かす場所`,
    chironTitle: (s) => `⚷ カイロン${s}座 — 神聖な傷と癒しの贈り物`,
    plutoTitle: (s) => `♇ 冥王星${s}座 — 深い変容が働く場所`,
    saturnKarmicTitle: (s) => `♄ 土星${s}座 — カルミックな教えと先祖のパターン`,
    conclusionTitle: '✦ 結論 — スピリチュアルな道の統合',
    quote: '"傷は光が入ってくる場所だ。" — ルーミー',
  },
  saturnReturn: {
    coverTitle: '土星回帰レポート',
    coverSubtitle1st: 'あなたの第1次土星回帰',
    coverSubtitle2nd: 'あなたの第2次土星回帰',
    coverSubtitleBetween: '土星回帰 — あなたの決定的な通過点',
    overviewTitle: '土星回帰とは何か — そしてなぜ重要か',
    conclusionTitle: '結論 — 回帰の後：あなたが何者になるか',
    quote: '"私たちは良い人生や悪い人生を与えられるのではない。人生を与えられるのだ——それを良くするか悪くするかは私たちにかかっている。" — Warden',
  },
});
