import express from "express";
import {
  conventionBooking,
  getConventionCenter,
  deleteConventionCenter,
  createConventionCenter,
  getConventionCenterById,
  removeAllConventionCenter,
} from "../controllers/index.js";

export const router = express.Router();

router.post("/", createConventionCenter);

router.get("/", getConventionCenter);

router.get("/:id", getConventionCenterById);

router.delete("/:id", deleteConventionCenter);

router.delete("/removeAll", removeAllConventionCenter);

router.post("/booking/:id", conventionBooking);
