import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const examsRes = await API.get("/exams");
        setExams(examsRes.data);

        if (user && user.role === "student") {
          const resultsRes = await API.get("/exams/my-results");
          setResults(resultsRes.data);
        }
      } catch (error) {
        console.log("Dashboard load error:", error);
      }
    };

    fetchData();
  }, []);

  const hasAttempted = (examId) =>
    results.some((r) => r.examId?._id === examId);

  const getResult = (examId) => results.find((r) => r.examId?._id === examId);

  const handleStart = (examId) => {
    if (hasAttempted(examId)) return;
    navigate(`/exam/${examId}`);
  };

  return (
    <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h2>Student Dashboard</h2>
          <p className="dashboard-subtitle">
            View exams, attempt tests, and check results
          </p>
        </div>

        {/* Exam Grid */}
        {exams.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "#999", padding: "40px" }}>
            <p>No exams available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {exams.map((exam) => {
              const result = getResult(exam._id);
              const attempted = hasAttempted(exam._id);

              return (
                <div
                  key={exam._id}
                  className={`card exam-card ${attempted ? "exam-card-attempted" : ""}`}
                >
                  <div className="exam-header">
                    <h3>{exam.title}</h3>
                    <span className="exam-duration">{exam.duration} mins</span>
                  </div>

                  <div className="exam-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => navigate(`/leaderboard/${exam._id}`)}
                    >
                      Leaderboard
                    </button>

                    {attempted ? (
                      <button disabled className="btn-secondary">
                        Attempted
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => handleStart(exam._id)}
                      >
                        Start
                      </button>
                    )}
                  </div>

                  {result && (
                    <div className="exam-result">
                      <p>
                        <strong>Score:</strong> {result.score} / {result.total}
                      </p>
                      <small>
                        {result.createdAt
                          ? new Date(result.createdAt).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}