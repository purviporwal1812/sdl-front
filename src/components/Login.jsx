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

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = `${window.location.origin}/models`;
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + 'tiny_face_detector/');
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + 'face_landmark_68/');
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + 'face_recognition/');
    };

    loadModels();
  }, []);

  const captureFace = async () => {
    const video = webcamRef.current.video;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      setFaceDescriptor(detection.descriptor);
      console.log("Face descriptor captured:", detection.descriptor);
    } else {
      setError("Face not detected. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://sdl-back.vercel.app/users/login",
        { email, password, face_descriptor: faceDescriptor ? Array.from(faceDescriptor) : null }, // Send face descriptor
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
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="wrapper">
        <div className="logo">
          <img src="/profile.jpg" alt="Logo" />
        </div>
        <div className="name">Login</div>
        {error && <div className="alert alert-danger">{error}</div>}
        
        <Webcam ref={webcamRef} width={320} height={240} />
        <button className="btn" onClick={captureFace}>
          Capture Face
        </button>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <i className="fas fa-user"></i>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit">
            Login
          </button>
          <div className="text-center mt-3">
            <Link to="/users/register">New User?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
