const mongoose = require("mongoose");

const DivisionSchema = new mongoose.Schema({
  divisionName: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  year: { type: mongoose.Schema.Types.ObjectId, ref: "Year" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
  
});

module.exports = mongoose.model("Division", DivisionSchema);
