import { CronJob } from "cron";
import axios from "axios";

export const schedulePeriodicRequest = () => {
  const job = new CronJob("*/10 * * * *", async () => {
    try {
      // Make the HTTP request
      await axios.get("https://hyranyx.onrender.com/");
    } catch (error) {
      console.error("Error making the request:", error.message);
    }
  });

  job.start();
};
