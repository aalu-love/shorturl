/**
 * Generic localStorage service.
 * Feature-specific storage modules (e.g. authStorage) build on top of this.
 */
export const storage = {
  get<T = unknown>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`[storage] Failed to write key "${key}"`);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },

  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  },
};
