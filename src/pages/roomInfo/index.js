import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Room from "./components/Room";

const RoomInfo = () => (
  <>
    <Header />

    {/* ── Hero ──────────────────────────────────────────────────── */}
    <section style={{
      height: 260,
      background: "linear-gradient(135deg, oklch(0.25 0.04 55), oklch(0.15 0.02 75))",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
    }}>
      {/* SVG 裝飾 */}
      <svg
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <circle cx="72%" cy="55%" r="130" fill="oklch(0.7 0.12 42 / 0.1)" />
        <circle cx="84%" cy="18%" r="72"  fill="oklch(0.55 0.1 145 / 0.09)" />
        <circle cx="60%" cy="85%" r="52"  fill="oklch(0.7 0.12 42 / 0.07)" />
        {Array.from({ length: 18 }).map((_, i) => (
          <line
            key={i}
            x1={`${(i + 1) * 5.5}%`} y1="0"
            x2={`${(i + 1) * 5.5}%`} y2="100%"
            stroke="white" strokeOpacity="0.03"
          />
        ))}
      </svg>

      {/* 左側遮罩 */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, oklch(0 0 0 / 0.45), transparent 60%)",
      }} />

      {/* 文字 */}
      <div style={{
        position: "relative",
        padding: "0 60px",
        color: "white",
        animation: "fadeIn 0.3s ease",
      }}>
        <div style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          marginBottom: 14,
          fontWeight: 300,
        }}>
          Photography Studio · Booking
        </div>
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: 32,
          fontWeight: 400,
          letterSpacing: "0.06em",
          marginBottom: 12,
          lineHeight: 1.3,
        }}>
          Lumino 自然光攝影棚
        </h1>
        <p style={{
          fontSize: 14,
          fontWeight: 300,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.72)",
          maxWidth: 400,
        }}>
          尋找完美的拍攝空間，捕捉每個動人瞬間。
        </p>
      </div>
    </section>

    {/* ── 場地列表 ──────────────────────────────────────────────── */}
    <main style={{ background: "var(--bg)", minHeight: "60vh" }}>
      <Room />
    </main>

    <Outlet />
  </>
);

export default RoomInfo;
