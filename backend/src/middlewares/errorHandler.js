import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
  console.log("ERROR:", err);
  console.log("IS ApiError:", err instanceof ApiError);
  console.log("statusCode:", err.statusCode);
  console.log("message:", err.message);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      statusCode: 400,
    });
  }

  // mongodb duplicate — like registering same email twice
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: `${Object.keys(err.keyValue)} already exists`,
      statusCode: 400,
    });
  }

  // mongodb schema validation failed
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
      statusCode: 400,
    });
  }

  // jwt token was tampered
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      statusCode: 401,
    });
  }

  // jwt token expired
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
      statusCode: 401,
    });
  }

  // anything else we didn't expect — generic 500
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    statusCode: 500,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorHandler;
