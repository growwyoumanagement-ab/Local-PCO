// src/store/jobSlice.ts
// Redux slice for job state management

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import jobService, { Job } from '../services/jobService';
import { JOB_STATUS } from '../utils/constants';

/**
 * Job state interface
 */
interface JobState {
    // Current active job being worked on
    currentJob: Job | null;


    // Pending job requests (waiting for accept/reject)
    pendingRequests: Job[];

    // Active jobs currently being worked on (accepted/reached/in_progress)
    // FIX #9: was missing, partner had no visibility of in-flight jobs
    activeJobs: Job[];

    // Accepted scheduled appointments
    acceptedAppointments: Job[];

    // Job history (completed/cancelled)
    jobHistory: Job[];

    // Today's summary
    todaySummary: {
        totalJobs: number;
        completedJobs: number;
        pendingJobs: number;
        totalEarnings: number;
    } | null;

    // Loading and error states
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;

    // Pagination
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
    };
}

/**
 * Initial job state
 */
const initialState: JobState = {
    currentJob: null,
    pendingRequests: [],
    activeJobs: [],
    acceptedAppointments: [],
    jobHistory: [],
    todaySummary: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    pagination: {
        page: 1,
        limit: 10,
        totalCount: 0,
    },
};



/**
 * Async thunk to fetch pending job requests
 */
export const fetchPendingRequests = createAsyncThunk(
    'job/fetchPendingRequests',
    async (_, { rejectWithValue }) => {
        try {
            const jobs = await jobService.getPendingRequests();
            return jobs;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
        }
    }
);

/**
 * Async thunk to fetch active jobs (accepted/reached/in_progress)
 * FIX #9: Partner now has full visibility of their in-flight jobs
 */
export const fetchActiveJobs = createAsyncThunk(
    'job/fetchActiveJobs',
    async (_, { rejectWithValue }) => {
        try {
            const jobs = await jobService.getActiveJobs();
            return jobs;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch active jobs');
        }
    }
);

/**
 * Async thunk to fetch accepted scheduled appointments
 */
export const fetchAcceptedAppointments = createAsyncThunk(
    'job/fetchAcceptedAppointments',
    async (_, { rejectWithValue }) => {
        try {
            const appointments = await jobService.getAcceptedAppointments();
            return appointments;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
        }
    }
);

/**
 * Async thunk to fetch job by ID
 */
export const fetchJobById = createAsyncThunk(
    'job/fetchJobById',
    async (jobId: string, { rejectWithValue }) => {
        try {
            const job = await jobService.getJobById(jobId);
            return job;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch job');
        }
    }
);

/**
 * Async thunk to accept a job
 */
export const acceptJob = createAsyncThunk(
    'job/acceptJob',
    async (jobId: string, { rejectWithValue }) => {
        try {
            const job = await jobService.updateJobStatus(jobId, JOB_STATUS.ACCEPTED);
            return job;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to accept job');
        }
    }
);

/**
 * Async thunk to reject a job
 * FIX #4: Uses dedicated POST /jobs/:id/reject endpoint instead of updateJobStatus(CANCELLED).
 * This prevents partner rejection from permanently stranding the client's booking.
 */
export const rejectJob = createAsyncThunk(
    'job/rejectJob',
    async ({ jobId, reason }: { jobId: string; reason?: string }, { rejectWithValue }) => {
        try {
            await jobService.rejectJob(jobId, reason);
            return jobId;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to reject job');
        }
    }
);

/**
 * Async thunk to update job status
 */
export const updateJobStatus = createAsyncThunk(
    'job/updateJobStatus',
    async (
        { jobId, status, data }: { jobId: string; status: string; data?: { notes?: string; proofImages?: string[] } },
        { rejectWithValue }
    ) => {
        try {
            const job = await jobService.updateJobStatus(jobId, status, data);
            return job;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);



/**
 * Async thunk to complete a job
 */
export const completeJob = createAsyncThunk(
    'job/completeJob',
    async (
        { jobId, proofImages, notes }: { jobId: string; proofImages?: string[]; notes?: string },
        { rejectWithValue }
    ) => {
        try {
            const job = await jobService.completeJob(jobId, proofImages, notes);
            return job;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to complete job');
        }
    }
);

/**
 * Async thunk to fetch today's summary
 */
export const fetchTodaysSummary = createAsyncThunk(
    'job/fetchTodaysSummary',
    async (_, { rejectWithValue }) => {
        try {
            const summary = await jobService.getTodaysSummary();
            return summary;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
        }
    }
);

/**
 * Async thunk to fetch job history
 */
export const fetchJobHistory = createAsyncThunk(
    'job/fetchJobHistory',
    async (filters: { page?: number; limit?: number } | undefined, { rejectWithValue }) => {
        try {
            const response = await jobService.getJobHistory(filters);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
        }
    }
);

/**
 * Job slice with reducers and extra reducers
 */
const jobSlice = createSlice({
    name: 'job',
    initialState,
    reducers: {
        // Set current job
        setCurrentJob: (state, action: PayloadAction<Job | null>) => {
            state.currentJob = action.payload;
        },
        // Add a new pending request (from push notification/socket)
        addPendingRequest: (state, action: PayloadAction<Job>) => {
            state.pendingRequests.unshift(action.payload);
        },
        // Remove a pending request (timeout/handled)
        removePendingRequest: (state, action: PayloadAction<string>) => {
            state.pendingRequests = state.pendingRequests.filter(job => job.id !== action.payload);
        },
        // Clear job error
        clearJobError: (state) => {
            state.error = null;
        },
        // Reset job state
        resetJob: () => initialState,
    },
    extraReducers: (builder) => {

        // Fetch Pending Requests
        builder
            .addCase(fetchPendingRequests.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchPendingRequests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.pendingRequests = action.payload;
            })
            .addCase(fetchPendingRequests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Accepted Appointments
        builder
            .addCase(fetchAcceptedAppointments.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAcceptedAppointments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.acceptedAppointments = action.payload;
            })
            .addCase(fetchAcceptedAppointments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Active Jobs (accepted/reached/in_progress) — FIX #9
        builder
            .addCase(fetchActiveJobs.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchActiveJobs.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeJobs = action.payload;
            })
            .addCase(fetchActiveJobs.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });


        // Fetch Job By ID
        builder
            .addCase(fetchJobById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJobById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentJob = action.payload;
            })
            .addCase(fetchJobById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Accept Job
        builder
            .addCase(acceptJob.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(acceptJob.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.currentJob = action.payload;
                // Remove from pending requests
                state.pendingRequests = state.pendingRequests.filter(job => job.id !== action.payload.id);
            })
            .addCase(acceptJob.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        // Reject Job
        builder
            .addCase(rejectJob.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(rejectJob.fulfilled, (state, action) => {
                state.isUpdating = false;
                // Remove from pending requests
                state.pendingRequests = state.pendingRequests.filter(job => job.id !== action.payload);
            })
            .addCase(rejectJob.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        // Update Job Status
        builder
            .addCase(updateJobStatus.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(updateJobStatus.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.currentJob = action.payload;
            })
            .addCase(updateJobStatus.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        // Complete Job
        builder
            .addCase(completeJob.pending, (state) => {
                state.isUpdating = true;
            })
            .addCase(completeJob.fulfilled, (state, action) => {
                state.isUpdating = false;
                state.currentJob = null;
                // Remove from pending requests
                state.pendingRequests = state.pendingRequests.filter(job => job.id !== action.payload.id);
                // Add to history
                state.jobHistory.unshift(action.payload);
            })
            .addCase(completeJob.rejected, (state, action) => {
                state.isUpdating = false;
                state.error = action.payload as string;
            });

        // Fetch Today's Summary
        builder
            .addCase(fetchTodaysSummary.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchTodaysSummary.fulfilled, (state, action) => {
                state.isLoading = false;
                state.todaySummary = action.payload;
            })
            .addCase(fetchTodaysSummary.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch Job History
        builder
            .addCase(fetchJobHistory.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchJobHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.jobHistory = action.payload.jobs;
            })
            .addCase(fetchJobHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setCurrentJob,
    addPendingRequest,
    removePendingRequest,
    clearJobError,
    resetJob,
} = jobSlice.actions;
export default jobSlice.reducer;
