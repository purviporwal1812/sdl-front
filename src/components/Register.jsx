import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam'; // Import Webcam
import * as faceapi from 'face-api.js'; // Import face-api.js
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
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      console.log('Models loaded successfully');
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
        face_descriptor: Array.from(faceDescriptor), // Convert to array
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
    <div className="wrapper">
      <div className="logo">
        <img src="/profile.jpg" alt="Logo" />
      </div>
      <div className="name">Register</div>
      
      {/* Webcam for face capture */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
      />
      <button onClick={captureFace} className="btn">Capture Face</button>
      
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        
        <div className="form-field">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-field">
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        
        <div className="form-field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn">Register</button>
      </form>
      
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/users/login">Already Registered?</Link>
      </div>
    </div>
  );
};

export default Register;
