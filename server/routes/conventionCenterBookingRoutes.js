import express from "express";

export const router = express.Router();

router.post("/");

router.get("/");

router.get("/:bookingId");

router.put("/:bookingId");

router.delete("/:bookingId");
