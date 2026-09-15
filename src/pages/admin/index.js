import Header from "@/components/Header";
import {
  TextField, Grid,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Alert,
} from "@mui/material";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "@mui/icons-material";
import { Upload, Spin } from "antd";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import {
  useSearchRoomsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useDeleteRoomsMutation,
  useSearchBookingsQuery,
  useReviewBookingMutation,
  useUploadImageMutation,
} from "@/services/bookingApi.generated";

const TIME_SLOT_LABEL = { morning: "上午", afternoon: "下午", night: "晚上" };

const STATUS_CONFIG = {
  pending:  { text: "審核中", color: "oklch(0.52 0.12 55)",  bg: "oklch(0.96 0.04 75)",  border: "oklch(0.80 0.08 55)" },
  approved: { text: "已核准", color: "oklch(0.42 0.1 145)",  bg: "oklch(0.95 0.04 145)", border: "oklch(0.72 0.08 145)" },
  rejected: { text: "已拒絕", color: "oklch(0.42 0.14 15)",  bg: "oklch(0.97 0.03 15)",  border: "oklch(0.76 0.1 15)" },
};

const EMPTY_FORM = { roomImg: "", title: "", desc: "", price: { morning: "", afternoon: "", night: "" } };
const TIME_SLOT_ORDER = { morning: 0, afternoon: 1, night: 2 };
const STATUS_ORDER    = { pending: 0, approved: 1, rejected: 2 };

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--accent)",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--accent)" },
};

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
  const [filter, setFilter]           = useState("");
  const [roomKeyword, setRoomKeyword] = useState(""); // 觸發搜尋後才更新
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formValues, setFormValues]   = useState(EMPTY_FORM);
  const [selectedIds, setSelectedIds] = useState([]);
  const [snackbar, setSnackbar]       = useState({ open: false, message: "", severity: "success" });

  const [roomPage, setRoomPage]                     = useState(0);
  const [roomRowsPerPage, setRoomRowsPerPage]       = useState(5);

  const [bookingRoomFilter, setBookingRoomFilter]   = useState("");
  const [bookingSlotFilter, setBookingSlotFilter]   = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const [bookingSort, setBookingSort]               = useState({ field: "date", direction: "asc" });
  const [bookingPage, setBookingPage]               = useState(0);
  const [bookingRowsPerPage, setBookingRowsPerPage] = useState(10);

  // ── RTK Query ────────────────────────────────────────────────
  const { data: roomsData, isLoading: roomsLoading, refetch: refetchRooms } =
    useSearchRoomsQuery({ keyword: roomKeyword || undefined, pageSize: 100 });
  const rooms = roomsData?.data ?? [];

  const { data: bookingsData, refetch: refetchBookings } =
    useSearchBookingsQuery({});
  const bookings = (bookingsData?.data ?? []).map(b => ({ ...b, status: b.status?.toLowerCase() }));

  const [createRoomApi]    = useCreateRoomMutation();
  const [updateRoomApi]    = useUpdateRoomMutation();
  const [deleteRoomApi]    = useDeleteRoomMutation();
  const [deleteRoomsApi]   = useDeleteRoomsMutation();
  const [reviewBookingApi] = useReviewBookingMutation();
  const [uploadImageApi]   = useUploadImageMutation();
  const [pendingFile, setPendingFile] = useState(null); // { file: File, previewUrl: string }
  const [saving, setSaving]           = useState(false);

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

  const showMsg = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const handleOpenAdd = () => { setEditingId(null); setFormValues(EMPTY_FORM); setPendingFile(null); setIsModalOpen(true); };
  const handleOpenEdit = (room) => {
    setEditingId(room.id);
    setPendingFile(null);
    setFormValues({
      roomImg: room.roomImg ?? "",
      title:   room.title   ?? "",
      desc:    room.desc    ?? "",
      price: {
        morning:   String(room.price?.morning   ?? ""),
        afternoon: String(room.price?.afternoon ?? ""),
        night:     String(room.price?.night     ?? ""),
      },
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formValues.title.trim()) { showMsg("場地名稱為必填", "warning"); return; }
    setSaving(true);
    try {
      let roomImg = formValues.roomImg || undefined;
      if (pendingFile) {
        const formData = new FormData();
        formData.append("file", pendingFile.file);
        const res = await uploadImageApi({ body: formData }).unwrap();
        roomImg = res.data?.url || undefined;
      }
      const roomCreateRequest = {
        title:   formValues.title,
        roomImg,
        desc:    formValues.desc    || undefined,
        price: {
          morning:   Number(formValues.price.morning)   || undefined,
          afternoon: Number(formValues.price.afternoon) || undefined,
          night:     Number(formValues.price.night)     || undefined,
        },
      };
      if (editingId) {
        await updateRoomApi({ id: editingId, roomCreateRequest }).unwrap();
        showMsg("場地已更新");
      } else {
        await createRoomApi({ roomCreateRequest }).unwrap();
        showMsg("場地已新增");
      }
      setIsModalOpen(false);
      setPendingFile(null);
      refetchRooms();
    } catch (err) {
      showMsg(err?.data?.message || "操作失敗", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoomApi({ id }).unwrap();
      showMsg("場地已刪除");
      refetchRooms();
    } catch (err) {
      showMsg(err?.data?.message || "刪除失敗", "error");
    }
  };

  const handleBatchDelete = async () => {
    const count = selectedIds.length;
    try {
      await deleteRoomsApi({ ids: selectedIds }).unwrap();
      setSelectedIds([]);
      showMsg(`已刪除 ${count} 筆場地`);
      refetchRooms();
    } catch (err) {
      showMsg(err?.data?.message || "批次刪除失敗", "error");
    }
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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("price.")) {
      const key = name.split(".")[1];
      setFormValues((prev) => ({ ...prev, price: { ...prev.price, [key]: value } }));
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleSelect = (id) =>
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // ── Pagination ───────────────────────────────────────────────
  const roomTotalPages = Math.ceil(rooms.length / roomRowsPerPage) || 1;
  const pagedRooms     = rooms.slice(roomPage * roomRowsPerPage, roomPage * roomRowsPerPage + roomRowsPerPage);

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

        {/* ════════════ Tab 0：場地管理 ════════════ */}
        {activeTab === 0 && (
          <div key="tab-rooms" className="page-enter">
            {/* Toolbar */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: isMobile ? 10 : 0, marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ position: "relative", flex: isMobile ? 1 : "none" }}>
                  <SearchIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 16 }} />
                  <input
                    placeholder="搜尋場地名稱"
                    value={filter}
                    onChange={(e) => { setFilter(e.target.value); if (!e.target.value) { setRoomKeyword(""); setRoomPage(0); } }}
                    onKeyDown={(e) => { if (e.key === "Enter") { setRoomKeyword(filter); setRoomPage(0); } }}
                    style={{
                      paddingLeft: 34, paddingRight: filter ? 30 : 12, height: 34,
                      border: "1px solid var(--border)", borderRadius: 7,
                      fontSize: 13, fontFamily: "var(--font-sans)",
                      background: "var(--surface)", color: "var(--text)", outline: "none",
                      width: isMobile ? "100%" : 220,
                    }}
                  />
                  {filter && (
                    <button
                      onClick={() => { setFilter(""); setRoomKeyword(""); setRoomPage(0); }}
                      style={{
                        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                        border: "none", background: "none", cursor: "pointer", padding: 0,
                        color: "var(--text-muted)", fontSize: 15, lineHeight: 1, display: "flex", alignItems: "center",
                      }}
                      title="清除搜尋"
                    >
                      ×
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setRoomKeyword(filter); setRoomPage(0); }}
                  className="room-book-btn"
                  style={{ padding: "7px 16px" }}
                >
                  搜尋
                </button>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleOpenAdd}
                  style={{ padding: "7px 18px", background: "var(--accent)", color: "white", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
                >
                  ＋ 新增場地
                </button>
                <button
                  disabled={selectedIds.length === 0}
                  onClick={handleBatchDelete}
                  style={{
                    padding: "7px 16px", background: "transparent",
                    color: selectedIds.length === 0 ? "var(--text-muted)" : "oklch(0.42 0.14 15)",
                    border: `1px solid ${selectedIds.length === 0 ? "var(--border)" : "oklch(0.78 0.1 15)"}`,
                    borderRadius: 7, fontSize: 13,
                    cursor: selectedIds.length === 0 ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-sans)", transition: "all 0.15s",
                  }}
                >
                  批次刪除{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                </button>
              </div>
            </div>

            {/* Room Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {roomsLoading && (
                <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)", fontSize: 13 }}>載入中…</div>
              )}
              {!roomsLoading && pagedRooms.map((room, idx) => (
                <div
                  key={room.id}
                  style={{
                    background: "var(--surface)", border: "1px solid var(--border-light)",
                    borderRadius: "var(--r)", padding: 20, display: "flex", gap: 20,
                    alignItems: "flex-start",
                    animation: `fadeUp 0.4s ease ${idx * 0.05}s both`,
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Checkbox */}
                  <div style={{ paddingTop: 3 }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(room.id)}
                      onChange={() => toggleSelect(room.id)}
                      style={{ width: 15, height: 15, cursor: "pointer", accentColor: "var(--accent)" }}
                    />
                  </div>

                  {/* Thumbnail - hidden on mobile */}
                  {!isMobile && (
                    <div style={{ width: 160, height: 116, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--bg)" }}>
                      {room.roomImg && (
                        <img src={room.roomImg} alt={room.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", marginTop: 6, flexShrink: 0 }} />
                      <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500, letterSpacing: "0.02em", color: "var(--text)" }}>
                        {room.title}
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginBottom: 14, marginLeft: 14, lineHeight: 1.6 }}>
                      {room.desc}
                    </div>

                    {/* Price grid */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 1, maxWidth: 300, background: "var(--border-light)",
                      borderRadius: 8, overflow: "hidden",
                    }}>
                      {[
                        { label: "上午",   key: "morning",   accent: false },
                        { label: "下午",   key: "afternoon", accent: true  },
                        { label: "晚上",   key: "night",     accent: false },
                      ].map(({ label, key, accent }) => (
                        <div key={key} style={{ padding: "8px 12px", textAlign: "center", background: accent ? "var(--accent-light)" : "var(--surface)" }}>
                          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: accent ? "var(--accent)" : "var(--text)" }}>
                            NT$ {room.price?.[key] || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => handleOpenEdit(room)}
                      style={{ padding: "6px 14px", background: "transparent", border: "1px solid var(--border)", borderRadius: 7, fontSize: 12, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                    >
                      編輯
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      style={{ padding: "6px 14px", background: "transparent", border: "1px solid oklch(0.88 0.06 15)", borderRadius: 7, fontSize: 12, color: "oklch(0.50 0.15 15)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.97 0.03 15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}

              {!roomsLoading && rooms.length === 0 && (
                <div style={{ textAlign: "center", padding: "52px 0", color: "var(--text-muted)", fontSize: 14 }}>
                  尚無場地資料
                </div>
              )}
            </div>

            {/* Room Pagination */}
            {rooms.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>
                <span>
                  共 {rooms.length} 筆，第 {roomPage * roomRowsPerPage + 1}–{Math.min((roomPage + 1) * roomRowsPerPage, rooms.length)} 筆
                </span>
                <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                  <span style={{ marginRight: 4 }}>每頁：</span>
                  <select
                    value={roomRowsPerPage}
                    onChange={(e) => { setRoomRowsPerPage(Number(e.target.value)); setRoomPage(0); }}
                    style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "3px 6px", fontSize: 12, fontFamily: "var(--font-sans)", background: "var(--surface)", color: "var(--text)", outline: "none", marginRight: 8 }}
                  >
                    {[5, 10, 20].map((n) => <option key={n} value={n}>{n} 筆</option>)}
                  </select>
                  <button className="pg-btn" disabled={roomPage === 0} onClick={() => setRoomPage(0)}>«</button>
                  <button className="pg-btn" disabled={roomPage === 0} onClick={() => setRoomPage((p) => p - 1)}>‹</button>
                  {Array.from({ length: roomTotalPages }, (_, i) => i)
                    .filter((i) => Math.abs(i - roomPage) <= 2)
                    .map((i) => (
                      <button key={i} className={`pg-btn${i === roomPage ? " active" : ""}`} onClick={() => setRoomPage(i)}>
                        {i + 1}
                      </button>
                    ))}
                  <button className="pg-btn" disabled={roomPage >= roomTotalPages - 1} onClick={() => setRoomPage((p) => p + 1)}>›</button>
                  <button className="pg-btn" disabled={roomPage >= roomTotalPages - 1} onClick={() => setRoomPage(roomTotalPages - 1)}>»</button>
                </div>
              </div>
            )}
          </div>
        )}

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
                  {processedBookings.length === 0 && (
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

      {/* ── 新增 / 編輯場地 Dialog ──────────────────────────────────── */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "10px", fontFamily: "var(--font-sans)" } }}
      >
        <DialogTitle sx={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: 17, color: "var(--text)", pb: 1 }}>
          {editingId ? "編輯場地" : "新增場地"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
              {/* 場地圖片上傳 */}
              <div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 6 }}>場地圖片</div>
                <div style={{ position: "relative" }}>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    rootClassName="room-img-upload"
                    customRequest={({ file, onSuccess }) => {
                      const previewUrl = URL.createObjectURL(file);
                      setPendingFile({ file, previewUrl });
                      onSuccess({});
                    }}
                  >
                    <Spin spinning={saving && !!pendingFile}>
                      {(pendingFile?.previewUrl || formValues.roomImg) ? (
                        <div style={{ position: "relative", width: "100%", cursor: "pointer", borderRadius: 8, overflow: "hidden" }}>
                          <img
                            src={pendingFile?.previewUrl || formValues.roomImg}
                            alt="場地圖片"
                            style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                          />
                          <div style={{
                            position: "absolute", inset: 0, background: "rgba(0,0,0,0)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.2s",
                            fontSize: 13, color: "white", fontFamily: "var(--font-sans)", fontWeight: 500,
                          }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.45)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0)"; }}
                          >
                            點擊更換圖片
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          width: "100%", height: 120, border: "1.5px dashed var(--border)",
                          borderRadius: 8, display: "flex", flexDirection: "column",
                          alignItems: "center", justifyContent: "center", gap: 6,
                          cursor: "pointer", background: "var(--bg)",
                          transition: "border-color 0.15s",
                          fontFamily: "var(--font-sans)",
                        }}
                          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                        >
                          <span style={{ fontSize: 22, opacity: 0.4 }}>↑</span>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>點擊或拖曳上傳圖片</span>
                          <span style={{ fontSize: 11, color: "var(--text-muted)", opacity: 0.7 }}>JPG、PNG、WebP</span>
                        </div>
                      )}
                    </Spin>
                  </Upload>

                  {/* × 移除按鈕：疊在圖片右上角，與 Upload 分離避免觸發 file picker */}
                  {(pendingFile?.previewUrl || formValues.roomImg) && (
                    <button
                      type="button"
                      onClick={() => { setFormValues((prev) => ({ ...prev, roomImg: "" })); setPendingFile(null); }}
                      style={{
                        position: "absolute", top: 8, right: 8,
                        width: 26, height: 26, borderRadius: "50%",
                        border: "none", background: "rgba(0,0,0,0.55)",
                        color: "white", fontSize: 15, lineHeight: 1,
                        cursor: "pointer", display: "flex", alignItems: "center",
                        justifyContent: "center", zIndex: 2,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.8)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.55)"; }}
                      title="移除圖片"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              <TextField size="small" label="場地名稱 *" name="title"
                value={formValues.title} onChange={handleFormChange} fullWidth sx={fieldSx} />
              <TextField size="small" label="場地說明" name="desc"
                value={formValues.desc} onChange={handleFormChange} fullWidth multiline rows={2} sx={fieldSx} />
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: -6 }}>場地費用（NT$）</div>
              <Grid container spacing={1}>
                {[["上午", "morning"], ["下午", "afternoon"], ["晚上", "night"]].map(([label, key]) => (
                  <Grid item xs={4} key={key}>
                    <TextField size="small" type="number" label={label} name={`price.${key}`}
                      value={formValues.price[key]} onChange={handleFormChange} fullWidth sx={fieldSx} />
                  </Grid>
                ))}
              </Grid>
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <button
            onClick={() => setIsModalOpen(false)}
            style={{ padding: "8px 20px", background: "transparent", border: "1px solid var(--border)", borderRadius: 7, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: "8px 20px", background: "var(--accent)", border: "none", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)", transition: "background 0.15s", opacity: saving ? 0.7 : 1 }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--accent-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
          >
            {saving ? "儲存中…" : "儲存"}
          </button>
        </DialogActions>
      </Dialog>

      {/* ── 全域提示 ──────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Admin;
