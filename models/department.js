const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  head: { type: String, required: true },
  // institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
  years: [{ type: mongoose.Schema.Types.ObjectId, ref: "Year" }],
  institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division" }]
});

module.exports = mongoose.model("Department", DepartmentSchema);
