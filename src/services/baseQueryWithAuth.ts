import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query'
import { logout } from '@/features/auth/authSlice'

export const SESSION_EXPIRED_PATH = '/login?expired=1'
export const SESSION_EXPIRED_MESSAGE = '登入已逾時，請重新登入'

const LOGIN_URL = '/api/auth/login'

type RawBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>

const getRequestUrl = (args: string | FetchArgs) => (typeof args === 'string' ? args : args.url)

/**
 * 包一層 baseQuery：已登入（有 token）的請求收到 401 代表登入逾時，
 * 統一清除登入狀態並導回登入頁。登入 API 本身的 401 是帳密錯誤，不處理。
 */
export const withSessionExpiry = (
  rawBaseQuery: RawBaseQuery,
  redirectToLogin: (path: string) => void = (path) => window.location.assign(path),
): RawBaseQuery => async (args, api, extraOptions) => {
  const hadToken = !!localStorage.getItem('token')
  const result = await rawBaseQuery(args, api, extraOptions)

  const isSessionExpired =
    result.error?.status === 401 && hadToken && getRequestUrl(args) !== LOGIN_URL
  if (isSessionExpired) {
    api.dispatch(logout())
    redirectToLogin(SESSION_EXPIRED_PATH)
  }
  return result
}
