import {
  addJob,
  getAllJobs,
  getJobById,
  getJobMatch,
  deleteJob,
} from "../services/job.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createJob = asyncHandler(async (req, res) => {
  const job = await addJob(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, job, "Job posted successfully"));
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await getAllJobs();
  res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await getJobById(req.params.id);
  res.status(200).json(new ApiResponse(200, job, "Job fetched successfully"));
});

export const getJobMatchController = asyncHandler(async (req, res) => {
  const result = await getJobMatch(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, result, "Match score calculated"));
});

export const deleteJobController = asyncHandler(async (req, res) => {
  await deleteJob(req.params.id, req.user._id);
  res.status(200).json(new ApiResponse(200, null, "Job deleted successfully"));
});
