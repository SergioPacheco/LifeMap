import { createSignal, onMount, Show } from 'solid-js';

import { calculateNatalChart, initSweph, getSignIndex, getDegreeInSign } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import type { NatalChart } from '../../engine/types';
import type { Profile } from '../../store/db';
import { db } from '../../store/db';
import { birthDataFromProfile } from '../../utils/profile';
import { getContent } from '../../content';
import type { Locale } from '../../i18n';

const TEXT = {
  pt: {
    selectProfile: 'Selecione um perfil no menu superior para ver o mapa.',
    loadingProfile: 'Carregando perfil...',
    tapPlanet: 'Toque em qualquer planeta para ver os detalhes.',
    choosePlanet: 'Clique nos planetas para explorar',
    selected: 'Planeta selecionado',
    house: 'Casa',
    sign: 'Signo',
    question: 'Pergunta',
    none: 'nenhum',
  },
  en: {
    selectProfile: 'Select a profile from the top menu to view the chart.',
    loadingProfile: 'Loading profile...',
    tapPlanet: 'Click any planet to view details.',
    choosePlanet: 'Click the planets to explore',
    selected: 'Selected planet',
    house: 'House',
    sign: 'Sign',
    question: 'Prompt',
    none: 'none',
  },
  es: {
    selectProfile: 'Selecciona un perfil en el menú superior para ver la carta.',
    loadingProfile: 'Cargando perfil...',
    tapPlanet: 'Haz clic en cualquier planeta para ver los detalles.',
    choosePlanet: 'Haz clic en los planetas para explorar',
    selected: 'Planeta seleccionado',
    house: 'Casa',
    sign: 'Signo',
    question: 'Pregunta',
    none: 'ninguno',
  },
  fr: { selectProfile: 'Sélectionnez un profil dans le menu supérieur pour voir la carte.', loadingProfile: 'Chargement du profil...', tapPlanet: 'Cliquez sur une planète pour voir les détails.', choosePlanet: 'Cliquez sur les planètes pour explorer', selected: 'Planète sélectionnée', house: 'Maison', sign: 'Signe', question: 'Question', none: 'aucun' },
  de: { selectProfile: 'Wählen Sie oben ein Profil, um die Karte anzuzeigen.', loadingProfile: 'Profil wird geladen...', tapPlanet: 'Klicken Sie auf einen Planeten, um Details zu sehen.', choosePlanet: 'Klicken Sie auf die Planeten zum Erkunden', selected: 'Ausgewählter Planet', house: 'Haus', sign: 'Zeichen', question: 'Frage', none: 'keiner' },
  it: { selectProfile: 'Seleziona un profilo dal menu in alto per vedere la carta.', loadingProfile: 'Caricamento profilo...', tapPlanet: 'Fai clic su un pianeta per vedere i dettagli.', choosePlanet: 'Fai clic sui pianeti per esplorare', selected: 'Pianeta selezionato', house: 'Casa', sign: 'Segno', question: 'Domanda', none: 'nessuno' },
  ja: { selectProfile: '上部メニューからプロフィールを選択してチャートを表示します。', loadingProfile: 'プロフィールを読み込み中...', tapPlanet: '惑星をクリックして詳細を表示します。', choosePlanet: '惑星をクリックして探索', selected: '選択した惑星', house: 'ハウス', sign: 'サイン', question: '質問', none: 'なし' },
  zh: { selectProfile: '请从顶部菜单选择一个档案以查看星盘。', loadingProfile: '正在加载档案...', tapPlanet: '点击任意行星查看详情。', choosePlanet: '点击行星进行探索', selected: '已选行星', house: '宫位', sign: '星座', question: '提示', none: '无' },
  ru: { selectProfile: 'Выберите профиль в верхнем меню, чтобы увидеть карту.', loadingProfile: 'Загрузка профиля...', tapPlanet: 'Нажмите на любую планету, чтобы увидеть детали.', choosePlanet: 'Нажмите на планеты для просмотра', selected: 'Выбранная планета', house: 'Дом', sign: 'Знак', question: 'Вопрос', none: 'нет' },
  tr: { selectProfile: 'Haritayı görmek için üst menüden bir profil seçin.', loadingProfile: 'Profil yükleniyor...', tapPlanet: 'Ayrıntıları görmek için bir gezegene tıklayın.', choosePlanet: 'İncelemek için gezegenlere tıklayın', selected: 'Seçilen gezegen', house: 'Ev', sign: 'Burç', question: 'Soru', none: 'yok' },
  nl: { selectProfile: 'Selecteer een profiel in het bovenmenu om de kaart te zien.', loadingProfile: 'Profiel wordt geladen...', tapPlanet: 'Klik op een planeet om details te zien.', choosePlanet: 'Klik op de planeten om te verkennen', selected: 'Geselecteerde planeet', house: 'Huis', sign: 'Teken', question: 'Vraag', none: 'geen' },
} as const;

const PLANET_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as const;
const SPECIAL_LABELS = {
  pt: { northNode: 'Nodo Norte', chiron: 'Quíron' },
  en: { northNode: 'North Node', chiron: 'Chiron' },
  es: { northNode: 'Nodo Norte', chiron: 'Quirón' },
  fr: { northNode: 'Nœud Nord', chiron: 'Chiron' },
  de: { northNode: 'Nördlicher Mondknoten', chiron: 'Chiron' },
  it: { northNode: 'Nodo Nord', chiron: 'Chirone' },
  ja: { northNode: 'ドラゴンヘッド', chiron: 'キロン' },
  zh: { northNode: '北交点', chiron: '凯龙星' },
  ru: { northNode: 'Северный узел', chiron: 'Хирон' },
  tr: { northNode: 'Kuzey Ay Düğümü', chiron: 'Şiron' },
  nl: { northNode: 'Noordknoop', chiron: 'Chiron' },
} as const;

interface Props {
  locale: Locale;
}

export default function AstroClickApp(props: Props) {
  const text = TEXT[props.locale] ?? TEXT.en;
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [selectedPlanet, setSelectedPlanet] = createSignal<string | null>(null);
  const [interpretation, setInterpretation] = createSignal<{
    title: string;
    description: string;
    question: string;
    sign: string;
    house: string;
  } | null>(null);
  const [content, setContent] = createSignal<{ planets?: any; signs?: any; houses?: any; chiron?: any } | null>(null);

  onMount(async () => {
    await initSweph();
    const [planets, signs, houses, chiron] = await Promise.all([
      getContent(props.locale, 'planets'),
      getContent(props.locale, 'signs'),
      getContent(props.locale, 'houses'),
      getContent(props.locale, 'chiron'),
    ]);
    setContent({ planets, signs, houses, chiron });
    // Add click listener for planets
    document.addEventListener('click', handlePlanetClick);
    // Auto-load profile
    try {
      const profiles = await db.profiles.orderBy('id').reverse().limit(1).toArray();
      if (profiles.length > 0) handleProfileSelect(profiles[0]);
    } catch {}
    window.addEventListener('lifemap:profile-change', (e: any) => {
      if (e.detail) handleProfileSelect(e.detail);
    });
  });

  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart(birthDataFromProfile(profile));
    setNatal(chart);
    setWheelSvg(renderWheel(chart));
    setSelectedPlanet(null);
    setInterpretation(null);
  };

  const handlePlanetClick = (e: MouseEvent) => {
    const target = e.target as Element;
    const planetEl = target.closest('[data-planet]') || target.closest('.planet-symbol');
    if (!planetEl) return;

    const planetId = planetEl.getAttribute('data-planet');
    if (!planetId || !natal()) return;

    setSelectedPlanet(planetId);

    const pos = natal()!.positions[planetId];
    if (!pos) return;

    const signIdx = getSignIndex(pos.longitude);
    const house = natal()!.planetHouses[planetId] || 1;
    const labels = content();
    const standardIndex = PLANET_ORDER.indexOf(planetId as any);
    const special = (SPECIAL_LABELS[props.locale] ?? SPECIAL_LABELS.en) as Record<string, string>;
    const standardPlanet = standardIndex >= 0 ? labels?.planets?.list?.[standardIndex] : null;
    const specialTitle =
      planetId === 'northNode' ? special.northNode :
      planetId === 'chiron' ? special.chiron :
      planetId;

    if (standardPlanet || specialTitle) {
      const signName = labels?.signs?.list?.[signIdx]?.name ?? signIdx.toString();
      const houseName = labels?.houses?.list?.[house - 1]?.name ?? `${text.house} ${house}`;
      setInterpretation({
        title: standardPlanet ? standardPlanet.name : specialTitle,
        description: standardPlanet?.description || labels?.chiron?.intro || '',
        question: text.question,
        sign: signName,
        house: houseName,
      });
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Interpretation */}
      <div class="lg:col-span-1 space-y-4">
        <Show when={natal() && !interpretation()}>
          <div class="bg-gold/5 rounded-xl border border-gold/20 p-6 text-center">
            <div class="text-3xl mb-2">👆</div>
            <p class="text-sm text-gold font-medium">{text.tapPlanet}</p>
          </div>
        </Show>

        <Show when={interpretation()}>
          <div class="bg-base-50 rounded-xl border border-gold/30 p-6 shadow-lg ring-2 ring-gold/30">
            <h3 class="text-lg font-serif font-bold text-gold">
              {interpretation()!.title}
            </h3>
            <p class="text-xs text-muted mt-1">
              {text.sign} {interpretation()!.sign} — {text.house} {interpretation()!.house}
            </p>
            <p class="mt-4 text-sm text-cream-dark leading-relaxed">
              {interpretation()!.description}
            </p>
            <p class="mt-3 text-sm text-gold italic">
              {interpretation()!.question}
            </p>
          </div>
        </Show>
      </div>

      {/* Right: Interactive wheel */}
      <div class="lg:col-span-2">
        <Show when={natal()} fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">🎯</div>
            <p>{text.selectProfile}</p>
            <p class="text-xs mt-2">{text.choosePlanet}</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-xs text-muted mb-2">
              {text.choosePlanet} • {text.selected}: <strong class="text-brand-600">{selectedPlanet() || text.none}</strong>
            </div>
            <div class="w-full max-w-[600px] mx-auto cursor-pointer" innerHTML={wheelSvg()} />
          </div>
        </Show>
      </div>
    </div>
  );
}
