import dotenv from "dotenv";
import os from "os";
import cluster from "cluster";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/index.js";
import { setupSwagger } from "./swagger/index.js";
import { schedulePeriodicRequest } from "./utils/index.js";
import { authRoutes, eventBookingRoutes } from "./routes/index.js";

dotenv.config();

const numCPUs = process.env.WORKERS || Math.min(os.cpus().length, 4); // Limit max workers
const PORT = process.env.PORT || 5000;
const SHUTDOWN_TIMEOUT = process.env.SHUTDOWN_TIMEOUT || 10000;

// Initialize services only in worker processes
const initializeServices = async (app) => {
  try {
    // Connect to database
    await connectDB();

    // Setup Swagger only on one worker
    if (process.env.NODE_APP_INSTANCE === "0") {
      setupSwagger(app);
    }

    // Schedule cron jobs only on one worker to avoid duplicate jobs
    if (process.env.NODE_APP_INSTANCE === "0") {
      await schedulePeriodicRequest();
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize services:", error);
    return false;
  }
};

const setupWorker = async () => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      worker: process.pid,
      uptime: process.uptime(),
    });
  });

  app.get("/", (req, res) => {
    res.send("Welcome to the Node.js Backend Server");
  });

  // Routes
  app.use("/auth", authRoutes);
  app.use("/api/convention-center", eventBookingRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error("Error:", err);
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      status: "error",
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });

  // Initialize services
  const servicesInitialized = await initializeServices(app);
  if (!servicesInitialized) {
    console.error(`Worker ${process.pid} failed to initialize services`);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Worker ${process.pid} is running on port ${PORT}`);
  });

  const gracefulShutdown = async () => {
    console.log(`Worker ${process.pid} received shutdown signal`);

    // Stop accepting new connections
    server.close(async () => {
      try {
        // Clean up resources
        // Add any cleanup logic here (e.g., closing database connections)
        console.log(`Worker ${process.pid} closed all connections`);
        process.exit(0);
      } catch (error) {
        console.error(`Worker ${process.pid} failed to cleanup:`, error);
        process.exit(1);
      }
    });

    // Force shutdown if graceful shutdown takes too long
    setTimeout(() => {
      console.warn(
        `Worker ${process.pid} force shutdown after ${SHUTDOWN_TIMEOUT}ms`
      );
      process.exit(1);
    }, SHUTDOWN_TIMEOUT);
  };

  // Handle shutdown signals
  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);

  // Handle uncaught errors
  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    gracefulShutdown();
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown();
  });
};

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Starting ${numCPUs} workers...`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ NODE_APP_INSTANCE: i.toString() });
  }

  cluster.on("exit", (worker, code, signal) => {
    if (signal) {
      console.log(
        `Worker ${worker.process.pid} was killed by signal: ${signal}`
      );
    } else if (code !== 0) {
      console.log(
        `Worker ${worker.process.pid} exited with error code: ${code}`
      );
      // Only restart the worker if it crashed (non-zero exit code)
      cluster.fork({ NODE_APP_INSTANCE: worker.process.env.NODE_APP_INSTANCE });
    } else {
      console.log(`Worker ${worker.process.pid} completed`);
    }
  });

  // Handle shutdown of the primary process
  process.on("SIGTERM", () => {
    console.log("Primary process received SIGTERM");
    for (const id in cluster.workers) {
      cluster.workers[id].kill("SIGTERM");
    }
  });
} else {
  setupWorker().catch((error) => {
    console.error("Failed to setup worker:", error);
    process.exit(1);
  });
}
