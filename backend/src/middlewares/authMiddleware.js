import jwt from "jsonwebtoken";
import { findUserById } from "../repositories/user.repository.js";
import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw new ApiError(401, "Not authorized to access this route");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await findUserById(decoded.id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  req.user = user;
  next();
});
