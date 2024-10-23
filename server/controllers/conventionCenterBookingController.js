import { ConventionCenter } from "../models/index.js";

export const ConventionCenterBooking = async (req, res) => {
  try {
    const bookingPlace = new ConventionCenter(req?.body);

    const savedBooking = await bookingPlace.save();

    res.status(201).json({ message: "booking successfull", savedBooking });
  } catch (error) {
    console.log("error: ", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const allBookings = await ConventionCenter.aggregate([
      {
        $unwind: "$bookings",
      },
      {
        $lookup: {
          from: "users",
          localField: "bookings.userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails", // Deconstruct the userDetails array
      },
      {
        $project: {
          id: 1,
          name: 1,
          address: 1,
          bookings: {
            id: "$bookings._id",
            user: {
              id: "$userDetails._id",
              email: "$userDetails.email",
              name: "$userDetails.name",
            },
            eventDate: "$bookings.eventDate",
            eventDuration: "$bookings.eventDuration",
            numberOfGuests: "$bookings.numberOfGuests",
            status: "$bookings.status",
          },
        },
      },
      {
        $group: {
          _id: "$_id", // Group by Convention Center ID
          name: { $first: "$name" }, // Get the name of the convention center
          address: { $first: "$address" }, // Get the address of the convention center
          bookings: { $push: "$bookings" }, // Push all the booking details into an array
        },
      },
    ]);
    // const allBookings = await ConventionCenter.find().populate(
    //   "bookings.userId",
    //   "email name"
    // );

    res.status(200).json({ message: "success", bookings: allBookings });
  } catch (error) {
    console.log("error: ", error.message);
    res.status(400).json({ message: error.message });
  }
};
