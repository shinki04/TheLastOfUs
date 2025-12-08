import { config } from "dotenv";
import { resolve } from "path";

import { startPostWorker } from "./consumers/postWorker";

config({ path: resolve(process.cwd(), ".env") });

startPostWorker();

console.log("WORKER", process.argv[1]);
