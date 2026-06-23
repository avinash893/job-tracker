import express from "express";
import {
  createJob,
  getJobs,
  getJob,
  getJobMatchController,
  deleteJobController,
} from "../controllers/job.controller.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getJobs);               // public
router.get("/:id", getJob);             // public
router.get("/:id/match", protect, getJobMatchController);  // protected
router.post("/", protect, createJob);   // protected
router.delete("/:id", protect, deleteJobController);       // protected

export default router;
