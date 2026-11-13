import { Search as SearchIcon } from "@mui/icons-material";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import RoomFormDialog from "./RoomFormDialog";
import { useRoomManager } from "./useRoomManager";

// 場地管理分頁。搜尋關鍵字由父層持有，讓預約審核的場地下拉維持與拆分前相同的篩選結果。
const RoomManager = ({ roomKeyword, onKeywordChange }) => {
  const { isMobile } = useBreakpoint();
  const {
    filter, handleFilterChange, submitSearch, handleClearSearch,
    rooms, roomsLoading, roomsError, pagedRooms,
    roomPage, setRoomPage, roomRowsPerPage, setRoomRowsPerPage, roomTotalPages,
    selectedIds, toggleSelect, handleBatchDelete, handleDelete,
    handleOpenAdd, handleOpenEdit, dialog,
  } = useRoomManager({ roomKeyword, onKeywordChange });

  return (
    <div className="page-enter">
      {/* Toolbar */}
      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: isMobile ? 10 : 0, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: isMobile ? 1 : "none" }}>
            <SearchIcon style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 16 }} />
            <input
              placeholder="搜尋場地名稱"
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
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
                onClick={handleClearSearch}
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
            onClick={submitSearch}
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

        {!roomsLoading && roomsError && (
          <div style={{ textAlign: "center", padding: "52px 0", color: "oklch(0.50 0.14 15)", fontSize: 13 }}>
            場地資料載入失敗，請重新整理頁面
          </div>
        )}
        {!roomsLoading && !roomsError && rooms.length === 0 && (
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

      <RoomFormDialog {...dialog} />
    </div>
  );
};

export default RoomManager;
