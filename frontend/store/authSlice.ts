import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import { API_ENDPOINTS } from "@/utils/endpoints"

export interface AuthState {
  gmail: string | null
  name: string | null
  refreshtoken: string | null
  authtoken: string | null
  isAuthenticated: boolean
  userId: string | null
  role: string | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  gmail: null,
  name: null,
  refreshtoken: null,
  authtoken: null,
  isAuthenticated: false,
  userId: null,
  role: null,
  loading: false,
  error: null,
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        return rejectWithValue(result.message || "Login failed")
      }
      return result.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Connection failed")
    }
  }
)

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, dispatch }) => {
    const state = getState() as any
    const refreshToken = state.auth.refreshtoken

    dispatch(logOut())

    if (refreshToken) {
      try {
        await fetch(`${API_BASE}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        })
      } catch (e) {
        console.error("Logout API call failed", e)
      }
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        gmail: string
        name: string
        refreshtoken: string
        authtoken: string
        userId: string
        role: string
      }>
    ) => {
      const { gmail, name, refreshtoken, authtoken, userId, role } = action.payload
      state.gmail = gmail
      state.name = name
      state.refreshtoken = refreshtoken
      state.authtoken = authtoken
      state.userId = userId
      state.role = role
      state.isAuthenticated = true
      state.error = null
    },
    logOut: (state) => {
      state.gmail = null
      state.name = null
      state.refreshtoken = null
      state.authtoken = null
      state.userId = null
      state.role = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { accessToken, refreshToken, user } = action.payload
        state.gmail = user.email
        state.name = user.name
        state.refreshtoken = refreshToken
        state.authtoken = accessToken
        state.userId = String(user.id)
        state.role = user.role
        state.isAuthenticated = true
        state.loading = false
        state.error = null

        // Persisted automatically by redux-persist
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { setCredentials, logOut, clearError } = authSlice.actions
export default authSlice.reducer
