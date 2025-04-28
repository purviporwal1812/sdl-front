import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

import "./styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      const MODEL_URL = `${window.location.origin}/models/`;
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + 'tiny_face_detector/');
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + 'face_landmark_68/');
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + 'face_recognition/');
        setModelsLoaded(true);
        console.log("Models loaded successfully");
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };
    loadModel();
  }, []);

  const captureFace = async () => {
    if (!modelsLoaded) {
      setError("Models are still loading. Please wait.");
      return;
    }

    const video = webcamRef.current.video;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setFaceDescriptor(detection.descriptor);
      console.log("Face descriptor captured:", detection.descriptor);
      setError(""); // Clear error if face detected
    } else {
      setError("Face not detected. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!faceDescriptor) {
        setError("Face not captured. Please capture your face before logging in.");
        return;
      }

      const response = await axios.post(
        "https://sdl-back.vercel.app/users/login",
        { email, password, face_descriptor: Array.from(faceDescriptor) },
        { withCredentials: true }
      );

      if (response.status === 200) {
        navigate("/mark-attendance");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-page">
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-text">
          <h1>Welcome Back!</h1>
        </div>
      </section>

      <section className="form-section">
        {error && <div className="error-message">{error}</div>}

        <Webcam ref={webcamRef} className="webcam-feed" />
        <button type="button" className="btn capture-btn" onClick={captureFace}>
          Capture Face
        </button>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email Address</label>
          </div>

          <div className="form-field">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
          </div>

          <button type="submit" className="btn">
            Login
          </button>

          <div className="links-row">
            <Link to="/users/register">New User?</Link>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Login;
