import { registerUser, loginUser, updateUserProfile } from "../services/user.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import axios from "axios";

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

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No resume file uploaded");
  }

  // Pack the memory file buffer inside standard FormData
  const formData = new FormData();
  const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
  formData.append("file", fileBlob, req.file.originalname);

  try {
    // Call the Python AI service
    const aiResponse = await axios.post("http://127.0.0.1:8000/api/extract-skills", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    res.status(200).json(new ApiResponse(200, aiResponse.data, "Skills extracted successfully"));
  } catch (err) {
    throw new ApiError(500, `AI Service extraction failed: ${err.message}`);
  }
});
