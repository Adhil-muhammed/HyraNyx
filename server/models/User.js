import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userName: {
    required: true,
    type: String,
    unique: true,
  },
  password: {
    required: true,
    type: String,
  },
  refreshToken: { type: String },
});

export const User = mongoose.model("User", UserSchema);
