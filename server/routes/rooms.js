const express = require("express");
const router = express.Router();
const db = require("../db");

// 將 DB row 轉成前端期望的格式
function toRoomDto(row) {
  return {
    id: row.id,
    roomImg: row.room_img,
    title: row.title,
    desc: row.desc,
    floor: row.floor || "",
    area: row.area || 0,
    capacity: row.capacity || 0,
    facilities: row.facilities ? row.facilities.split(",").map((f) => f.trim()) : [],
    price: {
      morning: String(row.price_morning),
      afternoon: String(row.price_afternoon),
      night: String(row.price_night),
    },
    createdAt: row.created_at,
  };
}

// ─── GET /api/rooms ───────────────────────────────────────────────
// 支援 ?keyword=xxx 模糊搜尋、?page=1&pageSize=5 分頁
router.get("/", (req, res) => {
  const { keyword, page = 1, pageSize = 5 } = req.query;
  const limit  = Number(pageSize);
  const offset = (Number(page) - 1) * limit;

  const whereClause = keyword ? "WHERE title LIKE ?" : "";
  const params      = keyword ? [`%${keyword}%`]     : [];

  const { total } = db
    .prepare(`SELECT COUNT(*) as total FROM rooms ${whereClause}`)
    .get(...params);

  const rows = db
    .prepare(`SELECT * FROM rooms ${whereClause} ORDER BY id LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);

  res.json({
    success: true,
    data: rows.map(toRoomDto),
    pagination: {
      page:       Number(page),
      pageSize:   limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ─── GET /api/rooms/:id/slots?date=YYYY-MM-DD ────────────────────
// 回傳指定場地在指定日期三個時段的可用狀態
// available / pending / approved
router.get("/:id/slots", (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, message: "date 為必填" });
  }

  const result = {};
  for (const slot of ["morning", "afternoon", "night"]) {
    const row = db
      .prepare(
        `SELECT status FROM bookings
         WHERE room_id = ? AND date = ? AND time_slot = ? AND status IN ('pending','approved')`
      )
      .get(req.params.id, date, slot);
    result[slot] = row ? row.status : "available";
  }

  res.json({ success: true, data: result });
});

// ─── GET /api/rooms/:id ───────────────────────────────────────────
router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM rooms WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ success: false, message: "場地不存在" });
  res.json({ success: true, data: toRoomDto(row) });
});

// ─── POST /api/rooms ──────────────────────────────────────────────
// Body: { roomImg, title, desc, price: { morning, afternoon, night } }
router.post("/", (req, res) => {
  const { roomImg = "", title, desc = "", price = {} } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: "title 為必填" });
  }

  const result = db
    .prepare(
      `INSERT INTO rooms (room_img, title, desc, price_morning, price_afternoon, price_night)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      roomImg,
      title,
      desc,
      Number(price.morning) || 0,
      Number(price.afternoon) || 0,
      Number(price.night) || 0
    );

  const newRoom = db
    .prepare("SELECT * FROM rooms WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: toRoomDto(newRoom) });
});

// ─── PUT /api/rooms/:id ───────────────────────────────────────────
// Body: 同 POST，部分欄位可省略（只更新有帶的欄位）
router.put("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM rooms WHERE id = ?")
    .get(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: "場地不存在" });
  }

  const { roomImg, title, desc, price = {} } = req.body;

  db.prepare(
    `UPDATE rooms SET
      room_img        = ?,
      title           = ?,
      desc            = ?,
      price_morning   = ?,
      price_afternoon = ?,
      price_night     = ?
     WHERE id = ?`
  ).run(
    roomImg    !== undefined ? roomImg    : existing.room_img,
    title      !== undefined ? title      : existing.title,
    desc       !== undefined ? desc       : existing.desc,
    price.morning   !== undefined ? Number(price.morning)   : existing.price_morning,
    price.afternoon !== undefined ? Number(price.afternoon) : existing.price_afternoon,
    price.night     !== undefined ? Number(price.night)     : existing.price_night,
    req.params.id
  );

  const updated = db
    .prepare("SELECT * FROM rooms WHERE id = ?")
    .get(req.params.id);
  res.json({ success: true, data: toRoomDto(updated) });
});

// ─── DELETE /api/rooms/:id ────────────────────────────────────────
router.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM rooms WHERE id = ?")
    .run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ success: false, message: "場地不存在" });
  }
  res.json({ success: true, message: "場地已刪除" });
});

module.exports = router;
