import api from '@/lib/Api';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import axios from 'axios';

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
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  status: 'idle',
  error: null,
};

// Safely access environment variable with fallback
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
          // 'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
          withCredentials: true,
      });

      const { user, token } = response.data; // Expect { user: { id, email, username, role, ... }, token }

      if (!user || !user.id || !user.email) {
        throw new Error('No user data returned');
      }

      // Store token for future authenticated requests
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      return {
        id: user.id.toString(), // Convert id to string to match User interface
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

      const { user, token } = response.data; // Expect { user: { id, email, username, role }, token }

      if (!user || !user.id || !user.email) {
        throw new Error('No user data returned');
      }

      // Store token for future authenticated requests
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));

      return {
        id: user.id.toString(), // Convert id to string to match User interface
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
  async (_, {  }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const response = await api.get(`${API_BASE_URL}/api/check-session`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
          withCredentials: true,
      });

      const user = response.data; // Expect { id, email, username, role }

      if (!user || !user.id || !user.email) {
        localStorage.removeItem('auth_token');
        return null;
      }

      return {
        id: user.id.toString(), // Convert id to string to match User interface
        email: user.email,
        username: user.username,
        role: user.role || 'user',
      };
    } catch (error: any) {
      localStorage.removeItem('auth_token');
      return null;
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      const token = localStorage.getItem('auth_token');
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
    } finally {
      localStorage.removeItem('auth_token');
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
    },
    clearAuthError: (state) => {
      state.error = null;
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
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
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
      })
      .addCase(checkSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.status = 'idle';
      })
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(logout.rejected, (state) => {
        state.status = 'idle';
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;