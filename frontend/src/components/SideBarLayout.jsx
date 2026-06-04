import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SidebarLayout({ children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className={`sidebar ${open ? "open" : ""}`}>
        <h3 className="logo">Proctoring</h3>

        <button
          onClick={() =>
            navigate(user.role === "admin" ? "/admin" : "/student")
          }
        >
          Dashboard
        </button>

        <button onClick={() => navigate("/profile")}>Profile</button>

        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="main">
        <button className="menu-btn" onClick={() => setOpen(!open)}>
          ☰
        </button>
        {children}
      </div>
    </div>
  );
}
