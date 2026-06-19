import Job from "../models/job.model.js";

export const createJob = async (jobData) => {
  const job = new Job(jobData);
  return await job.save();
};

export const findAllJobsByUser = async (userId) => {
  return await Job.find({ user: userId });
};

export const findJobById = async (jobId, userId) => {
  return await Job.findOne({ _id: jobId, user: userId });
};

export const updateJobById = async (jobId, userId, updateData) => {
  return await Job.findOneAndUpdate({ _id: jobId, user: userId }, updateData, {
    new: true,
  });
};

export const deleteJobById = async (jobId, userId) => {
  return await Job.findOneAndDelete({ _id: jobId, user: userId });
};
