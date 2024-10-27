import express from "express";
import {
  getConventionCenter,
  createConventionCenter,
  getConventionCenterById,
  removeAllConventionCenter,
} from "../controllers/index.js";

export const router = express.Router();

router.post("/", createConventionCenter);

router.get("/", getConventionCenter);

router.get("/:id", getConventionCenterById);

router.put("/:bookingId");

router.delete("/:bookingId");

router.delete("/removeAll", removeAllConventionCenter);
