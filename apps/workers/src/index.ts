// Load environment variables FIRST before any other imports
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

// Now import other modules (they will have access to env vars)
import { startPostWorker } from "./consumers/postWorker.js";

startPostWorker();

console.log("WORKER", process.argv[1]);
