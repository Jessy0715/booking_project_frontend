import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/renderWithProviders";
import MyBookings from "./index";

const mockBookings = [
  { id: 1, roomTitle: "自然光棚 A", date: "2026-12-01", timeSlot: "morning", status: "PENDING", reason: "" },
  { id: 2, roomTitle: "黑棚 B", date: "2026-12-02", timeSlot: "night", status: "APPROVED", reason: "" },
];

jest.mock("@/services/bookingApi.generated", () => ({
  useLogoutMutation: () => [jest.fn()],
  useCancelBookingMutation: () => [jest.fn(), { isLoading: false }],
  useSearchBookingsQuery: () => ({
    data: { data: mockBookings },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

describe("MyBookings 狀態篩選", () => {
  it("預設顯示全部，點選狀態後只顯示該狀態，無資料時顯示空狀態，可回到全部", async () => {
    const user = userEvent;
    renderWithProviders(<MyBookings />, { route: "/myBookings" });

    expect(screen.getByText("自然光棚 A")).toBeInTheDocument();
    expect(screen.getByText("黑棚 B")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^已核准/ }));
    expect(screen.queryByText("自然光棚 A")).not.toBeInTheDocument();
    expect(screen.getByText("黑棚 B")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^已拒絕/ }));
    expect(screen.getByText("目前無「已拒絕」的預約")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^全部/ }));
    expect(screen.getByText("自然光棚 A")).toBeInTheDocument();
    expect(screen.getByText("黑棚 B")).toBeInTheDocument();
  });
});
