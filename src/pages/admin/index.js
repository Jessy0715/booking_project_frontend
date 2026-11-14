import Header from "@/components/Header";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import RoomManager from "./components/RoomManager";
import BookingReview from "./components/BookingReview";

const Admin = () => {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab]     = useState(0);
  const [roomKeyword, setRoomKeyword] = useState(""); // 場地管理觸發搜尋後才更新，預約審核的場地下拉共用

  return (
    <>
      <Header />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={{
        height: 200,
        background: "linear-gradient(135deg, oklch(0.25 0.04 55), oklch(0.15 0.02 75))",
        position: "relative", overflow: "hidden", display: "flex", alignItems: "center",
      }}>
        <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <circle cx="76%" cy="55%" r="110" fill="oklch(0.7 0.12 42 / 0.09)" />
          <circle cx="88%" cy="18%" r="60"  fill="oklch(0.55 0.1 145 / 0.07)" />
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1={`${(i + 1) * 5.5}%`} y1="0" x2={`${(i + 1) * 5.5}%`} y2="100%"
              stroke="white" strokeOpacity="0.025" />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, oklch(0 0 0 / 0.45), transparent 60%)" }} />
        <div style={{ position: "relative", padding: "0 60px", color: "white", animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10, fontWeight: 300 }}>
            Management Console
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 400, letterSpacing: "0.06em", marginBottom: 12, lineHeight: 1.3 }}>
            後台管理系統
          </h1>
          <Link to="/adminCalendar" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.28)", paddingBottom: 1 }}>
            前往月曆查看 →
          </Link>
        </div>
      </section>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "20px 16px" : "36px 40px", fontFamily: "var(--font-sans)" }}>

        {/* ── Tab 切換器 ──────────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 4, padding: 4,
          background: "var(--bg)", borderRadius: 10, marginBottom: 32,
          width: "fit-content", boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border-light)",
        }}>
          {["場地管理", "預約審核"].map((label, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              style={{
                padding: "8px 28px", border: "none", borderRadius: 7,
                background: activeTab === i ? "var(--surface)" : "transparent",
                color: activeTab === i ? "var(--text)" : "var(--text-muted)",
                fontWeight: activeTab === i ? 500 : 400,
                cursor: "pointer",
                boxShadow: activeTab === i ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s", fontFamily: "var(--font-sans)", fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ════════════ Tab 0：場地管理（常駐掛載，切換分頁時保留搜尋字／頁碼／勾選） ════════════ */}
        <div hidden={activeTab !== 0}>
          <RoomManager roomKeyword={roomKeyword} onKeywordChange={setRoomKeyword} />
        </div>

        {/* ════════════ Tab 1：預約審核 ════════════ */}
        {activeTab === 1 && <BookingReview roomKeyword={roomKeyword} />}
      </div>
    </>
  );
};

export default Admin;
