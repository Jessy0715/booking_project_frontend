import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useBookingReview } from "./useBookingReview";

const TIME_SLOT_LABEL = { morning: "上午", afternoon: "下午", night: "晚上" };

const STATUS_CONFIG = {
  pending:  { text: "審核中", color: "oklch(0.52 0.12 55)",  bg: "oklch(0.96 0.04 75)",  border: "oklch(0.80 0.08 55)" },
  approved: { text: "已核准", color: "oklch(0.42 0.1 145)",  bg: "oklch(0.95 0.04 145)", border: "oklch(0.72 0.08 145)" },
  rejected: { text: "已拒絕", color: "oklch(0.42 0.14 15)",  bg: "oklch(0.97 0.03 15)",  border: "oklch(0.76 0.1 15)" },
};

const COLUMNS = [
  { key: "roomTitle", label: "場地" },
  { key: "date",      label: "日期" },
  { key: "timeSlot",  label: "時段" },
  { key: "userName",  label: "預約人" },
  { key: null,        label: "事由" },
  { key: "status",    label: "狀態" },
  { key: null,        label: "操作" },
];

const selectStyle = (hasValue, minWidth) => ({
  height: 34, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 7,
  fontSize: 13, fontFamily: "var(--font-sans)", background: "var(--surface)",
  color: hasValue ? "var(--text)" : "var(--text-muted)", outline: "none", minWidth,
});

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

// 預約審核分頁。roomKeyword 由父層提供（與場地管理共用，場地下拉選項來源不變）。
const BookingReview = ({ roomKeyword }) => {
  const { isMobile } = useBreakpoint();
  const {
    rooms, bookingsError, processedBookings, pagedBookings,
    roomFilter, slotFilter, statusFilter,
    handleRoomFilterChange, handleSlotFilterChange, handleStatusFilterChange, handleClearFilters,
    sort, handleSort,
    page, setPage, rowsPerPage, handleRowsPerPageChange, totalPages,
    handleReview,
  } = useBookingReview({ roomKeyword });

  const hasFilter = Boolean(roomFilter || slotFilter || statusFilter);

  return (
    <div className="page-enter">
      {/* Filter */}
      <div style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={roomFilter}
          onChange={(e) => handleRoomFilterChange(e.target.value)}
          style={selectStyle(roomFilter, 160)}
        >
          <option value="">全部場地</option>
          {rooms.map((r) => <option key={r.id} value={String(r.id)}>{r.title}</option>)}
        </select>
        <select
          value={slotFilter}
          onChange={(e) => handleSlotFilterChange(e.target.value)}
          style={selectStyle(slotFilter, 120)}
        >
          <option value="">全部時段</option>
          <option value="morning">上午</option>
          <option value="afternoon">下午</option>
          <option value="night">晚上</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          style={selectStyle(statusFilter, 120)}
        >
          <option value="">全部狀態</option>
          <option value="pending">審核中</option>
          <option value="approved">已核准</option>
          <option value="rejected">已拒絕</option>
        </select>
        {hasFilter && (
          <button
            onClick={handleClearFilters}
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
              {COLUMNS.map(({ key, label }) => (
                <th
                  key={label}
                  style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "var(--text-secondary)", letterSpacing: "0.04em", whiteSpace: "nowrap", userSelect: "none" }}
                >
                  {key ? (
                    <span
                      style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 2 }}
                      onClick={() => handleSort(key)}
                    >
                      {label}
                      <span style={{ color: sort.field === key ? "var(--accent)" : "var(--text-muted)", fontSize: 11 }}>
                        {sort.field === key ? (sort.direction === "asc" ? " ↑" : " ↓") : " ⇅"}
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
                  {hasFilter ? "查無符合的預約紀錄" : "目前無預約申請"}
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
            共 {processedBookings.length} 筆，第 {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, processedBookings.length)} 筆
          </span>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            <span style={{ marginRight: 4 }}>每頁：</span>
            <select
              value={rowsPerPage}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "3px 6px", fontSize: 12, fontFamily: "var(--font-sans)", background: "var(--surface)", color: "var(--text)", outline: "none", marginRight: 8 }}
            >
              {[5, 10, 25].map((n) => <option key={n} value={n}>{n} 筆</option>)}
            </select>
            <button className="pg-btn" disabled={page === 0} onClick={() => setPage(0)}>«</button>
            <button className="pg-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i)
              .filter((i) => Math.abs(i - page) <= 2)
              .map((i) => (
                <button key={i} className={`pg-btn${i === page ? " active" : ""}`} onClick={() => setPage(i)}>
                  {i + 1}
                </button>
              ))}
            <button className="pg-btn" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>›</button>
            <button className="pg-btn" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>»</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingReview;
