import amqplib, { Channel } from "amqplib";

interface RabbitMQConfig {
  url?: string;
  prefetch?: number;
  exchanges?: { name: string; type: string }[];
  queues?: { name: string; durable?: boolean }[];
}

class RabbitMQClient {
  private channel: Channel | null = null;
  private connection: unknown | null = null;
  private url: string;
  private prefetch: number;
  private isConnected: boolean = false;

  constructor(config: RabbitMQConfig = {}) {
    this.url =
      config.url ||
      process.env.RABBITMQ_URL ||
      "amqp://guest:guest@localhost:5672";
    this.prefetch = config.prefetch || 1;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqplib.connect(this.url);
      console.log("✅ Connected to RabbitMQ", this.url);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.channel = await (this.connection as unknown as any).createChannel();
      console.log("✅ Channel created");

      // Declare exchanges
      await this.channel!.assertExchange("posts", "direct", { durable: true });

      // Declare queues
      await this.channel!.assertQueue("post.create", { durable: true });
      await this.channel!.assertQueue("post.create.dlq", { durable: true });

      // Bind queue to exchange
      await this.channel!.bindQueue("post.create", "posts", "post.create");

      // Set prefetch count
      await this.channel!.prefetch(this.prefetch);
      console.log("✅ RabbitMQ setup complete");

      this.isConnected = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.connection as unknown as any).on("close", () => {
        console.log("⚠️  RabbitMQ connection closed");
        this.isConnected = false;
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.connection as unknown as any).on("error", (err: Error) => {
        console.error("❌ RabbitMQ connection error:", err);
        this.isConnected = false;
      });
    } catch (error) {
      console.error("❌ RabbitMQ connection error:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async publishPostCreateJob(
    payload: Record<string, unknown>
  ): Promise<boolean> {
    if (!this.channel) {
      throw new Error(
        "RabbitMQ channel not initialized. Call connect() first."
      );
    }

    const jobData = JSON.stringify(payload);
    const published = this.channel.sendToQueue(
      "post.create",
      Buffer.from(jobData),
      {
        persistent: true,
        contentType: "application/json",
      }
    );

    if (published) {
      console.log("📤 Post create job published to queue");
      return true;
    } else {
      console.error("❌ Failed to publish job to queue");
      return false;
    }
  }

  async consumePostCreateJob(
    callback: (payload: Record<string, unknown>) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error(
        "RabbitMQ channel not initialized. Call connect() first."
      );
    }

    await this.channel.consume(
      "post.create",
      async (msg: amqplib.Message | null) => {
        if (msg) {
          try {
            const payload = JSON.parse(msg.content.toString());
            console.log("📥 Processing post create job:", payload);

            await callback(payload);

            // Acknowledge message
            this.channel!.ack(msg);
          } catch (error) {
            console.error("❌ Error processing job:", error);

            // Send to DLQ (negative acknowledge with requeue=false)
            this.channel!.nack(msg, false, false);
          }
        }
      }
    );
  }

  async close(): Promise<void> {
    if (this.channel) {
      try {
        await this.channel.close();
        console.log("✅ Channel closed");
      } catch (error) {
        console.error("Error closing channel:", error);
      }
    }

    if (this.connection) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (this.connection as unknown as any).close();
        console.log("✅ RabbitMQ connection closed");
        this.isConnected = false;
      } catch (error) {
        console.error("Error closing connection:", error);
      }
    }
  }

  isReady(): boolean {
    return this.isConnected && this.channel !== null;
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("Channel not available. Call connect() first.");
    }
    return this.channel;
  }
}

// Singleton instance
let rabbitMQClient: RabbitMQClient | null = null;

export function getRabbitMQClient(): RabbitMQClient {
  if (!rabbitMQClient) {
    rabbitMQClient = new RabbitMQClient();
  }
  return rabbitMQClient;
}

export function setRabbitMQClient(client: RabbitMQClient): void {
  rabbitMQClient = client;
}

export default RabbitMQClient;
