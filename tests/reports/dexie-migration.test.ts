import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { afterEach, expect, it } from 'vitest';

afterEach(async () => {
  const { db } = await import('../../src/store/db');
  db.close();
  await Dexie.delete('LifeMapDB');
});

it('upgrades v2 profiles while preserving cart, settings and old PDF bytes', async () => {
  const legacy = new Dexie('LifeMapDB');
  legacy.version(2).stores({
    profiles: '++id, name, date, city, createdAt, updatedAt', charts: '++id, profileId, type, createdAt',
    cart: '++id, productId, profileId', purchases: '++id, stripeSessionId, productId, profileId, purchasedAt', settings: '++id, &key',
  });
  await legacy.table('profiles').add({ id: 5, name: 'Synthetic', date: '1988-02-29', time: '06:15', city: 'Test', updatedAt: new Date() });
  const bytes = new Uint8Array([37, 80, 68, 70]).buffer;
  await legacy.table('purchases').add({ productId: 'natal-complete', profileId: 5, pdfData: bytes, purchasedAt: new Date() });
  await legacy.table('cart').add({ productId: 'financial', profileId: 5 });
  await legacy.table('settings').add({ key: 'locale', value: 'pt' });
  legacy.close();
  const { db } = await import('../../src/store/db');
  await db.open();
  expect((await db.profiles.get(5))?.timeQuality).toBe('exact');
  expect(new Uint8Array((await db.purchases.toArray())[0].pdfData!)).toEqual(new Uint8Array([37, 80, 68, 70]));
  expect((await db.cart.toArray())[0].productId).toBe('financial');
  expect((await db.settings.toArray())[0].value).toBe('pt');
  await db.profiles.update(5, { timeQuality: 'unknown', time: '' });
  expect((await db.profiles.get(5))?.timeQuality).toBe('unknown');
});
