import React, { useState, useEffect } from "react";
import axios from "axios";
import { animate, stagger } from "animejs";
import "./styles/MarkAttendance.css";

function MarkAttendance() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  // Animate form elements on mount
  useEffect(() => {
    animate(
      ".mark-attendance form label, .mark-attendance form input",
      {
        opacity: [0, 1],
        translateX: [-20, 0],
        easing: "easeOutQuad",
        duration: 600,
        delay: stagger(100)
      }
    );
    animate(
      ".mark-attendance form button",
      {
        scale: [0.8, 1],
        opacity: [0, 1],
        easing: "easeOutBack",
        duration: 800,
        delay: 500
      }
    );
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            const response = await axios.post(
              "https://sdl-back.vercel.app/mark-attendance",
              { name, rollNumber, lat, lon },
              { withCredentials: true }
            );
            alert(response.data);
          } catch (error) {
            alert(
              error.response?.data || "Failed to mark attendance"
            );
          }
        },
        () => {
          alert("Failed to get location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="mark-attendance">
      <h1>Mark Attendance</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label htmlFor="rollNumber">Roll Number:</label>
        <input
          type="text"
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

export default MarkAttendance;