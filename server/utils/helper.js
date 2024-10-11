import CronJob from "cron";
import axios from "axios";

export const onCallItSelf = () => {
  const job = new CronJob("*/10 * * * *", async () => {
    try {
      // Make the HTTP request
      const response = await axios.get("https://hyranyx.onrender.com/");
      console.log("Request successful:", response.status);
    } catch (error) {
      console.error("Error making the request:", error.message);
    }
  });

  // Start the cron job
  job.start();
};
