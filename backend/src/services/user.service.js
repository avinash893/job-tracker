import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
} from "../repositories/user.repository.js";
import { ApiError } from "../utils/apiError.js";

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
