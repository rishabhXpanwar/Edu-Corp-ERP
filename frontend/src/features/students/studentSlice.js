import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';
import toast from 'react-hot-toast';

export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, classId, sectionId, search } = params;
      const queryParams = new URLSearchParams({ page, limit });
      if (classId) queryParams.append('classId', classId);
      if (sectionId) queryParams.append('sectionId', sectionId);
      if (search) queryParams.append('search', search);

      const response = await axiosInstance.get(`${ENDPOINTS.STUDENTS}?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch students' });
    }
  }
);

export const fetchStudentById = createAsyncThunk(
  'students/fetchStudentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.STUDENT_BY_ID(id));
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch student' });
    }
  }
);

export const createStudent = createAsyncThunk(
  'students/createStudent',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.STUDENTS, data);
      toast.success('Student admitted successfully');
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to admit student' });
    }
  }
);

export const updateStudent = createAsyncThunk(
  'students/updateStudent',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.STUDENT_BY_ID(id), data);
      toast.success('Student updated successfully');
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to update student' });
    }
  }
);

export const deactivateStudent = createAsyncThunk(
  'students/deactivateStudent',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.patch(ENDPOINTS.STUDENT_DEACTIVATE(id));
      toast.success('Student deactivated successfully');
      return id;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to deactivate student' });
    }
  }
);

const initialState = {
  students: [],
  selectedStudent: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
};

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchStudents
      .addCase(fetchStudents.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchStudents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // fetchStudentById
      .addCase(fetchStudentById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStudentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedStudent = action.payload;
      })
      .addCase(fetchStudentById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // createStudent
      .addCase(createStudent.fulfilled, (state, action) => {
        // Just invalidate list lightly or wait for refetch
      })
      
      // updateStudent
      .addCase(updateStudent.fulfilled, (state, action) => {
        if (state.selectedStudent && state.selectedStudent.student && state.selectedStudent.student._id === action.payload.student._id) {
            state.selectedStudent = action.payload;
        }
      })
      
      // deactivateStudent
      .addCase(deactivateStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(s => s._id !== action.payload);
        if (state.selectedStudent && state.selectedStudent.student && state.selectedStudent.student._id === action.payload) {
            state.selectedStudent.student.isActive = false;
        }
      });
  }
});

export default studentSlice.reducer;
