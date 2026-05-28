import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

async function bootstrap() {
  await connectDatabase();
  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`Slipora API listening on ${env.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Closing Slipora API.`);
    server.close(() => process.exit(0));
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((error) => {
  if (error?.name === "MongooseServerSelectionError") {
    console.error("MongoDB connection failed.");
    console.error(`Tried: ${env.mongoUri}`);
    console.error("Start MongoDB, then restart dev:");
    console.error("  docker compose up -d mongo redis");
    console.error("If Docker Desktop is closed, open it first and wait until it is running.");
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});
