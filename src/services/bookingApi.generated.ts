import { api } from "./emptyApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRooms: build.query<GetRoomsApiResponse, GetRoomsApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms`,
        params: {
          page: queryArg.page,
          pageSize: queryArg.pageSize,
          keyword: queryArg.keyword,
        },
      }),
    }),
    createRoom: build.mutation<CreateRoomApiResponse, CreateRoomApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getRoomById: build.query<GetRoomByIdApiResponse, GetRoomByIdApiArg>({
      query: (queryArg) => ({ url: `/api/rooms/${queryArg.id}` }),
    }),
    updateRoom: build.mutation<UpdateRoomApiResponse, UpdateRoomApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms/${queryArg.id}`,
        method: "PUT",
        body: queryArg.body,
      }),
    }),
    deleteRoom: build.mutation<DeleteRoomApiResponse, DeleteRoomApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    getRoomSlots: build.query<GetRoomSlotsApiResponse, GetRoomSlotsApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms/${queryArg.id}/slots`,
        params: {
          date: queryArg.date,
        },
      }),
    }),
    getBookings: build.query<GetBookingsApiResponse, GetBookingsApiArg>({
      query: (queryArg) => ({
        url: `/api/bookings`,
        params: {
          roomId: queryArg.roomId,
          userId: queryArg.userId,
          status: queryArg.status,
          date: queryArg.date,
          page: queryArg.page,
          pageSize: queryArg.pageSize,
        },
      }),
    }),
    createBooking: build.mutation<
      CreateBookingApiResponse,
      CreateBookingApiArg
    >({
      query: (queryArg) => ({
        url: `/api/bookings`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    getBookingById: build.query<
      GetBookingByIdApiResponse,
      GetBookingByIdApiArg
    >({
      query: (queryArg) => ({ url: `/api/bookings/${queryArg.id}` }),
    }),
    reviewBooking: build.mutation<
      ReviewBookingApiResponse,
      ReviewBookingApiArg
    >({
      query: (queryArg) => ({
        url: `/api/bookings/${queryArg.id}`,
        method: "PATCH",
        body: queryArg.body,
      }),
    }),
    cancelBooking: build.mutation<
      CancelBookingApiResponse,
      CancelBookingApiArg
    >({
      query: (queryArg) => ({
        url: `/api/bookings/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    register: build.mutation<RegisterApiResponse, RegisterApiArg>({
      query: (queryArg) => ({
        url: `/api/auth/register`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    login: build.mutation<LoginApiResponse, LoginApiArg>({
      query: (queryArg) => ({
        url: `/api/auth/login`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as bookingApi };
export type GetRoomsApiResponse = /** status 200 OK */ {
  success: boolean;
  data: Room[];
  pagination: Pagination;
};
export type GetRoomsApiArg = {
  page?: number;
  pageSize?: number;
  keyword?: string;
};
export type CreateRoomApiResponse = /** status 201 Created */ {
  success: boolean;
  data: Room;
};
export type CreateRoomApiArg = {
  body: {
    roomImg?: string;
    title: string;
    desc?: string;
    floor?: string;
    area?: number;
    capacity?: number;
    facilities?: string[];
    price: Price;
  };
};
export type GetRoomByIdApiResponse = /** status 200 OK */ {
  success: boolean;
  data: Room;
};
export type GetRoomByIdApiArg = {
  id: number;
};
export type UpdateRoomApiResponse = /** status 200 OK */ {
  success: boolean;
  data: Room;
};
export type UpdateRoomApiArg = {
  id: number;
  body: {
    roomImg?: string;
    title?: string;
    desc?: string;
    floor?: string;
    area?: number;
    capacity?: number;
    facilities?: string[];
    price?: Price;
  };
};
export type DeleteRoomApiResponse = /** status 200 OK */ {
  success: boolean;
  data?: object;
};
export type DeleteRoomApiArg = {
  id: number;
};
export type GetRoomSlotsApiResponse = /** status 200 OK */ {
  success: boolean;
  data: SlotAvailability;
};
export type GetRoomSlotsApiArg = {
  id: number;
  date: string;
};
export type GetBookingsApiResponse = /** status 200 OK */ {
  success: boolean;
  data: Booking[];
  pagination: Pagination;
};
export type GetBookingsApiArg = {
  roomId?: number;
  userId?: number;
  status?: "pending" | "approved" | "rejected";
  date?: string;
  page?: number;
  pageSize?: number;
};
export type CreateBookingApiResponse = /** status 201 Created */ {
  success: boolean;
  data: Booking;
};
export type CreateBookingApiArg = {
  body: {
    roomId: number;
    booking_date: string;
    timeSlot: "morning" | "afternoon" | "night";
    reason?: string;
    userName?: string;
  };
};
export type GetBookingByIdApiResponse = /** status 200 OK */ {
  success: boolean;
  data: Booking;
};
export type GetBookingByIdApiArg = {
  id: number;
};
export type ReviewBookingApiResponse = /** status 200 OK */ {
  success: boolean;
  data: Booking;
};
export type ReviewBookingApiArg = {
  id: number;
  body: {
    status: "approved" | "rejected";
  };
};
export type CancelBookingApiResponse = /** status 200 OK */ {
  success: boolean;
  data?: object;
};
export type CancelBookingApiArg = {
  id: number;
};
export type RegisterApiResponse = /** status 201 Created */ {
  success: boolean;
  data: UserInfo;
};
export type RegisterApiArg = {
  body: {
    account: string;
    password: string;
  };
};
export type LoginApiResponse = /** status 200 OK */ {
  success: boolean;
  data: LoginData;
};
export type LoginApiArg = {
  body: {
    account: string;
    password: string;
  };
};
export type Price = {
  morning: string;
  afternoon: string;
  night: string;
};
export type Room = {
  id: number;
  roomImg?: string;
  title: string;
  desc?: string;
  floor?: string;
  area?: number;
  capacity?: number;
  facilities?: string[];
  price: Price;
  createdAt?: string;
};
export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
export type ErrorResponse = {
  success: boolean;
  message: string;
};
export type SlotAvailability = {
  morning: "available" | "pending" | "approved";
  afternoon: "available" | "pending" | "approved";
  night: "available" | "pending" | "approved";
};
export type Booking = {
  id: number;
  roomId: number;
  roomTitle?: string;
  userId?: number;
  userName?: string;
  booking_date: string;
  timeSlot: "morning" | "afternoon" | "night";
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
};
export type UserInfo = {
  id: number;
  account: string;
  role: "user" | "admin";
};
export type LoginData = {
  id: number;
  account: string;
  role: "user" | "admin";
  token: string;
};
export const {
  useGetRoomsQuery,
  useLazyGetRoomsQuery,
  useCreateRoomMutation,
  useGetRoomByIdQuery,
  useLazyGetRoomByIdQuery,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomSlotsQuery,
  useLazyGetRoomSlotsQuery,
  useGetBookingsQuery,
  useLazyGetBookingsQuery,
  useCreateBookingMutation,
  useGetBookingByIdQuery,
  useLazyGetBookingByIdQuery,
  useReviewBookingMutation,
  useCancelBookingMutation,
  useRegisterMutation,
  useLoginMutation,
} = injectedRtkApi;
