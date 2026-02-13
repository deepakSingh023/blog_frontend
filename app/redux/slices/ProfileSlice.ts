import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/app/api/axios";
import { Profile } from "@/app/types";
import type { RootState } from "@/app/redux/store";

interface ProfileState {
  data: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk<Profile, void, { state: RootState }>(
  "profile/fetch",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const res = await api.get<Profile>("/api/profile/getProfile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

export const updateProfile = createAsyncThunk<
  Profile,
  { bio?: string; image?: File },
  { state: RootState }
>(
  "profile/update",
  async ({ bio, image }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const formData = new FormData();
      
      if (bio) formData.append("bio", bio);
      if (image) formData.append("image", image);
      
      const res = await api.post<Profile>("/api/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch profile";
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to update profile";
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;