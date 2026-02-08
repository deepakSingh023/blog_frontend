import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/app/api/axios";
import { AuthResponse, User } from "@/app/types";
import type { RootState } from "@/app/redux/store";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Helper functions to manage localStorage
const loadAuthFromStorage = (): Pick<AuthState, 'user' | 'token'> => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    return { user, token };
  } catch (error) {
    console.error('Error loading auth from storage:', error);
    return { user: null, token: null };
  }
};

const saveAuthToStorage = (token: string, user: User) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving auth to storage:', error);
  }
};

const clearAuthFromStorage = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error clearing auth from storage:', error);
  }
};

// Initialize state with data from localStorage
const { user: storedUser, token: storedToken } = loadAuthFromStorage();

const initialState: AuthState = {
  user: storedUser,
  token: storedToken,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { state: RootState; rejectValue: string }
>(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post<AuthResponse>("/auth/login", data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const registerUser = createAsyncThunk<
  AuthResponse,
  { username: string; email: string; password: string },
  { state: RootState; rejectValue: string }
>(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post<AuthResponse>("/auth/register", data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
      clearAuthFromStorage();
    },
    resetAuthState(state) {
      state.loading = false;
      state.error = null;
    },
    restoreAuth(state) {
      const { user, token } = loadAuthFromStorage();
      state.user = user;
      state.token = token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.token = action.payload.token;
        
        const user: User = {
          email: action.payload.email,
          id: action.payload.id,
          username: action.payload.username,
          role: action.payload.role,
        };
        
        state.user = user;
        saveAuthToStorage(action.payload.token, user);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Registration failed";
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.token = action.payload.token;
        
        const user: User = {
          id: action.payload.id,
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
        };
        
        state.user = user;
        saveAuthToStorage(action.payload.token, user);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Login failed";
      });
  },
});

export const { logout, resetAuthState, restoreAuth } = authSlice.actions;
export default authSlice.reducer;