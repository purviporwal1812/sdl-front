import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import './styles/Register.css';

export default function Register() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const webcamRef = useRef(null);

  // load face-api models once
  useEffect(() => {
    const MODEL_URL = `${window.location.origin}/models/`;
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + 'tiny_face_detector/'),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + 'face_landmark_68/'),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + 'face_recognition/')
    ]).catch(console.error);
  }, []);

  const captureFace = async () => {
    setError('');
    const video = webcamRef.current.video;
    if (!video) return setError('Webcam not ready');
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (detection) {
      setFaceDescriptor(detection.descriptor);
    } else {
      setError('Face not detected. Try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!faceDescriptor) return setError('Please capture your face.');
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/users/register`,
        {
          email,
          password,
          phone_number: phoneNumber,
          face_descriptor: Array.from(faceDescriptor)
        }
      );
      setInfo(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="register-page">
      <div className="hero-section">
        <div className="hero-overlay"/>
        <div className="hero-text">
          <p>Secure your spot—register with a glance.</p>
        </div>
      </div>

      <div className="form-section">
        {error && <div className="error-message">{error}</div>}
        {info && <div className="info-message">{info}</div>}

        <Webcam
          ref={webcamRef}
          audio={false}
          className="webcam-feed"
          videoConstraints={{ facingMode: 'user' }}
        />

        <button onClick={captureFace} className="btn capture-btn">
          Capture Face
        </button>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <input
              id="email"
              type="email"
              value={email}
              placeholder=" "
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label htmlFor="email">Email Address</label>
          </div>

          <div className="form-field">
            <input
              id="phone"
              type="text"
              value={phoneNumber}
              placeholder=" "
              onChange={e => setPhoneNumber(e.target.value)}
              required
            />
            <label htmlFor="phone">Phone Number</label>
          </div>

          <div className="form-field">
            <input
              id="password"
              type="password"
              value={password}
              placeholder=" "
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
          </div>

          <button type="submit" className="btn submit-btn" disabled={!!info}>
            Register
          </button>
        </form>

        <div className="links-row">
          <Link to="/">Back to Home</Link>
          <Link to="/users/login">Already Registered?</Link>
        </div>
      </div>
    </div>
  );
}
