import { api } from "./emptyApi";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getRoom: build.query<GetRoomApiResponse, GetRoomApiArg>({
      query: (queryArg) => ({ url: `/api/rooms/${queryArg.id}` }),
    }),
    updateRoom: build.mutation<UpdateRoomApiResponse, UpdateRoomApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms/${queryArg.id}`,
        method: "PUT",
        body: queryArg.roomCreateRequest,
      }),
    }),
    deleteRoom: build.mutation<DeleteRoomApiResponse, DeleteRoomApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms/${queryArg.id}`,
        method: "DELETE",
      }),
    }),
    uploadImage: build.mutation<UploadImageApiResponse, UploadImageApiArg>({
      query: (queryArg) => ({
        url: `/api/uploads/images`,
        method: "POST",
        body: queryArg.body,
      }),
    }),
    searchRooms: build.query<SearchRoomsApiResponse, SearchRoomsApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms`,
        params: {
          keyword: queryArg.keyword,
          page: queryArg.page,
          pageSize: queryArg.pageSize,
        },
      }),
    }),
    createRoom: build.mutation<CreateRoomApiResponse, CreateRoomApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms`,
        method: "POST",
        body: queryArg.roomCreateRequest,
      }),
    }),
    deleteRooms: build.mutation<DeleteRoomsApiResponse, DeleteRoomsApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms`,
        method: "DELETE",
        params: {
          ids: queryArg.ids,
        },
      }),
    }),
    searchBookings: build.query<
      SearchBookingsApiResponse,
      SearchBookingsApiArg
    >({
      query: (queryArg) => ({
        url: `/api/bookings`,
        params: {
          userId: queryArg.userId,
          status: queryArg.status,
          roomId: queryArg.roomId,
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
        body: queryArg.bookingCreateRequest,
      }),
    }),
    register: build.mutation<RegisterApiResponse, RegisterApiArg>({
      query: (queryArg) => ({
        url: `/api/auth/register`,
        method: "POST",
        body: queryArg.registerRequest,
      }),
    }),
    logout: build.mutation<LogoutApiResponse, LogoutApiArg>({
      query: () => ({ url: `/api/auth/logout`, method: "POST" }),
    }),
    login: build.mutation<LoginApiResponse, LoginApiArg>({
      query: (queryArg) => ({
        url: `/api/auth/login`,
        method: "POST",
        body: queryArg.loginRequest,
      }),
    }),
    getBooking: build.query<GetBookingApiResponse, GetBookingApiArg>({
      query: (queryArg) => ({ url: `/api/bookings/${queryArg.id}` }),
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
    reviewBooking: build.mutation<
      ReviewBookingApiResponse,
      ReviewBookingApiArg
    >({
      query: (queryArg) => ({
        url: `/api/bookings/${queryArg.id}`,
        method: "PATCH",
        body: queryArg.bookingReviewRequest,
      }),
    }),
    getSlots: build.query<GetSlotsApiResponse, GetSlotsApiArg>({
      query: (queryArg) => ({
        url: `/api/rooms/${queryArg.id}/slots`,
        params: {
          date: queryArg.date,
        },
      }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as bookingApi };
export type GetRoomApiResponse = /** status 200 OK */ ApiResponseRoomResponse;
export type GetRoomApiArg = {
  id: number;
};
export type UpdateRoomApiResponse =
  /** status 200 OK */ ApiResponseRoomResponse;
export type UpdateRoomApiArg = {
  id: number;
  roomCreateRequest: RoomCreateRequest;
};
export type DeleteRoomApiResponse = /** status 200 OK */ ApiResponseVoid;
export type DeleteRoomApiArg = {
  id: number;
};
export type UploadImageApiResponse =
  /** status 201 Created */ ApiResponseUploadResponse;
export type UploadImageApiArg = {
  body: {
    file: Blob;
  };
};
export type SearchRoomsApiResponse =
  /** status 200 OK */ ApiResponseListRoomResponse;
export type SearchRoomsApiArg = {
  keyword?: string;
  page?: number;
  pageSize?: number;
};
export type CreateRoomApiResponse =
  /** status 201 Created */ ApiResponseRoomResponse;
export type CreateRoomApiArg = {
  roomCreateRequest: RoomCreateRequest;
};
export type DeleteRoomsApiResponse = /** status 200 OK */ ApiResponseVoid;
export type DeleteRoomsApiArg = {
  ids: number[];
};
export type SearchBookingsApiResponse =
  /** status 200 OK */ ApiResponseListBookingResponse;
export type SearchBookingsApiArg = {
  userId?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  roomId?: number;
};
export type CreateBookingApiResponse =
  /** status 201 Created */ ApiResponseBookingResponse;
export type CreateBookingApiArg = {
  bookingCreateRequest: BookingCreateRequest;
};
export type RegisterApiResponse =
  /** status 201 Created */ ApiResponseUserResponse;
export type RegisterApiArg = {
  registerRequest: RegisterRequest;
};
export type LogoutApiResponse = /** status 200 OK */ ApiResponseVoid;
export type LogoutApiArg = void;
export type LoginApiResponse = /** status 200 OK */ ApiResponseAuthResponse;
export type LoginApiArg = {
  loginRequest: LoginRequest;
};
export type GetBookingApiResponse =
  /** status 200 OK */ ApiResponseBookingResponse;
export type GetBookingApiArg = {
  id: number;
};
export type CancelBookingApiResponse = /** status 200 OK */ ApiResponseVoid;
export type CancelBookingApiArg = {
  id: number;
};
export type ReviewBookingApiResponse =
  /** status 200 OK */ ApiResponseBookingResponse;
export type ReviewBookingApiArg = {
  id: number;
  bookingReviewRequest: BookingReviewRequest;
};
export type GetSlotsApiResponse =
  /** status 200 OK */ ApiResponseSlotAvailabilityResponse;
export type GetSlotsApiArg = {
  id: number;
  date: string;
};
export type PriceResponse = {
  morning?: string;
  afternoon?: string;
  night?: string;
};
export type RoomResponse = {
  id?: number;
  roomImg?: string;
  title?: string;
  desc?: string;
  floor?: string;
  area?: number;
  capacity?: number;
  facilities?: string[];
  price?: PriceResponse;
  createdAt?: string;
};
export type PaginationResponse = {
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
};
export type ApiResponseRoomResponse = {
  success?: boolean;
  data?: RoomResponse;
  pagination?: PaginationResponse;
  message?: string;
};
export type PriceRequest = {
  morning?: number;
  afternoon?: number;
  night?: number;
};
export type RoomCreateRequest = {
  title: string;
  roomImg?: string;
  desc?: string;
  floor?: string;
  area?: number;
  capacity?: number;
  facilities?: string[];
  price?: PriceRequest;
};
export type ApiResponseVoid = {
  success?: boolean;
  data?: any;
  pagination?: PaginationResponse;
  message?: string;
};
export type UploadResponse = {
  url?: string;
};
export type ApiResponseUploadResponse = {
  success?: boolean;
  data?: UploadResponse;
  pagination?: PaginationResponse;
  message?: string;
};
export type ApiResponseListRoomResponse = {
  success?: boolean;
  data?: RoomResponse[];
  pagination?: PaginationResponse;
  message?: string;
};
export type BookingResponse = {
  id?: number;
  roomId?: number;
  roomTitle?: string;
  userId?: number;
  userName?: string;
  date?: string;
  timeSlot?: string;
  reason?: string;
  status?: string;
  createdAt?: string;
};
export type ApiResponseListBookingResponse = {
  success?: boolean;
  data?: BookingResponse[];
  pagination?: PaginationResponse;
  message?: string;
};
export type ApiResponseBookingResponse = {
  success?: boolean;
  data?: BookingResponse;
  pagination?: PaginationResponse;
  message?: string;
};
export type BookingCreateRequest = {
  roomId: number;
  userName?: string;
  date: string;
  timeSlot: string;
  reason?: string;
};
export type UserResponse = {
  id?: number;
  account?: string;
  role?: string;
};
export type ApiResponseUserResponse = {
  success?: boolean;
  data?: UserResponse;
  pagination?: PaginationResponse;
  message?: string;
};
export type RegisterRequest = {
  account: string;
  password: string;
};
export type AuthResponse = {
  id?: number;
  account?: string;
  role?: string;
  token?: string;
};
export type ApiResponseAuthResponse = {
  success?: boolean;
  data?: AuthResponse;
  pagination?: PaginationResponse;
  message?: string;
};
export type LoginRequest = {
  account: string;
  password: string;
};
export type BookingReviewRequest = {
  status: string;
};
export type SlotAvailabilityResponse = {
  morning?: string;
  afternoon?: string;
  night?: string;
};
export type ApiResponseSlotAvailabilityResponse = {
  success?: boolean;
  data?: SlotAvailabilityResponse;
  pagination?: PaginationResponse;
  message?: string;
};
export const {
  useGetRoomQuery,
  useLazyGetRoomQuery,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useUploadImageMutation,
  useSearchRoomsQuery,
  useLazySearchRoomsQuery,
  useCreateRoomMutation,
  useDeleteRoomsMutation,
  useSearchBookingsQuery,
  useLazySearchBookingsQuery,
  useCreateBookingMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLoginMutation,
  useGetBookingQuery,
  useLazyGetBookingQuery,
  useCancelBookingMutation,
  useReviewBookingMutation,
  useGetSlotsQuery,
  useLazyGetSlotsQuery,
} = injectedRtkApi;
