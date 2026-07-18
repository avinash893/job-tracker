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
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Defaults to 7 days from creation
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
