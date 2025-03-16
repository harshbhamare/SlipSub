const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  head: { type: String, required: true },
  years: [{ type: mongoose.Schema.Types.ObjectId, ref: "Year" }],
  institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute" },
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division" }],
  hod: [{ type: mongoose.Schema.Types.ObjectId, ref: "hod" }]
});

module.exports = mongoose.model("Department", DepartmentSchema);
