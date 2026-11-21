import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/renderWithProviders";
import MyBookings from "./index";

const mockBookings = [
  { id: 1, roomTitle: "自然光棚 A", date: "2026-12-01", timeSlot: "morning", status: "PENDING", reason: "" },
  { id: 2, roomTitle: "黑棚 B", date: "2026-12-02", timeSlot: "night", status: "APPROVED", reason: "" },
];

const mockCancel = jest.fn();

jest.mock("@/services/bookingApi.generated", () => ({
  useLogoutMutation: () => [jest.fn()],
  useCancelBookingMutation: () => [mockCancel, { isLoading: false }],
  useSearchBookingsQuery: () => ({
    data: { data: mockBookings },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

describe("MyBookings 取消預約確認", () => {
  beforeEach(() => {
    mockCancel.mockReset();
    mockCancel.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  });

  it("按取消預約先跳出對話框，按算了不呼叫 API", async () => {
    renderWithProviders(<MyBookings />, { route: "/myBookings" });

    await userEvent.click(screen.getByRole("button", { name: "取消預約" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mockCancel).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "算了" }));
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it("確認取消後才呼叫 API", async () => {
    renderWithProviders(<MyBookings />, { route: "/myBookings" });

    await userEvent.click(screen.getByRole("button", { name: "取消預約" }));
    await userEvent.click(screen.getByRole("button", { name: "確認取消" }));

    expect(mockCancel).toHaveBeenCalledWith({ id: 1 });
    expect(await screen.findByText("預約已取消")).toBeInTheDocument();
  });
});

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
