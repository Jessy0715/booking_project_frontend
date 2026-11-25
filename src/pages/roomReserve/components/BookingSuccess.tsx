import { Link } from "react-router-dom";

export type BookingSummary = {
  roomName: string;
  date: string;
  timeSlotLabel: string;
  userName: string;
  reason?: string;
};

type Props = {
  summary: BookingSummary;
  onBookAgain: () => void;
};

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 20px",
  borderRadius: "var(--r)",
  textDecoration: "none",
  fontSize: 14,
} as const;

const BookingSuccess = ({ summary, onBookAgain }: Props) => {
  const rows: [string, string][] = [
    ["場地", summary.roomName],
    ["日期", summary.date],
    ["時段", summary.timeSlotLabel],
    ["預約人", summary.userName],
    ["租借事由", summary.reason || "—"],
    ["狀態", "審核中"],
  ];

  return (
    <section
      aria-labelledby="booking-success-title"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--r)",
        boxShadow: "var(--shadow-sm)",
        padding: "24px 20px",
      }}
    >
      <h1
        id="booking-success-title"
        style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, margin: "0 0 4px", color: "var(--text)" }}
      >
        預約送出成功
      </h1>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)" }}>
        您的預約已送出，等待管理員審核。
      </p>

      <dl style={{ margin: 0 }}>
        {rows.map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid var(--border-light)",
              fontSize: 14,
            }}
          >
            <dt style={{ width: 80, flexShrink: 0, color: "var(--text-muted)" }}>{label}</dt>
            <dd style={{ margin: 0, color: "var(--text)", minWidth: 0, overflowWrap: "anywhere" }}>{value}</dd>
          </div>
        ))}
      </dl>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
        <Link to="/myBookings" style={{ ...linkStyle, background: "var(--accent)", color: "#fff" }}>
          前往我的預約
        </Link>
        <Link to="/" style={{ ...linkStyle, border: "1px solid var(--border-light)", color: "var(--text)" }}>
          回首頁
        </Link>
        <button
          type="button"
          onClick={onBookAgain}
          style={{ ...linkStyle, border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
        >
          繼續預約
        </button>
      </div>
    </section>
  );
};

export default BookingSuccess;
