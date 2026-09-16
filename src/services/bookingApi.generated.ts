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
    generateRoomDescription: build.mutation<
      GenerateRoomDescriptionApiResponse,
      GenerateRoomDescriptionApiArg
    >({
      query: (queryArg) => ({
        url: `/api/ai/room-description`,
        method: "POST",
        body: queryArg.roomDescriptionRequest,
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
    getRoomOptions: build.query<
      GetRoomOptionsApiResponse,
      GetRoomOptionsApiArg
    >({
      query: () => ({ url: `/api/rooms/options` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as bookingApi };
export type GetRoomApiResponse = /** status 200 查詢成功 */ ApiResponse;
export type GetRoomApiArg = {
  /** 場地 id */
  id: number;
};
export type UpdateRoomApiResponse =
  /** status 200 修改成功，回更新後的場地 */ ApiResponse;
export type UpdateRoomApiArg = {
  /** 場地 id */
  id: number;
  roomCreateRequest: RoomCreateRequest;
};
export type DeleteRoomApiResponse =
  /** status 200 刪除成功（回 message 不回 data） */ Blob;
export type DeleteRoomApiArg = {
  /** 場地 id */
  id: number;
};
export type UploadImageApiResponse =
  /** status 201 上傳成功，回圖片網址 */ Blob;
export type UploadImageApiArg = {
  body: {
    /** 要上傳的圖片檔。欄位名必須是 `file`。限 jpg / png / webp，5 MB 以內。 */
    file: Blob;
  };
};
export type SearchRoomsApiResponse = /** status 200 查詢成功 */ Blob;
export type SearchRoomsApiArg = {
  /** 關鍵字，只對場地名稱做模糊比對，不分大小寫。空白或省略視為不篩選。 */
  keyword?: string;
  /** 第幾頁，從 1 開始。超出總頁數回空陣列，不是錯誤。 */
  page?: number;
  /** 每頁幾筆，上限 100（超過會被夾到 100）。實際生效的值見 `pagination.pageSize`。 */
  pageSize?: number;
};
export type CreateRoomApiResponse =
  /** status 201 建立成功，回新建立的場地 */ ApiResponse;
export type CreateRoomApiArg = {
  roomCreateRequest: RoomCreateRequest;
};
export type DeleteRoomsApiResponse =
  /** status 200 全部刪除成功（回 message 不回 data） */ Blob;
export type DeleteRoomsApiArg = {
  /** 場地 id 清單，逗號分隔（例如 `1,2,3`）。必填。 */
  ids: string;
};
export type SearchBookingsApiResponse =
  /** status 200 查詢成功（沒有 pagination 欄位） */ Blob;
export type SearchBookingsApiArg = {
  /** 只看某個使用者的預約。值是登入回傳的 `data.id`。 */
  userId?: number;
  /** 只看某個狀態的預約。全小寫，送其他值會回 400。 */
  status?: "pending" | "approved" | "rejected";
  /** 只看某間棚的預約。值是場地 id。 */
  roomId?: number;
};
export type CreateBookingApiResponse =
  /** status 201 預約建立成功，狀態為 pending */ Blob;
export type CreateBookingApiArg = {
  bookingCreateRequest: BookingCreateRequest;
};
export type RegisterApiResponse =
  /** status 201 註冊成功（回應沒有 token） */ Blob;
export type RegisterApiArg = {
  registerRequest: RegisterRequest;
};
export type LogoutApiResponse =
  /** status 200 登出成功（回 message 不回 data） */ Blob;
export type LogoutApiArg = void;
export type LoginApiResponse = /** status 200 登入成功 */ Blob;
export type LoginApiArg = {
  loginRequest: LoginRequest;
};
export type GenerateRoomDescriptionApiResponse =
  /** status 200 生成成功 */ Blob;
export type GenerateRoomDescriptionApiArg = {
  roomDescriptionRequest: RoomDescriptionRequest;
};
export type GetBookingApiResponse = /** status 200 查詢成功 */ ApiResponse;
export type GetBookingApiArg = {
  /** 預約 id */
  id: number;
};
export type CancelBookingApiResponse =
  /** status 200 取消成功（回 message 不回 data） */ Blob;
export type CancelBookingApiArg = {
  /** 預約 id */
  id: number;
};
export type ReviewBookingApiResponse =
  /** status 200 審核成功，回更新後的預約 */ ApiResponse;
export type ReviewBookingApiArg = {
  /** 預約 id */
  id: number;
  bookingReviewRequest: BookingReviewRequest;
};
export type GetSlotsApiResponse = /** status 200 查詢成功 */ ApiResponse;
export type GetSlotsApiArg = {
  /** 場地 id */
  id: number;
  /** 要查的日期，格式 yyyy-MM-dd。必填。 */
  date: string;
};
export type GetRoomOptionsApiResponse =
  /** status 200 查詢成功。沒有場地時回空陣列。 */ Blob;
export type GetRoomOptionsApiArg = void;
export type PriceResponse = {
  /** 上午價格。未設定時是 `"0"`。 */
  morning: string;
  /** 下午價格。未設定時是 `"0"`。 */
  afternoon: string;
  /** 晚上價格。未設定時是 `"0"`。 */
  night: string;
};
export type RoomResponse = {
  /** 場地 id */
  id: number;
  /** 照片網址，可直接放進 `<img src>`。沒有時是空字串。 */
  roomImg: string;
  /** 場地名稱 */
  title: string;
  /** 場地說明文字 */
  desc: string;
  /** 樓層。自由文字，無固定值域。 */
  floor: string;
  /** 坪數 */
  area: number;
  /** 可容納人數 */
  capacity: number;
  /** 設備清單。沒有時是空陣列。 */
  facilities: string[];
  /** 三個時段的價格。值是字串不是數字。 */
  price: PriceResponse;
  /** 建立時間，格式 `yyyy-MM-dd HH:mm:ss`（不是 ISO 8601） */
  createdAt: string;
};
export type PaginationResponse = {
  /** 目前第幾頁，從 1 開始。 */
  page: number;
  /** 每頁幾筆。這是後端實際採用的值，不一定等於你送出的值。 */
  pageSize: number;
  /** 符合條件的總筆數（不是這一頁的筆數） */
  total: number;
  /** 總頁數。總筆數為 0 時是 0。 */
  totalPages: number;
};
export type ApiResponse = {
  /** 成功與否。前端的第一個判斷點。 */
  success: boolean;
  /** 成功時的資料本體。失敗時、或成功但無資料可回時不會出現。 */
  data?: RoomResponse;
  /** 分頁資訊。只有列表型端點會帶。 */
  pagination?: PaginationResponse;
  /** 中文訊息，可直接顯示給使用者。失敗時一定有。 */
  message?: string;
};
export type PriceRequest = {
  /** 上午價格 */
  morning?: number;
  /** 下午價格 */
  afternoon?: number;
  /** 晚上價格 */
  night?: number;
};
export type RoomCreateRequest = {
  /** 場地名稱。唯一必填欄位。 */
  title: string;
  /** 照片網址。建議填 `POST /api/uploads/images` 回傳的 url。 */
  roomImg?: string;
  /** 場地說明文字 */
  desc?: string;
  /** 樓層。自由文字，無固定值域。 */
  floor?: string;
  /** 坪數 */
  area?: number;
  /** 可容納人數 */
  capacity?: number;
  /** 設備清單。後端以逗號串接儲存，**名稱本身不能含逗號**。 */
  facilities?: string[];
  /** 三個時段的價格，送數字。整個物件可省略。 */
  price?: PriceRequest;
};
export type BookingCreateRequest = {
  /** 要預約哪一間棚 */
  roomId: number;
  /** 預約人姓名（顯示用，與登入帳號無關） */
  userName?: string;
  /** 預約日期，格式 `yyyy-MM-dd` */
  date: string;
  /** 時段。只能是三個小寫字串之一，大寫也不行。 */
  timeSlot: "morning" | "afternoon" | "night";
  /** 用途說明，給 admin 審核參考 */
  reason?: string;
};
export type RegisterRequest = {
  /** 登入帳號，不可重複。前後空白會自動去除。 */
  account: string;
  /** 密碼。目前沒有長度或複雜度限制。 */
  password: string;
};
export type LoginRequest = {
  /** 登入帳號。前後空白會自動去除。 */
  account: string;
  /** 密碼。區分大小寫。 */
  password: string;
};
export type RoomDescriptionRequest = {
  /** 場地名稱。名稱越具體，生成品質越好。 */
  title: string;
  /** 照片網址。必須是 `POST /api/uploads/images` 回傳的網址，後端要讀取圖片內容交給 AI。 */
  roomImg: string;
};
export type BookingReviewRequest = {
  /** 審核結果。`approved` 繼續佔用時段，`rejected` 釋出時段。送 `pending` 或其他值回 400。 */
  status: "approved" | "rejected";
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
  useGenerateRoomDescriptionMutation,
  useGetBookingQuery,
  useLazyGetBookingQuery,
  useCancelBookingMutation,
  useReviewBookingMutation,
  useGetSlotsQuery,
  useLazyGetSlotsQuery,
  useGetRoomOptionsQuery,
  useLazyGetRoomOptionsQuery,
} = injectedRtkApi;
