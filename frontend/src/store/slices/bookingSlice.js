import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const fetchMyBookings = createAsyncThunk('bookings/fetchMy', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/bookings/my', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchBooking = createAsyncThunk('bookings/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const cancelBooking = createAsyncThunk('bookings/cancel', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/bookings/${id}/cancel`);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createOrder = createAsyncThunk('bookings/createOrder', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/payments/create-order', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create order');
  }
});

export const verifyPayment = createAsyncThunk('bookings/verifyPayment', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/payments/verify', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Payment verification failed');
  }
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    bookings: [],
    booking: null,
    pagination: null,
    loading: false,
    paymentLoading: false,
    error: null,
    orderData: null,
  },
  reducers: {
    clearBooking: (state) => { state.booking = null; state.orderData = null; },
    setOrderData: (state, action) => { state.orderData = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => { state.loading = true; })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.booking = action.payload.booking;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex(b => b._id === action.payload.booking._id);
        if (idx !== -1) state.bookings[idx] = action.payload.booking;
        toast.success('Booking cancelled successfully');
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        toast.error(action.payload);
      })
      .addCase(createOrder.pending, (state) => { state.paymentLoading = true; })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.orderData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.paymentLoading = false;
        const msg = action.payload || 'Failed to create order';
        // Show hint if Razorpay not configured
        if (msg.toLowerCase().includes('not configured') || msg.toLowerCase().includes('api key')) {
          toast.error('💳 Razorpay not configured. Add your API keys to backend/.env', { duration: 6000 });
        } else {
          toast.error(msg);
        }
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.booking = action.payload.booking;
        toast.success('Payment successful! Booking confirmed 🎉');
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        toast.error(action.payload);
      });
  },
});

export const { clearBooking, setOrderData } = bookingSlice.actions;
export default bookingSlice.reducer;
