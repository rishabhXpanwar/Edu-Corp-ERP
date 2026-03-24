import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../services/endpoints';

export const fetchSalaries = createAsyncThunk(
  'salary/fetchSalaries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.SALARIES, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch salaries'
      );
    }
  }
);

export const fetchTeacherSalaries = createAsyncThunk(
  'salary/fetchTeacherSalaries',
  async (teacherId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.SALARIES_TEACHER(teacherId));
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch teacher salaries'
      );
    }
  }
);

export const createSalary = createAsyncThunk(
  'salary/createSalary',
  async (salaryData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.SALARIES, salaryData);
      toast.success(response.data.message || 'Salary created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create salary');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create salary'
      );
    }
  }
);

export const markSalaryPaid = createAsyncThunk(
  'salary/markSalaryPaid',
  async (salaryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.SALARY_PAID(salaryId));
      toast.success(response.data.message || 'Salary marked as paid');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update salary status');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update salary status'
      );
    }
  }
);

export const markSalaryUnpaid = createAsyncThunk(
  'salary/markSalaryUnpaid',
  async (salaryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.SALARY_UNPAID(salaryId));
      toast.success(response.data.message || 'Salary marked as unpaid');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update salary status');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update salary status'
      );
    }
  }
);

export const markSalaryDelayed = createAsyncThunk(
  'salary/markSalaryDelayed',
  async (salaryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.SALARY_DELAYED(salaryId));
      toast.success(response.data.message || 'Salary marked as delayed');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update salary status');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update salary status'
      );
    }
  }
);

export const applyIncrement = createAsyncThunk(
  'salary/applyIncrement',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.SALARY_INCREMENT, data);
      toast.success(response.data.message || 'Increment applied successfully');
      
      // We refetch the current page to get the updated list
      if (data.page && data.limit && data.month && data.year) {
         dispatch(fetchSalaries({
            page: data.page,
            limit: data.limit,
            month: data.month,
            year: data.year,
         }));
      }

      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply increment');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to apply increment'
      );
    }
  }
);

const initialState = {
  items: [],
  teacherSalaries: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

const salarySlice = createSlice({
  name: 'salary',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchSalaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchTeacherSalaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherSalaries.fulfilled, (state, action) => {
        state.loading = false;
        state.teacherSalaries = action.payload.salaries || [];
      })
      .addCase(fetchTeacherSalaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createSalary.fulfilled, (state, action) => {
        if (action.payload.salary) {
          state.items.unshift(action.payload.salary);
        }
      })

      .addCase(markSalaryPaid.fulfilled, (state, action) => {
        const updatedSalary = action.payload.salary || action.payload;
        const index = state.items.findIndex((salary) => salary._id === updatedSalary._id);
        if (index !== -1) {
          state.items[index] = updatedSalary;
        }

        const teacherIndex = state.teacherSalaries.findIndex(
          (salary) => salary._id === updatedSalary._id
        );
        if (teacherIndex !== -1) {
          state.teacherSalaries[teacherIndex] = updatedSalary;
        }
      })

      .addCase(markSalaryUnpaid.fulfilled, (state, action) => {
        const updatedSalary = action.payload.salary || action.payload;
        const index = state.items.findIndex((salary) => salary._id === updatedSalary._id);
        if (index !== -1) {
          state.items[index] = updatedSalary;
        }

        const teacherIndex = state.teacherSalaries.findIndex(
          (salary) => salary._id === updatedSalary._id
        );
        if (teacherIndex !== -1) {
          state.teacherSalaries[teacherIndex] = updatedSalary;
        }
      })

      .addCase(markSalaryDelayed.fulfilled, (state, action) => {
        const updatedSalary = action.payload.salary || action.payload;
        const index = state.items.findIndex((salary) => salary._id === updatedSalary._id);
        if (index !== -1) {
          state.items[index] = updatedSalary;
        }

        const teacherIndex = state.teacherSalaries.findIndex(
          (salary) => salary._id === updatedSalary._id
        );
        if (teacherIndex !== -1) {
          state.teacherSalaries[teacherIndex] = updatedSalary;
        }
      })
      
      .addCase(applyIncrement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyIncrement.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(applyIncrement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default salarySlice.reducer;
