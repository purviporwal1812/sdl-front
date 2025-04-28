import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import './styles/Register.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadModel = async () => {
      const MODEL_URL = `${window.location.origin}/models/`;
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL + 'tiny_face_detector/');
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL + 'face_landmark_68/');
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL + 'face_recognition/');
      } catch (error) {
        console.error('Error loading model:', error);
      }
    };
    loadModel();
  }, []);

  const captureFace = async () => {
    const video = webcamRef.current.video;
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (detection) {
      setFaceDescriptor(detection.descriptor);
      console.log('Face descriptor captured:', detection.descriptor);
    } else {
      setError('Face not detected. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faceDescriptor) {
      setError('Please capture your face before registering.');
      return;
    }

    try {
      const response = await axios.post('https://sdl-back.vercel.app/users/register', {
        email,
        password,
        phone_number: phoneNumber,
        face_descriptor: Array.from(faceDescriptor),
      });

      if (response.status === 201) {
        alert('User registered successfully.');
        navigate('/mark-attendance');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('User already exists.');
    }
  };

  return (
      <div className="register-page">
        <div className="hero-section">
          <div className="hero-overlay" />
          <div className="hero-text">
            <p>Secure your spot—register with a glance.</p>
          </div>
        </div>

        <div className="form-section">
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-feed" />
          <button onClick={captureFace} className="btn capture-btn">Capture Face</button>

          <form onSubmit={handleSubmit} noValidate>
            {error && <p className="error">{error}</p>}

            {/** Floating-label fields **/}
            <div className="form-field">
              <input id="email" type="email" value={email} required 
                     onChange={e => setEmail(e.target.value)} placeholder=" " />
              <label htmlFor="email">Email Address</label>
            </div>

            <div className="form-field">
              <input id="phone" type="text" value={phoneNumber} required 
                     onChange={e => setPhoneNumber(e.target.value)} placeholder=" " />
              <label htmlFor="phone">Phone Number</label>
            </div>

            <div className="form-field">
              <input id="password" type="password" value={password} required 
                     onChange={e => setPassword(e.target.value)} placeholder=" " />
              <label htmlFor="password">Password</label>
            </div>

            <button type="submit" className="btn submit-btn">Register</button>
          </form>

          <div className="links-row">
            <Link to="/">Back to Home</Link>
            <Link to="/users/login">Already Registered?</Link>
          </div>
        </div>
      </div>
  );
};

export default Register;
