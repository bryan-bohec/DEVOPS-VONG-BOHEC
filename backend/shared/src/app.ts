import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

/**
 * Crée une application Express préconfigurée (CORS, helmet, json, logs,
 * route /health et handler d'erreur) commune à tous les services.
 * `setupRoutes` branche les routes spécifiques au service.
 */
export function createApp(
  serviceName: string,
  frontendOrigin: string,
  setupRoutes: (app: express.Application) => void,
): express.Application {
  const app = express();
  const allowedOrigins = new Set([frontendOrigin]);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error("Origin not allowed by CORS"));
      },
    }),
  );
  app.use(helmet());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: serviceName });
  });

  setupRoutes(app);

  app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    console.error(error);
    response.status(500).json({ message: "Internal server error." });
  });

  return app;
}
