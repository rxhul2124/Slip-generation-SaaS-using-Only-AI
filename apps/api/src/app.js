import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import { applySecurity, sanitizeRequest } from "./middleware/security.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { csrfProtection } from "./middleware/csrf.js";
import { router } from "./routes/index.js";

export function createApp() {
  const app = express();

  applySecurity(app);
  app.use(
    express.json({
      limit: "5mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf.toString();
      }
    })
  );
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));
  app.use(sanitizeRequest);
  app.use(apiLimiter);
  app.use(csrfProtection);

  if (env.nodeEnv !== "test") {
    app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  }

  app.use("/api/v1", router);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
