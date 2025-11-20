import { getRabbitMQClient } from "@/lib/rabbitmq/rabbitmq";
import {
  processPostCreation,
  PostCreateJobPayload,
} from "@/lib/services/postQueueService";

/**
 * Worker process that consumes messages from RabbitMQ queue
 */
export async function startPostWorker() {
  console.log("🚀 Starting Post Worker...");

  try {
    const rabbitMQ = getRabbitMQClient();

    // Connect to RabbitMQ
    await rabbitMQ.connect();

    // Start consuming jobs
    await rabbitMQ.consumePostCreateJob(
      async (payload: Record<string, unknown>) => {
        const typedPayload = payload as unknown as PostCreateJobPayload;
        console.log("🔄 Processing job for user:", typedPayload.userId);

        try {
          const post = await processPostCreation(typedPayload);
          console.log("✅ Job completed. Post ID:", post.id);
        } catch (error) {
          console.error("❌ Job failed:", error);
          throw error;
        }
      }
    );

    console.log("✅ Post Worker ready and listening for jobs...");

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down worker...");
      await rabbitMQ.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start worker:", error);
    process.exit(1);
  }
}

// Start the worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startPostWorker().catch(console.error);
}
