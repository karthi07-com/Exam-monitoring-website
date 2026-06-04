const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: String,
  duration: Number,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Exam", examSchema);
