import axios from "axios";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { CronJob } from "cron";

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

export const generateTokenAndSetCookie = async (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

// Method 1: Using UUID v4 and extracting numeric parts
export const generateNumericIdV4 = () => {
  const fullUuid = uuidv4();
  const numericPart = fullUuid.replace(/[^0-9]/g, "");
  return numericPart.slice(0, 6); // Return first 6 digits
};
