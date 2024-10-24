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
  pricePerDay: { type: Number, required: true },
  availability: [
    {
      date: { type: Date, required: true },
      isAvailable: { type: Boolean, default: true },
    },
  ],
  bookings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      eventDate: { type: Date, required: true },
      eventDuration: { type: Number }, // in hours or days
      numberOfGuests: { type: Number, required: true },
      status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending",
      },
    },
  ],
  images: [String],
  videos: [String],
  // contact: {
  //   phoneNumber: { type: String, required: true },
  //   email: { type: String, required: true },
  // },
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
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
});

export const ConventionCenter = mongoose.model(
  "ConventionCenter",
  ConventionCenterSchema
);
