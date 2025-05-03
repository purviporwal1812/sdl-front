import { useState } from "react";
import axios from "axios";
import "./styles/MarkAttendance.css";


function MarkAttendance() {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");

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
              {
                name,
                rollNumber,
                lat,
                lon,
              },
              {
                withCredentials: true,
              }
            );
            alert(response.data);
          } catch (error) {
            if (error.response && error.response.data) {
              alert(error.response.data);
            } else {
              alert("Failed to mark attendance");
            }
          }
        },
        (error) => {
          alert("Failed to get location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div>
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
        <br />
        <br />
        <label htmlFor="rollNumber">Roll Number:</label>
        <input
          type="text"
          id="rollNumber"
          name="rollNumber"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          required
        />
        <br />
        <br />
        <button type="submit">Mark Attendance</button>
      </form>
    </div>
  );
}

export default MarkAttendance;
