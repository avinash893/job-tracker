import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* navbar */}
      <nav className="home-nav">
        <div className="home-logo">JobMatch AI</div>
        <div className="home-nav-links">
          <button
            onClick={() => navigate("/login")}
            className="nav-btn-outline"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="nav-btn-filled"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* hero */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Find Jobs That <span className="highlight">Match Your Skills</span>
          </h1>
          <p className="hero-subtitle">
            Paste any job URL from LinkedIn, Naukri, or Indeed. Our AI analyzes
            the job and tells you exactly how well your skills match.
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/register")}
              className="btn-primary"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-secondary"
            >
              Login
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="score-card">
            <div className="score-card-header">
              <span className="score-company">Google</span>
              <span className="score-badge">open</span>
            </div>
            <p className="score-role">Senior Frontend Developer</p>
            <div className="score-display">
              <span className="score-number-big">
                87%
              </span>
              <span className="score-label-small">Match Score</span>
            </div>
            <div className="score-skills">
              <span className="score-skill">react</span>
              <span className="score-skill">typescript</span>
              <span className="score-skill">nodejs</span>
              <span className="score-skill">mongodb</span>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section className="features">
        <h2 className="features-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔗</div>
            <h3>Paste Job URL</h3>
            <p>
              Copy any job link from LinkedIn, Naukri, Indeed or any job portal
              and paste it.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Analyzes</h3>
            <p>
              Our trained AI model scrapes the job description and extracts
              required skills automatically.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>See Your Match</h3>
            <p>
              Get a detailed match score showing exactly how your skills align
              with the job requirements.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Community Board</h3>
            <p>
              Browse jobs posted by the community. Anyone can share job links
              for everyone to see.
            </p>
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="cta">
        <h2>Ready to find your perfect job match?</h2>
        <p>
          Join thousands of developers using JobMatch AI to find the right
          opportunities.
        </p>
        <button onClick={() => navigate("/register")} className="btn-primary">
          Start For Free
        </button>
      </section>

      {/* footer */}
      <footer className="footer">
        <p>Built by Avinash Shah (aalu) — IIIT Una</p>
      </footer>
    </div>
  );
}
