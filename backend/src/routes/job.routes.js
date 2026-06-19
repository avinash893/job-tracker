import express from "express";

import {
  createJob,
  getJobs,
  getJob,
  updateJobController,
  deleteJobController,
} from "../controllers/job.controller.js";

import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createJob);

router.get("/", getJobs);

router.get("/:id", getJob);

router.put("/:id", updateJobController);

router.delete("/:id", deleteJobController);

export default router;
