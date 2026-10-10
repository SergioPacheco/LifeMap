import { test, expect } from '@playwright/test';
import { reportSubjects } from '../fixtures/reports/profiles';

for (const product of [
  { type: 'financial', id: 'financeiro', price: '29.90' },
  { type: 'spiritual', id: 'espiritual', price: '34.90' },
  { type: 'saturn-return', id: 'retorno-saturno', price: '24.90' },
]) {
  test(`${product.type} preview displays and saves its own product`, async ({ page }) => {
    await page.goto(`/pt/reports/${product.type}-sample/`);
    await page.evaluate(async birth => {
      const path = '/src/store/db.ts';
      const { db } = await import(path);
      await db.profiles.add({ ...birth, name: 'Perfil Sintético E2E', country: 'Test', timeQuality: 'exact', createdAt: new Date(), updatedAt: new Date() });
    }, reportSubjects[0].birth);
    await page.reload();
    await page.getByRole('button', { name: /Perfis.*\(1\)/ }).click();
    await page.getByRole('main').getByText('Perfil Sintético E2E', { exact: true }).click();
    const buy = page.getByRole('button', { name: new RegExp(`R\\$ ${product.price.replace('.', '\\.')}`) });
    await expect(buy).toBeVisible();
    const download = page.waitForEvent('download');
    await buy.click();
    expect((await download).suggestedFilename()).toBe(`LifeMap_${product.id}_Perfil_Sintético_E2E.pdf`);
    const purchase = await page.evaluate(async () => {
      const path = '/src/store/db.ts';
      const { db } = await import(path);
      const rows = await db.purchases.toArray();
      return { count: rows.length, productId: rows[0].productId, bytes: rows[0].pdfData.byteLength };
    });
    expect(purchase).toMatchObject({ count: 1, productId: product.id });
    expect(purchase.bytes).toBeGreaterThan(1000);
  });
}
