import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, updateProfile, uploadResume } from "../services/api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import "./Account.css";

export default function Account() {
  const { user, logout, updateUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(", ") || "");
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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
      setJobs([]);
    }
  };

  // Calculate dynamic stats
  const totalApps = jobs.length;
  const matchScores = jobs.map((j) => j.matchScore).filter(Boolean);
  const avgMatch = matchScores.length
    ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
    : 0;

  const handleSaveSkills = async (customSkills) => {
    try {
      const skillsArray = (customSkills || skillsInput)
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      const res = await updateProfile({ skills: skillsArray });
      updateUser(res.data.data);
      setSkillsInput(res.data.data.skills.join(", "));
      setIsEditingSkills(false);
      showToast("Skills updated successfully!", "success");

      // Refetch jobs to load updated background calculations
      setTimeout(() => {
        fetchJobs();
      }, 1500);
    } catch (err) {
      showToast("Failed to update skills.", "error");
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const res = await uploadResume(formData);
      const extractedSkills = res.data.data.skills;

      if (extractedSkills.length === 0) {
        showToast("No skills matched from the resume. Try updating your skills list CSV.", "error");
      } else {
        const confirmed = window.confirm(
          `Extracted skills: ${extractedSkills.join(", ")}\n\nWould you like to overwrite your skills list with these?`
        );
        if (confirmed) {
          await handleSaveSkills(extractedSkills.join(", "));
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to extract skills from resume.", "error");
    } finally {
      setIsUploading(false);
      setResumeFile(null);
    }
  };

  return (
    <div className="acc-container">
      {/* Navbar */}
      <div className="acc-navbar">
        <h1 className="acc-logo" onClick={() => navigate("/dashboard")} style={{cursor: "pointer"}}>
          JobMatch AI
        </h1>
        <div className="acc-nav-right">
          <button onClick={() => navigate("/dashboard")} className="acc-back-dash-btn">
            ← Dashboard
          </button>
          <button onClick={() => { logout(); navigate("/login"); }} className="acc-logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="acc-content">
        <h2 className="acc-page-title">My Account</h2>

        <div className="acc-grid">
          {/* Column 1: Profile & Stats */}
          <div className="acc-card-col">
            <div className="acc-card glass-panel">
              <h3>Profile Info</h3>
              <div className="acc-info-row">
                <span className="acc-info-label">Name</span>
                <span className="acc-info-val">{user?.name}</span>
              </div>
              <div className="acc-info-row">
                <span className="acc-info-label">Email</span>
                <span className="acc-info-val">{user?.email}</span>
              </div>
            </div>

            <div className="acc-card glass-panel">
              <h3>Application Stats</h3>
              <div className="acc-info-row">
                <span className="acc-info-label">Total Postings</span>
                <span className="acc-info-val">{totalApps}</span>
              </div>
              <div className="acc-info-row">
                <span className="acc-info-label">Average Match Rate</span>
                <span className="acc-info-val">{avgMatch}%</span>
              </div>
            </div>
          </div>

          {/* Column 2: Resume Parser & Skills */}
          <div className="acc-main-col">

            {/* Resume Upload Dropzone */}
            <div className="acc-card glass-panel">
              <h3>AI Resume Parser</h3>
              <p className="acc-desc">
                Upload your resume (PDF or TXT). The system scans the document text, matches it against our skills CSV database, and populates your profile skills instantly.
              </p>
              
              <form onSubmit={handleResumeUpload} className="acc-upload-form">
                <div className="acc-file-input-wrapper">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    id="resume-upload"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="resume-upload" className="acc-file-label">
                    {resumeFile ? `Selected: ${resumeFile.name}` : "📂 Choose PDF or TXT Resume"}
                  </label>
                </div>

                <button
                  type="submit"
                  className="acc-upload-btn"
                  disabled={!resumeFile || isUploading}
                >
                  {isUploading ? "Extracting Skills..." : "Analyze Resume"}
                </button>
              </form>
            </div>

            {/* Skills Editor */}
            <div className="acc-card glass-panel">
              <div className="acc-skills-header">
                <h3>My Skills Profile</h3>
                {!isEditingSkills && (
                  <button onClick={() => setIsEditingSkills(true)} className="acc-edit-btn">
                    ✏️ Edit Manual
                  </button>
                )}
              </div>

              {isEditingSkills ? (
                <div className="acc-skills-form">
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    className="acc-skills-input"
                    placeholder="React, Node.js, Python..."
                  />
                  <div className="acc-skills-actions">
                    <button onClick={() => handleSaveSkills(null)} className="acc-save-btn">
                      Save
                    </button>
                    <button onClick={() => setIsEditingSkills(false)} className="acc-cancel-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="acc-skills-list">
                  {user?.skills?.length > 0 ? (
                    user.skills.map((skill) => (
                      <span key={skill} className="acc-skill-pill">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="acc-no-skills">No skills added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
