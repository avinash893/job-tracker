import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["applied", "interviewing", "offered", "rejected", "withdrawn"],
      default: "applied",
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    salary: {
      type: Number,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    keywords: [String], // ["React", "REST API", "MongoDB"] ← scraped by AI
    matchScore: {
      type: Number,
      default: null, // null until AI calculates it
    },
    scrapedData: {
      type: String, // raw job description text fetched from jobUrl
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
