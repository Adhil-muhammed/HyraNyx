import mongoose from "mongoose";
import { ConventionCenter, EventBooking } from "../models/index.js";
import { conventionCenterValidationSchema } from "../validators/ConventionCenter/index.js";

export const createConventionCenter = async (req, res) => {
  const { error, value } = conventionCenterValidationSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const newConventionCenter = new ConventionCenter(value);
    const conventionCenter = await newConventionCenter.save();

    res
      .status(201)
      .json({ message: "convention created successfully", conventionCenter });
  } catch (error) {
    console.log("error: ", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const getConventionCenter = async (req, res) => {
  try {
    let page = Math.max(1, parseInt(req?.query?.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req?.query?.limit) || 10));
    const searchQuery = req?.query?.search?.trim() || "";

    const sortField = ["name", "date", "capacity"].includes(req?.query?.sort)
      ? req?.query?.sort
      : "name";

    const sortOrder = req?.query?.order === "desc" ? -1 : 1;

    // Cache key for results
    const cacheKey = `convention-${page}-${limit}-${searchQuery}-${sortField}-${sortOrder}`;

    // Try to get cached results first (assuming you have Redis or similar setup)
    // const cachedResults = await cache.get(cacheKey);
    // if (cachedResults) {
    //   return res.status(200).json(JSON.parse(cachedResults));
    // }

    await ConventionCenter.createIndexes({
      date: 1,
      capacity: 1,
      name: "text",
    });

    const filter = searchQuery
      ? {
          name: { $regex: searchQuery, $options: "i" },
        }
      : {};

    const totalCount = await ConventionCenter.countDocuments(filter);

    const totalPages = Math.ceil(totalCount / limit);

    if (searchQuery && page > totalPages) {
      page = 1;
    }

    const conventionCenter = await ConventionCenter.find(filter)
      // .select("name date capacity")
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const result = {
      data: {
        totalCount,
        conventionCenter,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
      meta: {
        executionTime: process.hrtime()[1] / 1000000, // Execution time in milliseconds
        limit,
        page,
      },
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("Convention Center Error:", error);
    res.status(500).json({
      message: "An error occurred while fetching convention centers",
      error: error.message,
    });
  }
};

export const getConventionCenterById = async (req, res) => {
  const { id } = req?.params;

  if (!id) {
    return res
      .status(400)
      .json({ message: "Convention center ID is required" });
  }

  try {
    const conventionCenter = await ConventionCenter.findById(id);

    res.status(200).json({ message: "success", conventionCenter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteConventionCenter = async (req, res) => {
  const { id } = req?.params;
  try {
    if (!id) {
      console.log("id: ", id);
      return res.status(400).json({ message: "ID parameter is required" });
    }

    const result = await ConventionCenter.deleteOne({ _id: id });
    const remainingCount = await ConventionCenter.countDocuments();

    if (result?.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Convention center not found or already deleted" });
    }

    res
      .status(200)
      .json({ message: "Convention center deleted", remainingCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeAllConventionCenter = async (req, res) => {
  try {
    await ConventionCenter.deleteMany();
    const remainingCount = await ConventionCenter.countDocuments();

    res
      .status(200)
      .json({ message: "Convention center deleted", remainingCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const conventionBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const eventBooking = new EventBooking(req.body);
    const conventionCenter = await ConventionCenter.findById({
      _id: id,
    }).session(session);

    if (!conventionCenter) {
      return res.status(400).json({ message: "Convention center not found" });
    }

    await eventBooking.save({ session });
    // Simulate an error after saving eventBooking
    // throw new Error("Simulated error for testing rollback");

    conventionCenter.bookingStatus = true;

    await conventionCenter.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).send({ message: "Booking successful" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).send({ message: "Booking failed", error: error.message });
  }
};
