import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://sdl-back.vercel.app/users/login",
        {  email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/mark-attendance");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="wrapper">
        <div className="logo">
          <img src="/profile.jpg" alt="Logo" />
        </div>
        <div className="name">Login</div>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <i className="fas fa-user"></i>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit">
            Login
          </button>
          <div className="text-center mt-3">
            <Link to="/users/register">New User?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
