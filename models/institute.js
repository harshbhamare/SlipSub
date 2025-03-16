const mongoose = require("mongoose");

const InstituteSchema = new mongoose.Schema({
  iname: { type: String, required: true },
  code: { type: String, required: true},
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }], 
});

module.exports = mongoose.model("Institute", InstituteSchema);
