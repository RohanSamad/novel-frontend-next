import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ThemeState {
  isDarkMode: boolean;
}

// Helper function to load theme from localStorage
const loadThemeFromStorage = (): boolean => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  }
  return false; // Default to light mode on server
};

// Load theme from localStorage on initialization
const initialState: ThemeState = {
  isDarkMode: loadThemeFromStorage(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload ? 'dark' : 'light');
      }
    },
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
      }
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;