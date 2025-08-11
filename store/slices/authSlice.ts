import api from '@/lib/Api';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem } from '@/hooks/useLocalStorage';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  status: 'idle',
  error: null,
  isInitialized: false,
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);

      const response = await api.post(`${API_BASE_URL}/api/login`, formData, {
        headers: {
          Accept: 'application/json',
        },
        withCredentials: true,
      });

      const { user, token } = response.data;

      if (!user || !user.id || !user.email) {
        throw new Error('No user data returned');
      }

      setLocalStorageItem('auth_token', token);
      setLocalStorageItem('auth_user', JSON.stringify(user));

      return {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        role: user.role || 'user',
      };
    } catch (error: any) {
      if (error.response?.data?.message?.includes('Invalid credentials')) {
        return rejectWithValue('Incorrect email or password');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      formData.append('password_confirmation', password);

      const response = await api.post(`${API_BASE_URL}/api/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
        withCredentials: true,
      });

      const { user, token } = response.data;

      if (!user || !user.id || !user.email) {
        throw new Error('No user data returned');
      }

      setLocalStorageItem('auth_token', token);
      setLocalStorageItem('auth_user', JSON.stringify(user));

      return {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        role: user.role || 'user',
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
    }
  }
);

export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const token = getLocalStorageItem('auth_token');
      const storedUser = getLocalStorageItem('auth_user');
      
      if (!token) {
        return null;
      }

      // Try to use stored user data as fallback
      let fallbackUser = null;
      if (storedUser) {
        try {
          fallbackUser = JSON.parse(storedUser);
        } catch (e) {
          // Invalid stored data, ignore
        }
      }

      const response = await api.get(`${API_BASE_URL}/api/check-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        withCredentials: true,
      });

      const user = response.data;

      if (!user || !user.id || !user.email) {
        // If we have valid fallback user data, use it instead of clearing everything
        if (fallbackUser && fallbackUser.id && fallbackUser.email) {
          return {
            id: fallbackUser.id.toString(),
            email: fallbackUser.email,
            username: fallbackUser.username,
            role: fallbackUser.role || 'user',
          };
        }
        
        removeLocalStorageItem('auth_token');
        removeLocalStorageItem('auth_user');
        return null;
      }

      // Update localStorage with fresh user data
      setLocalStorageItem('auth_user', JSON.stringify(user));

      return {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        role: user.role || 'user',
      };
    } catch (error: any) {
      // More conservative approach - don't clear localStorage immediately on network errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        removeLocalStorageItem('auth_token');
        removeLocalStorageItem('auth_user');
        return rejectWithValue('Session expired');
      }
      
      // For other errors (network issues, server errors), try to use stored data
      const storedUser = getLocalStorageItem('auth_user');
      if (storedUser) {
        try {
          const fallbackUser = JSON.parse(storedUser);
          if (fallbackUser && fallbackUser.id && fallbackUser.email) {
            return {
              id: fallbackUser.id.toString(),
              email: fallbackUser.email,
              username: fallbackUser.username,
              role: fallbackUser.role || 'user',
            };
          }
        } catch (e) {
          // Invalid stored data
        }
      }
      
      removeLocalStorageItem('auth_token');
      removeLocalStorageItem('auth_user');
      return rejectWithValue(error.response?.data?.message || 'Session validation failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      const token = getLocalStorageItem('auth_token');
      if (token) {
        await api.post(
          `${API_BASE_URL}/api/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
            withCredentials: true,
          }
        );
      }
    } catch (error) {
      // Even if logout API fails, we still want to clear local state
    } finally {
      removeLocalStorageItem('auth_token');
      removeLocalStorageItem('auth_user');
      dispatch(authSlice.actions.logout());
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.status = 'idle';
      state.error = null;
      state.isInitialized = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
    restoreFromStorage: (state) => {
      try {
        const token = getLocalStorageItem('auth_token');
        const storedUser = getLocalStorageItem('auth_user');
        
        if (token && storedUser) {
          const user = JSON.parse(storedUser);
          if (user && user.id && user.email) {
            state.isAuthenticated = true;
            state.user = {
              id: user.id.toString(),
              email: user.email,
              username: user.username,
              role: user.role || 'user',
            };
            state.status = 'succeeded';
          }
        }
      } catch (error) {
        // Invalid stored data, ignore
      } finally {
        state.isInitialized = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isAuthenticated = true;
        state.user = action.payload;
        state.status = 'succeeded';
        state.isInitialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isInitialized = true;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isInitialized = true;
      })
      .addCase(checkSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.status = 'succeeded';
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.status = 'idle';
        }
        state.isInitialized = true;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = 'failed';
        state.error = action.payload as string;
        state.isInitialized = true;
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
        state.isInitialized = true;
      })
      .addCase(logout.rejected, (state) => {
        state.status = 'idle';
        state.isInitialized = true;
      });
  },
});

export const { clearAuthError, setInitialized, restoreFromStorage } = authSlice.actions;
export default authSlice.reducer;