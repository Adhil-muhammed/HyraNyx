import os from "os";

export const clusterCOnfig = {
  port: process.env.PORT || 5000,
  clustering: {
    enabled: process.env.CLUSTERING === "true",
    numWorkers: process.env.WORKERS || os.cpus().length,
    maxMemoryRSS: parseInt(process.env.MAX_MEMORY_RSS) || 500 * 1024 * 1024, // 500MB
    shutdownTimeout: parseInt(process.env.SHUTDOWN_TIMEOUT) || 5000, // 5 seconds
  },
};
