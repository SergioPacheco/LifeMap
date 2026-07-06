// ============================================================
// PAYMENT MOCK — Simulates Stripe Checkout (always approves)
// Replace with real Stripe integration in production
// ============================================================

import { db, type Purchase, type CartItem } from '../store/db';

export interface PaymentResult {
  success: boolean;
  sessionId: string;
  error?: string;
}

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
}

// Available products catalog — IDs must match ReportsShop.tsx
export const PRODUCTS: Record<string, ProductInfo> = {
  'natal-completo': {
    id: 'natal-completo',
    name: 'Mapa Natal Completo',
    price: 29.90,
    currency: 'BRL',
    description: 'Relatório completo de 20+ páginas com interpretação profunda do seu mapa natal.',
  },
  'previsao-anual': {
    id: 'previsao-anual',
    name: 'Previsão Anual',
    price: 34.90,
    currency: 'BRL',
    description: 'Profecção anual + trânsitos + recomendações por trimestre.',
  },
  'relacionamento': {
    id: 'relacionamento',
    name: 'Relatório de Relacionamento',
    price: 39.90,
    currency: 'BRL',
    description: 'Sinastria completa + mapa composto + compatibilidade por tema.',
  },
  'psicologico': {
    id: 'psicologico',
    name: 'Análise Psicológica Profunda',
    price: 39.90,
    currency: 'BRL',
    description: 'Análise da estrutura psicológica via planetas, aspectos e casas.',
  },
  'carreira': {
    id: 'carreira',
    name: 'Carreira e Vocação',
    price: 29.90,
    currency: 'BRL',
    description: 'MC, Casa 6, Casa 10 e indicadores de vocação profissional.',
  },
  'seven-sins': {
    id: 'seven-sins',
    name: 'Os Sete Pecados',
    price: 19.90,
    currency: 'BRL',
    description: 'A sombra lúdica do zodíaco — seus 7 pecados astrológicos.',
  },
  'crianca': {
    id: 'crianca',
    name: 'Mapa da Criança',
    price: 24.90,
    currency: 'BRL',
    description: 'Compreenda o temperamento, necessidades e potenciais do seu filho.',
  },
  // Legacy IDs (for backward compatibility with ReportPreview)
  'natal-complete': {
    id: 'natal-complete',
    name: 'Mapa Natal Completo',
    price: 29.90,
    currency: 'BRL',
    description: 'Relatório completo de 20+ páginas com interpretação profunda do seu mapa natal.',
  },
  'annual-forecast': {
    id: 'annual-forecast',
    name: 'Previsão Anual',
    price: 34.90,
    currency: 'BRL',
    description: 'Profecção anual + trânsitos + recomendações por trimestre.',
  },
  'relationship': {
    id: 'relationship',
    name: 'Relatório de Relacionamento',
    price: 39.90,
    currency: 'BRL',
    description: 'Sinastria completa + mapa composto + compatibilidade por tema.',
  },
  'psychological': {
    id: 'psychological',
    name: 'Análise Psicológica Profunda',
    price: 39.90,
    currency: 'BRL',
    description: 'Análise da estrutura psicológica via planetas, aspectos e casas.',
  },
  'career': {
    id: 'career',
    name: 'Carreira e Vocação',
    price: 29.90,
    currency: 'BRL',
    description: 'MC, Casa 6, Casa 10 e indicadores de vocação profissional.',
  },
};

/**
 * Mock payment processor — simulates Stripe Checkout.
 * Always approves after a 2-second delay.
 * In production, replace with real Stripe Checkout redirect.
 */
export async function processPayment(productId: string, profileId: number, profileName: string): Promise<PaymentResult> {
  const product = PRODUCTS[productId];
  if (!product) {
    return { success: false, sessionId: '', error: 'Produto não encontrado' };
  }

  // Simulate payment processing delay (2 seconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate mock session ID
  const sessionId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // Always approve (mock)
  return { success: true, sessionId };
}

/**
 * Save purchase after successful payment.
 * Stores the PDF blob in IndexedDB for offline access.
 */
export async function savePurchase(
  sessionId: string,
  productId: string,
  profileId: number,
  profileName: string,
  pdfBlob: Blob
): Promise<number> {
  const pdfData = await pdfBlob.arrayBuffer();

  const purchaseId = await db.purchases.add({
    stripeSessionId: sessionId,
    productId,
    profileId,
    profileName,
    pdfData,
    purchasedAt: new Date(),
  });

  return purchaseId as number;
}

/**
 * Get all purchases for display in /purchases page.
 */
export async function getPurchases(): Promise<(Purchase & { productName: string; price: number })[]> {
  const purchases = await db.purchases.orderBy('purchasedAt').reverse().toArray();
  return purchases.map(p => ({
    ...p,
    productName: PRODUCTS[p.productId]?.name || p.productId,
    price: PRODUCTS[p.productId]?.price || 0,
  }));
}

/**
 * Download a purchased PDF from IndexedDB.
 */
export function downloadPurchasedPdf(purchase: Purchase, fileName?: string): void {
  if (!purchase.pdfData) return;

  const blob = new Blob([purchase.pdfData], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || `LifeMap_${purchase.productId}_${purchase.profileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Check if user already has a specific report for a profile.
 */
export async function hasPurchase(productId: string, profileId: number): Promise<boolean> {
  const existing = await db.purchases
    .where(['productId', 'profileId'])
    .equals([productId, profileId])
    .first();
  return !!existing;
}
