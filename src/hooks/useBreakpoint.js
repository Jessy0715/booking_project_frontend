import { useState, useEffect } from "react";

const MOBILE  = 768;
const TABLET  = 1024;

export const useBreakpoint = () => {
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return {
    width,
    isMobile: width < MOBILE,
    isTablet: width < TABLET,
  };
};
