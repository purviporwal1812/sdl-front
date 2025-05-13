// src/components/Login.js
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate }                 from 'react-router-dom';
import axios                                  from 'axios';
import Webcam                                 from 'react-webcam';
import * as faceapi                           from 'face-api.js';
import './styles/Login.css';

export default function Login() {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate    = useNavigate();

  console.log('[Login] ▶ Initializing component, backend =', BACKEND_URL);
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL        = BACKEND_URL;

  const [email,          setEmail]           = useState('');
  const [password,       setPassword]        = useState('');
  const [faceDescriptor, setFaceDescriptor]  = useState(null);
  const [error,          setError]           = useState('');
  const [captureMessage, setCaptureMessage]  = useState('');
  const [resendSent,     setResendSent]      = useState(false);
  const [modelsLoaded,   setModelsLoaded]    = useState(false);

  const webcamRef = useRef(null);

  // Load face-api models
  useEffect(() => {
    console.log('[Login] ▶ Loading face-api models from', `${window.location.origin}/models/`);
    const MODEL_URL = `${window.location.origin}/models/`;
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + 'tiny_face_detector/'),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + 'face_landmark_68/'),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + 'face_recognition/')
    ])
      .then(() => {
        console.log('[Login] ✔ face-api models loaded');
        setModelsLoaded(true);
      })
      .catch(err => {
        console.error('[Login] ✖ face-api model load error:', err);
      });
  }, []);

  // Capture face descriptor
  const captureFace = async () => {
    console.log('[Login] ▶ captureFace() called');
    setError('');
    setCaptureMessage('');

    if (!modelsLoaded) {
      console.warn('[Login] ⚠ Models not yet loaded');
      return setError('Face detection models are still loading.');
    }

    const video = webcamRef.current?.video;
    if (!video) {
      console.warn('[Login] ⚠ Webcam video element not ready');
      return setError('Webcam not ready.');
    }

    try {
      console.log('[Login] ▶ Running faceapi.detectSingleFace');
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        console.log('[Login] ✔ Face detected, descriptor length =', detection.descriptor.length);
        setFaceDescriptor(detection.descriptor);
        setCaptureMessage('✅ Face captured successfully!');
      } else {
        console.warn('[Login] ✖ No face detected in frame');
        setError('No face detected. Please try again.');
      }
    } catch (err) {
      console.error('[Login] ✖ Error during face detection:', err);
      setError('Face detection failed. Try again.');
    }
  };

  // Submit login request
  const handleSubmit = async e => {
    e.preventDefault();
    console.log('[Login] ▶ handleSubmit() called with', { email, password, faceDescriptorExists: !!faceDescriptor });
    setError('');
    setCaptureMessage('');
    setResendSent(false);

    if (!faceDescriptor) {
      console.warn('[Login] ⚠ No face descriptor captured');
      return setError('Please capture your face before logging in.');
    }

    const payload = {
      email,
      password,
      face_descriptor: Array.from(faceDescriptor)
    };
    console.log('[Login] ▶ Sending login POST /users/login with payload:', payload);

    try {
      const response = await axios.post('/users/login', payload);
      console.log('[Login] ✔ Login successful response:', response.data);
      navigate('/mark-attendance');
    } catch (err) {
      console.error('[Login] ✖ Login error response:', err.response || err);
      const msg = err.response?.data?.message;
      if (msg === 'Please verify your email first.') {
        console.warn('[Login] ⚠ User needs email verification');
        setError(
          <>
            Please verify your email. Didn’t get it?{' '}
            <button type="button" className="link-btn" onClick={handleResend}>
              Resend link
            </button>
          </>
        );
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    }
  };

  // Resend verification link
  const handleResend = async () => {
    console.log('[Login] ▶ handleResend() called for email:', email);
    setError('');
    setResendSent(false);

    try {
      const resp = await axios.post('/users/resend-verification', { email });
      console.log('[Login] ✔ Resend verification response:', resp.data);
      setResendSent(true);
    } catch (err) {
      console.error('[Login] ✖ Resend verification error:', err.response || err);
      setError('Failed to resend verification link.');
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

        <button
          type="button"
          className="btn capture-btn"
          onClick={captureFace}
        >
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
