import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import { withSessionExpiry, SESSION_EXPIRED_PATH } from './baseQueryWithAuth'

const makeApi = () => {
  const dispatch = jest.fn()
  return { api: { dispatch } as unknown as BaseQueryApi, dispatch }
}

describe('withSessionExpiry', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('token', 'old-token')
    localStorage.setItem('user', '{"id":1}')
  })

  it('已登入收到 401：清登入狀態並導回登入頁', async () => {
    const raw = jest.fn().mockResolvedValue({ error: { status: 401, data: {} } })
    const redirect = jest.fn()
    const { api, dispatch } = makeApi()

    const result = await withSessionExpiry(raw, redirect)('/api/bookings', api, {})

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'auth/logout' }))
    expect(redirect).toHaveBeenCalledWith(SESSION_EXPIRED_PATH)
    expect(result.error?.status).toBe(401)
  })

  it('500 錯誤：不清狀態、不導頁，原樣回傳', async () => {
    const error = { status: 500, data: { message: '伺服器錯誤' } }
    const raw = jest.fn().mockResolvedValue({ error })
    const redirect = jest.fn()
    const { api, dispatch } = makeApi()

    const result = await withSessionExpiry(raw, redirect)('/api/bookings', api, {})

    expect(dispatch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
    expect(result.error).toEqual(error)
  })

  it('登入 API 的 401（帳密錯誤）：不當成逾時', async () => {
    const raw = jest.fn().mockResolvedValue({ error: { status: 401, data: { message: '帳號或密碼錯誤' } } })
    const redirect = jest.fn()
    const { api, dispatch } = makeApi()

    await withSessionExpiry(raw, redirect)({ url: '/api/auth/login', method: 'POST' }, api, {})

    expect(dispatch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('未登入（沒有 token）收到 401：不導頁', async () => {
    localStorage.clear()
    const raw = jest.fn().mockResolvedValue({ error: { status: 401, data: {} } })
    const redirect = jest.fn()
    const { api, dispatch } = makeApi()

    await withSessionExpiry(raw, redirect)('/api/rooms', api, {})

    expect(dispatch).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})
