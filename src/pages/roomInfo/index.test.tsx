import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/renderWithProviders";
import RoomInfo from "./index";

const mockRoom = {
  id: 1,
  roomImg: "room.jpg",
  title: "自然光棚 A",
  desc: "採光良好的攝影空間",
  price: { morning: 500, afternoon: 800, night: 600 },
  floor: "3F",
  area: 20,
  capacity: 8,
  facilities: ["冷氣"],
};

jest.mock("@/services/bookingApi.generated", () => ({
  useLogoutMutation: () => [jest.fn()],
  useSearchRoomsQuery: () => ({
    data: { data: [mockRoom] },
    isLoading: false,
    isError: false,
  }),
}));

describe("RoomInfo 頁 smoke test", () => {
  it("能 render 並顯示標題與場地卡片", () => {
    renderWithProviders(<RoomInfo />, { route: "/roomInfo" });

    expect(screen.getByRole("heading", { name: "Lumino 自然光攝影棚" })).toBeInTheDocument();
    expect(screen.getByText("精選空間", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("自然光棚 A")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "前往預約" })).toBeInTheDocument();
  });
});
