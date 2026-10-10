import { describe, expect, it } from 'vitest';
import { resolveProduct, productForReportType } from '../../src/reports/core/products';
import { PRODUCTS, processPayment } from '../../src/store/payment';

const aliases = [
  ['natal-completo', 'natal', 29.9], ['natal-complete', 'natal', 29.9],
  ['previsao-anual', 'annual', 34.9], ['annual-forecast', 'annual', 34.9],
  ['relacionamento', 'relationship', 39.9], ['relationship', 'relationship', 39.9],
  ['psicologico', 'psychological', 39.9], ['psychological', 'psychological', 39.9],
  ['carreira', 'career', 29.9], ['career', 'career', 29.9],
  ['seven-sins', 'seven-sins', 19.9], ['crianca', 'child', 24.9],
  ['financial', 'financial', 29.9], ['financeiro', 'financial', 29.9],
  ['espiritual', 'spiritual', 34.9], ['spiritual', 'spiritual', 34.9],
  ['retorno-saturno', 'saturn-return', 24.9], ['saturn-return', 'saturn-return', 24.9],
] as const;

describe('product destinations', () => {
  it.each(aliases)('%s retains its report type and price', (id, type, price) => {
    expect(resolveProduct(id)).toMatchObject({ reportType: type, price, currency: 'BRL' });
    expect(PRODUCTS[id]).toMatchObject({ id, price, currency: 'BRL' });
  });
  it.each(['financial', 'spiritual', 'saturn-return'] as const)('preview for %s resolves its own product', type => {
    expect(productForReportType(type).reportType).toBe(type);
  });
  it.each(['missing', 'toString', '__proto__', 'constructor', ''])('rejects unknown product %s instead of substituting natal', id => {
    expect(() => resolveProduct(id)).toThrow('UNKNOWN_PRODUCT');
  });
  it('does not invent a forecast SKU', () => {
    expect(() => productForReportType('forecast')).toThrow('UNKNOWN_PRODUCT');
  });
  it('requires both partners and explicit annual/Saturn periods', () => {
    expect(resolveProduct('relationship').subjectCount).toBe(2);
    expect(resolveProduct('annual-forecast').requiresPeriod).toBe(true);
    expect(resolveProduct('saturn-return').requiresPeriod).toBe(true);
  });
  it('rejects prototype names before approving a mock payment', async () => {
    expect(await processPayment('__proto__', 1, 'Synthetic')).toMatchObject({ success: false, sessionId: '' });
  });
});
