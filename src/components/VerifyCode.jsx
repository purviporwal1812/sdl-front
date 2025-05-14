// src/components/VerifyCode.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyCode() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [info, setInfo] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      // 1. Submit the verification code (issues the session cookie)
      const { data: verifyData } = await axios.post(
        `${BACKEND_URL}/users/verify-code`,
        { email, code },
        { withCredentials: true }
      );
      setInfo(verifyData.message);

      // 2. Immediately fetch the user profile to confirm the cookie is set
      await axios.get(`${BACKEND_URL}/users/profile`, {
        withCredentials: true,
      });

      // 3. If that succeeds, navigate to the protected attendance page
      setTimeout(() => {
        navigate("/mark-attendance");
      }, 500);
    } catch (err) {
      console.error("Verification failed:", err);
      if (err.response?.data?.message) {
        setInfo(err.response.data.message);
      } else {
        setInfo("Verification failed. Try again.");
      }
    }
  };

  return (
    <div className="verify-code-container" style={{ maxWidth: 400, margin: "0 auto" }}>
      <h1>Verify Your Email</h1>
      <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="code">Verification Code:</label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <button type="submit">Verify</button>
      </form>

      {info && (
        <p style={{ marginTop: 16, color: info.toLowerCase().includes("failed") ? "red" : "green" }}>
          {info}
        </p>
      )}
    </div>
  );
}
