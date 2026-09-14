import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  id: number | null
  account: string | null
  role: 'user' | 'admin' | null
  isLoggedIn: boolean
}

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
})()

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  id: storedUser?.id ?? null,
  account: storedUser?.account ?? null,
  role: storedUser?.role ?? null,
  isLoggedIn: !!localStorage.getItem('token'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ id: number; account: string; role: 'user' | 'admin'; token: string }>
    ) {
      const { id, account, role, token } = action.payload
      state.id = id
      state.account = account
      state.role = role
      state.token = token
      state.isLoggedIn = true
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify({ id, account, role }))
    },
    logout(state) {
      state.token = null
      state.id = null
      state.account = null
      state.role = null
      state.isLoggedIn = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
