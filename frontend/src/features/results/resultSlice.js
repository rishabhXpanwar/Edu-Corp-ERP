import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../services/endpoints';
import toast from 'react-hot-toast';

export const fetchStudentResults = createAsyncThunk(
  'result/fetchStudentResults',
  async ({ studentId, examId }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.MARKS_STUDENT_EXAM(studentId, examId));
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch student results');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

const initialState = {
  studentResults: [],
  loading: false,
  error: null,
};

const resultSlice = createSlice({
  name: 'result',
  initialState,
  reducers: {
    clearResultData(state) {
      state.studentResults = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentResults.fulfilled, (state, action) => {
        state.loading = false;
        state.studentResults = action.payload.marks || [];
      })
      .addCase(fetchStudentResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearResultData } = resultSlice.actions;
export default resultSlice.reducer;
