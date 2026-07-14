import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createJob } from "../services/api";
import "./AddJob.css";

export default function AddJob() {
  const [jobUrl, setJobUrl] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await createJob({ jobUrl, company, role });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aj-container">
      <div className="aj-card glass-panel animate-fade-in">
        <h2 className="aj-title">Post a Job</h2>
        <p className="aj-subtitle">
          Paste any job URL from LinkedIn, Naukri, Indeed, or other boards. 
          Enter optional metadata manually if you want to bypass scraper blocks.
        </p>

        {error && <p className="aj-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="aj-field">
            <label className="aj-label">Job URL</label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="aj-input"
              placeholder="https://www.linkedin.com/jobs/view/..."
              required
            />
          </div>

          <div className="aj-field">
            <label className="aj-label">Company Name (Optional)</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="aj-input"
              placeholder="e.g., Google"
            />
          </div>

          <div className="aj-field">
            <label className="aj-label">Job Role / Position (Optional)</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="aj-input"
              placeholder="e.g., Senior Frontend Developer"
            />
          </div>

          <button type="submit" className="aj-submit-btn" disabled={loading}>
            {loading ? (
              <span className="aj-analyzing-text">
                Analyzing Job with AI... (may take up to 10s)
              </span>
            ) : (
              "Analyze & Post Job"
            )}
          </button>
        </form>

        <button onClick={() => navigate("/dashboard")} className="aj-back-btn">
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
