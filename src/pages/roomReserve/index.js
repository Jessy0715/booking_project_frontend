import { useState, useEffect } from "react";
import Header from "@/components/Header";
import RentCalendar from "@/components/rentCalendar";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Modal, ConfigProvider, Input, Select, DatePicker, Form,
} from "antd";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const TIME_SLOT_OPTIONS = [
  { value: "morning",   label: "上午 09:00 - 12:00" },
  { value: "afternoon", label: "下午 13:00 - 17:00" },
  { value: "night",     label: "晚上 18:00 - 22:00" },
];

const SLOT_STATUS_CONFIG = {
  available: { label: "可預約", color: "var(--green)",           bg: "var(--green-bg)",          border: "var(--green)" },
  pending:   { label: "申請中", color: "oklch(0.52 0.12 55)",    bg: "oklch(0.96 0.04 75)",      border: "oklch(0.80 0.08 55)" },
  approved:  { label: "已核准", color: "oklch(0.42 0.14 15)",    bg: "oklch(0.97 0.03 15)",      border: "oklch(0.76 0.1 15)" },
};

const SLOT_NAMES = { morning: "上午", afternoon: "下午", night: "晚上" };

const modalStyles = {
  header: { borderLeft: "5px solid var(--accent)", borderRadius: 0, paddingInlineStart: 5 },
};

const RoomReserve = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const { isMobile } = useBreakpoint();
  const isAdmin = JSON.parse(localStorage.getItem("user") || "{}").role === "admin";

  const [isModalOpen, setIsModalOpen]       = useState(false);
  const [rooms, setRooms]                   = useState([]);
  const [submitting, setSubmitting]         = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notif, setNotif]                   = useState({ open: false, message: "", type: "success" });
  const [allBookings, setAllBookings]       = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedDate, setSelectedDate]     = useState(null);

  const showNotif = (message, type = "success") => {
    setNotif({ open: true, message, type });
    setTimeout(() => setNotif(n => ({ ...n, open: false })), 4500);
  };

  // ── 取得所有預約（衝突判斷） ─────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/bookings`)
      .then(r => r.json())
      .then(j => { if (j.success) setAllBookings(j.data); })
      .catch(() => {});
  }, [refreshTrigger]);

  // ── 取得場地清單 ──────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/rooms?pageSize=100`)
      .then(r => r.json())
      .then(j => {
        if (j.success) {
          setRooms(j.data.map(r => ({ value: r.id, label: r.title })));
          const roomId = location.state?.roomId;
          if (roomId) {
            form.setFieldsValue({ roomId });
            setSelectedRoomId(roomId);
            setIsModalOpen(true);
          }
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Client-side 時段衝突判斷 ─────────────────────────────────
  const computeSlotStatus = () => {
    if (!selectedRoomId || !selectedDate) return {};
    const result = {};
    for (const slot of ["morning", "afternoon", "night"]) {
      const hit = allBookings.find(
        b => b.roomId === selectedRoomId && b.date === selectedDate && b.timeSlot === slot
          && (b.status === "pending" || b.status === "approved")
      );
      result[slot] = hit ? hit.status : "available";
    }
    return result;
  };
  const slotStatus = computeSlotStatus();

  const handleRoomChange  = (v) => { setSelectedRoomId(v || null); form.setFieldValue("timeSlot", undefined); };
  const handleDateChange  = (v) => { setSelectedDate(v ? v.format("YYYY-MM-DD") : null); form.setFieldValue("timeSlot", undefined); };

  const handleDateClick = (dateStr) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    form.setFieldsValue({ date: dayjs(dateStr), userName: user.account || "" });
    setSelectedDate(dateStr);
    const cur = form.getFieldValue("roomId");
    if (cur) setSelectedRoomId(cur);
    form.setFieldValue("timeSlot", undefined);
    setIsModalOpen(true);
  };

  const openModal = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    form.resetFields();
    form.setFieldsValue({ userName: user.account || "" });
    setSelectedRoomId(null);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        roomId:   values.roomId,
        userId:   user.id || null,
        userName: values.userName,
        date:     values.date.format("YYYY-MM-DD"),
        timeSlot: values.timeSlot,
        reason:   values.reason || "",
      };
      const res  = await fetch(`${API_URL}/api/bookings`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        form.resetFields();
        setRefreshTrigger(n => n + 1);
        showNotif("預約送出成功！等待審核中。", "success");
      } else {
        showNotif(json.message || "預約失敗", "error");
      }
    } catch { /* form validation */ } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: 80 }}>
        <div style={{ maxWidth: "880px", margin: "0 auto", padding: isMobile ? "16px 12px 0" : "24px 24px 0" }}>

          {/* 返回 */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: "var(--text-muted)" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <span
              style={{ fontSize: 13, color: "var(--text-muted)", cursor: "pointer", marginLeft: 4 }}
              onClick={() => navigate(-1)}
            >
              返回
            </span>
          </div>

          {/* 標題列 */}
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            justifyContent: "space-between",
            gap: isMobile ? 12 : 0,
            marginBottom: 20,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 18, background: "var(--accent)", borderRadius: 2 }} />
              <span style={{
                fontFamily: "var(--font-serif)", fontSize: isMobile ? 15 : 17, fontWeight: 500,
                letterSpacing: "0.04em", color: "var(--text)",
              }}>
                租借場地時段表
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, alignSelf: isMobile ? "stretch" : "auto" }}>
              {/* 圖例（僅後台，手機隱藏） */}
              {isAdmin && !isMobile && (
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent)", display: "inline-block" }} />
                    上午
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--blue)", display: "inline-block" }} />
                    下午
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--green)", display: "inline-block" }} />
                    晚上
                  </span>
                </div>
              )}
              <button
                className="room-book-btn"
                onClick={openModal}
                style={{ padding: "8px 20px", flex: isMobile ? 1 : "none" }}
              >
                立即預約
              </button>
            </div>
          </div>

          {/* 月曆 */}
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
            borderRadius: "var(--r)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}>
            <RentCalendar
              onDateClick={handleDateClick}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>

      {/* ── 預約填寫 Modal ──────────────────────────────────────── */}
      <ConfigProvider modal={{ styles: modalStyles }}>
        <Modal
          title="預約填寫單"
          open={isModalOpen}
          onOk={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          okText="確認送出"
          cancelText="取消"
          confirmLoading={submitting}
          okButtonProps={{ style: { backgroundColor: "var(--accent)", borderColor: "var(--accent)" } }}
          width={480}
        >
          <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
            <Form.Item label="預約場地" name="roomId" rules={[{ required: true, message: "請選擇場地" }]}>
              <Select
                placeholder="請選擇租借場地"
                allowClear
                options={rooms}
                onChange={handleRoomChange}
              />
            </Form.Item>

            <Form.Item label="預約日期" name="date" rules={[{ required: true, message: "請選擇日期" }]}>
              <DatePicker
                style={{ width: "100%" }}
                placeholder="請選擇日期"
                disabledDate={d => d.isBefore(dayjs(), "day")}
                format="YYYY-MM-DD"
                onChange={handleDateChange}
              />
            </Form.Item>

            {/* ── 時段可用狀態面板 ───────────────────────────────── */}
            {selectedRoomId && selectedDate && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, fontWeight: 500 }}>
                  時段可用狀態
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["morning", "afternoon", "night"].map((slot) => {
                    const status = slotStatus[slot] || "available";
                    const cfg    = SLOT_STATUS_CONFIG[status];
                    const avail  = status === "available";
                    return (
                      <div
                        key={slot}
                        onClick={() => {
                          if (avail) form.setFieldValue("timeSlot", slot);
                        }}
                        style={{
                          flex: 1, padding: "10px 8px", borderRadius: 8, textAlign: "center",
                          background: cfg.bg, border: `1px solid ${cfg.border}`,
                          cursor: avail ? "pointer" : "not-allowed",
                          transition: "opacity 0.15s, box-shadow 0.15s",
                          opacity: avail ? 1 : 0.7,
                        }}
                        onMouseEnter={(e) => { if (avail) e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 500, color: cfg.color, marginBottom: 3 }}>
                          {SLOT_NAMES[slot]}
                        </div>
                        <div style={{ fontSize: 10, color: cfg.color }}>
                          {cfg.label}
                        </div>
                        {avail && (
                          <div style={{ fontSize: 9, color: cfg.color, opacity: 0.7, marginTop: 2 }}>
                            點擊選取
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Form.Item label="租借時段" name="timeSlot" rules={[{ required: true, message: "請選擇時段" }]}>
              <Select
                placeholder={!selectedRoomId || !selectedDate ? "請先選擇場地與日期" : "請選擇時段"}
                options={TIME_SLOT_OPTIONS.map(opt => {
                  const status = slotStatus[opt.value];
                  const taken  = status === "pending" || status === "approved";
                  const suffix = status === "approved" ? "（已核准）"
                               : status === "pending"  ? "（申請中）" : "";
                  return {
                    value: opt.value,
                    label: suffix ? `${opt.label}  ${suffix}` : opt.label,
                    disabled: taken,
                  };
                })}
              />
            </Form.Item>

            <Form.Item label="預約人姓名" name="userName" rules={[{ required: true, message: "請輸入姓名" }]}>
              <Input placeholder="請輸入預約人姓名" allowClear />
            </Form.Item>

            <Form.Item label="租借事由" name="reason">
              <Input placeholder="請輸入租借事由（選填）" allowClear />
            </Form.Item>
          </Form>
        </Modal>
      </ConfigProvider>

      {/* ── 通知橫條 ────────────────────────────────────────────── */}
      {notif.open && (
        <div style={{
          position: "fixed",
          bottom: 28,
          left: "50%",
          transform: "translateX(-50%)",
          animation: "fadeUp 0.3s ease",
          background: notif.type === "success" ? "var(--green-bg)" : "oklch(0.96 0.03 15)",
          border: `1px solid ${notif.type === "success" ? "var(--green)" : "oklch(0.65 0.15 15)"}`,
          borderRadius: 10,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          zIndex: 1200,
          boxShadow: "var(--shadow-md)",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          color: "var(--text)",
          minWidth: 300,
          maxWidth: "90vw",
        }}>
          <span style={{ color: notif.type === "success" ? "var(--green)" : "oklch(0.5 0.15 15)", fontWeight: 600, fontSize: 16 }}>
            {notif.type === "success" ? "✓" : "✕"}
          </span>
          <span style={{ flex: 1 }}>{notif.message}</span>
          <button
            onClick={() => setNotif(n => ({ ...n, open: false }))}
            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 18, padding: 0, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default RoomReserve;
