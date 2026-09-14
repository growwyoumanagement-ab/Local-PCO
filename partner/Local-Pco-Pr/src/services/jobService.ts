// src/services/jobService.ts
// Job management service for fetching, accepting, rejecting, and updating jobs

import api from './api';
import { JOB_STATUS } from '../utils/constants';

/**
 * Job interface representing a service job
 */
export interface Job {
    id: string;
    _id?: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    clientAvatar?: string;
    serviceType: string;
    serviceCategory: string;
    description?: string;
    notes?: string;

    // Location details
    pickupAddress: string;
    pickupLatitude: number;
    pickupLongitude: number;
    distance: number; // in meters

    // Timing
    scheduledAt?: string;
    acceptedAt?: string;
    reachedAt?: string;
    startedAt?: string;
    completedAt?: string;
    createdAt: string;

    // Status and pricing
    status: string;
    estimatedPrice: number;
    finalPrice?: number;

    // Partner info
    partnerEarnings?: number;

    // Proof of completion
    proofImages?: string[];
    completionNotes?: string;
    bookingType?: 'instant' | 'appointment' | 'call_log';
}

/**
 * Job list response
 */
interface JobListResponse {
    success: boolean;
    data: {
        jobs: Job[];
        totalCount: number;
        page: number;
        limit: number;
    };
}

/**
 * Single job response
 */
interface JobResponse {
    success: boolean;
    data: Job;
    message?: string;
}

/**
 * Job filters for list queries
 */
interface JobFilters {
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
}

/**
 * Job Service
 * Handles all job-related API calls
 */
const jobService = {


    /**
     * Get pending job requests (new jobs waiting for accept/reject)
     * @returns List of pending job requests
     */
    getPendingRequests: async (): Promise<Job[]> => {
        try {
            const response = await api.get<JobListResponse>('/jobs/pending-requests');
            return response.data.data.jobs;
        } catch (error) {
            console.error('Get pending requests error:', error);
            throw error;
        }
    },

    /**
     * Get active jobs (accepted, reached, in_progress).
     * FIX #9: These were previously invisible to the partner.
     * @returns List of active jobs
     */
    getActiveJobs: async (): Promise<Job[]> => {
        try {
            const response = await api.get<JobListResponse>('/jobs/active');
            return response.data.data.jobs;
        } catch (error) {
            console.error('Get active jobs error:', error);
            throw error;
        }
    },


    /**
     * Get accepted scheduled appointments
     * @returns List of accepted appointments
     */
    getAcceptedAppointments: async (): Promise<Job[]> => {
        try {
            const response = await api.get<{ success: boolean; data: Job[] }>('/jobs/appointments');
            return response.data.data;
        } catch (error) {
            console.error('Get accepted appointments error:', error);
            throw error;
        }
    },

    /**
     * Get job details by ID
     * @param jobId - Job ID
     * @returns Job details
     */
    getJobById: async (jobId: string): Promise<Job> => {
        try {
            // API Placeholder
            const response = await api.get<JobResponse>(`/jobs/${jobId}`);
            return response.data.data;
        } catch (error) {
            console.error('Get job by ID error:', error);
            throw error;
        }
    },



    /**
     * Update job status
     * @param jobId - Job ID
     * @param status - New status
     * @param data - Additional data (notes, images)
     * @returns Updated job
     */
    updateJobStatus: async (
        jobId: string,
        status: string,
        data?: { notes?: string; proofImages?: string[] }
    ): Promise<Job> => {
        try {
            const response = await api.put<JobResponse>(`/jobs/${jobId}/status`, {
                status,
                ...data,
            });
            return response.data.data;
        } catch (error) {
            console.error('Update job status error:', error);
            throw error;
        }
    },

    /**
     * Reject a pending job using the dedicated reject endpoint.
     * FIX #4: Uses POST /jobs/:id/reject instead of PUT /jobs/:id/status (cancelled)
     * so that partner rejection does not permanently strand the client's booking.
     *
     * @param jobId  - Job ID to reject
     * @param reason - Optional reason for declining (stored in status history)
     */
    rejectJob: async (jobId: string, reason?: string): Promise<void> => {
        try {
            await api.post(`/jobs/${jobId}/reject`, { reason: reason || 'Partner declined' });
        } catch (error) {
            console.error('Reject job error:', error);
            throw error;
        }
    },



    /**
     * Complete job with proof
     * @param jobId - Job ID
     * @param proofImages - Array of proof image URLs
     * @param notes - Completion notes
     * @returns Updated job
     */
    completeJob: async (
        jobId: string,
        proofImages?: string[],
        notes?: string
    ): Promise<Job> => {
        return jobService.updateJobStatus(jobId, JOB_STATUS.COMPLETED, {
            proofImages,
            notes,
        });
    },

    /**
     * Upload proof image for job completion
     * @param jobId - Job ID
     * @param imageUri - Local image URI to upload
     * @returns Uploaded image URL
     */
    uploadProofImage: async (jobId: string, imageUri: string): Promise<{ url: string }> => {
        try {
            // Create form data for image upload
            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: `proof_${jobId}_${Date.now()}.jpg`,
            } as any);

            // API Placeholder
            const response = await api.post(`/jobs/${jobId}/upload-proof`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data;
        } catch (error) {
            console.error('Upload proof image error:', error);
            throw error;
        }
    },

    /**
     * Get job history for partner
     * @param filters - Optional filters
     * @returns List of completed jobs
     */
    getJobHistory: async (filters?: JobFilters): Promise<JobListResponse['data']> => {
        try {
            // API Placeholder
            const response = await api.get<JobListResponse>('/jobs/history', { params: filters });
            return response.data.data;
        } catch (error) {
            console.error('Get job history error:', error);
            throw error;
        }
    },

    /**
     * Get today's jobs summary
     * @returns Summary of today's jobs
     */
    getTodaysSummary: async (): Promise<{
        totalJobs: number;
        completedJobs: number;
        pendingJobs: number;
        totalEarnings: number;
    }> => {
        try {
            // API Placeholder
            const response = await api.get('/jobs/today-summary');
            return response.data.data;
        } catch (error) {
            console.error('Get today\'s summary error:', error);
            throw error;
        }
    },
};

export default jobService;
