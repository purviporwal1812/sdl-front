import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { animate, stagger } from "animejs";
import "./styles/MarkAttendance.css";

export default function MarkAttendance() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const verifySessionAndAnimate = async () => {
      try {
        // hit your GET /users/profile route to check auth
        await axios.get(`${BACKEND_URL}/users/profile`, {
          withCredentials: true,
        });

        // if it succeeds, run your animations
        animate(
          ".mark-attendance form label, .mark-attendance form input",
          {
            opacity: [0, 1],
            translateX: [-20, 0],
            easing: "easeOutQuad",
            duration: 600,
            delay: stagger(100),
          }
        );
        animate(
          ".mark-attendance form button",
          {
            scale: [0.8, 1],
            opacity: [0, 1],
            easing: "easeOutBack",
            duration: 800,
            delay: 500,
          }
        );
      } catch (err) {
        // on failure, redirect to your frontend login route
        navigate("/users/login");
      }
    };

    verifySessionAndAnimate();
  }, [navigate, BACKEND_URL]);

  // 2. Logout handler
  const handleLogout = async () => {
    try {
      // POST to the existing logout endpoint
      await axios.post(
        `${BACKEND_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/users/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Could not log out. Try again.");
    }
  };

  // 3. Go to profile
  const goToProfile = () => {
    navigate("/profile");
  };

  // 4. Attendance submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by this browser.");
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          // POST to your /mark-attendance route (already correct)
          const res = await axios.post(
            `${BACKEND_URL}/mark-attendance`,
            { name, rollNumber, lat, lon },
            { withCredentials: true }
          );
          alert(res.data);
        } catch (error) {
          alert(error.response?.data || "Failed to mark attendance");
        }
      },
      () => alert("Failed to get location. Please enable location services.")
    );
  };

  return (
    <div className="mark-attendance">
      <header
        className="mark-attendance-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Mark Attendance</h1>
        <div>
          <button
            className="btn profile-btn"
            onClick={goToProfile}
            style={{ marginRight: "8px" }}
          >
            Profile
          </button>
          <button className="btn logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="rollNumber">Roll Number:</label>
        <input
          id="rollNumber"
          name="rollNumber"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          required
        />

        <button type="submit">Mark Attendance</button>
      </form>
    </div>
  );
}
