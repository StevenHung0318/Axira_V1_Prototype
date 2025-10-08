import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS 設定
app.use(
  cors({
    origin: [
      "http://localhost:5173", // 本地開發
      "https://axira-v1-prototype.vercel.app", // 等下部署前端的網址（先預留）
    ],
    credentials: true,
  })
);

// 簡單的 log 函數
const log = (message: string) => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [express] ${message}`);
};

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // 只在開發環境才 setup vite
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite.js");
    await setupVite(app, server);
  }
  // 生產環境不需要 serve 靜態檔案，因為前端會部署到 Vercel

  const port = parseInt(process.env.PORT || "5001", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`API server running on port ${port}`);
    }
  );
})();
