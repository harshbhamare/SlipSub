const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  submissionDate: { type: Date, default: Date.now },
  facultySignature: { type: String } 
});

module.exports = mongoose.model("Submission", SubmissionSchema);
