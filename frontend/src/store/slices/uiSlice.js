import { createSlice } from '@reduxjs/toolkit';

const getInitialDarkMode = () => {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) return saved === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: getInitialDarkMode(),
    sidebarOpen: false,
    ticketModalOpen: false,
    selectedEvent: null,
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload);
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    openTicketModal: (state, action) => {
      state.ticketModalOpen = true;
      state.selectedEvent = action.payload;
    },
    closeTicketModal: (state) => {
      state.ticketModalOpen = false;
      state.selectedEvent = null;
    },
  },
});

export const { toggleDarkMode, setDarkMode, toggleSidebar, openTicketModal, closeTicketModal } = uiSlice.actions;
export default uiSlice.reducer;
