const express = require("express");
const router = express.Router();
const db = require("../db");

function toBookingDto(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    roomTitle: row.room_title || null,
    userId: row.user_id,
    userName: row.user_name,
    date: row.date,
    timeSlot: row.time_slot,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  };
}

// 帶入場地名稱的查詢（LEFT JOIN rooms）
const SELECT_WITH_ROOM = `
  SELECT b.*, r.title AS room_title
  FROM bookings b
  LEFT JOIN rooms r ON r.id = b.room_id
`;

// ─── GET /api/bookings ─────────────────────────────────────────────
// 查詢參數:
//   ?userId=xxx    → 查某使用者的預約（前台「我的預約」）
//   ?status=xxx    → 篩選狀態 pending / approved / rejected
//   ?roomId=xxx    → 篩選場地
router.get("/", (req, res) => {
  const { userId, status, roomId } = req.query;

  const conditions = [];
  const params = [];

  if (userId) {
    conditions.push("b.user_id = ?");
    params.push(userId);
  }
  if (status) {
    conditions.push("b.status = ?");
    params.push(status);
  }
  if (roomId) {
    conditions.push("b.room_id = ?");
    params.push(roomId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `${SELECT_WITH_ROOM} ${where} ORDER BY b.created_at DESC`;

  const rows = db.prepare(sql).all(...params);
  res.json({ success: true, data: rows.map(toBookingDto) });
});

// ─── GET /api/bookings/:id ─────────────────────────────────────────
router.get("/:id", (req, res) => {
  const row = db
    .prepare(`${SELECT_WITH_ROOM} WHERE b.id = ?`)
    .get(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: "預約不存在" });
  res.json({ success: true, data: toBookingDto(row) });
});

// ─── POST /api/bookings ────────────────────────────────────────────
// Body: { roomId, userId?, userName, date, timeSlot, reason? }
router.post("/", (req, res) => {
  const { roomId, userId = null, userName = "", date, timeSlot, reason = "" } =
    req.body;

  if (!roomId || !date || !timeSlot) {
    return res.status(400).json({
      success: false,
      message: "roomId、date、timeSlot 為必填",
    });
  }

  const validSlots = ["morning", "afternoon", "night"];
  if (!validSlots.includes(timeSlot)) {
    return res.status(400).json({
      success: false,
      message: "timeSlot 必須是 morning / afternoon / night",
    });
  }

  // 檢查該場地該時段是否已被佔用（pending 或 approved 都算）
  const conflict = db
    .prepare(
      `SELECT id, status FROM bookings
       WHERE room_id = ? AND date = ? AND time_slot = ? AND status IN ('pending', 'approved')`
    )
    .get(roomId, date, timeSlot);

  if (conflict) {
    const msg = conflict.status === "approved"
      ? "該時段已核准，無法重複預約"
      : "該時段已有人申請中，請選擇其他時間";
    return res.status(409).json({ success: false, message: msg });
  }

  const result = db
    .prepare(
      `INSERT INTO bookings (room_id, user_id, user_name, date, time_slot, reason)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(roomId, userId, userName, date, timeSlot, reason);

  const newBooking = db
    .prepare(`${SELECT_WITH_ROOM} WHERE b.id = ?`)
    .get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: toBookingDto(newBooking) });
});

// ─── PATCH /api/bookings/:id ───────────────────────────────────────
// 後台審核：Body: { status: 'approved' | 'rejected' }
router.patch("/:id", (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "status 只能是 approved 或 rejected",
    });
  }

  const existing = db
    .prepare("SELECT id FROM bookings WHERE id = ?")
    .get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "預約不存在" });
  }

  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(
    status,
    req.params.id
  );

  const updated = db
    .prepare(`${SELECT_WITH_ROOM} WHERE b.id = ?`)
    .get(req.params.id);
  res.json({ success: true, data: toBookingDto(updated) });
});

// ─── DELETE /api/bookings/:id ──────────────────────────────────────
// 使用者取消自己的預約（只能取消 pending 狀態）
router.delete("/:id", (req, res) => {
  const booking = db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .get(req.params.id);

  if (!booking) {
    return res.status(404).json({ success: false, message: "預約不存在" });
  }
  if (booking.status !== "pending") {
    return res.status(400).json({
      success: false,
      message: "只能取消審核中 (pending) 的預約",
    });
  }

  db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);
  res.json({ success: true, message: "預約已取消" });
});

module.exports = router;
