const express = require("express");
const router = express.Router();

const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Result = require("../models/Result");

const verifyToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

/* ========================================
   STATIC ROUTES FIRST
======================================== */

// 🔹 Student Results
router.get(
  "/my-results",
  verifyToken,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const results = await Result.find({ studentId: req.user.id })
        .populate("examId", "title duration")
        .sort({ createdAt: -1 });

      res.json(results);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// 🔹 Admin Analytics
router.get(
  "/analytics",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const totalExams = await Exam.countDocuments();
      const totalAttempts = await Result.countDocuments();
      const totalStudents = await Result.distinct("studentId");

      const results = await Result.find();
      const totalViolations = results.reduce(
        (acc, r) => acc + r.violations.length,
        0,
      );

      const totalScore = results.reduce((acc, r) => acc + r.score, 0);
      const totalPossible = results.reduce((acc, r) => acc + r.total, 0);

      const averageScore =
        totalPossible === 0
          ? 0
          : ((totalScore / totalPossible) * 100).toFixed(2);

      res.json({
        totalExams,
        totalStudents: totalStudents.length,
        totalAttempts,
        totalViolations,
        averageScore,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

/* ========================================
   LEADERBOARD ROUTES (BEFORE "/")
======================================== */

// 🔹 Leaderboard Data
router.get("/:examId/leaderboard", verifyToken, async (req, res) => {
  try {
    const results = await Result.find({
      examId: req.params.examId,
      status: "completed",
    })
      .populate("studentId", "name")
      .sort({ score: -1 });

    const ranked = results.map((r, index) => ({
      rank: index + 1,
      name: r.studentId.name,
      score: r.score,
      total: r.total,
    }));

    res.json(ranked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Export CSV
router.get(
  "/:examId/leaderboard/export",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const results = await Result.find({
        examId: req.params.examId,
        status: "completed",
      }).populate("studentId", "name");

      const sorted = results.sort((a, b) => b.score - a.score);

      let csv = "Rank,Name,Score,Total\n";

      sorted.forEach((r, index) => {
        csv += `${index + 1},${r.studentId.name},${r.score},${r.total}\n`;
      });

      res.header("Content-Type", "text/csv");
      res.attachment("leaderboard.csv");
      res.send(csv);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

/* ========================================
   ADMIN ROUTES
======================================== */

router.post("/", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const exam = await Exam.create({
      title: req.body.title,
      duration: req.body.duration,
      createdBy: req.user.id,
    });

    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(
  "/:examId",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const updated = await Exam.findByIdAndUpdate(
        req.params.examId,
        req.body,
        { new: true },
      );

      if (!updated) return res.status(404).json({ message: "Exam not found" });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

router.post(
  "/:examId/question",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const exam = await Exam.findById(req.params.examId);
      if (!exam) return res.status(404).json({ message: "Exam not found" });

      const question = await Question.create({
        examId: req.params.examId,
        questionText: req.body.questionText,
        options: req.body.options,
        correctAnswer: req.body.correctAnswer,
      });

      res.status(201).json(question);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);
// Delete Exam
router.delete(
  "/:examId",
  verifyToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const deleted = await Exam.findByIdAndDelete(req.params.examId);

      if (!deleted) {
        return res.status(404).json({ message: "Exam not found" });
      }

      res.json({ message: "Exam deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

/* ========================================
   GENERAL ROUTE (MUST BE AFTER ABOVE)
======================================== */

router.get("/", verifyToken, async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ========================================
   STUDENT DYNAMIC ROUTES LAST
======================================== */

router.get("/:examId/questions", verifyToken, async (req, res) => {
  try {
    const questions = await Question.find(
      { examId: req.params.examId },
      { correctAnswer: 0 },
    );

    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/:examId/start",
  verifyToken,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const existing = await Result.findOne({
        studentId: req.user.id,
        examId: req.params.examId,
      });

      if (existing)
        return res.status(400).json({
          message: "You have already attended this exam",
        });

      const exam = await Exam.findById(req.params.examId);
      if (!exam) return res.status(404).json({ message: "Exam not found" });

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + exam.duration * 60000);

      await Result.create({
        studentId: req.user.id,
        examId: exam._id,
        startTime,
        endTime,
      });

      res.json({ message: "Exam started", startTime, endTime });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

// ✅ SUBMIT EXAM (was missing entirely)
router.post(
  "/:examId/submit",
  verifyToken,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const { answers } = req.body; // [{ questionId, selectedOption }]

      const result = await Result.findOne({
        studentId: req.user.id,
        examId: req.params.examId,
        status: "started",
      });

      if (!result) {
        return res.status(400).json({ message: "No active exam session found" });
      }

      // ✅ If already completed (double submit guard on backend too)
      if (result.status === "completed") {
        return res.json({ message: "Exam already submitted", score: result.score, total: result.total });
      }

      const questions = await Question.find({ examId: req.params.examId });

      let score = 0;
      const total = questions.length;

      questions.forEach((q) => {
        const studentAnswer = answers?.find(
          (a) => a.questionId === q._id.toString()
        );
        if (studentAnswer !== undefined) {
          const selectedText = q.options[studentAnswer.selectedOption];
          if (selectedText === q.correctAnswer) {
            score++;
          }
        }
      });

      result.score = score;
      result.total = total;
      result.status = "completed";
      await result.save();

      res.json({ message: "Exam submitted successfully", score, total });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ✅ DELETE QUESTION (was missing — frontend calls DELETE /questions/:id)
const questionRouter = express.Router();
questionRouter.delete("/:questionId", verifyToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.questionId);
    if (!deleted) return res.status(404).json({ message: "Question not found" });
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
/* ========================================
   RECORD VIOLATION
======================================== */

router.post(
  "/:examId/violation",
  verifyToken,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const { type } = req.body;

      const result = await Result.findOne({
        studentId: req.user.id,
        examId: req.params.examId,
      });

      if (!result) {
        return res.status(400).json({
          message: "Exam not started",
        });
      }

      if (!result.violations) {
        result.violations = [];
      }

      result.violations.push({
        type,
        time: new Date(),
      });

      // Auto-submit after 3 violations
      if (result.violations.length >= 3) {
        result.status = "completed";
      }

      await result.save();

      res.json({
        message:
          result.violations.length >= 3
            ? "Exam auto-submitted due to violations"
            : "Violation recorded",
        violations: result.violations.length,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);
module.exports = { examRouter: router, questionRouter };