import {
  addJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../services/job.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createJob = asyncHandler(async (req, res) => {
  const job = await addJob(req.user._id, req.body);

  res.status(201).json(new ApiResponse(201, job, "Job added successfully"));
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await getAllJobs(req.user._id);

  res.status(200).json(new ApiResponse(200, jobs, "Jobs fetched successfully"));
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await getJobById(req.params.id, req.user._id);

  res.status(200).json(new ApiResponse(200, job, "Job fetched successfully"));
});

export const updateJobController = asyncHandler(async (req, res) => {
  const job = await updateJob(req.params.id, req.user._id, req.body);

  res.status(200).json(new ApiResponse(200, job, "Job updated successfully"));
});

export const deleteJobController = asyncHandler(async (req, res) => {
  await deleteJob(req.params.id, req.user._id);

  res.status(200).json(new ApiResponse(200, null, "Job deleted successfully"));
});
