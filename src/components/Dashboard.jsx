// src/components/Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { animate, stagger } from "animejs";
import { io } from "socket.io-client";
import "./styles/Dashboard.css";

function Dashboard() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // 1) State for rooms & attendances
  const [rooms, setRooms] = useState([]);
  const [attendances, setAttendances] = useState([]);

  // 2) State for the "Add Room" form
  const [newRoom, setNewRoom] = useState({
    name: "",
    minlat: "",
    maxlat: "",
    minlon: "",
    maxlon: "",
  });

  // 3) Keep a stable socket reference
  const socketRef = useRef(null);

  // ─── 1) Fetch rooms on mount & auth‐guard ───
  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/admin/dashboard`, { withCredentials: true })
      .then(({ data }) => {
        console.log("ROOMS (fetched):", data);
        setRooms(data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          navigate("/admin/login");
        } else {
          console.error("Error fetching rooms", err);
        }
      });
  }, [BACKEND_URL, navigate]);

  // ─── 2) Animate whenever rooms change ───
  useEffect(() => {
    if (!rooms.length) return;

    animate(
      ".room-list li",
      {
        opacity: [0, 1],
        translateY: [20, 0],
        easing: "easeOutQuad",
        delay: stagger(100),
        duration: 600,
      }
    );

    animate(
      ".add-room button",
      {
        scale: [1, 1.05, 1],
        easing: "easeInOutSine",
        duration: 2000,
        loop: true,
        delay: 1000,
      }
    );
  }, [rooms]);

  // ─── 3) Setup WebSocket once on mount ───
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 WebSocket connected, id =", socket.id);
    });

    socket.on("newAttendance", (record) => {
      // Just console.log + alert for now:
      console.log("📥 newAttendance payload:", record);
      alert(
        `🟢 New attendance: ${record.name} (${record.rollNumber}) at ${new Date(
          record.createdAt
        ).toLocaleTimeString()}`
      );

      // If you want to keep a running list, you can push into state:
      setAttendances((prev) => [
        {
          id:
            record._id || `${record.rollNumber}-${record.createdAt}-${Math.random()
              .toString(36)
              .slice(2)}`,
          name: record.name,
          rollNumber: record.rollNumber,
          createdAt: record.createdAt,
        },
        ...prev,
      ]);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 WebSocket disconnected:", reason);
    });

    return () => {
      socket.disconnect();
    };
  }, [BACKEND_URL]);

  // ─── 4) Add Room handler ───
  const handleAddRoom = async () => {
    // Basic client validation
    if (
      newRoom.name.trim() === "" ||
      newRoom.minlat.trim() === "" ||
      newRoom.maxlat.trim() === "" ||
      newRoom.minlon.trim() === "" ||
      newRoom.maxlon.trim() === ""
    ) {
      alert("Please fill in all fields before adding a room.");
      return;
    }

    // Build payload using camelCase keys (minLat, maxLat, etc.)
    const payload = {
      name: newRoom.name.trim(),
      minLat: Number(newRoom.minlat),
      maxLat: Number(newRoom.maxlat),
      minLon: Number(newRoom.minlon),
      maxLon: Number(newRoom.maxlon),
    };

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/admin/dashboard`,
        payload,
        { withCredentials: true }
      );
      console.log("Room added (response):", data);
      setRooms((prev) => [...prev, data]);
      setNewRoom({
        name: "",
        minlat: "",
        maxlat: "",
        minlon: "",
        maxlon: "",
      });
      alert("Room added successfully");
    } catch (err) {
      console.error("Error adding room:", err);
      if (err.response) {
        console.error(
          "→ Server response status + data:",
          err.response.status,
          err.response.data
        );
        alert(
          `Failed to add room: ${
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data)
          }`
        );
        if (err.response.status === 401) {
          navigate("/admin/login");
        }
      }
    }
  };

  // ─── 5) Select Room handler ───
  const handleRoomSelection = async (roomId) => {
    console.log("➤ Selecting room with ID:", roomId);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/admin/select-room`,
        { roomId },
        { withCredentials: true }
      );
      console.log("↪ select-room response:", response.status, response.data);

      // Re-fetch rooms to show updated "selected" flags + lat/lon
      const { data } = await axios.get(`${BACKEND_URL}/admin/dashboard`, {
        withCredentials: true,
      });
      console.log("ROOMS (after selection):", data);
      setRooms(data);
      alert("Room selected successfully");
    } catch (err) {
      console.error("Error selecting room:", err);
      if (err.response?.status === 401) {
        navigate("/admin/login");
      } else if (err.response) {
        console.error(
          "→ select-room server said:",
          err.response.status,
          err.response.data
        );
        alert(
          `Failed to select room: ${
            typeof err.response.data === "string"
              ? err.response.data
              : JSON.stringify(err.response.data)
          }`
        );
      }
    }
  };

  // ─── 6) Form input handler ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      {/* === SELECT ROOM === */}
      <h2>Select Room</h2>
      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room._id} className="room-item">
            <span className="room-info">
              <strong>{room.name}</strong> — Lat: {room.minLat} to {room.maxLat} , Lon:{" "}
              {room.minLon} to {room.maxLon}{" "}
              {room.selected && (
                <em style={{ color: "#0f0", marginLeft: "0.5rem" }}>
                  (Currently Selected)
                </em>
              )}
            </span>
            <button
              className="select-room-btn"
              onClick={() => handleRoomSelection(room._id)}
              disabled={room.selected}
              style={{
                marginLeft: "1rem",
                padding: "0.5rem 1rem",
                background: room.selected ? "#444" : "#ffd700",
                border: "none",
                borderRadius: "4px",
                color: "#000",
                cursor: room.selected ? "not-allowed" : "pointer",
              }}
            >
              {room.selected ? "Selected" : "Select"}
            </button>
          </li>
        ))}
      </ul>

      {/* === ADD ROOM === */}
      <h2>Add Room</h2>
      <div className="add-room">
        <input
          type="text"
          name="name"
          placeholder="Room Name"
          value={newRoom.name}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="minlat"
          placeholder="Min Latitude"
          value={newRoom.minlat}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="maxlat"
          placeholder="Max Latitude"
          value={newRoom.maxlat}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="minlon"
          placeholder="Min Longitude"
          value={newRoom.minlon}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="maxlon"
          placeholder="Max Longitude"
          value={newRoom.maxlon}
          onChange={handleInputChange}
        />
        <button onClick={handleAddRoom} style={{ marginTop: "0.5rem" }}>
          Add Room
        </button>
      </div>

      {/* === RECENT ATTENDANCES (optional) === */}
      <h2>Recent Attendances</h2>
      {attendances.length === 0 ? (
        <p>No attendance records yet.</p>
      ) : (
        <ul className="attendance-list">
          {attendances.map((att) => (
            <li key={att.id || att.createdAt} className="attendance-item">
              <span className="attendance-info">
                🟢 {att.name} (Roll: {att.rollNumber}) —{" "}
                {new Date(att.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
