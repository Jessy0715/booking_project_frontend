import { useState, useEffect, useMemo } from "react";
import { Skeleton, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const API_URL  = process.env.REACT_APP_API_URL || "http://localhost:3001";
const PAGE_SIZE = 5;

const SLOTS = [
  { key: "morning",   label: "上午", range: "09:00–12:00" },
  { key: "afternoon", label: "下午", range: "13:00–17:00" },
  { key: "night",     label: "晚上", range: "18:00–22:00" },
];

const selectStyle = {
  height: 34, border: "1px solid var(--border)", borderRadius: 7,
  padding: "0 10px", fontSize: 13, fontFamily: "var(--font-sans)",
  background: "var(--surface)", color: "var(--text)", outline: "none",
  cursor: "pointer",
};

const getMinPrice = (room) => {
  const prices = [room.price.morning, room.price.afternoon, room.price.night]
    .map(Number)
    .filter((p) => p > 0);
  return prices.length ? Math.min(...prices) : 0;
};

const Room = () => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ── 篩選 / 排序 state ────────────────────────────────────────────
  const [keyword,     setKeyword]     = useState("");
  const [minCapacity, setMinCapacity] = useState(0);
  const [sortBy,      setSortBy]      = useState("default");

  // 一次性拉全部，前端處理篩選
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      try {
        const res  = await fetch(`${API_URL}/api/rooms?pageSize=100`);
        const json = await res.json();
        if (!json.success) throw new Error();
        setRooms(json.data);
      } catch {
        setError("無法連線至伺服器，請確認後端是否啟動。");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // 篩選條件改變時回到第 1 頁
  useEffect(() => { setCurrentPage(1); }, [keyword, minCapacity, sortBy]);

  // ── 前端篩選 + 排序 ──────────────────────────────────────────────
  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      result = result.filter(
        (r) => r.title.toLowerCase().includes(kw) || r.desc.toLowerCase().includes(kw)
      );
    }

    if (minCapacity > 0) {
      result = result.filter((r) => (r.capacity || 0) >= minCapacity);
    }

    if (sortBy === "price_asc")      result.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    else if (sortBy === "price_desc") result.sort((a, b) => getMinPrice(b) - getMinPrice(a));
    else if (sortBy === "cap_desc")   result.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));

    return result;
  }, [rooms, keyword, minCapacity, sortBy]);

  const totalPages = Math.ceil(filteredRooms.length / PAGE_SIZE) || 1;
  const pagedRooms = filteredRooms.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const isFiltered = keyword.trim() !== "" || minCapacity > 0 || sortBy !== "default";

  const clearFilters = () => {
    setKeyword("");
    setMinCapacity(0);
    setSortBy("default");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── 骨架 ────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{
          background: "var(--surface)", border: "1px solid var(--border-light)",
          borderRadius: "var(--r)", padding: 20, marginBottom: 16,
          display: "flex", gap: 24,
        }}>
          <Skeleton variant="rectangular" width={200} height={148} sx={{ borderRadius: 1, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton width="40%" height={24} />
            <Skeleton width="80%" height={16} sx={{ mt: 1 }} />
            <Skeleton variant="rectangular" height={72} sx={{ mt: 2, borderRadius: 1 }} />
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div style={{ padding: "40px 24px" }}>
      <Alert severity="error">{error}</Alert>
    </div>
  );

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px 64px" }}>

      {/* ── 標題 ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, background: "var(--accent)", borderRadius: 2 }} />
        <span style={{
          fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500,
          letterSpacing: "0.04em", color: "var(--text)",
        }}>
          精選空間
        </span>
      </div>

      {/* ── 篩選工具列 ──────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap",
        padding: isMobile ? "12px" : "14px 16px",
        background: "var(--surface)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--r)",
        marginBottom: 20,
        boxShadow: "var(--shadow-sm)",
      }}>
        {/* 關鍵字搜尋 */}
        <input
          placeholder="搜尋空間名稱或說明…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            ...selectStyle,
            flex: "1 1 180px", minWidth: 140,
            padding: "0 12px",
          }}
        />

        {/* 容量篩選 */}
        <select
          value={minCapacity}
          onChange={(e) => setMinCapacity(Number(e.target.value))}
          style={{ ...selectStyle, flex: "0 0 120px" }}
        >
          <option value={0}>不限容量</option>
          <option value={4}>4 人以上</option>
          <option value={6}>6 人以上</option>
          <option value={10}>10 人以上</option>
        </select>

        {/* 排序 */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ ...selectStyle, flex: "0 0 140px" }}
        >
          <option value="default">預設排列</option>
          <option value="price_asc">價格：低 → 高</option>
          <option value="price_desc">價格：高 → 低</option>
          <option value="cap_desc">容量：大 → 小</option>
        </select>

        {/* 清除篩選 */}
        {isFiltered && (
          <button
            onClick={clearFilters}
            style={{
              height: 34, padding: "0 14px", background: "transparent",
              border: "1px solid var(--border)", borderRadius: 7,
              fontSize: 12, color: "var(--text-muted)", cursor: "pointer",
              fontFamily: "var(--font-sans)", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >
            清除篩選
          </button>
        )}

        {/* 結果筆數 */}
        <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>
          {isFiltered
            ? `篩選後 ${filteredRooms.length} / ${rooms.length} 筆`
            : `共 ${rooms.length} 間場地`}
        </span>
      </div>

      {/* ── 無結果 ────────────────────────────────────────────── */}
      {pagedRooms.length === 0 && (
        <div style={{
          textAlign: "center", padding: "52px 0",
          background: "var(--surface)", border: "1px solid var(--border-light)",
          borderRadius: "var(--r)", color: "var(--text-muted)", fontSize: 13,
        }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.4 }}>🔍</div>
          找不到符合條件的場地
          <div style={{ marginTop: 12 }}>
            <button
              onClick={clearFilters}
              style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
            >
              清除所有篩選
            </button>
          </div>
        </div>
      )}

      {/* ── 卡片列表 ──────────────────────────────────────────── */}
      {pagedRooms.map((room, idx) => {
        const { id, roomImg, title, desc, price, floor, area, capacity, facilities } = room;
        return (
          <div
            key={id}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--r)",
              padding: isMobile ? 14 : 20,
              marginBottom: 16,
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 12 : 24,
              transition: "border-color 0.15s, box-shadow 0.15s",
              animation: "fadeUp 0.4s ease both",
              animationDelay: `${idx * 0.07}s`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            {/* 圖片 */}
            <div style={{
              width: isMobile ? "100%" : 200,
              height: isMobile ? 180 : 148,
              flexShrink: 0, borderRadius: 8,
              backgroundImage: `url(${roomImg})`,
              backgroundSize: "cover", backgroundPosition: "center",
              backgroundColor: "var(--bg)",
            }} />

            {/* 資訊 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>

              {/* 標題列 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                  <span style={{
                    fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500,
                    letterSpacing: "0.02em", color: "var(--text)",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {title}
                  </span>
                </div>
                <button
                  className="room-book-btn"
                  onClick={() => navigate("/roomReserve", { state: { roomId: id } })}
                >
                  前往預約
                </button>
              </div>

              {/* 說明 */}
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, marginLeft: 14 }}>
                {desc}
              </p>

              {/* 規格列 */}
              <div style={{ display: "flex", gap: 16, marginLeft: 14, flexWrap: "wrap" }}>
                {[
                  { label: "坪數", value: `${area} 坪` },
                  { label: "樓層", value: floor },
                  { label: "容量", value: `${capacity} 人` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.02em" }}>{label}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* 設備標籤 */}
              {facilities.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginLeft: 14 }}>
                  {facilities.map((f) => (
                    <span key={f} style={{
                      fontSize: 11, color: "var(--text-muted)",
                      border: "1px solid var(--border)", background: "var(--bg)",
                      borderRadius: 20, padding: "2px 10px", letterSpacing: "0.02em",
                    }}>
                      {f}
                    </span>
                  ))}
                </div>
              )}

              {/* 價格 Grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                border: "1px solid var(--border-light)",
                borderRadius: 8, overflow: "hidden", marginTop: 4,
              }}>
                {SLOTS.map((slot, i) => (
                  <div key={slot.key} style={{
                    padding: "10px 14px",
                    borderLeft: i > 0 ? "1px solid var(--border-light)" : "none",
                    background: slot.key === "afternoon" ? "var(--accent-light)" : "transparent",
                  }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
                      {slot.label}　{slot.range}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--text)" }}>
                      NT$ {price[slot.key] ?? "—"}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        );
      })}

      {/* ── 分頁 ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 24 }}>
          <button className="pg-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pg-btn${page === currentPage ? " active" : ""}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button className="pg-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>›</button>
        </div>
      )}
    </div>
  );
};

export default Room;
