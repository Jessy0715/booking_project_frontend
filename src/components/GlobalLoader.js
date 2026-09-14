import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const selectIsLoading = (state) => {
  const api = state.bookingApi;
  if (!api) return false;
  const allEntries = [
    ...Object.values(api.queries   || {}),
    ...Object.values(api.mutations || {}),
  ];
  return allEntries.some((entry) => entry?.status === "pending");
};

const GlobalLoader = () => {
  const active = useSelector(selectIsLoading);

  const [width,   setWidth]   = useState(0);
  const [visible, setVisible] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (active) {
      setVisible(true);
      setWidth(30);
      timer.current = setTimeout(() => setWidth(72), 200);
    } else {
      setWidth(100);
      timer.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 380);
    }
    return () => clearTimeout(timer.current);
  }, [active]);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0,
      height: 3, zIndex: 9999, pointerEvents: "none",
    }}>
      <div style={{
        height: "100%",
        width: `${width}%`,
        background: "var(--accent)",
        transition: width === 100
          ? "width 0.32s ease"
          : "width 1.4s cubic-bezier(0.1, 0.5, 0.4, 1)",
        boxShadow: "0 0 6px var(--accent)",
        borderRadius: "0 2px 2px 0",
      }} />
    </div>
  );
};

export default GlobalLoader;
