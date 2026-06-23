import Job from "../models/job.model.js";

export const createJob = async (jobData) => {
  const job = new Job(jobData);
  return await job.save();
};

export const findAllJobs = async () => {
  return await Job.find().populate("postedBy", "name email");
};

export const findJobById = async (jobId) => {
  return await Job.findById(jobId).populate("postedBy", "name email");
};

export const updateJobById = async (jobId, updateData) => {
  return await Job.findByIdAndUpdate(jobId, updateData, { new: true });
};

export const deleteJobById = async (jobId, postedBy) => {
  return await Job.findOneAndDelete({ _id: jobId, postedBy });
};
