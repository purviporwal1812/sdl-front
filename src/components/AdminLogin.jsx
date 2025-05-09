// src/components/AdminLogin.jsx
import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Login.css";   // same CSS as user-login

function AdminLogin() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BACKEND_URL}/admin/login`,
        { email, password },
        { withCredentials: true }
      );
      if (response.status === 200) {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-page">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-text">
          <h1>Admin Portal</h1>
          <p>Secure access for administrators</p>
        </div>
      </section>

      <section className="form-section">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email Address</label>
          </div>

          <div className="form-field">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
          </div>

          <button type="submit" className="btn">
            Login
          </button>
        </form>
      </section>
    </div>
  );
}

export default AdminLogin;
