import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import './styles/Login.css';

export default function Login() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [error, setError] = useState('');
  const [resendSent, setResendSent] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // Load models
  useEffect(() => {
    const MODEL_URL = `${window.location.origin}/models/`;
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + 'tiny_face_detector/'),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + 'face_landmark_68/'),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + 'face_recognition/')
    ])
    .then(() => setModelsLoaded(true))
    .catch(console.error);
  }, []);

  const captureFace = async () => {
    setError('');
    if (!modelsLoaded) return setError('Models still loading');
    const video = webcamRef.current.video;
    const det = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (det) setFaceDescriptor(det.descriptor);
    else setError('Face not detected. Try again.');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!faceDescriptor) return setError('Capture your face first.');
    try {
      await axios.post(
        `${BACKEND_URL}/users/login`,
        { email, password, face_descriptor: Array.from(faceDescriptor) },
        { withCredentials: true }
      );
      navigate('/mark-attendance');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'Please verify your email before logging in.') {
        setError(
          <>
            Please verify your email. Didn’t get it?{' '}
            <button onClick={handleResend} className="link-btn">
              Resend link
            </button>
          </>
        );
      } else {
        setError('Login failed. Check credentials.');
      }
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(`${BACKEND_URL}/users/resend-verification`, { email });
      setResendSent(true);
    } catch {
      setError('Failed to resend. Try again later.');
    }
  };

  return (
    <div className="login-page">
      <section className="hero-section">
        <div className="hero-overlay"/>
        <div className="hero-text"><h1>Welcome Back!</h1></div>
      </section>

      <section className="form-section">
        {error && <div className="error-message">{error}</div>}
        {resendSent && <div className="info-message">Verification email sent.</div>}

        <Webcam
          ref={webcamRef}
          audio={false}
          className="webcam-feed"
          videoConstraints={{ facingMode: 'user' }}
        />
        <button type="button" className="btn capture-btn" onClick={captureFace}>
          Capture Face
        </button>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label>Email Address</label>
          </div>

          <div className="form-field">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label>Password</label>
          </div>

          <button type="submit" className="btn">Login</button>

          <div className="links-row">
            <Link to="/users/register">New User?</Link>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </form>
      </section>
    </div>
  );
}
