const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "booking.db");
const db = new Database(DB_PATH);

// 開啟 WAL 模式讓讀寫更快
db.pragma("journal_mode = WAL");

// ─── 建立 rooms 資料表 ────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS rooms (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    room_img        TEXT    NOT NULL DEFAULT '',
    title           TEXT    NOT NULL,
    desc            TEXT    NOT NULL DEFAULT '',
    price_morning   INTEGER NOT NULL DEFAULT 0,
    price_afternoon INTEGER NOT NULL DEFAULT 0,
    price_night     INTEGER NOT NULL DEFAULT 0,
    created_at      DATETIME DEFAULT (datetime('now','localtime'))
  )
`);

// ─── 建立 users 資料表（簡易版，只存帳號密碼） ──────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    account    TEXT    UNIQUE NOT NULL,
    password   TEXT    NOT NULL,
    role       TEXT    NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT (datetime('now','localtime'))
  )
`);

// ─── 建立 bookings 資料表 ─────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id     INTEGER NOT NULL,
    user_id     INTEGER,
    user_name   TEXT    NOT NULL DEFAULT '',
    date        TEXT    NOT NULL,
    time_slot   TEXT    NOT NULL CHECK(time_slot IN ('morning','afternoon','night')),
    reason      TEXT    NOT NULL DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'pending'
                        CHECK(status IN ('pending','approved','rejected')),
    created_at  DATETIME DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
  )
`);

// ─── 新增欄位（若舊資料庫不存在這些欄位則自動新增） ──────────────────
const existingColumns = db.prepare("PRAGMA table_info(rooms)").all().map((c) => c.name);
if (!existingColumns.includes("capacity")) {
  db.exec(`ALTER TABLE rooms ADD COLUMN capacity INTEGER DEFAULT 0`);
  db.exec(`ALTER TABLE rooms ADD COLUMN area     INTEGER DEFAULT 0`);
  db.exec(`ALTER TABLE rooms ADD COLUMN floor    TEXT    DEFAULT ''`);
  db.exec(`ALTER TABLE rooms ADD COLUMN facilities TEXT   DEFAULT ''`);

  // 補上既有三筆種子資料的新欄位值
  const updateRoom = db.prepare(
    `UPDATE rooms SET capacity=?, area=?, floor=?, facilities=? WHERE title=?`
  );
  updateRoom.run(10, 80,  "1F", "閃燈組,柔光箱,背景架,造型椅",    "Studio A — 日光大空間");
  updateRoom.run(4,  25,  "2F", "無縫背景紙,反光板,補光燈",        "Studio B — 極簡白牆");
  updateRoom.run(6,  40,  "B1", "磚牆背景,工業燈組,霧機,置物架",   "Studio C — 工業風暗棚");
  console.log("[DB] 新欄位已新增並更新種子資料");
}

// ─── 種子資料（共 10 筆，不足時自動補齊） ────────────────────────────
const allSeedRooms = [
  {
    img: "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80",
    title: "Studio A — 日光大空間",
    desc: "一樓主棚，採光頂天窗，最多可容納 10 人拍攝團隊。",
    morning: 2000, afternoon: 3000, night: 4000,
    capacity: 10, area: 80, floor: "1F",
    facilities: "閃燈組,柔光箱,背景架,造型椅",
  },
  {
    img: "https://images.pexels.com/photos/2445781/pexels-photo-2445781.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Studio B — 極簡白牆",
    desc: "二樓小棚，純白無縫背景紙，適合商品與人像拍攝。",
    morning: 1200, afternoon: 1800, night: 2500,
    capacity: 4, area: 25, floor: "2F",
    facilities: "無縫背景紙,反光板,補光燈",
  },
  {
    img: "https://images.pexels.com/photos/6447392/pexels-photo-6447392.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Studio C — 工業風暗棚",
    desc: "地下一樓，磚牆 + 水泥地板，適合時尚與創意影片。",
    morning: 1500, afternoon: 2200, night: 3000,
    capacity: 6, area: 40, floor: "B1",
    facilities: "磚牆背景,工業燈組,霧機,置物架",
  },
  {
    img: "https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?auto=format&fit=crop&w=800&q=80",
    title: "Studio D — 森林綠意棚",
    desc: "三樓綠植造景棚，大量仿真植栽搭配木質地板，適合品牌形象與生活風格拍攝。",
    morning: 1800, afternoon: 2800, night: 3500,
    capacity: 6, area: 50, floor: "3F",
    facilities: "綠植造景,木質地板,環形燈,拍立得出租",
  },
  {
    img: "https://images.pexels.com/photos/5824519/pexels-photo-5824519.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Studio E — 復古膠卷風",
    desc: "仿舊磁磚牆面與老件家具佈置，營造 90 年代底片相機氛圍。",
    morning: 1600, afternoon: 2400, night: 3200,
    capacity: 5, area: 35, floor: "2F",
    facilities: "老件家具,仿舊磁磚牆,立燈組,黑膠唱機道具",
  },
  {
    img: "https://images.pexels.com/photos/53265/pexels-photo-53265.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Studio F — 全黑暗棚",
    desc: "頂牆地三面烤漆黑，適合商品燈光控制要求高的拍攝，零反光干擾。",
    morning: 2200, afternoon: 3200, night: 4500,
    capacity: 4, area: 30, floor: "B1",
    facilities: "三面黑牆,專業燈架,柔光傘,色紙組",
  },
  {
    img: "https://images.pexels.com/photos/9513910/pexels-photo-9513910.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Studio G — 戶外天台",
    desc: "頂樓露天天台，自然採光 + 城市天際線背景，限白天時段使用。",
    morning: 2500, afternoon: 3500, night: 0,
    capacity: 12, area: 120, floor: "RF",
    facilities: "城市景觀,移動式反光板,遮陽傘,戶外沙發",
  },
  {
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
    title: "Studio H — 北歐簡約棚",
    desc: "淺木色地板搭配米白牆面，適合家居佈置、服裝及美食拍攝。",
    morning: 1400, afternoon: 2000, night: 2800,
    capacity: 6, area: 45, floor: "1F",
    facilities: "淺木地板,米白背景,餐桌道具組,小型烤箱",
  },
  {
    img: "https://images.pexels.com/photos/905419/pexels-photo-905419.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Studio I — 玻璃溫室棚",
    desc: "半透明玻璃屋頂引入柔和自然光，四季皆宜，適合花藝與精品拍攝。",
    morning: 3000, afternoon: 4000, night: 5000,
    capacity: 8, area: 60, floor: "1F",
    facilities: "玻璃天頂,花藝道具組,白色圓桌椅,加濕器",
  },
  {
    img: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?auto=format&fit=crop&w=800&q=80",
    title: "Studio J — 咖啡廳場景棚",
    desc: "完整咖啡吧台 + 皮革座椅佈置，免佈景即可拍出咖啡廳氛圍影片。",
    morning: 2000, afternoon: 3000, night: 4000,
    capacity: 8, area: 55, floor: "2F",
    facilities: "咖啡吧台,義式咖啡機,皮革沙發,吊燈組",
  },
];

const roomCount = db.prepare("SELECT COUNT(*) as count FROM rooms").get();
if (roomCount.count < allSeedRooms.length) {
  const existingTitles = db
    .prepare("SELECT title FROM rooms")
    .all()
    .map((r) => r.title);

  const insert = db.prepare(`
    INSERT INTO rooms (room_img, title, desc, price_morning, price_afternoon, price_night, capacity, area, floor, facilities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let insertCount = 0;
  for (const r of allSeedRooms) {
    if (!existingTitles.includes(r.title)) {
      insert.run(r.img, r.title, r.desc, r.morning, r.afternoon, r.night,
                 r.capacity, r.area, r.floor, r.facilities);
      insertCount++;
    }
  }
  console.log(`[DB] 補充種子資料：新增 ${insertCount} 筆場地`);
}

// ─── 更新錯誤場地圖片（migration，只有圖片網址不同時才更新） ──────────────
const photoFixes = [
  { title: "Studio B — 極簡白牆",   img: "https://images.pexels.com/photos/2445781/pexels-photo-2445781.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "Studio C — 工業風暗棚", img: "https://images.pexels.com/photos/6447392/pexels-photo-6447392.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "Studio E — 復古膠卷風", img: "https://images.pexels.com/photos/5824519/pexels-photo-5824519.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "Studio F — 全黑暗棚",   img: "https://images.pexels.com/photos/53265/pexels-photo-53265.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "Studio G — 戶外天台",   img: "https://images.pexels.com/photos/9513910/pexels-photo-9513910.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { title: "Studio I — 玻璃溫室棚", img: "https://images.pexels.com/photos/905419/pexels-photo-905419.jpeg?auto=compress&cs=tinysrgb&w=800" },
];
const updatePhoto = db.prepare("UPDATE rooms SET room_img = ? WHERE title = ? AND room_img != ?");
let fixedCount = 0;
for (const { title, img } of photoFixes) {
  const result = updatePhoto.run(img, title, img);
  if (result.changes > 0) fixedCount++;
}
if (fixedCount > 0) console.log(`[DB] 已修正 ${fixedCount} 筆場地圖片`);

// ─── 管理員種子帳號（只在 users 為空時建立） ──────────────────────────
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (account, password, role) VALUES (?, ?, ?)")
    .run("admin", "Admin123!", "admin");
  console.log("[DB] 預設管理員建立：帳號 admin / 密碼 Admin123!");
}

module.exports = db;
