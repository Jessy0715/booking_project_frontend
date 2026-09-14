import React, { useState, useRef } from "react";
import { Calendar, Modal, ConfigProvider, Tag, Spin, Button, List } from "antd";
import dayjs from "dayjs";
import "./index.css";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const TIME_SLOT_LABEL = {
  morning:   "上午",
  afternoon: "下午",
  night:     "晚上",
};

const STATUS_TAG = {
  pending:  { color: "orange", text: "審核中" },
  approved: { color: "green",  text: "已核准" },
  rejected: { color: "red",    text: "已拒絕" },
};

// 一般模式：時段色（使用者月曆）
const DOT_COLOR_SLOT = {
  morning:   "var(--accent)",
  afternoon: "var(--blue)",
  night:     "var(--green)",
};

// 管理模式：狀態色（viewOnly 月曆）
const DOT_COLOR_STATUS = {
  approved: "var(--green)",
  pending:  "oklch(0.52 0.12 55)",
  rejected: "oklch(0.62 0.14 15)",
};

const modalStyles = {
  header: {
    borderLeft: `5px solid #938C8C`,
    borderRadius: 0,
    paddingInlineStart: 5,
  },
};

/**
 * RentCalendar
 *
 * Props:
 *   bookings      - 預約陣列（status 已 lowercase）；預設 []
 *   viewOnly      - true = 管理員檢視模式（只讀，無新增）；預設 false
 *   isLoading     - 載入中旗標；預設 false
 *   onDateClick   - 使用者模式：點選未來日期時呼叫，帶入 "YYYY-MM-DD"
 */
const RentCalendar = ({ bookings = [], viewOnly = false, isLoading = false, onDateClick }) => {
  const { isMobile } = useBreakpoint();
  const [dayOverview, setDayOverview] = useState({ open: false, date: "", list: [], isPast: false });
  const [detailModal, setDetailModal] = useState({ open: false, event: null });
  const [calValue, setCalValue]       = useState(dayjs());
  const eventClickedRef               = useRef(false);

  const getBookingsForDate = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    return bookings.filter((b) => b.date === formatted);
  };

  const openDayOverview = (date) => {
    const isPast = date.isBefore(dayjs(), "day");
    setDayOverview({ open: true, date: date.format("YYYY-MM-DD"), list: getBookingsForDate(date), isPast });
  };

  const handleCalendarSelect = (date) => {
    if (eventClickedRef.current) { eventClickedRef.current = false; return; }
    if (viewOnly) {
      openDayOverview(date);
    } else {
      if (!date.isBefore(dayjs(), "day")) {
        onDateClick && onDateClick(date.format("YYYY-MM-DD"));
      }
    }
  };

  // ── 行動版 Header ──────────────────────────────────────────
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

  // ── 日格 render ────────────────────────────────────────────
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
        style={isPast && !viewOnly ? { opacity: 0.6 } : {}}
      >
        <div className="ant-picker-calendar-date-value">
          {current.date()}
        </div>
        <div className="ant-picker-calendar-date-content">
          {isMobile ? (
            dayBookings.length > 0 && (
              <div className="cal-dots">
                {dayBookings.slice(0, 3).map((b) => (
                  <span
                    key={b.id}
                    className="cal-dot"
                    style={{
                      background: viewOnly
                        ? (DOT_COLOR_STATUS[b.status] || "var(--text-muted)")
                        : (DOT_COLOR_SLOT[b.timeSlot] || "var(--text-muted)"),
                    }}
                    onMouseDown={(e) => { e.stopPropagation(); eventClickedRef.current = true; }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (viewOnly) {
                        openDayOverview(current);
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
            dayBookings.length > 0 && (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {visible.map((b) => (
                  <li key={b.id} style={{ margin: 0, padding: 0 }}>
                    <span
                      onMouseDown={(e) => { e.stopPropagation(); eventClickedRef.current = true; }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (viewOnly) {
                          openDayOverview(current);
                        } else {
                          setDetailModal({ open: true, event: b });
                        }
                      }}
                      className={`cal-chip ${viewOnly ? `cal-chip-status-${b.status}` : `cal-chip-${b.timeSlot}`}`}
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

  return (
    <div style={{ width: "100%" }}>
      <Spin spinning={isLoading}>
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
          title={`${dayOverview.date} 的預約狀況`}
          open={dayOverview.open}
          onCancel={() => setDayOverview({ open: false, date: "", list: [], isPast: false })}
          width={isMobile ? "92vw" : 520}
          footer={
            viewOnly ? null : (
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
                        <Tag color={STATUS_TAG[b.status]?.color || "default"}>{TIME_SLOT_LABEL[b.timeSlot]}</Tag>
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

      {/* 單筆預約詳情（唯讀） */}
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
            <div style={{ paddingLeft: "10px", lineHeight: "2.2", fontFamily: "var(--font-sans)", fontSize: 13 }}>
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
