import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import BookingSuccess from "./BookingSuccess";

const summary = {
  roomName: "A 棚",
  date: "2026-12-01",
  timeSlotLabel: "上午 09:00 - 12:00",
  userName: "jessy",
};

describe("BookingSuccess", () => {
  it("shows booking details and pending status", () => {
    render(<MemoryRouter><BookingSuccess summary={summary} onBookAgain={() => {}} /></MemoryRouter>);
    expect(screen.getByText("A 棚")).toBeInTheDocument();
    expect(screen.getByText("2026-12-01")).toBeInTheDocument();
    expect(screen.getByText("審核中")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "前往我的預約" })).toHaveAttribute("href", "/myBookings");
    expect(screen.getByRole("link", { name: "回首頁" })).toHaveAttribute("href", "/");
  });

  it("calls onBookAgain", () => {
    const onBookAgain = jest.fn();
    render(<MemoryRouter><BookingSuccess summary={summary} onBookAgain={onBookAgain} /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "繼續預約" }));
    expect(onBookAgain).toHaveBeenCalled();
  });
});
