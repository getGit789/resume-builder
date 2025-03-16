import { createClient } from 'redis';

// In-memory cache for development without Redis
class MockRedisClient {
  private cache: Record<string, { value: string; expiry: number | null }> = {};
  
  async connect() {
    console.log('Mock Redis client connected');
    return this;
  }
  
  async get(key: string) {
    const item = this.cache[key];
    if (!item) return null;
    
    // Check if expired
    if (item.expiry && item.expiry < Date.now()) {
      delete this.cache[key];
      return null;
    }
    
    return item.value;
  }
  
  async set(key: string, value: string, options?: { EX?: number }) {
    const expiry = options?.EX ? Date.now() + (options.EX * 1000) : null;
    this.cache[key] = { value, expiry };
    return 'OK';
  }
  
  async del(key: string) {
    const existed = key in this.cache;
    delete this.cache[key];
    return existed ? 1 : 0;
  }
  
  on() {
    // Mock event listener
    return this;
  }
}

// Try to create a real Redis client, fall back to mock if there's an error
let client: ReturnType<typeof createClient> | MockRedisClient;

try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  client = createClient({
    url: redisUrl,
  });

  client.on('error', (err) => console.error('Redis client error:', err));
} catch (error) {
  console.warn('Using mock Redis client due to connection issues');
  client = new MockRedisClient();
}

// Initialize connection
let isConnected = false;

export async function connectToRedis() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Failed to connect to Redis, using in-memory cache', error);
      client = new MockRedisClient();
      await client.connect();
      isConnected = true;
    }
  }
  return client;
}

export async function getCache(key: string) {
  const redis = await connectToRedis();
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCache(key: string, value: any, expireSeconds = 3600) {
  const redis = await connectToRedis();
  try {
    await redis.set(key, JSON.stringify(value), { EX: expireSeconds });
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function deleteCache(key: string) {
  const redis = await connectToRedis();
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error);
    return false;
  }
}

export default client; 