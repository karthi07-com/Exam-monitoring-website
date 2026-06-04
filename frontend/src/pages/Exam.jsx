import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Exam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false); // ✅ prevent double submit

  const intervalRef = useRef(null);     // ✅ track timer so we can clear it
  const submittedRef = useRef(false);   // ✅ ref version for use inside timer closure
  const violationCountRef = useRef(0);
  if (!examId) return <h2>Invalid Exam</h2>;

  /* =========================
     CLEANUP TIMER ON UNMOUNT
  ========================= */
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  /* =========================
   TAB SWITCH DETECTION
========================= */
useEffect(() => {
  if (!started) return;

  const recordViolation = async (type) => {
    try {
      const res = await API.post(`/exams/${examId}/violation`, {
        type,
      });

      violationCountRef.current = res.data.violations;

      alert(
        `⚠ Violation Detected!\n\nReason: ${type}\nViolations: ${violationCountRef.current}/3`
      );

      if (
        res.data.message ===
        "Exam auto-submitted due to violations"
      ) {
        submitExam(answers);
      }
    } catch (err) {
      console.log("Violation error:", err);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      recordViolation("Tab Switching");
    }
  };

  const handleBlur = () => {
    if (!document.hidden) {
      recordViolation("Window Lost Focus");
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  window.addEventListener("blur", handleBlur);

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.removeEventListener("blur", handleBlur);
  };
}, [started, examId, answers]);

  /* =========================
     LOAD QUESTIONS
  ========================= */
  const loadQuestions = async () => {
    try {
      const res = await API.get(`/exams/${examId}/questions`);
      setQuestions(res.data);
    } catch {
      alert("Failed to load questions");
    }
  };

  /* =========================
     SUBMIT EXAM
  ========================= */
  const submitExam = async (currentAnswers) => {
    // ✅ Guard: prevent double submission
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    // ✅ Clear timer so it doesn't fire again
    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      const res = await API.post(`/exams/${examId}/submit`, {
        answers: currentAnswers,
      });

      alert(`✅ Exam submitted!\nScore: ${res.data.score} / ${res.data.total}`);
      navigate("/student");
    } catch (err) {
      const msg = err?.response?.data?.message || "Submission failed";
      alert(msg);
      // ✅ Reset guard so user can retry if it was a network error
      submittedRef.current = false;
      setSubmitted(false);
    }
  };

  /* =========================
     TIMER
  ========================= */
  const startTimer = (endTime, currentAnswers) => {
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const diff = endTime - now;

      if (diff <= 0) {
        clearInterval(intervalRef.current);
        setTimeLeft(0);
        submitExam(currentAnswers); // ✅ pass latest answers ref
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);
  };

  /* =========================
     START EXAM
  ========================= */
  const startExam = async () => {
    try {
      const res = await API.post(`/exams/${examId}/start`);
      const endTime = new Date(res.data.endTime);

      setStarted(true);
      await loadQuestions();
      startTimer(endTime, []); // start timer with empty answers initially
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to start exam");
    }
  };

  /* =========================
     HANDLE ANSWERS
  ========================= */
  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) =>
          a.questionId === questionId ? { ...a, selectedOption } : a
        );
      }
      return [...prev, { questionId, selectedOption }];
    });
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="container">
      <h2>Exam</h2>

      {!started && (
        <div className="card">
          <button className="btn-primary" onClick={startExam}>
            Start Exam
          </button>
        </div>
      )}

      {timeLeft !== null && (
        <div
          className={`card ${timeLeft < 60 ? "timer-danger" : ""}`}
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "bold",
            color: timeLeft < 60 ? "#e53935" : "#1a237e",
            marginBottom: "16px",
          }}
        >
          ⏱ Time Left: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      )}

      {questions.map((q, index) => (
        <div key={q._id} className="card">
          <p>
            <strong>
              {index + 1}. {q.questionText}
            </strong>
          </p>

          {q.options.map((opt, i) => (
            <label key={i} style={{ display: "block", margin: "6px 0" }}>
              <input
                type="radio"
                name={q._id}
                onChange={() => handleOptionChange(q._id, i)}
                style={{ marginRight: "8px" }}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      {questions.length > 0 && (
        <button
          className="btn-primary"
          onClick={() => submitExam(answers)}
          disabled={submitted}
          style={{ marginBottom: "40px" }}
        >
          {submitted ? "Submitting..." : "Submit Exam"}
        </button>
      )}
    </div>
  );
}