import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { verifyMailConnection } from "./config/mail.js";

const startServer = async () => {
  // ── Connect to MongoDB ──────────────────────────────────────────────────────
  await connectDatabase();

  // ── Verify Mail Server (non-blocking) ──────────────────────────────────────
  await verifyMailConnection();

  // ── Start HTTP Server ───────────────────────────────────────────────────────
  const server = app.listen(env.PORT, () => {
    console.log(`\nServer running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });

  // ── Graceful Shutdown ───────────────────────────────────────────────────────
  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown fails
    setTimeout(() => {
      console.error("Forcing shutdown after timeout.");
      process.exit(1);
    }, 10_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // ── Handle Unhandled Rejections ─────────────────────────────────────────────
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Promise Rejection:", reason);
    shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    shutdown("uncaughtException");
  });
};

startServer();
