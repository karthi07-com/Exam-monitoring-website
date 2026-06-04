import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function Profile() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [user, setUser] = useState(storedUser || {});
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadStats = async () => {
      try {
        if (user.role === "student") {
          const res = await API.get("/exams/my-results");
          setStats({ attempts: res.data.length });
        } else if (user.role === "admin") {
          const res = await API.get("/exams");
          setStats({ exams: res.data.length });
        }
      } catch (err) {
        console.log("Profile stats error:", err);
      }
    };

    loadStats();
  });

  const handleUpdate = async () => {
    try {
      await API.put("/auth/update-profile", { name });

      const updatedUser = { ...user, name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setEditing(false);
      alert("Profile updated successfully");
    } catch {
      alert("Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "500px", margin: "auto" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "#3f51b5",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              margin: "0 auto 15px",
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <h2>{user?.name}</h2>

          <span
            style={{
              padding: "6px 12px",
              borderRadius: "20px",
              background: user?.role === "admin" ? "#e3f2fd" : "#e8f5e9",
              color: user?.role === "admin" ? "#1565c0" : "#2e7d32",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            {user?.role?.toUpperCase()}
          </span>
        </div>

        <hr style={{ margin: "20px 0" }} />

        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        {editing ? (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} />

            <button className="btn-primary" onClick={handleUpdate}>
              Save
            </button>

            <button className="btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn-secondary" onClick={() => setEditing(true)}>
            Edit Name
          </button>
        )}

        <hr style={{ margin: "20px 0" }} />

        {stats && (
          <div>
            {user.role === "student" && (
              <p>
                <strong>Total Exams Attempted:</strong> {stats.attempts}
              </p>
            )}

            {user.role === "admin" && (
              <p>
                <strong>Total Exams Created:</strong> {stats.exams}
              </p>
            )}
          </div>
        )}

        <button
          className="btn-danger"
          style={{ marginTop: "20px" }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
