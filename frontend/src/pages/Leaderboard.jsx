import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

export default function Leaderboard() {
  const { examId } = useParams();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ SAFE ROLE DETECTION
  let userRole = null;

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      userRole = parsed?.role;
    }

    if (!userRole) {
      userRole = localStorage.getItem("role");
    }
  } catch {
    console.log("Role parse error");
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/exams/${examId}/leaderboard`);
        setData(res.data);
      } catch (err) {
        console.log("Leaderboard error:", err);
      }
    };

    load();
  }, [examId]);

  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleExport = async () => {
    try {
      const res = await API.get(`/exams/${examId}/leaderboard/export`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "leaderboard.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.log("Export error:", err);
    }
  };

  return (
    <div className="container">
      <h2 className="page-title">🏆 Leaderboard</h2>

      <input
        type="text"
        placeholder="Search student..."
        className="leaderboard-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ✅ Export Button */}
      {userRole === "admin" && (
        <button
          className="btn-secondary"
          style={{ marginBottom: "20px" }}
          onClick={handleExport}
        >
          Export CSV
        </button>
      )}

      <div className="leaderboard-grid">
        {filtered.length === 0 && <div className="card">No results found</div>}

        {filtered.map((item) => {
          const percentage = item.total
            ? ((item.score / item.total) * 100).toFixed(1)
            : 0;

          return (
            <div key={item.rank} className="leaderboard-card">
              <div className="rank-badge">
                {item.rank <= 3
                  ? ["🥇", "🥈", "🥉"][item.rank - 1]
                  : `#${item.rank}`}
              </div>

              <div className="leaderboard-info">
                <h3>{item.name}</h3>
                <p>
                  Score: {item.score} / {item.total}
                </p>
              </div>

              <div className="percentage">{percentage}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
