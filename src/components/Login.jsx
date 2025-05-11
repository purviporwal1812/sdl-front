// src/components/Login.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate }             from 'react-router-dom';
import axios                              from 'axios';
import Webcam                             from 'react-webcam';
import * as faceapi                       from 'face-api.js';
import './styles/Login.css';

export default function Login() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate    = useNavigate();

  // 1) Ensure every axios call includes cookies
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL        = BACKEND_URL;

  const [email,          setEmail]         = useState('');
  const [password,       setPassword]      = useState('');
  const [faceDescriptor, setFaceDescriptor]= useState(null);
  const [error,          setError]         = useState('');
  const [captureMessage, setCaptureMessage]= useState('');
  const [resendSent,     setResendSent]    = useState(false);
  const [modelsLoaded,   setModelsLoaded]  = useState(false);

  const webcamRef = useRef(null);

  // Load face-api models once
  useEffect(() => {
    const MODEL_URL = `${window.location.origin}/models/`;
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + 'tiny_face_detector/'),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + 'face_landmark_68/'),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + 'face_recognition/')
    ])
    .then(() => setModelsLoaded(true))
    .catch(err => console.error("[Login] Model load error:", err));
  }, []);

  // Capture face descriptor from webcam
  const captureFace = async () => {
    setError('');
    setCaptureMessage('');
    if (!modelsLoaded) {
      return setError('Models still loading. Please wait a moment.');
    }
    const video = webcamRef.current?.video;
    if (!video) {
      return setError('Webcam not ready.');
    }
    try {
      const det = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (det) {
        setFaceDescriptor(det.descriptor);
        setCaptureMessage('✅ Face captured successfully!');
      } else {
        setError('No face detected. Try again.');
      }
    } catch (err) {
      console.error("[Login] face-api error:", err);
      setError('Face detection failed.');
    }
  };

  // Submit email+password+descriptor to login
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!faceDescriptor) {
      return setError('Please capture your face before logging in.');
    }

    try {
      await axios.post(
        '/users/login',
        {
          email,
          password,
          face_descriptor: Array.from(faceDescriptor)
        }
      );
      // on success the session cookie is already set; now go mark attendance
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
        setError(msg || 'Login failed. Check credentials.');
      }
    }
  };

  // Resend verification link if they never got it
  const handleResend = async () => {
    try {
      await axios.post('/users/resend-verification', { email });
      setResendSent(true);
    } catch (err) {
      console.error("[Login] resend error:", err);
      setError('Failed to resend. Try again later.');
    }
  };

  return (
    <div className="login-page">
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-text"><h1>Welcome Back!</h1></div>
      </section>

      <section className="form-section">
        {error        && <div className="error-message">{error}</div>}
        {captureMessage && <div className="success-message">{captureMessage}</div>}
        {resendSent   && <div className="info-message">Verification email sent.</div>}

        <Webcam
          ref={webcamRef}
          audio={false}
          className="webcam-feed"
          videoConstraints={{ facingMode: 'user' }}
        />
        <button type="button" className="btn capture-btn" onClick={captureFace}>
          Capture Face
        </button>

        <form onSubmit={handleSubmit} noValidate>
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
