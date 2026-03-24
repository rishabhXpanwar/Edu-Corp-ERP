import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';
import toast from 'react-hot-toast';

export const fetchTeachers = createAsyncThunk(
  'teachers/fetchTeachers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, search } = params;
      const queryParams = new URLSearchParams({ page, limit });
      if (search) queryParams.append('search', search);

      const response = await axiosInstance.get(`${ENDPOINTS.TEACHERS}?${queryParams.toString()}`);
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch teachers' });
    }
  }
);

export const fetchTeacherById = createAsyncThunk(
  'teachers/fetchTeacherById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.TEACHER_BY_ID(id));
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch teacher' });
    }
  }
);

export const createTeacher = createAsyncThunk(
  'teachers/createTeacher',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.TEACHERS, data);
      toast.success('Teacher created successfully');
      return response.data.data?.teacher || response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      toast.error(error.response?.data?.message || 'Failed to create teacher');
      return rejectWithValue(error.response?.data || { message: 'Failed to create teacher' });
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'teachers/updateUserStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.USER_STATUS(id), { isActive });
      toast.success(isActive ? 'Teacher activated successfully' : 'Teacher deactivated successfully');
      return { id, isActive, data: response.data.data };
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to update teacher status' });
    }
  }
);

const initialState = {
  teachers: [],
  selectedTeacher: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
};

const teacherSlice = createSlice({
  name: 'teachers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchTeachers
      .addCase(fetchTeachers.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload.items;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          totalPages: action.payload.totalPages
        };
      })
      .addCase(fetchTeachers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // fetchTeacherById
      .addCase(fetchTeacherById.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTeacherById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTeacher = action.payload;
      })
      .addCase(fetchTeacherById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // createTeacher
      .addCase(createTeacher.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          state.teachers.unshift(action.payload);
        }
      })
      
      // updateUserStatus
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { id, isActive } = action.payload;
        const teacher = state.teachers.find(t => t._id === id);
        if (teacher) {
          teacher.isActive = isActive;
        }
        if (state.selectedTeacher && state.selectedTeacher._id === id) {
          state.selectedTeacher.isActive = isActive;
        }
      });
  }
});

export default teacherSlice.reducer;
