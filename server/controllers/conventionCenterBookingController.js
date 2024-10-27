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
  const { searchKey, sortKey } = req?.params;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const searchQuery = req.query.search || "";
  const sortField = req.query.sort || "name";
  const sortOrder = req.query.order === "desc" ? -1 : 1;

  try {
    // const conventionCenter = await ConventionCenter.find();

    const conventionCenter = await ConventionCenter.aggregate([
      {
        $match: {
          name: { $regex: searchQuery, $options: "i" },
        },
      },
      {
        $sort: {
          [sortField]: sortOrder,
        },
      },
      {
        $facet: {
          conventionCenter: [
            { $skip: (page - 1) * limit },
            {
              $limit: limit,
            },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $unwind: {
          path: "$totalCount",
        },
      },
      {
        $project: {
          conventionCenter: 1,
          totalCount: "$totalCount.count",
          totalPages: 1,
        },
      },
    ]);

    res.status(200).json({ conventionCenter });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
