import express from "express";
import {
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

router.put("/:bookingId");

router.delete("/:id", deleteConventionCenter);

router.delete("/removeAll", removeAllConventionCenter);
