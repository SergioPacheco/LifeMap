export const learn = {
  title: '学习占星学',
  subtitle: '适合初学者和进阶学生的完整指南。理解天象语言的基础知识。',
  sections: [
    { slug: 'first-steps', icon: '🌟', title: '入门第一步', description: '什么是本命星盘？占星学如何运作？从这里开始。' },
    { slug: 'planets', icon: '☉ ☽ ♃', title: '行星', description: '太阳、月亮、水星到冥王星——每颗行星在您星盘中的意义。' },
    { slug: 'signs', icon: '♈ ♉ ♊', title: '十二星座', description: '元素、模式以及每个黄道星座的独特能量。' },
    { slug: 'houses', icon: '🏠', title: '十二宫位', description: '生活领域——行星在您星盘中发挥作用的地方。' },
    { slug: 'aspects', icon: '△ □ ☍', title: '相位', description: '行星之间的对话——和谐、张力与潜能。' },
    { slug: 'chiron', icon: '⚷', title: '凯龙——受伤的疗愈者', description: '成为礼物的伤口：理解凯龙在您星盘中的角色。' },
    { slug: 'planetary-cycles', icon: '🔄', title: '行星周期', description: '土星回归、中年危机以及人生的重要里程碑。' },
    { slug: 'new-moon', icon: '🌑', title: '新月', description: '如何利用月相种下意图，开启新的循环。' },
  ],
  premiumCta: { icon: '📄', title: '个性化报告', description: '想要深入了解吗？我们的PDF报告带来对您星盘的深度诠释。' },
  firstSteps: {
    title: '占星学入门',
    whatIsChart: { title: '什么是本命星盘？', text: '本命星盘（或出生星盘）是您出生那一刻，从您出生地看到的天空快照。需要三个数据：出生日期、时间和地点。' },
    notJustSun: { title: '您不只是您的太阳星座！', text: '当有人问"你是什么星座？"时，他们只是在问太阳在哪里。但您的星盘中有10颗行星，每颗都在不同的星座和宫位。', big3: { title: '"大三角" — 您的基本三位一体：', sun: '太阳 — 您的存在（身份、自我）', moon: '月亮 — 您的感受（情感、需求）', asc: '上升点 — 您的外表（社交面具、身体）' } },
    threeIngredients: { title: '星盘的三个要素', planets: { label: '行星', desc: '什么——心理功能' }, signs: { label: '星座', desc: '如何——风格、能量品质' }, houses: { label: '宫位', desc: '哪里——生活领域' }, example: '示例："火星（行动）在双子座（沟通）第10宫（职业）"= 通过职业沟通行动的人。' },
    determinism: { title: '占星学是宿命论的吗？', text: '不是。星盘显示潜能，而非固定命运。就像土壤：您可以种植任何东西，但土壤类型影响什么最容易生长。' },
    nextSteps: { title: '下一步', chart: '计算您的本命星盘', chartSub: '免费、即时、无需注册', planets: '了解行星', signs: '探索十二星座', houses: '十二宫位' },
  },
};
