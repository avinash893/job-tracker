import {
  createJob,
  findAllJobsByUser,
  findJobById,
  updateJobById,
  deleteJobById,
} from "../repositories/job.repository.js";
import { ApiError } from "../utils/apiError.js";

export const addJob = async (userId, jobData) => {
  return await createJob({ ...jobData, user: userId });
};

export const getAllJobs = async (userId) => {
  const jobs = await findAllJobsByUser(userId);

  if (!jobs || jobs.length === 0) {
    throw new ApiError(404, "No jobs found for this user");
  }
  return jobs;
};

export const getJobById = async (jobId, userId) => {
  const job = await findJobById(jobId, userId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  return job;
};

export const updateJob = async (jobId, userId, updateData) => {
  const job = await updateJobById(jobId, userId, updateData);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  return job;
};

export const deleteJob = async (jobId, userId) => {
  const job = await deleteJobById(jobId, userId);
  if (!job) {
    throw new ApiError(404, "Job not found");
  }
  return job;
};
