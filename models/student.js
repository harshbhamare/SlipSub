const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/submission", {
});

const StudentSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
    htnum: { type: String, required: true },
    year: { type: mongoose.Schema.Types.ObjectId, ref: "Year", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    division: { type: mongoose.Schema.Types.ObjectId, ref: "Division" },
    subject: [
        {
            subjectName: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
            submissionStatus: {
                CIE: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
                TA: { type: String, enum: ["Pending", "Completed"], default: "Pending" },
            },
        },
    ],
});

module.exports = mongoose.model("Student", StudentSchema);
