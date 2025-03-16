const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
  cnumber : { type: Number, required: true},
  status: { type: String, enum: ["pending", "approved", "denied"], default: "pending" },
  role: { type: String, enum: ["Class Teacher", "Faculty"], default: "Faculty" },
  classTeacherOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    default: null 
}

});

module.exports = mongoose.model("Faculty", FacultySchema);
