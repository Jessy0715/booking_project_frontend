import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const Header = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { isMobile } = useBreakpoint();
  const user       = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin    = user.role === "admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef    = useRef(null);

  // 點選單外部關閉
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // 換頁時關閉
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = isAdmin
    ? [
        { path: "/admin",       label: "後台管理" },
        { path: "/roomReserve", label: "預約月曆" },
      ]
    : [
        { path: "/roomInfo",    label: "精選空間" },
        { path: "/roomReserve", label: "預約月曆" },
        { path: "/myBookings",  label: "我的預約" },
      ];

  // ── Desktop nav link ──────────────────────────────────────────
  const NavLink = ({ path, label }) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        style={{
          background: "transparent", border: "none",
          padding: "5px 10px", fontSize: 13,
          fontFamily: "var(--font-sans)", cursor: "pointer",
          color: isActive ? "var(--accent)" : "var(--text-secondary)",
          fontWeight: isActive ? 500 : 400,
          borderBottom: isActive ? "1.5px solid var(--accent)" : "1.5px solid transparent",
          transition: "color 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "var(--text)"; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        {label}
      </button>
    );
  };

  return (
    <header style={{
      height: 56, padding: "0 24px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border-light)",
      position: "sticky", top: 0, zIndex: 200,
    }}>
      {/* 品牌名稱 */}
      <span
        onClick={() => navigate(isAdmin ? "/admin" : "/roomInfo")}
        style={{
          fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500,
          letterSpacing: "0.04em", color: "var(--text)", cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Lumino 自然光攝影棚
      </span>

      {/* ── Desktop Nav ─────────────────────────────────────── */}
      {!isMobile && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItems.map((item) => <NavLink key={item.path} {...item} />)}
          <div style={{ width: 1, height: 16, background: "var(--border)", margin: "0 8px" }} />
          <button className="nav-logout-btn" onClick={handleLogout}>登出</button>
        </div>
      )}

      {/* ── Mobile: 漢堡 ────────────────────────────────────── */}
      {isMobile && (
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            style={{
              background: "transparent", border: "1px solid var(--border)",
              borderRadius: 7, width: 36, height: 36, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 5, padding: 0, transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onMouseLeave={(e) => { if (!menuOpen) e.currentTarget.style.borderColor = "var(--border)"; }}
            aria-label="選單"
          >
            {[0, 1, 2].map((i) => (
              <span key={i} style={{
                display: "block", width: 18, height: 1.5, borderRadius: 2,
                background: menuOpen ? "var(--accent)" : "var(--text-secondary)",
                transition: "background 0.15s",
                transform: menuOpen && i === 0 ? "translateY(6.5px) rotate(45deg)"
                         : menuOpen && i === 2 ? "translateY(-6.5px) rotate(-45deg)"
                         : menuOpen && i === 1 ? "scaleX(0)"
                         : "none",
              }} />
            ))}
          </button>

          {/* Dropdown 選單 */}
          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              width: 180, background: "var(--surface)",
              border: "1px solid var(--border-light)", borderRadius: "var(--r)",
              boxShadow: "var(--shadow-md)", overflow: "hidden",
              animation: "fadeUp 0.18s ease",
            }}>
              {navItems.map(({ path, label }) => {
                const isActive = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "12px 16px", border: "none",
                      background: isActive ? "var(--accent-light)" : "transparent",
                      color: isActive ? "var(--accent)" : "var(--text)",
                      fontWeight: isActive ? 500 : 400,
                      fontSize: 13, fontFamily: "var(--font-sans)", cursor: "pointer",
                      borderBottom: "1px solid var(--border-light)",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--bg)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "12px 16px", border: "none", background: "transparent",
                  color: "oklch(0.42 0.14 15)", fontSize: 13,
                  fontFamily: "var(--font-sans)", cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.97 0.03 15)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                登出
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
