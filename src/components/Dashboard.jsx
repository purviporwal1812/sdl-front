import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { animate, stagger } from "animejs";
import "./styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    name: "",
    minlat: "",
    maxlat: "",
    minlon: "",
    maxlon: "",
  });

  // 1) Auth-guard + initial fetch
  useEffect(() => {
    axios
      .get("https://sdl-back.vercel.app/admin/dashboard", { withCredentials: true })
      .then(({ data }) => {
        setRooms(data);
      })
      .catch((err) => {
        // If unauthorized, redirect to admin login
        if (err.response?.status === 401) {
          navigate("/admin/login");
        } else {
          console.error("Error fetching rooms", err);
        }
      });
  }, [navigate]);

  // 2) Animate whenever rooms change
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

  const handleAddRoom = async () => {
    try {
      const { data } = await axios.post(
        "https://sdl-back.vercel.app/admin/dashboard",
        newRoom,
        { withCredentials: true }
      );
      setRooms((prev) => [...prev, data]);
      setNewRoom({ name: "", minlat: "", maxlat: "", minlon: "", maxlon: "" });
      alert("Room added successfully");
    } catch (err) {
      console.error("Error adding room", err);
      if (err.response?.status === 401) {
        navigate("/admin/login");
      }
    }
  };

  const handleRoomSelection = async (roomId) => {
    try {
      await axios.post(
        "https://sdl-back.vercel.app/admin/select-room",
        { roomId },
        { withCredentials: true }
      );
      // re-fetch after selection
      const { data } = await axios.get(
        "https://sdl-back.vercel.app/admin/dashboard",
        { withCredentials: true }
      );
      setRooms(data);
      alert("Room selected successfully");
    } catch (err) {
      console.error("Error selecting room", err);
      if (err.response?.status === 401) {
        navigate("/admin/login");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <h2>Select Room</h2>
      <ul className="room-list">
        {rooms.map((room) => (
          <li key={room.id}>
            <span>
              {room.name} — Lat: {room.minlat} to {room.maxlat}, Lon: {room.minlon} to {room.maxlon}
            </span>
            <button onClick={() => handleRoomSelection(room.id)}>
              {room.selected ? "Currently Selected" : "Select"}
            </button>
          </li>
        ))}
      </ul>

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
        <button onClick={handleAddRoom}>Add Room</button>
      </div>
    </div>
  );
}

export default Dashboard;
