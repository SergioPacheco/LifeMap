import { createSignal, onMount, Show, For } from 'solid-js';
import ProfileSelector from '../forms/ProfileSelector';
import PlanetTable from '../chart/PlanetTable';
import { calculateNatalChart, calculateSolarReturn, initSweph } from '../../engine/index';
import { renderWheel } from '../../renderer/wheel';
import { getSignIndex } from '../../engine/calculations';
import type { NatalChart, SolarReturnChart } from '../../engine/types';
import type { Profile } from '../../store/db';

export default function SolarReturnApp() {
  const [natalChart, setNatalChart] = createSignal<NatalChart | null>(null);
  const [srChart, setSrChart] = createSignal<any>(null);
  const [year, setYear] = createSignal(new Date().getFullYear());
  const [wheelSvg, setWheelSvg] = createSignal('');
  const [profileName, setProfileName] = createSignal('');

  onMount(async () => { await initSweph(); });

  const handleProfileSelect = (profile: Profile) => {
    const chart = calculateNatalChart({
      name: profile.name, date: profile.date, time: profile.time,
      lat: profile.lat, lng: profile.lng, timezone: profile.timezone,
      city: profile.city, country: profile.country,
    });
    setNatalChart(chart);
    setProfileName(profile.name);
    calculateSR(chart, year(), profile.lat, profile.lng, profile.timezone);
  };

  const calculateSR = (natal: NatalChart, yr: number, lat: number, lng: number, tz: number) => {
    const sr = calculateSolarReturn(natal, yr, lat, lng, tz);
    setSrChart(sr);
    setWheelSvg(renderWheel(sr));
  };

  const handleYearChange = (yr: number) => {
    setYear(yr);
    if (natalChart()) {
      const meta = natalChart()!.meta;
      calculateSR(natalChart()!, yr, meta.lat, meta.lng, meta.timezone);
    }
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 space-y-4">
        <div class="glass rounded-2xl p-4">
          <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">Perfil</h3>
          <ProfileSelector onSelect={handleProfileSelect} locale="pt" />
        </div>

        <Show when={natalChart()}>
          <div class="glass rounded-2xl p-4">
            <h3 class="text-sm font-semibold text-cream-dark uppercase tracking-wider mb-3">Ano</h3>
            <div class="flex items-center gap-2">
              <button onClick={() => handleYearChange(year() - 1)} class="px-3 py-1 text-sm bg-base-200 rounded">←</button>
              <input
                type="number" value={year()} min={1900} max={2100}
                onInput={(e) => handleYearChange(parseInt(e.currentTarget.value))}
                class="w-24 text-center px-2 py-1 rounded border border-base-400 bg-base-200 text-cream text-sm"
              />
              <button onClick={() => handleYearChange(year() + 1)} class="px-3 py-1 text-sm bg-base-200 rounded">→</button>
            </div>
            <Show when={srChart()}>
              <p class="text-xs text-muted mt-2">
                Retorno Solar: {srChart().date.toISOString().split('T')[0]}
              </p>
            </Show>
          </div>
        </Show>

        <Show when={srChart()}>
          <PlanetTable chart={srChart()} />
        </Show>
      </div>

      <div class="lg:col-span-2">
        <Show when={srChart()} fallback={
          <div class="glass rounded-2xl p-8 text-center text-muted">
            <div class="text-5xl mb-3">☀</div>
            <p>Selecione um perfil para calcular a Revolução Solar</p>
          </div>
        }>
          <div class="glass rounded-2xl p-4">
            <div class="text-center text-sm text-muted mb-2">
              Revolução Solar {year()} — <strong>{profileName()}</strong>
            </div>
            <div class="w-full max-w-[600px] mx-auto" innerHTML={wheelSvg()} />
          </div>

          {/* Interpretation Panel */}
          <div class="glass rounded-2xl p-6 mt-6">
            <h3 class="text-lg font-serif font-semibold text-cream mb-2">
              Interpretação — Revolução Solar {year()}
            </h3>
            <p class="text-xs text-muted mb-5">
              A Revolução Solar é o mapa do momento exato em que o Sol retorna à sua posição natal — define o "clima" do ano de aniversário a aniversário.
            </p>

            <div class="space-y-4">
              <SRInterpretation chart={srChart()} year={year()} />
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}

// ============================================================
// SR Interpretation — Interpretação da Revolução Solar
// ============================================================

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

const SR_ASC_INTERP: string[] = [
  'Ascendente de RS em Áries: ano de novos começos, iniciativa pessoal e coragem. Você sentirá impulso para liderar, começar projetos e se colocar em primeiro lugar. Energia alta mas impaciente.',
  'Ascendente de RS em Touro: ano de estabilização, prazer e construção material. Ritmo mais lento, foco em segurança financeira e conforto. Resultados concretos mas exige paciência.',
  'Ascendente de RS em Gêmeos: ano de comunicação intensa, aprendizado e conexões. Muita movimentação mental, viagens curtas, novos contatos. Versatilidade é a tônica — cuidado com dispersão.',
  'Ascendente de RS em Câncer: ano voltado para o lar, família e vida emocional. Necessidade de criar raízes, nutrir relações íntimas. Pode haver mudanças domésticas ou gravidez.',
  'Ascendente de RS em Leão: ano de brilho pessoal, criatividade e expressão. Você estará mais visível, mais confiante, mais disposto a se mostrar. Romance e projetos criativos em destaque.',
  'Ascendente de RS em Virgem: ano de organização, saúde e aprimoramento. Foco em rotinas, detalhes, serviço. Bom para resolver pendências, mas cuidado com autocrítica excessiva.',
  'Ascendente de RS em Libra: ano voltado para relacionamentos, parcerias e equilíbrio. Decisões importantes sobre compromissos. Busca de harmonia — mas evite se anular para agradar.',
  'Ascendente de RS em Escorpião: ano intenso de transformação profunda. Temas de poder, intimidade, morte simbólica e renascimento. Nada fica na superfície — prepare-se para profundidade.',
  'Ascendente de RS em Sagitário: ano de expansão, viagens, estudos e busca de sentido. Otimismo e desejo de liberdade. Bom para se aventurar em novas direções filosóficas ou geográficas.',
  'Ascendente de RS em Capricórnio: ano de trabalho árduo, ambição e construção de legado. Carreira em foco. Responsabilidades aumentam — mas o que você constrói agora é duradouro.',
  'Ascendente de RS em Aquário: ano de inovação, amizades e causas coletivas. Desejo de liberdade e originalidade. Rupturas possíveis com o convencional. Tecnologia e futuro em foco.',
  'Ascendente de RS em Peixes: ano de interiorização, espiritualidade e sensibilidade aumentada. Intuição aguçada. Bom para arte e cura — mas cuidado com escapismo e limites difusos.',
];

const SR_SUN_HOUSE: string[] = [
  'Sol de RS na Casa 1: o foco do ano é VOCÊ — identidade, aparência, novos começos pessoais. Ano de protagonismo.',
  'Sol de RS na Casa 2: o foco do ano é dinheiro, valores e autoestima. Construção de segurança material.',
  'Sol de RS na Casa 3: o foco do ano é comunicação, aprendizado, irmãos e vizinhança. Muita movimentação mental.',
  'Sol de RS na Casa 4: o foco do ano é lar, família e raízes emocionais. Possível mudança de casa ou reestruturação familiar.',
  'Sol de RS na Casa 5: o foco do ano é criatividade, romance, filhos e prazer. Ano de expressão e diversão.',
  'Sol de RS na Casa 6: o foco do ano é trabalho, saúde e rotina. Reorganização do dia-a-dia e cuidado com o corpo.',
  'Sol de RS na Casa 7: o foco do ano é relacionamentos e parcerias. Casamento, sociedade ou compromissos importantes.',
  'Sol de RS na Casa 8: o foco do ano é transformação, recursos compartilhados e intimidade. Ano de renascimento psicológico.',
  'Sol de RS na Casa 9: o foco do ano é expansão — viagens, estudos superiores, filosofia de vida. Novos horizontes.',
  'Sol de RS na Casa 10: o foco do ano é carreira, vocação e reputação. Conquistas profissionais e reconhecimento público.',
  'Sol de RS na Casa 11: o foco do ano é amizades, grupos e projetos futuros. Networking e causas coletivas.',
  'Sol de RS na Casa 12: o foco do ano é interiorização, espiritualidade e processamento de ciclos. Retiro e reflexão.',
];

const SR_MOON_HOUSE: string[] = [
  'Lua de RS na Casa 1: necessidades emocionais em primeiro plano. Ano reativo, com muita oscilação de humor. Cuidar de si é prioridade.',
  'Lua de RS na Casa 2: segurança emocional ligada ao dinheiro e conforto. Pode haver flutuações financeiras que refletem estados emocionais.',
  'Lua de RS na Casa 3: emoções se processam pela conversa e escrita. Muito contato com irmãos/vizinhos. Comunicação emocional intensa.',
  'Lua de RS na Casa 4: ano muito doméstico — lar e família são o centro emocional. Possível mudança de casa ou intensificação da vida familiar.',
  'Lua de RS na Casa 5: ano de romance, paixão e criatividade emocional. Relação com filhos em destaque. Prazer como nutrição.',
  'Lua de RS na Casa 6: emoções impactam diretamente a saúde. Rotina precisa incluir autocuidado. Ambiente de trabalho emocionalmente carregado.',
  'Lua de RS na Casa 7: necessidade emocional de parceria. Relacionamento é fonte de nutrição (ou de drenagem, se não saudável).',
  'Lua de RS na Casa 8: emoções profundas e intensas o ano todo. Possíveis crises que levam a transformação emocional. Nada fica superficial.',
  'Lua de RS na Casa 9: necessidade de expansão emocional — viagens, estudos ou novas perspectivas nutrem a alma.',
  'Lua de RS na Casa 10: vida pública e carreira emocionalmente carregadas. O que você sente fica visível. Mãe pode ter papel profissional.',
  'Lua de RS na Casa 11: emoções se processam em grupo. Amizades são fonte de nutrição. Conexão com causas maiores traz conforto.',
  'Lua de RS na Casa 12: ano de muita vida interior. Emoções processadas em solidão. Sonhos intensos. Necessidade de retiro periódico.',
];

function SRInterpretation(props: { chart: any; year: number }) {
  const chart = () => props.chart;
  if (!chart()) return null;

  const ascSign = () => getSignIndex(chart().houses?.ascendant || 0);
  const sunHouse = () => chart().planetHouses?.sun || 1;
  const moonHouse = () => chart().planetHouses?.moon || 1;
  const moonSign = () => getSignIndex(chart().positions?.moon?.longitude || 0);

  return (
    <div class="space-y-5">
      {/* ASC do Retorno */}
      <div class="border-l-4 border-gold/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gold/10 text-gold">
          Tema do Ano
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          Ascendente de RS em {SIGN_NAMES[ascSign()]}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {SR_ASC_INTERP[ascSign()]}
        </p>
      </div>

      {/* Sol do Retorno */}
      <div class="border-l-4 border-yellow-500/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-yellow-900/20 text-yellow-300">
          Foco Principal
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          ☉ Sol na Casa {sunHouse()}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {SR_SUN_HOUSE[sunHouse() - 1]}
        </p>
      </div>

      {/* Lua do Retorno */}
      <div class="border-l-4 border-blue-500/40 pl-4 py-2">
        <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-blue-900/20 text-blue-300">
          Necessidade Emocional
        </span>
        <h4 class="text-sm font-semibold text-cream mt-1.5 mb-1">
          ☽ Lua em {SIGN_NAMES[moonSign()]} na Casa {moonHouse()}
        </h4>
        <p class="text-sm text-cream-dark leading-relaxed">
          {SR_MOON_HOUSE[moonHouse() - 1]}
        </p>
      </div>

      {/* CTA */}
      <div class="mt-6 p-4 bg-gold/5 rounded-lg border border-gold/20">
        <p class="text-sm text-gold font-medium">
          ✨ Quer a previsão completa mês a mês?
        </p>
        <p class="text-xs text-muted mt-1">
          O Relatório de Previsão Anual inclui profecção, trânsitos detalhados, eclipses e tendências por trimestre.
        </p>
      </div>
    </div>
  );
}
