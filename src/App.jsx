import React from "react";
import { Link } from "react-router-dom";
import "./App.css"; 
function App() {
  return <>
  <div className="home-container">
      <h1>HOME</h1>
      <Link to="/users/login">User LOGIN</Link>
      <Link to="/admin/login">Admin Login</Link>
    </div>
    </>
}

export default App;
