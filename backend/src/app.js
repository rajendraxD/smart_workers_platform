import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { morganStream } from "./config/logger.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { requestContext } from "./middleware/requestContext.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
// import routes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(compression());
  app.use(morgan(env.isProd ? "combined" : "dev", { stream: morganStream }));
  app.use(requestContext);

  // Static avatars (local disk fallback)
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/", (res, req) => {
    return res.send("Server is running...");
  });

  // app.use("/api", apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
