import os from "os";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/index.js";
import { setupSwagger } from "./swagger/index.js";
import { authRoutes, eventBookingRoutes } from "./routes/index.js";
import { ClusterManager, schedulePeriodicRequest } from "./utils/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const initializeServices = async () => {
  try {
    if (process.env.NODE_APP_INSTANCE === "0") {
      setupSwagger(app);
      schedulePeriodicRequest();
    }
    return true;
  } catch (error) {
    console.error("Failed to initialize services:", error);
    return false;
  }
};

const workerFunction = async () => {
  const app = express();

  connectDB();

  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      worker: process.pid,
      uptime: process.uptime(),
    });
  });

  app.get("/", (req, res) => {
    res.send("Welcome to the Node.js Backend Server welcome");
  });

  app.use("/auth", authRoutes);

  app.use("/api/convention-center", eventBookingRoutes);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });

  const servicesInitialized = await initializeServices(app);

  if (!servicesInitialized) {
    console.error(`Worker ${process.pid} failed to initialize services`);
    process.exit(1);
  }

  // Listen for shutdown signals in each worker

  app.listen(PORT, () => {
    // console.log(`Worker ${process.pid} is running on port ${PORT}`);
  });
};

const clusterManager = new ClusterManager({
  shutdownTimeout: 20000,
  numWorkers: os.cpus().length,
  maxMemoryRSS: 200 * 1024 * 1024,
});

clusterManager.start(workerFunction);

process.on("SIGTERM", clusterManager.handleGracefulShutdown);
process.on("SIGINT", clusterManager.handleGracefulShutdown);
