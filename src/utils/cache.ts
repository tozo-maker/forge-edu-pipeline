
interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  priority?: 'high' | 'normal' | 'low'; // Priority level for cache items
  staleWhileRevalidate?: boolean; // Allow serving stale data while revalidating
}

interface CacheItem<T> {
  data: T;
  expiry: number;
  priority: 'high' | 'normal' | 'low';
  lastAccessed: number;
  size?: number; // Approximate size in bytes (if tracking memory usage)
}

type RefreshFunction<T> = () => Promise<T>;
type CacheListener<T> = (key: string, value: T | null) => void;

class SimpleCache {
  private cache: Record<string, CacheItem<any>> = {};
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default TTL
  private maxItems: number = 100; // Maximum items to store before cleanup
  private listeners: Record<string, CacheListener<any>[]> = {};
  private refreshFunctions: Record<string, RefreshFunction<any>> = {};
  private refreshTimers: Record<string, number> = {};

  constructor(options?: { defaultTTL?: number, maxItems?: number }) {
    if (options?.defaultTTL) this.defaultTTL = options.defaultTTL;
    if (options?.maxItems) this.maxItems = options.maxItems;
    
    // Setup cleanup interval
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60 * 1000); // Clean up every minute
    }
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;
    const expiry = Date.now() + ttl;
    const priority = options.priority || 'normal';
    
    this.cache[key] = { 
      data, 
      expiry, 
      priority,
      lastAccessed: Date.now(),
      size: this.estimateSize(data)
    };
    
    // Trigger any listeners for this key
    this.notifyListeners(key, data);
    
    // Check if we need to clean up the cache
    if (Object.keys(this.cache).length > this.maxItems) {
      this.cleanup();
    }
  }

  get<T>(key: string, options: { 
    fallback?: T, 
    autoRefresh?: boolean 
  } = {}): T | null {
    const item = this.cache[key];
    
    // Check if the item exists
    if (!item) {
      // If autoRefresh is enabled and a refresh function exists, call it
      if (options.autoRefresh && this.refreshFunctions[key]) {
        this.refresh(key);
      }
      return options.fallback || null;
    }
    
    // Update last accessed time
    item.lastAccessed = Date.now();
    
    // Check if the item is expired
    if (item.expiry > Date.now()) {
      return item.data as T;
    }
    
    // If staleWhileRevalidate is enabled for this key, return stale data and refresh
    if (this.refreshFunctions[key]) {
      this.refresh(key);
      return item.data as T; // Return stale data while refreshing
    }
    
    // Remove expired item
    delete this.cache[key];
    
    return options.fallback || null;
  }
  
  // Set up a refresh function for a key
  setRefreshFunction<T>(key: string, refreshFn: RefreshFunction<T>, refreshInterval?: number): void {
    this.refreshFunctions[key] = refreshFn;
    
    // Clear any existing refresh timer
    if (this.refreshTimers[key]) {
      clearInterval(this.refreshTimers[key]);
    }
    
    // Set up automatic refresh if interval is provided
    if (refreshInterval && refreshInterval > 0) {
      this.refreshTimers[key] = setInterval(() => this.refresh(key), refreshInterval) as unknown as number;
    }
  }
  
  // Manually trigger a refresh for a key
  async refresh<T>(key: string): Promise<T | null> {
    if (!this.refreshFunctions[key]) return null;
    
    try {
      const data = await this.refreshFunctions[key]();
      
      // Only update the cache if we got valid data
      if (data !== undefined && data !== null) {
        const existingItem = this.cache[key];
        const ttl = existingItem ? (existingItem.expiry - (existingItem.lastAccessed - this.defaultTTL)) : this.defaultTTL;
        
        this.set(key, data, { 
          ttl, 
          priority: existingItem?.priority || 'normal',
          staleWhileRevalidate: true
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Error refreshing cache key ${key}:`, error);
      return null;
    }
  }

  remove(key: string): void {
    // Clear any refresh timer
    if (this.refreshTimers[key]) {
      clearInterval(this.refreshTimers[key]);
      delete this.refreshTimers[key];
    }
    
    // Remove refresh function
    delete this.refreshFunctions[key];
    
    // Remove from cache
    const previousValue = this.cache[key]?.data;
    delete this.cache[key];
    
    // Notify listeners
    this.notifyListeners(key, null);
  }

  clear(): void {
    // Clear all refresh timers
    Object.keys(this.refreshTimers).forEach(key => {
      clearInterval(this.refreshTimers[key]);
    });
    
    this.cache = {};
    this.refreshFunctions = {};
    this.refreshTimers = {};
    
    // Notify all listeners
    Object.keys(this.listeners).forEach(key => {
      this.notifyListeners(key, null);
    });
  }
  
  // Add a listener for cache changes
  addListener<T>(key: string, listener: CacheListener<T>): () => void {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    
    this.listeners[key].push(listener);
    
    // Return a function to remove this listener
    return () => {
      this.listeners[key] = this.listeners[key].filter(l => l !== listener);
      if (this.listeners[key].length === 0) {
        delete this.listeners[key];
      }
    };
  }
  
  private notifyListeners<T>(key: string, value: T | null): void {
    if (!this.listeners[key]) return;
    
    this.listeners[key].forEach(listener => {
      try {
        listener(key, value);
      } catch (error) {
        console.error(`Error in cache listener for key ${key}:`, error);
      }
    });
  }
  
  private cleanup(): void {
    const now = Date.now();
    const entries = Object.entries(this.cache);
    
    // First, remove all expired items
    const expired = entries.filter(([_, item]) => item.expiry <= now);
    expired.forEach(([key]) => {
      delete this.cache[key];
    });
    
    // If we're still over the limit, remove low priority items first, then by last accessed
    if (Object.keys(this.cache).length > this.maxItems) {
      const remaining = Object.entries(this.cache)
        .sort((a, b) => {
          // Sort by priority first
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          const priorityDiff = priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by last accessed time
          return a[1].lastAccessed - b[1].lastAccessed;
        });
      
      // Remove the oldest items with lowest priority until we're under the limit
      const toRemove = remaining.slice(0, remaining.length - this.maxItems);
      toRemove.forEach(([key]) => {
        delete this.cache[key];
      });
    }
  }
  
  // Estimate size of data in bytes (rough approximation)
  private estimateSize(data: any): number {
    if (data === null || data === undefined) return 0;
    
    try {
      const jsonString = JSON.stringify(data);
      return jsonString.length * 2; // Approximation: each char is 2 bytes
    } catch (e) {
      // If can't stringify, make a rough guess based on type
      if (typeof data === 'number') return 8;
      if (typeof data === 'boolean') return 4;
      if (typeof data === 'string') return data.length * 2;
      if (Array.isArray(data)) return 100 * data.length; // Very rough estimate
      if (typeof data === 'object') return 1000; // Very rough estimate
      return 100; // Default estimate
    }
  }
}

// Create and export singleton instances for different purposes
export const projectCache = new SimpleCache({ defaultTTL: 5 * 60 * 1000 }); // 5 minutes for projects
export const contentCache = new SimpleCache({ defaultTTL: 15 * 60 * 1000 }); // 15 minutes for generated content
export const configCache = new SimpleCache({ defaultTTL: 30 * 60 * 1000 }); // 30 minutes for configurations
