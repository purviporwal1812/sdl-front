import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { animate, stagger } from "animejs";
import {
  UserIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

// Create an axios instance pointing at your backend API
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({
  baseURL: `${BACKEND_URL}/`,
  withCredentials: true,
});

export default function App() {

  const isFirstRender = useRef(true);


 
  // 3) Entry animations
  useEffect(() => {
    animate(
      ".hero-content h1, .hero-content p",
      {
        opacity: [0, 1],
        translateY: [-20, 0],
        easing: "easeOutExpo",
        duration: 1000,
        delay: stagger(200),
      }
    );
    animate(
      ".nav-button",
      {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(150),
        easing: "easeOutExpo",
        duration: 800,
      }
    );
  }, []);

  return (
    <div className="home-container">
      <div className="blob blob--one" />
      <div className="blob blob--two" />

      {/* <button
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <MoonIcon className="icon icon--toggle" />
        ) : (
          <SunIcon className="icon icon--toggle" />
        )}
      </button> */}

      <section className="hero-content">
        <h1>Smart Attendance, Seamless Tracking</h1>
        <p>
          Leverage face recognition and geolocation to automate attendance in
          real time. Secure, accurate records with just a glance—perfect for
          teachers, managers, and event organizers.
        </p>
      </section>

      <div className="links">
        <Link to="/users/login" className="nav-button">
          <UserIcon className="icon icon--nav" />
          <span>User Login</span>
        </Link>
        <Link to="/admin/login" className="nav-button">
          <ShieldCheckIcon className="icon icon--nav" />
          <span>Admin Login</span>
        </Link>
      </div>
    </div>
  );
}
