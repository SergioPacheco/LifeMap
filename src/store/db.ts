import Dexie, { type Table } from 'dexie';

// ============================================================
// TYPES
// ============================================================

export interface Profile {
  id?: number;
  name: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  lat: number;
  lng: number;
  city: string;
  state?: string;
  country: string;
  timezone: number;   // UTC offset in hours
  timeZoneId?: string; // IANA timezone, e.g. America/Sao_Paulo
  gender?: 'M' | 'F' | 'O';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavedChart {
  id?: number;
  profileId: number;
  type: 'natal' | 'transit' | 'synastry' | 'solar-return' | 'progressions' | 'composite';
  label?: string;
  data: Record<string, unknown>;  // Full chart object
  secondProfileId?: number;       // For synastry/composite
  targetDate?: string;            // For transits/solar return
  createdAt: Date;
}

export interface CartItem {
  id?: number;
  productId: string;
  productName: string;
  profileId: number;
  profileName: string;
  secondProfileId?: number;
  secondProfileName?: string;
  price: number;
  currency: string;
  addedAt: Date;
}

export interface Purchase {
  id?: number;
  stripeSessionId: string;
  productId: string;
  profileId: number;
  profileName: string;
  pdfData?: ArrayBuffer;  // Generated PDF stored offline
  receiptUrl?: string;
  purchasedAt: Date;
}

export interface Settings {
  id?: number;
  key: string;
  value: string | number | boolean;
}

// ============================================================
// DATABASE
// ============================================================

class LifeMapDB extends Dexie {
  profiles!: Table<Profile>;
  charts!: Table<SavedChart>;
  cart!: Table<CartItem>;
  purchases!: Table<Purchase>;
  settings!: Table<Settings>;

  constructor() {
    super('LifeMapDB');

    // Version 1: original schema
    this.version(1).stores({
      profiles: '++id, name, date, city, createdAt',
      charts: '++id, profileId, type, createdAt',
      cart: '++id, productId, profileId',
      purchases: '++id, stripeSessionId, productId, profileId, purchasedAt',
      settings: '++id, &key',
    });

    // Version 2: add updatedAt index to profiles
    this.version(2).stores({
      profiles: '++id, name, date, city, createdAt, updatedAt',
      charts: '++id, profileId, type, createdAt',
      cart: '++id, productId, profileId',
      purchases: '++id, stripeSessionId, productId, profileId, purchasedAt',
      settings: '++id, &key',
    });
  }
}

// Singleton instance
export const db = new LifeMapDB();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Get a setting value */
export async function getSetting<T = string>(key: string, defaultValue?: T): Promise<T> {
  const row = await db.settings.where('key').equals(key).first();
  return row ? (row.value as T) : (defaultValue as T);
}

/** Set a setting value */
export async function setSetting(key: string, value: string | number | boolean): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  if (existing) {
    await db.settings.update(existing.id!, { value });
  } else {
    await db.settings.add({ key, value });
  }
}

/** Get cart total */
export async function getCartTotal(): Promise<number> {
  const items = await db.cart.toArray();
  return items.reduce((sum, item) => sum + item.price, 0);
}

/** Get cart count */
export async function getCartCount(): Promise<number> {
  return db.cart.count();
}

/** Clear entire cart */
export async function clearCart(): Promise<void> {
  await db.cart.clear();
}
