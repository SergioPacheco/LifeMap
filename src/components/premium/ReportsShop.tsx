import { createSignal, For, Show } from 'solid-js';
import { db } from '../../store/db';

interface Product {
  id: string;
  name: string;
  description: string;
  pages: string;
  price: number;
  currency: string;
  icon: string;
  category: 'personality' | 'forecast' | 'relationship' | 'career';
  features: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 'natal-completo',
    name: 'Mapa Natal Completo',
    description: 'Análise profunda de todas as posições, aspectos, dignidades e casas do seu mapa natal.',
    pages: '20-30 páginas',
    price: 29.90,
    currency: 'BRL',
    icon: '☉',
    category: 'personality',
    features: ['Todos os planetas em signos e casas', 'Aspectos com interpretação detalhada', 'Dignidades e debilidades', 'Síntese da personalidade', 'Mapa visual em alta resolução'],
  },
  {
    id: 'relacionamento',
    name: 'Relatório de Relacionamento',
    description: 'Análise completa da sinastria e mapa composto entre duas pessoas.',
    pages: '25-35 páginas',
    price: 39.90,
    currency: 'BRL',
    icon: '♡',
    category: 'relationship',
    features: ['Sinastria completa (planeta × planeta)', 'Mapa Composto com interpretação', 'Pontos de atração e tensão', 'Compatibilidade por área de vida', 'Conselhos para o relacionamento'],
  },
  {
    id: 'previsao-anual',
    name: 'Previsão Anual',
    description: 'Trânsitos, profecção e revolução solar combinados para os próximos 12 meses.',
    pages: '30-40 páginas',
    price: 34.90,
    currency: 'BRL',
    icon: '↻',
    category: 'forecast',
    features: ['Revolução Solar do ano', 'Trânsitos mês a mês', 'Profecção anual', 'Eclipses pessoais', 'Períodos favoráveis e desafiadores'],
  },
  {
    id: 'carreira',
    name: 'Carreira e Vocação',
    description: 'Análise do potencial profissional baseada no MC, Casa 10, Saturno e Júpiter.',
    pages: '15-20 páginas',
    price: 29.90,
    currency: 'BRL',
    icon: '♄',
    category: 'career',
    features: ['MC e Casa 10 — vocação', 'Saturno — disciplina e conquista', 'Júpiter — expansão e oportunidades', 'Casa 6 — rotina de trabalho', 'Timing de mudanças de carreira'],
  },
  {
    id: 'psicologico',
    name: 'Análise Psicológica Profunda',
    description: 'Exploração detalhada da psique baseada no mapa natal — padrões inconscientes e potenciais.',
    pages: '25-35 páginas',
    price: 39.90,
    currency: 'BRL',
    icon: '♇',
    category: 'personality',
    features: ['Lua — mundo emocional e infância', 'Plutão — poder e transformação', 'Quíron — ferida e cura', 'Casa 12 — inconsciente', 'Padrões kármicos (Nodos)'],
  },
  {
    id: 'crianca',
    name: 'Mapa da Criança',
    description: 'Compreenda o temperamento, necessidades e potenciais do seu filho.',
    pages: '15-20 páginas',
    price: 24.90,
    currency: 'BRL',
    icon: '☽',
    category: 'personality',
    features: ['Temperamento e necessidades emocionais', 'Estilo de aprendizagem', 'Desafios e talentos', 'Como apoiar o desenvolvimento', 'Fases de crescimento'],
  },
];

export default function ReportsShop() {
  const [selectedCategory, setSelectedCategory] = createSignal<string>('all');
  const [addedToCart, setAddedToCart] = createSignal<string | null>(null);

  const filteredProducts = () => {
    if (selectedCategory() === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory());
  };

  const addToCart = async (product: Product) => {
    await db.cart.add({
      productId: product.id,
      productName: product.name,
      profileId: 0,
      profileName: '',
      price: product.price,
      currency: product.currency,
      addedAt: new Date(),
    });
    setAddedToCart(product.id);
    setTimeout(() => setAddedToCart(null), 2000);
  };

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'personality', label: 'Personalidade' },
    { id: 'forecast', label: 'Previsão' },
    { id: 'relationship', label: 'Relacionamento' },
    { id: 'career', label: 'Carreira' },
  ];

  return (
    <div class="space-y-6">
      {/* Category filter */}
      <div class="flex gap-2 flex-wrap justify-center">
        <For each={categories}>
          {(cat) => (
            <button
              onClick={() => setSelectedCategory(cat.id)}
              class={`px-4 py-2 text-sm rounded-full transition-all ${
                selectedCategory() === cat.id
                  ? 'bg-gradient-to-r from-gold-dark to-gold text-black font-semibold'
                  : 'bg-base-200 text-cream-dark border border-base-300 hover:border-gold/30 hover:text-gold'
              }`}
            >
              {cat.label}
            </button>
          )}
        </For>
      </div>

      {/* Products grid */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <For each={filteredProducts()}>
          {(product) => (
            <div class="glass rounded-2xl border-glow overflow-hidden hover:border-gold/40 hover:shadow-gold transition-all group">
              {/* Header */}
              <div class="p-6 pb-4">
                <div class="flex items-start justify-between">
                  <div class="text-3xl">{product.icon}</div>
                  <span class="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full border border-gold/20">
                    {product.pages}
                  </span>
                </div>
                <h3 class="text-lg font-semibold text-cream mt-3 group-hover:text-gold transition-colors">
                  {product.name}
                </h3>
                <p class="text-sm text-muted mt-1">
                  {product.description}
                </p>
              </div>

              {/* Features */}
              <div class="px-6 pb-4">
                <ul class="space-y-1">
                  <For each={product.features}>
                    {(feat) => (
                      <li class="text-xs text-muted flex items-start gap-1.5">
                        <span class="text-gold mt-0.5">✓</span>
                        {feat}
                      </li>
                    )}
                  </For>
                </ul>
              </div>

              {/* Footer: price + CTA */}
              <div class="p-6 pt-4 border-t border-base-300/50 bg-base-100/50">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-2xl font-bold text-gold">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    class={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      addedToCart() === product.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gradient-to-r from-gold-dark to-gold text-black hover:shadow-gold hover:scale-[1.02]'
                    }`}
                  >
                    {addedToCart() === product.id ? '✓ Adicionado!' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Trust badges */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-center">
        <div class="p-4 glass rounded-2xl border-glow">
          <div class="text-2xl mb-1">⚡</div>
          <p class="text-xs text-muted">Gerado instantaneamente no seu navegador</p>
        </div>
        <div class="p-4 glass rounded-2xl border-glow">
          <div class="text-2xl mb-1">🔒</div>
          <p class="text-xs text-muted">Seus dados nunca saem do dispositivo</p>
        </div>
        <div class="p-4 glass rounded-2xl border-glow">
          <div class="text-2xl mb-1">📱</div>
          <p class="text-xs text-muted">PDF disponível offline após geração</p>
        </div>
      </div>
    </div>
  );
}
