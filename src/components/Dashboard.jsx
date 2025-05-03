import React, { useState, useEffect } from "react";
import axios from "axios";
import { animate, stagger } from "animejs";
import "./styles/Dashboard.css";

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    name: "",
    minlat: "",
    maxlat: "",
    minlon: "",
    maxlon: "",
  });

  // 1) Fetch rooms once on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // 2) Animate whenever the rooms array changes (i.e. after fetch or add)
  useEffect(() => {
    if (rooms.length === 0) return;
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

  const fetchRooms = async () => {
    try {
      const { data } = await axios.get(
        "https://sdl-back.vercel.app/admin/dashboard"
      );
      setRooms(data);
    } catch (err) {
      console.error("Error fetching rooms", err);
    }
  };

  const handleAddRoom = async () => {
    try {
      const { data } = await axios.post(
        "https://sdl-back.vercel.app/admin/dashboard",
        newRoom
      );
      setRooms((prev) => [...prev, data]);
      setNewRoom({ name: "", minlat: "", maxlat: "", minlon: "", maxlon: "" });
      alert("Room added successfully");
    } catch (err) {
      console.error("Error adding room", err);
    }
  };

  const handleRoomSelection = async (roomId) => {
    try {
      await axios.post(
        "https://sdl-back.vercel.app/admin/select-room",
        { roomId }
      );
      fetchRooms();
      alert("Room selected successfully");
    } catch (err) {
      console.error("Error selecting room", err);
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
              {room.name} — Lat: {room.minlat} to {room.maxlat}, Lon:{" "}
              {room.minlon} to {room.maxlon}
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
