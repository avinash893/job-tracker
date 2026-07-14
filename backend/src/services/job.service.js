import {
  createJob,
  findAllJobs,
  findJobById,
  updateJobById,
  deleteJobById,
} from "../repositories/job.repository.js";
import { findUserById } from "../repositories/user.repository.js";
import { ApiError } from "../utils/apiError.js";
import analyzeJob from "../utils/aiService.js";

export const addJob = async (userId, jobData) => {
  const job = await createJob({ ...jobData, postedBy: userId });

  if (jobData.jobUrl) {
    const user = await findUserById(userId);
    const userSkills = user.skills || [];
    const analysis = await analyzeJob(jobData.jobUrl, userSkills);

    if (analysis) {
      return await updateJobById(job._id, {
        keywords: analysis.keywords,
        matchScore: analysis.matchScore,
        scrapedData: JSON.stringify(analysis.skillScores),
        company: jobData.company || analysis.company || "Unknown Company",
        role: jobData.role || analysis.role || "Job Position",
      });
    }
  }

  return job;
};

export const getAllJobs = async () => {
  const jobs = await findAllJobs();
  if (!jobs || jobs.length === 0) {
    throw new ApiError(404, "No jobs found");
  }
  return jobs;
};

export const getJobById = async (jobId) => {
  const job = await findJobById(jobId);
  if (!job) throw new ApiError(404, "Job not found");
  return job;
};

export const getJobMatch = async (jobId, userId) => {
  const job = await findJobById(jobId);
  if (!job) throw new ApiError(404, "Job not found");

  const user = await findUserById(userId);
  const userSkills = user.skills || [];

  if (!job.jobUrl) throw new ApiError(400, "Job has no URL");

  const analysis = await analyzeJob(job.jobUrl, userSkills);
  if (!analysis) throw new ApiError(500, "AI service failed");

  return {
    matchScore: analysis.matchScore,
    skillScores: analysis.skillScores,
    keywords: job.keywords,
  };
};

export const deleteJob = async (jobId, userId) => {
  const job = await deleteJobById(jobId, userId);
  if (!job) throw new ApiError(404, "Job not found");
  return job;
};
