import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, deleteJob, updateProfile } from "../services/api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import "./Dashboard.css";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Skills edit states
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(", ") || "");

  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await getJobs();
      setJobs(res.data.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setJobs([]); // no jobs yet
      } else {
        setError("Failed to fetch jobs");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJob(id);
      setJobs(jobs.filter((job) => job._id !== id));
      showToast("Job application deleted successfully!", "success");
    } catch (err) {
      showToast("Failed to delete job.", "error");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSaveSkills = async () => {
    try {
      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      const res = await updateProfile({ skills: skillsArray });
      updateUser(res.data.data);
      setIsEditingSkills(false);
    } catch (err) {
      alert("Failed to update skills. Please try again.");
    }
  };

  const getStatusStyle = (status) => {
    const configs = {
      applied: {
        color: "var(--info)",
        backgroundColor: "rgba(59, 130, 246, 0.08)",
        borderColor: "rgba(59, 130, 246, 0.15)",
      },
      interviewing: {
        color: "var(--warning)",
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        borderColor: "rgba(245, 158, 11, 0.15)",
      },
      offered: {
        color: "var(--success)",
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        borderColor: "rgba(16, 185, 129, 0.2)",
      },
      rejected: {
        color: "var(--danger)",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        borderColor: "rgba(239, 68, 68, 0.15)",
      },
      withdrawn: {
        color: "var(--neutral)",
        backgroundColor: "rgba(113, 113, 122, 0.08)",
        borderColor: "rgba(113, 113, 122, 0.15)",
      },
    };
    return configs[status] || configs.applied;
  };

  // Calculate dynamic stats
  const totalApps = jobs.length;
  const activeInterviews = jobs.filter((j) => j.status === "interviewing").length;
  const offersReceived = jobs.filter((j) => j.status === "offered").length;
  const matchScores = jobs.map((j) => j.matchScore).filter(Boolean);
  const avgMatch = matchScores.length
    ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
    : 0;

  const getScoreColor = (score) => {
    if (score >= 75) return "var(--success)";
    if (score >= 50) return "var(--warning)";
    return "var(--danger)";
  };

  if (error) return <div className="dash-center">{error}</div>;

  return (
    <div className="dash-container">
      {/* navbar */}
      <div className="dash-navbar">
        <h1 className="dash-logo">JobMatch AI</h1>
        <div className="dash-nav-right">
          <span className="dash-user-greeting">
            Welcome, <span className="dash-user-name">{user?.name}</span>
          </span>
          <button onClick={() => navigate("/jobs/add")} className="dash-add-btn">
            + Add Job
          </button>
          <button onClick={() => navigate("/account")} className="dash-logout-btn">
            Profile
          </button>
          <button onClick={handleLogout} className="dash-logout-btn">
            Logout
          </button>
        </div>
      </div>

      {/* content */}
      <div className="dash-content">
        {/* stats panel */}
        <div className="dash-stats-grid">
          <div className="dash-stat-card glass-panel">
            <span className="dash-stat-label">Total Applications</span>
            {loading ? (
              <div className="skeleton" style={{ height: "36px", width: "40px", marginTop: "0.25rem" }} />
            ) : (
              <span className="dash-stat-val">{totalApps}</span>
            )}
          </div>
          <div className="dash-stat-card glass-panel">
            <span className="dash-stat-label">Average Match Rate</span>
            {loading ? (
              <div className="skeleton" style={{ height: "36px", width: "50px", marginTop: "0.25rem" }} />
            ) : (
              <span className="dash-stat-val">{avgMatch}%</span>
            )}
          </div>
          <div className="dash-stat-card glass-panel">
            <span className="dash-stat-label">Active Interviews</span>
            {loading ? (
              <div className="skeleton" style={{ height: "36px", width: "40px", marginTop: "0.25rem" }} />
            ) : (
              <span className="dash-stat-val">{activeInterviews}</span>
            )}
          </div>
          <div className="dash-stat-card glass-panel">
            <span className="dash-stat-label">Offers Received</span>
            {loading ? (
              <div className="skeleton" style={{ height: "36px", width: "40px", marginTop: "0.25rem" }} />
            ) : (
              <span className="dash-stat-val">{offersReceived}</span>
            )}
          </div>
        </div>

        {/* profile skills section */}
        <div className="dash-profile-section glass-panel">
          <div className="dash-profile-header">
            <h3>My Skills Profile</h3>
            {!isEditingSkills && (
              <button
                onClick={() => {
                  setSkillsInput(user?.skills?.join(", ") || "");
                  setIsEditingSkills(true);
                }}
                className="dash-edit-skills-btn"
              >
                ✏️ Edit Skills
              </button>
            )}
          </div>

          {isEditingSkills ? (
            <div className="dash-skills-edit-form">
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="dash-skills-input"
                placeholder="React, Node.js, Python, Git..."
                autoFocus
              />
              <div className="dash-skills-actions">
                <button onClick={handleSaveSkills} className="dash-save-skills-btn">
                  Save
                </button>
                <button
                  onClick={() => setIsEditingSkills(false)}
                  className="dash-cancel-skills-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="dash-skills-list">
              {user?.skills && user.skills.length > 0 ? (
                user.skills.map((skill) => (
                  <span key={skill} className="dash-skill-pill">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="dash-no-skills-msg">
                  No skills listed yet. Click edit to add your skill set.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="dash-title-section">
          <h2>My Applications</h2>
        </div>

        {loading ? (
          <div className="dash-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="dash-card glass-panel">
                <div className="dash-card-header">
                  <div style={{ width: "100%" }}>
                    <div className="skeleton skeleton-title" style={{ width: "70%" }} />
                    <div className="skeleton skeleton-bar" style={{ width: "40%", height: "14px" }} />
                  </div>
                  <div className="skeleton skeleton-badge" />
                </div>
                <div className="skeleton skeleton-bar" style={{ width: "50%", height: "18px", marginTop: "1rem", marginBottom: "1rem" }} />
                <div className="dash-keywords">
                  <div className="skeleton skeleton-badge" style={{ width: "60px" }} />
                  <div className="skeleton skeleton-badge" style={{ width: "80px" }} />
                  <div className="skeleton skeleton-badge" style={{ width: "50px" }} />
                </div>
                <div className="dash-card-footer" style={{ marginTop: "1.5rem" }}>
                  <div className="skeleton skeleton-button" style={{ width: "90px" }} />
                  <div className="skeleton skeleton-button" style={{ width: "70px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="dash-empty-state glass-panel">
            <span className="dash-empty-icon">📁</span>
            <p>Your job board is currently empty.</p>
            <button onClick={() => navigate("/jobs/add")} className="dash-add-btn">
              Add your first job URL
            </button>
          </div>
        ) : (
          <div className="dash-grid">
            {jobs.map((job) => (
              <div
                key={job._id}
                className={`dash-card glass-panel ${
                  job.matchScore >= 75 ? "dash-card-glow-green" : ""
                }`}
              >
                <div className="dash-card-header">
                  <div>
                    <h3 className="dash-company">{job.company || "Unknown Company"}</h3>
                    <p className="dash-role">{job.role || "Job Position"}</p>
                  </div>
                  <span
                    className="dash-status-badge"
                    style={getStatusStyle(job.status)}
                  >
                    {job.status}
                  </span>
                </div>

                {job.matchScore && (
                  <div className="dash-score-wrapper">
                    <span className="dash-score-label">Match Score:</span>
                    <span
                      className="dash-score-number"
                      style={{ color: getScoreColor(job.matchScore) }}
                    >
                      {job.matchScore}%
                    </span>
                  </div>
                )}

                {job.keywords?.length > 0 && (
                  <div className="dash-keywords">
                    {job.keywords.slice(0, 4).map((kw) => (
                      <span key={kw} className="dash-keyword">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                <div className="dash-card-footer">
                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="dash-view-btn"
                  >
                    View Details
                  </button>
                  {(job.postedBy === user?.id || job.postedBy?._id === user?.id) && (
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="dash-delete-btn"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
