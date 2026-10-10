import type { ReportType } from './types';

export interface ProductDefinition {
  id: string;
  aliases: string[];
  reportType: ReportType;
  price: number;
  currency: string;
  subjectCount: 1 | 2;
  requiresPeriod: boolean;
  name: string;
  description: string;
}

export const REPORT_PRODUCTS: readonly ProductDefinition[] = [
  { id: 'natal-completo', aliases: ['natal-complete'], reportType: 'natal', price: 29.90, name: 'Mapa Natal Completo', description: 'Relatório completo de 20+ páginas com interpretação profunda do seu mapa natal.' },
  { id: 'previsao-anual', aliases: ['annual-forecast'], reportType: 'annual', price: 34.90, name: 'Previsão Anual', description: 'Profecção anual + trânsitos + recomendações por trimestre.' },
  { id: 'relacionamento', aliases: ['relationship'], reportType: 'relationship', price: 39.90, name: 'Relatório de Relacionamento', description: 'Sinastria completa + mapa composto + compatibilidade por tema.' },
  { id: 'psicologico', aliases: ['psychological'], reportType: 'psychological', price: 39.90, name: 'Análise Psicológica Profunda', description: 'Análise da estrutura psicológica via planetas, aspectos e casas.' },
  { id: 'carreira', aliases: ['career'], reportType: 'career', price: 29.90, name: 'Carreira e Vocação', description: 'MC, Casa 6, Casa 10 e indicadores de vocação profissional.' },
  { id: 'seven-sins', aliases: [], reportType: 'seven-sins', price: 19.90, name: 'Os Sete Pecados', description: 'A sombra lúdica do zodíaco — seus 7 pecados astrológicos.' },
  { id: 'crianca', aliases: [], reportType: 'child', price: 24.90, name: 'Mapa da Criança', description: 'Compreenda o temperamento, necessidades e potenciais do seu filho.' },
  { id: 'financeiro', aliases: ['financial'], reportType: 'financial', price: 29.90, name: 'Mapa Financeiro', description: 'Casa 2, Casa 8, Vênus, Júpiter, Saturno — seu perfil completo de riqueza e recursos.' },
  { id: 'espiritual', aliases: ['spiritual'], reportType: 'spiritual', price: 34.90, name: 'Mapa Espiritual e Kármico', description: 'Nodos Lunares, Casa 12, Netuno, Quíron e Plutão — o caminho da alma.' },
  { id: 'retorno-saturno', aliases: ['saturn-return'], reportType: 'saturn-return', price: 24.90, name: 'Retorno de Saturno', description: 'Guia para o ciclo de 29 anos de Saturno — reestruturação e propósito.' },
].map(product => ({ ...product, currency: 'BRL', subjectCount: product.reportType === 'relationship' ? 2 : 1, requiresPeriod: product.reportType === 'annual' || product.reportType === 'saturn-return' } as ProductDefinition));

const byId = new Map(REPORT_PRODUCTS.flatMap(product => [product.id, ...product.aliases].map(id => [id, product] as const)));
const byType = new Map(REPORT_PRODUCTS.map(product => [product.reportType, product]));

export function resolveProduct(productId: string): ProductDefinition {
  const product = byId.get(productId);
  if (!product) throw new Error(`UNKNOWN_PRODUCT: ${productId}`);
  return product;
}

export function productForReportType(reportType: ReportType): ProductDefinition {
  const product = byType.get(reportType);
  if (!product) throw new Error(`UNKNOWN_PRODUCT: ${reportType}`);
  return product;
}
