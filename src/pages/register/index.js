import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useRegisterMutation } from "@/services/bookingApi.generated";

const fieldStyle = {
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--accent)" },
  },
};

const Register = () => {
  const navigate = useNavigate();
  const [registerApi, { isLoading }]        = useRegisterMutation();
  const [account, setAccount]               = useState("");
  const [password, setPassword]             = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [errorMsg, setErrorMsg]             = useState("");

  const handleRegister = async () => {
    if (!account)  { setErrorMsg("請輸入帳號"); return; }
    if (!password) { setErrorMsg("請輸入密碼"); return; }

    setErrorMsg("");
    try {
      await registerApi({ registerRequest: { account, password } }).unwrap();
      navigate("/login");
    } catch (err) {
      setErrorMsg(err?.data?.message || "註冊失敗，請稍後再試");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        background: "var(--surface)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--r)",
        boxShadow: "var(--shadow-md)",
        overflow: "hidden",
        animation: "fadeUp 0.35s ease",
      }}>

        {/* 品牌區 */}
        <div style={{
          background: "linear-gradient(135deg, oklch(0.25 0.04 55), oklch(0.15 0.02 75))",
          padding: "28px 40px",
          position: "relative",
          overflow: "hidden",
        }}>
          <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <circle cx="90%" cy="40%" r="60" fill="oklch(0.7 0.12 42 / 0.12)" />
            <circle cx="70%" cy="90%" r="35" fill="oklch(0.55 0.1 145 / 0.09)" />
          </svg>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              Photography Studio
            </div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontWeight: 500, color: "white", letterSpacing: "0.04em" }}>
              Lumino 自然光攝影棚
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
              建立您的帳號
            </div>
          </div>
        </div>

        {/* 表單區 */}
        <div style={{ padding: "32px 40px 36px" }}>

          {/* 帳號 */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>帳號</label>
            <OutlinedInput
              size="small"
              fullWidth
              placeholder="請輸入帳號"
              value={account}
              onChange={(e) => { setAccount(e.target.value); setErrorMsg(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              sx={fieldStyle}
            />
          </div>

          {/* 密碼 */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>密碼</label>
            <OutlinedInput
              size="small"
              fullWidth
              placeholder="請輸入密碼"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword((s) => !s)} edge="end">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              }
              sx={fieldStyle}
            />
          </div>

          {/* 錯誤訊息 */}
          {errorMsg && (
            <div style={{
              fontSize: 12, color: "oklch(0.5 0.15 15)",
              background: "oklch(0.97 0.02 15)",
              border: "1px solid oklch(0.88 0.06 15)",
              borderRadius: 6, padding: "8px 12px",
              marginBottom: 12, marginTop: 8,
            }}>
              {errorMsg}
            </div>
          )}

          {/* 註冊按鈕 */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "10px 0",
              marginTop: errorMsg ? 0 : 20,
              background: isLoading ? "var(--border)" : "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: isLoading ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!isLoading) e.target.style.background = "var(--accent-hover)"; }}
            onMouseLeave={(e) => { if (!isLoading) e.target.style.background = "var(--accent)"; }}
          >
            {isLoading ? "註冊中…" : "立刻註冊"}
          </button>

          {/* 登入連結 */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--text-muted)" }}>
            已有帳號？{" "}
            <span
              onClick={() => navigate("/login")}
              style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline" }}
            >
              點此登入
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
