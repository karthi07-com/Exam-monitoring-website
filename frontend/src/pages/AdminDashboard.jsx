import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [exams, setExams] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const loadExams = async () => {
    try {
      const res = await API.get("/exams");
      setExams(res.data);
    } catch {
      console.log("Failed to load exams");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadExams();
      const analyticsRes = await API.get("/exams/analytics");
      setAnalytics(analyticsRes.data);
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await API.put(`/exams/${editingId}`, { title, duration });
      } else {
        await API.post("/exams", { title, duration });
      }
      setTitle("");
      setDuration("");
      setEditingId(null);
      await loadExams();
    } catch (err) {
      alert(err?.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (exam) => {
    setTitle(exam.title);
    setDuration(exam.duration);
    setEditingId(exam._id);
  };

  const handleDelete = async (examId) => {
    if (!window.confirm("Delete this exam?")) return;
    try {
      await API.delete(`/exams/${examId}`);
      await loadExams();
    } catch {
      alert("Delete failed");
    }
  };

  return (
    <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <p className="dashboard-subtitle">Create and manage exams</p>
        </div>

        {/* Create / Edit Exam */}
        <div className="card">
          <h3>{editingId ? "Update Exam" : "Create New Exam"}</h3>

          <input
            placeholder="Exam Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="Duration (minutes)"
            value={duration}
            type="number"
            min="1"
            onChange={(e) => setDuration(e.target.value)}
          />

          <div className="exam-actions">
            <button className="btn-primary" onClick={handleSubmit}>
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setDuration("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="card analytics-card">
            <h3>Analytics</h3>
            <div className="analytics-grid">
              <div className="card">
                <p className="analytics-label">Total Exams</p>
                <p className="analytics-value">{analytics.totalExams}</p>
              </div>
              <div className="card">
                <p className="analytics-label">Total Students</p>
                <p className="analytics-value">{analytics.totalStudents}</p>
              </div>
              <div className="card">
                <p className="analytics-label">Total Attempts</p>
                <p className="analytics-value">{analytics.totalAttempts}</p>
              </div>
              <div className="card">
                <p className="analytics-label">Average Score</p>
                <p className="analytics-value">{analytics.averageScore}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Exam Grid */}
        {exams.length === 0 ? (
          <div className="card" style={{ textAlign: "center", color: "#999", padding: "40px" }}>
            <p>No exams yet. Create your first exam above.</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {exams.map((exam) => (
              <div key={exam._id} className="card exam-card">
                <div className="exam-header">
                  <h3>{exam.title}</h3>
                  <span className="exam-duration">{exam.duration} mins</span>
                </div>

                <div className="exam-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => handleEdit(exam)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn-primary"
                    onClick={() => navigate(`/admin/add-question/${exam._id}`)}
                  >
                    Add Question
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => navigate(`/leaderboard/${exam._id}`)}
                  >
                    Leaderboard
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => handleDelete(exam._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}