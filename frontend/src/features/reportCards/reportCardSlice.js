import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../services/endpoints';
import toast from 'react-hot-toast';

const initialState = {
  loading: false,
  error: null,
};

export const downloadReportCard = createAsyncThunk(
  'reportCard/download',
  async ({ studentId, examId, filename }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance({
        url: ENDPOINTS.REPORT_CARD(studentId, examId),
        method: 'GET',
        responseType: 'blob', // Important for downloading PDF
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `report-card-${studentId}-${examId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report card downloaded successfully');
      return true;
    } catch (error) {
      toast.error('Failed to download report card. Marks may not be published yet.');
      return rejectWithValue(error.message);
    }
  }
);

const reportCardSlice = createSlice({
  name: 'reportCard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(downloadReportCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadReportCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadReportCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = reportCardSlice.actions;

export default reportCardSlice.reducer;
