const mongoose = require("mongoose");

const hodSchema = new mongoose.Schema({
  head: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, 
  institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },  
  year: [{ type: mongoose.Schema.Types.ObjectId, ref: "Year" }],
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division" }],
});

module.exports = mongoose.model("Hod", hodSchema);
