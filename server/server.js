import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/index.js";
import { authRoutes } from "./routes/index.js";
import { setupSwagger } from "./swagger/index.js";
import { schedulePeriodicRequest } from "./utils/index.js";

dotenv.config();

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());

setupSwagger(app);

// Call the function to start the cron job
schedulePeriodicRequest();

app.get("/", (req, res) => {
  res.send("Welcome to the Node.js Backend Server welcome");
});

app.use("/auth", authRoutes);
app.use("/api/convention-center/bookings", () => {});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
