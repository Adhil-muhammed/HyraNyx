import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      // unique: true,
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Regular expression to validate email format
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    userName: {
      required: true,
      type: String,
      unique: true,
    },
    password: {
      required: true,
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now(),
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: { type: String },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationTokenExpiresAt: Date,
  },

  { timestamps: true }
);

export const User = mongoose.model("users", UserSchema);
