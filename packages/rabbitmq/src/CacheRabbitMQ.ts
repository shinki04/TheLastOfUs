import RabbitMQClient from "./rabbitmq";

/**
 * CacheRabbitMQ handles all cache invalidation events across instances
 * Uses fanout exchange to broadcast invalidation to all consumers
 */
class CacheRabbitMQ extends RabbitMQClient {
  constructor() {
    super({
      publisherPrefetch: 10,
      consumerPrefetch: 5,
      exchanges: [
        { name: "cache", type: "fanout", durable: true }, // Fanout broadcasts to all queues
      ],
      queues: [
        { name: "cache.invalidate", durable: true },
      ],
      bindings: [
        { queue: "cache.invalidate", exchange: "cache", routingKey: "" }, // Fanout ignores routing key
      ],
    });
  }

  // ========== Cache Invalidation Operations ==========

  /**
   * Publish a cache invalidation event
   * This will be broadcast to all consumers via fanout exchange
   */
  async publishCacheInvalidation(payload: Record<string, unknown>): Promise<boolean> {
    return await this.publishToExchange("cache", "", payload); // Empty routing key for fanout
  }

  /**
   * Consume cache invalidation events
   */
  async consumeCacheInvalidation(
    callback: (payload: Record<string, unknown>) => Promise<void>
  ): Promise<void> {
    return await this.consumeQueue("cache.invalidate", callback);
  }
}

// Singleton instance for CacheRabbitMQ
let cacheRabbitMQClient: CacheRabbitMQ | null = null;

export function getCacheRabbitMQClient(): CacheRabbitMQ {
  if (!cacheRabbitMQClient) {
    cacheRabbitMQClient = new CacheRabbitMQ();
  }
  return cacheRabbitMQClient;
}

export function setCacheRabbitMQClient(client: CacheRabbitMQ): void {
  cacheRabbitMQClient = client;
}

export default CacheRabbitMQ;
