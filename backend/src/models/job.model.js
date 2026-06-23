import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    jobUrl: {
      type: String,
      required: [true, "Job URL is required"],
      trim: true,
    },
    notes: { type: String, trim: true },
    salary: { type: Number },
    appliedAt: { type: Date, default: Date.now },
    keywords: [String],
    matchScore: { type: Number, default: null },
    scrapedData: { type: String, default: null },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
