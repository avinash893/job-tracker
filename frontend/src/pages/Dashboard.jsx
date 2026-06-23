import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, deleteJob } from "../services/api";
import useAuth from "../hooks/useAuth";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    } catch (err) {
      alert("Failed to delete job");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusColor = (status) => {
    const colors = {
      applied: "#3b82f6",
      interviewing: "#f59e0b",
      offered: "#10b981",
      rejected: "#ef4444",
      withdrawn: "#6b7280",
    };
    return colors[status] || "#6b7280";
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>
      {/* navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>Job Tracker</h1>
        <div style={styles.navRight}>
          <span>👋 {user?.name}</span>
          <button onClick={() => navigate("/jobs/add")} style={styles.addBtn}>
            + Add Job
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* job list */}
      <div style={styles.content}>
        <h2>My Applications ({jobs.length})</h2>

        {jobs.length === 0 ? (
          <div style={styles.empty}>
            <p>No jobs added yet.</p>
            <button onClick={() => navigate("/jobs/add")} style={styles.addBtn}>
              + Add your first job
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {jobs.map((job) => (
              <div key={job._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.company}>{job.company}</h3>
                  <span
                    style={{
                      ...styles.status,
                      backgroundColor: getStatusColor(job.status),
                    }}
                  >
                    {job.status}
                  </span>
                </div>

                <p style={styles.role}>{job.role}</p>

                {job.matchScore && (
                  <p style={styles.score}>
                    Match Score: <strong>{job.matchScore}%</strong>
                  </p>
                )}

                {job.keywords?.length > 0 && (
                  <div style={styles.keywords}>
                    {job.keywords.slice(0, 4).map((kw) => (
                      <span key={kw} style={styles.keyword}>
                        {kw}
                      </span>
                    ))}
                  </div>
                )}

                <div style={styles.cardFooter}>
                  <button
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    style={styles.viewBtn}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    style={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f0f2f5" },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logo: { margin: 0, color: "#4f46e5" },
  navRight: { display: "flex", alignItems: "center", gap: "1rem" },
  content: { padding: "2rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  card: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  company: { margin: 0, fontSize: "1.1rem" },
  status: {
    padding: "0.2rem 0.6rem",
    borderRadius: "20px",
    color: "white",
    fontSize: "0.75rem",
    textTransform: "capitalize",
  },
  role: { color: "#6b7280", margin: "0.3rem 0" },
  score: { color: "#4f46e5", margin: "0.5rem 0" },
  keywords: {
    display: "flex",
    gap: "0.4rem",
    flexWrap: "wrap",
    margin: "0.5rem 0",
  },
  keyword: {
    backgroundColor: "#ede9fe",
    color: "#4f46e5",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
  },
  cardFooter: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1rem",
  },
  addBtn: {
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  logoutBtn: {
    backgroundColor: "transparent",
    border: "1px solid #ccc",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  },
  viewBtn: {
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
    flex: 1,
  },
  empty: { textAlign: "center", marginTop: "3rem" },
  center: { textAlign: "center", marginTop: "3rem" },
};
