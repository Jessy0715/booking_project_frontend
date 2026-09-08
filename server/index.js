const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/auth", require("./routes/auth"));

// ─── 健康檢查 ─────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ─── 404 fallback ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "找不到此路由" });
});

// ─── 全域錯誤處理 ──────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ success: false, message: "伺服器內部錯誤" });
});

app.listen(PORT, () => {
  console.log(`[Server] 啟動成功，監聽 http://localhost:${PORT}`);
});
