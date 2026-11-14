import { useState, useMemo } from "react";
import { message as antdMsg } from "antd";
import {
  useSearchRoomsQuery,
  useSearchBookingsQuery,
  useReviewBookingMutation,
} from "@/services/bookingApi.generated";

const TIME_SLOT_ORDER = { morning: 0, afternoon: 1, night: 2 };
const STATUS_ORDER    = { pending: 0, approved: 1, rejected: 2 };

// 預約審核的資料與狀態。場地下拉的選項與場地管理共用同一個搜尋關鍵字（行為與拆分前相同）。
export const useBookingReview = ({ roomKeyword }) => {
  const [roomFilter, setRoomFilter]       = useState("");
  const [slotFilter, setSlotFilter]       = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [sort, setSort]                   = useState({ field: "date", direction: "asc" });
  const [page, setPage]                   = useState(0);
  const [rowsPerPage, setRowsPerPage]     = useState(10);

  const { data: roomsData } = useSearchRoomsQuery({ keyword: roomKeyword || undefined, pageSize: 100 });
  const rooms = roomsData?.data ?? [];

  const { data: bookingsData, isError: bookingsError, refetch: refetchBookings } =
    useSearchBookingsQuery({});

  const [reviewBookingApi] = useReviewBookingMutation();

  const processedBookings = useMemo(() => {
    const bookings = (bookingsData?.data ?? []).map((b) => ({ ...b, status: b.status?.toLowerCase() }));
    const filtered = bookings.filter((b) => {
      if (roomFilter   && String(b.roomId) !== roomFilter)   return false;
      if (slotFilter   && b.timeSlot !== slotFilter)         return false;
      if (statusFilter && b.status   !== statusFilter)       return false;
      return true;
    });
    const { field, direction } = sort;
    return [...filtered].sort((a, b) => {
      let va, vb;
      if (field === "timeSlot") { va = TIME_SLOT_ORDER[a.timeSlot] ?? 99; vb = TIME_SLOT_ORDER[b.timeSlot] ?? 99; }
      else if (field === "status") { va = STATUS_ORDER[a.status] ?? 99; vb = STATUS_ORDER[b.status] ?? 99; }
      else { va = (a[field] || "").toString(); vb = (b[field] || "").toString(); }
      if (va < vb) return direction === "asc" ? -1 : 1;
      if (va > vb) return direction === "asc" ?  1 : -1;
      return 0;
    });
  }, [bookingsData, roomFilter, slotFilter, statusFilter, sort]);

  const handleSort = (field) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" }
    );
    setPage(0);
  };

  const handleRoomFilterChange   = (value) => { setRoomFilter(value);   setPage(0); };
  const handleSlotFilterChange   = (value) => { setSlotFilter(value);   setPage(0); };
  const handleStatusFilterChange = (value) => { setStatusFilter(value); setPage(0); };
  const handleClearFilters = () => {
    setRoomFilter(""); setSlotFilter(""); setStatusFilter(""); setPage(0);
  };
  const handleRowsPerPageChange = (value) => { setRowsPerPage(value); setPage(0); };

  const handleReview = async (id, status) => {
    try {
      await reviewBookingApi({ id, bookingReviewRequest: { status } }).unwrap();
      antdMsg.success(status === "approved" ? "已核准" : "已拒絕");
      refetchBookings();
    } catch (err) {
      antdMsg.error(err?.data?.message || "操作失敗");
    }
  };

  const totalPages    = Math.ceil(processedBookings.length / rowsPerPage) || 1;
  const pagedBookings = processedBookings.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return {
    rooms, bookingsError, processedBookings, pagedBookings,
    roomFilter, slotFilter, statusFilter,
    handleRoomFilterChange, handleSlotFilterChange, handleStatusFilterChange, handleClearFilters,
    sort, handleSort,
    page, setPage, rowsPerPage, handleRowsPerPageChange, totalPages,
    handleReview,
  };
};
