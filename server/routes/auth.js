const express = require("express");
const router  = express.Router();
const db      = require("../db");

// ─── POST /api/auth/register ──────────────────────────────────────
router.post("/register", (req, res) => {
  const { account, password } = req.body;
  if (!account || !password) {
    return res.status(400).json({ success: false, message: "帳號與密碼為必填" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE account = ?").get(account);
  if (existing) {
    return res.status(409).json({ success: false, message: "此帳號已被使用" });
  }

  const result = db
    .prepare("INSERT INTO users (account, password, role) VALUES (?, ?, ?)")
    .run(account, password, "user");

  const user = db
    .prepare("SELECT id, account, role FROM users WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: user });
});

// ─── POST /api/auth/login ─────────────────────────────────────────
router.post("/login", (req, res) => {
  const { account, password } = req.body;
  if (!account || !password) {
    return res.status(400).json({ success: false, message: "帳號與密碼為必填" });
  }

  const user = db
    .prepare("SELECT id, account, password, role FROM users WHERE account = ?")
    .get(account);

  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "帳號或密碼錯誤" });
  }

  res.json({
    success: true,
    data: { id: user.id, account: user.account, role: user.role },
  });
});

module.exports = router;
