// const mongoose = require("mongoose");

// const InstituteSchema = new mongoose.Schema({
//   iname: { type: String, required: true },
//   code: { type: String, unique: true, required: true }, // Unique identifier for institute
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }, // Hashed password
//   faculties: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }],
//   students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
// });

// module.exports = mongoose.model("Institute", InstituteSchema);

const mongoose = require("mongoose");

const InstituteSchema = new mongoose.Schema({
  iname: { type: String, required: true },
  code: { type: String, required: true},
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }], // List of Departments
});

module.exports = mongoose.model("Institute", InstituteSchema);
