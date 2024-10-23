import express from "express";
import {
  getAllBookings,
  ConventionCenterBooking,
} from "../controllers/index.js";

export const router = express.Router();

router.post("/", ConventionCenterBooking);

router.get("/", getAllBookings);

router.get("/:bookingId");

router.put("/:bookingId");

router.delete("/:bookingId");
