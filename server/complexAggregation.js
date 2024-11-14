const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  transactionDate: Date,
  amount: Number,
  transactionType: String, // e.g., 'deposit', 'withdrawal', 'transfer'
  location: String,
  status: String, // e.g., 'completed', 'failed'
});

const Transaction = mongoose.model("Transaction", transactionSchema);

async function complexAggregationPipeline() {
  // Connect to MongoDB if not already connected
  await mongoose.connect("mongodb://localhost:27017/fintechDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-12-31");
  const highValueThreshold = 10000; // Define a high-value transaction threshold

  const mypipeline = [
    {
      $match: {
        transactionDate: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
  ];

  const pipeline = [
    // Step 1: Filter transactions by date range
    {
      $match: {
        transactionDate: { $gte: startDate, $lte: endDate },
      },
    },
    // Step 2: Group by user and month, calculate monthly balance
    {
      $group: {
        _id: {
          userId: "$userId",
          yearMonth: {
            $dateToString: { format: "%Y-%m", date: "$transactionDate" },
          },
        },
        monthlyBalance: { $sum: "$amount" },
        transactions: { $push: "$$ROOT" },
      },
    },
    // Step 3: Restructure the grouped data for easy access
    {
      $project: {
        userId: "$_id.userId",
        month: "$_id.yearMonth",
        monthlyBalance: 1,
        transactions: 1,
      },
    },
    // Step 4: Flag high-value transactions
    {
      $unwind: "$transactions",
    },
    {
      $addFields: {
        "transactions.isHighValue": {
          $gte: ["$transactions.amount", highValueThreshold],
        },
      },
    },
    {
      $group: {
        _id: { userId: "$userId", month: "$month" },
        monthlyBalance: { $first: "$monthlyBalance" },
        highValueTransactions: {
          $push: {
            $cond: ["$transactions.isHighValue", "$transactions", "$$REMOVE"],
          },
        },
        allTransactions: { $push: "$transactions" },
      },
    },
    // Step 5: Fraud detection based on suspicious location changes
    {
      $unwind: "$allTransactions",
    },
    {
      $sort: { "allTransactions.transactionDate": 1 },
    },
    {
      $group: {
        _id: "$_id",
        monthlyBalance: { $first: "$monthlyBalance" },
        highValueTransactions: { $first: "$highValueTransactions" },
        transactions: {
          $push: {
            transactionDate: "$allTransactions.transactionDate",
            location: "$allTransactions.location",
          },
        },
      },
    },
    {
      $addFields: {
        isSuspicious: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: "$transactions",
                  as: "transaction",
                  cond: {
                    $and: [
                      {
                        $eq: [
                          "$$transaction.location",
                          "different location detected",
                        ],
                      },
                      {
                        $lte: [
                          {
                            $subtract: [
                              "$$transaction.transactionDate",
                              {
                                $arrayElemAt: [
                                  "$transactions.transactionDate",
                                  -1,
                                ],
                              },
                            ],
                          },
                          1000 * 60 * 30, // 30 minutes in milliseconds
                        ],
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    },
    // Step 6: Customer segmentation based on transaction behavior
    {
      $addFields: {
        customerSegment: {
          $switch: {
            branches: [
              { case: { $gte: ["$monthlyBalance", 50000] }, then: "VIP" },
              {
                case: {
                  $and: [
                    { $lt: ["$monthlyBalance", 50000] },
                    { $gte: ["$monthlyBalance", 20000] },
                  ],
                },
                then: "Regular",
              },
              { case: { $lt: ["$monthlyBalance", 20000] }, then: "Basic" },
            ],
            default: "Basic",
          },
        },
      },
    },
    // Final projection for desired fields
    {
      $project: {
        userId: "$_id.userId",
        month: "$_id.month",
        monthlyBalance: 1,
        highValueTransactions: 1,
        isSuspicious: 1,
        customerSegment: 1,
      },
    },
  ];

  try {
    const results = await Transaction.aggregate(pipeline);
    console.log("Aggregation Results:", results);
    return results;
  } catch (error) {
    console.error("Error in aggregation pipeline:", error);
  } finally {
    await mongoose.disconnect();
  }
}

// complexAggregationPipeline();
