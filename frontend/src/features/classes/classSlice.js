import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance.js';
import { ENDPOINTS } from '../../services/endpoints.js';
import toast from 'react-hot-toast';

export const fetchAcademicYears = createAsyncThunk(
  'classes/fetchAcademicYears',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.ACADEMIC_YEARS);
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch academic years' });
    }
  }
);

export const createAcademicYear = createAsyncThunk(
  'classes/createAcademicYear',
  async (yearData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.ACADEMIC_YEARS, yearData);
      toast.success('Academic Year created successfully');
      return response.data.data?.academicYear || response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to create academic year' });
    }
  }
);

export const setCurrentAcademicYear = createAsyncThunk(
  'classes/setCurrentAcademicYear',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(ENDPOINTS.ACADEMIC_YEAR_CURRENT(id));
      toast.success('Current academic year updated');
      return response.data.data?.academicYear || { _id: id, isCurrent: true };
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to set current academic year' });
    }
  }
);

export const fetchClasses = createAsyncThunk(
  'classes/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.CLASSES);
      return response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch classes' });
    }
  }
);

export const createClass = createAsyncThunk(
  'classes/createClass',
  async (classData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.CLASSES, classData);
      toast.success('Class created successfully');
      return response.data.data?.class || response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to create class' });
    }
  }
);

export const updateClass = createAsyncThunk(
  'classes/updateClass',
  async ({ id, ...classData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.CLASS_BY_ID(id), classData);
      toast.success('Class updated successfully');
      return response.data.data?.class || response.data.data;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to update class' });
    }
  }
);

export const deleteClass = createAsyncThunk(
  'classes/deleteClass',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(ENDPOINTS.CLASS_BY_ID(id));
      toast.success('Class deleted successfully');
      return id;
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to delete class' });
    }
  }
);

export const createSection = createAsyncThunk(
  'classes/createSection',
  async ({ classId, sectionData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(ENDPOINTS.SECTIONS(classId), sectionData);
      toast.success('Section created successfully');
      return { classId, section: response.data.data?.section || response.data.data };
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to create section' });
    }
  }
);

export const updateSection = createAsyncThunk(
  'classes/updateSection',
  async ({ classId, sectionId, ...sectionData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(ENDPOINTS.SECTION_BY_ID(classId, sectionId), sectionData);
      toast.success('Section updated successfully');
      return {
        classId,
        sectionId,
        updatedSection: response.data.data?.section || response.data.data,
      };
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to update section' });
    }
  }
);

export const deleteSection = createAsyncThunk(
  'classes/deleteSection',
  async ({ classId, sectionId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(ENDPOINTS.SECTION_BY_ID(classId, sectionId));
      toast.success('Section deleted successfully');
      return { classId, sectionId };
    } catch (error) {
      if (!error.response) toast.error('Network Error');
      return rejectWithValue(error.response?.data || { message: 'Failed to delete section' });
    }
  }
);

const initialState = {
  classes: [],
  academicYears: [],
  currentYear: null,
  loading: false,
  error: null
};

const classSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchAcademicYears
      .addCase(fetchAcademicYears.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAcademicYears.fulfilled, (state, action) => {
        const years = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.academicYears)
            ? action.payload.academicYears
            : [];

        state.loading = false;
        state.academicYears = years;
        state.currentYear = years.find((year) => year.isCurrent) || null;
      })
      .addCase(fetchAcademicYears.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // createAcademicYear
      .addCase(createAcademicYear.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          state.academicYears.push(action.payload);
        }
      })
      
      // setCurrentAcademicYear
      .addCase(setCurrentAcademicYear.fulfilled, (state, action) => {
        const currentYearId = action.payload?._id || action.payload?.id || action.payload;
        state.academicYears.forEach((year) => {
          year.isCurrent = year._id === currentYearId;
        });
        state.currentYear = state.academicYears.find((year) => year.isCurrent) || null;
      })

      // fetchClasses
      .addCase(fetchClasses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.loading = false;
        state.classes = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.classes)
            ? action.payload.classes
            : [];
      })
      .addCase(fetchClasses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // createClass
      .addCase(createClass.fulfilled, (state, action) => {
        if (action.payload && action.payload._id) {
          state.classes.push(action.payload);
        }
      })
      
      // updateClass
      .addCase(updateClass.fulfilled, (state, action) => {
        const index = state.classes.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.classes[index] = action.payload;
        }
      })
      
      // deleteClass
      .addCase(deleteClass.fulfilled, (state, action) => {
        state.classes = state.classes.filter(c => c._id !== action.payload);
      })
      
      // createSection
      .addCase(createSection.fulfilled, (state, action) => {
        const classObj = state.classes.find(c => c._id === action.payload.classId);
        if (classObj) {
          if (!classObj.sections) classObj.sections = [];
          classObj.sections.push(action.payload.section);
        }
      })
      
      // updateSection
      .addCase(updateSection.fulfilled, (state, action) => {
        const classObj = state.classes.find(c => c._id === action.payload.classId);
        if (classObj && Array.isArray(classObj.sections)) {
          const secIndex = classObj.sections.findIndex(s => s._id === action.payload.sectionId);
          if (secIndex !== -1) {
            classObj.sections[secIndex] = action.payload.updatedSection;
          }
        }
      })

      // deleteSection
      .addCase(deleteSection.fulfilled, (state, action) => {
        const classObj = state.classes.find(c => c._id === action.payload.classId);
        if (classObj && classObj.sections) {
          classObj.sections = classObj.sections.filter(s => s._id !== action.payload.sectionId);
        }
      });
  }
});

export default classSlice.reducer;
