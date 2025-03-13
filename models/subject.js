const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  name: { type: String },
  code: { type: String, unique: true, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  year: { type: mongoose.Schema.Types.ObjectId, ref: "year" },
  faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }] // ✅ Change to an array
});

module.exports = mongoose.model("Subject", SubjectSchema);

