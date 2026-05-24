import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export const becomeOrganizer = createAsyncThunk('organizer/become', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/organizer/become', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const fetchOrganizerStats = createAsyncThunk('organizer/stats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/organizer/stats');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrganizerEvents = createAsyncThunk('organizer/events', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/organizer/events', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrganizerBookings = createAsyncThunk('organizer/bookings', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/organizer/bookings', { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const organizerSlice = createSlice({
  name: 'organizer',
  initialState: {
    stats: null,
    events: [],
    bookings: [],
    pagination: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(becomeOrganizer.pending, (state) => { state.loading = true; })
      .addCase(becomeOrganizer.fulfilled, (state, action) => {
        state.loading = false;
        toast.success('🎉 You are now an organizer! Refresh to see your dashboard.');
      })
      .addCase(becomeOrganizer.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })
      .addCase(fetchOrganizerStats.pending, (state) => { state.loading = true; })
      .addCase(fetchOrganizerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.events = action.payload.myEvents;
      })
      .addCase(fetchOrganizerEvents.fulfilled, (state, action) => {
        state.events = action.payload.events;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrganizerBookings.fulfilled, (state, action) => {
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      });
  },
});

export default organizerSlice.reducer;
