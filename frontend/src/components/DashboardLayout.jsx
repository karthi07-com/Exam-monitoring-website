import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const dashboardPath = user?.role === "admin" ? "/admin" : "/student";

  const navLinks = [
    { label: "Dashboard", path: dashboardPath, onClick: () => { navigate(dashboardPath); setOpen(false); } },
    { label: "Profile", path: "/profile", onClick: () => { navigate("/profile"); setOpen(false); } },
    { label: "Logout", onClick: () => { handleLogout(); setOpen(false); }, isLogout: true },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="layout">
      {/* Main Content */}
      <div className="main">
        <div className="topbar">
          {/* Logo */}
          <h3 className="logo">Proctoring</h3>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>Welcome, {user?.name}</span>

            {/* Click-to-open menu */}
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                className="menu-btn"
                onClick={() => setOpen(!open)}
                aria-label="Menu"
              >
                ☰
              </button>

              {open && (
                <div className="dropdown">
                  {navLinks.map((link, i) => (
                    <button
                      key={i}
                      onClick={link.onClick}
                      className={`dropdown-item ${link.isLogout ? "dropdown-item-logout" : ""} ${
                        location.pathname === link.path ? "dropdown-item-active" : ""
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content">{children}</div>
      </div>

      <style>{`
        .layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #e8f0ff, #f5f7fa);
        }

        .main {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          height: 60px;
          background: white;
          border-bottom: 1px solid #e0e4f0;
          box-shadow: 0 2px 10px rgba(63,81,181,0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          font-size: 18px;
          font-weight: 700;
          color: #3f51b5;
          margin: 0;
        }

        .menu-btn {
          background: #f5f7ff;
          border: 1px solid #e0e4f0;
          border-radius: 8px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          color: #3f51b5;
          margin: 0;
          padding: 0;
          transition: background 0.2s;
        }

        .menu-btn:hover {
          background: #e8eaf6;
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid #e0e4f0;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(63,81,181,0.14);
          min-width: 160px;
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 200;
          animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #444;
          cursor: pointer;
          margin: 0;
          transition: background 0.15s, color 0.15s;
        }

        .dropdown-item:hover {
          background: #f0f2ff;
          color: #3f51b5;
          transform: none;
        }

        .dropdown-item-active {
          background: #e8eaf6;
          color: #3f51b5;
        }

        .dropdown-item-logout {
          color: #e53935;
          border-top: 1px solid #f5f5f5;
          margin-top: 4px;
          padding-top: 12px;
        }

        .dropdown-item-logout:hover {
          background: #fff0f0;
          color: #c62828;
        }

        .content {
          flex: 1;
          padding: 32px 24px;
        }
      `}</style>
    </div>
  );
}