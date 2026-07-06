// ============================================================
// SPIRITUAL-REPORT.TS — Spiritual & Karmic Map (T38)
// 15-20 pages focused on soul evolution, karma, and transcendence
// ============================================================

import { jsPDF } from 'jspdf';
import type { NatalChart } from '../engine/types';
import { getSignIndex } from '../engine/calculations';
import { SATURN_IN_HOUSE, SATURN_IN_SIGN, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE } from '../engine/outer-planets';
import { CHIRON_IN_HOUSE, CHIRON_IN_SIGN } from '../engine/chiron';
import { getAspectInterpretation } from '../engine/aspect-interpretations';
import { getInterpretations } from '../engine/interpretations/index';
import type { ReportOptions } from './report-generators';

// ============================================================
// SHARED CONSTANTS (mirrored from report-generators.ts)
// ============================================================

const COLORS = {
  brand: [107, 33, 168] as [number, number, number],
  brandLight: [139, 92, 246] as [number, number, number],
  text: [30, 30, 30] as [number, number, number],
  textLight: [100, 100, 100] as [number, number, number],
  line: [200, 200, 200] as [number, number, number],
  bg: [250, 250, 255] as [number, number, number],
  gold: [180, 140, 50] as [number, number, number],
  red: [180, 40, 40] as [number, number, number],
};

const SIGN_NAMES = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
const PLANET_NAMES: Record<string, string> = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
  northNode: 'North Node', chiron: 'Chiron',
};

// ============================================================
// HELPERS (mirrored from report-generators.ts)
// ============================================================

function renderCover(doc: jsPDF, title: string, subtitle: string, options: ReportOptions, icon: string) {
  const w = 210, h = 297;
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, w, h, 'F');
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(2);
  doc.line(20, 30, w - 20, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.brand);
  doc.text('LifeMap Pro', w / 2, 55, { align: 'center' });
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.text);
  doc.text(title, w / 2, 72, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textLight);
  doc.text(subtitle, w / 2, 84, { align: 'center' });
  doc.setFontSize(50);
  doc.setTextColor(...COLORS.brandLight);
  doc.text(icon, w / 2, 130, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.text);
  doc.text(options.profileName, w / 2, 170, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textLight);
  doc.text(`${options.birthDate}  ${options.birthTime}`, w / 2, 182, { align: 'center' });
  doc.text(options.birthCity, w / 2, 192, { align: 'center' });
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(1);
  doc.line(20, h - 30, w - 20, h - 30);
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textLight);
  doc.text('www.lifemap.pro', w / 2, h - 20, { align: 'center' });
}

function addFooters(doc: jsPDF, name: string) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textLight);
    doc.text(`${name} — LifeMap Pro`, 20, 287);
    doc.text(`${i} / ${pageCount}`, 190, 287, { align: 'right' });
  }
}

function wrapText(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight = 5): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSectionTitle(doc: jsPDF, title: string, y: number, margin: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.brand);
  doc.text(title, margin, y);
  y += 4;
  doc.setDrawColor(...COLORS.brandLight);
  doc.setLineWidth(0.5);
  doc.line(margin, y, 190, y);
  return y + 6;
}

function addSubTitle(doc: jsPDF, title: string, y: number, margin: number): number {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brand);
  doc.text(title, margin, y);
  return y + 6;
}

function checkPage(doc: jsPDF, y: number): number {
  if (y > 255) { doc.addPage(); return 30; }
  return y;
}

function tryoutCut(doc: jsPDF, options: ReportOptions, reportName: string, price: string): Blob | null {
  if (!options.isTryout) return null;
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(50);
    doc.setTextColor(200, 200, 200);
    doc.text('SAMPLE', 105, 200, { align: 'center', angle: 45 });
  }
  doc.addPage();
  const w = 210;
  let y = 70;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.brand);
  doc.text('This was a free sample!', w / 2, y, { align: 'center' });
  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(`The complete "${reportName}" report contains`, w / 2, y, { align: 'center' });
  doc.text('15-20 pages of deep, personalized spiritual interpretation.', w / 2, y + 14, { align: 'center' });
  y += 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...COLORS.gold);
  doc.text(`Full version: ${price}`, w / 2, y, { align: 'center' });
  y += 25;
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('www.lifemap.pro/reports', w / 2, y, { align: 'center' });
  y += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.textLight);
  doc.text('Buy now and download instantly — 100% in your browser.', w / 2, y, { align: 'center' });
  addFooters(doc, options.profileName);
  return doc.output('blob') as unknown as Blob;
}

// ============================================================
// SPIRITUAL INTERPRETATION DATA
// ============================================================

// North Node in House — evolutionary direction
const NORTH_NODE_IN_HOUSE_SPIRITUAL: string[] = [
  /* H1 */ 'Your soul is called to develop a strong, authentic sense of self in this lifetime. Past lives may have been characterized by self-sacrifice and living through others. Now the evolutionary imperative is clear: step forward as a distinct individual. Embrace your own needs, desires, and identity without guilt. The more you courageously inhabit your own presence, the more you fulfill your soul\'s purpose.',
  /* H2 */ 'Your evolutionary path leads toward building genuine self-worth and material security from within. In past lives, you may have relied too heavily on shared resources or others\' values. This lifetime calls you to develop your own talents, earn your own way, and ground your value in what you alone can offer the world. Stability earned by your own hands becomes sacred.',
  /* H3 */ 'Your soul is growing toward clear communication, intellectual curiosity, and engagement with your immediate environment. The temptation to retreat into grand philosophies or distant visions (South Node in 9th) must give way to curiosity about what is right in front of you — conversations, learning, writing, local community. Truth lives in the details of daily exchange.',
  /* H4 */ 'Your evolutionary direction is inward and foundational — toward creating emotional security, honoring your roots, and building a true sense of home. Career ambition and public identity (South Node in 10th) are familiar, perhaps too comfortable. The soul\'s growth now lies in vulnerability, family, and inner belonging rather than outer achievement.',
  /* H5 */ 'Your soul is called toward creative expression, joy, and the courage to let your inner light shine. Collective causes and group belonging (South Node in 11th) have been your comfort zone across lifetimes. Now evolution demands the personal: your unique creative gift, romantic love, and the willingness to be seen for who you are specifically — not just as part of a movement.',
  /* H6 */ 'Your evolutionary path is one of devoted service, craft mastery, and integration of body and spirit. The soul is learning that transcendence is not found by escaping daily life (South Node in 12th) but by bringing full presence and care to it. Work, health practices, and humble service become the spiritual path itself.',
  /* H7 */ 'Your soul grows through deep commitment to partnership and the mirror of the other. The independent, self-reliant patterns of past lives (South Node in 1st) are no longer sufficient. Evolution now requires learning to truly see another person, to negotiate, to commit, and to discover who you are in genuine relationship. The other is your teacher.',
  /* H8 */ 'Your evolutionary direction is toward deep transformation, intimacy, and the mysteries of death and rebirth. Comfort with what is simple and tangible (South Node in 2nd) must expand into willingness to merge, to release, and to be changed by what you cannot control. The soul grows through crisis, inheritance, and profound emotional nakedness.',
  /* H9 */ 'Your soul is expanding toward higher wisdom, philosophical understanding, and direct experience of the sacred. The small, the local, the merely factual (South Node in 3rd) can no longer contain your spirit. You are called to seek meaning beyond information — through travel, study, spiritual practice, or the development of a genuine worldview that guides your life.',
  /* H10 */ 'Your evolutionary purpose involves stepping into a public role, claiming authority, and contributing something lasting to the world. The private, domestic, and family-oriented patterns of past lives (South Node in 4th) are well-developed. Now the soul\'s growth requires visible leadership and the courage to be known for what you stand for.',
  /* H11 */ 'Your soul is called toward collective vision, friendship, and contributing to a larger community. The creative, ego-centered patterns of past lives (South Node in 5th) must open into something bigger than personal expression. You grow by aligning your gifts with a cause, finding your tribe, and dreaming a future that includes more than just yourself.',
  /* H12 */ 'Your evolutionary direction is inward and transcendent — toward spiritual surrender, compassion without bounds, and the dissolution of the separate self into something greater. The analytical, service-oriented habits of past lives (South Node in 6th) have been useful, but now the soul requires silence, contemplation, and direct encounter with the sacred mystery.',
];

// North Node in Sign — evolutionary qualities to develop
const NORTH_NODE_IN_SIGN_SPIRITUAL: string[] = [
  /* Aries */ 'With North Node in Aries, your soul\'s growth requires developing courage, directness, and the willingness to act without waiting for consensus. You are learning to be the initiator — to trust your instincts and step forward even when uncertain. The evolutionary call is toward bold, unapologetic selfhood.',
  /* Taurus */ 'With North Node in Taurus, your evolution involves slowing down, building tangible security, and finding the sacred in simple pleasure. The soul is learning patience, embodiment, and the wisdom of what endures. Groundedness is spiritual practice.',
  /* Gemini */ 'With North Node in Gemini, your growth calls you toward intellectual curiosity, genuine communication, and comfort with life\'s inherent ambiguity. The soul is learning that not every question needs a final answer — that the exchange itself is the point. Stay curious, stay light.',
  /* Cancer */ 'With North Node in Cancer, your evolutionary path leads toward emotional vulnerability, nurturing, and the creation of genuine belonging. The soul is learning to feel deeply without apology and to create safety — for yourself first, then for others.',
  /* Leo */ 'With North Node in Leo, your soul is called to creative self-expression, heartfelt leadership, and the courage to be seen. You are learning that your individuality is not a burden but a gift — and that the world genuinely needs your particular light.',
  /* Virgo */ 'With North Node in Virgo, your growth involves developing discernment, practical skill, and devoted service. The soul learns that the sacred lives in the details — in getting things right, in showing up consistently, in the humble miracle of competent care.',
  /* Libra */ 'With North Node in Libra, your evolution calls you toward genuine partnership, fairness, and the art of conscious relationship. The soul is learning to balance its own needs with those of others — and to find meaning in the space between two people.',
  /* Scorpio */ 'With North Node in Scorpio, your soul\'s growth requires depth, transformation, and the willingness to lose what no longer serves in order to be reborn. You are learning to trust the process of death and renewal — and to find power in surrender rather than in control.',
  /* Sagittarius */ 'With North Node in Sagittarius, your evolutionary direction is toward faith, philosophical expansion, and direct experience of meaning. The soul is learning to trust a larger intelligence — to move beyond facts into the wisdom that transcends them.',
  /* Capricorn */ 'With North Node in Capricorn, your growth calls you toward responsibility, mature authority, and the discipline of building something that lasts. The soul is learning that structure is not the enemy of freedom — it is the ground that makes real freedom possible.',
  /* Aquarius */ 'With North Node in Aquarius, your evolution involves contributing to something larger than yourself — community, collective vision, and the future of humanity. The soul is learning to hold a vision of what could be, and to work with others to bring it into being.',
  /* Pisces */ 'With North Node in Pisces, your soul\'s evolutionary direction is toward surrender, compassion, and mystical union. You are learning to dissolve the boundaries of the separate self into something greater — through art, spiritual practice, service, or the simple act of being fully present with another\'s suffering.',
];

// Saturn in Sign — karmic lessons (spiritual framing)
const SATURN_KARMIC: string[] = [
  /* Aries */ 'Saturn in Aries carries karmic lessons around identity, courage, and the right to initiate. The soul has accumulated patterns of either forcing itself forward without care for others, or holding back its own will entirely. The integration required is disciplined courage — acting from genuine inner authority, not from fear or aggression.',
  /* Taurus */ 'Saturn in Taurus carries karmic patterns around material security, self-worth, and resistance to change. The soul must learn to build lasting value without becoming enslaved to it — to enjoy what is here without clinging when it transforms.',
  /* Gemini */ 'Saturn in Gemini carries karmic lessons around communication, truthfulness, and the integrity of the mind. There may be ancestral patterns of deception, self-censorship, or intellectual dishonesty to work through. The path is toward words that match inner reality.',
  /* Cancer */ 'Saturn in Cancer carries deep ancestral patterning around emotional safety, family, and the nature of care. There is often a lineage wound — something unresolved in the family system that the soul has taken on to heal. The work is learning to receive nurturing as well as to give it.',
  /* Leo */ 'Saturn in Leo carries karmic material around creative expression, recognition, and the fear of being seen. The soul has either been punished for its light in past patterns, or has over-expressed at the expense of others. The path is toward genuine, humble radiance.',
  /* Virgo */ 'Saturn in Virgo carries karmic themes of service, perfectionism, and the relationship between the body and the spirit. The soul may have accumulated shame around imperfection or health. Integration means offering devoted service from wholeness, not from fear of failure.',
  /* Libra */ 'Saturn in Libra carries karmic patterns in relationship — unresolved contracts, injustices, and karmic obligations between souls. The soul is learning what true fairness and mature partnership require, beyond codependence or isolation.',
  /* Scorpio */ 'Saturn in Scorpio carries some of the heaviest karmic material: issues of power, betrayal, sexuality, and psychic inheritance. The soul is working through generations of unexpressed shadow. The path is toward radical honesty and the responsible use of deep personal power.',
  /* Sagittarius */ 'Saturn in Sagittarius carries karmic themes around belief, truth, and the abuse or abandonment of spiritual authority. The soul may have been a teacher who misled, or a student who was betrayed by their guide. The integration is toward earned wisdom — truth that has been tested, not merely proclaimed.',
  /* Capricorn */ 'Saturn in Capricorn (its domicile) carries the full weight of karmic structure — ancestral obligations, societal expectations, and the burden of legacy. The soul must learn to honor duty without being crushed by it, and to build a life of integrity rather than mere appearance.',
  /* Aquarius */ 'Saturn in Aquarius carries karmic patterns around group belonging, social responsibility, and the tension between individual freedom and collective obligation. The soul is working through lifetimes of either rigid conformity or rebellious isolation — seeking the middle path of authentic participation.',
  /* Pisces */ 'Saturn in Pisces carries karmic themes of spiritual discipline versus spiritual escapism. The soul has encountered the allure of dissolution — of merging with the infinite in ways that bypassed earthly responsibility. The integration requires bringing the spiritual firmly into incarnation.',
];

// Neptune in House — spiritual framing
const NEPTUNE_SPIRITUAL: string[] = [
  /* H1 */ 'Neptune in the 1st House infuses your entire identity with a spiritual, empathic quality. You are a channel more than a fixed self — boundaries between you and others are naturally thin. Your spiritual gift is the ability to embody compassion and divine sensitivity. The challenge is maintaining enough ego structure to function without losing yourself.',
  /* H2 */ 'Neptune in the 2nd House dissolves the boundary between the material and the sacred. Value, for you, is not merely financial — it is intrinsic, spiritual, ineffable. You may struggle with conventional money management, but you have access to a deep understanding of what truly matters. The spiritual practice here is radical trust in abundance.',
  /* H3 */ 'Neptune in the 3rd House makes communication an act of mystical transmission. You speak and write in a way that touches something beyond the literal. The spiritual challenge is discerning between genuine intuitive knowing and wishful thinking in your daily mental life.',
  /* H4 */ 'Neptune in the 4th House places the spiritual at the foundation of your being — in the family, in memory, in the sense of home as sacred space. There may be something mysterious or unclear in the family of origin. The soul work is creating an inner home that connects to the transpersonal.',
  /* H5 */ 'Neptune in the 5th House makes creativity a spiritual act. When you create, you channel something beyond yourself. Romance, too, has a mystical quality — you seek the divine in the beloved. The work is maintaining clarity about what is real versus idealized in love and creative life.',
  /* H6 */ 'Neptune in the 6th House brings a spiritual dimension to daily work and health. You may be called to healing, service, or work that involves sensitivity and compassion. The body-spirit connection is central to your wellbeing. Practices that honor both the physical and the transcendent sustain you best.',
  /* H7 */ 'Neptune in the 7th House seeks the divine in relationship. You long for a soul-union with a partner — something that transcends the ordinary. This is both your greatest longing and your greatest vulnerability, as it can lead to idealization and disappointment. The spiritual practice is learning to see your partner clearly while still honoring the sacred quality of love.',
  /* H8 */ 'Neptune in the 8th House places the mystical at the center of transformation. Death, rebirth, and the mysteries of psychic inheritance are your spiritual territory. Mediumship, dream work, depth psychology, and shamanic practices may feel natural. The boundary between the living and the dead is thin for you.',
  /* H9 */ 'Neptune in the 9th House is one of the most naturally spiritual placements. Philosophy, religion, and direct mystical experience are the native terrain of your soul. You may receive spiritual visions or feel drawn to multiple traditions. The practice is grounding transcendent insight in daily lived reality.',
  /* H10 */ 'Neptune in the 10th House brings a spiritual dimension to your public role. You may be called to heal, inspire, or serve as a channel for collective ideals in your career. The challenge is maintaining healthy ego boundaries when public projection can dissolve the self.',
  /* H11 */ 'Neptune in the 11th House brings spiritual idealism to community and collective vision. You feel a mystical sense of belonging to a larger spiritual family — human and beyond. The work is choosing groups and ideals consciously rather than being absorbed by collective currents you haven\'t examined.',
  /* H12 */ 'Neptune in the 12th House (its domicile) is one of the most powerful mystical placements. The unconscious is your portal to the divine. Dreams, meditation, solitude, and creative immersion are your most direct spiritual access points. The boundary between you and the universal is, by nature, permeable.',
];

// Pluto in House — transformation/spiritual framing
const PLUTO_KARMIC: string[] = [
  /* H1 */ 'Pluto in the 1st House carries the weight of the soul\'s transformative power in the very center of identity. You were born as an agent of change — often experiencing early circumstances that forced profound transformation of self. The karmic work is learning to wield deep personal power with integrity rather than domination.',
  /* H2 */ 'Pluto in the 2nd House brings the soul\'s transformative work into the realm of values, resources, and self-worth. There may be karmic patterns around financial power, possession, or the distorted belief that worth is earned rather than inherent. The path is radical inner wealth — value that no external circumstance can take.',
  /* H3 */ 'Pluto in the 3rd House places the soul\'s depth work in the arena of communication and thought. The mind is an instrument of transformation — your words carry weight that others may not fully perceive. Karmic patterns may involve the misuse of communication: manipulation, secrecy, or the silencing of truth.',
  /* H4 */ 'Pluto in the 4th House carries ancestral shadow — the unprocessed material of the family lineage that has been passed down for generations. The soul has chosen to be the one in this family system who transforms the inherited wound. This is both a heavy burden and a profound calling.',
  /* H5 */ 'Pluto in the 5th House brings transformative intensity to creativity, love, and self-expression. There may be karmic patterns around the abuse or suppression of creative and sexual power. The soul\'s path is toward full, responsible embodiment of its creative and erotic life force.',
  /* H6 */ 'Pluto in the 6th House carries karmic material around service, health, and the relationship between powerlessness and devotion. The soul may have patterns of either forced service or the compulsive need to control daily life as a response to deeper chaos. Integration means choosing service freely.',
  /* H7 */ 'Pluto in the 7th House brings the soul\'s deepest transformative material into partnerships. There are karmic contracts with specific souls — relationships destined to catalyze profound change. Power dynamics, obsession, and betrayal in relationships are the soul\'s primary classroom.',
  /* H8 */ 'Pluto in the 8th House (its natural home) carries the full intensity of death-rebirth consciousness. The soul has traversed many cycles of loss and renewal — across lifetimes and within this one. The karmic work is developing an unshakeable relationship with impermanence: surrendering gracefully to what must die.',
  /* H9 */ 'Pluto in the 9th House transforms belief systems, philosophy, and the relationship with the sacred. The soul may have experienced — or perpetuated — religious or philosophical tyranny in past incarnations. The path is toward a truth that liberates rather than controls.',
  /* H10 */ 'Pluto in the 10th House carries karmic material around power, authority, and public legacy. The soul has wielded or been subject to significant public power in past lives. This incarnation calls for the conscious, ethical use of authority — power that serves transformation, not control.',
  /* H11 */ 'Pluto in the 11th House transforms the relationship with collective power, groups, and social change. The soul may have been involved in revolutionary movements — or been crushed by them. The karmic work is channeling the impulse for collective transformation through conscious, non-destructive means.',
  /* H12 */ 'Pluto in the 12th House carries the heaviest karmic weight — material hidden even from the conscious self, accumulated across many lifetimes. The soul\'s deepest transformations happen in solitude, in dreams, and in the encounter with the invisible. The spiritual path is one of radical surrender to what lies beyond the ego.',
];

// ============================================================
// SPIRITUAL PRACTICES by placement
// ============================================================

function getSpiritualPractices(nnSign: number, neptuneHouse: number, chironHouse: number, saturnSign: number): string[] {
  const practices: string[] = [];

  // Based on North Node sign
  const nnPractices: Record<number, string> = {
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
  };

  // Based on Neptune house
  const neptunePractices: Record<number, string> = {
    1: 'Mirror meditation and identity practices — consciously inhabiting your body without merging with others\' projections.',
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
  };

  // Based on Chiron house — healing practices
  const chironPractices: Record<number, string> = {
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
  };

  if (nnPractices[nnSign]) practices.push(`For your North Node in ${SIGN_NAMES[nnSign]}: ${nnPractices[nnSign]}`);
  if (neptunePractices[neptuneHouse]) practices.push(`For Neptune in House ${neptuneHouse}: ${neptunePractices[neptuneHouse]}`);
  if (chironPractices[chironHouse]) practices.push(`For Chiron in House ${chironHouse}: ${chironPractices[chironHouse]}`);

  // Saturn-based
  const saturnPractice = saturnSign === 12
    ? 'For Saturn in Pisces: Establish a concrete daily spiritual practice — structure is your liberator, not your prison.'
    : saturnSign === 9
    ? 'For Saturn in Sagittarius: Choose one philosophical or spiritual framework and practice it deeply for a full year before expanding.'
    : 'For Saturn in ' + SIGN_NAMES[saturnSign] + ': Let discipline be your spiritual teacher — what Saturns asks of you is the exact practice your soul most needs.';
  practices.push(saturnPractice);

  return practices;
}

// ============================================================
// T38 — SPIRITUAL & KARMIC MAP (15-20 pages)
// ============================================================

export function generateSpiritualPdf(chart: NatalChart, options: ReportOptions): Blob {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const margin = 20;
  const texts = getInterpretations(options.locale || 'en');

  // Compute positions
  const nnLon = chart.positions.northNode?.longitude || 0;
  const nnSign = getSignIndex(nnLon);
  const snSign = (nnSign + 6) % 12;
  const nnHouse = chart.planetHouses.northNode || 1;
  const snHouse = nnHouse <= 6 ? nnHouse + 6 : nnHouse - 6;

  const neptuneSign = getSignIndex(chart.positions.neptune?.longitude || 0);
  const neptuneHouse = chart.planetHouses.neptune || 12;
  const plutoSign = getSignIndex(chart.positions.pluto?.longitude || 0);
  const plutoHouse = chart.planetHouses.pluto || 8;
  const chironSign = getSignIndex(chart.positions.chiron?.longitude || 0);
  const chironHouse = chart.planetHouses.chiron || 1;
  const saturnSign = getSignIndex(chart.positions.saturn?.longitude || 0);
  const saturnHouse = chart.planetHouses.saturn || 1;

  const h12Sign = getSignIndex(chart.houses.cusps[11]);
  const planetsIn12 = Object.entries(chart.planetHouses).filter(([_, h]) => h === 12).map(([p]) => p);

  // ── P1: Cover ────────────────────────────────────────────
  renderCover(doc, 'Spiritual & Karmic Map', "Your soul's journey revealed", options, '🔮');

  // ── P2: Overview — Your Soul's Journey ───────────────────
  doc.addPage();
  let y = 30;
  y = addSectionTitle(doc, "Overview — Your Soul's Journey", y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const overviewText = `Every natal chart is a map of the soul's current curriculum — the qualities it has come to develop, the wounds it has carried from the deep past, and the evolutionary direction it is reaching toward. This report focuses on the spiritual and karmic dimension of your chart: not prediction, but the deeper story of who you are across time.\n\nThe key indicators explored here are: the North and South Nodes (your evolutionary axis), House 12 (the realm of the unconscious and transcendent), Neptune (the planet of spiritual dissolution and intuition), Chiron (the sacred wound that becomes your greatest gift), Pluto (the agent of deep transformation and karmic clearing), and Saturn (the keeper of ancestral patterns and karmic lessons).\n\nTogether, these placements paint a portrait of what your soul brought into this life, what it is working to release, and where it is growing — in this incarnation, and perhaps beyond it.`;

  y = wrapText(doc, overviewText, margin, y, 170);
  y += 8;

  // Key placements summary box
  doc.setFillColor(245, 240, 255);
  doc.roundedRect(margin, y, 170, 48, 3, 3, 'F');
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.brand);
  doc.text('Your Spiritual Blueprint at a Glance', margin + 4, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  const glanceItems = [
    `☊ North Node: ${SIGN_SYMBOLS[nnSign]} ${SIGN_NAMES[nnSign]} — House ${nnHouse}   |   ☋ South Node: ${SIGN_SYMBOLS[snSign]} ${SIGN_NAMES[snSign]} — House ${snHouse}`,
    `♆ Neptune: ${SIGN_SYMBOLS[neptuneSign]} ${SIGN_NAMES[neptuneSign]} — House ${neptuneHouse}   |   ⚷ Chiron: ${SIGN_SYMBOLS[chironSign]} ${SIGN_NAMES[chironSign]} — House ${chironHouse}`,
    `♇ Pluto: ${SIGN_SYMBOLS[plutoSign]} ${SIGN_NAMES[plutoSign]} — House ${plutoHouse}   |   ♄ Saturn: ${SIGN_SYMBOLS[saturnSign]} ${SIGN_NAMES[saturnSign]} — House ${saturnHouse}`,
    `✦ House 12: ${SIGN_SYMBOLS[h12Sign]} ${SIGN_NAMES[h12Sign]}${planetsIn12.length > 0 ? '  |  Planets within: ' + planetsIn12.map(p => PLANET_NAMES[p] || p).join(', ') : ''}`,
  ];
  for (const item of glanceItems) {
    doc.text(item, margin + 4, y);
    y += 7;
  }
  y += 4;

  // ── P3: North Node ────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `☊ North Node in ${SIGN_NAMES[nnSign]} — Where Your Soul Is Heading`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const nnIntro = `The North Node — called the Dragon's Head in traditional astrology — is not a planet but a mathematical point where the Moon's path crosses the ecliptic. It represents the soul's evolutionary direction: the qualities, experiences, and ways of being that represent genuine growth in this lifetime. Moving toward the North Node often feels unfamiliar, uncomfortable, even threatening to the identity — because it is genuinely new territory for the soul.\n\nYour North Node in ${SIGN_NAMES[nnSign]} in House ${nnHouse} points toward a specific quality of experience that your soul is reaching to embody.`;
  y = wrapText(doc, nnIntro, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `The Evolutionary Direction: ${SIGN_NAMES[nnSign]}`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const nnSignText = (texts.NORTH_NODE_IN_SIGN[nnSign] || NORTH_NODE_IN_SIGN_SPIRITUAL[nnSign] || '');
  y = wrapText(doc, nnSignText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `House ${nnHouse} — The Arena of Soul Growth`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const nnHouseText = (texts.NORTH_NODE_HOUSE[nnHouse - 1] || NORTH_NODE_IN_HOUSE_SPIRITUAL[nnHouse - 1] || '');
  y = wrapText(doc, nnHouseText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'How to Work with Your North Node', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `The North Node does not require you to abandon your past — only to stop living there exclusively. Move toward its qualities in small, concrete steps. Notice when you are avoiding it: that discomfort is the signal you are at the growing edge. Over time, what felt foreign becomes natural, and what was natural deepens into wisdom rather than remaining a refuge from growth.`, margin, y, 170);

  // ── TRYOUT CUT after page 3 ──────────────────────────────
  const tryout = tryoutCut(doc, options, 'Spiritual & Karmic Map', '$34.90');
  if (tryout) return tryout;

  // ── P4: South Node ────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `☋ South Node in ${SIGN_NAMES[snSign]} — What You've Already Mastered`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `The South Node — the Dragon's Tail — represents the soul's accumulated past: the gifts already earned, the skills already developed, the patterns already deeply grooved. It shows what comes naturally, almost too naturally — the place where the soul retreats when growth feels threatening. The South Node is not bad; it is the familiar. The spiritual work is to use its resources consciously rather than being unconsciously ruled by them.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `South Node in ${SIGN_NAMES[snSign]} in House ${snHouse} — The Familiar Territory`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const snDescs: Record<number, string> = {
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
  };
  y = wrapText(doc, snDescs[snSign] || `South Node in ${SIGN_NAMES[snSign]}: your soul's accumulated gifts and the comfort zone it is being called to evolve beyond.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'The Gift and the Trap of the South Node', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `The South Node is not something to overcome or abandon — it is the foundation. Its gifts are real. The danger lies in using those gifts as a substitute for growth rather than as a springboard toward it. When the familiar comfort of the South Node becomes a hiding place from the North Node's call, the soul stagnates. The path is to bring South Node gifts as resources into North Node territory — not to leave them behind, but to stop letting them be the whole story.`, margin, y, 170);

  // ── P5: House 12 ──────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `✦ House 12 in ${SIGN_NAMES[h12Sign]} — Your Connection to the Transcendent`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `The 12th House is the most mystical territory in the natal chart — the realm of the unconscious, karma accumulated before birth, hidden spiritual resources, and the direct interface between the individual soul and the vast transpersonal field. It is associated with solitude, dreams, sacrifice, hidden enemies (most often our own unacknowledged patterns), and the capacity for transcendence.\n\nIn spiritual terms, the 12th House represents both the most powerful resource and the most significant blind spot. What lives here operates below ordinary awareness — surfacing in dreams, in states of deep meditation, in the felt sense of something larger working through us.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `House 12 in ${SIGN_NAMES[h12Sign]} — The Quality of the Hidden Realm`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const h12Descs: Record<number, string> = {
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
  };
  y = wrapText(doc, h12Descs[h12Sign] || `House 12 in ${SIGN_NAMES[h12Sign]}: the unconscious realm carries the spiritual quality of this sign.`, margin, y, 170);
  y += 6;

  if (planetsIn12.length > 0) {
    y = checkPage(doc, y);
    y = addSubTitle(doc, `Planets in House 12: ${planetsIn12.map(p => PLANET_NAMES[p] || p).join(', ')}`, y, margin);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    y = wrapText(doc, `Having planets in the 12th House amplifies the spiritual intensity of this realm considerably. These planets operate as hidden powers — energies that are real and significant but not fully visible to the ordinary ego. They often emerge in dreams, in creative work, in states of solitude, or in moments of genuine spiritual encounter. Working consciously with 12th House planets — through meditation, depth therapy, or contemplative practice — transforms what might otherwise be a source of unconscious self-sabotage into one of your most profound spiritual resources.`, margin, y, 170);
    y += 4;
    for (const p of planetsIn12) {
      y = checkPage(doc, y);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.brand);
      doc.text(`${PLANET_NAMES[p] || p} in House 12`, margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.text);
      const p12Descs: Record<string, string> = {
        sun: 'The Sun in House 12 indicates a soul that finds its truest identity in solitude, in retreat, and in service that dissolves ego rather than inflates it. There is a calling toward spiritual surrender — a path where personal glory is consciously offered up for something greater.',
        moon: 'The Moon in House 12 brings deep emotional sensitivity that operates mostly below the surface of conscious awareness. Psychic attunement, empathic absorption, and vivid dream life are characteristic. The emotional world is more rich and complex than is visible to others.',
        mercury: 'Mercury in House 12 gives a mind that thinks in images, symbols, and intuitive leaps rather than linear logic. Much mental processing happens below conscious awareness — ideas arrive whole, without visible process. Writing and meditative inquiry are powerful spiritual tools.',
        venus: 'Venus in House 12 seeks love that transcends the ordinary — a love that touches the sacred. There is beauty in solitude and in devotional practice. Relationships may have a quality of the hidden or the sacrificed about them.',
        mars: 'Mars in House 12 channels its energy largely in invisible ways — spiritual practice, creative work done in solitude, or service rendered without recognition. The spiritual warrior archetype is strong here: action from non-attachment to outcome.',
        jupiter: 'Jupiter in House 12 is one of the classical indicators of spiritual good fortune — what was called "guardian angel" energy. Invisible assistance arrives in difficult moments. There is genuine grace available through surrender and trust.',
        saturn: 'Saturn in House 12 carries the heaviest karmic weight — structures built in unseen realms, ancestral obligations that have not yet been completed, and the spiritual discipline of working in hidden ways without worldly recognition.',
        uranus: 'Uranus in House 12 generates sudden, unexpected spiritual breakthroughs — flashes of awakening that reorganize the entire perceptual field. The higher mind is activated most powerfully in states of quiet and surrender.',
        neptune: 'Neptune in its natural House amplifies all 12th House themes: mystical sensitivity, dissolution of ego, and the direct experience of the ocean of consciousness that underlies individual existence.',
        pluto: 'Pluto in House 12 carries enormous karmic intensity — ancestral shadow material, past-life residue, and the full weight of what has been hidden across many cycles. The depth of spiritual transformation available here is extraordinary.',
        northNode: 'North Node in House 12 places the entire evolutionary direction inside the mystical dimension — this incarnation is, at its deepest level, a spiritual one. Retreat, contemplation, and transcendence are not escapes but the actual path.',
        chiron: 'Chiron in House 12 places the sacred wound in the most hidden domain — there are hurts so deep they may not be fully accessible to conscious memory. The healing comes through spiritual practice, creative immersion, and the willingness to encounter what has been most avoided.',
      };
      y = wrapText(doc, p12Descs[p] || `${PLANET_NAMES[p] || p} in House 12 brings its energy into the hidden, spiritual dimension of your chart.`, margin, y, 170);
      y += 5;
    }
  }

  // ── P6: Neptune ───────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `♆ Neptune in ${SIGN_NAMES[neptuneSign]} — Where You Dissolve Boundaries`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Neptune is the planet of mysticism, compassion, dissolution, and the longing for union with something greater than the individual self. Where Neptune touches the chart, the boundaries of the ego become permeable — which is simultaneously the greatest spiritual gift and the most challenging vulnerability. Neptune dissolves; it does not define. Its work is to soften the hard edges of the separate self until the underlying unity becomes perceptible.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Neptune in ${SIGN_NAMES[neptuneSign]} — The Generational Spiritual Theme`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Neptune moves slowly — it spends approximately 14 years in each sign, meaning its sign placement describes a generational spiritual current more than a purely individual one. In ${SIGN_NAMES[neptuneSign]}, Neptune has shaped your entire generation's relationship with the spiritual, the imaginal, and the transcendent. You carry this current within you as part of your deepest spiritual inheritance.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Neptune in House ${neptuneHouse} — Where the Veil is Thinnest`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const neptuneText = (NEPTUNE_SPIRITUAL[neptuneHouse - 1] || texts.NEPTUNE_IN_HOUSE?.[neptuneHouse - 1] || NEPTUNE_IN_HOUSE[neptuneHouse - 1] || `Neptune in House ${neptuneHouse}: the spiritual and the transcendent dissolve the boundaries of this life area.`);
  y = wrapText(doc, neptuneText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'Neptune Aspects — Where Dissolution Meets Other Energies', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const neptuneAspects = chart.aspects.filter(a => a.planet1 === 'neptune' || a.planet2 === 'neptune').slice(0, 4);
  if (neptuneAspects.length > 0) {
    for (const asp of neptuneAspects) {
      y = checkPage(doc, y);
      const other = asp.planet1 === 'neptune' ? asp.planet2 : asp.planet1;
      const symbols: Record<string, string> = { conjunction: '☌', trine: '△', sextile: '✶', square: '□', opposition: '☍' };
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const aspColor: [number, number, number] = asp.type === 'trine' || asp.type === 'sextile' ? COLORS.brand : asp.type === 'square' || asp.type === 'opposition' ? COLORS.red : COLORS.brandLight;
      doc.setTextColor(...aspColor);
      doc.text(`Neptune ${symbols[asp.type] || asp.type} ${PLANET_NAMES[other] || other}`, margin, y);
      y += 5;
      const interp = getAspectInterpretation('neptune', other, asp.type) || getAspectInterpretation(other, 'neptune', asp.type) || `This aspect weaves Neptune's dissolving spiritual quality into the energy of ${PLANET_NAMES[other] || other}.`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, interp, margin, y, 170);
      y += 4;
    }
  } else {
    y = wrapText(doc, `Neptune forms no major aspects in your chart — its influence operates more quietly, through its house placement and sign, rather than through dynamic tension with other planets. This can make the Neptunian gifts subtler and the blind spots harder to identify.`, margin, y, 170);
  }

  // ── P7: Chiron ────────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `⚷ Chiron in ${SIGN_NAMES[chironSign]} — Your Sacred Wound and Healing Gift`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Chiron — the Wounded Healer — represents the deepest core wound in the chart: the place where you were hurt in ways that didn't fully heal, and precisely because of that, became your greatest source of wisdom and healing capacity. The myth of Chiron is exact: he was the wisest healer of the ancient world, yet could not heal himself. His wound was his gift.\n\nThe Chiron wound is not something to fix and move past. It is something to inhabit with increasing depth and compassion — and in doing so, to transform into the medicine that only you can offer. The wound and the gift are inseparable.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Chiron in ${SIGN_NAMES[chironSign]} — The Quality of the Wound`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const chironSignText = (texts.CHIRON_IN_SIGN[chironSign] || CHIRON_IN_SIGN[chironSign] || '');
  y = wrapText(doc, chironSignText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Chiron in House ${chironHouse} — Where the Wound Lives`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const chironHouseText = (texts.CHIRON_IN_HOUSE[chironHouse - 1] || CHIRON_IN_HOUSE[chironHouse - 1] || '');
  y = wrapText(doc, chironHouseText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'The Path from Wound to Gift', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `The transformation of Chiron happens in stages. First comes the recognition of the wound — naming it without drama or self-pity, just honest acknowledgment. Then comes the grieving: allowing the full weight of what was painful or missing to be felt, perhaps for the first time. Then — and only then — comes the integration: discovering that the sensitivity born from this wound is precisely what allows you to reach others in the same pain. You become a healer not despite your wound, but through it. The place of greatest vulnerability becomes the place of greatest gift.\n\nWith Chiron in House ${chironHouse} in ${SIGN_NAMES[chironSign]}, your particular gift to the world is rooted in the territory of this placement. Those who most need what you have to offer will often be those who carry the same wound — and your presence alone, your having inhabited this pain and not been destroyed by it, will be the most healing thing you can offer.`, margin, y, 170);

  // ── P8: Pluto ─────────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `♇ Pluto in ${SIGN_NAMES[plutoSign]} — Where Deep Transformation Operates`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Pluto is the planet of death, rebirth, and radical transformation. In the spiritual map, it represents the soul's work of karmically clearing what is no longer alive — stripping away the false, the unconsciously inherited, and the outgrown, until what remains is unquestionably real. Pluto does not do this gently. Its method is the underworld: descent, disorientation, and eventual emergence as someone different from who entered.\n\nWhere Pluto sits in the chart is where the soul has chosen, in this incarnation, to undergo its most profound transformation. This is simultaneously where the greatest power lies and where the most unconscious patterns operate.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Pluto in ${SIGN_NAMES[plutoSign]} — Generational Karmic Signature`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Like Neptune, Pluto's sign placement is generational — it describes a collective karmic current that your entire generation carries. In ${SIGN_NAMES[plutoSign]}, the soul's collective work involves transforming the shadow aspects of this sign's energy — bringing what has been distorted or suppressed in this archetypal field into consciousness and wholeness. You carry this collective transformation as a personal imperative.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Pluto in House ${plutoHouse} — The Site of Deep Transformation`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const plutoText = (PLUTO_KARMIC[plutoHouse - 1] || texts.PLUTO_IN_HOUSE[plutoHouse - 1] || PLUTO_IN_HOUSE[plutoHouse - 1] || `Pluto in House ${plutoHouse}: this is where the soul's deepest transformation is concentrated in this lifetime.`);
  y = wrapText(doc, plutoText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'Working with Pluto Consciously', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `The difference between Pluto as destroyer and Pluto as transformer is consciousness. When Plutonian energy is resisted — when the soul fights to keep what is dying, to hold on to power that is no longer truly ours, to maintain control over what is ready to change — destruction follows. When Plutonian energy is engaged consciously — with willingness to release, with curiosity about what is emerging, with trust in the process of death and rebirth — it becomes the most profound transformative force available.\n\nThe spiritual practice with Pluto is developing the capacity to let go. Not passively, but with full presence — as a conscious act of trust in the larger intelligence that governs these cycles.`, margin, y, 170);

  // ── P9: Saturn ────────────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, `♄ Saturn in ${SIGN_NAMES[saturnSign]} — Karmic Lessons and Ancestral Patterns`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Saturn, in the spiritual map, is the keeper of karmic time — the planet that tracks what the soul has carried across incarnations and what it has come to resolve in this one. Saturn's placement shows where the soul meets its most demanding teacher: where growth is slow, where effort is required, where the patterns of ancestors and past lives exert their strongest pull.\n\nSaturn is not a punishing force. It is a faithful one. What it demands, it also ultimately rewards — with the most durable kind of growth: earned wisdom, hard-won maturity, and a character forged in genuine engagement with difficulty.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Saturn in ${SIGN_NAMES[saturnSign]} — The Karmic Signature`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const saturnKarmicText = SATURN_KARMIC[saturnSign] || SATURN_IN_SIGN[saturnSign] || `Saturn in ${SIGN_NAMES[saturnSign]}: the soul carries karmic material related to the qualities of this sign.`;
  y = wrapText(doc, saturnKarmicText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, `Saturn in House ${saturnHouse} — Where the Karmic Work Is Concentrated`, y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const saturnHouseText = (texts.SATURN_IN_HOUSE[saturnHouse - 1] || SATURN_IN_HOUSE[saturnHouse - 1] || `Saturn in House ${saturnHouse}: the karmic work of this lifetime is concentrated here.`);
  y = wrapText(doc, saturnHouseText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'The Ancestral Dimension of Saturn', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `Saturn carries not only personal karma but ancestral karma — the unresolved material of the family lineage. The patterns of your ancestors that were never consciously worked through have been passed forward — not as punishment, but as an invitation. You are the one in your lineage who has the consciousness to do something different with this material.\n\nThe spiritual work with Saturn is to take on this inheritance with awareness: to fulfill genuine obligations while releasing the ones that are not yours to carry, and to build structures in your life that embody the maturity your lineage has been reaching toward.`, margin, y, 170);

  // ── P10: Spiritual Aspects ────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, '✦ Spiritual Aspects — Neptune, Nodes, and the Transpersonal', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Certain aspects in the natal chart carry particular spiritual significance: aspects between the outer planets and the personal planets, aspects involving the Nodes (especially to Saturn, Neptune, Pluto, and Chiron), and aspects that bridge the personal and transpersonal. These are the points where the soul's larger story intersects most directly with daily lived experience.`, margin, y, 170);
  y += 6;

  const spiritualPlanets = ['neptune', 'pluto', 'chiron', 'northNode', 'saturn'];
  const spiritualAspects = chart.aspects.filter(a =>
    spiritualPlanets.includes(a.planet1) || spiritualPlanets.includes(a.planet2)
  ).slice(0, 6);

  if (spiritualAspects.length > 0) {
    for (const asp of spiritualAspects) {
      y = checkPage(doc, y);
      const symbols: Record<string, string> = { conjunction: '☌', trine: '△', sextile: '✶', square: '□', opposition: '☍' };
      const aspColor: [number, number, number] = asp.type === 'trine' || asp.type === 'sextile' ? COLORS.brand : asp.type === 'square' || asp.type === 'opposition' ? COLORS.red : COLORS.gold;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...aspColor);
      doc.text(`${PLANET_NAMES[asp.planet1] || asp.planet1} ${symbols[asp.type] || asp.type} ${PLANET_NAMES[asp.planet2] || asp.planet2}`, margin, y);
      y += 5;
      const interp = getAspectInterpretation(asp.planet1, asp.planet2, asp.type) || getAspectInterpretation(asp.planet2, asp.planet1, asp.type) || `This aspect weaves together the energies of ${PLANET_NAMES[asp.planet1] || asp.planet1} and ${PLANET_NAMES[asp.planet2] || asp.planet2} in a ${asp.type} relationship.`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      y = wrapText(doc, interp, margin, y, 170);
      y += 5;
    }
  } else {
    y = wrapText(doc, `Your chart has few major aspects between the transpersonal planets and your personal planets. This suggests that the spiritual dimension of your chart operates more independently — your personal life and your spiritual life may feel like separate domains, or the connection between them may be less immediately visible. The invitation is to consciously create bridges between your daily experience and the deeper currents of meaning that your chart reveals.`, margin, y, 170);
  }

  // ── P11: Past Life Indicators Synthesis ───────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, '✦ Past Life Indicators — A Synthesis', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Several elements of the natal chart are traditionally read as indicators of past life experience: the South Node (accumulated patterns from prior incarnations), 12th House planets (material carried from before birth), Saturn's challenges (karmic debts and obligations), Chiron (wounds that predate this lifetime), and the Moon's South Node aspects (emotional patterns deeply embedded in the soul's history).\n\nThis synthesis does not claim literal memory of specific past lives — it offers a symbolic portrait of the soul's history as your chart encodes it.`, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, "The Story Your Chart Tells About Your Soul's Past", y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const pastLifeText = `Your South Node in ${SIGN_NAMES[snSign]} in House ${snHouse} suggests that in previous incarnations, your soul developed deep expertise in the qualities of ${SIGN_NAMES[snSign]} — and spent significant time in the themes of House ${snHouse}. These are the patterns that feel most native, most automatic, most like "just how I am."\n\nYour Chiron in ${SIGN_NAMES[chironSign]} in House ${chironHouse} suggests a wound that may predate this lifetime — a pain carried from circumstances that are not entirely explained by your current biography. This wound has a healing purpose in this incarnation.\n\nYour Saturn in ${SIGN_NAMES[saturnSign]} in House ${saturnHouse} points to karmic obligations and structures from the past that this lifetime is called to work with, fulfill, or consciously transform. There may be a sense of having been here before in this particular struggle — because in a meaningful sense, you have.\n\n${planetsIn12.length > 0 ? `The ${planetsIn12.map(p => PLANET_NAMES[p] || p).join(', ')} in your 12th House carry material from before birth — energies that shaped you before you had conscious access to them. Working with these planets through introspection and spiritual practice is part of the soul's current work.` : 'Your 12th House, while empty of planets, still carries the sign of ' + SIGN_NAMES[h12Sign] + ' — suggesting that the karmic material of this sign operates quietly but consistently in the depths of your psyche.'}`;
  y = wrapText(doc, pastLifeText, margin, y, 170);
  y += 6;

  y = addSubTitle(doc, 'What the Soul Is Completing in This Lifetime', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = wrapText(doc, `The karmic work of this incarnation centers on the axis between ${SIGN_NAMES[snSign]} and ${SIGN_NAMES[nnSign]} — releasing the over-reliance on the familiar and moving toward the evolutionary call. The Chiron work involves finding the medicine in the wound. The Saturn work involves assuming mature responsibility for what your lineage has carried. Together, these create a coherent soul curriculum — one that, when engaged with consciously, transforms the accumulated weight of the past into earned wisdom available to the future.`, margin, y, 170);

  // ── P12: Spiritual Practices ──────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, '✦ Spiritual Practices Recommended for Your Chart', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  y = wrapText(doc, `Spiritual practice is not generic — the most effective practices are those attuned to the specific nature of the soul. Your chart reveals where the spiritual access points are, what kind of discipline your soul needs, and which practices will open the most direct path to the sacred for you specifically. The recommendations below are derived from your key spiritual placements.`, margin, y, 170);
  y += 6;

  const practices = getSpiritualPractices(nnSign, neptuneHouse, chironHouse, saturnSign);
  for (const practice of practices) {
    y = checkPage(doc, y);
    y = wrapText(doc, `• ${practice}`, margin, y, 168);
    y += 5;
  }

  y += 4;
  y = checkPage(doc, y);
  y = addSubTitle(doc, 'Universal Practices for the Spiritual Chart', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const universalPractices = [
    'Track your dreams for 30 days. The 12th House and Neptune communicate most directly through the dream state. Record them without interpretation at first — simply witness.',
    `Sit with the North Node question: "What would it look like to take one small step toward ${SIGN_NAMES[nnSign]} quality this week?" Act on the answer.`,
    'Maintain a regular period of voluntary solitude each week — even 30 minutes. The spiritual dimensions of this chart require silence to become audible.',
    `Work with the Chiron wound through creative expression. Write, paint, move, or speak what lives in House ${chironHouse} — give it form without judgment.`,
    `Bring Saturn's domain into conscious relationship: make an explicit commitment in House ${saturnHouse}. Follow through completely. Notice how it feels to be trusted by yourself.`,
  ];
  for (const p of universalPractices) {
    y = checkPage(doc, y);
    y = wrapText(doc, `• ${p}`, margin, y, 168);
    y += 5;
  }

  // ── P13: Conclusion ───────────────────────────────────────
  doc.addPage();
  y = 30;
  y = addSectionTitle(doc, '✦ Conclusion — Integrating the Spiritual Path', y, margin);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);

  const conclusionText = `${options.profileName}, your spiritual chart tells a coherent story — one that spans more than a single lifetime and reaches forward into possibilities that are genuinely yours to inhabit.\n\nThe North Node in ${SIGN_NAMES[nnSign]} in House ${nnHouse} names the direction: the evolutionary frontier, the territory of genuine soul growth. The South Node in ${SIGN_NAMES[snSign]} in House ${snHouse} names the foundation: what you bring, what you know, what must be offered forward rather than clung to.\n\nChiron in ${SIGN_NAMES[chironSign]} in House ${chironHouse} marks the sacred wound — the place of deepest pain that becomes, when inhabited with courage and compassion, the source of your most authentic healing gift. You cannot offer what you have not lived. The wound is the credential.\n\nNeptune in House ${neptuneHouse} marks where the veil is thinnest — where spiritual experience comes most naturally, where the boundary between the individual and the universal is most permeable. This is your direct spiritual access point.\n\nPluto in House ${plutoHouse} marks where transformation operates most deeply — the territory of death and rebirth that the soul has chosen as its central work in this incarnation. To engage this consciously is to become, gradually, unafraid of what you cannot control.\n\nSaturn in ${SIGN_NAMES[saturnSign]} in House ${saturnHouse} marks the karmic obligation — what is owed, what must be built, what the ancestors have been waiting for someone in the lineage to finally resolve. You are that person.\n\nThe spiritual path is not a single road. It is the whole life, entered with awareness. Every difficulty is a teaching. Every wound is a doorway. Every moment of genuine surrender is a step further into the truth of who you are — which is already, always, more than the chart can contain.`;
  y = wrapText(doc, conclusionText, margin, y, 170);
  y += 10;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.brandLight);
  doc.text('"The wound is the place where the Light enters you." — Rumi', margin, y);

  addFooters(doc, options.profileName);
  return doc.output('blob') as unknown as Blob;
}
