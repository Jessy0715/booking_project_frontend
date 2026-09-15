import Header from "@/components/Header";
import RentCalendar from "@/components/rentCalendar";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useSearchBookingsQuery } from "@/services/bookingApi.generated";

const TIME_SLOT_LABEL = { morning: "上午", afternoon: "下午", night: "晚上" };

const AdminCalendar = () => {
  const { isMobile } = useBreakpoint();

  const { data, isLoading, isError: bookingsError } = useSearchBookingsQuery({ pageSize: 200 });
  const bookings = (data?.data ?? []).map((b) => ({
    ...b,
    status: b.status?.toLowerCase(),
  }));

  return (
    <>
      <Header />

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section style={{
        height: 200,
        background: "linear-gradient(135deg, oklch(0.25 0.04 55), oklch(0.15 0.02 75))",
        position: "relative", overflow: "hidden", display: "flex", alignItems: "center",
      }}>
        <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <circle cx="76%" cy="55%" r="110" fill="oklch(0.7 0.12 42 / 0.09)" />
          <circle cx="88%" cy="18%" r="60"  fill="oklch(0.55 0.1 145 / 0.07)" />
          {Array.from({ length: 18 }).map((_, i) => (
            <line key={i} x1={`${(i + 1) * 5.5}%`} y1="0" x2={`${(i + 1) * 5.5}%`} y2="100%"
              stroke="white" strokeOpacity="0.025" />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, oklch(0 0 0 / 0.45), transparent 60%)" }} />
        <div style={{ position: "relative", padding: "0 60px", color: "white", animation: "fadeIn 0.3s ease" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 10, fontWeight: 300 }}>
            Booking Overview
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 400, letterSpacing: "0.06em", lineHeight: 1.3 }}>
            預約月曆總覽
          </h1>
        </div>
      </section>

      {/* ── Legend ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "16px 16px 0" : "24px 40px 0", fontFamily: "var(--font-sans)" }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12, color: "var(--text-muted)" }}>
          {[
            { label: "已核准", bg: "var(--green-bg)",     color: "var(--green)" },
            { label: "審核中", bg: "oklch(0.96 0.04 75)", color: "oklch(0.52 0.12 55)" },
            { label: "已拒絕", bg: "oklch(0.97 0.03 15)", color: "oklch(0.50 0.14 15)" },
          ].map(({ label, bg, color }) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 28, height: 14, borderRadius: 3, background: bg, border: `1px solid ${color}`, display: "inline-block", opacity: 0.9 }} />
              <span style={{ color }}>{label}</span>
            </span>
          ))}
          <span style={{ color: "var(--text-muted)", marginLeft: 4 }}>· 點選日期或事件查看詳情</span>
        </div>

        {/* ── 時段圖例（for mobile dots） */}
        {isMobile && (
          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
            {Object.entries(TIME_SLOT_LABEL).map(([key, label]) => (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: key === "morning" ? "var(--accent)" : key === "afternoon" ? "var(--blue)" : "var(--green)", display: "inline-block" }} />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Calendar ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "12px 16px 40px" : "16px 40px 60px" }}>
        {bookingsError ? (
          <div style={{
            padding: "52px 0", textAlign: "center",
            color: "oklch(0.50 0.14 15)", fontSize: 13,
            background: "var(--surface)", border: "1px solid var(--border-light)",
            borderRadius: "var(--r)",
          }}>
            預約資料載入失敗，請重新整理頁面
          </div>
        ) : (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: "var(--r)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <RentCalendar
              bookings={bookings}
              viewOnly={true}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCalendar;
