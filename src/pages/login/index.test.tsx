import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/utils/renderWithProviders";
import Login from "./index";

jest.mock("@/services/bookingApi.generated", () => ({
  useLoginMutation: () => [jest.fn(), { isLoading: false }],
}));

describe("Login 頁 smoke test", () => {
  it("能 render 並顯示帳號、密碼欄位與登入按鈕", () => {
    renderWithProviders(<Login />);

    expect(screen.getByPlaceholderText("請輸入帳號")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("請輸入密碼")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登入" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "一般會員" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "管理員" })).toBeInTheDocument();
  });
});
