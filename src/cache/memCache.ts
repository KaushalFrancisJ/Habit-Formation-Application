interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const set = <T>(key: string, value: T, ttlMs: number): void => {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const get = <T>(key: string): T | null => {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
};

const del = (key: string): void => {
  store.delete(key);
};

export const memCache = { set, get, del };
