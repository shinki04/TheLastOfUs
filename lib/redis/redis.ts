import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!, {
  lazyConnect: true,
}); // URL từ Cloudflare, Render, Supabase Edge, etc.

export async function setCache(
  key: string,
  value: string | number | object,
  expire?: number
) {
  const start = Date.now();
  const data = JSON.stringify(value);
  if (expire) {
    await redis.set(key, data, "EX", expire);
  } else {
    await redis.set(key, data);
  }
  console.log("Cache time: ", Date.now() - start);
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return data ? (JSON.parse(data) as T) : null;
  }
}

export async function delCache(key: string) {
  await redis.del(key);
}

export default redis;
