import { ConventionCenter } from "../models/index.js";
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
    const page = Math.max(1, parseInt(req?.query?.page) || 1);
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

    const totalCount = await ConventionCenter.countDocuments({
      name: { $regex: searchQuery, $options: "i" },
    }).lean();

    // Skip aggregation if no search is needed
    let query = ConventionCenter.find();

    if (searchQuery) {
      query = query.where("name", new RegExp(searchQuery, "i"));
    }

    // Add sorting
    query = query.sort({ [sortField]: sortOrder });

    // Add pagination
    // Convert mongoose docs to plain objects
    query = query
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const conventionCenter = await query.exec();

    const result = {
      data: {
        conventionCenter,
        totalCount,
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

    // Cache the results
    // await cache.set(cacheKey, JSON.stringify(result), 'EX', 300); // Cache for 5 minutes

    res.status(200).json(result);
  } catch (error) {
    console.error("Convention Center Error:", error);
    res.status(500).json({
      message: "An error occurred while fetching convention centers",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
