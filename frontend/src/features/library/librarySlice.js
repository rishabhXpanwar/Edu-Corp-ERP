import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';

// Fetch all books with pagination, search, category filter
export const fetchBooks = createAsyncThunk(
  'library/fetchBooks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.LIBRARY, { params });
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch books';
      return rejectWithValue(message);
    }
  }
);

// Fetch a single book by ID
export const fetchBook = createAsyncThunk(
  'library/fetchBook',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.LIBRARY_BY_ID(bookId));
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch book';
      return rejectWithValue(message);
    }
  }
);

// Create a new book
export const createBook = createAsyncThunk(
  'library/createBook',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.LIBRARY, payload);
      toast.success(response.data.message || 'Book added successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add book';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update a book
export const updateBook = createAsyncThunk(
  'library/updateBook',
  async ({ bookId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.LIBRARY_BY_ID(bookId), payload);
      toast.success(response.data.message || 'Book updated successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update book';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete a book
export const deleteBook = createAsyncThunk(
  'library/deleteBook',
  async (bookId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(ENDPOINTS.LIBRARY_BY_ID(bookId));
      toast.success(response.data.message || 'Book deleted successfully');
      return { bookId };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete book';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Issue a book to a user
export const issueBook = createAsyncThunk(
  'library/issueBook',
  async ({ bookId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.LIBRARY_ISSUE(bookId), payload);
      toast.success(response.data.message || 'Book issued successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to issue book';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Return a book from a user
export const returnBook = createAsyncThunk(
  'library/returnBook',
  async ({ bookId, userId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.LIBRARY_RETURN(bookId), { userId });
      toast.success(response.data.message || 'Book returned successfully');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to return book';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  items: [],
  selectedItem: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    clearLibraryError: (state) => {
      state.error = null;
    },
    clearSelectedBook: (state) => {
      state.selectedItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBooks
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchBook
      .addCase(fetchBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBook.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload.book || null;
      })
      .addCase(fetchBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createBook
      .addCase(createBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.book) {
          state.items.unshift(action.payload.book);
          state.pagination.total += 1;
        }
      })
      .addCase(createBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateBook
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBook = action.payload.book;
        if (updatedBook) {
          const index = state.items.findIndex((item) => item._id === updatedBook._id);
          if (index !== -1) {
            state.items[index] = updatedBook;
          }
          if (state.selectedItem?._id === updatedBook._id) {
            state.selectedItem = updatedBook;
          }
        }
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteBook
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        const { bookId } = action.payload;
        state.items = state.items.filter((item) => item._id !== bookId);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.selectedItem?._id === bookId) {
          state.selectedItem = null;
        }
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // issueBook
      .addCase(issueBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(issueBook.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBook = action.payload.book;
        if (updatedBook) {
          const index = state.items.findIndex((item) => item._id === updatedBook._id);
          if (index !== -1) {
            state.items[index] = {
              ...state.items[index],
              availableCopies: updatedBook.availableCopies,
              status: updatedBook.status,
            };
          }
          if (state.selectedItem?._id === updatedBook._id) {
            state.selectedItem = updatedBook;
          }
        }
      })
      .addCase(issueBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // returnBook
      .addCase(returnBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBook = action.payload.book;
        if (updatedBook) {
          const index = state.items.findIndex((item) => item._id === updatedBook._id);
          if (index !== -1) {
            state.items[index] = {
              ...state.items[index],
              availableCopies: updatedBook.availableCopies,
              status: updatedBook.status,
            };
          }
          if (state.selectedItem?._id === updatedBook._id) {
            state.selectedItem = updatedBook;
          }
        }
      })
      .addCase(returnBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearLibraryError, clearSelectedBook } = librarySlice.actions;

export default librarySlice.reducer;
