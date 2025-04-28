import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { animate, stagger } from "animejs";
import { UserIcon, ShieldCheckIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function App() {
  const [theme, setTheme] = useState("light");

  // Whenever theme changes, replace the class on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(theme === "light" ? "dark" : "light");
    root.classList.add(theme);
  }, [theme]);

  // Entry animations
  useEffect(() => {
    animate(
      ".hero-content h1, .hero-content p",
      { opacity: [0, 1], translateY: [-20, 0], easing: "easeOutExpo", duration: 1000, delay: stagger(200) }
    );
    animate(
      ".nav-button",
      { opacity: [0, 1], translateY: [20, 0], delay: stagger(150), easing: "easeOutExpo", duration: 800 }
    );
  }, []);

  return (
    <div className="home-container">
      <div className="blob blob--one" />
      <div className="blob blob--two" />

      <button
        className="theme-toggle"
        onClick={() => setTheme(t => (t === "light" ? "dark" : "light"))}
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <MoonIcon className="icon icon--toggle" />
        ) : (
          <SunIcon className="icon icon--toggle" />
        )}
      </button>

      <section className="hero-content">
        <h1>Smart Attendance, Seamless Tracking</h1>
        <p>
          Leverage face recognition and geolocation to automate attendance in real time. Secure, accurate
          records with just a glance—perfect for teachers, managers, and event organizers.
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
