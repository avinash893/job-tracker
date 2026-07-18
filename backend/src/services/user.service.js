import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../repositories/user.repository.js";
import { ApiError } from "../utils/apiError.js";
import Job from "../models/job.model.js";
import analyzeJob from "../utils/aiService.js";
import { updateJobById } from "../repositories/job.repository.js";

const genrateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export const registerUser = async (userData) => {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new ApiError(400, "Email is already registered");
  }

  const user = await createUser(userData);

  const token = genrateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }
  const token = genrateToken(user._id);
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      skills: user.skills,
    },
  };
};

export const recalculateAllJobMatches = async (userId, skills) => {
  try {
    const jobs = await Job.find({ postedBy: userId });
    for (let job of jobs) {
      if (job.jobUrl) {
        const analysis = await analyzeJob(job.jobUrl, skills);
        if (analysis) {
          await updateJobById(job._id, {
            matchScore: analysis.matchScore,
            scrapedData: JSON.stringify(analysis.skillScores),
            keywords: analysis.keywords
          });
        }
      }
    }
  } catch (err) {
    console.error("Recalculation error inside user service:", err);
  }
};

export const updateUserProfile = async (userId, updateData) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (updateData.skills) {
    user.skills = updateData.skills;
  }

  await user.save();

  // Trigger match score recalculations in the background
  if (updateData.skills) {
    recalculateAllJobMatches(user._id, updateData.skills).catch((err) => {
      console.error("Background match score recalculation failed:", err);
    });
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    skills: user.skills,
  };
};
