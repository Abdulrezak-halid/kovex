import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import router from "./routes";
import { logger } from "./lib/logger";
import { errorHandler, notFoundHandler } from "./lib/errors";

const app: Express = express();
const openApiPath = path.resolve(__dirname, "../../api-contract/openapi.yaml");

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/openapi.yaml", (_req, res) => {
  res.type("yaml").sendFile(openApiPath);
});

const swaggerOptions = {
  swaggerOptions: {
    url: "/api/openapi.yaml",
  },
};

app.use(
  "/api-docs",
  swaggerUi.serveFiles(undefined, swaggerOptions),
  swaggerUi.setup(undefined, swaggerOptions),
);

app.use(
  "/api-docs/",
  swaggerUi.serveFiles(undefined, swaggerOptions),
  swaggerUi.setup(undefined, swaggerOptions),
);

app.use("/api", router);
app.use("/api", notFoundHandler);
app.use(errorHandler);

export default app;
