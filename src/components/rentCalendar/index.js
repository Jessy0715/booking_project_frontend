import React, { useState, useEffect, useCallback, useRef } from "react";
import { Calendar, Modal, ConfigProvider, Tag, Spin, Button, List } from "antd";
import dayjs from "dayjs";
import "./index.css";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const TIME_SLOT_LABEL = {
  morning:   "上午",
  afternoon: "下午",
  night:     "晚上",
};

const STATUS_BADGE = {
  pending:  "warning",
  approved: "success",
  rejected: "error",
};

const STATUS_TAG = {
  pending:  { color: "orange", text: "審核中" },
  approved: { color: "green",  text: "已核准" },
  rejected: { color: "red",    text: "已拒絕" },
};

// 時段對應圓點顏色
const DOT_COLOR = {
  morning:   "var(--accent)",
  afternoon: "var(--blue)",
  night:     "var(--green)",
};

const modalStyles = {
  header: {
    borderLeft: `5px solid #938C8C`,
    borderRadius: 0,
    paddingInlineStart: 5,
  },
};

const RentCalendar = ({ onDateClick, refreshTrigger }) => {
  const { isMobile } = useBreakpoint();
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [dayOverview, setDayOverview] = useState({ open: false, date: "", list: [], isPast: false });
  const [detailModal, setDetailModal] = useState({ open: false, event: null });
  const [calValue, setCalValue]       = useState(dayjs()); // 控制月份導覽
  const eventClickedRef               = useRef(false);

  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const url  = isAdmin
        ? `${API_URL}/api/bookings`
        : `${API_URL}/api/bookings?status=approved`;
      const res  = await fetch(url);
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch (err) {
      console.error("無法取得預約資料", err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, refreshTrigger]);

  const getBookingsForDate = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    return bookings.filter((b) => b.date === formatted);
  };

  const handleCalendarSelect = (date) => {
    if (eventClickedRef.current) { eventClickedRef.current = false; return; }

    const isPast      = date.isBefore(dayjs(), "day");
    const dayBookings = getBookingsForDate(date);

    if (isAdmin) {
      setDayOverview({ open: true, date: date.format("YYYY-MM-DD"), list: dayBookings, isPast });
    } else {
      if (!isPast) {
        onDateClick && onDateClick(date.format("YYYY-MM-DD"));
      }
    }
  };

  // ── 行動版自訂 Header（簡潔月份導覽）─────────────────────────
  const mobileHeaderRender = ({ value, onChange }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 12px", borderBottom: "1px solid var(--border-light)",
    }}>
      <button
        onClick={() => { const v = value.subtract(1, "month"); onChange(v); setCalValue(v); }}
        style={{ width: 32, height: 32, border: "1px solid var(--border)", borderRadius: 7, background: "transparent", cursor: "pointer", fontSize: 16, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >‹</button>

      <span style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontWeight: 500, letterSpacing: "0.06em", color: "var(--text)" }}>
        {value.year()} 年 {value.month() + 1} 月
      </span>

      <button
        onClick={() => { const v = value.add(1, "month"); onChange(v); setCalValue(v); }}
        style={{ width: 32, height: 32, border: "1px solid var(--border)", borderRadius: 7, background: "transparent", cursor: "pointer", fontSize: 16, color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >›</button>
    </div>
  );

  // ── Full cell render ─────────────────────────────────────────
  const fullCellRender = (current, info) => {
    if (info.type !== "date") return info.originNode;

    const isPast      = current.isBefore(dayjs(), "day");
    const isToday     = current.isSame(dayjs(), "day");
    const dayBookings = getBookingsForDate(current);
    const visible     = dayBookings.slice(0, 2);
    const extraCount  = dayBookings.length - 2;

    return (
      <div
        className={[
          "ant-picker-cell-inner",
          "ant-picker-calendar-date",
          isToday ? "ant-picker-calendar-date-today" : "",
        ].join(" ")}
        style={isPast ? { opacity: 0.6 } : {}}
      >
        <div className="ant-picker-calendar-date-value">
          {current.date()}
        </div>
        <div className="ant-picker-calendar-date-content">
          {isMobile ? (
            /* ── Mobile：色點 ───────────────────────────── */
            dayBookings.length > 0 && (
              <div className="cal-dots">
                {dayBookings.slice(0, 3).map((b) => (
                  <span
                    key={b.id}
                    className="cal-dot"
                    style={{ background: DOT_COLOR[b.timeSlot] }}
                    onMouseDown={(e) => { e.stopPropagation(); eventClickedRef.current = true; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isAdmin) {
                        setDayOverview({ open: true, date: current.format("YYYY-MM-DD"), list: getBookingsForDate(current), isPast: current.isBefore(dayjs(), "day") });
                      } else {
                        setDetailModal({ open: true, event: b });
                      }
                    }}
                  />
                ))}
                {dayBookings.length > 3 && (
                  <span className="cal-dot-more">+{dayBookings.length - 3}</span>
                )}
              </div>
            )
          ) : (
            /* ── Desktop：文字 Chip ──────────────────────── */
            dayBookings.length > 0 && (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {visible.map((b) => (
                  <li key={b.id} style={{ margin: 0, padding: 0 }}>
                    <span
                      onMouseDown={(e) => { e.stopPropagation(); eventClickedRef.current = true; }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAdmin) {
                          setDayOverview({ open: true, date: current.format("YYYY-MM-DD"), list: getBookingsForDate(current), isPast: current.isBefore(dayjs(), "day") });
                        } else {
                          setDetailModal({ open: true, event: b });
                        }
                      }}
                      className={`cal-chip cal-chip-${b.timeSlot}`}
                    >
                      {TIME_SLOT_LABEL[b.timeSlot]} {b.roomTitle || ""}
                    </span>
                  </li>
                ))}
                {extraCount > 0 && (
                  <li style={{ margin: 0, padding: 0 }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted)", paddingLeft: 4, display: "block", lineHeight: 1.8 }}>
                      +{extraCount} 筆
                    </span>
                  </li>
                )}
              </ul>
            )
          )}
        </div>
      </div>
    );
  };

  const readOnlyBadge = (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, marginLeft: 10, background: "oklch(0.94 0.01 75)", color: "var(--text-muted)", border: "1px solid var(--border)", fontWeight: 400, verticalAlign: "middle" }}>
      唯讀
    </span>
  );

  return (
    <div style={{ width: "100%" }}>
      <Spin spinning={loading}>
        <Calendar
          value={calValue}
          onChange={setCalValue}
          style={{ padding: isMobile ? "0" : "20px" }}
          fullCellRender={fullCellRender}
          onSelect={handleCalendarSelect}
          headerRender={isMobile ? mobileHeaderRender : undefined}
        />
      </Spin>

      {/* 當日預約總覽 */}
      <ConfigProvider modal={{ styles: modalStyles }}>
        <Modal
          title={
            dayOverview.isPast
              ? <span>{dayOverview.date} 的預約紀錄{readOnlyBadge}</span>
              : `${dayOverview.date} 的預約狀況`
          }
          open={dayOverview.open}
          onCancel={() => setDayOverview({ open: false, date: "", list: [], isPast: false })}
          width={isMobile ? "92vw" : 520}
          footer={
            dayOverview.isPast ? null : (
              <Button
                type="primary"
                style={{ backgroundColor: "#938C8C", borderColor: "#938C8C" }}
                onClick={() => {
                  setDayOverview({ open: false, date: "", list: [], isPast: false });
                  onDateClick && onDateClick(dayOverview.date);
                }}
              >
                新增此日預約
              </Button>
            )
          }
        >
          {dayOverview.list.length === 0 ? (
            <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)", fontSize: 13, fontFamily: "var(--font-sans)" }}>
              此日無預約紀錄
            </div>
          ) : (
            <List
              dataSource={dayOverview.list}
              renderItem={(b) => (
                <List.Item
                  style={{ cursor: "pointer", padding: "8px 4px" }}
                  onClick={() => {
                    setDayOverview({ open: false, date: "", list: [], isPast: false });
                    setDetailModal({ open: true, event: b });
                  }}
                >
                  <List.Item.Meta
                    title={
                      <span>
                        <Tag color={STATUS_BADGE[b.status]}>{TIME_SLOT_LABEL[b.timeSlot]}</Tag>
                        {b.roomTitle || "—"}
                      </span>
                    }
                    description={`預約人：${b.userName || "—"}　事由：${b.reason || "—"}`}
                  />
                  <Tag color={STATUS_TAG[b.status]?.color}>{STATUS_TAG[b.status]?.text}</Tag>
                </List.Item>
              )}
            />
          )}
        </Modal>
      </ConfigProvider>

      {/* 單筆預約詳情 */}
      <ConfigProvider modal={{ styles: modalStyles }}>
        <Modal
          title="預約詳情"
          open={detailModal.open}
          onCancel={() => setDetailModal({ open: false, event: null })}
          width={isMobile ? "92vw" : 480}
          footer={null}
          destroyOnClose
        >
          {detailModal.event && (
            <div style={{ paddingLeft: "10px", lineHeight: "2.2" }}>
              <p>
                <strong>狀態：</strong>
                <Tag color={STATUS_TAG[detailModal.event.status]?.color}>
                  {STATUS_TAG[detailModal.event.status]?.text}
                </Tag>
              </p>
              <p><strong>場地：</strong>{detailModal.event.roomTitle || "—"}</p>
              <p><strong>日期：</strong>{detailModal.event.date}</p>
              <p><strong>時段：</strong>{TIME_SLOT_LABEL[detailModal.event.timeSlot]}</p>
              <p><strong>預約人：</strong>{detailModal.event.userName || "—"}</p>
              <p><strong>事由：</strong>{detailModal.event.reason || "—"}</p>
            </div>
          )}
        </Modal>
      </ConfigProvider>
    </div>
  );
};

export default RentCalendar;
