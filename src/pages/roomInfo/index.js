import { Outlet } from "react-router-dom";
import Header from "@/components/Header";
import Room from "./components/Room";
import HeroBanner, { ROOM_LIST_ANCHOR_ID } from "./components/HeroBanner";

const RoomInfo = () => (
  <>
    <Header />

    <HeroBanner />

    {/* ── 場地列表 ──────────────────────────────────────────────── */}
    <main id={ROOM_LIST_ANCHOR_ID} style={{ background: "var(--bg)", minHeight: "60vh" }}>
      <Room />
    </main>

    <Outlet />
  </>
);

export default RoomInfo;
