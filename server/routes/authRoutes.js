import express from "express";
import { authenticate, refreshAuth } from "../middleware/index.js";
import {
  login,
  register,
  verifyEmail,
  refreshToken,
} from "../controllers/index.js";

export const router = express.Router();

// route for user registration
router?.post("/register", register);

// veryfy the user email
router.post("/verify-email", verifyEmail);

// Route for user login
router?.post("/login", login);

router.post("/refresh-token", refreshAuth, refreshToken);
