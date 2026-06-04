import { useEffect, useState } from "react";
import API from "../api/api";

export default function StudentResults() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await API.get("/exams/my-results");
        setResults(res.data);
      } catch {
        console.log("Failed to load results");
      }
    };
    loadResults();
  }, []);

  return (
    <div className="container">
      <h2>My Exam History</h2>

      {results.length === 0 && (
        <div className="card">
          <p>No exams attempted yet.</p>
        </div>
      )}

      <div className="dashboard-grid">
        {results.map((result) => {
          const percentage =
            result.total === 0
              ? 0
              : ((result.score / result.total) * 100).toFixed(2);

          return (
            <div key={result._id} className="card">
              <h3>{result.examId?.title}</h3>

              <p>
                Score: {result.score}/{result.total}
              </p>

              <p>Percentage: {percentage}%</p>

              <p>Status: {result.status}</p>

              <p>Violations: {result.violations?.length || 0}</p>

              <p>Date: {new Date(result.updatedAt).toLocaleDateString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
