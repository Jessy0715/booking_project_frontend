import { api } from "./emptyApi";
import "./bookingApi.generated";

export const bookingTagsApi = api.enhanceEndpoints({
  endpoints: {
    searchBookings: { providesTags: ["Booking"] },
    cancelBooking: { invalidatesTags: ["Booking"] },
  },
});
