import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJob } from "../services/api";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import "./JobDetail.css";

export default function JobDetail() {
  const [job, setJob] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState(null);

  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchJob = useCallback(async () => {
    try {
      const res = await getJob(id);
      setJob(res.data.data);
    } catch (err) {
      setError("Job not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const fetchMatch = async () => {
    setMatchLoading(true);
    try {
      const res = await api.get(`/jobs/${id}/match`);
      setMatch(res.data.data);
    } catch (err) {
      setError("Failed to calculate match score");
    } finally {
      setMatchLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "var(--success)";
    if (score >= 45) return "var(--warning)";
    return "var(--danger)";
  };

  if (error) return <div className="center">{error}</div>;
  if (!loading && !job) return <div className="center">Job details not available</div>;

  return (
    <div className="jd-container">
      <div className="jd-card glass-panel">
        <button onClick={() => navigate("/dashboard")} className="jd-back-btn">
          ← Back to Dashboard
        </button>

        {loading ? (
          <div>
            <div className="jd-header">
              <div className="skeleton skeleton-title" style={{ width: "50%", height: "28px" }} />
              <div className="skeleton skeleton-bar" style={{ width: "30%", height: "16px", marginBottom: "1rem" }} />
              <div className="skeleton skeleton-badge" />
              <div className="skeleton skeleton-bar" style={{ width: "20%", height: "14px", marginTop: "1rem" }} />
            </div>

            <div className="jd-section">
              <div className="skeleton skeleton-title" style={{ width: "25%", height: "20px" }} />
              <div className="skeleton skeleton-button" style={{ width: "140px" }} />
            </div>

            <div className="jd-section">
              <div className="skeleton skeleton-title" style={{ width: "30%", height: "20px" }} />
              <div className="jd-keywords">
                <div className="skeleton skeleton-badge" style={{ width: "80px" }} />
                <div className="skeleton skeleton-badge" style={{ width: "60px" }} />
                <div className="skeleton skeleton-badge" style={{ width: "70px" }} />
                <div className="skeleton skeleton-badge" style={{ width: "90px" }} />
              </div>
            </div>

            <div className="jd-section">
              <div className="skeleton skeleton-title" style={{ width: "20%", height: "20px" }} />
              <div className="skeleton skeleton-button" style={{ width: "100%", height: "45px", borderRadius: "8px" }} />
            </div>
          </div>
        ) : (
          <>
            <div className="jd-header">
              <h2>{job.role || "Job Position"}</h2>
              <p className="jd-company">{job.company || "Company"}</p>
              <span className={`jd-status ${job.status}`}>{job.status}</span>
              <p className="jd-posted">
                Posted by: <strong>{job.postedBy?.name || "Anonymous user"}</strong>
              </p>
            </div>

            <div className="jd-section">
              <h3>Link to Application</h3>
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="jd-link"
              >
                Open Job Listing ↗
              </a>
            </div>

            {job.keywords?.length > 0 && (
              <div className="jd-section">
                <h3>Skills & Keywords Required</h3>
                <div className="jd-keywords">
                  {job.keywords.map((kw) => (
                    <span key={kw} className="jd-keyword">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.keywords?.length > 0 && (
              <div className="jd-section">
                <h3>Skills You Need to Learn</h3>
                {job.keywords.filter(
                  (kw) => !(user?.skills?.map((s) => s.toLowerCase()) || []).includes(kw.toLowerCase())
                ).length > 0 ? (
                  <div className="jd-keywords">
                    {job.keywords
                      .filter(
                        (kw) => !(user?.skills?.map((s) => s.toLowerCase()) || []).includes(kw.toLowerCase())
                      )
                      .map((kw) => (
                        <span key={kw} className="jd-keyword jd-skill-to-learn">
                          💡 {kw}
                        </span>
                      ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--success)", fontSize: "0.9rem", fontWeight: "600" }}>
                    🎉 You already match all keywords required for this position!
                  </p>
                )}
              </div>
            )}

            <div className="jd-section">
              <h3>Your Profile Match</h3>

              {!match && !matchLoading && (
                <button onClick={fetchMatch} className="jd-match-btn">
                  Analyze Skills & Calculate Match Score
                </button>
              )}

              {matchLoading && (
                <p className="jd-calculating">
                  AI is currently cross-referencing job requirements with your listed skills...
                </p>
              )}

              {match && (
                <div className="jd-match-result">
                  <div className="jd-score-circle">
                    <span
                      className="jd-score-number"
                      style={{ color: getScoreColor(match.matchScore) }}
                    >
                      {match.matchScore}%
                    </span>
                    <span className="jd-score-label">Overall Match Score</span>
                  </div>

                  <h3>Skill Match Breakdown</h3>
                  <div style={{ marginTop: "1rem" }}>
                    {Object.entries(match.skillScores)
                      .sort((a, b) => b[1] - a[1])
                      .map(([skill, score]) => (
                        <div key={skill} className="jd-skill-row">
                          <span className="jd-skill-name" title={skill}>
                            {skill}
                          </span>
                          <div className="jd-bar-container">
                            <div
                              className="jd-bar"
                              style={{
                                width: `${Math.max(0, score)}%`,
                                backgroundColor: getScoreColor(score),
                              }}
                            />
                          </div>
                          <span className="jd-skill-score">{score}%</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
