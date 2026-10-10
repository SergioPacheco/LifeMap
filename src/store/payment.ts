// ============================================================
// PAYMENT MOCK — Simulates Stripe Checkout (always approves)
// Replace with real Stripe integration in production
// ============================================================

import { db, type Purchase } from './db';
import { REPORT_PRODUCTS } from '../reports/core/products';

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

// Compatibility view: every legacy ID retains its identity, with shared prices.
export const PRODUCTS: Record<string, ProductInfo> = Object.assign(Object.create(null),
  Object.fromEntries(REPORT_PRODUCTS.flatMap(product =>
    [product.id, ...product.aliases].map(id => [id, {
      id, name: product.name, description: product.description, price: product.price, currency: product.currency,
    }])
  ))
);

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
