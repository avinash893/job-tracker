import ApiError from "../utils/apiError.js";

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

export default notFound;
