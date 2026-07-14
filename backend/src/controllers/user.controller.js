import { registerUser, loginUser, updateUserProfile } from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, skills } = req.body;

  const data = await registerUser({ name, email, password, skills });

  res
    .status(201)
    .json(new ApiResponse(201, data, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const data = await loginUser({ email, password });

  res.status(200).json(new ApiResponse(200, data, "Login successful"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { skills } = req.body;

  const data = await updateUserProfile(req.user._id, { skills });

  res.status(200).json(new ApiResponse(200, data, "Profile updated successfully"));
});
