
interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
}

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache: Record<string, CacheItem<any>> = {};
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default TTL

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const expiry = Date.now() + ttl;
    
    this.cache[key] = { data, expiry };
  }

  get<T>(key: string): T | null {
    const item = this.cache[key];
    
    // Check if the item exists and is not expired
    if (item && item.expiry > Date.now()) {
      return item.data as T;
    }
    
    // Remove expired item
    if (item) {
      delete this.cache[key];
    }
    
    return null;
  }

  remove(key: string): void {
    delete this.cache[key];
  }

  clear(): void {
    this.cache = {};
  }
}

export const projectCache = new SimpleCache();
