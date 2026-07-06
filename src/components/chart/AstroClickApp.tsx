import { createSignal, onMount, Show } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import { calculateNatalChart, initSweph, getSignIndex, getDegreeInSign } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import type { NatalChart } from '../../engine/types';
import type { Profile } from '../../store/db';

// Planet click interpretations (will come from content files in production)
const PLANET_CLICK_PT: Record<string, { title: string; meaning: string; question: string }> = {
  sun: { title: 'Sol — Sua Essência', meaning: 'O Sol no seu mapa representa quem você é no centro — sua identidade, vontade e propósito de vida. É a energia que você irradia quando está sendo autêntico.', question: 'Pergunte-se: "Onde preciso brilhar e ser reconhecido?"' },
  moon: { title: 'Lua — Suas Emoções', meaning: 'A Lua revela seu mundo emocional inconsciente — como reage automaticamente, o que precisa para se sentir seguro e nutrido. É a criança interior.', question: 'Pergunte-se: "O que me faz sentir em casa?"' },
  mercury: { title: 'Mercúrio — Sua Mente', meaning: 'Mercúrio mostra como você pensa, comunica e processa informações. É o estilo da sua mente — rápida ou profunda, prática ou abstrata.', question: 'Pergunte-se: "Como funciona meu raciocínio?"' },
  venus: { title: 'Vênus — Seu Amor', meaning: 'Vênus indica o que você valoriza, como ama e o que considera belo. É seu magnetismo, seu charme e sua capacidade de atrair.', question: 'Pergunte-se: "O que eu realmente valorizo?"' },
  mars: { title: 'Marte — Sua Ação', meaning: 'Marte é sua energia vital em movimento — como luta, toma iniciativa, expressa raiva e canaliza desejo. É a coragem e a assertividade.', question: 'Pergunte-se: "O que me motiva a agir?"' },
  jupiter: { title: 'Júpiter — Sua Expansão', meaning: 'Júpiter mostra onde encontra sentido, crescimento e abundância. É o Grande Benéfico — fé, generosidade e visão ampla.', question: 'Pergunte-se: "Onde posso crescer e expandir?"' },
  saturn: { title: 'Saturno — Sua Disciplina', meaning: 'Saturno representa seus maiores desafios e deveres — onde amadurece com paciência. Restrição que se torna estrutura.', question: 'Pergunte-se: "O que preciso construir com disciplina?"' },
  uranus: { title: 'Urano — Sua Liberdade', meaning: 'Urano indica onde precisa de independência radical, rompe padrões e inova. É o gênio rebelde e o despertar súbito.', question: 'Pergunte-se: "Onde preciso ser original?"' },
  neptune: { title: 'Netuno — Sua Espiritualidade', meaning: 'Netuno é a porta para o transcendente — compaixão, arte, intuição, mas também ilusão e fuga. O véu entre mundos.', question: 'Pergunte-se: "O que transcende o material em mim?"' },
  pluto: { title: 'Plutão — Sua Transformação', meaning: 'Plutão é poder de transformação absoluta — morte simbólica e renascimento. Intensidade, regeneração e profundidade.', question: 'Pergunte-se: "O que preciso transformar radicalmente?"' },
  northNode: { title: 'Nodo Norte — Seu Destino', meaning: 'O Nodo Norte aponta a direção da sua evolução nesta vida — o território desconhecido que traz crescimento. É o futuro.', question: 'Pergunte-se: "Para onde devo caminhar?"' },
  chiron: { title: 'Quíron — Sua Cura', meaning: 'Quíron é a ferida que não cicatriza completamente, mas se torna sua maior fonte de sabedoria e capacidade de curar outros.', question: 'Pergunte-se: "Qual dor me tornou curador?"' },
};

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

export default function AstroClickApp() {
  const [natal, setNatal] = createSignal<NatalChart | null>(null);
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [selectedPlanet, setSelectedPlanet] = createSignal<string | null>(null);
  const [interpretation, setInterpretation] = createSignal<{ title: string; meaning: string; question: string; sign: string; house: number } | null>(null);

  onMount(async () => {
    await initSweph();
    // Add click listener for planets
    document.addEventListener('click', handlePlanetClick);
  });

  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart({
      name: profile.name, date: profile.date, time: profile.time,
      lat: profile.lat, lng: profile.lng, timezone: profile.timezone,
      city: profile.city, country: profile.country,
    });
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
    const clickData = PLANET_CLICK_PT[planetId];

    if (clickData) {
      setInterpretation({
        ...clickData,
        sign: SIGN_NAMES[signIdx],
        house,
      });
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Profile + Interpretation */}
      <div class="lg:col-span-1 space-y-4">
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">Perfil</h3>
          <ProfileSelector onSelect={handleProfileSelect} locale="pt" />
        </div>

        <Show when={natal() && !interpretation()}>
          <div class="bg-gold/5 rounded-xl border border-gold/20 p-6 text-center">
            <div class="text-3xl mb-2">👆</div>
            <p class="text-sm text-gold font-medium">
              Clique em qualquer planeta no mapa para ver sua interpretação
            </p>
          </div>
        </Show>

        <Show when={interpretation()}>
          <div class="bg-base-50 rounded-xl border border-gold/30 p-6 shadow-lg ring-2 ring-gold/30">
            <h3 class="text-lg font-serif font-bold text-gold">
              {interpretation()!.title}
            </h3>
            <p class="text-xs text-muted mt-1">
              Em {interpretation()!.sign} — Casa {interpretation()!.house}
            </p>
            <p class="mt-4 text-sm text-cream-dark leading-relaxed">
              {interpretation()!.meaning}
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
            <p>Selecione um perfil para explorar o mapa interativo</p>
            <p class="text-xs mt-2">Clique nos planetas para ver interpretações</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-xs text-muted mb-2">
              Clique nos planetas para explorar • Planeta selecionado: <strong class="text-brand-600">{selectedPlanet() || 'nenhum'}</strong>
            </div>
            <div class="w-full max-w-[600px] mx-auto cursor-pointer" innerHTML={wheelSvg()} />
          </div>
        </Show>
      </div>
    </div>
  );
}
