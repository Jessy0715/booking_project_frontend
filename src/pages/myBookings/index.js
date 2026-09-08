import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const TIME_SLOT_LABEL = { morning: "上午 09:00–12:00", afternoon: "下午 13:00–17:00", night: "晚上 18:00–21:00" };
const TIME_SLOT_SHORT = { morning: "上午", afternoon: "下午", night: "晚上" };

const STATUS_CONFIG = {
  pending:  { text: "審核中", color: "oklch(0.52 0.12 55)",  bg: "oklch(0.96 0.04 75)",  border: "oklch(0.80 0.08 55)" },
  approved: { text: "已核准", color: "oklch(0.42 0.1 145)",  bg: "oklch(0.95 0.04 145)", border: "oklch(0.72 0.08 145)" },
  rejected: { text: "已拒絕", color: "oklch(0.42 0.14 15)",  bg: "oklch(0.97 0.03 15)",  border: "oklch(0.76 0.1 15)" },
};

const TABS = [
  { key: "all",      label: "全部" },
  { key: "pending",  label: "審核中" },
  { key: "approved", label: "已核准" },
  { key: "rejected", label: "已拒絕" },
];

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || {};
  return (
    <span style={{
      fontSize: 11, padding: "3px 9px", borderRadius: 20, fontWeight: 500,
      color: c.color, background: c.bg, border: `1px solid ${c.border}`,
      fontFamily: "var(--font-sans)", whiteSpace: "nowrap",
    }}>
      {c.text || status}
    </span>
  );
};

const MyBookings = () => {
  const navigate  = useNavigate();
  const { isMobile } = useBreakpoint();
  const user      = JSON.parse(localStorage.getItem("user") || "{}");

  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [activeTab, setActiveTab]     = useState("all");
  const [confirmingId, setConfirmingId] = useState(null); // 正在確認取消的預約 id
  const [toast, setToast]             = useState({ show: false, msg: "", ok: true });

  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  };

  const fetchBookings = useCallback(async () => {
    if (!user.id) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/bookings?userId=${user.id}`);
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch {
      showToast("無法取得預約資料", false);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  useEffect(() => {
    if (!user.id) { navigate("/login"); return; }
    fetchBookings();
  }, [fetchBookings, navigate, user.id]);

  const handleCancel = async (id) => {
    try {
      const res  = await fetch(`${API_URL}/api/bookings/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setConfirmingId(null);
        showToast("預約已取消");
        fetchBookings();
      } else {
        showToast(json.message || "取消失敗", false);
      }
    } catch {
      showToast("無法連線至伺服器", false);
    }
  };

  const filtered = activeTab === "all"
    ? bookings
    : bookings.filter((b) => b.status === activeTab);

  // 各狀態數量（for tab badge）
  const counts = bookings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

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
            My Reservations
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 400, letterSpacing: "0.06em", marginBottom: 10, lineHeight: 1.3 }}>
            我的預約紀錄
          </h1>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            {user.account} · 共 {bookings.length} 筆
          </div>
        </div>
      </section>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: isMobile ? "20px 16px" : "36px 40px", fontFamily: "var(--font-sans)" }}>

        {/* ── Status Tabs ─────────────────────────────────────────── */}
        <div style={{
          display: "flex", gap: 4, padding: 4,
          background: "var(--bg)", borderRadius: 10, marginBottom: 28,
          width: "fit-content", boxShadow: "var(--shadow-sm)",
          border: "1px solid var(--border-light)",
        }}>
          {TABS.map(({ key, label }) => {
            const count = key === "all" ? bookings.length : (counts[key] || 0);
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  padding: "7px 18px", border: "none", borderRadius: 7,
                  background: isActive ? "var(--surface)" : "transparent",
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                  fontWeight: isActive ? 500 : 400,
                  cursor: "pointer",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                  transition: "all 0.15s", fontFamily: "var(--font-sans)", fontSize: 13,
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    fontSize: 10, padding: "1px 6px", borderRadius: 10,
                    background: isActive ? "var(--accent-light)" : "var(--border-light)",
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    fontWeight: 500, minWidth: 16, textAlign: "center",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Booking List ─────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 13 }}>
            載入中…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 0",
            color: "var(--text-muted)", fontSize: 13,
            background: "var(--surface)", border: "1px solid var(--border-light)",
            borderRadius: "var(--r)",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>📋</div>
            {activeTab === "all" ? "您尚無任何預約紀錄" : `目前無「${TABS.find(t => t.key === activeTab)?.label}」的預約`}
            {activeTab === "all" && (
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => navigate("/roomInfo")}
                  style={{ padding: "8px 20px", background: "var(--accent)", color: "white", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
                >
                  前往預約場地
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((b, idx) => (
              <div
                key={b.id}
                style={{
                  background: "var(--surface)", border: "1px solid var(--border-light)",
                  borderRadius: "var(--r)", overflow: "hidden",
                  animation: `fadeUp 0.35s ease ${idx * 0.04}s both`,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  borderLeft: `3px solid ${STATUS_CONFIG[b.status]?.color || "var(--border)"}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border-light)"; }}
              >
                {/* Card body */}
                <div style={{ padding: isMobile ? "14px" : "16px 20px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "flex-start", gap: isMobile ? 10 : 16 }}>

                  {/* 左側：場地 + 日期時段 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-serif)", fontSize: 14.5, fontWeight: 500, color: "var(--text)", marginBottom: 6, letterSpacing: "0.02em" }}>
                      {b.roomTitle || "未知場地"}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: b.reason ? 8 : 0 }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 10, opacity: 0.6 }}>📅</span>
                        {b.date}
                      </span>
                      <span style={{ fontSize: 12, padding: "1px 8px", borderRadius: 4, background: "var(--accent-light)", color: "var(--accent)", fontWeight: 500 }}>
                        {TIME_SLOT_SHORT[b.timeSlot]}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {TIME_SLOT_LABEL[b.timeSlot]?.split(" ")[1]}
                      </span>
                    </div>
                    {b.reason && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", borderLeft: "2px solid var(--border)", paddingLeft: 8, marginTop: 4 }}>
                        {b.reason}
                      </div>
                    )}
                  </div>

                  {/* 右側：狀態 + 操作 */}
                  <div style={{ display: "flex", flexDirection: isMobile ? "row" : "column", alignItems: isMobile ? "center" : "flex-end", justifyContent: isMobile ? "space-between" : "flex-start", gap: 10, flexShrink: 0 }}>
                    <StatusBadge status={b.status} />
                    {b.status === "pending" && confirmingId !== b.id && (
                      <button
                        onClick={() => setConfirmingId(b.id)}
                        style={{ padding: "5px 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, color: "var(--text-muted)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "oklch(0.78 0.1 15)"; e.currentTarget.style.color = "oklch(0.42 0.14 15)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        取消預約
                      </button>
                    )}
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {b.createdAt?.slice(0, 10)}
                    </div>
                  </div>
                </div>

                {/* 取消確認列 */}
                {confirmingId === b.id && (
                  <div style={{
                    padding: "12px 20px",
                    background: "oklch(0.97 0.02 15)",
                    borderTop: "1px solid oklch(0.90 0.04 15)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    animation: "fadeUp 0.2s ease",
                  }}>
                    <span style={{ fontSize: 12, color: "oklch(0.42 0.14 15)" }}>
                      確定要取消這筆預約？取消後無法復原。
                    </span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setConfirmingId(null)}
                        style={{ padding: "5px 14px", background: "transparent", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                      >
                        算了
                      </button>
                      <button
                        onClick={() => handleCancel(b.id)}
                        style={{ padding: "5px 14px", background: "oklch(0.42 0.14 15)", border: "none", borderRadius: 6, fontSize: 12, color: "white", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500 }}
                      >
                        確認取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Toast ────────────────────────────────────────────────── */}
      {toast.show && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          padding: "12px 24px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          background: toast.ok ? "var(--green-bg)" : "oklch(0.97 0.03 15)",
          border: `1px solid ${toast.ok ? "var(--green)" : "oklch(0.78 0.1 15)"}`,
          color: toast.ok ? "var(--green)" : "oklch(0.42 0.14 15)",
          fontFamily: "var(--font-sans)", boxShadow: "var(--shadow-md)",
          animation: "fadeUp 0.3s ease", zIndex: 9999, whiteSpace: "nowrap",
        }}>
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default MyBookings;
