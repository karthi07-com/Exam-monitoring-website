import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AddQuestion() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questions, setQuestions] = useState([]);

  /* ==============================
     LOAD QUESTIONS (CLEAN FIX)
  =============================== */

  useEffect(() => {
    let ignore = false;

    async function fetchQuestions() {
      try {
        const res = await API.get(`/exams/${examId}/questions`);
        if (!ignore) {
          setQuestions(res.data || []);
        }
      } catch {
        if (!ignore) {
          setQuestions([]);
        }
      }
    }

    fetchQuestions();

    return () => {
      ignore = true;
    };
  }, [examId]);

  /* ==============================
     OPTION CHANGE
  =============================== */

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  /* ==============================
     SUBMIT
  =============================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post(`/exams/${examId}/question`, {
        questionText,
        options,
        correctAnswer,
      });

      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");

      // reload questions safely
      const res = await API.get(`/exams/${examId}/questions`);
      setQuestions(res.data || []);
    } catch {
      console.log("Failed to add question");
    }
  };

  /* ==============================
     DELETE
  =============================== */

  const handleDelete = async (questionId) => {
    try {
      await API.delete(`/questions/${questionId}`);

      const res = await API.get(`/exams/${examId}/questions`);
      setQuestions(res.data || []);
    } catch {
      console.log("Delete failed");
    }
  };

  return (
    <div className="container">
      <h2>Add Question</h2>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter Question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
          />

          {options.map((opt, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required
            />
          ))}

          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            required
          >
            <option value="">Select Correct Answer</option>
            {options.map((opt, index) => (
              <option key={index} value={opt}>
                Option {index + 1}
              </option>
            ))}
          </select>

          <button className="btn-primary">Add Question</button>
        </form>
      </div>

      <h3>Existing Questions</h3>

      <div className="dashboard-grid">
        {questions.map((q) => (
          <div key={q._id} className="card">
            <p>
              <strong>{q.questionText}</strong>
            </p>

            <ul>
              {q.options.map((opt, i) => (
                <li key={i}>{opt}</li>
              ))}
            </ul>

            <button
              className="btn-secondary"
              onClick={() => handleDelete(q._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <button
        className="btn-secondary"
        style={{ marginTop: "20px" }}
        onClick={() => navigate("/admin")}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
