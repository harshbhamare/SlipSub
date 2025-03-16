const mongoose = require("mongoose");

const yearSchema = new mongoose.Schema({
  year: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division" }] 
});

module.exports = mongoose.model("Year", yearSchema);
