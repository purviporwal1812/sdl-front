import { useState, useEffect } from "react";
import axios from "axios";

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({
    name: "",
    minlat: "",
    maxlat: "",
    minlon: "",
    maxlon: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("https://sdl-back.vercel.app/admin/dashboard");
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms", error);
    }
  };

  const handleAddRoom = async () => {
    try {
      const response = await axios.post("https://sdl-back.vercel.app/admin/dashboard", newRoom);
      setRooms([...rooms, response.data]); 
      setNewRoom({
        name: "",
        minlat: "",
        maxlat: "",
        minlon: "",
        maxlon: "",
      }); 
      alert("Room added successfully");
    } catch (error) {
      console.error("Error adding room", error);
    }
  };

  const handleRoomSelection = async (roomId) => {
    try {
      await axios.post("https://sdl-back.vercel.app/admin/select-room", { roomId });
      fetchRooms(); 
      alert("Room selected successfully");
    } catch (error) {
      console.error("Error selecting room", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom({ ...newRoom, [name]: value });
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Select Room</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            {room.name} - Lat: {room.minlat} to {room.maxlat}, Lon: {room.minlon} to {room.maxlon}
            <button onClick={() => handleRoomSelection(room.id)}>
              {room.selected ? "Currently Selected" : "Select"}
            </button>
          </li>
        ))}
      </ul>

      <h2>Add Room</h2>
      <div>
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
