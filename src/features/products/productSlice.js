import {
  createSlice,
  createAsyncThunk
} from '@reduxjs/toolkit'

import { fetchProducts } from './productAPI'


export const getProducts = createAsyncThunk(

  'products/getProducts',

  async (_, thunkAPI) => {

    try {

      return await fetchProducts()

    } catch (error) {

      return thunkAPI.rejectWithValue(
        error.response.data
      )
    }
  }
)


const productSlice = createSlice({

  name: 'products',

  initialState: {

    products: [],

    loading: false,

    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(getProducts.pending, (state) => {

        state.loading = true
      })

      .addCase(getProducts.fulfilled, (state, action) => {

        state.loading = false

        state.products = action.payload
      })

      .addCase(getProducts.rejected, (state, action) => {

        state.loading = false

        state.error = action.payload
      })
  }
})

export default productSlice.reducer