import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "@/app/redux/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  image: string;
  likes: number;
  comments: number;
  createdAt: string;
}

interface PagedResponse {
  content: Blog[];
  cursor: string | null;
  hasMore: boolean;
}

interface BlogState {
  blogs: Blog[];
  loading: boolean;
  error: string | null;
  cursor: string | null;
  hasMore: boolean;
}

const initialState: BlogState = {
  blogs: [],
  loading: false,
  error: null,
  cursor: null,
  hasMore: true,
};

// Fetch all blogs
export const fetchBlogs = createAsyncThunk<
  PagedResponse,
  void,
  { state: RootState }
>(
  "blog/fetchBlogs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      if (!token) {
        throw new Error("No auth token found");
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/blog/getall`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: 10,
          },
        }
      );

      return {
        content: response.data.items || [],
        cursor: response.data.nextCursor || null,
        hasMore: response.data.nextCursor != null,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch blogs"
      );
    }
  }
);

// Create a new blog
export const createBlog = createAsyncThunk<
  Blog,
  {
    title: string;
    content: string;
    tags: string[];
    image: File;
  },
  { state: RootState }
>(
  "blog/createBlog",
  async (data, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      if (!token) {
        throw new Error("No auth token found");
      }

      const formData = new FormData();
      
      const blogData = {
        title: data.title,
        content: data.content,
        tags: data.tags,
      };

      formData.append("image", data.image);
      formData.append(
        "createBlog",
        new Blob([JSON.stringify(blogData)], { type: "application/json" })
      );

      const response = await axios.post<Blog>(
        `${API_BASE_URL}/api/blog/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create blog"
      );
    }
  }
);

// Update a blog
export const updateBlog = createAsyncThunk<
  Blog,
  {
    blogId: string;
    title: string;
    content: string;
    tags: string[];
    image?: File;
  },
  { state: RootState }
>(
  "blog/updateBlog",
  async (data, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      if (!token) {
        throw new Error("No auth token found");
      }

      const formData = new FormData();
      
      const updateBlogData = {
        blogId: data.blogId,
        title: data.title,
        content: data.content,
        tags: data.tags,
      };

      if (data.image) {
        formData.append("image", data.image);
      }
      
      formData.append(
        "updateBlog",
        new Blob([JSON.stringify(updateBlogData)], { type: "application/json" })
      );

      const response = await axios.put<Blog>(
        `${API_BASE_URL}/api/blog/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update blog"
      );
    }
  }
);

// Delete a blog
export const deleteBlog = createAsyncThunk<
  string,
  string,
  { state: RootState }
>(
  "blog/deleteBlog",
  async (blogId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.auth.token;

      if (!token) {
        throw new Error("No auth token found");
      }

      await axios.delete(
        `${API_BASE_URL}/api/blog/delete/${blogId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            blogId: blogId,
          },
        }
      );
      return blogId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete blog"
      );
    }
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogs: (state) => {
      state.blogs = [];
      state.cursor = null;
      state.hasMore = true;
    },
  },
  extraReducers: (builder) => {
    // Fetch blogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload.content || [];
        state.cursor = action.payload.cursor;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create blog
    builder
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.unshift(action.payload);
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update blog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.blogs.findIndex(
          (blog) => blog.id === action.payload.id
        );
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete blog
    builder
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = state.blogs.filter((blog) => blog.id !== action.payload);
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearBlogs } = blogSlice.actions;
export default blogSlice.reducer;