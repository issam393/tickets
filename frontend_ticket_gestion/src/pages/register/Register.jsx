import { useState } from "react";
import toast from "react-hot-toast";
import image from "../../assets/image.png";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";

import "./Register.css";

import { apiUrl } from "../../lib/apiConfig";
function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setShowError(true);
      setErrorMessage("Username and password are required.");
      toast.error("Please fill in both Username and Password.");
      return;
    }

    try {
      const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setShowError(false);
        setErrorMessage("");
        toast.success(data.message || "Login successful!");
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', username);
        localStorage.setItem('token', data.token);
        navigate('/dashboard'); 
      } else {
        const message = data.message || data.error || "Login failed";
        toast.error(message);
        setErrorMessage(message);
        setShowError(true);
      }
    } catch {
      toast.error("Cannot connect to server");
      setErrorMessage("Cannot connect to server.");
      setShowError(true);
    }
  };

  return (
    <div>
      <img src={image} alt="Background" className="bg-image" />
      <div className="overlay"></div>
      <div className="grid-overlay"></div>
      <div className="ambient-glow"></div>

      <div className="container_register">
        <div className="top-line"></div>
        <div className="corner-decoration corner-tl"></div>
        <div className="corner-decoration corner-tr"></div>
        <div className="corner-decoration corner-bl"></div>
        <div className="corner-decoration corner-br"></div>

        <div className="logo">
          <img src={logo} alt="Authority Logo" />
          <div className="logo-pulse"></div>
        </div>

        <h1>Secure Access</h1>
        <div className="subtitle">Authorized Personnel Only</div>

        {showError && (
          <div className="error-message visible">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errorMessage}
          </div>
        )}

        <form id="authForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">
              </span>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="3" y1="3" x2="21" y2="21" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            <span>Access Portal</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </form>

        <div className="redirect-text">
          <span>Need access?</span>
          <a href="/request-access">Request credentials</a>
        </div>

        <div className="security-note">
          <div className="security-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          This portal is restricted to authorized users only. All access attempts may be logged, reviewed, and monitored.
        </div>
      </div>
    </div>
  );
}

export default Register;
