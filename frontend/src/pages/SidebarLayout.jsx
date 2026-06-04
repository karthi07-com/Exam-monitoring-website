import { useNavigate, useLocation } from "react-router-dom";

export default function SidebarLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const dashboardPath = user?.role === "admin" ? "/admin" : "/student";

  const navLinks = [
    { label: "Dashboard", path: dashboardPath, onClick: () => navigate(dashboardPath) },
    { label: "Profile", path: "/profile", onClick: () => navigate("/profile") },
    { label: "Logout", path: null, onClick: handleLogout, isLogout: true },
  ];

  return (
    <div className="layout-wrapper">
      {/* TOP NAVBAR */}
      <nav className="topnav">
        <div className="topnav-left">
          <span className="topnav-logo">⬡ Proctoring</span>
        </div>

        <div className="topnav-right">
          <div className="topnav-user">
            <div className="topnav-avatar">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="topnav-username">{user?.name}</span>
            <span className="topnav-role">{user?.role}</span>
          </div>

          {/* Hamburger menu with hover dropdown */}
          <div className="menu-wrapper">
            <button className="menu-btn" aria-label="Menu">
              <span className="menu-icon">☰</span>
            </button>
            <div className="menu-dropdown">
              {navLinks.map((link, i) => (
                <button
                  key={i}
                  onClick={link.onClick}
                  className={`menu-item ${link.isLogout ? "menu-item-logout" : ""} ${
                    location.pathname === link.path ? "menu-item-active" : ""
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="topnav-main">{children}</main>

      <style>{`
        .menu-wrapper {
          position: relative;
        }

        .menu-btn {
          background: #f5f7ff;
          border: 1px solid #e0e4f0;
          border-radius: 8px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin: 0;
          padding: 0;
          transition: background 0.2s;
        }

        .menu-btn:hover {
          background: #e8eaf6;
        }

        .menu-icon {
          font-size: 18px;
          color: #3f51b5;
          line-height: 1;
        }

        .menu-dropdown {
          display: none;
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border: 1px solid #e0e4f0;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(63, 81, 181, 0.12);
          min-width: 160px;
          padding: 6px;
          z-index: 200;
          flex-direction: column;
          gap: 2px;
        }

        .menu-wrapper:hover .menu-dropdown {
          display: flex;
        }

        .menu-item {
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

        .menu-item:hover {
          background: #f0f2ff;
          color: #3f51b5;
          transform: none;
        }

        .menu-item-active {
          background: #e8eaf6;
          color: #3f51b5;
        }

        .menu-item-logout {
          color: #e53935;
          margin-top: 4px;
          border-top: 1px solid #f5f5f5;
          border-radius: 0 0 8px 8px;
        }

        .menu-item-logout:hover {
          background: #fff0f0;
          color: #c62828;
        }
      `}</style>
    </div>
  );
}