import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/emptyApi";
import authReducer from "@/features/auth/authSlice";

/** 以全新的 store 與 MemoryRouter 包住元件，供測試使用 */
export const renderWithProviders = (ui: ReactElement, { route = "/" } = {}) => {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  );
};
