import Header from "@/components/Header";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { message as antdMsg } from "antd";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import {
  useSearchRoomsQuery,
  useSearchBookingsQuery,
  useReviewBookingMutation,
} from "@/services/bookingApi.generated";
import RoomManager from "./components/RoomManager";

const TIME_SLOT_LABEL = { morning: "上午", afternoon: "下午", night: "晚上" };

const STATUS_CONFIG = {
  pending:  { text: "審核中", color: "oklch(0.52 0.12 55)",  bg: "oklch(0.96 0.04 75)",  border: "oklch(0.80 0.08 55)" },
  approved: { text: "已核准", color: "oklch(0.42 0.1 145)",  bg: "oklch(0.95 0.04 145)", border: "oklch(0.72 0.08 145)" },
  rejected: { text: "已拒絕", color: "oklch(0.42 0.14 15)",  bg: "oklch(0.97 0.03 15)",  border: "oklch(0.76 0.1 15)" },
};

const TIME_SLOT_ORDER = { morning: 0, afternoon: 1, night: 2 };
const STATUS_ORDER    = { pending: 0, approved: 1, rejected: 2 };

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

const Admin = () => {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab]     = useState(0);
  const [roomKeyword, setRoomKeyword] = useState(""); // 場地管理觸發搜尋後才更新，預約審核的場地下拉共用

  const [bookingRoomFilter, setBookingRoomFilter]   = useState("");
  const [bookingSlotFilter, setBookingSlotFilter]   = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const [bookingSort, setBookingSort]               = useState({ field: "date", direction: "asc" });
  const [bookingPage, setBookingPage]               = useState(0);
  const [bookingRowsPerPage, setBookingRowsPerPage] = useState(10);

  // ── RTK Query ────────────────────────────────────────────────
  const { data: roomsData } = useSearchRoomsQuery({ keyword: roomKeyword || undefined, pageSize: 100 });
  const rooms = roomsData?.data ?? [];

  const { data: bookingsData, isError: bookingsError, refetch: refetchBookings } =
    useSearchBookingsQuery({});
  const bookings = (bookingsData?.data ?? []).map(b => ({ ...b, status: b.status?.toLowerCase() }));

  const [reviewBookingApi] = useReviewBookingMutation();

  const processedBookings = useMemo(() => {
    const filtered = bookings.filter((b) => {
      if (bookingRoomFilter   && String(b.roomId) !== bookingRoomFilter)   return false;
      if (bookingSlotFilter   && b.timeSlot !== bookingSlotFilter)         return false;
      if (bookingStatusFilter && b.status   !== bookingStatusFilter)       return false;
      return true;
    });
    const { field, direction } = bookingSort;
    return [...filtered].sort((a, b) => {
      let va, vb;
      if (field === "timeSlot") { va = TIME_SLOT_ORDER[a.timeSlot] ?? 99; vb = TIME_SLOT_ORDER[b.timeSlot] ?? 99; }
      else if (field === "status") { va = STATUS_ORDER[a.status] ?? 99; vb = STATUS_ORDER[b.status] ?? 99; }
      else { va = (a[field] || "").toString(); vb = (b[field] || "").toString(); }
      if (va < vb) return direction === "asc" ? -1 : 1;
      if (va > vb) return direction === "asc" ?  1 : -1;
      return 0;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, bookingRoomFilter, bookingSlotFilter, bookingStatusFilter, bookingSort]);

  const handleBookingSort = (field) => {
    setBookingSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
    setBookingPage(0);
  };

  const showMsg = (text, severity = "success") => {
    if (severity === "error")   antdMsg.error(text);
    else if (severity === "warning") antdMsg.warning(text);
    else antdMsg.success(text);
  };

  const handleReview = async (id, status) => {
    try {
      await reviewBookingApi({ id, bookingReviewRequest: { status } }).unwrap();
      showMsg(status === "approved" ? "已核准" : "已拒絕");
      refetchBookings();
    } catch (err) {
      showMsg(err?.data?.message || "操作失敗", "error");
    }
  };

  // ── Pagination ───────────────────────────────────────────────
  const totalPages    = Math.ceil(processedBookings.length / bookingRowsPerPage) || 1;
  const pagedBookings = processedBookings.slice(
    bookingPage * bookingRowsPerPage,
    bookingPage * bookingRowsPerPage + bookingRowsPerPage,
  );

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
        {activeTab === 1 && (
          <div key="tab-bookings" className="page-enter">
            {/* Filter */}
            <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={bookingRoomFilter}
                onChange={(e) => { setBookingRoomFilter(e.target.value); setBookingPage(0); }}
                style={{ height: 34, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, fontFamily: "var(--font-sans)", background: "var(--surface)", color: bookingRoomFilter ? "var(--text)" : "var(--text-muted)", outline: "none", minWidth: 160 }}
              >
                <option value="">全部場地</option>
                {rooms.map((r) => <option key={r.id} value={String(r.id)}>{r.title}</option>)}
              </select>
              <select
                value={bookingSlotFilter}
                onChange={(e) => { setBookingSlotFilter(e.target.value); setBookingPage(0); }}
                style={{ height: 34, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, fontFamily: "var(--font-sans)", background: "var(--surface)", color: bookingSlotFilter ? "var(--text)" : "var(--text-muted)", outline: "none", minWidth: 120 }}
              >
                <option value="">全部時段</option>
                <option value="morning">上午</option>
                <option value="afternoon">下午</option>
                <option value="night">晚上</option>
              </select>
              <select
                value={bookingStatusFilter}
                onChange={(e) => { setBookingStatusFilter(e.target.value); setBookingPage(0); }}
                style={{ height: 34, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, fontFamily: "var(--font-sans)", background: "var(--surface)", color: bookingStatusFilter ? "var(--text)" : "var(--text-muted)", outline: "none", minWidth: 120 }}
              >
                <option value="">全部狀態</option>
                <option value="pending">審核中</option>
                <option value="approved">已核准</option>
                <option value="rejected">已拒絕</option>
              </select>
              {(bookingRoomFilter || bookingSlotFilter || bookingStatusFilter) && (
                <button
                  onClick={() => { setBookingRoomFilter(""); setBookingSlotFilter(""); setBookingStatusFilter(""); setBookingPage(0); }}
                  style={{ height: 34, padding: "0 14px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12, fontFamily: "var(--font-sans)", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}
                >
                  清除篩選
                </button>
              )}
            </div>

            {/* Table */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: "var(--r)", overflow: isMobile ? "auto" : "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                    {[
                      { key: "roomTitle", label: "場地" },
                      { key: "date",      label: "日期" },
                      { key: "timeSlot",  label: "時段" },
                      { key: "userName",  label: "預約人" },
                      { key: null,        label: "事由" },
                      { key: "status",    label: "狀態" },
                      { key: null,        label: "操作" },
                    ].map(({ key, label }) => (
                      <th
                        key={label}
                        style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}
                      >
                        {key ? (
                          <span
                            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 2 }}
                            onClick={() => handleBookingSort(key)}
                          >
                            {label}
                            <span style={{ color: bookingSort.field === key ? "var(--accent)" : "var(--text-muted)", fontSize: 11 }}>
                              {bookingSort.field === key ? (bookingSort.direction === "asc" ? " ↑" : " ↓") : " ⇅"}
                            </span>
                          </span>
                        ) : label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedBookings.map((b) => (
                    <tr
                      key={b.id}
                      style={{ borderBottom: "1px solid var(--border-light)", transition: "background 0.1s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "12px 16px", color: "var(--text)" }}>{b.roomTitle || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text)", whiteSpace: "nowrap" }}>{b.date}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{TIME_SLOT_LABEL[b.timeSlot]}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text)" }}>{b.userName || "—"}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {b.reason || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge status={b.status} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {b.status === "pending" ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => handleReview(b.id, "approved")}
                              style={{ padding: "5px 12px", background: "var(--green-bg)", border: "1px solid var(--green)", borderRadius: 6, fontSize: 12, color: "var(--green)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, transition: "all 0.1s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.90 0.06 145)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green-bg)"; }}
                            >
                              核准
                            </button>
                            <button
                              onClick={() => handleReview(b.id, "rejected")}
                              style={{ padding: "5px 12px", background: "oklch(0.97 0.03 15)", border: "1px solid oklch(0.78 0.1 15)", borderRadius: 6, fontSize: 12, color: "oklch(0.42 0.14 15)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 500, transition: "all 0.1s" }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.93 0.05 15)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(0.97 0.03 15)"; }}
                            >
                              拒絕
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>已審核</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {bookingsError && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "48px 0", color: "oklch(0.50 0.14 15)", fontSize: 13 }}>
                        預約資料載入失敗，請重新整理頁面
                      </td>
                    </tr>
                  )}
                  {!bookingsError && processedBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 13 }}>
                        {(bookingRoomFilter || bookingSlotFilter || bookingStatusFilter) ? "查無符合的預約紀錄" : "目前無預約申請"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {processedBookings.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>
                <span>
                  共 {processedBookings.length} 筆，第 {bookingPage * bookingRowsPerPage + 1}–{Math.min((bookingPage + 1) * bookingRowsPerPage, processedBookings.length)} 筆
                </span>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <span style={{ marginRight: 4 }}>每頁：</span>
                  <select
                    value={bookingRowsPerPage}
                    onChange={(e) => { setBookingRowsPerPage(Number(e.target.value)); setBookingPage(0); }}
                    style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "3px 6px", fontSize: 12, fontFamily: "var(--font-sans)", background: "var(--surface)", color: "var(--text)", outline: "none", marginRight: 8 }}
                  >
                    {[5, 10, 25].map((n) => <option key={n} value={n}>{n} 筆</option>)}
                  </select>
                  <button className="pg-btn" disabled={bookingPage === 0} onClick={() => setBookingPage(0)}>«</button>
                  <button className="pg-btn" disabled={bookingPage === 0} onClick={() => setBookingPage((p) => p - 1)}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i)
                    .filter((i) => Math.abs(i - bookingPage) <= 2)
                    .map((i) => (
                      <button key={i} className={`pg-btn${i === bookingPage ? " active" : ""}`} onClick={() => setBookingPage(i)}>
                        {i + 1}
                      </button>
                    ))}
                  <button className="pg-btn" disabled={bookingPage >= totalPages - 1} onClick={() => setBookingPage((p) => p + 1)}>›</button>
                  <button className="pg-btn" disabled={bookingPage >= totalPages - 1} onClick={() => setBookingPage(totalPages - 1)}>»</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Admin;
