import {
  createJob,
  findAllJobsByUser,
  findJobById,
  updateJobById,
  deleteJobById,
} from "../repositories/job.repository.js";
import { ApiError } from "../utils/apiError.js";
import analyzeJob from "../utils/aiService.js";

export const addJob = async (userId, jobData) => {
  // create job first
  const job = await createJob({ ...jobData, user: userId });

  // if jobUrl exists → call AI service in background
  if (jobData.jobUrl) {
    // get user skills
    const user = await findUserById(userId);
    const userSkills = user.skills || [];

    // call AI service
    const analysis = await analyzeJob(jobData.jobUrl, userSkills);

    // if analysis returned → update job
    if (analysis) {
      const updatedJob = await updateJobById(job._id, userId, {
        keywords: analysis.keywords,
        matchScore: analysis.matchScore,
        scrapedData: JSON.stringify(analysis.skillScores),
      });
      return updatedJob;
    }
  }

  return job;
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
