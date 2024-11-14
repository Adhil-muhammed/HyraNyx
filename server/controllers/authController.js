import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { User } from "../models/index.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/index.js";
import {
  generateNumericIdV4,
  generateTokenAndSetCookie,
} from "../utils/index.js";

dotenv.config();

export const register = async (req, res) => {
  const { userName, password, name, email } = req.body;

  try {
    if (!userName || !password || !name || !email) {
      throw new Error("All fields are required");
    }

    const existingUser = await User.findOne({ userName });

    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }
    const verificationToken = generateNumericIdV4();
    const hasPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      userName,
      password: hasPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    await user.save();

    // await generateTokenAndSetCookie(res, user._id);

    // await sendVerificationEmail({ email: user?.email, verificationToken });

    res.status(201).json({
      message: "User registered successfully",
      user: { ...user?._doc, password: undefined },
    });
  } catch (error) {
    return res.status(500)?.send({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req?.body;

  try {
    const user = await User?.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: "false",
        message: "Invalid or expired verification code ",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail({ name: user?.name, email: user.email });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail ", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { userName, password } = req.body;

  try {
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Set httpOnly cookie for refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send access token in the response body
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "An error occurred during login" });
  }
};

export const refreshToken = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};
