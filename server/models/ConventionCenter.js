import mongoose from "mongoose";

const ConventionCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
    zipCode: { type: String },
  },
  coordinates: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  facilities: [String],
  pricePerHour: { type: Number, required: true },
  availability: [
    {
      date: { type: Date, required: true },
      isAvailable: { type: Boolean, default: true },
    },
  ],
  images: [String],
  videos: [String],
  contact: {
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    email: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  bookingStatus: {
    type: Boolean,
    default: false,
  },
  // rating: { type: Number, min: 0, max: 5, default: 0 },
  // reviews: [
  //   {
  //     userId: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "User",
  //       required: true,
  //     },
  //     rating: { type: Number, min: 0, max: 5, required: true },
  //     comment: { type: String },
  //     date: { type: Date, default: Date.now },
  //   },
  // ],
});

const eventBookingSchema = new mongoose.Schema({
  conventionCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConventionCenters",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
  notes: { type: String },
});

const activityLogSchema = new mongoose.Schema({
  activityType: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  timestamp: { type: Date, default: Date.now },
  activityStatus: { type: Boolean, required: true },
});

export const ConventionCenter = mongoose.model(
  "ConventionCenters",
  ConventionCenterSchema
);

export const EventBooking = mongoose.model("EventBooking", eventBookingSchema);

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
