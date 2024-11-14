import express from "express";
import {
  conventionBooking,
  getConventionCenter,
  deleteConventionCenter,
  createConventionCenter,
  getConventionCenterById,
  removeAllConventionCenter,
  bulkUploadConventionCenters,
  bulkUploadconventionBooking,
} from "../controllers/index.js";

export const router = express.Router();

router.post("/", createConventionCenter);

router.post("/bulk-upload", bulkUploadConventionCenters);

router.get("/", getConventionCenter);

router.get("/:id", getConventionCenterById);

router.delete("/:id", deleteConventionCenter);

router.delete("/delete/all", removeAllConventionCenter);

router.post("/booking/:id", conventionBooking);

router.post("/booking/bulk-upload", bulkUploadconventionBooking);
