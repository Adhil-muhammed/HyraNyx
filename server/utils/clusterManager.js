import cluster from "cluster";
export class ClusterManager {
  constructor({ enabled, numWorkers, maxMemoryRSS, shutdownTimeout }) {
    this.enabled = enabled ?? process.env.CLUSTERING === "true";
    this.numWorkers = numWorkers ?? process.env.CLUSTERING;
    this.maxMemoryRSS = maxMemoryRSS ?? process.env.maxMemoryRSS;
    this.shitdownTimeOut = shutdownTimeout ?? process.env.shutdownTimeout;
  }

  start(workerFunction) {
    if (!this.enabled) {
      console.log("Clustering disabled - running in single process mode");
      return workerFunction();
    }

    if (cluster.isPrimary) {
      this.handlePrimaryProcess();
    } else {
      this.handleWorkerProcess(workerFunction);
    }
  }
  handlePrimaryProcess() {
    console.log(`Primary ${process.pid} is running`);
    console.log(`Starting ${this.numWorkers} workers`);

    for (let i = 0; i < this.numWorkers; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      if (signal !== "SIGTERM") {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
      }
    });
  }

  handleWorkerProcess(workerFunction) {
    console.log(`Worker ${process.pid} started`);

    //Handle worker shutdown
    process.on("SIGTERM", () => {
      console.log(`Worker ${process.pid} receiving SIGTERM`);
      process.exit(0);
    });

    workerFunction();
  }

  monitorWorkers() {
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      const memory = process.memoryUsage().rss;

      if (memory < this.maxMemoryRSS) {
        console.log(
          `Worker ${worker.process.pid} exceeding memory limit. Restarting...`
        );
        worker.kill();
      }
    }
  }

  handleGracefulShutdown() {
    console.log("Primary process initiating graceful shutdown...");
    cluster.removeAllListeners("exit");

    // send shutdown signal to all workers
    for (const id in cluster.workers) {
      cluster.workers[id].kill("SIGTERM");
    }

    // force full shutdown after time out
    setTimeout(() => {
      console.log("Forcing shutdown after timeout");
      process.exit(1);
    }, 30000);
  }
}
