import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();
export default app;

async function start() {
  try {
    await connectDB();
    const server = app.listen(env.port, () => {
      logger.info(
        `Server running on http://localhost:${env.port} [${env.nodeEnv}]`,
      );
    });

    const shutdown = (signal) => {
      logger.info(`${signal} received, shutting down...`);
      server.close(() => process.exit(0));
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

// Only start the server in local dev mode (not on Vercel where it's serverless)
if (!process.env.VERCEL) {
  start();
}
