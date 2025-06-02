import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApi } from 'services/api';

export const fetchMeetingData = createAsyncThunk(
    'meeting/fetchMeetingData',
    async () => {
        try {
            const response = await getApi('api/meeting');
            return { data: response.data }; // <-- Fix here
        } catch (error) {
            console.error("Error fetching meeting data:", error);
            throw error;
        }
    }
);

const meetingSlice = createSlice({
    name: 'meeting',
    initialState: {
        data: [],
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMeetingData.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMeetingData.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload.data;
                state.error = null;
            })
            .addCase(fetchMeetingData.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    },
});

export default meetingSlice.reducer;