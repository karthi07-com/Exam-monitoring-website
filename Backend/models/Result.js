const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    score: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      default: 0,
    },

    startTime: Date,
    endTime: Date,

    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started",
    },

    violations: [
      {
        type: { type: String },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);
module.exports = mongoose.model("Result", resultSchema);