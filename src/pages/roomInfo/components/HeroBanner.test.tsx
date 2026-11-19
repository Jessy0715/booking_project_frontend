import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/utils/renderWithProviders";
import HeroBanner from "./HeroBanner";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("HeroBanner", () => {
  it("顯示標題，點「立即預約」導向預約頁", async () => {
    renderWithProviders(<HeroBanner />);

    expect(screen.getByRole("heading", { name: "Lumino 自然光攝影棚" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "立即預約" }));
    expect(mockNavigate).toHaveBeenCalledWith("/roomReserve");
  });
});
