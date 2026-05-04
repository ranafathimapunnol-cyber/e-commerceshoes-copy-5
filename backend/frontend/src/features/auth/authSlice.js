import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { login } from './authAPI'

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, thunkAPI) => {
    try {
      const data = await login(userData)
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',

  initialState: {
    access: localStorage.getItem('access') || null,
    refresh: localStorage.getItem('refresh') || null,
    loading: false,
    error: null,
  },

  reducers: {
    logout: (state) => {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')

      state.access = null
      state.refresh = null
    }
  },

  extraReducers: (builder) => {
    builder

      .addCase(loginUser.pending, (state) => {
        state.loading = true
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false

        state.access = action.payload.access
        state.refresh = action.payload.refresh

        // ✅ SAVE TOKENS PROPERLY
        localStorage.setItem('access', action.payload.access)
        localStorage.setItem('refresh', action.payload.refresh)
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer