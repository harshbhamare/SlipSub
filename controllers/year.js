const YearModel = require("../models/year");

const getYearsWithDepartments = async (req, res) => {
  try {
    const years = await YearModel.aggregate([
      {
        $lookup: {
          from: "departments",  // Match the actual collection name in MongoDB
          localField: "department",
          foreignField: "_id",
          as: "departmentDetails",
        },
      },
      {
        $unwind: "$departmentDetails",
      },
      {
        $project: {
          _id: 1,
          name: 1,   // "First Year", "Second Year"
          department: "$departmentDetails.name",  // "CSE", "ECE"
        },
      },
    ]);

    res.json({ success: true, data: years });
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = { getYearsWithDepartments };
