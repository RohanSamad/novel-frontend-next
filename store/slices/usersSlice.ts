import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  created_at: string;
  last_sign_in_at?: string;
}

interface UsersState {
  users: User[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  status: 'idle',
  error: null,
};

;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL;

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const users = response.data; // Expect [{ id, email, username, role, created_at, last_sign_in_at }]

      return users.map((user: any) => ({
        id: user.id.toString(), // Convert id to string to match User interface
        email: user.email,
        username: user.username,
        role: user.role || 'user',
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      })) as User[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch users');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'users/updateUserRole',
  async ({ userId, role }: { userId: string; role: 'user' | 'admin' }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append(userId, userId);
      formData.append('role', role);

      const response = await axios.post(`${API_BASE_URL}/api/users/role`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      const { userId: updatedUserId, role: updatedRole } = response.data; // Expect { userId, role }

      return { userId: updatedUserId.toString(), role: updatedRole };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update user role');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('userId', userId);

      const response = await axios.post(`${API_BASE_URL}/api/delete-users`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
        },
      });

      const { userId: deletedUserId } = response.data; // Expect { message, userId }

      return deletedUserId.toString(); // Convert to string to match User interface
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete user');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = 'succeeded';
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, role } = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.role = role;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default usersSlice.reducer;