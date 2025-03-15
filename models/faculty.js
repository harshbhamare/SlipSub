const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }], // Faculty teaches subjects
  cnumber : { type: Number, required: true}
});

module.exports = mongoose.model("Faculty", FacultySchema);
